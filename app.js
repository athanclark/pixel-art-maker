const SIDE = 50;
const SQUARE = SIDE * SIDE;

const storage = {
    lastColor: {
        get: function getLastColor() {
            return window.localStorage.getItem('lastColor');
        },
        set: function setLastColor(c) {
            window.localStorage.setItem('lastColor', c);
        }
    },
    canvas: {
        get: function getCanvas() {
            return JSON.parse(window.localStorage.getItem('canvas'));
        },
        set: function setCanvas(c) {
            window.localStorage.setItem('canvas', JSON.stringify(c));
        }
    },
    tool: {
        get: function getTool() {
            return window.localStorage.getItem('tool') || 'draw';
        },
        set: function setTool(t) {
            window.localStorage.setItem('tool', t);
        }
    }
};

let clicking = false;
let lastColor = storage.lastColor.get();
let blocks = storage.canvas.get();
let tool = storage.tool.get();

function coordsToInline(point) {
    return (point.y * SIDE) + point.x;
}

function inlineToCoords(i) {
    return {x: i % SIDE, y: Math.floor(i / SIDE)};
}

const getBlock = function getBlock(point) {
    return blocks[coordsToInline(point)];
};

const setBlock = function setBlock(point, x) {
    blocks[coordsToInline(point)] = x;
};

// get the blocks with the same color surrounding this one
// {x, y} -> [{x, y}]
function getSameAdjacentBlocks(point) {
    return adjacentBlocks(point).filter((p) => getBlock(p) === getBlock(point));
}

// {x, y} -> IntSet
const getSameSurroundingBlocks = function getSameSurroundingBlocks(point) {
    let completeSet = new IntSet(SQUARE);
    completeSet.add(coordsToInline(point));

    let adjacentSet = new IntSet(SQUARE);
    adjacentSet.add(coordsToInline(point));
    do {
        let tmpAdjacentSet = new IntSet(SQUARE);
        for (const nextPoint of adjacentSet.toArray()) {
            for (const adjacentToNextPoint of getSameAdjacentBlocks(inlineToCoords(nextPoint))) {
                tmpAdjacentSet.add(coordsToInline(adjacentToNextPoint));
            }
        }
        tmpAdjacentSet = tmpAdjacentSet.difference(completeSet);
        adjacentSet = tmpAdjacentSet;
        completeSet = completeSet.union(adjacentSet);
    } while(!adjacentSet.isEmpty())

    return completeSet;
};

window.onload = function onload() {
    // get last color and color picker element
    const pickerElement = document.getElementById('picker');
    if (lastColor === null) {
        lastColor = pickerElement.value;
    } else {
        pickerElement.value = lastColor;
    }
    pickerElement.addEventListener('change', function(e) {
        lastColor = e.target.value;
        storage.lastColor.set(lastColor);
    });

    // initialize radio buttons
    if (tool === 'draw' || tool === 'fill') {
        document.getElementById(`tool-${tool}`).checked = true;
    }
    document.getElementById('tool').addEventListener('change', function(e) {
        if (e.target.checked) {
            tool = e.target.id.replace('tool-','');
            storage.tool.set(tool);
        }
    });

    // watch mousedown and mouseup on entire document
    document.addEventListener('mousedown', function(e) {
        clicking = true;
        e.preventDefault();

        if (tool === 'fill' && e.target.className === 'block') {
            const canvasChildren = document.getElementById('canvas').children;
            for (const i of getSameSurroundingBlocks({
                x: Number(e.target.dataset.x),
                y: Number(e.target.dataset.y)
            }).toArray()) {
                canvasChildren[i].style.background = lastColor;
                setBlock(inlineToCoords(i), lastColor);
            }
        }
    });
    document.addEventListener('mouseup', function(e) {
        clicking = false;
        e.preventDefault();

        // save state of canvas to local storage
        let blocks = [];
        for (const block of document.querySelectorAll('#canvas > div')) {
            blocks.push(block.style.background);
        }
        storage.canvas.set(blocks);
    });

    const canvas = document.getElementById('canvas');
    // watch mouse movement
    canvas.addEventListener('mousemove', function(e) {
        if (clicking && tool === 'draw') {
            e.target.style.background = lastColor;
            setBlock({
                x: Number(e.target.dataset.x),
                y: Number(e.target.dataset.y)
            }, lastColor);
        }
    });
    const createBlock = function createBlock(point, bg) {
        const block = document.createElement('div');
        block.className = 'block';
        block.style.width = `${100 / SIDE}%`;
        block.style.height = `${100 / SIDE}%`;
        block.style.background = bg;
        block.dataset.x = point.x;
        block.dataset.y = point.y;
        canvas.appendChild(block);
    };

    if (blocks) {
        // if localstorage worked
        for (let i = 0; i < SIDE; i++) {
            for (let j = 0; j < SIDE; j++) {
                const point = {x: j, y: i};
                createBlock(point, getBlock(point));
            }
        }
    } else {
        for (let i = 0; i < SIDE; i++) {
            for (let j = 0; j < SIDE; j++) {
                const point = {x: j, y: i};
                createBlock(point, lastColor);
            }
        }
        blocks = Array(SQUARE).fill(lastColor);
    }
};

// utility functions

function cartesianProduct(xs, ys) {
    let rs = [];
    for (const x of xs) {
        for (const y of ys) {
            rs.push({x,y});
        }
    }
    return rs;
}

// {x, y} -> [{x, y}]
function adjacentBlocks(point) {
    const i = point.x;
    const j = point.y;

    const is = [];
    if (i-1 >= 0) {
        is.push(i-1);
    }
    if (i+1 < SIDE) {
        is.push(i+1);
    }
    const js = [];
    if (j-1 >= 0) {
        js.push(j-1);
    }
    if (j+1 < SIDE) {
        js.push(j+1);
    }

    return cartesianProduct(is, [j]).concat(cartesianProduct([i], js));
}

// Should be able to store (0, size]
function IntSet(size) {
    const INTSIZE = 31; // bit length of integer
    const makeMask = function makeMask(x) {
        return 2 ** (x % INTSIZE);
    };
    const makeEntry = function makeEntry(x) {
        return Math.floor(x / INTSIZE);
    };

    this.size = size;
    this.entries = Array(Math.ceil(size / INTSIZE)).fill(0);
    this.add = function addIntSet(x) {
        const mask = makeMask(x);
        const entry = makeEntry(x);
        this.entries[entry] = this.entries[entry] | mask;
    };
    this.remove = function removeIntSet(x) {
        const mask = makeMask(x);
        const entry = makeEntry(x);
        this.entries[entry] = this.entries[entry] & mask;
    };
    this.contains = function containsIntSet(x) {
        const mask = makeMask(x);
        const entry = makeEntry(x);
        return (this.entries[entry] | mask) === this.entries[entry];
    };
    this.union = function unionIntSet(xs) {
        let ys = [];
        let i = 0;
        for (; i < Math.min(this.entries.length, xs.entries.length); i++) {
            ys.push(this.entries[i] | xs.entries[i]);
        }
        if (this.entries.length > xs.entries.length) {
            ys = ys.concat(this.entries.slice(i));
        } else if (this.entries.length < xs.entries.length) {
            ys = ys.concat(xs.entries.slice(i));
        }
        let zs = new IntSet(Math.max(this.size, xs.size));
        zs.entries = ys;
        return zs;
    };
    this.intersection = function intersectionIntSet(xs) {
        let ys = [];
        for (let i = 0; i < Math.min(this.entries.length, xs.entries.length); i++) {
            ys.push(this.entries[i] & xs.entries[i]);
        }
        let zs = new IntSet(Math.min(this.size, xs.size));
        zs.entries = ys;
        return zs;
    };
    this.symmetricDifference = function symmetricDifferenceIntSet(xs) {
        let ys = [];
        let i = 0;
        for (; i < Math.min(this.entries.length, xs.entries.length); i++) {
            ys.push(this.entries[i] ^ xs.entries[i]);
        }
        if (this.entries.length > xs.entries.length) {
            ys = ys.concat(this.entries.slice(i));
        } else if (this.entries.length < xs.entries.length) {
            ys = ys.concat(xs.entries.slice(i));
        }
        let zs = new IntSet(Math.max(this.size, xs.size));
        zs.entries = ys;
        return zs;
    };
    this.difference = function differenceIntSet(xs) {
        return this.intersection(this.symmetricDifference(xs));
    };
    this.toArray = function toArrayIntSet() {
        let result = [];
        this.entries.forEach(function(entry, entryIndex) {
            for (let i = 0; entry !== 0; i++) {
                if (entry & 1 === 1) {
                    result.push(i + (entryIndex * INTSIZE));
                }
                entry = entry >> 1;
            }
        });
        return result;
    };
    this.isEmpty = function isEmptyIntSet() {
        let acc = 0;
        for (const entry of this.entries) {
            acc = acc | entry;
        }
        return acc === 0;
    };
}
