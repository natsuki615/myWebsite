let y = canvas.height;
let radius = Math.max(canvas.width, canvas.height);
const speed = 20;

function animateSemiCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width/2, y, radius, 0, 2*Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = "#ffd519";
    ctx.fill();
    ctx.restore();

    if (radius > 0) {
        radius -= speed;
        requestAnimationFrame(animateSemiCircle);
    } else {
        canvas.parentNode.removeChild(canvas);
    }
}