export default function PolicyCard({
    type,
    faceDown = false,
    onClick,
    selected,
}) {
    if (faceDown) {
        return (
            <div
                className={`policy-card policy-back ${selected ? "policy-selected" : ""}`}
                onClick={onClick}
            >
                <div className="policy-back-inner">
                    <div className="policy-back-border">
                        <div className="policy-back-eagle">⚜</div>
                        <div className="policy-back-text">POLICY</div>
                    </div>
                </div>
            </div>
        );
    }

    const isLiberal = type === "liberal";

    return (
        <div
            className={`policy-card ${isLiberal ? "policy-liberal" : "policy-fascist"} ${selected ? "policy-selected" : ""}`}
            onClick={onClick}
        >
            <div className="policy-card-inner">
                <div className="policy-card-border">
                    <div className="policy-card-emblem">
                        {isLiberal ? "🕊" : "⚡"}
                    </div>
                    <div className="policy-card-title">
                        {isLiberal ? "LIBERAL" : "FASCIST"}
                    </div>
                    <div className="policy-card-subtitle">
                        {isLiberal ? "POLICY" : "POLICY"}
                    </div>
                </div>
            </div>
        </div>
    );
}
