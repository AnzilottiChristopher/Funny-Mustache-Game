const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = new Map();
rooms.set("lobby", "none");

// Set static folder
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Player Connected:", socket.id);

    // Make players join a lobby room
    socket.on("joinLobby", (roomName, prevRoom) => {
        if (prevRoom != "lobby") {
            socket.leave(prevRoom);
        }
        socket.join(roomName);
        console.log(socket.id + " joined room: " + roomName);
    });

    // broadcast someone disconnected
    socket.on("disconnect", () => {
        io.emit("message", "A user has left the game");
        console.log("Player disconnect");
    });

    // Creating a session
    socket.on("createSession", ({ sessionName, userName, password }) => {
        if (rooms.has(sessionName)) {
            socket.emit("message", "Room name already exists");
            return;
        }
        rooms.set(sessionName, password);
        socket.leave("lobby");
        socket.join(sessionName);

        socket.emit("CreationStatus", "200", sessionName);
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log("Server running on port 3000");
});
