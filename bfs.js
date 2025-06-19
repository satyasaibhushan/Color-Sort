const {
    loadInput,
    getStringFromState,
    getStateFromString,
    getDpKey,
    isSorted,
    getNextStates,
    reconstructPath,
    printPath,
} = require('./utils');

const numbers = loadInput('input1');

function bfs(start) {
    let queue = [];
    let startKey = getStringFromState(start);
    queue.push({ key: startKey, moves: 0 });

    let dp = new Set();
    dp.add(getDpKey(start));
    // Track parent and move for each state
    let parent = {};
    parent[startKey] = null;
    let moveMap = {};
    while (queue.length > 0) {
        let { key, moves } = queue.shift();
        let state = getStateFromString(key);
        if (isSorted(state)) {
            let { path, movesList } = reconstructPath(parent, moveMap, key);
            printPath(path, movesList);
            return moves;
        }
        let nextStates = getNextStates(state);
        for (let nextObj of nextStates) {
            let keyNext = getStringFromState(nextObj.state);
            let dpKey = getDpKey(nextObj.state);
            if (!dp.has(dpKey)) {
                dp.add(dpKey);
                parent[keyNext] = key;
                moveMap[keyNext] = nextObj.move;
                queue.push({ key: keyNext, moves: moves + 1 });
            }
        }
    }
    return -1;
}

const startTime = performance.now();
const result = bfs(numbers);
const endTime = performance.now();
console.log(`Minimum moves BFS:`, result);
console.log('Time taken:', ((endTime - startTime) / 1000).toFixed(2), 'seconds');
return result;