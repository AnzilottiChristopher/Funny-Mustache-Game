import { useState, useEffect } from "react";

export default function DeliberationOverlay({
    timeLimit,
    skipCount,
    aliveCount,
    hasSkipped,
    countdownSeconds,
    onSkip,
}) {
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    useEffect(() => {
        if (timeLimit === 0) return;
        setTimeLeft(timeLimit);
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLimit]);

    const majorityNeeded = Math.floor(aliveCount / 2) + 1;

    return (
        <div className="deliberation-wrap">
            <div className="deliberation-panel">
                <div className="deliberation-title">Deliberation</div>

                {timeLimit > 0 && (
                    <div
                        className={`deliberation-timer ${timeLeft <= 10 ? "timer-urgent" : ""}`}
                    >
                        {timeLeft}s
                    </div>
                )}

                {countdownSeconds !== null && (
                    <div className="deliberation-timer timer-urgent">
                        Moving on in {countdownSeconds}s
                    </div>
                )}

                <div className="deliberation-skip">
                    <button
                        className={`skip-btn ${hasSkipped ? "skip-btn-voted" : ""}`}
                        onClick={onSkip}
                        disabled={hasSkipped}
                    >
                        {hasSkipped ? "Voted to Skip" : "Vote to Skip"}
                    </button>
                    <div className="skip-count">
                        {skipCount} / {majorityNeeded} needed
                    </div>
                </div>
            </div>
        </div>
    );
}
