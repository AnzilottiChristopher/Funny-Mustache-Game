import { useState, useEffect } from "react";
import SessionList from "./SessionList";
import PasswordModal from "./PasswordModal";
import socket from "../socket";

export default function LobbyView({ onEnterBoard }) {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionName, setSessionName] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [playerName, setPlayerName] = useState("");

    function fetchSessions() {
        socket.emit("getSessions");
    }

    useEffect(() => {
        socket.emit("joinLobby", "lobby", "lobby");
        socket.on("sessionList", setSessions);

        socket.on("CreationStatus", (data) => {
            onEnterBoard({
                roomName: data.sessionName,
                isHost: true,
                myId: socket.id,
            });
        });

        socket.on("joinSuccess", (data) => {
            setSelectedSession(null);
            onEnterBoard({
                roomName: data.sessionName,
                isHost: false,
                myId: socket.id,
            });
        });

        socket.on("message", (msg) => alert(msg));
        fetchSessions();

        return () => {
            socket.off("sessionList");
            socket.off("CreationStatus");
            socket.off("joinSuccess");
            socket.off("message");
        };
    }, []);

    function handleCreate() {
        if (!sessionName || !playerName) {
            alert("Session name and your name must be filled");
            return;
        }
        socket.emit("createSession", {
            sessionName,
            password: createPassword,
            playerName,
        });
    }

    function handleCopy() {
        navigator.clipboard.writeText(createPassword).then(() => {
            const btn = document.querySelector(".copy-btn");
            const original = btn.textContent;
            btn.textContent = "✓";
            btn.style.opacity = "1";
            setTimeout(() => (btn.textContent = original), 1500);
        });
    }

    function handleJoin(password, name) {
        socket.emit("joinSession", {
            sessionName: selectedSession,
            password,
            playerName: name,
        });
    }

    return (
        <>
            <div id="lobbyView">
                <div className="noise"></div>

                <div className="wrapper">
                    <header className="header">
                        <div className="crown">✦ ✦ ✦</div>
                        <h1>The Assembly</h1>
                        <div className="rule-line">
                            <span>⸻</span>
                            <em>A Game of Trust &amp; Deception</em>
                            <span>⸻</span>
                        </div>
                    </header>

                    <div className="cards">
                        {/* ── CREATE CARD ── */}
                        <div className="card create">
                            <div className="card-corner tl"></div>
                            <div className="card-corner tr"></div>
                            <div className="card-corner bl"></div>
                            <div className="card-corner br"></div>

                            <div className="card-header">
                                <div className="emblem">⚑</div>
                                <h2>Convene a Session</h2>
                                <p className="card-sub">
                                    Summon the players and preside as host.
                                </p>
                            </div>

                            <div className="fields">
                                <div className="field">
                                    <label>Your Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your alias…"
                                        value={playerName}
                                        onChange={(e) =>
                                            setPlayerName(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="field">
                                    <label>Session Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. The Weimar Circle"
                                        value={sessionName}
                                        onChange={(e) =>
                                            setSessionName(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="code-reveal">
                                    <label>
                                        Your Room Code — Share with Allies
                                    </label>
                                    <div className="code-box">
                                        <input
                                            type="text"
                                            placeholder="Enter Your Password Here"
                                            value={createPassword}
                                            onChange={(e) =>
                                                setCreatePassword(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            className="copy-btn"
                                            title="Copy to clipboard"
                                            onClick={handleCopy}
                                        >
                                            ⧉
                                        </button>
                                    </div>
                                    <p className="code-hint">
                                        Give this to your fellow players so they
                                        may enter.
                                    </p>
                                </div>
                            </div>

                            <button
                                className="btn btn-create"
                                onClick={handleCreate}
                            >
                                Convene the Session
                            </button>
                        </div>

                        {/* ── DIVIDER ── */}
                        <div className="divider">
                            <div className="divider-line"></div>
                            <div className="divider-seal">☩</div>
                            <div className="divider-line"></div>
                        </div>

                        {/* ── JOIN CARD ── */}
                        <div className="card join">
                            <div className="card-corner tl"></div>
                            <div className="card-corner tr"></div>
                            <div className="card-corner bl"></div>
                            <div className="card-corner br"></div>

                            <div className="card-header">
                                <div className="emblem red">☭</div>
                                <h2>Enter a Session</h2>
                                <p className="card-sub">
                                    Present your papers and take your seat.
                                </p>
                            </div>

                            <div className="fields">
                                <SessionList
                                    sessions={sessions}
                                    onSelect={setSelectedSession}
                                    onRefresh={fetchSessions}
                                />
                            </div>
                        </div>
                    </div>

                    <footer className="footer">
                        <div className="footer-rule">✦</div>
                        <p>
                            <em>
                                "The fascists know who they are. The liberals do
                                not."
                            </em>
                        </p>
                    </footer>
                </div>
            </div>

            {selectedSession && (
                <PasswordModal
                    sessionName={selectedSession}
                    onCancel={() => setSelectedSession(null)}
                    onJoin={handleJoin}
                />
            )}
        </>
    );
}
