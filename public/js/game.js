const socket = io();

// Buttons that need to be done on load time
const createRoom = document.getElementById("btnCreate");
const joinRoom = document.getElementById("btnJoin");

// Which View of the board
const lobbyView = document.getElementById("lobbyView");
const boardView = document.getElementById("boardView");

var room = "lobby";

socket.on("connect", () => {
    console.log("connected to server");

    //Joins the lobby on start
    socket.emit("joinLobby", "lobby", room);
});
socket.on("connect_error", () => {
    console.log("Error connecting to server");
});
socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

// ── Room Code Generation ──────────────────────────────
function generateRoomCode() {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O (confusing)
    const digits = "0123456789";

    let letters4 = "";
    let nums4 = "";

    for (let i = 0; i < 4; i++) {
        letters4 += letters[Math.floor(Math.random() * letters.length)];
        nums4 += digits[Math.floor(Math.random() * digits.length)];
    }

    return `${letters4}·${nums4}`;
}

// ── Copy button ───────────────────────────────────────
document.querySelector(".copy-btn").addEventListener("click", () => {
    const code = getRoomCode(); // or use roomCodeEl.textContent for the dotted version
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector(".copy-btn");
        const original = btn.textContent;
        btn.textContent = "✓";
        btn.style.opacity = "1";
        setTimeout(() => {
            btn.textContent = original;
        }, 1500);
    });
});

// Creating a room
if (createRoom) {
    createRoom.addEventListener("click", () => {
        console.log("Click");
        const sessionName = document.getElementById("sessionName").value.trim();
        const password = document.getElementById("password").value.trim();
        const username = document.getElementById("playerName").value.trim();

        if (!sessionName || !username) {
            alert("Session name must be filled");
            return;
        }
        socket.emit("createSession", {
            sessionName,
            password,
        });
    });
}

// The status of the created session
socket.on("CreationStatus", (data) => {
    showBoard();
    room = data.sessionName;
});

// Joining a room
if (joinRoom) {
    joinRoom.addEventListener("click", () => {
        console.log("Click Join button");
        const username = document.getElementById("join_name").value.trim();
        const password = document.getElementById("join_password").value.trim();

        if (!username || !password) {
            alert("Both Fields must be filled");
        }
        socket.emit("joinSession", {
            username,
            password,
        });
    });
}

// Status of Joining a session
socket.on("joinSuccess", (data) => {
    room = data.sessionName;
    showBoard();
});

function showBoard() {
    lobbyView.classList.add("hidden");
    boardView.classList.remove("hidden");
}
function showLobby() {
    boardView.classList.add("hidden");
    lobbyView.classList.remove("hidden");
}

// Important messages
socket.on("message", (msg) => {
    //Change this at some point
    alert(msg);
});
