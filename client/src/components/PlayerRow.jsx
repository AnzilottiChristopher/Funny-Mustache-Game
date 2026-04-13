export default function PlayerRow({
    players,
    presidentId,
    chancellorId,
    myId,
}) {
    return (
        <div className="player-row">
            {players.map((player) => {
                const isPresident = player.id === presidentId;
                const isChancellor = player.id === chancellorId;
                const isMe = player.id === myId;

                return (
                    <div
                        key={player.id}
                        className={[
                            "player-box",
                            isPresident ? "player-president" : "",
                            isChancellor ? "player-chancellor" : "",
                            isMe ? "player-me" : "",
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
                        <div className="player-name">{player.name}</div>
                        {isMe && <div className="player-you">you</div>}
                    </div>
                );
            })}
        </div>
    );
}
