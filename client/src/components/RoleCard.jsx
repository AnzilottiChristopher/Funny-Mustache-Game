export default function RoleCard({ role, knownFascists, hitlerId, onDismiss }) {
    const isLiberal = role === "liberal";
    const isHitler = role === "hitler";
    const isFascist = role === "fascist";

    return (
        <div className="role-overlay" onClick={onDismiss}>
            <div
                className={`role-card ${isLiberal ? "role-liberal" : "role-fascist"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-corner tl"></div>
                <div className="card-corner tr"></div>
                <div className="card-corner bl"></div>
                <div className="card-corner br"></div>

                <div className="role-emblem">
                    {isLiberal && "🕊"}
                    {isFascist && "⚡"}
                    {isHitler && "☠"}
                </div>

                <div className="role-title">
                    {isLiberal && "You are a Liberal"}
                    {isFascist && "You are a Fascist"}
                    {isHitler && "You are Hitler"}
                </div>

                <div className="role-flavour">
                    {isLiberal &&
                        "Trust no one. Enact liberal policies and root out the fascists."}
                    {isFascist &&
                        "Deceive the liberals. Enact fascist policies and protect Hitler."}
                    {isHitler &&
                        "Stay hidden. Let your fascists guide you to power."}
                </div>

                {/* Fascists get to see their allies */}
                {isFascist && knownFascists && (
                    <div className="role-info">
                        <p className="role-info-label">Your fellow fascists:</p>
                        {knownFascists.map((id) => (
                            <p key={id} className="role-info-value">
                                {id}
                            </p>
                        ))}
                        {hitlerId && (
                            <p className="role-info-label">Hitler is:</p>
                        )}
                        {hitlerId && (
                            <p className="role-info-value">{hitlerId}</p>
                        )}
                    </div>
                )}

                {/* Hitler knows fascist in small games */}
                {isHitler && knownFascists && (
                    <div className="role-info">
                        <p className="role-info-label">Your fascist is:</p>
                        {knownFascists.map((id) => (
                            <p key={id} className="role-info-value">
                                {id}
                            </p>
                        ))}
                    </div>
                )}

                <button className="btn role-dismiss-btn" onClick={onDismiss}>
                    I understand my role
                </button>
            </div>
        </div>
    );
}
