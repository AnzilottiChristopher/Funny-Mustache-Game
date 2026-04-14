export default function RoleBadge({
    role,
    knownFascists,
    hitlerId,
    playerCount,
}) {
    const isLiberal = role === "liberal";
    const isFascist = role === "fascist";
    const isHitler = role === "hitler";
    const isSmallGame = playerCount <= 6;

    console.log(hitlerId);

    return (
        <div
            className={`role-badge-fixed ${isLiberal ? "role-badge-liberal" : "role-badge-fascist"}`}
        >
            <div className="role-badge-icon">
                {isLiberal && "🕊"}
                {isFascist && "⚡"}
                {isHitler && "🥸"}
            </div>
            <div className="role-badge-label">
                {isLiberal && "Liberal"}
                {isFascist && "Fascist"}
                {isHitler && "Hitler"}
            </div>

            {/* Fascist info — fascists always see this */}
            {isFascist && (
                <div className="role-badge-info">
                    {knownFascists && knownFascists.length > 0 && (
                        <>
                            <div className="role-badge-info-label">
                                Fascists
                            </div>
                            {knownFascists.map((name, i) => (
                                <div key={i} className="role-badge-info-value">
                                    ⚡ {name}
                                </div>
                            ))}
                        </>
                    )}
                    {hitlerId && (
                        <>
                            <div className="role-badge-info-label">Hitler</div>
                            <div className="role-badge-info-value">
                                🥸 {hitlerId}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Hitler info — only in small games */}
            {isHitler &&
                isSmallGame &&
                knownFascists &&
                knownFascists.length > 0 && (
                    <div className="role-badge-info">
                        <div className="role-badge-info-label">
                            Your Fascist
                        </div>
                        {knownFascists.map((name, i) => (
                            <div key={i} className="role-badge-info-value">
                                ⚡ {name}
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
