module.exports = (server) => {
	server.on("connect", (socket) => {
		socket.on("player_join", (gameId, response) => {
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
						response(true);
						//announce the arrival of this player
						server.to(`${gameId} players`).emit("chat", {
							type: "CHAT_INFO",
							payload: {message: player.nickname + " joined"}
						});
					}
				});
			})
			//if this person is registered for the game
			.catch(err => {
				//send error acknowledgement
				response(false);
			})
		});
	});
}