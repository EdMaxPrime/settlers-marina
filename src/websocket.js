import io from "socket.io-client";

var socket = io("http://localhost:3001/settlers", {
    rejectUnauthorized: false
});

socket.on("connection", () => {
    console.log("connected to server");
});
socket.on("connect_error", (error) => {
    console.log("Error connecting to socket");
    console.log(error);
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

export function disconnect() {
	socket.disconnect();
}

export default socket;