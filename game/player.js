class Player {
    constructor(id, name) {
        this.username = name;
        this.playerId = id;
        this.role = null; //Set when the game starts
        this.alive = true; // Player is alive if 1, dead if 0
        this.vote = null; // Who the player votes for
    }
    getPlayerId() {
        return this.playerId;
    }
    getRole() {
        return this.role;
    }
    getLife() {
        return this.alive;
    }
    getVote() {
        return this.vote;
    }

    setRole(role) {
        this.role = role;
    }
    setLife(life) {
        this.alive = life;
    }

    castVote(vote) {
        this.vote = vote;
    }
    resetVote() {
        this.vote = null;
    }
}

module.exports = Player;
