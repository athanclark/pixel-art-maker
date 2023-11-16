const SIDE = 50;
const SQUARE = SIDE * SIDE;


window.onload = function() {
    let lastColor = document.getElementById('picker').value;
    let clicking = false;

    document.addEventListener('mousedown', function(e) {
        clicking = true;
        e.preventDefault();
    });
    document.addEventListener('mouseup', function(e) {
        clicking = false;
        e.preventDefault();
        let blocks = [];
        for (const block of document.querySelectorAll('#canvas > div')) {
            blocks.push(block.style.background);
        }
        window.localStorage.setItem('canvas', JSON.stringify(blocks));
    });

    const canvas = document.getElementById('canvas');
    const prevBlocks = JSON.parse(window.localStorage.getItem('canvas'));

    const createBlock = function createBlock(bg) {
        const block = document.createElement('div');
        block.style.width = `${100 / SIDE}%`;
        block.style.height = `${100 / SIDE}%`;
        block.style.background = bg;
        block.addEventListener('mousemove', function() {
            if (clicking) {
                this.style.background = lastColor;
            }
        });
        canvas.appendChild(block);
    };

    if (prevBlocks) {
        for (const blockBg of prevBlocks) {
            createBlock(blockBg);
        }
    } else {
        for (let i = 0; i < SQUARE; i++) {
            createBlock(lastColor);
        }
    }

    document.getElementById('picker').addEventListener('change', function(e) {
        lastColor = e.target.value;
    });
}

