const {Game, Player} = require("../models");
const auth = require("./authorize");

module.exports = (server, allSessions) => {

server.on("connect", (socket) => {
	let session = allSessions.get(socket);
	console.log("[SOCKET.IO] incoming connection %s (games.js:7)", socket.id);
	/**
	 * EVENT: player_join
	 * This is the second step to joining a game. You should have already
	 * POST /api/games/<id>/join before this. If you were registered
	 * in the database as JOINING, then this event will finish adding
	 * you to appropriate chatrooms. If you are reconnecting and
	 * issue this event twice in the same game, nothing bad will happen.
	 * If you were not registered for the game, you will get a negative
	 * response.
	 * @request
	 *   - token: the unique identifier for your session cookie
	 *   - response: a callback function, see below
	 * @response
	 *   - joined: true if you are subscribed to updates for the game,
	 *             false if you couldn't be added to the game.
	 */
	socket.on("request_join", (token, response) => {
		console.log("games.js:24 Player=", Player);
		console.log("Player Join event socket="+socket.id);
		//find in Players table
		auth.login(session)
		//if this player was registered for this game
		.then(player => {
			//if this player was not registered for this game, stop
			if(player == null) throw new Error("Player Not Found");
			//represents the rooms this player is elligible to join
			let rooms = [`${player.GameId} players`];
			//if this player is a host, add them to the special room for hosts
			if(player.host == true)
				rooms.push(`${player.GameId} hosts`);
			//actually add player to rooms, asynchronous
			socket.join(rooms, (err) => {
				if(err) {
					console.log("[EVENTS/request_join] Error joining room", err);
					response(false, "Unable to add you to chat room");
					return;
				}
				//send successful acknowledgment
		      	response(true, player.player_id);
				//announce the arrival of this player
				player.info("$NAME joined");
				//repeat the announcement
				player.announcement("Waiting for host to start game. Invite others with: $GAME");
			});
			//tell everyone about the new player
			console.log("[EVENT/request_join] telling everyone on " + rooms[0]);
			socket.to(rooms[0]).emit("player_join", player.toJSON());
		})
		//if this person is registered for the game
		.catch(err => {
			//send error acknowledgement
			console.log("[EVENTS/request_join] Socket couldn't be added to game (games.js:56)", err);
			response(false, "Please reload the page and try again");
		})
	});
	/* EVENT: disconnect
	 * This is fired when a socket disconnects from the server
	 */
	socket.on("disconnect", async () => {
		try {
			console.log("[DISCONNECT] disconnecting " + socket.id);
			server.to(`${session.game} players`).emit("player_leave", session.player);
			let status = await auth.logout(session);
			// let player = await Player.findOne({where: {
			// 	socket_id: socket.id
			// }});
			// if(player != null) {
			// 	console.log("PLAYER before delete: ", player);
			// 	let game = await player.getGame();
			// 	player = await player.update({status: Player.STATUS.DISCONNECTED});
			// 	console.log("before decrement: " + game.num_players);
			// 	await game.decrement("num_players");
			// 	console.log("decremented, now reload: " + game.num_players);
			// 	await game.reload();
			// 	console.log("after reload: " + game.num_players);
			// 	//shut down game
			// 	if(game.num_players <= 0) {
			// 		console.log("Shutting game " + game.id + " down");
			// 		await game.destroy();
			// 	}
			// }
		} 
		catch(err) {
			console.log("[EVENTS/DISCONNECT] Failed to delete player " + socket.id + " " + err.message);
		}
	});
});

}