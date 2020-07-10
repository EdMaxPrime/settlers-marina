const http = require("http");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const io = require("socket.io");
const db = require("./models");

/***** CONFIGURE EXPRESS APP *****/
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
//configure the express app
//app.use(cors({origin: "http://localhost:3000", credentials: true}));
//socketio.set("origins", "http://localhost:3000");


/***** DECLARE STATIC ROUTES HERE *****/

/***** EXPRESS SESSION MIDDLEWARE FOR API *****/
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const httpSession    = session({
	secret: process.env.NODE_APP_SETTLERS_SECRET,
	store: new SequelizeStore({
		db: db.sequelize,
		table: 'Session'
	}),
	resave: false,
	saveUninitialized: false
})
app.use(httpSession);

/***** CONFIGURE SOCKETIO EVENTS/ROUTES *****/
const server = require("./websocket").setup(app, httpSession);

/***** MOUNT API ROUTES *****/
const apiRouter = require("./routes");
app.use("/api", apiRouter);

/***** ERROR HANDLING *****/
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
	console.log("[app.js:54] Caught general route error");
	console.error(err);
	res.status(err.status || 500).send(err.message || "Internal server error.");
});

//export the app so it can be used in the www file
module.exports = server;