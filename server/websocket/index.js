/*
 * This file will connect all websocket events to a socketio server instance.
 * Every file in this directory defines a function that registers listeners
 * on a namespace. This index.js file imports the event files, and provides
 * them with the namespace supplied by the main app. This effectively registers
 * all events.
*/

//import all files here
const gameEvents = require("./games");

//the main app file just has to call this function with the socketio namespace
module.exports = (ns) => {
	//call each file's exported function with the provided namespace
	gameEvents(ns);
}