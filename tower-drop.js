// game-script.js - All game logic for Tower Drop

// =================================================================
// This script is designed to work with an HTML file that contains
// a canvas with the ID 'gameCanvas'.
// =================================================================

// Global variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth * 0.8;
let height = window.innerHeight * 0.8;
canvas.width = width;
canvas.height = height;

// Fonts (now loaded via CSS, so we just use the names)
const fonts = ['Varela Round', 'arial black Bold Italic', 'arial black Bold'];

// Leaderboard data
const leaderboard = [
    ["Arrowhead Co.", 13649],
    ["Ethan Botha", 2324],
    ["🐧 MrPenguin2 🐧", 4401],
    ["Dancing Doggle", 5599],
    ["Tsunamon", 1200],
    ["noahware", 74655],
    ["Clayton", 46587],
    ["Kochendorfer,Zachary", 20134],
    ["chris316213", 2326],
    ["Star Traveler", 5039],
    ["Lightning McCode", 2267],
    ["Thanksbeardgod", 3789],
    ["CHRISTIAN SCHOOL TRY HARD", 7160],
    ["WWescoat", 5128],
    ["DavidJAllen", 3821],
    ["MaxWhitten", 3338],
    ["20khagerty", 11169],
    ["megamanwhiz", 13124],
    ["ASSASSIN", 61723],
    ["Gray Strickland", 4898],
    ["raff", 5395],
    ["20khagerty", 108821],
    ["PriSSSSM", 4456],
    ["Matias M", 11904],
    ["HaZard_Luke", 27777],
    ["Caleb Taylor", 15028],
    ["Maria Alex", 23588],
    ["Ellie Sexton", 13232],
    ["GrantGoins", 46588],
    ["Brady Beard", 1929],
    ["iHack", 2145],
    ["timestruck", 1827],
    ["PanGalacticGargleBlaster", 6197],
    ["Nalin Theodore", 2072],
    ["Programster", 29080],
    ["Imgbrentlinger", 5718],
    ["Akiva Rosenberg", 65583],
    ["HoneyBadger1015", 61456],
    ["Jcofield.o", 17115],
    ["Bowtieman", 72190],
    ["Dylan721668", 6694],
    ["Computer?", 125670],
    ["Salamander Maniacs YT", 65576],
    ["Nikyan", 33740],
    ["braxtonbailey", 65386],
    ["The#1Pr🥔grammer", 88321],
    ["big sad", 62055],
    ["Austin", 43236],
    ["WWescoat", 9325],
    ["manny benitez", 5559],
    ["Robert McKenzie", 19898],
    ["Flagilament", 7824],
    ["angel.cruz", 40198],
    ["ACAlfredo", 1544],
    ["Devion Rennier", 6113],
    ["Declan Ross", 559],
    ["Andrew Karr", 3611],
    ["cool guy 24", 6552],
    ["misaboo918", 14925],
    ["bcruse12", 4880],
    ["xxxtentacion", 14891],
    ["Lampony Snicket", 5000],
    ["Aidan", 4276],
    ["Ethan Lee", 20937],
    ["Noah", 7785],
    ["siddadi1819", 4222],
    ["J.Ramirez", 1653],
    ["anandb", 1578],
    ["noarwhalmoo", 8173],
    ["Ethan Carpintero", 3157],
    ["511Slloth", 4699],
    ["BloodyBaron", 7383],
    ["HenryMcKeon3", 7649],
    ["jelly135", 15934],
    ["culobCoder", 30567],
    ["samson nwobi", 80921],
    ["LightningMc Code", 13198],
    ["LiquidKetchup", 1772],
    ["Declan Gibson", 2118],
    ["DaZe_sneenzy", 2377],
    ["Light in the Dark", 4114],
    ["K G", 1712],
    ["erand05", 5130],
    ["Angus MacGyver", 5916],
    ["CAMREN ALEXZANDER HUDSON", 8577],
    ["jedielijaho0", 125890],
    ["AnimTheTree", 5054],
    ["EmilyGRidenour", 7038],
    ["KikiNoelle", 1438],
    ["~The Mailbox Programmer~", 1355],
    ["Kochendorfer.Zackary", 40751],
    ["Wolf Studios", 4867],
    ["hmcknight01", 9685],
    ["Jeremy", 5008],
    ["elijah", 3998],
    ["Jay Rosa", 1756],
    ["Harrison P. Cevasco", 9127],
    ["Hotrod", 14567],
    ["A RANDOM GUY", 91094],
    ["Jo$h", 71234],
    ["Finder", 10919],
    ["Sye", 6407],
    ["Rohaam", 2268],
    ["CubsFan41", 2515],
    ["Benny", 13735],
    ["KingSwords", 9168],
    ["Alexander O.", 17030],
    ["Jilian", 196],
    ["Rebekah R.", 1243],
    ["Israel", 11532],
    ["Mr.JPrograms", 4851],
    ["AuttumStar", 929],
    ["Kingslay productions", 2113],
    ["₱ⱤØ₲Ɽ₳₥₥ł₦₲ ₭ł₦₲", 114898],
    ["👑👑👑Aidair Sanchez👑👑", 11657],
    ["T̵̢̹̤͑̌h̵̗̹̞͉̼̠̲̚ę̸̩̼̘̀̐͜͝n̴͎̼̜͙̜̻̾̑̋̔r̸͎̬̱̻͚̓̋̊͊͝y̵̫̓̉̑͗̈́", 5238],
    ["мя. Lємoиѕ", 2951],
    ["Duck Dino", 10679],
    ["benyaminaharon739", 109724],
    ["ツ🅷🅰🅲🅺🅴🆁 🅿🆁🅾🅳", 1342],
    ["❄PopsicleBoi❄", 4187],
    ["𝕀ℕ𝔽𝕀𝕃𝕋ℝ𝔸𝕋𝕀𝕆ℕ", 4340],
];

// Function to sort the leaderboard
const sortArr = (arr, ind) => {
    arr.sort((a, b) => b[ind] - a[ind]);
};
sortArr(leaderboard, 1);

// Preliminary configurations
let scenes = [true, false, false, false]; // [menu, play, leaderboard, credits]
let verify = 0;

// Color schemes - using a simplified, more modern palette
const palettes = [
    ['#FFFFFF', '#F6F6F6', '#FFA726', '#E53935', '#B71C1C'], // Warm
    ['#E0F7FA', '#B2EBF2', '#00ACC1', '#00796B', '#004D40'], // Cool
    ['#FFFDE7', '#FFECB3', '#FFC107', '#FF8F00', '#FF6F00'], // Yellow
    ['#E8EAF6', '#C5CAE9', '#7986CB', '#3F51B5', '#283593'], // Purple
    ['#FCE4EC', '#F48FB1', '#E91E63', '#C2185B', '#880E4F'], // Pink
];
let Cur_Pal = 0; // Starting palette

// Player object
let player = {
    x: width / 2,
    y: height / 4,
    jump: 0,
    gravity: 0.6,
    score: 0,
    highscore: localStorage.getItem('towerdrop_highscore') || 0,
    onPlatform: false,
    radius: 12, // slightly larger ball
    color: palettes[Cur_Pal][3]
};

// Layers of platforms
let layers = [];
let numLayers = 15;
let layerSpacing = height / 5;
let rotationSpeed = 0;

// Helper functions for drawing
function showMessage(text) {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    if (messageBox && messageText) {
        messageText.textContent = text;
        messageBox.classList.remove('hidden');
    }
}

// Function to initialize the game
function setup() {
    player.score = 0;
    player.onPlatform = false;
    player.y = height / 4;
    layers = [];

    for (let i = 0; i < numLayers; i++) {
        layers.push(createLayer(i));
    }
    updateColors();
    gameLoop();
}

// Function to create a platform layer
function createLayer(index) {
    let layer = {
        y: height / 2 + index * layerSpacing,
        angle: 0,
        isHazard: false,
        gapAngle: Math.random() * 2 * Math.PI
    };

    if (index > 0 && Math.random() < 0.3) {
        layer.isHazard = true;
    }
    return layer;
}

// Update colors based on a new palette
function updateColors() {
    player.color = palettes[Cur_Pal][3];
}

// Drawing a platform layer with a modern, gradient look
function drawLayer(layer) {
    const numSegments = 16;
    const gapSize = Math.PI / 8;
    const segmentAngle = (2 * Math.PI) / numSegments;
    const radius = 100;
    const innerRadius = 70;
    const p = palettes[Cur_Pal];

    ctx.save();
    ctx.translate(width / 2, layer.y);
    ctx.rotate(layer.angle);

    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        const isGap = (startAngle >= layer.gapAngle && endAngle <= layer.gapAngle + gapSize);

        if (!isGap) {
            ctx.beginPath();
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.arc(0, 0, innerRadius, endAngle, startAngle, true);
            ctx.closePath();

            const gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, radius);
            gradient.addColorStop(0, layer.isHazard ? p[4] : p[1]);
            gradient.addColorStop(1, layer.isHazard ? '#000000' : p[2]);

            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;
            ctx.fill();

            // Reset shadow for other elements
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        }
    }
    ctx.restore();
}

// Drawing the player (ball) with a simple shadow
function drawBall(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
}

// Drawing the score
function drawScore() {
    ctx.fillStyle = palettes[Cur_Pal][0];
    ctx.font = `bold 48px 'Varela Round'`;
    ctx.textAlign = 'center';
    ctx.fillText(player.score, width / 2, 80);

    ctx.font = `24px 'Varela Round'`;
    ctx.fillText("Highscore: " + player.highscore, width / 2, 120);
}

// Collision detection
function checkCollision() {
    player.onPlatform = false;
    for (let layer of layers) {
        let distance = Math.abs(player.y - layer.y);
        if (distance < player.radius + 10 && player.jump > 0) {
            let angle = Math.atan2(player.y - layer.y, player.x - width/2);
            let relativeAngle = (angle - layer.angle) % (2 * Math.PI);
            if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

            let gapSize = Math.PI / 8;
            let isGap = (relativeAngle >= layer.gapAngle && relativeAngle <= layer.gapAngle + gapSize);

            if (isGap) {
                // Fell through the gap
            } else {
                if (layer.isHazard) {
                    showMessage("Game Over! Score: " + player.score);
                    scenes = [true, false, false, false];
                    return;
                } else {
                    player.jump = -10;
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

// Main Menu Screen with styled buttons
function MenuScene() {
    const p = palettes[Cur_Pal];
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = p[1];
    ctx.font = `bold 80px 'Varela Round'`;
    ctx.textAlign = 'center';
    ctx.fillText("Tower Drop", width / 2, height / 2 - 150);

    drawButton("Play", width / 2, height / 2, 200, 50, p[3], p[0]);
    drawButton("Leaderboard", width / 2, height / 2 + 70, 200, 50, p[3], p[0]);
    drawButton("Credits", width / 2, height / 2 + 140, 200, 50, p[3], p[0]);
}

// Draw a styled button
function drawButton(text, x, y, w, h, bgColor, textColor) {
    ctx.save();
    ctx.translate(x, y);

    const cornerRadius = 25;
    ctx.beginPath();
    ctx.moveTo(-w/2 + cornerRadius, -h/2);
    ctx.arcTo(w/2, -h/2, w/2, h/2, cornerRadius);
    ctx.arcTo(w/2, h/2, -w/2, h/2, cornerRadius);
    ctx.arcTo(-w/2, h/2, -w/2, -h/2, cornerRadius);
    ctx.arcTo(-w/2, -h/2, w/2, -h/2, cornerRadius);
    ctx.closePath();

    ctx.fillStyle = bgColor;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = textColor;
    ctx.font = `bold 24px 'Varela Round'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
}

// Leaderboard Screen
function Leaderboard() {
    const p = palettes[Cur_Pal];
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = p[1];
    ctx.font = `bold 60px 'Varela Round'`;
    ctx.textAlign = 'center';
    ctx.fillText("Leaderboard", width / 2, 50);

    ctx.font = `20px 'Varela Round'`;
    ctx.textAlign = 'left';
    ctx.fillStyle = p[0];

    for(let i = 0; i < 15 && i < leaderboard.length; i++) {
        const entry = leaderboard[i];
        ctx.fillText(`${i + 1}. ${entry[0]}`, width / 2 - 150, 100 + i * 25);
        ctx.textAlign = 'right';
        ctx.fillText(`${entry[1]}`, width / 2 + 150, 100 + i * 25);
        ctx.textAlign = 'left';
    }

    drawButton("Back", width / 2, height - 50, 200, 50, p[3], p[0]);
}

// Credits Screen
function Credits() {
    const p = palettes[Cur_Pal];
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = p[1];
    ctx.font = `bold 60px 'Varela Round'`;
    ctx.textAlign = 'center';
    ctx.fillText("Credits", width / 2, 100);

    ctx.font = `24px 'Varela Round'`;
    ctx.textAlign = 'center';
    ctx.fillStyle = p[0];

    const creditsText = `ALL CODE BY\n    ARROWHEAD CO.\n\nBased on\nHELIX JUMP by\n    VOODOO`;
    const lines = creditsText.split('\n');
    let lineHeight = 28;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], width / 2, height / 2 - 50 + i * lineHeight);
    }

    drawButton("Back", width / 2, height - 50, 200, 50, p[3], p[0]);
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, width, height);

    // Draw the screens
    if (scenes[1]) { // Play scene
        for (let layer of layers) {
            drawLayer(layer);
        }
        drawBall(player.x, player.y, player.radius, player.color);
        drawScore();

        // Player physics
        player.y += player.jump;
        player.jump += player.gravity;

        if (player.onPlatform && player.jump < 0) {
            for (let layer of layers) {
                layer.y -= player.jump * 1.5;
            }
        }

        // Check if a new layer is needed
        if (layers[0].y > height + layerSpacing) {
            layers.shift();
            layers.push(createLayer(numLayers));
            Cur_Pal = (Cur_Pal + 1) % palettes.length; // Change palette
            updateColors();
        }

        checkCollision();

        // Check if player falls off the screen
        if (player.y > height) {
            showMessage("Game Over! Score: " + player.score);
            scenes = [true, false, false, false];
            setup();
            return;
        }

        rotationSpeed *= 0.9;
        layers.forEach(layer => layer.angle += rotationSpeed);
    } else {
        if (scenes[0]) {
            MenuScene();
        } else if (scenes[2]) {
            Leaderboard();
        } else if (scenes[3]) {
            Credits();
        }
    }

    requestAnimationFrame(gameLoop);
}

// Handle user input (keyboard, touch, mouse clicks)
document.addEventListener('keydown', (e) => {
    if (scenes[1]) {
        if (e.key === 'ArrowLeft') {
            rotationSpeed = -0.1;
        } else if (e.key === 'ArrowRight') {
            rotationSpeed = 0.1;
        }
    }
});

let touchStartX = null;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});
document.addEventListener('touchmove', (e) => {
    if (touchStartX === null || !scenes[1]) return;
    let touchEndX = e.touches[0].clientX;
    let diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 20) {
        rotationSpeed = diff > 0 ? -0.1 : 0.1;
        touchStartX = touchEndX;
    }
});
document.addEventListener('touchend', () => {
    touchStartX = null;
});

// Handle mouse clicks on menu buttons
document.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (scenes[0]) { // Menu
        // Play button
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 && mouseY < height / 2 + 50) {
            scenes = [false, true, false, false];
            setup();
        }
        // Leaderboard button
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 70 && mouseY < height / 2 + 120) {
            scenes = [false, false, true, false];
        }
        // Credits button
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 140 && mouseY < height / 2 + 190) {
            scenes = [false, false, false, true];
        }
    } else if (scenes[2] || scenes[3]) { // Back button
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height - 80 && mouseY < height - 30) {
            scenes = [true, false, false, false];
        }
    }
});

// Start the game on window load
window.onload = function() {
    setup();
};

window.onresize = function() {
    width = window.innerWidth * 0.8;
    height = window.innerHeight * 0.8;
    canvas.width = width;
    canvas.height = height;
};
