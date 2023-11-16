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
    });

    const canvas = document.getElementById('canvas');

    for (let i = 0; i < SQUARE; i++) {
        const block = document.createElement('div');
        block.style.width = `${100 / SIDE}%`;
        block.style.height = `${100 / SIDE}%`;
        block.addEventListener('mousemove', function() {
            if (clicking) {
                this.style.background = lastColor;
            }
        });
        canvas.appendChild(block);
    }

    document.getElementById('picker').addEventListener('change', function(e) {
        lastColor = e.target.value;
    });
}
