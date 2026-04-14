const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const GameManager = require("./game/gamestate");
const { BoardType, Roles, Phases } = require("./game/constants");
const { start } = require("repl");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = new Map();
let gameStates = new Map();

rooms.set("lobby", {
    password: null,
    players: [],
});

app.use(express.static(path.join(__dirname, "client/dist")));

// ── Deliberation Helpers ─────────────────────────
function startDeliberation(sessionName, game) {
    game.clearSkipVotes();
    const deliberationTime = game.options.deliberationTime;
    console.log(
        "startDeliberation called for:",
        sessionName,
        "timeLimit",
        deliberationTime,
    );

    io.to(sessionName).emit("deliberationPhase", {
        timeLimit: deliberationTime,
        publicState: game.getPublicState(),
    });

    if (deliberationTime > 0) {
        const timer = setTimeout(() => {
            console.log("deliberation timer expired, ending deliberation");
            endDeliberation(sessionName, game);
        }, deliberationTime * 1000);
        game.deliberationTimer = timer;
    }
}

function endDeliberation(sessionName, game) {
    console.log(
        "endDeliberation called, advancing president from:",
        game.getPresident(),
    );
    if (game.deliberationTimer) {
        clearTimeout(game.deliberationTimer);
        game.deliberationTimer = null;
    }
    game.clearSkipVotes();
    game.advancePresident();

    io.to(sessionName).emit("deliberationEnded");

    io.to(sessionName).emit("nominationPhase", {
        publicState: game.getPublicState(),
        eligibleIds: game.getEligibleChancellors(),
    });
}

io.on("connection", (socket) => {
    console.log("Player Connected:", socket.id);

    socket.on("joinLobby", (roomName, prevRoom) => {
        if (prevRoom != "lobby") socket.leave(prevRoom);
        socket.join(roomName);
        console.log(socket.id + " joined room: " + roomName);
    });

    socket.on("disconnect", () => {
        rooms.forEach((room, roomName) => {
            room.players = room.players.filter((p) => p !== socket.id);
            if (
                roomName !== "lobby" &&
                (room.players.length === 0 || room.host === socket.id)
            ) {
                rooms.delete(roomName);
                gameStates.delete(roomName);
                console.log("Room deleted:", roomName);
            }
        });
        console.log("Player Disconnected");
    });

    socket.on("createSession", ({ sessionName, password, playerName }) => {
        if (rooms.has(sessionName)) {
            socket.emit("message", "Room name already exists");
            return;
        }
        rooms.set(sessionName, {
            password: password || null,
            host: socket.id,
            players: [socket.id],
            playerNames: { [socket.id]: playerName },
            maxPlayers: 10,
        });
        socket.leave("lobby");
        socket.join(sessionName);
        socket.emit("CreationStatus", { sessionName });
    });

    socket.on("joinSession", ({ sessionName, password, playerName }) => {
        const room = rooms.get(sessionName);
        if (!room) {
            socket.emit("message", "Room does not exist");
            return;
        }
        if (room.password !== null && room.password !== password) {
            socket.emit("message", "Incorrect Password");
            return;
        }
        if (room.players.length >= room.maxPlayers) {
            socket.emit("message", "Room is full");
            return;
        }
        if (room.players.includes(socket.id)) return;

        socket.join(sessionName);
        room.players.push(socket.id);
        room.playerNames[socket.id] = playerName;
        socket.leave("lobby");
        socket.emit("joinSuccess", { sessionName });
    });

    socket.on("getSessions", () => {
        const list = [];
        rooms.forEach((room, roomName) => {
            if (roomName !== "lobby") {
                list.push({
                    name: roomName,
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
            return;
        }

        try {
            const count = room.players.length;
            let boardType;
            if (count <= 6) boardType = BoardType.FIVE;
            else if (count <= 8) boardType = BoardType.SEVEN;
            else boardType = BoardType.NINE;

            const playerData = room.players.map((id) => ({
                id,
                name: room.playerNames[id] || id,
            }));

            const game = new GameManager(playerData, boardType);
            game.startGame();
            gameStates.set(sessionName, game);

            const roles = game.getRoles();

            room.players.forEach((playerId) => {
                const role = roles[playerId];
                let knownFascists = null;
                let hitlerId = null;
                let knownFascistIds = null;
                let hitlerSocketId = null;

                if (role === Roles.FASCIST) {
                    const hitlerSockId = Object.keys(roles).find(
                        (id) => roles[id] === Roles.HITLER,
                    );
                    hitlerId = room.playerNames[hitlerSockId] || hitlerSockId;
                    knownFascists = Object.keys(roles)
                        .filter(
                            (id) =>
                                roles[id] === Roles.FASCIST && id !== playerId,
                        )
                        .map((id) => room.playerNames[id] || id);
                    hitlerSocketId = hitlerSockId;
                    knownFascistIds = Object.keys(roles).filter(
                        (id) => roles[id] === Roles.FASCIST && id !== playerId,
                    );
                }

                if (role === Roles.HITLER && room.players.length <= 6) {
                    knownFascists = Object.keys(roles)
                        .filter((id) => roles[id] === Roles.FASCIST)
                        .map((id) => room.playerNames[id] || id);
                    knownFascistIds = Object.keys(roles).filter(
                        (id) => roles[id] === Roles.FASCIST,
                    );
                }

                io.to(playerId).emit("roleAssigned", {
                    role,
                    knownFascists,
                    hitlerId,
                    knownFascistIds,
                    hitlerSocketId,
                });
            });

            io.to(sessionName).emit("gameStarted", {
                players: playerData,
                publicState: game.getPublicState(),
            });

            io.to(sessionName).emit("nominationPhase", {
                publicState: game.getPublicState(),
                eligibleIds: game.getEligibleChancellors(),
            });
            console.log(
                "nominationPhase emitted from startGame, president:",
                game.getPresident(),
            );
        } catch (err) {
            console.error("startGame error:", err);
            socket.emit("message", "Failed to start game: " + err.message);
        }
    });

    // ── Chancellor Nomination ────────────────────────
    socket.on("nominateChancellor", ({ sessionName, chancellorId }) => {
        const game = gameStates.get(sessionName);
        const room = rooms.get(sessionName);
        if (!game || !room) return;

        if (game.getPresident() !== socket.id) {
            socket.emit(
                "message",
                "Only the President can nominate a Chancellor",
            );
            return;
        }

        const success = game.nominateChancellor(chancellorId);
        if (!success) {
            socket.emit(
                "message",
                "That player is not eligible to be Chancellor",
            );
            return;
        }

        io.to(sessionName).emit("chancellorNominated", {
            publicState: game.getPublicState(),
        });
    });

    // ── Voting ───────────────────────────────────────
    socket.on("castVote", ({ sessionName, vote }) => {
        const game = gameStates.get(sessionName);
        const room = rooms.get(sessionName);
        if (!game || !room) return;

        if (game.phase !== Phases.VOTING) {
            socket.emit("message", "Not currently in voting phase");
            return;
        }

        game.recordVote(socket.id, vote);
        io.to(sessionName).emit("playerVoted", { playerId: socket.id });

        if (game.allVotesIn()) {
            const { passed, ja, nein } = game.tallyVotes();

            const voteMap = {};
            room.players.forEach((id) => {
                voteMap[id] = game.votes.get(id) ?? null;
            });

            io.to(sessionName).emit("voteResult", {
                passed,
                ja,
                nein,
                votes: voteMap,
                publicState: game.getPublicState(),
            });

            if (passed) {
                setTimeout(() => {
                    const { cards, reshuffled } = game.drawCards();
                    game.drawnCards = cards;

                    io.to(game.getPresident()).emit("legislativeSession", {
                        cards,
                        reshuffled,
                        publicState: game.getPublicState(),
                    });

                    io.to(sessionName).emit("legislativeStarted", {
                        reshuffled,
                        publicState: game.getPublicState(),
                    });
                }, 3000);
            } else {
                if (game.electionTracker >= 4) {
                    const reshuffled = game.reshuffleIfNeeded();
                    const chaosCard = game.policyDeck.splice(0, 0);

                    if (chaosCard === "liberal") {
                        game.liberalPolicies++;
                    } else {
                        game.fascistPolicies++;
                    }

                    game.electionTracker = 1;

                    const winner = game.checkBoard();

                    setTimeout(() => {
                        if (winner) {
                            io.to(sessionName).emit("gameOver", {
                                winner,
                                roles: game.getRoles(),
                                publicState: game.getPublicState(),
                            });
                            return;
                        }

                        io.to(sessionName).emit("policyEnacted", {
                            policy: chaosCard,
                            chaos: true,
                            publicState: game.getPublicState(),
                        });

                        setTimeout(() => {
                            startDeliberation(sessionName, game);
                        }, 3000);
                    }, 3000);
                }
                setTimeout(() => {
                    startDeliberation(sessionName, game);
                }, 3000);
            }
        }
    });

    // ── President Discards ───────────────────────────
    socket.on("presidentDiscard", ({ sessionName, cardIndex }) => {
        const game = gameStates.get(sessionName);
        if (!game) return;

        if (game.getPresident() !== socket.id) {
            socket.emit("message", "Only the President can discard");
            return;
        }

        if (!game.drawnCards || game.drawnCards.length !== 3) {
            socket.emit("message", "No cards to discard");
            return;
        }

        const remaining = game.presidentDiscard(cardIndex, game.drawnCards);
        game.drawnCards = null;
        game.chancellorCards = remaining;

        io.to(game.chancellorId).emit("chancellorCards", {
            cards: remaining,
            publicState: game.getPublicState(),
        });

        io.to(sessionName).emit("presidentDiscarded", {
            publicState: game.getPublicState(),
        });
    });

    // ── Chancellor Enacts ────────────────────────────
    socket.on("chancellorEnact", ({ sessionName, cardIndex }) => {
        const game = gameStates.get(sessionName);
        const room = rooms.get(sessionName);
        if (!game || !room) return;

        if (game.chancellorId !== socket.id) {
            socket.emit("message", "Only the Chancellor can enact a policy");
            return;
        }

        if (!game.chancellorCards || game.chancellorCards.length !== 2) {
            socket.emit("message", "No cards to enact");
            return;
        }

        const enacted = game.chancellorEnact(cardIndex, game.chancellorCards);
        game.chancellorCards = null;

        const winner = game.checkBoard();
        if (winner) {
            io.to(sessionName).emit("gameOver", {
                winner,
                roles: game.getRoles(),
                publicState: game.getPublicState(),
            });
            return;
        }

        setTimeout(() => {
            startDeliberation(sessionName, game);
        }, 3000);
    });

    // ── Skip Vote ────────────────────────────────────
    socket.on("skipVote", ({ sessionName }) => {
        const game = gameStates.get(sessionName);
        if (!game) return;

        const recorded = game.recordSkipVote(socket.id);
        if (!recorded) return;

        const skipCount = game.getSkipVoteCount();
        const aliveCount = game.getAlivePlayerCount();

        io.to(sessionName).emit("skipVoteUpdate", {
            skipCount,
            aliveCount,
            voterId: socket.id,
        });

        if (game.skipMajorityReached()) {
            const deliberationTime = game.options.deliberationTime;

            if (deliberationTime === 0) {
                io.to(sessionName).emit("skipCountdown", { seconds: 10 });
                setTimeout(() => endDeliberation(sessionName, game), 10000);
            } else {
                endDeliberation(sessionName, game);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server running on port 3000");
});
