const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set static folder
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Player Connected:", socket.id);

    // Make players join a lobby room
    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        console.log(socket.id + " joined room: " + roomName);
    });

    // broadcast someone disconnected
    socket.on("disconnect", () => {
        io.emit("message", "A user has left the game");
        console.log("Player disconnect");
    });
    //Random hello message
    socket.on("hello", (msg) => {
        console.log(msg);
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log("Server running on port 3000");
});
