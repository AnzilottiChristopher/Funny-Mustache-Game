import { useState } from "react";
import PolicyCard from "./PolicyCard";

export default function LegislativeOverlay({
    cards,
    isPresident,
    isChancellor,
    onPresidentDiscard,
    onChancellorEnact,
}) {
    const [selected, setSelected] = useState(null);

    function handleSelect(index) {
        setSelected(index);
    }

    function handleConfirm() {
        if (selected === null) return;
        if (isPresident) onPresidentDiscard(selected);
        if (isChancellor) onChancellorEnact(selected);
        setSelected(null);
    }

    const title = isPresident
        ? "Choose a card to discard"
        : "Choose a policy to enact";
    const flavour = isPresident
        ? "Discard one card. The remaining two pass to the Chancellor."
        : "Enact one policy. The other is discarded.";
    const btnLabel = isPresident ? "Discard" : "Enact Policy";

    if (!isPresident && !isChancellor) {
        return (
            <div className="role-overlay">
                <div className="role-card legislative-card">
                    <div className="card-corner tl"></div>
                    <div className="card-corner tr"></div>
                    <div className="card-corner bl"></div>
                    <div className="card-corner br"></div>
                    <div className="role-emblem">📜</div>
                    <div className="role-title">Legislative Session</div>
                    <div className="role-flavour">
                        The government is deliberating on policy.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="role-overlay">
            <div className="role-card legislative-card">
                <div className="card-corner tl"></div>
                <div className="card-corner tr"></div>
                <div className="card-corner bl"></div>
                <div className="card-corner br"></div>

                <div className="role-title">{title}</div>
                <div className="role-flavour">{flavour}</div>

                <div className="legislative-cards">
                    {cards.map((card, i) => (
                        <PolicyCard
                            key={i}
                            type={card}
                            selected={selected === i}
                            onClick={() => handleSelect(i)}
                        />
                    ))}
                </div>

                {selected !== null && (
                    <button
                        className="btn legislative-confirm-btn"
                        onClick={handleConfirm}
                    >
                        {btnLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
