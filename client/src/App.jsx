import { useState } from "react";
import LobbyView from "./components/LobbyView";
import BoardView from "./components/BoardView";

export default function App() {
    const [view, setView] = useState("lobby");
    const [room, setRoom] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [playerCount, setPlayerCount] = useState(6);
    const [role, setRole] = useState(null);
    const [knownFascists, setKnownFascists] = useState(null);
    const [hitlerId, setHitlerid] = useState(null);
    const [players, setPlayers] = useState([]); // ← { id, name }[]
    const [myId, setMyId] = useState(null); // ← this client's socket id
    const [presidentId, setPresidentId] = useState(null);

    function handleEnterBoard({ roomName, isHost, playerCount, myId }) {
        setRoom(roomName);
        setIsHost(isHost);
        setPlayerCount(playerCount);
        setMyId(myId);
        setView("board");
    }

    function handleRoleAssigned({ role, knownFascists, hitlerId }) {
        setRole(role);
        setKnownFascists(knownFascists);
        setHitlerid(hitlerId);
    }

    function handleGameStarted({ players, president }) {
        setPlayers(players);
        setPresidentId(president);
    }

    return view === "lobby" ? (
        <LobbyView onEnterBoard={handleEnterBoard} />
    ) : (
        <BoardView
            room={room}
            isHost={isHost}
            playerCount={playerCount}
            role={role}
            knownFascists={knownFascists}
            hitlerId={hitlerId}
            players={players}
            myId={myId}
            presidentId={presidentId}
            onRoleAssigned={handleRoleAssigned}
            onGameStarted={handleGameStarted}
        />
    );
}
