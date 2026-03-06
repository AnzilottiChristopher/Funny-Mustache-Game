const { GameState, Phases } = require("./constants");

class GameManager {
    constructor(players) {
        this.players = players;
        this.state = GameState.PRE_MATCH;
        this.phase = Phases.NOMINATION;
        this.presidentIndex = 0;
        this.chanellor = null;

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
        this.votes.set(playerId, vote);
    }
    allVotesIn() {
        //!TODO Finish this with checks on if fascist elected mustache man 
        //!TODO Check if game is over in here too?
        if (this.votes.size === this.players.length) {
            return true;
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
