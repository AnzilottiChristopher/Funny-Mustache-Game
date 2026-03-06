const { GameState, Phases, Roles, BoardType } = require("./constants");
const Player = require("./player");

class GameManager {
    constructor(playerIds, boardType) {
        this.players = new Map();
        this.playerOrder = [];

        for (const playerData of playerIds) {
            const player = new Player(playerdata.id, playerData.name);

            this.players.set(playerData.id, player);
            this.playerOrder.push(playerData.id);
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

        this.boardType = boardType;
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

    //TODO
    roleAssign() {
        let roles = [];
        const playerCount = this.players.size;

        if (this.boardType === BoardType.FIVE) {
            roles = [
                Roles.HITLER,
                Roles.FASCIST,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL
            ];
        } else if (this.boardType === BoardType.SEVEN) {
            roles = [
                Roles.HITLER,
                Roles.FASCIST,
                Roles.FASCIST,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL
            ]
        } else if (this.boardType === BoardType.NINE) {
            roles = [
                Roles.HITLER,
                Roles.FASCIST,
                Roles.FASCIST,
                Roles.FASCIST,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL
            ]
        }

        // Add the extra liberals if needed
        while (roles.length < playerCount) {
            roles.push(Roles.LIBERAL);
        }

        // Shuffling
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [roles[i], roles[j]] = [roles[j], roles[i]];
        }

        let index = 0;
        for (const playerId of this.playerOrder) {
            const player = this.players.get(playerId);
            player.setRole(roles[index]);
            index++;
        }
    }
}

module.exports = GameManager
