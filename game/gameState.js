const { GameState, Phases, Roles, BoardType } = require("./constants");
const Player = require("./player");

class GameManager {
    constructor(playerIds, boardType) {
        this.players = new Map();
        this.playerOrder = [];

        for (const playerData of playerIds) {
            const player = new Player(playerData.id, playerData.name);
            this.players.set(playerData.id, player);
            this.playerOrder.push(playerData.id);
        }

        this.state = GameState.PRE_MATCH;
        this.phase = Phases.NOMINATION;

        this.presidentIndex = 0;
        this.chancellorId = null;

        // Term limits — only set after a SUCCESSFUL vote
        this.lastElectedPresident = null;
        this.lastElectedChancellor = null;

        this.liberalPolicies = 0;
        this.fascistPolicies = 0;

        this.policyDeck = [];
        this.discardPile = [];

        this.electionTracker = 1;

        this.votes = new Map();
        this.skipVotes = new Set();

        this.boardType = boardType;

        // Game options — can be expanded later
        this.options = {
            enforceTermLimits: true,
            resetElectionTracker: true,
            showPileCounts: true,
            deliberationTime: 60,
            skipVoteCountdown: 10,
        };
    }

    // ── Players ──────────────────────────────────────

    getAlivePlayers() {
        return this.playerOrder.filter((id) => this.players.get(id).getLife());
    }

    getAlivePlayerCount() {
        return this.getAlivePlayers().length;
    }

    killPlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) player.setLife(false);
    }

    // ── Presidency ───────────────────────────────────

    getPresident() {
        return this.playerOrder[this.presidentIndex];
    }

    advancePresident() {
        // Skip dead players
        let next = (this.presidentIndex + 1) % this.playerOrder.length;
        while (!this.players.get(this.playerOrder[next]).getLife()) {
            next = (next + 1) % this.playerOrder.length;
        }
        this.presidentIndex = next;
        this.chancellorId = null;
        this.phase = Phases.NOMINATION;
    }

    // ── Chancellor Nomination ────────────────────────

    getEligibleChancellors() {
        const alivePlayers = this.getAlivePlayers();
        const presidentId = this.getPresident();

        // If 5 or fewer alive players, ignore term limits
        const ignoreLimits =
            !this.options.enforceTermLimits || alivePlayers.length <= 5;

        return alivePlayers.filter((id) => {
            if (id === presidentId) return false; // can't nominate yourself
            if (id === this.lastElectedChancellor) return false;
            if (!ignoreLimits && id === this.lastElectedPresident) return false;
            return true;
        });
    }

    nominateChancellor(chancellorId) {
        if (this.phase !== Phases.NOMINATION) return false;
        const eligible = this.getEligibleChancellors();
        if (!eligible.includes(chancellorId)) return false;

        this.chancellorId = chancellorId;
        this.phase = Phases.VOTING;
        this.votes = new Map();
        return true;
    }

    // ── Voting ───────────────────────────────────────

    recordVote(playerId, vote) {
        const player = this.players.get(playerId);
        if (!player || !player.getLife()) return;
        player.castVote(vote);
        this.votes.set(playerId, vote);
    }

    allVotesIn() {
        const alive = this.getAlivePlayers();
        for (const id of alive) {
            if (this.votes.get(id) === undefined) return false;
        }
        return true;
    }

    tallyVotes() {
        let ja = 0;
        let nein = 0;
        this.votes.forEach((vote) => {
            if (vote === true) ja++;
            else nein++;
        });

        const passed = ja > nein;

        if (passed) {
            // Government elected — set term limits
            this.lastElectedPresident = this.getPresident();
            this.lastElectedChancellor = this.chancellorId;
            if (this.options.resetElectionTracker) {
                this.electionTracker = 1;
            }
            this.phase = Phases.LEGISLATIVE;
        } else {
            // Government failed
            this.electionTracker++;
            this.chancellorId = null;
            this.phase = Phases.NOMINATION;
        }

        // Reset votes
        for (const player of this.players.values()) {
            player.resetVote();
        }

        return { passed, ja, nein };
    }
    // ── Deliberation ─────────────────────────────────

    recordSkipVote(playerId) {
        const player = this.players.get(playerId);
        if (!player || !player.getLife()) return false;
        if (!this.skipVotes) this.skipVotes = new Set();
        this.skipVotes.add(playerId);
        return true;
    }

    getSkipVoteCount() {
        if (!this.skipVotes) return 0;
        return this.skipVotes.size;
    }

    clearSkipVotes() {
        this.skipVotes = new Set();
    }

    skipMajorityReached() {
        if (!this.skipVotes) return false;
        const alive = this.getAlivePlayerCount();
        return this.skipVotes.size > alive / 2;
    }

    // ── Roles ────────────────────────────────────────

    getRoles() {
        const roles = {};
        for (const [id, player] of this.players) {
            roles[id] = player.getRole();
        }
        return roles;
    }

    roleAssign() {
        let roles = [];
        const playerCount = this.players.size;

        if (this.boardType === BoardType.FIVE) {
            roles = [
                Roles.HITLER,
                Roles.FASCIST,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL,
            ];
        } else if (this.boardType === BoardType.SEVEN) {
            roles = [
                Roles.HITLER,
                Roles.FASCIST,
                Roles.FASCIST,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL,
                Roles.LIBERAL,
            ];
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
                Roles.LIBERAL,
            ];
        }

        while (roles.length < playerCount) {
            roles.push(Roles.LIBERAL);
        }

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

    // ── Board ────────────────────────────────────────

    checkBoard() {
        if (this.liberalPolicies === 5) {
            this.state = GameState.GAME_OVER;
            return "liberal";
        }
        if (this.fascistPolicies === 6) {
            this.state = GameState.GAME_OVER;
            return "fascist";
        }
        return null;
    }

    // ── Lifecycle ────────────────────────────────────

    startGame() {
        this.presidentIndex = 0;
        this.roleAssign();
        this.initializeDeck();
        this.state = GameState.PRE_MATCH;
        this.phase = Phases.NOMINATION;
    }

    endGame() {
        this.state = GameState.GAME_OVER;
    }

    // ── Serialise for client ─────────────────────────

    getPublicState() {
        return {
            phase: this.phase,
            presidentId: this.getPresident(),
            chancellorId: this.chancellorId,
            liberalPolicies: this.liberalPolicies,
            fascistPolicies: this.fascistPolicies,
            electionTracker: this.electionTracker,
            alivePlayers: this.getAlivePlayers(),
            drawPileCount: this.policyDeck.length,
            discardPileCount: this.discardPile.length,
            options: this.options,
            playerCount: this.players.size,
        };
    }
    // Add these methods to GameManager

    // ── Policy Deck ──────────────────────────────────

    initializeDeck() {
        // 11 fascist, 6 liberal
        const deck = [
            ...Array(11).fill("fascist"),
            ...Array(6).fill("liberal"),
        ];
        this.policyDeck = this.shuffleDeck(deck);
        this.discardPile = [];
    }

    shuffleDeck(deck) {
        const d = [...deck];
        for (let i = d.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [d[i], d[j]] = [d[j], d[i]];
        }
        return d;
    }

    reshuffleIfNeeded() {
        if (this.policyDeck.length < 3) {
            // Combine remaining draw pile with discard pile and reshuffle
            this.policyDeck = this.shuffleDeck([
                ...this.policyDeck,
                ...this.discardPile,
            ]);
            this.discardPile = [];
            return true; // signals a reshuffle happened
        }
        return false;
    }

    drawCards() {
        const reshuffled = this.reshuffleIfNeeded();
        const cards = this.policyDeck.splice(0, 3);
        this.phase = Phases.LEGISLATIVE;
        return { cards, reshuffled };
    }

    presidentDiscard(cardIndex, drawnCards) {
        // cardIndex is which of the 3 cards the president discards
        const discarded = drawnCards[cardIndex];
        const remaining = drawnCards.filter((_, i) => i !== cardIndex);
        this.discardPile.push(discarded);
        return remaining; // 2 cards passed to chancellor
    }

    chancellorEnact(cardIndex, remainingCards) {
        // cardIndex is which of the 2 cards the chancellor discards
        const enacted = remainingCards[cardIndex];
        const discarded = remainingCards.find((_, i) => i !== cardIndex);
        this.discardPile.push(discarded);

        if (enacted === "liberal") {
            this.liberalPolicies++;
        } else {
            this.fascistPolicies++;
        }

        // this.phase = Phases.NOMINATION;
        return enacted;
    }
}

module.exports = GameManager;
