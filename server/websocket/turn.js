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
	/**
	 * EVENT: build
	 * This event should be fired on your turn. This is a request to build
	 * something on the map.
	 * @request
	 *   - who: your player_id
	 *   - what: "Stlm", "City", "Road", "Ship"
	 *   - where: intersection or edge, the site where this will be built
	 * @response  true if this is a legal move, false if illegal
	 * @broadcast  original event IF it was a legal move
	 */
	socket.on("build", async (data, response) => {
		console.log("[EVENT/build] %j", data);
		try{
			const player = await auth.myTurn(session);
			if(data.what == "Stlm") {
				let connected = player.Game.phase.indexOf("SETUP") == -1;
				await player.buildStlm(data.where, connected, !connected);
				socket.to(`${player.GameId} players`).emit("build", data); //alert everyone
				response(true);
				return;
			}
			response(false);
		} catch(err) {
			console.log("Caught error building ", err);
			response(false);
		}
	});
});

}