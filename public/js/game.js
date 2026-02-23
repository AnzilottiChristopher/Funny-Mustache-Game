const socket = io();

// Buttons that need to be done on load time
const createRoom = document.getElementById("btnCreate");
const joinRoom = document.getElementById("btnJoin");

// Which View of the board
const lobbyView = document.getElementById("lobbyView");
const boardView = document.getElementById("boardView");

// Session List
let selectedSession = null;
const sessionList = document.getElementById("sessionList");
const sessionCount = document.getElementById("session-count");
const pwOverlay = document.getElementById("pwModalOverlay");
const pwSessionName = document.getElementById("pwSessionName");
const btnRefresh = document.getElementById("btnRefresh");
const btnCancelJoin = document.getElementById("btnCancelJoin");

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
        } else {
            socket.emit("joinSession", {
                sessionName: selectedSession,
                password,
            });
        }
    });
}

// Request List of open sessions
function fetchSessions() {
    const btn = document.getElementById("btnRefresh");
    if (btn) {
        btn.classList.add("spinning");
        setTimeout(() => btn.classList.remove("spinning"), 500);
    }
    socket.emit("getSessions");
}

// Render Session Rows from server response
socket.on("sessionList", (sessions) => {
    sessionList.innerHTML = "";

    if (!sessions || sessions.length === 0) {
        sessionList.innerHTML = `<div class="session-empty">No sessions found.<br/><em>Be the first to convene.</em></div>`;
        sessionCount.textContent = "No open sessions";
        return;
    }

    sessionCount.textContent = `${sessions.length} session${sessions.length !== 1 ? "s" : ""} open`;

    sessions.forEach(({ name, players, maxPlayers }) => {
        const row = document.createElement("div");
        row.className = "session-row";
        row.innerHTML = `
            <span class="session-row-name">${name}</span>
            <span class="session-row-meta">${players}/${maxPlayers}</span>
            <span class="session-row-enter">›</span>
        `;
        row.addEventListener("click", () => openPasswordModal(name));
        sessionList.appendChild(row);
    });
});

// Open the password modal for a chosen session
function openPasswordModal(name) {
    selectedSession = name;
    pwSessionName.textContent = name;
    document.getElementById("join_password").value = "";
    pwOverlay.classList.add("open");
    document.getElementById("join_password").focus();
}

// Close modal
function closePasswordModal() {
    pwOverlay.classList.remove("open");
    selectedSession = null;
}

if (btnRefresh) btnRefresh.addEventListener("click", fetchSessions);
if (btnCancelJoin) btnCancelJoin.addEventListener("click", closePasswordModal);

// Close an overlay click
if (pwOverlay) {
    pwOverlay.addEventListener("click", (e) => {
        if (e.target === pwOverlay) closePasswordModal();
    });
}

// fetch on load
fetchSessions();

// Status of Joining a session
socket.on("joinSuccess", (data) => {
    closePasswordModal();
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
