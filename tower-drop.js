// Tower Drop - גרסה משולבת של המשחק המקורי Helix Jump

// =================================================================
// קוד זה נועד לרוץ בתוך קובץ HTML יחיד.
// יש להוסיף אלמנט canvas עם id="gameCanvas"
// =================================================================

// משתנים גלובליים
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth * 0.8;
let height = window.innerHeight * 0.8;
canvas.width = width;
canvas.height = height;

// פונטים
const fonts = [
    new FontFace('calibri Bold', 'url(https://fonts.gstatic.com/s/calibri/v1/Calibri-Bold.ttf)'),
    new FontFace('arial black Bold Italic', 'url(https://fonts.gstatic.com/s/arialblack/v1/ArialBlack-Regular.ttf)'),
    new FontFace('arial black Bold', 'url(https://fonts.gstatic.com/s/arialblack/v1/ArialBlack-Regular.ttf)')
];

// טעינת פונטים (נדרש עבור HTML canvas)
Promise.all(fonts.map(font => font.load())).then(() => {
    document.fonts.add(fonts[0]);
    document.fonts.add(fonts[1]);
    document.fonts.add(fonts[2]);
    main();
}).catch(console.error);

// Leaderboard - הועתק מהקובץ המקורי
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

// פונקציה למיון טבלת הניקוד
const sortArr = (arr, ind) => {
    arr.sort((a, b) => b[ind] - a[ind]);
};
sortArr(leaderboard, 1);

// Preliminary configurations
let scenes = [true, false, false, false]; // [menu, play, leaderboard, credits]
let verify = 0;

// Thumbnail (לא מיושם באופן מלא בגרסה הזו, אבל מוזכר כדי לשמור על הארכיטקטורה)
let thumbnail, getThumb = "";

// Image for pillar (לא מיושם בגרסה זו, הוחלף בציור פשוט)
let Ellipse, ShadeEllipse;

// Color schemes - הועתק מהקובץ המקורי
const palettes = [
    [color(255, 255, 255), color(249, 241, 219), color(252, 213, 129), color(213, 41, 65), color(153, 13, 53)],
    [color(248, 244, 227), color(255, 137, 102), color(42, 43, 42), color(112, 108, 157), color(229, 68, 109)],
    [color(255, 228, 250), color(225, 218, 189), color(71, 99, 152), color(141, 200, 178), color(255, 196, 35)],
    [color(249, 234, 225), color(19, 190, 156), color(170, 153, 143), color(204, 139, 134), color(125, 79, 80)],
    [color(228, 214, 167), color(200, 130, 196), color(28, 17, 10), color(80, 162, 167), color(155, 41, 21)],
    [color(165, 196, 212), color(123, 109, 141), color(73, 59, 42), color(132, 153, 177), color(85, 42, 47)],
    [color(250, 248, 243), color(243, 209, 199), color(10, 18, 30), color(255, 128, 127), color(222, 182, 171)],
    [color(255, 245, 229), color(206, 177, 133), color(255, 219, 151), color(254, 95, 85), color(254, 230, 230)],
    [color(255, 255, 255), color(255, 255, 255), color(0, 0, 0), color(199, 199, 199), color(0, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(255, 255, 255), color(0, 0, 0), color(0, 0, 0)],
    [color(220, 235, 255), color(219, 247, 249), color(61, 84, 129), color(117, 166, 194), color(255, 20, 120)],
    [color(255, 243, 236), color(248, 232, 210), color(255, 108, 145), color(255, 183, 140), color(255, 230, 140)],
    [color(255, 255, 255), color(255, 255, 255), color(0, 0, 0), color(0, 0, 0), color(255, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(0, 0, 0), color(255, 255, 255), color(0, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(0, 0, 0), color(140, 255, 140), color(255, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(0, 0, 0), color(170, 170, 170), color(0, 0, 0)],
    [color(255, 255, 255), color(255, 255, 255), color(0, 0, 0), color(0, 0, 0), color(255, 0, 0)],
    [color(255, 255, 255), color(181, 148, 117), color(255, 249, 222), color(255, 145, 119), color(255, 249, 222)],
    [color(255, 255, 255), color(255, 255, 255), color(0, 0, 0), color(0, 0, 0), color(255, 0, 0)],
];
let Cur_Pal = 0; // The original game starts with a random palette, we'll start with 0 for simplicity

// אובייקט השחקן, שעוצב מחדש ככדור
let player = {
    x: width / 2,
    y: height / 4,
    jump: 0,
    gravity: 0.6,
    score: 0,
    highscore: 0,
    onPlatform: false,
    radius: 10,
    color: '#00bcd4'
};

// שכבות פלטפורמות, עוצבו מחדש כגלגלי שיניים
let layers = [];
let numLayers = 15;
let layerSpacing = height / 5;
let rotationAngle = 0;

// פונקציות עזר (בסיסיות לציור)
function color(r, g, b, a = 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function fill(r, g, b, a = 1) {
    ctx.fillStyle = color(r, g, b, a);
}
function background(r, g, b) {
    ctx.fillStyle = color(r, g, b);
    ctx.fillRect(0, 0, width, height);
}
function textFont(font, size) {
    ctx.font = `${size}px ${font}`;
}
function textAlign(h, v) {
    ctx.textAlign = h;
    ctx.textBaseline = v;
}
function Text(text, x, y, c) {
    ctx.fillStyle = c;
    const lines = text.split('\n');
    let lineHeight = parseInt(ctx.font) * 1.2;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineHeight);
    }
}
function rect(x, y, w, h) {
    ctx.fillRect(x, y, w, h);
}
function ellipse(x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
}

// פונקציה להצגת הודעה (במקום alert())
function showMessage(text) {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    if (messageBox && messageText) {
        messageText.textContent = text;
        messageBox.style.display = 'block';
    }
}

// פונקציה לאתחול המשחק
function setup() {
    player.highscore = localStorage.getItem('towerdrop_highscore') || 0;
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

// פונקציה ליצירת שכבת פלטפורמה
function createLayer(index) {
    let layer = {
        y: height / 2 + index * layerSpacing,
        angle: 0,
        isHazard: false,
        isSpawn: index === 0,
        gapAngle: Math.random() * 2 * Math.PI
    };

    if (index > 0 && Math.random() < 0.3) {
        layer.isHazard = true;
    }

    return layer;
}

// עדכון צבעים לפי פלטה חדשה
function updateColors() {
    const p = palettes[Cur_Pal];
    player.color = p[3];
}

// ציור שכבת פלטפורמה (גלגל שיניים)
function drawLayer(layer) {
    let numSegments = 16;
    let gapSize = Math.PI / 8;
    let segmentAngle = (2 * Math.PI) / numSegments;
    let radius = 100;
    let innerRadius = 70;

    ctx.save();
    ctx.translate(width / 2, layer.y);
    ctx.rotate(layer.angle);

    for (let i = 0; i < numSegments; i++) {
        let startAngle = i * segmentAngle;
        let endAngle = startAngle + segmentAngle;
        let isGap = (startAngle >= layer.gapAngle && endAngle <= layer.gapAngle + gapSize);

        if (!isGap) {
            ctx.beginPath();
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.arc(0, 0, innerRadius, endAngle, startAngle, true);
            ctx.closePath();

            ctx.fillStyle = layer.isHazard ? palettes[Cur_Pal][4] : palettes[Cur_Pal][1];
            ctx.fill();
        }
    }
    ctx.restore();
}

// ציור השחקן (כדור)
function drawBall(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.fill();
}

// ציור הניקוד
function drawScore() {
    ctx.fillStyle = palettes[Cur_Pal][0];
    ctx.font = `bold 48px 'arial black Bold'`;
    ctx.textAlign = 'center';
    ctx.fillText(player.score, width / 2, 80);

    ctx.font = `bold 24px 'arial black Bold'`;
    ctx.fillText("Highscore: " + player.highscore, width / 2, 120);
}

// בדיקת התנגשות
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
                // נפל לתוך הרווח
            } else {
                if (layer.isHazard) {
                    showMessage("Game Over! Score: " + player.score);
                    scenes = [false, false, false, false];
                    scenes[0] = true;
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

// מסך תפריט ראשי
function MenuScene() {
    background(...palettes[Cur_Pal][2].replace(/[rgba() ]/g, '').split(',').map(Number).slice(0, 3));
    
    ctx.fillStyle = palettes[Cur_Pal][0];
    ctx.font = `bold 80px 'arial black Bold'`;
    ctx.textAlign = 'center';
    ctx.fillText("Tower Drop", width / 2, height / 2 - 150);

    // כפתור Play
    ctx.fillStyle = palettes[Cur_Pal][1];
    ctx.fillRect(width / 2 - 100, height / 2, 200, 50);
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.font = `bold 30px 'arial black Bold'`;
    ctx.fillText("Play", width / 2, height / 2 + 25);
    
    // כפתור Leaderboard
    ctx.fillStyle = palettes[Cur_Pal][1];
    ctx.fillRect(width / 2 - 100, height / 2 + 70, 200, 50);
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.font = `bold 30px 'arial black Bold'`;
    ctx.fillText("Leaderboard", width / 2, height / 2 + 95);

    // כפתור Credits
    ctx.fillStyle = palettes[Cur_Pal][1];
    ctx.fillRect(width / 2 - 100, height / 2 + 140, 200, 50);
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.font = `bold 30px 'arial black Bold'`;
    ctx.fillText("Credits", width / 2, height / 2 + 165);
}

// מסך Leaderboard
function Leaderboard() {
    background(...palettes[Cur_Pal][2].replace(/[rgba() ]/g, '').split(',').map(Number).slice(0, 3));

    ctx.fillStyle = palettes[Cur_Pal][0];
    ctx.font = `bold 60px 'arial black Bold'`;
    ctx.textAlign = 'center';
    ctx.fillText("Leaderboard", width / 2, 50);

    ctx.font = `20px 'calibri Bold'`;
    ctx.textAlign = 'left';
    ctx.fillStyle = palettes[Cur_Pal][0];

    for(let i = 0; i < 15 && i < leaderboard.length; i++) {
        const entry = leaderboard[i];
        ctx.fillText(`${i + 1}. ${entry[0]}`, width / 2 - 150, 100 + i * 25);
        ctx.textAlign = 'right';
        ctx.fillText(`${entry[1]}`, width / 2 + 150, 100 + i * 25);
        ctx.textAlign = 'left';
    }

    // כפתור חזרה
    ctx.fillStyle = palettes[Cur_Pal][1];
    ctx.fillRect(width / 2 - 100, height - 80, 200, 50);
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.font = `bold 30px 'arial black Bold'`;
    ctx.fillText("Back", width / 2, height - 55);
}

// מסך קרדיטים
function Credits() {
    background(...palettes[Cur_Pal][2].replace(/[rgba() ]/g, '').split(',').map(Number).slice(0, 3));

    ctx.fillStyle = palettes[Cur_Pal][0];
    ctx.font = `bold 60px 'arial black Bold'`;
    ctx.textAlign = 'center';
    ctx.fillText("Credits", width / 2, 100);

    ctx.font = `24px 'calibri Bold'`;
    ctx.textAlign = 'center';
    ctx.fillStyle = palettes[Cur_Pal][0];
    
    const creditsText = `ALL CODE BY\n    ARROWHEAD CO.\n\nBased on\nHELIX JUMP by\n    VOODOO`;
    Text(creditsText, width / 2, height / 2, palettes[Cur_Pal][0]);

    // כפתור חזרה
    ctx.fillStyle = palettes[Cur_Pal][1];
    ctx.fillRect(width / 2 - 100, height - 80, 200, 50);
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.font = `bold 30px 'arial black Bold'`;
    ctx.fillText("Back", width / 2, height - 55);
}

// לולאת המשחק הראשית
function gameLoop() {
    ctx.clearRect(0, 0, width, height);
    
    // ציור הרקע
    const bgColor = palettes[Cur_Pal][2].replace(/[rgba() ]/g, '').split(',').map(Number).slice(0, 3);
    background(bgColor[0], bgColor[1], bgColor[2]);

    // ציור המסכים השונים
    if (scenes[1]) { // Play scene
        for (let layer of layers) {
            drawLayer(layer);
        }
        drawBall(player.x, player.y, player.radius, player.color);
        drawScore();

        // פיזיקת השחקן
        player.y += player.jump;
        player.jump += player.gravity;

        if (player.onPlatform && player.jump < 0) {
            for (let layer of layers) {
                layer.y -= player.jump * 1.5;
            }
        }

        if (layers[0].y > height + layerSpacing) {
            layers.shift();
            layers.push(createLayer(numLayers));
            Cur_Pal = (Cur_Pal + 1) % palettes.length; // שינוי פלטת צבעים
            updateColors();
        }
        checkCollision();

        if (player.y > height) {
            showMessage("Game Over! Score: " + player.score);
            scenes = [true, false, false, false];
            setup();
            return;
        }

        rotationAngle *= 0.9;
        layers.forEach(layer => layer.angle += rotationAngle);
    } else {
        if (scenes[0]) {
            MenuScene();
        }
        if (scenes[2]) {
            Leaderboard();
        }
        if (scenes[3]) {
            Credits();
        }
    }

    requestAnimationFrame(gameLoop);
}

// טיפול בקלט מהמשתמש (מקשים, מגע, לחיצות עכבר)
document.addEventListener('keydown', (e) => {
    if (scenes[1]) {
        if (e.key === 'ArrowLeft') {
            rotationAngle = -0.1;
        } else if (e.key === 'ArrowRight') {
            rotationAngle = 0.1;
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
        rotationAngle = diff > 0 ? -0.1 : 0.1;
        touchStartX = touchEndX;
    }
});
document.addEventListener('touchend', () => {
    touchStartX = null;
});

// טיפול בלחיצות עכבר על כפתורי התפריט
document.addEventListener('click', (e) => {
    if (scenes[0]) { // Menu
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

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
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height - 80 && mouseY < height - 30) {
            scenes = [true, false, false, false];
        }
    }
});

function main() {
    setup();
}
