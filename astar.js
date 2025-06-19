const {
    loadInput,
    getStringFromState,
    getStateFromString,
    isSorted,
    getNextStates,
    reconstructPath,
    printPath,
    PriorityQueue
} = require('./utils');

const numbers = loadInput('input1');

// Color Distribution Heuristic
function colorDistributionHeuristic(state) {
    const colorTubes = {};
    for (let i = 0; i < state.length; i++) {
        const tube = state[i];
        const seen = new Set();
        for (let j = 0; j < tube.length; j++) {
            const c = tube[j];
            if (c !== '0') seen.add(c);
        }
        for (const c of seen) {
            if (!colorTubes[c]) colorTubes[c] = new Set();
            colorTubes[c].add(i);
        }
    }
    let moves = 0;
    for (const c in colorTubes) {
        moves += colorTubes[c].size - 1;
    }

    return moves;
}

// Tighter admissible heuristic: group-based
function differentColorsHeuristic(state) {
    let groupMoves = 0;
    for (let i = 0; i < state.length; i++) {
        let tube = state[i];
        for (let j = 1; j < tube.length; j++) {
            if (tube[j] === '0') continue;
            if (tube[j] !== tube[j - 1]) {
                groupMoves++;
            }
        }
    }
    return groupMoves;
}


// Stronger admissible heuristic: color misplacement 
function minMovesHeuristic(state) {
    // For each color, find the tube with the most of that color
    const colorCounts = {};
    const size = state[0].length;
    for (let i = 0; i < state.length; i++) {
        const tube = state[i];
        for (let j = 0; j < tube.length; j++) {
            const c = tube[j];
            if (c === '0') continue;
            if (!colorCounts[c]) colorCounts[c] = Array(state.length).fill(0);
            colorCounts[c][i]++;
        }
    }
    let moves = 0;
    for (const c in colorCounts) {
        const maxInOneTube = Math.max(...colorCounts[c]);
        // All pieces not in the best tube must move at least once
        moves += (size - maxInOneTube);
    }
    return moves;
}

function bestHeuristic(state) {
    return Math.max(
        minMovesHeuristic(state),
        // colorDistributionHeuristic(state),
        differentColorsHeuristic(state)
    );
}

const sortFn = (a, b) => a.g + a.h - b.g - b.h

function astar(start) {
    let startKey = getStringFromState(start);
    let startHeuristic = bestHeuristic(start);

    let openSet = new PriorityQueue(sortFn);
    openSet.enqueue({
        key: startKey,
        g: 0,  // cost from start to current node
        h: startHeuristic,  // heuristic estimate to goal
        moves: 0
    });

    let closedSet = new Set();
    let gScore = new Map();
    gScore.set(startKey, 0);

    // Track parent and move for path reconstruction
    let parent = {};
    parent[startKey] = null;
    let moveMap = {};

    let iterations = 0;
    const maxIterations = 100000; // Safety limit

    while (!openSet.isEmpty() && iterations < maxIterations) {
        iterations++;

        let current = openSet.dequeue();
        let currentKey = current.key;
        let currentState = getStateFromString(currentKey);

        if (isSorted(currentState)) {
            console.log(`A* completed in ${iterations} iterations`);
            let { path, movesList } = reconstructPath(parent, moveMap, currentKey);
            printPath(path, movesList);
            return current.moves;
        }

        closedSet.add(currentKey);

        let nextStates = getNextStates(currentState);
        for (let nextObj of nextStates) {
            let neighborKey = getStringFromState(nextObj.state);

            if (closedSet.has(neighborKey)) continue;

            let tentativeG = current.g + 1; // Each move costs 1

            if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                gScore.set(neighborKey, tentativeG);
                let h = bestHeuristic(nextObj.state);

                // Check if neighbor is already in open set
                let existingIndex = openSet.queue.findIndex(node => node.key === neighborKey);
                if (existingIndex === -1) {
                    openSet.enqueue({
                        key: neighborKey,
                        g: tentativeG,
                        h: h,
                        moves: current.moves + 1
                    });
                } else {
                    // Update existing node
                    openSet.update(existingIndex, {
                        g: tentativeG,
                        h: h,
                        moves: current.moves + 1
                    });
                }

                parent[neighborKey] = currentKey;
                moveMap[neighborKey] = nextObj.move;
            }
        }
    }

    if (iterations >= maxIterations) {
        console.log('A* reached maximum iterations limit');
    }

    return -1; // No solution found
}

const startTime = performance.now();
const result = astar(numbers);
const endTime = performance.now();
console.log(`Minimum moves A*:`, result);
console.log('Time taken:', ((endTime - startTime) / 1000).toFixed(2), 'seconds');
return result;