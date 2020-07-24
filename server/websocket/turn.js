const auth = require("./authorize");

module.exports = function(server, allSessions) {

server.on("connect", socket => {
	let session = allSessions.get(socket);
	/**
	 * EVENT: next_turn
	 * This event should be fired by the player who's turn it is. Nothing will
	 * happen if anyone else does it. The game will advance to the next state,
	 * which will modify the turn and maybe the phase. An announcement is made.
	 * @broadcast  next_turn
	 *  - phase: the game's new phase (could be the same)
	 *  - turn: if you order players by turn order, this will determine whose
	 *    turn it is now. This could be the same as before.
	 */
	socket.on("next_turn", async () => {
		console.log("[EVENT/next] received request to go to next turn");
		try {
			let [player, game] = await auth.getPlayerGame(session);
			//check to see if the event emitter is the person whose turn it is
			let currentPlayer = await game.getCurrentPlayer();
			if(currentPlayer.player_id != player.player_id) {
				console.log("[EVENT/next_turn] Not your turn! Can't do next turn"); return;}
			console.log("[EVENT/next] Before phase="+game.phase+" turn="+game.turn_now);
			await game.nextTurn();
			console.log("[EVENT/next] After phase="+game.phase+" turn="+game.turn_now);
			currentPlayer = await game.getCurrentPlayer();
			currentPlayer.announcement("It is $NAME's turn");
			server.to(`${game.id} players`).emit("next_turn", game.phase, game.turn_now);
		}
		catch(err) {
			console.log("[EVENT/next] error doing next turn ", err);
		}
	});
	/**
	 * EVENT: skip_turn
	 * This event should be fired by a host. Nothing will happen if a non-host
	 * player does it. The game will advance to the next state, which will
	 * modify the turn and maybe the phase. An announcement is made.
	 * @broadcast next_turn
	 */
	socket.on("skip_turn", async () => {
		console.log("[EVENT/skip] received request to skip current turn");
		try {
			let [player, game] = await auth.getPlayerGame(session);
			//check to see if the event emitter is a host
			if(player.host) {
				game.announcement("Skipping to next player");
				await game.nextTurn();
				server.to(`${game.id} players`).emit("next_turn", game.phase, game.turn_now);
			}
		}
		catch(err) {
			console.log("[EVENT/skip] error skipping turn ", err);
		}
	})
	socket.on("build", async (data, response) => {
		console.log("[EVENT/build] %j", data);
		try{
			const player = await auth.myTurn(session);
			let s = player.Game.structures;
			let {phase} = player.Game;
			let canBuild = false;
			/* To build a settlement, you must meet all the criteria:
			- during setup:
			   - intersection doesn't exist or no building there
			- during normal:
			   - intersection exists
			   - no other building there
			   - you must have a road leading here */
			if(data.what == "Stlm") {
				if(phase == "SETUP1" || phase == "SETUP2") {
					canBuild = !(data.where in s) || (s[data.where].building == null);
				} else {
					canBuild = (data.where in s) && (s[data.where].building == null) && (s[data.where].roads.some(r => r[0] == player.player_id));
				}
				if(canBuild) {
					s[data.where] = s[data.where] || {building: null, roads: []};
					s[data.where].building = [player.player_id, "Stlm"];
				}
			}
			if(canBuild) {
				await player.updateGame({structures: s});
				socket.to(`${player.GameId} players`).emit("build", data); //alert everyone
			}
			response(canBuild);
		} catch(err) {
			console.log("Caught error building ", err);
			response(false);
		}
	});
});

}