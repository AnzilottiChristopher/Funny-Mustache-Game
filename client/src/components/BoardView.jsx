import { useState, useEffect } from "react";
import socket from "../socket";
import RoleCard from "./RoleCard";
import PlayerRow from "./PlayerRow";

export default function BoardView({
    room,
    isHost,
    playerCount,
    role,
    knownFascists,
    hitlerId,
    players,
    myId,
    presidentId,
    onRoleAssigned,
    onGameStarted,
}) {
    const [showRole, setShowRole] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [chancellorId, setChancellorId] = useState(null);

    useEffect(() => {
        socket.on("roleAssigned", (data) => {
            onRoleAssigned(data);
            setShowRole(true);
        });

        socket.on("gameStarted", (data) => {
            console.log("gameStarted received:", data);
            onGameStarted(data);
            setGameStarted(true);
        });

        return () => {
            socket.off("roleAssigned");
            socket.off("gameStarted");
        };
    }, []);

    function handleStartGame() {
        socket.emit("startGame", { sessionName: room });
    }

    return (
        <div id="boardView">
            <div className="noise"></div>

            {/* ── ROLE CARD OVERLAY ── */}
            {showRole && role && (
                <RoleCard
                    role={role}
                    knownFascists={knownFascists}
                    hitlerId={hitlerId}
                    onDismiss={() => setShowRole(false)}
                />
            )}

            {/* ── START GAME BUTTON (host only, before game starts) ── */}
            {isHost && !gameStarted && (
                <div className="start-game-wrap">
                    <button
                        className="btn btn-create start-game-btn"
                        onClick={handleStartGame}
                    >
                        Begin the Assembly
                    </button>
                </div>
            )}

            {/* ── PLAYER ROW ── */}
            {gameStarted && players.length > 0 && (
                <PlayerRow
                    players={players}
                    presidentId={presidentId}
                    chancellorId={chancellorId}
                    myId={myId}
                />
            )}

            <div className="page">
                {/* ── LIBERAL BOARD ── */}
                <div className="board liberal-board">
                    <div className="board-edge top-edge lib-edge"></div>

                    <div className="side-label left-label lib-side">
                        <span>D R A W &nbsp; P I L E</span>
                        <div className="side-icon">
                            <div className="mini-card mc3"></div>
                            <div className="mini-card mc2"></div>
                            <div className="mini-card mc1"></div>
                        </div>
                    </div>

                    <div className="side-label right-label lib-side">
                        <span>D I S C A R D &nbsp; P I L E</span>
                        <div className="side-icon discard-icon-wrap">
                            <div className="mini-card mc1 discarded"></div>
                        </div>
                    </div>

                    <div className="board-inner">
                        <div className="title-bar lib-title-bar">
                            <div className="title-ornament lib-orn">
                                <div className="leaf-row">❧❧❧❧❧❧❧❧❧❧</div>
                            </div>
                            <h2 className="board-name lib-name">
                                L I B E R A L
                            </h2>
                            <div className="title-ornament lib-orn">
                                <div className="leaf-row">❧❧❧❧❧❧❧❧❧❧</div>
                            </div>
                        </div>

                        <div className="track-area">
                            <div className="track-slots">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <div
                                        className="slot lib-slot"
                                        data-n={n}
                                        key={n}
                                    >
                                        <div className="slot-circle lib-circle"></div>
                                        {n < 5 && (
                                            <div className="slot-divider lib-divider-line"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="board-motif lib-motif">
                                <svg
                                    viewBox="0 0 120 100"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="dove-svg"
                                >
                                    <ellipse
                                        cx="60"
                                        cy="52"
                                        rx="28"
                                        ry="16"
                                        fill="rgba(100,180,210,0.3)"
                                    />
                                    <path
                                        d="M32 52 Q20 38 38 30 Q50 24 60 36 Q68 28 82 32 Q95 36 88 50 Q80 60 68 56 Q60 52 52 56 Q44 62 32 52Z"
                                        fill="rgba(100,180,210,0.4)"
                                        stroke="rgba(100,180,210,0.6)"
                                        strokeWidth="1"
                                    />
                                    <path
                                        d="M60 36 Q72 20 90 28 Q78 38 68 40Z"
                                        fill="rgba(100,180,210,0.35)"
                                        stroke="rgba(100,180,210,0.55)"
                                        strokeWidth="0.8"
                                    />
                                    <path
                                        d="M60 36 Q48 20 30 28 Q42 38 52 40Z"
                                        fill="rgba(100,180,210,0.35)"
                                        stroke="rgba(100,180,210,0.55)"
                                        strokeWidth="0.8"
                                    />
                                    <path
                                        d="M60 52 Q58 62 54 68 Q60 70 66 68 Q62 62 60 52Z"
                                        fill="rgba(100,180,210,0.3)"
                                        stroke="rgba(100,180,210,0.5)"
                                        strokeWidth="0.8"
                                    />
                                    <path
                                        d="M20 78 Q30 68 40 72 Q35 80 25 82Z"
                                        fill="rgba(100,180,210,0.3)"
                                        stroke="rgba(100,180,210,0.5)"
                                        strokeWidth="0.8"
                                    />
                                    <path
                                        d="M25 82 Q35 72 45 76 Q40 84 30 86Z"
                                        fill="rgba(100,180,210,0.3)"
                                        stroke="rgba(100,180,210,0.5)"
                                        strokeWidth="0.8"
                                    />
                                    <path
                                        d="M100 78 Q90 68 80 72 Q85 80 95 82Z"
                                        fill="rgba(100,180,210,0.3)"
                                        stroke="rgba(100,180,210,0.5)"
                                        strokeWidth="0.8"
                                    />
                                    <path
                                        d="M95 82 Q85 72 75 76 Q80 84 90 86Z"
                                        fill="rgba(100,180,210,0.3)"
                                        stroke="rgba(100,180,210,0.5)"
                                        strokeWidth="0.8"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="election-tracker">
                            <div className="tracker-label">
                                Election
                                <br />
                                Tracker
                            </div>
                            <div className="tracker-pip active"></div>
                            <div className="tracker-arrow">FAIL →</div>
                            <div className="tracker-pip"></div>
                            <div className="tracker-arrow">FAIL →</div>
                            <div className="tracker-pip"></div>
                            <div className="tracker-arrow">FAIL →</div>
                            <div className="tracker-pip"></div>
                            <div className="tracker-endlabel">
                                Reveal &amp; Pass
                                <br />
                                Top Policy
                            </div>
                        </div>
                    </div>

                    <div className="board-edge bottom-edge lib-edge"></div>
                </div>

                {/* ── FASCIST BOARD ── */}
                <div className="board fascist-board">
                    <div className="board-edge top-edge fas-edge"></div>

                    <div className="board-inner">
                        <div className="chain-row">
                            ⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓
                        </div>

                        <div className="title-bar fas-title-bar">
                            <div className="title-ornament fas-orn">
                                ————————
                            </div>
                            <h2 className="board-name fas-name">
                                F A S C I S T
                            </h2>
                            <div className="title-ornament fas-orn">
                                ————————
                            </div>
                        </div>

                        <div className="fas-track-area">
                            <div className="track-slots fas-track-slots">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <div
                                        className={`slot fas-slot ${n === 3 ? "peek-slot" : ""} ${n >= 4 ? "kill-slot" : ""}`}
                                        data-n={n}
                                        key={n}
                                    >
                                        <div className="slot-circle fas-circle"></div>
                                        <div className="slot-divider fas-divider-line"></div>
                                    </div>
                                ))}
                                <div
                                    className="slot fas-slot win-slot"
                                    data-n="6"
                                >
                                    <div className="slot-circle fas-circle fas-win-circle"></div>
                                </div>
                            </div>

                            <div className="power-descs">
                                <div
                                    className="power-desc"
                                    style={{ gridColumn: "1/3" }}
                                ></div>
                                <div className="power-desc peek-desc">
                                    <div className="power-icon">📋</div>
                                    <p>
                                        The President examines the top three
                                        cards.
                                    </p>
                                </div>
                                <div className="power-desc kill-desc">
                                    <div className="power-icon">🗡</div>
                                    <p>The President must kill a player.</p>
                                </div>
                                <div className="power-desc kill-desc">
                                    <div className="power-icon">🗡</div>
                                    <p>
                                        The President must kill a player. Veto
                                        power is unlocked.
                                    </p>
                                </div>
                                <div className="power-desc skull-desc">
                                    <div className="skull-svg">☠</div>
                                    <p>
                                        Fascists
                                        <br />
                                        win.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="win-banner">
                            FASCISTS WIN IF HITLER IS ELECTED CHANCELLOR
                        </div>

                        <div className="chain-row">
                            ⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓⛓
                        </div>

                        <div className="player-footer">
                            5 OR 6 PLAYERS: PLAY WITH 1 FASCIST AND HITLER.
                            HITLER KNOWS WHO THE FASCIST IS.
                        </div>
                    </div>

                    <div className="board-edge bottom-edge fas-edge"></div>
                </div>
            </div>

            <footer className="page-footer">
                <div className="footer-ornament">✦</div>
                <p>
                    <em>
                        "The fascists know who they are. The liberals do not."
                    </em>
                </p>
            </footer>
        </div>
    );
}
