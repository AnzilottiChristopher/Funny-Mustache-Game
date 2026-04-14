import { useState, useEffect } from "react";
import socket from "../socket";
import RoleCard from "./RoleCard";
import PlayerRow from "./PlayerRow";
import NominationOverlay from "./NominationOverlay";
import VotingOverlay from "./VotingOverlay";
import LegislativeOverlay from "./LegislativeOverlay";
import RoleBadge from "./RoleBadge";
import DeliberationOverlay from "./DeliberationOverlay";

export default function BoardView({
    room,
    isHost,
    role,
    knownFascists,
    hitlerId,
    knownFascistIds,
    hitlerSocketId,
    players,
    myId,
    publicState,
    onRoleAssigned,
    onGameStarted,
    onPublicStateUpdate,
}) {
    const [showRole, setShowRole] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [votedPlayers, setVotedPlayers] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [voteResult, setVoteResult] = useState(null);
    const [revealedVotes, setRevealedVotes] = useState(null);
    const [eligibleChancellors, setEligibleChancellors] = useState([]);
    const [legislativeCards, setLegislativeCards] = useState(null);
    const [awaitingChancellor, setAwaitingChancellor] = useState(false);
    const [chancellorCards, setChancellorCards] = useState(null);
    const [policyResult, setPolicyResult] = useState(null);
    const [reshuffled, setReshuffled] = useState(false);
    const [deliberating, setDeliberating] = useState(false);
    const [deliberationTimeLimit, setDeliberationTimeLimit] = useState(0);
    const [skipCount, setSkipCount] = useState(0);
    const [hasSkipped, setHasSkipped] = useState(false);
    const [skipCountdown, setSkipCountdown] = useState(null);
    const [overlaysHidden, setOverlaysHidden] = useState(false);

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

        socket.on("chancellorNominated", ({ publicState }) => {
            onPublicStateUpdate(publicState);
            setVotedPlayers([]);
            setHasVoted(false);
            setVoteResult(null);
        });

        socket.on("playerVoted", ({ playerId }) => {
            setVotedPlayers((prev) => [...prev, playerId]);
            if (playerId === myId) setHasVoted(true);
        });

        socket.on("voteResult", ({ passed, ja, nein, votes, publicState }) => {
            onPublicStateUpdate(publicState);
            setVoteResult({ passed, ja, nein, votes });
            setRevealedVotes(votes);
            setVotedPlayers([]);
            setHasVoted(false);
        });

        socket.on("nominationPhase", ({ publicState, eligibleIds }) => {
            console.log(
                "CLIENT: nominationPhase received, president:",
                publicState?.presidentId,
            );
            onPublicStateUpdate(publicState);
            setEligibleChancellors(eligibleIds);
            setLegislativeCards(null);
            setChancellorCards(null);
            setAwaitingChancellor(false);
            setOverlaysHidden(false);
        });

        socket.on("deliberationEnded", () => {
            console.log("CLIENT: deliberationEnded received");
            setDeliberating(false);
            setSkipCountdown(null);
            setHasSkipped(false);
            setVoteResult(null);
            setRevealedVotes(null);
        });

        socket.on("legislativeSession", ({ cards, reshuffled }) => {
            setLegislativeCards(cards);
            if (reshuffled) setReshuffled(true);
        });

        socket.on("legislativeStarted", ({ reshuffled, publicState }) => {
            onPublicStateUpdate(publicState);
            if (reshuffled) setReshuffled(true);
            setAwaitingChancellor(false);
            setVoteResult(null);
            setTimeout(() => setRevealedVotes(null), 5000); // ← delay clearing
        });

        socket.on("presidentDiscarded", ({ publicState }) => {
            onPublicStateUpdate(publicState);
            setLegislativeCards(null);
            setAwaitingChancellor(true);
        });

        socket.on("chancellorCards", ({ cards, publicState }) => {
            onPublicStateUpdate(publicState);
            setChancellorCards(cards);
            setAwaitingChancellor(false);
        });

        socket.on("policyEnacted", ({ policy, chaos, publicState }) => {
            setChancellorCards(null);
            setLegislativeCards(null);
            setAwaitingChancellor(false);
            setPolicyResult({ policy, chaos });
            setRevealedVotes(null);
            onPublicStateUpdate(publicState);
            setTimeout(() => {
                setPolicyResult(null);
                setRevealedVotes(null); // ← clear together with policy banner
            }, 3000);
        });

        socket.on("deliberationPhase", ({ timeLimit, publicState }) => {
            onPublicStateUpdate(publicState);
            setDeliberating(true);
            setDeliberationTimeLimit(timeLimit);
            setSkipCount(0);
            setHasSkipped(false);
            setSkipCountdown(null);
            setOverlaysHidden(false);
        });

        socket.on("skipVoteUpdate", ({ skipCount, aliveCount, voterId }) => {
            setSkipCount(skipCount);
            if (voterId === myId) setHasSkipped(true);
        });

        socket.on("skipCountdown", ({ seconds }) => {
            setSkipCountdown(seconds);
            const interval = setInterval(() => {
                setSkipCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        });

        return () => {
            socket.off("roleAssigned");
            socket.off("gameStarted");
            socket.off("chancellorNominated");
            socket.off("playerVoted");
            socket.off("voteResult");
            socket.off("nominationPhase");
            socket.off("deliberationEnded");
            socket.off("legislativeSession");
            socket.off("legislativeStarted");
            socket.off("presidentDiscarded");
            socket.off("chancellorCards");
            socket.off("policyEnacted");
            socket.off("deliberationPhase");
            socket.off("skipVoteUpdate");
            socket.off("skipCountdown");
        };
    }, [myId]);

    function handleStartGame() {
        socket.emit("startGame", { sessionName: room });
    }

    function handleNominate(chancellorId) {
        socket.emit("nominateChancellor", { sessionName: room, chancellorId });
    }

    function handleVote(vote) {
        socket.emit("castVote", { sessionName: room, vote });
    }

    function handlePresidentDiscard(cardIndex) {
        socket.emit("presidentDiscard", { sessionName: room, cardIndex });
    }

    function handleChancellorEnact(cardIndex) {
        socket.emit("chancellorEnact", { sessionName: room, cardIndex });
    }

    function handleSkipVote() {
        socket.emit("skipVote", { sessionName: room });
    }

    const presidentName =
        players.find((p) => p.id === publicState?.presidentId)?.name ||
        "Unknown";

    const chancellorName =
        players.find((p) => p.id === publicState?.chancellorId)?.name ||
        "Unknown";

    const isPresident = myId === publicState?.presidentId;
    const isChancellor = myId === publicState?.chancellorId;
    const isNominating = publicState?.phase === "nomination";
    const isVoting = publicState?.phase === "voting";
    const isLegislative = publicState?.phase === "legislative";
    const showPileCounts = publicState?.options?.showPileCounts !== false;

    const showLegislative =
        gameStarted &&
        !showRole &&
        !voteResult &&
        isLegislative &&
        (legislativeCards || awaitingChancellor || chancellorCards);

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

            {/* ── RESHUFFLE NOTICE ── */}
            {reshuffled && (
                <div
                    className="vote-result-banner vote-passed"
                    style={{ top: "60px" }}
                    onClick={() => setReshuffled(false)}
                >
                    <span className="vote-result-icon">🔀</span>
                    <span className="vote-result-text">Deck Reshuffled</span>
                </div>
            )}

            {/* ── POLICY RESULT BANNER ── */}
            {policyResult && (
                <div
                    className={`vote-result-banner ${policyResult.policy === "liberal" ? "vote-passed" : "vote-failed"}`}
                >
                    <span className="vote-result-icon">
                        {policyResult.policy === "liberal" ? "🕊" : "⚡"}
                    </span>
                    <span className="vote-result-text">
                        {policyResult.chaos ? "Chaos! " : ""}
                        {policyResult.policy === "liberal"
                            ? "Liberal"
                            : "Fascist"}{" "}
                        Policy Enacted
                    </span>
                </div>
            )}

            {/* ── VOTE RESULT BANNER ── */}
            {voteResult && (
                <div
                    className={`vote-result-banner ${voteResult.passed ? "vote-passed" : "vote-failed"}`}
                >
                    <span className="vote-result-icon">
                        {voteResult.passed ? "✓" : "✗"}
                    </span>
                    <span className="vote-result-text">
                        {voteResult.passed
                            ? "Government Elected"
                            : "Government Rejected"}
                    </span>
                    <span className="vote-result-tally">
                        Ja: {voteResult.ja} — Nein: {voteResult.nein}
                    </span>
                </div>
            )}

            {/* ── NOMINATION OVERLAY ── */}
            {gameStarted &&
                isNominating &&
                !showRole &&
                !voteResult &&
                !deliberating &&
                !overlaysHidden && (
                    <NominationOverlay
                        players={players}
                        eligibleIds={eligibleChancellors}
                        presidentId={publicState?.presidentId}
                        myId={myId}
                        onNominate={handleNominate}
                    />
                )}

            {/* ── VOTING OVERLAY ── */}
            {gameStarted &&
                isVoting &&
                !showRole &&
                !voteResult &&
                !overlaysHidden && (
                    <VotingOverlay
                        presidentName={presidentName}
                        chancellorName={chancellorName}
                        myId={myId}
                        alivePlayers={publicState?.alivePlayers || []}
                        votedPlayers={votedPlayers}
                        hasVoted={hasVoted}
                        onVote={handleVote}
                    />
                )}

            {/* ── LEGISLATIVE OVERLAY ── */}
            {showLegislative && !overlaysHidden && (
                <LegislativeOverlay
                    cards={legislativeCards || chancellorCards || []}
                    isPresident={isPresident && !!legislativeCards}
                    isChancellor={isChancellor && !!chancellorCards}
                    onPresidentDiscard={handlePresidentDiscard}
                    onChancellorEnact={handleChancellorEnact}
                />
            )}

            {/* ── DELIBERATION OVERLAY ── */}
            {gameStarted && deliberating && !showRole && (
                <DeliberationOverlay
                    timeLimit={deliberationTimeLimit}
                    skipCount={skipCount}
                    aliveCount={publicState?.alivePlayers?.length || 0}
                    hasSkipped={hasSkipped}
                    countdownSeconds={skipCountdown}
                    onSkip={handleSkipVote}
                />
            )}

            {/* ── TOGGLE OVERLAYS BUTTON ── */}
            {gameStarted && !deliberating && !showRole && (
                <button
                    className="toggle-overlays-btn"
                    onClick={() => setOverlaysHidden((prev) => !prev)}
                >
                    {overlaysHidden ? "Show Overlay" : "Hide Overlay"}
                </button>
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
                    presidentId={publicState?.presidentId}
                    chancellorId={publicState?.chancellorId}
                    myId={myId}
                    alivePlayers={publicState?.alivePlayers || []}
                    votedPlayers={votedPlayers}
                    revealedVotes={revealedVotes}
                />
            )}

            {/* ── ROLE BADGE ── */}
            {gameStarted && role && (
                <RoleBadge
                    role={role}
                    knownFascists={knownFascists}
                    hitlerId={hitlerId}
                    playerCount={publicState?.playerCount || 0}
                />
            )}

            <div className="page">
                {/* ── LIBERAL BOARD ── */}
                <div className="board liberal-board">
                    <div className="board-edge top-edge lib-edge"></div>

                    <div className="side-label left-label lib-side">
                        <span>D R A W &nbsp; P I L E</span>
                        <div className="pile-card-wrap">
                            <div className="pile-card-back">
                                <div className="pile-card-border">
                                    <div className="pile-card-eagle">⚜</div>
                                </div>
                            </div>
                            {showPileCounts && (
                                <div className="pile-card-count">
                                    {publicState?.drawPileCount ?? 17}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="side-label right-label lib-side">
                        <span>D I S C A R D &nbsp; P I L E</span>
                        <div className="pile-card-wrap">
                            <div className="pile-card-back">
                                <div className="pile-card-border">
                                    <div className="pile-card-eagle">⚜</div>
                                </div>
                            </div>
                            {showPileCounts && (
                                <div className="pile-card-count">
                                    {publicState?.discardPileCount ?? 0}
                                </div>
                            )}
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
                                        <div
                                            className={`slot-circle lib-circle ${
                                                (publicState?.liberalPolicies ??
                                                    0) >= n
                                                    ? "lib-enacted"
                                                    : ""
                                            }`}
                                        ></div>
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
                            {[0, 1, 2, 3].map((n) => (
                                <>
                                    <div
                                        key={`pip-${n}`}
                                        className={`tracker-pip ${
                                            (publicState?.electionTracker ??
                                                1) > n
                                                ? "active"
                                                : ""
                                        }`}
                                    ></div>
                                    {n < 3 && (
                                        <div
                                            key={`arrow-${n}`}
                                            className="tracker-arrow"
                                        >
                                            FAIL →
                                        </div>
                                    )}
                                </>
                            ))}
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
                                        <div
                                            className={`slot-circle fas-circle ${
                                                (publicState?.fascistPolicies ??
                                                    0) >= n
                                                    ? "fas-enacted"
                                                    : ""
                                            }`}
                                        ></div>
                                        <div className="slot-divider fas-divider-line"></div>
                                    </div>
                                ))}
                                <div
                                    className="slot fas-slot win-slot"
                                    data-n="6"
                                >
                                    <div
                                        className={`slot-circle fas-circle fas-win-circle ${
                                            (publicState?.fascistPolicies ??
                                                0) >= 6
                                                ? "fas-enacted"
                                                : ""
                                        }`}
                                    ></div>
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
