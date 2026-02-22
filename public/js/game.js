const socket = io();
const message_sender = document.getElementById("form");

socket.on("connect", () => {
    console.log("connected to server");
    socket.emit("joinRoom", "lobby");
});

socket.on("message", (message) => {
    console.log(message);
});

message_sender.addEventListener("click", () => {
    socket.emit("hello", "world");
});
