const http = require("http");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const io = require("socket.io");

//this is the application/server object
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
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
const eventsRouter = require("./websocket");
eventsRouter(game);

/* Socketio middleware */
app.use((req, res, next) => {
	req.settlers = {ns: game, id: "/settlers#" + req.cookies.io};
	next();
});

//Mount our API routes
const apiRouter = require("./routes");
app.use("/api", apiRouter);

app.get("/", (req, res) => {
	console.log("GET /");
	res.send("Hello World\n");
});

/*
 * ERROR HANDLING
 */
app.use((req, res, next) => {
	//maybe they tried to access a file that doesn't exist (files have extensions)
	if(path.extname(req.path).length) {
		const err = new Error("File Not Found");
		err.status = 404;
		next(err);
	} else {
		next();
	}
});
app.use((err, req, res, next) => {
	console.log("Caught error");
	console.error(err);
	rest.status(err.status || 500).send(err.message || "Internal server error.");
});
/* ERROR HANDLING */

//export the app so it can be used in the www file
module.exports = server;