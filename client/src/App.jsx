import { useState } from "react";
import LobbyView from "./components/LobbyView";
import BoardView from "./components/BoardView";

export default function App() {
    const [view, setView] = useState("lobby");
    const [room, setRoom] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [role, setRole] = useState(null);
    const [knownFascists, setKnownFascists] = useState(null);
    const [hitlerId, setHitlerid] = useState(null);
    const [knownFascistIds, setKnownFascistIds] = useState(null);
    const [hitlerSocketId, setHitlerSocketId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [myId, setMyId] = useState(null);
    const [publicState, setPublicState] = useState(null);

    function handleEnterBoard({ roomName, isHost, myId }) {
        setRoom(roomName);
        setIsHost(isHost);
        setMyId(myId);
        setView("board");
    }

    function handleRoleAssigned({
        role,
        knownFascists,
        hitlerId,
        knownFascistIds,
        hitlerSocketId,
    }) {
        setRole(role);
        setKnownFascists(knownFascists);
        setHitlerid(hitlerId);
        setKnownFascistIds(knownFascistIds || null);
        setHitlerSocketId(hitlerSocketId || null);
    }

    function handleGameStarted({ players, publicState }) {
        setPlayers(players);
        setPublicState(publicState);
    }

    function handlePublicStateUpdate(publicState) {
        setPublicState(publicState);
    }

    return view === "lobby" ? (
        <LobbyView onEnterBoard={handleEnterBoard} />
    ) : (
        <BoardView
            room={room}
            isHost={isHost}
            role={role}
            knownFascists={knownFascists}
            hitlerId={hitlerId}
            knownFascistIds={knownFascistIds}
            hitlerSocketId={hitlerSocketId}
            players={players}
            myId={myId}
            publicState={publicState}
            onRoleAssigned={handleRoleAssigned}
            onGameStarted={handleGameStarted}
            onPublicStateUpdate={handlePublicStateUpdate}
        />
    );
}
