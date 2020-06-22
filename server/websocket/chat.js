const {Player} = require("../models");

module.exports = (server) => {

server.on("connect", (socket) => {
	/* EVENT: chat
	 * @param gameID  the room to which you want to send a message. Should
	 *                be the unique string identifying this game. You must
	 *                be part of the game.
	 * @param message  (string) the message you're sending
	 * @broadcast     CHAT: type="msg", message=message, sender=player_id
	 */
	socket.on("chat", (gameID, message) => {
		console.log(`Incoming chat message: gameID=${gameID} message="${message}" socket_id=${socket.id}`);
		Player.findOne({where: {
			socket_id: socket.id,
			GameId: gameID
		}})
		//if this player exists
		.then(player => {
			if(player == null) throw new Error("You're not in this game");
			player.chat(server, message);
		})
		//if this person is not in the game
		.catch(err => {
			console.error("Failed to send chat", err.message);
		});
	});
});
	
}