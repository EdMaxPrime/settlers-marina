/*
 * This file will connect all websocket events to a socketio server instance.
 * Every file in this directory defines a function that registers listeners
 * on a namespace. This index.js file imports the event files, and provides
 * them with the namespace supplied by the main app. This effectively registers
 * all events.
*/
const http = require("http");
const io   = require("socket.io");

//namespace should be a module-level object
var game;

//import all files here
const gameEvents = require("./games");
const chatEvents = require("./chat");



/**
 * This function should only be called once when the server boots up. It will
 * return an http server instance which should be activated after all other
 * middleware is setup. Don't do expressApp.listen(), instead use the server
 * created by this function.
 * @param app {Express}  an express app, doesn't have to have any middleware
 * @param session {ExpressSession}  session middleware configured to work
 *                                  with Express. It will be shared with
 *                                  socket.io events
 * @return {HttpServer}  a Node http server with websocket support
 */
function setup(app, session) {
	//move all socketio logic from app.js here
	const server = http.createServer(app);
	var socketio = io(server);
	game = socketio.of("/settlers");
	//this is to share the session data between http and websocket connections
	const sharedSession = require("express-socket.io-session");
	game.use(sharedSession(session));
	//this is my session
	const socketIOLocals = new WeakMap();
	game.use((socket, next) => {
		const locals = {id: socket.id};
		socketIOLocals.set(socket, locals);
		//delete session after we're done with it
		socket.on("disconnect", function() {
			socketIOLocals.delete(socket);
		});
		next();
	});
	//register events from files in this directory
	gameEvents(game, socketIOLocals);
	chatEvents(game, socketIOLocals);
	//return HTTP server
	return server;
}

/**
 * @param gameID {string}  the unique identifier for the game
 * @param message {string} what everyone will see in their chat
 * @param sender {int}     the playerID who sent the message
 */
function chat(gameID, message, sender) {
	game.to(`${gameID} players`).emit("chat", "msg", message, sender);
}

function info(gameID, message) {
	game.to(`${gameID} players`).emit("chat", "info", message);
}

function announcement(gameID, message) {
	game.to(`${gameID} players`).emit("announcement", message);
}

//exported functions
module.exports.setup = setup;
module.exports.chat  = chat;
module.exports.info  = info;
module.exports.announcement = announcement;