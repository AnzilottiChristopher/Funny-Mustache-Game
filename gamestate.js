const { GameState, Phases, Roles } = require("./constants");
const Player = require("./player");

class GameManager {
    constructor(playerIds) {
        this.players = new Map();
        this.playerOrder = [];

        for (const playerData of playerIds) {
            this.players.set(id, new Player(playerData.id, playerData.name));
        }

        this.state = GameState.PRE_MATCH;
        this.phase = Phases.NOMINATION;

        this.presidentIndex = null;
        this.chancellor = null;

        this.liberalPolicies = 0;
        this.fascistPolicies = 0;

        this.policyDeck = [];
        this.discardPile = [];

        this.votes = new Map();
    }
    nominateChancellor(playerId) {
        if (this.phase !== Phases.NOMINATION) return;

        this.chancellor = playerId;
        this.phase = Phases.VOTING;
    }
    nominatePresident(playerId) {
        if (this.phase !== Phases.EXECUTIVE) return;

        this.presidentIndex = playerId;
    }

    recordVote(playerId, vote) {
        const player = this.players.get(playerId);

        if (!player) return;

        player.castVote(vote);

        this.votes.set(playerId, vote);
    }
    allVotesIn() {
        //!TODO Finish this with checks on if fascist elected mustache man 
        //!TODO Check if game is over in here too?
        for (const player of this.players.values()) {
            if (player.getVote() === null) {
                return false;
            }
        }

        return true;
    }
    resetVotes() {
        for (const player of this.players.values()) {
            player.resetVote();
        }
    }

    //Finish later
    checkBoard() {
        if (this.liberalPolicies == 5) {
            this.state = GameState.GAME_OVER;
        } else if (this.fascistPolicies == 7) {
            this.state = GameState.GAME_OVER;
        }
    }

    //TODO
    startGame() {

    }
    //TODO
    endGame() {

    }
}

module.exports = GameManager
