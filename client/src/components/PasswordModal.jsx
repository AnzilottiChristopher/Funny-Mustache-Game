import { useState } from "react";

export default function PasswordModal({ sessionName, onCancel, onJoin }) {
    const [password, setPassword] = useState("");

    return (
        <div className="pw-modal-overlay open">
            <div className="pw-modal">
                <div className="pw-modal-header">
                    <div className="pw-session-name">{sessionName}</div>
                    <div className="pw-sub">
                        Enter the session password to proceed
                    </div>
                </div>
                <div className="field">
                    <label>Password</label>
                    <input
                        type="text"
                        className="code-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onJoin(password)}
                        autoFocus
                    />
                </div>
                <div className="pw-modal-actions">
                    <button
                        className="btn btn-join"
                        onClick={() => onJoin(password)}
                    >
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
