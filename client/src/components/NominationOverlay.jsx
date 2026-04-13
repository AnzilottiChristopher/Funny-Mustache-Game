export default function NominationOverlay({
    players,
    eligibleIds,
    presidentId,
    myId,
    onNominate,
}) {
    const isPresident = myId === presidentId;

    return (
        <div className="role-overlay">
            <div className="role-card nomination-card">
                <div className="card-corner tl"></div>
                <div className="card-corner tr"></div>
                <div className="card-corner bl"></div>
                <div className="card-corner br"></div>

                <div className="role-emblem">👑</div>

                <div className="role-title">
                    {isPresident
                        ? "Nominate a Chancellor"
                        : "Awaiting Nomination"}
                </div>

                <div className="role-flavour">
                    {isPresident
                        ? "Choose wisely. The Assembly watches."
                        : "The President is selecting a Chancellor candidate."}
                </div>

                {isPresident && (
                    <div className="nomination-list">
                        {players
                            .filter((p) => eligibleIds.includes(p.id))
                            .map((p) => (
                                <button
                                    key={p.id}
                                    className="nomination-btn"
                                    onClick={() => onNominate(p.id)}
                                >
                                    {p.name}
                                </button>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
