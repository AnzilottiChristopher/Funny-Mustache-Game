const ROLE_COUNTS = {
    5: { liberals: 3, fascists: 1, hitler: 1 },
    6: { liberals: 4, fascists: 1, hitler: 1 },
    7: { liberals: 4, fascists: 2, hitler: 1 },
    8: { liberals: 5, fascists: 2, hitler: 1 },
    9: { liberals: 5, fascists: 3, hitler: 1 },
    10: { liberals: 6, fascists: 3, hitler: 1 },
};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function assignRoles(players) {
    const count = players.length;
    const roleCounts = ROLE_COUNTS[count];

    if (!roleCounts) {
        throw new Error(`Invalid player count: ${count}`);
    }

    const rolePool = [];
    for (let i = 0; i < roleCounts.liberals; i++) rolePool.push("liberal");
    for (let i = 0; i < roleCounts.fascists; i++) rolePool.push("fascist");
    rolePool.push("hitler");

    shuffle(rolePool);

    const assignments = {};
    players.forEach((socketId, index) => {
        assignments[socketId] = rolePool[index];
    });

    return assignments;
}

module.exports = { assignRoles };
