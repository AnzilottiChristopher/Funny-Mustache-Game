const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = new Map();
rooms.set("lobby", {
    password: null,
    players: [],
});

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
        //Handle removing players
        rooms.forEach((room) => {
            room.players = room.players.filter(
                (player) => player !== socket.id,
            );
        });
        console.log("Player Disconnected");
    });

    // Creating a session
    socket.on("createSession", ({ sessionName, password }) => {
        if (rooms.has(sessionName)) {
            socket.emit("message", "Room name already exists");
            return;
        }

        //Potentially add password length requirements

        rooms.set(sessionName, {
            password,
            host: socket.id,
            players: [],
            maxPlayers: 10,
        });
        socket.leave("lobby");
        socket.join(sessionName);

        socket.emit("CreationStatus", {
            sessionName,
        });
    });

    // Joining a session
    socket.on("joinSession", ({ sessionName, password }) => {
        const room = rooms.get(sessionName);

        if (!room) {
            socket.emit("message", "Room does not exist");
            return;
        }
        if (room.password !== password) {
            socket.emit("message", "Incorrect Password");
            return;
        }
        if (room.players.length >= room.maxPlayers) {
            socket.emit("message", "Room is full");
            return;
        }
        if (room.players.includes(socket.id)) {
            return;
        }

        socket.join(sessionName);
        room.players.push(socket.id);
        socket.leave("lobby");

        socket.emit("joinSuccess", {
            sessionName,
        });
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port 3000");
});
