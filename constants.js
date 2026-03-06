const GameState = Object.freeze({
    GAME_OVER: "game_over",
    SPECIAL_ABILITY: "special_ability",
    LOBBY: "lobby",
    PRE_MATCH: "pre_match",
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
module.exports = { GameState, Phases };
