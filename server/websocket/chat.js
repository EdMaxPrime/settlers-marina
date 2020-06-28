const auth = require("./authorize");

module.exports = (server, allSessions) => {

server.on("connect", (socket) => {
	let session = allSessions.get(socket);
	/* EVENT: chat
	 * @param gameID  the room to which you want to send a message. Should
	 *                be the unique string identifying this game. You must
	 *                be part of the game.
	 * @param message  (string) the message you're sending
	 * @broadcast     CHAT: type="msg", message=message, sender=player_id
	 */
	socket.on("chat", (gameID, message) => {
		console.log(`[EVENTS/chat] gameID=${gameID} message="${message}" socket_id=${socket.id}`);
		auth.getPlayer(session)
		//if this player exists
		.then(player => {
			player.chat(message);
		})
		//if this person is not in the game
		.catch(err => {
			console.error("[EVENTS/chat] Failed to send chat", err.message);
		});
	});
});
	
}