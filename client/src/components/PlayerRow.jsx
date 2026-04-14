export default function PlayerRow({
    players,
    presidentId,
    chancellorId,
    myId,
    alivePlayers,
    votedPlayers,
    revealedVotes,
}) {
    return (
        <div className="player-row">
            {players.map((player) => {
                const isPresident = player.id === presidentId;
                const isChancellor = player.id === chancellorId;
                const isMe = player.id === myId;
                const isDead =
                    alivePlayers && !alivePlayers.includes(player.id);
                const hasVoted =
                    votedPlayers && votedPlayers.includes(player.id);
                const revealedVote = revealedVotes?.[player.id];

                return (
                    <div
                        key={player.id}
                        className={[
                            "player-box",
                            isPresident ? "player-president" : "",
                            isChancellor ? "player-chancellor" : "",
                            isMe ? "player-me" : "",
                            isDead ? "player-dead" : "",
                        ]
                            .join(" ")
                            .trim()}
                    >
                        {isPresident && (
                            <div className="player-badge president-badge">
                                P
                            </div>
                        )}
                        {isChancellor && (
                            <div className="player-badge chancellor-badge">
                                C
                            </div>
                        )}
                        {revealedVotes &&
                            revealedVote !== undefined &&
                            !isDead && (
                                <div
                                    className={`player-badge ${revealedVote ? "vote-ja-badge" : "vote-nein-badge"}`}
                                >
                                    {revealedVote ? "Ja" : "Nein"}
                                </div>
                            )}
                        {!revealedVotes && hasVoted && !isDead && (
                            <div className="player-badge voted-badge">✓</div>
                        )}
                        <div className="player-name">{player.name}</div>
                        {isMe && <div className="player-you">you</div>}
                        {isDead && <div className="player-dead-label">✝</div>}
                    </div>
                );
            })}
        </div>
    );
}
