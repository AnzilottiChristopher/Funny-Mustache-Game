export default function SessionList({ sessions, onSelect, onRefresh }) {
    return (
        <div className="session-list-wrap">
            <div className="session-list-header">
                <label>Open Sessions</label>
                <button className="refresh-btn" onClick={onRefresh}>
                    ↻
                </button>
            </div>
            <div className="session-list">
                {sessions.length === 0 ? (
                    <div className="session-empty">
                        No sessions found.
                        <br />
                        <em>Be the first to convene.</em>
                    </div>
                ) : (
                    sessions.map((s) => (
                        <div
                            key={s.name}
                            className="session-row"
                            onClick={() => onSelect(s.name)}
                        >
                            <span className="session-row-name">{s.name}</span>
                            <span className="session-row-meta">
                                {s.players}/{s.maxPlayers}
                            </span>
                            <span className="session-row-enter">›</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
