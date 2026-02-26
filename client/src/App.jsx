import { useState } from "react";
import socket from "./socket";
import LobbyView from "./components/LobbyView";
import BoardView from "./components/BoardView";

export default function App() {
    const [view, setView] = useState("lobby");
    const [room, setRoom] = useState(null);

    function handleEnterBoard(roomName) {
        setRoom(roomName);
        setView("board");
    }

    return view === "lobby" ? (
        <LobbyView onEnterBoard={handleEnterBoard} />
    ) : (
        <BoardView room={room} />
    );
}
