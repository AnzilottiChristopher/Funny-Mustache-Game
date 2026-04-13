// game/gameState.js

function createGameState(players) {
    return {
        players, // array of socket ids
        roles: {}, // socketId -> role
        alive: [...players], // who is still alive
        presidentIndex: 0, // index into players array
        president: null, // current president socket id
        chancellor: null, // current chancellor socket id
        lastPresident: null, // for term limits
        lastChancellor: null, // for term limits
        liberalPolicies: 0,
        fascistPolicies: 0,
        electionTracker: 0,
        phase: "lobby", // lobby, nomination, voting, legislative, executive, ended
        votes: {}, // socketId -> true/false
        drawPile: [],
        discardPile: [],
    };
}

module.exports = { createGameState };
