const socket = io();

// Buttons that need to be done on load time
const createRoom = document.getElementById("btnCreate");

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

// ── Set code on page load ─────────────────────────────
const roomCodeEl = document.getElementById("room-code");
roomCodeEl.textContent = generateRoomCode();

// ── Extract the raw password (letters+numbers, no dot) ─
// Call getRoomCode() anywhere in your server.js to read it
function getRoomCode() {
    return roomCodeEl.textContent.replace("·", "");
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

if (createRoom) {
    createRoom.addEventListener("click", () => {
        console.log("Click");
        const sessionName = document.getElementById("sessionName").value.trim();
        const userName = document.getElementById("playerName").value.trim();
        const password = getRoomCode();

        if (!sessionName || !userName) {
            alert("All fields must be filled out.");
            return;
        }
        socket.emit("createSession", {
            sessionName,
            userName,
            password,
        });
    });
}

// The status of the created session
socket.on("CreationStatus", (msg) => {
    if (msg == "200") {
        window.location.href = `/board.html?room=${sessionName}`;
    }
});

// Important messages
socket.on("message", (msg) => {
    //Change this at some point
    alert(msg);
});
