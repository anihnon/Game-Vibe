// game-script.js - כל לוגיקת המשחק עבור Tower Drop בעברית

// =================================================================
// קובץ זה נועד לעבוד עם קובץ HTML המכיל
// קנבס עם ה-ID 'gameCanvas'.
// =================================================================

// משתנים גלובליים
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth > 600 ? window.innerWidth * 0.8 : window.innerWidth * 0.95;
let height = window.innerHeight > 800 ? window.innerHeight * 0.8 : window.innerHeight * 0.9;
canvas.width = width;
canvas.height = height;

// הגדרות כלליות
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const fonts = ['Varela Round', 'arial black Bold Italic', 'arial black Bold'];

let scenes = [true, false, false, false]; // [menu, play, leaderboard, credits]

// משתנים של המשחק
let ball, platforms, score, isGameOver;
let rotationSpeed = 0;
let towerRotation = 0;
const GRAVITY = 0.5;

// נתוני לוח תוצאות
const leaderboard = [
    ["חברת Arrowhead", 13649],
    ["איתן בוטה", 2324],
    ["🐧 מר פינגווין2 🐧", 4401],
    ["דוגל הרוקד", 5599],
    ["צונאמון", 1200],
    ["noahware", 74655],
    ["קלייטון", 46587],
    ["קוכנדורפר,זאכרי", 20134],
    ["כריס316213", 2326],
    ["טייל כוכבים", 5039],
    ["מקודד ברק", 2267],
    ["Thanksbeardgod", 3789],
    ["CHRISTIAN SCHOOL TRY HARD", 7160],
    ["WWescoat", 5128],
    ["דוד ג'יי אלן", 3821],
    ["מקס וויטן", 3338],
    ["20khagerty", 11169],
    ["megamanwhiz", 13124],
    ["המתנקש", 61723],
    ["גריי סטריקלנד", 4898],
    ["ראף", 5395],
    ["20khagerty", 108821],
    ["PriSSSSM", 4456],
    ["מתיאס מ'", 11904],
    ["HaZard_Luke", 27777],
    ["כלב טיילור", 15028],
    ["מריה אלכס", 23588],
    ["אלי סקסטון", 13232],
    ["GrantGoins", 46588],
    ["בריידי בירד", 1929],
    ["iHack", 2145],
    ["timestruck", 1827],
    ["PanGalacticGargleBlaster", 6197],
    ["נאלין תאודור", 2072],
    ["Programster", 29080],
    ["Imgbrentlinger", 5718],
    ["אקיבה רוזנברג", 65583],
    ["HoneyBadger1015", 61456],
    ["Jcofield.o", 17115],
    ["Bowtieman", 72190],
    ["דילן721668", 6694],
    ["מחשב?", 125670],
    ["סלמנדר מניאקס YT", 65576],
    ["ניקיאן", 33740],
    ["braxtonbailey", 65386],
    ["המתכנת מספר 1🥔", 88321],
    ["עצב גדול", 62055],
    ["אוסטין", 43236],
    ["WWescoat", 9325],
    ["מני בניטז", 5559],
    ["רוברט מקנזי", 19898],
    ["דגלמנט", 7824],
    ["angel.cruz", 40198],
    ["ACAlfredo", 1544],
    ["דביון רניר", 6113],
    ["דקלאן רוס", 559],
    ["אנדרו קאר", 3611],
    ["בחור מגניב 24", 6552],
    ["misaboo918", 14925],
    ["bcruse12", 4880],
    ["xxxtentacion", 14891],
    ["למפוני סניקט", 5000],
    ["איידן", 4276],
    ["איתן לי", 20937],
    ["נח", 7785],
    ["siddadi1819", 4222],
    ["ג'יי רמירז", 1653],
    ["anandb", 1578],
    ["noarwhalmoo", 8173],
    ["איתן קרפינטרו", 3157],
    ["511Slloth", 4699],
    ["ברון דמים", 7383],
    ["הנרי מק'קיון3", 7649],
    ["jelly135", 15934],
    ["culobCoder", 30567],
    ["סמסון נוובי", 80921],
    ["מקודד ברק", 13198],
    ["קטשופ נוזלי", 1772],
    ["דקלאן גיבסון", 2118],
    ["DaZe_sneenzy", 2377],
    ["אור בחושך", 4114],
    ["ק' ג'", 1712],
    ["erand05", 5130],
    ["אנגוס מק'גייבר", 5916],
    ["CAMREN ALEXZANDER HUDSON", 8577],
    ["jedielijaho0", 125890],
    ["AnimTheTree", 5054],
    ["אמילי ג'י רידנור", 7038],
    ["קיקי נואל", 1438],
    ["~המתכנת של תיבת הדואר~", 1355],
    ["קוכנדורפר.זאקרי", 40751],
    ["וולף סטודיו", 4867],
    ["hmcknight01", 9685],
    ["ג'רמי", 5008],
    ["אליהו", 3998],
    ["ג'יי רוזה", 1756],
    ["הריסון פ. סבאסקו", 9127],
    ["הוטרוד", 14567],
    ["בחור אקראי", 91094],
    ["ג'וש", 71234],
    ["מוצא", 10919],
    ["סייה", 6407],
    ["רואהם", 2268],
    ["CubsFan41", 2515],
    ["בני", 13735],
    ["מלך החרבות", 9168],
    ["אלכסנדר או'", 17030],
    ["ג'יליאן", 196],
    ["רבקה ר'", 1243],
    ["ישראל", 11532],
    ["מר. ג'יי מתכנת", 4851],
    ["אוטום סטאר", 929],
    ["הפקות Kingslay", 2113],
    ["₱ⱤØ₲Ɽ₳₥₥ł₦₲ ₭ł₦₲", 114898],
    ["👑👑👑אדאיר סאנצ'ז👑👑", 11657],
    ["T̵̢̹̤͑̌h̵̗̹̞͉̼̠̲̚ę̸̩̼̘̀̐͜͝n̴͎̼̜͙̜̻̾̑̋̔r̸͎̬̱̻͚̓̋̊͊͝y̵̫̓̉̑͗̈́", 5238],
    ["מר. לימונים", 2951],
    ["ברווז דינו", 10679],
    ["benyaminaharon739", 109724],
    ["ツ🅷🅰🅲🅺🅴🆁 🅿🆁🅾🅳", 1342],
    ["❄נער הקרחון❄", 4187],
    ["𝕀ℕ𝔽𝕀𝕃𝕋ℝ𝔸𝕋𝕀𝕆ℕ", 4340],
];

// פונקציית מיון לוח התוצאות
const sortArr = (arr, ind) => {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j][ind] >= arr[i][ind]) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                if (arr[j][0] === arr[i][0]) {
                    arr.splice(i, 1);
                }
            }
        }
    }
};
sortArr(leaderboard, 1);

// צבעים
const palettes = [
    // עמוד מרכזי, צבע פלטפורמה, רקע, כדור, לבה
    ['#FFFFFF', '#F9F1DB', '#FCD581', '#D52941', '#990D35'],
    ['#F8F4E3', '#FF8966', '#2A2B2A', '#706C9D', '#E5446D'],
    ['#FFE4FA', '#E1DABD', '#476398', '#8DC8B2', '#FFC423'],
    ['#F9EAE1', '#13BE9C', '#AA998F', '#CC8B86', '#7D4F50'],
    ['#E4D6A7', '#C882C4', '#1C110A', '#50A2A7', '#9B2915'],
    ['#A5C4D4', '#7B6D8D', '#493B2A', '#8499B1', '#593F62'],
    ['#FFEEF2', '#FFC8FB', '#595758', '#B9BCDF', '#FF92C2'],
    ['#FFFDFD', '#F0E100', '#0B3C49', '#B7BEDC', '#7D236D'],
    ['#CB793A', '#9A031E', '#321325', '#5F0F40', '#FCDD4D'],
    ['#B2DDF7', '#4CB5AE', '#64B4C8', '#CAC8C8', '#FF203E'],
    ['#B2DDF7', '#306BAC', '#141B41', '#0B9CEB', '#918EF4'],
    ['#E8E9F3', '#B1E5F2', '#272635', '#A6A6A8', '#C8C8C8'],
    ['#F7FFDD', '#DBA159', '#E8E99B', '#EFC880', '#D0E3CC'],
    ['#0074C4', '#D65108', '#EFa00b', '#EFa00b', '#591F0A'],
    ['#F0E7D8', '#A63A50', '#B19B96', '#BA6E6E', '#C9DF4A'],
    ['#F6D8AE', '#F4D35E', '#2E4057', '#083D77', '#DA4167'],
    ['#F1F2EB', '#566246', '#4A4A48', '#A4C2A5', '#D8DA98'],
    ['#FFC2E2', '#6E44FF', '#B892FF', '#FF90B3', '#EF7A85'],
    ['#E4DFDA', '#731DC8', '#C1666B', '#48A9A6', '#D4B483'],
    ['#EFC4AC', '#432534', '#283D65', '#365855', '#C44900'],
];

let Cur_Pal = 0; // פלטת הצבעים הנוכחית

// הגדרת המשחק מחדש
function setup() {
    ball = {
        x: width / 2,
        y: height * 0.1,
        radius: 15,
        speedY: 0,
        isJumping: false,
    };
    platforms = [];
    score = 0;
    isGameOver = false;
    towerRotation = 0;

    // יצירת פלטפורמות
    for (let i = 0; i < 15; i++) {
        createPlatform(height - 100 - i * 150);
    }
}

// יצירת פלטפורמה בודדת
function createPlatform(y) {
    const segments = [];
    const numSegments = 10;
    const dangerousSegment = Math.floor(Math.random() * numSegments);
    const startAngle = Math.random() * 2 * Math.PI;

    for (let i = 0; i < numSegments; i++) {
        const isDangerous = i === dangerousSegment;
        segments.push({
            startAngle: startAngle + i * (2 * Math.PI / numSegments),
            endAngle: startAngle + (i + 1) * (2 * Math.PI / numSegments) - 0.2,
            isDangerous: isDangerous,
        });
    }
    platforms.push({ y, segments, rotation: 0 });
}

// פונקציות ציור
function drawButton(text, x, y, buttonWidth, buttonHeight, color, textColor) {
    ctx.fillStyle = color;
    ctx.fillRect(x - buttonWidth / 2, y, buttonWidth, buttonHeight);
    ctx.fillStyle = textColor;
    ctx.font = '24px Varela Round';
    ctx.fillText(text, x, y + buttonHeight / 2);
}

function drawMenu() {
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '60px arial black Bold';
    ctx.fillText("Tower Drop", width / 2, height / 4);

    drawButton("התחל משחק", width / 2, height / 2, 200, 50, 'green', 'white');
    drawButton("לוח תוצאות", width / 2, height / 2 + 70, 200, 50, 'blue', 'white');
    drawButton("קרדיטים", width / 2, height / 2 + 140, 200, 50, 'purple', 'white');
}

function drawLeaderboard() {
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '40px arial black Bold';
    ctx.fillText("לוח תוצאות", width / 2, 50);

    ctx.font = '20px Varela Round';
    for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
        const [name, score] = leaderboard[i];
        ctx.fillText(`${i + 1}. ${name}: ${score}`, width / 2, 120 + i * 30);
    }

    drawButton("חזור", width / 2, height - 80, 200, 50, 'gray', 'white');
}

function drawCredits() {
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '40px arial black Bold';
    ctx.fillText("קרדיטים", width / 2, 50);
    ctx.font = '20px Varela Round';
    ctx.fillText("כל הקוד נכתב על ידי Game Vibe", width / 2, 165);

    drawButton("חזור", width / 2, height - 80, 200, 50, 'gray', 'white');
}

function drawPlayScene() {
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.fillRect(0, 0, width, height);
    
    // ציור המגדל
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(towerRotation);
    ctx.translate(-width / 2, -height / 2);
    
    // ציור הפלטפורמות
    platforms.forEach(platform => {
        ctx.beginPath();
        const innerRadius = 70;
        const outerRadius = 150;
        
        platform.segments.forEach(segment => {
            const segmentColor = segment.isDangerous ? palettes[Cur_Pal][4] : palettes[Cur_Pal][1];
            ctx.fillStyle = segmentColor;
            
            ctx.beginPath();
            ctx.arc(width / 2, platform.y, outerRadius, segment.startAngle, segment.endAngle);
            ctx.arc(width / 2, platform.y, innerRadius, segment.endAngle, segment.startAngle, true);
            ctx.closePath();
            ctx.fill();
        });
    });
    
    // ציור המוט המרכזי
    ctx.fillStyle = palettes[Cur_Pal][0];
    ctx.fillRect(width / 2 - 20, 0, 40, height);

    ctx.restore();

    // ציור הכדור
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = palettes[Cur_Pal][3];
    ctx.fill();

    // ציור ציון
    ctx.fillStyle = 'white';
    ctx.font = '30px Varela Round';
    ctx.fillText(`ניקוד: ${score}`, width / 2, 30);
    
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.font = '50px arial black Bold';
        ctx.fillText("המשחק נגמר!", width / 2, height / 2 - 50);
        ctx.font = '30px Varela Round';
        ctx.fillText(`הניקוד שלך: ${score}`, width / 2, height / 2);
        drawButton("התחל מחדש", width / 2, height / 2 + 50, 200, 50, 'green', 'white');
    }
}

// לולאת המשחק הראשית
function gameLoop() {
    if (scenes[0]) {
        drawMenu();
    } else if (scenes[1]) {
        if (!isGameOver) {
            update();
        }
        drawPlayScene();
    } else if (scenes[2]) {
        drawLeaderboard();
    } else if (scenes[3]) {
        drawCredits();
    }
    requestAnimationFrame(gameLoop);
}

// עדכון לוגיקת המשחק
function update() {
    // תנועת הכדור
    ball.speedY += GRAVITY;
    ball.y += ball.speedY;

    // תנועת המגדל
    towerRotation += rotationSpeed;
    rotationSpeed *= 0.95; // האטה סיבובית

    // בדיקת התנגשויות
    platforms.forEach(platform => {
        // בדיקה רק אם הכדור נמצא בקרבת הפלטפורמה
        if (ball.y + ball.radius >= platform.y && ball.y + ball.radius <= platform.y + 10) {
            
            // המרת זווית הכדור לזווית יחסית למגדל
            const ballAngle = Math.atan2(ball.y - platform.y, ball.x - width / 2) - towerRotation;
            let normalizedBallAngle = (ballAngle + 2 * Math.PI) % (2 * Math.PI);
            
            // בדיקת התנגשות עם סגמנטים
            platform.segments.forEach(segment => {
                const segmentEnd = segment.endAngle;
                const segmentStart = segment.startAngle;
                
                // בדיקה אם הכדור נמצא בתוך סגמנט
                if (normalizedBallAngle > segmentStart && normalizedBallAngle < segmentEnd) {
                    if (segment.isDangerous) {
                        isGameOver = true;
                    } else {
                        // התנגשות עם סגמנט בטוח
                        ball.speedY = -15; // קפיצה
                        score += 10;
                    }
                }
            });
        }
    });

    // בדיקת נפילה מחוץ למסך
    if (ball.y > height) {
        isGameOver = true;
    }
}

// טפל בסיבוב המגדל באמצעות עכבר/מגע
let touchStartX = null;
let lastMouseX = null;

canvas.addEventListener('mousedown', (e) => {
    lastMouseX = e.clientX;
});

canvas.addEventListener('mousemove', (e) => {
    if (lastMouseX !== null && scenes[1]) {
        const deltaX = e.clientX - lastMouseX;
        rotationSpeed = deltaX * 0.005; // מהירות סיבוב
        lastMouseX = e.clientX;
    }
});

canvas.addEventListener('mouseup', () => {
    lastMouseX = null;
});

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    if (touchStartX !== null && scenes[1]) {
        const deltaX = e.touches[0].clientX - touchStartX;
        rotationSpeed = deltaX * 0.005;
        touchStartX = e.touches[0].clientX;
    }
});

canvas.addEventListener('touchend', () => {
    touchStartX = null;
});

// טפל בקליקים של עכבר על כפתורי התפריט
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (scenes[0]) { // תפריט
        // כפתור התחל משחק
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 && mouseY < height / 2 + 50) {
            scenes = [false, true, false, false];
            setup();
        }
        // כפתור לוח תוצאות
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 70 && mouseY < height / 2 + 120) {
            scenes = [false, false, true, false];
        }
        // כפתור קרדיטים
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 140 && mouseY < height / 2 + 190) {
            scenes = [false, false, false, true];
        }
    } else if (scenes[1] && isGameOver) {
        // כפתור התחל מחדש
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 50 && mouseY < height / 2 + 100) {
            scenes = [true, false, false, false]; // חזרה לתפריט הראשי
        }
    } else if (scenes[2] || scenes[3]) { // כפתור חזור
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height - 80 && mouseY < height - 30) {
            scenes = [true, false, false, false];
        }
    }
});

// אתחל את לולאת המשחק
window.onload = function() {
    gameLoop();
}
