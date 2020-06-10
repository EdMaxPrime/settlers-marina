function registerEvents(socket) {
	socket.on("request_join", function(joinCode) {
		//check if game exists and is joinable
		//if it exists, increment player count, add player to database
		
	});
}

module.exports = registerEvents;