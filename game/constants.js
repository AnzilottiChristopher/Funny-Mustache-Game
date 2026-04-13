const GameState = Object.freeze({
    GAME_OVER: "game_over",
    SPECIAL_ABILITY: "special_ability",
    LOBBY: "lobby",
    PRE_MATCH: "pre_match",
    ROLE_REVEAL: "role_reveal",
});
const Phases = Object.freeze({
    NOMINATION: "nomination",
    VOTING: "voting",
    LEGISLATIVE: "legislative",
    EXECUTIVE: "executive",
})
const Roles = Object.freeze({
    FASCIST: "fascist",
    LIBERAL: "liberal",
    HITLER: "hitler",
})
const BoardType = Object.freeze({
    FIVE: "five", //Encompasses 5-6 players
    SEVEN: "seven", // Encompasses 7-8 players
    NINE: "nine", // Encompasses 9-10 players
})
module.exports = { GameState, Phases, Roles, BoardType };
