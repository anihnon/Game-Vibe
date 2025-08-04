// Tower Drop - גרסה מחודשת של משחק Helix Jump

// =========================================================
// קוד זה נועד לרוץ בתוך קובץ HTML רגיל.
// יש להוסיף לקובץ HTML את הקוד הבא:
// 1. אלמנט <canvas id="gameCanvas"></canvas>
// 2. קישור לקובץ JavaScript זה באמצעות <script src="your_script_name.js"></script>
// =========================================================

// משתנים גלובליים
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth * 0.8;
let height = window.innerHeight * 0.8;
canvas.width = width;
canvas.height = height;

// הגדרת פונט לשימוש בציור טקסט
const font_style = "bold 48px 'Arial Black'";

// אובייקט השחקן, שעוצב מחדש כיהלום
let player = {
    x: width / 2,
    y: height / 4,
    size: 15,
    jump: 0,
    gravity: 0.6,
    score: 0,
    highscore: 0,
    onPlatform: false,
    color: '#00bcd4' // צבע טורקיז
};

// שכבות פלטפורמות, עוצבו מחדש כגלגלי שיניים
let layers = [];
let numLayers = 15;
let layerSpacing = height / 5;
let currentLayer = 0;
let rotationAngle = 0;

// פלטות צבעים חדשות
let palettes = [
    ['#00bcd4', '#ffc107', '#f44336'], // טורקיז, ענבר, אדום (רגיל, בטיחות, סכנה)
    ['#3f51b5', '#4caf50', '#ffeb3b'], // אינדיגו, ירוק, צהוב
    ['#e91e63', '#607d8b', '#9c27b0']  // ורוד, אפור-כחלחל, סגול
];
let currentPalette = 0;

// פונקציה להצגת הודעה (במקום alert())
function showMessage(text) {
    // יש להוסיף אלמנט HTML עבור תיבת ההודעות
    // לדוגמה: <div id="messageBox"></div>
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.style.display = 'block';
        messageBox.textContent = text;
    }
}

// פונקציה לאתחול המשחק
function setup() {
    player.highscore = localStorage.getItem('towerdrop_highscore') || 0;
    player.score = 0;
    player.onPlatform = false;
    player.y = height / 4;
    layers = [];
    currentLayer = 0;

    for (let i = 0; i < numLayers; i++) {
        layers.push(createLayer(i));
    }
    updateColors();
    gameLoop();
}

// פונקציה ליצירת שכבת פלטפורמה
function createLayer(index) {
    let layer = {
        y: height / 2 + index * layerSpacing,
        angle: 0,
        color: '#ffc107',
        isHazard: false,
        isSpawn: index === 0
    };
    
    // יצירת קטע מסוכן באופן אקראי
    if (index > 0 && Math.random() < 0.3) {
        layer.isHazard = true;
    }
    
    return layer;
}

// עדכון צבעים לפי פלטה חדשה
function updateColors() {
    let p = palettes[currentPalette];
    player.color = p[0];
    for (let layer of layers) {
        layer.color = p[1];
        if (layer.isHazard) {
            layer.color = p[2];
        }
    }
}

// ציור שכבת פלטפורמה (גלגל שיניים)
function drawLayer(layer) {
    let numSegments = 16;
    let gapSize = Math.PI / 8; // זווית הרווח
    let segmentAngle = (2 * Math.PI) / numSegments;
    let radius = 100;
    let innerRadius = 70;

    ctx.save();
    ctx.translate(width / 2, layer.y);
    ctx.rotate(layer.angle);

    for (let i = 0; i < numSegments; i++) {
        let startAngle = i * segmentAngle;
        let endAngle = startAngle + segmentAngle;

        // ציור גלגל השיניים
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.arc(0, 0, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        
        // צביעה של גלגל השיניים
        let isGap = (startAngle >= Math.PI * 1.5 && endAngle <= Math.PI * 1.5 + gapSize) || (endAngle >= Math.PI * 1.5 && startAngle <= Math.PI * 1.5 + gapSize);

        if (layer.isHazard) {
            ctx.fillStyle = palettes[currentPalette][2];
        } else {
            ctx.fillStyle = palettes[currentPalette][1];
        }
        
        // ציור רווח
        if (!isGap) {
            ctx.fill();
        }
    }

    ctx.restore();
}

// ציור השחקן (יהלום)
function drawDiamond(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
}

// ציור הניקוד
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = font_style;
    ctx.textAlign = 'center';
    ctx.fillText(player.score, width / 2, 80);

    ctx.font = "bold 24px Arial";
    ctx.fillText("Highscore: " + player.highscore, width / 2, 120);
}

// בדיקת התנגשות
function checkCollision() {
    player.onPlatform = false;

    for (let layer of layers) {
        let distance = Math.abs(player.y - layer.y);
        // בדיקה מופשטת עבור התנגשות עם הפלטפורמה
        if (distance < player.size + 10 && player.jump > 0) {
            // הגיון התנגשות חדש שמותאם לגלגלי שיניים
            let angle = Math.atan2(player.y - layer.y, player.x - width/2);
            let relativeAngle = angle - layer.angle;

            if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

            let numSegments = 16;
            let gapSize = Math.PI / 8;
            let segmentAngle = (2 * Math.PI) / numSegments;
            
            let isGap = (relativeAngle >= Math.PI * 1.5 && relativeAngle <= Math.PI * 1.5 + gapSize);

            if (isGap) {
                // נפל לתוך הרווח, אין התנגשות
            } else {
                // התנגש בפלטפורמה
                if (layer.isHazard) {
                    // התנגש בקטע מסוכן
                    showMessage("Game Over! Score: " + player.score);
                    setup();
                    return;
                } else {
                    // התנגש בבטחה
                    player.jump = -10;
                    player.y = layer.y - 10 - player.size;
                    player.onPlatform = true;
                    player.score += 10;
                    if (player.score > player.highscore) {
                        player.highscore = player.score;
                        localStorage.setItem('towerdrop_highscore', player.highscore);
                    }
                }
            }
        }
    }
}
        
// לולאת המשחק הראשית
function gameLoop() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1e1e1e'; // רקע כהה
    ctx.fillRect(0, 0, width, height);

    for (let layer of layers) {
        drawLayer(layer);
    }

    drawDiamond(player.x, player.y, player.size, player.color);
    drawScore();

    // פיזיקת השחקן
    player.y += player.jump;
    player.jump += player.gravity;

    // הזזת הפלטפורמות למעלה
    if (player.onPlatform && player.jump < 0) {
        for (let layer of layers) {
            layer.y -= player.jump * 1.5;
        }
    }

    // יצירת שכבות חדשות
    if (layers[0].y > height + layerSpacing) {
        layers.shift();
        layers.push(createLayer(numLayers));
        currentLayer++;
        if (currentLayer % 5 === 0) {
            currentPalette = (currentPalette + 1) % palettes.length;
            updateColors();
        }
    }
    checkCollision();

    // תנאי לסיום המשחק
    if (player.y > height) {
        showMessage("Game Over! Score: " + player.score);
        setup();
        return;
    }

    // סיבוב פלטפורמות
    rotationAngle *= 0.9;
    layers.forEach(layer => layer.angle += rotationAngle);

    requestAnimationFrame(gameLoop);
}

// טיפול בקלט מהמשתמש (מקשים ומגע)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        rotationAngle = -0.1;
    } else if (e.key === 'ArrowRight') {
        rotationAngle = 0.1;
    }
});

let touchStartX = null;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchmove', (e) => {
    if (touchStartX === null) return;
    let touchEndX = e.touches[0].clientX;
    let diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 20) {
        rotationAngle = diff > 0 ? -0.1 : 0.1;
        touchStartX = touchEndX;
    }
});

document.addEventListener('touchend', () => {
    touchStartX = null;
});

// התחלת המשחק עם טעינת הדף
window.onload = function() {
    setup();
};

window.onresize = function() {
    width = window.innerWidth * 0.8;
    height = window.innerHeight * 0.8;
    canvas.width = width;
    canvas.height = height;
    player.x = width / 2;
    layers.forEach((layer, index) => {
        layer.y = height / 2 + index * layerSpacing;
    });
};

