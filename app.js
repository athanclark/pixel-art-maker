const SIDE = 50;
const SQUARE = SIDE * SIDE;


window.onload = function() {
    let lastColor = 'white';
    let clicking = false;

    document.addEventListener('mousedown', function(e) {
        clicking = true;
        e.preventDefault();
    });
    document.addEventListener('mouseup', function(e) {
        clicking = false;
        e.preventDefault();
    });

    const canvas = document.getElementById('canvas');

    for (let i = 0; i < SQUARE; i++) {
        const block = document.createElement('div');
        block.style.width = `${100 / SIDE}%`;
        block.style.height = `${100 / SIDE}%`;
        block.addEventListener('mousemove', function() {
            if (clicking) {
                this.className = lastColor;
            }
        });
        canvas.appendChild(block);
    }

    for (const color of document.querySelectorAll('#palette > div')) {
        color.addEventListener('click', function() {
            lastColor = this.className;
        });
    }
}
