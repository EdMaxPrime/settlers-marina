const {Game, Player} = require("../models");

module.exports = (server) => {

server.on("connect", (socket) => {
	/**
	 * EVENT: player_join
	 * This is the second step to joining a game. You should have already
	 * PUT /api/games/<id>/join before this. If you were registered
	 * in the database as JOINING, then this event will finish adding
	 * you to appropriate chatrooms. If you are reconnecting and
	 * issue this event twice in the same game, nothing bad will happen.
	 * If you were not registered for the game, you will get a negative
	 * response.
	 * @request
	 *   - gameID: the unique identifier for the game you want to join
	 *   - playerID: the playerID you were assigned by HTTP request
	 *   - response: a callback function, see below
	 * @response
	 *   - joined: true if you are subscribed to updates for the game,
	 *             false if you couldn't be added to the game.
	 */
	socket.on("player_join", (gameId, playerID, response) => {
		console.log("Player Join event gameId="+gameId+" playerID="+playerID);
		//find in Players table
		Player.findOne({where: {
			socket_id: socket.id,
			GameId: gameId
		}})
		//if this player was registered for this game
		.then(player => {
			//if this player was not registered for this game, stop
			if(player == null) throw new Error("Player Not Found");
			//if this player is just reconnecting, stop
			if(player.status == Player.STATUS.JOINED) {
				reponse(true);
				return;
			}
			//otherwise, finish adding the player to the game
			//represents the rooms this player is elligible to join
			let rooms = [`${gameId} players`];
			//if this player is a host, add them to the special room for hosts
			if(player.host == true)
				rooms.push(`${gameId} hosts`);
			//actually add player to rooms, asynchronous
			socket.join(rooms, (err) => {
				if(err) {
					console.log("Error joining room", err);
					response(false);
				} else {
					//mark them as completely connected
					player.update("status", Player.STATUS.JOINED)
					      .catch(err => console.log("Couldn't update player=JOINED"));
					//send successful acknowledgment
					response(true, player.player_id);
					//announce the arrival of this player
					player.info(server, "$NAME joined");
					//repeat the announcement
					player.announcement(server,
						"Waiting for host to start game. Invite others with: "+gameId);
				}
			});
		})
		//if this person is registered for the game
		.catch(err => {
			//send error acknowledgement
			response(false);
		})
	});
	/* EVENT: disconnect
	 * This is fired when a socket disconnects from the server
	 */
	socket.on("disconnect", async () => {
		try {
			console.log("[DISCONNECTED] " + socket.id);
			let player = Player.findOne({where: {
				socket_id: socket.id
			}});
			if(player != null) {
				let game = await player.getGame();
				player = await player.update("status", Player.STATUS.DISCONNECTED);
				console.log("before decrement" + game.num_players);
				await game.decrement("num_players");
				await game.reload();
				console.log("after decrement" + game.num_players);
				//shut down game
				if(game.num_players <= 0) {
					console.log("Shutting game " + game.id + " down");
					await game.destroy();
				}
			}
		} 
		catch(err) {
			console.log("Failed to delete player " + socket.id);
		}
	});
});

}