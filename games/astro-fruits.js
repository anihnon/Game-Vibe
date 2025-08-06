// קוד Javascript מתוקן ומשופר למשחק "מבוך הפירות"
// הקוד הזה מיועד לשימוש יחד עם קובץ HTML שטוען את ספריית p5.js
// ובמיוחד עם קובץ ה-HTML ששלחת המכיל לחצנים מיוחדים.

// משתנים גלובליים עבור סקיצת p5.js
let gamePhase = 'intro'; // 'intro', 'playing', 'level_complete', 'game_over', 'instructions', 'achievements'
let startTime = 0;
let transitionAlpha = 1;
let pointerStyle = 0; // לגרפיקת הסמן
let activeKeys = {}; // מאחסן את המקשים הלחוצים כרגע
let spacePressed = false; // עוקב אם מקש הרווח נלחץ זה עתה
let jumpPressed = false; // עוקב אם מקש הקפיצה נלחץ זה עתה
let isMouseOut = false; // עוקב אם העכבר מחוץ לקנבס

let player;
let currentLevelData;
let platforms = [];
let collectibleFruits = [];
let exitPoint;

let totalFruitsCollected = 0;
let currentLevelFruits = 0;
let unlockedAchievements = {}; // מאחסן את סטטוס ההישגים
let gameData = {}; // נתוני המשחק נטענים מ-localStorage
let initialStage = 0; // השלב ההתחלתי של המשחק

// הגדרות המשחק
const GRAVITY_STRENGTH = 0.3;
const JUMP_POWER = -7;
const PLAYER_SPEED = 3;
const MAX_JUMPS = 2; // קפיצה כפולה
const GRAVITY_TOGGLE_LEVEL = 3; // שלב ממנו ניתן לכבות את הגרביטציה

// נכסי פיקסל ארט (תמונות ופונטים)
let font;
let fruitImages = {};
let playerIdleImg, playerJumpImg, playerWalkLeft, playerWalkRight;

// פונקציה לטעינת נכסים לפני שהמשחק מתחיל
function preload() {
    font = loadFont('assets/pixel-font.otf'); // נתיב לקובץ פונט
    playerIdleImg = loadImage('assets/player-idle.png'); // נתיב לתמונת שחקן
    // טעינת שאר התמונות...
}

// פונקציית הגדרה של p5.js
function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('gameContainer');
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textFont(font);

    // טעינת נתוני משחק מ-localStorage
    loadGameData();
    // טעינת השלב הראשון
    loadLevel(initialStage);
}

// פונקציית הציור של p5.js
function draw() {
    background(0);

    // פאזות המשחק השונות
    switch (gamePhase) {
        case 'intro':
            drawIntroScreen();
            break;
        case 'playing':
            updateGame();
            drawGame();
            break;
        case 'level_complete':
            drawLevelCompleteScreen();
            break;
        case 'game_over':
            drawGameOverScreen();
            break;
        case 'instructions':
            drawInstructionsScreen();
            break;
        case 'achievements':
            drawAchievementsScreen();
            break;
    }
}

// ... שאר הפונקציות של המשחק (עדכון, ציור, לחיצה על מקשים וכו')
// (ההנחה היא שהן נמצאות בקובץ astro-fruits.js)

// --- ניהול מצבי המשחק וממשק המשתמש ---

// פונקציה להצגת מסך פתיחה (הוחלף על ידי HTML)
function drawIntroScreen() {
    // אין צורך לצייר כאן, המידע מוצג ע"י ה-HTML
}

// פונקציה להצגת מסך הוראות (הוחלף על ידי HTML)
function drawInstructionsScreen() {
    // ניתן להשתמש בפונקציה הזו לצייר בתוך הקנבס, אך הקוד שהוספת
    // ב-HTML כבר מטפל בהצגת ההוראות מחוץ לקנבס.
    // אם רוצים להשתמש בקנבס, נצטרך לכתוב כאן קוד ציור.
    // לצורך הדוגמה, נציג טקסט פשוט:
    p.background(50);
    p.fill(255);
    p.textSize(32);
    p.text('הוראות', p.width / 2, p.height / 2 - 100);
    p.textSize(18);
    p.text('השתמש במקשי החיצים כדי לנוע, רווח כדי לקפוץ.', p.width / 2, p.height / 2);
    p.text('לחץ על מקש כלשהו כדי לחזור לתפריט הראשי.', p.width / 2, p.height / 2 + 50);
}

// פונקציה להצגת מסך הישגים (הוחלף על ידי HTML)
function drawAchievementsScreen() {
    // בדומה למסך ההוראות, נציג טקסט פשוט כדוגמה
    p.background(50);
    p.fill(255);
    p.textSize(32);
    p.text('הישגים', p.width / 2, p.height / 2 - 100);
    p.textSize(18);
    let y = p.height / 2;
    // נציג הישגים פיקטיביים
    p.text('השלם 5 שלבים: ✓', p.width / 2, y);
    p.text('אסוף 50 פירות: ☐', p.width / 2, y + 40);
    p.text('לחץ על מקש כלשהו כדי לחזור לתפריט הראשי.', p.width / 2, p.height / 2 + 100);
}

// --- ניהול אירועי קלט ---
window.confirmResetData = function() {
    if (gameData && gameData.initialStage !== undefined) {
        gameData = { initialStage: 0, unlockedAchievements: {} };
        saveGameData();
        showMessageBox('איפוס הושלם', 'כל הנתונים אופסו בהצלחה!', () => {
            loadGameData();
            // חזרה למסך הפתיחה
            gamePhase = 'intro'; 
            window.location.reload();
        });
    }
};

// פונקציית לחיצה על מקשים (עדיין רלוונטית למשחק עצמו)
function keyPressed() {
    //... (הלוגיקה שלך לטיפול במקשים W,A,S,D וכו' נשארת כאן)
    if (keyCode === ESCAPE) {
        gamePhase = 'intro';
    }
}
//... פונקציית keyReleased

// פונקציית שינוי גודל הקנבס
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// פונקציה לטעינת נתונים מ-localStorage
function loadGameData() {
    let savedData = localStorage.getItem('astroFruitsGameData');
    if (savedData) {
        gameData = JSON.parse(savedData);
        initialStage = gameData.initialStage || 0;
        unlockedAchievements = gameData.unlockedAchievements || {};
    } else {
        gameData = { initialStage: 0, unlockedAchievements: {} };
        initialStage = 0;
        unlockedAchievements = {};
    }
}

// פונקציה לשמירת נתונים ל-localStorage
function saveGameData() {
    gameData.initialStage = initialStage;
    gameData.unlockedAchievements = unlockedAchievements;
    localStorage.setItem('astroFruitsGameData', JSON.stringify(gameData));
}

// שאר פונקציות המשחק
// ...
