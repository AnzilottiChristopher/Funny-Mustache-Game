class Player {
    constructor() {
        this.playerId = null; //TODO figure this out
        this.role = null; //Set when the game starts
        this.life = 1; // Player is alive if 1, dead if 0
    }
    getPlayerId() {
        return this.playerId;
    }
    getRole() {
        return this.role;
    }
    getLife() {
        return this.life;
    }

    setPlayerId(playerId) {
        this.playerId = playerId;
    }
    setRole(role) {
        this.role = role;
    }
    setLife(life) {
        this.life = life;
    }
}

module.exports = Player;
