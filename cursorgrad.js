const dotSize = 10;

if (!document.getElementById('gradient-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'gradient-overlay';
    document.body.appendChild(overlay);
}

function move(event) {
    const x = event.clientX / window.innerWidth * 100;
    const y = event.clientY / window.innerHeight * 100;
    document.getElementById('gradient-overlay').style.background = 
        `radial-gradient(circle at ${x}% ${y}%, #ffd519 0%, rgba(112,45,194,0) 2%)`;
}

document.addEventListener('mousemove', move);