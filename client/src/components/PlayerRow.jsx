export default function PlayerRow({
    players,
    presidentId,
    chancellorId,
    myId,
    alivePlayers,
    votedPlayers,
    role,
    knownFascistIds,
    hitlerSocketId,
    playerCount,
}) {
    const isFascist = role === "fascist";
    const isHitler = role === "hitler";
    const isSmallGame = playerCount <= 6;

    function getFascistIcon(playerId) {
        if (playerId === myId) return null;

        if (isFascist) {
            if (knownFascistIds && knownFascistIds.includes(playerId))
                return "⚡";
            if (hitlerSocketId && hitlerSocketId === playerId) return "☠";
        }

        if (isHitler && isSmallGame) {
            if (knownFascistIds && knownFascistIds.includes(playerId))
                return "⚡";
        }

        return null;
    }

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
                const fascistIcon = getFascistIcon(player.id);

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
                        {hasVoted && !isDead && (
                            <div className="player-badge voted-badge">✓</div>
                        )}
                        {fascistIcon && (
                            <div className="player-faction-icon">
                                {fascistIcon}
                            </div>
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
