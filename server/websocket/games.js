const {Game, Player} = require("../models");

module.exports = (server) => {

server.on("connect", (socket) => {
	socket.on("player_join", (gameId, playerID, response) => {
		console.log("Player Join event gameId="+gameId+" playerID="+playerID);
		//find in Players table
		Player.findOne({where: {
			socket_id: socket.id,
			GameId: gameId
		}})
		//if this player was registered for this game
		.then(player => {
			if(player == null) throw new Error("Player Not Found");
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