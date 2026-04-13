export default function VotingOverlay({
    presidentName,
    chancellorName,
    myId,
    alivePlayers,
    votedPlayers,
    hasVoted,
    onVote,
}) {
    const totalVoters = alivePlayers.length;
    const votesIn = votedPlayers.length;

    return (
        <div className="role-overlay">
            <div className="role-card voting-card">
                <div className="card-corner tl"></div>
                <div className="card-corner tr"></div>
                <div className="card-corner bl"></div>
                <div className="card-corner br"></div>

                <div className="role-emblem">🗳</div>

                <div className="role-title">The Vote</div>

                <div className="voting-candidates">
                    <div className="voting-candidate">
                        <div className="voting-candidate-role">President</div>
                        <div className="voting-candidate-name">
                            {presidentName}
                        </div>
                    </div>
                    <div className="voting-divider">+</div>
                    <div className="voting-candidate">
                        <div className="voting-candidate-role">Chancellor</div>
                        <div className="voting-candidate-name">
                            {chancellorName}
                        </div>
                    </div>
                </div>

                <div className="voting-progress">
                    {votesIn} / {totalVoters} votes cast
                </div>

                {!hasVoted && alivePlayers.includes(myId) ? (
                    <div className="voting-buttons">
                        <button
                            className="vote-btn vote-ja"
                            onClick={() => onVote(true)}
                        >
                            Ja!
                        </button>
                        <button
                            className="vote-btn vote-nein"
                            onClick={() => onVote(false)}
                        >
                            Nein!
                        </button>
                    </div>
                ) : (
                    <div className="role-flavour">
                        {!alivePlayers.includes(myId)
                            ? "You are eliminated and cannot vote."
                            : "Your vote has been cast. Awaiting others…"}
                    </div>
                )}
            </div>
        </div>
    );
}
