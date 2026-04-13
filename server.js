const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { assignRoles } = require("./game/roles");
const { createGameState } = require("./game/gameState");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = new Map();
let gameStates = new Map();

rooms.set("lobby", {
    password: null,
    players: [],
});

// Set static folder
app.use(express.static(path.join(__dirname, "client/dist")));

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
    socket.on("createSession", ({ sessionName, password, playerName }) => {
        if (rooms.has(sessionName)) {
            socket.emit("message", "Room name already exists");
            return;
        }

        //Potentially add password length requirements

        rooms.set(sessionName, {
            password,
            host: socket.id,
            players: [socket.id],
            playerNames: { [socket.id]: playerName },
            maxPlayers: 10,
        });
        socket.leave("lobby");
        socket.join(sessionName);

        socket.emit("CreationStatus", {
            sessionName,
        });
    });

    // Joining a session
    socket.on("joinSession", ({ sessionName, password, playerName }) => {
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
        room.playerNames[socket.id] = playerName;
        socket.leave("lobby");

        socket.emit("joinSuccess", {
            sessionName,
        });
    });

    // Fetching Session List
    socket.on("getSessions", () => {
        const list = [];
        rooms.forEach((room, name) => {
            if (name !== "lobby") {
                list.push({
                    name,
                    players: room.players.length,
                    maxPlayers: room.maxPlayers,
                });
            }
        });
        socket.emit("sessionList", list);
    });

    socket.on("startGame", ({ sessionName }) => {
        const room = rooms.get(sessionName);

        if (!room) {
            socket.emit("message", "Room not found");
            return;
        }
        if (room.host !== socket.id) {
            socket.emit("message", "Only the host can start the game");
            return;
        }
        if (room.players.length < 5) {
            socket.emit(
                "message",
                `Need at least 5 players to start. Currently have ${room.players.length}.`,
            );
            return; // ← this return was missing
        }

        try {
            const players = room.players.map((id) => ({
                id,
                name: room.playerNames[id] || id,
            }));
            const roles = assignRoles(room.players);
            const state = createGameState(room.players);
            state.roles = roles;
            state.president = room.players[0];
            state.phase = "nomination";
            gameStates.set(sessionName, state);

            room.players.forEach((playerId) => {
                const role = roles[playerId];
                let knownFascists = null;
                let hitlerId = null;

                if (role === "fascist") {
                    const hitlerSocketId = Object.keys(roles).find(
                        (id) => roles[id] === "hitler",
                    );
                    hitlerId =
                        room.playerNames[hitlerSocketId] || hitlerSocketId;
                    knownFascists = Object.keys(roles)
                        .filter((id) => roles[id] === "fascist")
                        .map((id) => room.playerNames[id] || id);
                }

                if (role === "hitler" && room.players.length <= 6) {
                    knownFascists = Object.keys(roles)
                        .filter((id) => roles[id] === "fascist")
                        .map((id) => room.playerNames[id] || id);
                }

                io.to(playerId).emit("roleAssigned", {
                    role,
                    knownFascists,
                    hitlerId,
                });
            });

            io.to(sessionName).emit("gameStarted", {
                president: state.president,
                players,
            });
            console.log(
                "gameStarted emitted to room:",
                sessionName,
                "players:",
                players,
            );
        } catch (err) {
            console.error("startGame error:", err);
            socket.emit("message", "Failed to start game: " + err.message);
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port 3000");
});
