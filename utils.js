const fs = require('fs');

class PriorityQueue {
    constructor(sortFn = () => { }) {
        this.queue = [];
        this.sortFn = sortFn;
    }

    enqueue(item) {
        if (item.f === undefined) {
            item.f = item.g + item.h;
        }
        this.queue.push(item);
        this.queue.sort(this.sortFn);
    }

    update(index, item) {
        if (this.queue.length > index) {
            this.queue[index] = { ...this.queue[index], ...item };
            this.queue.sort(this.sortFn);
        }
    }

    dequeue() {
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    size() {
        return this.queue.length;
    }

    getQueue() {
        return this.queue;
    }
}

function loadInput(fileName) {
    const input = fs.readFileSync(fileName, 'utf8');
    const lines = input.split('\n');
    let numbers = [];
    for (const line of lines) if (line) numbers.push(line);
    return numbers.sort((a, b) => a - b);
}

function getStringFromState(numbers) {
    return numbers.join('|');
}

function getStateFromString(string) {
    return string.split('|');
}

function getDpKey(state) {
    return state.slice().sort((a, b) => a.localeCompare(b)).join('|');
}

function isSorted(arr) {
    return arr.map(x => {
        for (let i = 0; i < x.length - 1; i++) {
            if (x[i] != x[i + 1]) return false;
        }
        return true;
    }).reduce((acc, curr) => acc && curr, true);
}

function getConfig(state) {
    let config = []
    let n = state.length;
    for (let i = 0; i < n; i++) {
        let str = state[i];
        let j = str.length - 1;
        while (j >= 0 && str[j] === '0') j--;
        if (j >= 0) {
            let topColor = str[j];
            let count = 0;
            let empty = str.length - j - 1;
            while (j >= 0 && str[j] === topColor) {
                count++;
                j--;
            }
            config.push({
                topColor: parseInt(topColor),
                count: count,
                empty: empty
            });
        } else {
            config.push({
                topColor: 0,
                count: 0,
                empty: str.length
            });
        }
    }
    return config;
}

function getNextStates(state) {
    let n = state.length;
    let size = state[0].length;
    let config = getConfig(state);
    let nextStates = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j || config[i].empty === size || config[i].count === 0) continue;
            let nonEmpty = size - config[i].empty;
            let moveCount, moveElements, newState;
            if ((config[j].topColor === config[i].topColor && config[j].empty !== 0) || config[j].empty === size) {
                moveCount = config[j].empty === size ? config[i].count : Math.min(config[i].count, config[j].empty);
                newState = state.map(x => x.slice());
                moveElements = newState[i].slice(nonEmpty - moveCount, nonEmpty);
                newState[j] = newState[j].slice(0, size - config[j].empty) + moveElements + '0'.repeat(config[j].empty - moveCount);
                newState[i] = newState[i].slice(0, nonEmpty - moveCount) + '0'.repeat(moveCount) + newState[i].slice(nonEmpty);
                nextStates.push({
                    state: newState,
                    move: { from: i, to: j, count: moveCount }
                });
            }
        }
    }
    return nextStates;
}

function reconstructPath(parent, moveMap, finalKey) {
    let path = [];
    let movesList = [];
    let curKey = finalKey;
    while (curKey !== null) {
        path.push(curKey);
        if (moveMap[curKey]) movesList.push(moveMap[curKey]);
        curKey = parent[curKey];
    }
    path.reverse();
    movesList.reverse();
    return { path, movesList };
}

function printPath(path, movesList) {
    console.log('State progression:');
    for (let idx = 0; idx < path.length; idx++) {
        let stateArr = getStateFromString(path[idx]);
        if (idx > 0) {
            let mv = movesList[idx - 1];
            console.log(`  Move: from tube ${mv.from + 1} to tube ${mv.to + 1}, count: ${mv.count}`);
        }
        console.log(`Step ${idx}:`, stateArr.join(' | '));
    }
}

module.exports = {
    loadInput,
    getStringFromState,
    getStateFromString,
    getDpKey,
    isSorted,
    getConfig,
    getNextStates,
    reconstructPath,
    printPath,
    PriorityQueue
}; 