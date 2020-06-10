const http = require("http");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const io = require("socket.io");

//this is the application/server object
const app = express();
const server = http.createServer(app);
var socketio = io(server);
const game = socketio.of("/settlers");

//configure the express app
//app.use(cors({origin: "http://localhost:3000", credentials: true}));

//socketio.set("origins", "http://localhost:3000");

//this is the socket-io namespace we will be listening on
game.on("connect", function(socket) {
	console.log("Socket " + socket.id + " connected to /settlers");
	socket.on("request_join", (joinCode, callback) => {
		console.log(socket.id + " wants to join " + joinCode);
		callback(true, 1);
	});
	socket.on("disconnect", () => {
		console.log(socket.id + " disconnecting");
	});
});

app.get("/", (req, res) => {
	console.log("GET /");
	res.send("Hello World\n");
});

//export the app so it can be used in the www file
module.exports = server;