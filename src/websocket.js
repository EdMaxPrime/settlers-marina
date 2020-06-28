import io from "socket.io-client";

const endpoint = "http://192.168.1.28:3001";

var socket = io(endpoint + "/settlers", {
	autoConnect: false,
    rejectUnauthorized: false
});

socket.on("connection", () => {
    console.log("connected to server");
});
socket.on("connect_error", (error) => {
    console.log("Error connecting to socket");
    console.log(error);
});
socket.on("error", (error) => {
	console.log("Socket.io error: ", error);
});
socket.on("reconnect_error", (error) => {
    console.log("Reconnection error");
    console.log(error);
});
socket.on("reconnect_attempt", (attempt) => {
    console.log("Attempt " + attempt);
});
socket.on("disconnect", () => {
    console.log("disconnecting with socket.id=" + socket.id);
});

export function connect() {
	socket.open();
}

export function disconnect() {
	socket.disconnect();
}

export default socket;