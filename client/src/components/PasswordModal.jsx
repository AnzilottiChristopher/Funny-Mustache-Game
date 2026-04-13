import { useState } from "react";

export default function PasswordModal({ sessionName, onCancel, onJoin }) {
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    function handleJoin() {
        if (!name) {
            alert("Please enter your name");
            return;
        }
        onJoin(password, name); // ← pass both
    }

    return (
        <div className="pw-modal-overlay open">
            <div className="pw-modal">
                <div className="card-corner tl"></div>
                <div className="card-corner tr"></div>
                <div className="card-corner bl"></div>
                <div className="card-corner br"></div>
                <div className="pw-modal-header">
                    <div className="pw-session-name">{sessionName}</div>
                    <div className="pw-sub">
                        Present your credentials to enter.
                    </div>
                </div>
                <div className="field">
                    <label>Your Name</label>
                    <input
                        type="text"
                        className="code-input"
                        placeholder="Enter your alias…"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="field">
                    <label>Room Code</label>
                    <input
                        type="text"
                        className="code-input"
                        placeholder="e.g. XKQF·2841"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    />
                </div>
                <div className="pw-modal-actions">
                    <button className="btn btn-join" onClick={handleJoin}>
                        Enter Session
                    </button>
                    <button className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
