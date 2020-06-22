function broadcastChat(emmiter, gameID, message, sender) {
	emmiter.to(`${gameID} players`).emit("chat", "msg", message, sender);
}

function broadcastInfo(emmiter, gameID, message) {
	emmiter.to(`${gameID} players`).emit("chat", "info", message);
}

function announcement(emmiter, gameID, message) {
	emmiter.to(`${gameID} players`).emit("announcement", message);
}

module.exports = {
	chat: broadcastChat,
	info: broadcastInfo,
	announcement: announcement
};