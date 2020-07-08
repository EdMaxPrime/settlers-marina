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
			if(currentPlayer.player_id != player.player_id) return;
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
});

}