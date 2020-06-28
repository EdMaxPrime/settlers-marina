/**
 * Shorthand function to authorize players. Returns true if the socket
 * represents a player in this game, false otherwise.
 * @param session {Object}  the websocket session you are authenticating
 * @param gameID {string}  can be used to further check if the player
 *                         has permission to participate in the game
 */
function isAuthorized(session, gameID) {
	return session.game == gameID;
}

/**
 * Completes the login process by setting the player's status to JOINED.
 * Can be called many times with the same effect. The session cookie must
 * have been set already, and part 1 of login must have been completed.
 * @param socket {SocketIO.Client}  the connection being authenticated
 * @throws   if part 1 wasn't completed
 * @return {Player}  the player instance
 */
async function login(session) {
	const player = await getPlayer(session);
	session.game = player.GameId;
	return player.update({
		status: "JOINED"
	});
}

/**
 * Destroys the session/player identifier and soft deletes the player from the
 * database. The session cookie is not deleted. Should only be called once.
 * @param session {Object}  the Socket.IO session pertaining to the socket that
 *                          was previously part of a game and is now leaving.
 */
async function logout(session) {
	console.log("[LOGOUT] logging player out");
	try {
		const player = await getPlayer(session);
		await player.disconnect();
		delete session.game;
		console.log("[LOGOUT] logged player out");
		return true;
	} catch(err) {
		console.log("[LOGOUT] Error logging player out: ", err);
		return false;
	}
}

/**
 * Given a socket connection that was registered to a game (part 1 of auth),
 * this will retrieve the Player model associated with it. This will fail if
 * no session was created, no session cookie, or you have since been deleted.
 * @return {Promise<Player>}  a promise resolving to a player (not null)
 * @throws                    promise rejects if player doesn't exist.
 */
function getPlayer(session) {
	const {Player, Game} = require("../models");
	console.log("authorizing ", session);
	return Player.findOne({where: {socket_id: session.id}, include: [Game]})
	             .then(user => {
	             	if(!user) throw new Error("You're not part of a game");
	             	return user;
	             });
}

module.exports.isAuthorized = isAuthorized;
module.exports.login = login;
module.exports.logout = logout;
module.exports.getPlayer = getPlayer;