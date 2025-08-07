const GAME_DATA_KEY = 'fruitDungeonGameData';
let gamePhase = 'intro';
const activeKeys = {};
let player, fruits, enemies;
const FRUIT_SIZE = 20;

// פונקציה גלובלית לניהול תיבות הודעה - נשארת ב-HTML
// function showMessageBox(title, content, callback) {...}

/**
 * פונקציה לשמירת נתוני המשחק ל-localStorage
 * @param {p5} p - מופע ה-p5 הנוכחי
 */
function saveGameData(p) {
    // במימוש אמיתי נשמור כאן נתונים כמו נקודות, שלב וכו'.
    // לצורך הדגמה, נשמור רק את שלב המשחק.
    const data = {
        currentLevel: initialStage
    };
    try {
        localStorage.setItem(GAME_DATA_KEY, JSON.stringify(data));
        console.log('נתוני המשחק נשמרו בהצלחה.');
    } catch (e) {
        console.error('שגיאה בשמירת נתונים ל-localStorage:', e);
    }
}

/**
 * פונקציה לטעינת נתוני המשחק מ-localStorage
 * @returns {object|null} - נתוני המשחק או null אם אין נתונים
 */
function loadGameData() {
    try {
        const data = localStorage.getItem(GAME_DATA_KEY);
        if (data) {
            console.log('נתוני המשחק נטענו בהצלחה.');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('שגיאה בטעינת נתונים מ-localStorage:', e);
    }
    return null;
}

/**
 * פונקציה לאיפוס כל נתוני המשחק מ-localStorage
 */
function resetGameData() {
    try {
        localStorage.removeItem(GAME_DATA_KEY);
        console.log('נתוני המשחק אופסו בהצלחה.');
    } catch (e) {
        console.error('שגיאה באיפוס נתונים מ-localStorage:', e);
    }
}

// נתוני השלבים (מופשט לצורך הדגמה)
const levelData = {
    1: {
        playerStart: { x: 100, y: 100 },
        platforms: [{ x: 300, y: 500, w: 600, h: 50 }],
        fruits: [{ x: 150, y: 200 }, { x: 450, y: 300 }]
    },
    2: {
        playerStart: { x: 100, y: 100 },
        platforms: [{ x: 300, y: 500, w: 600, h: 50 }],
        fruits: [{ x: 150, y: 200 }, { x: 450, y: 300 }, { x: 500, y: 400 }]
    }
};

let initialStage = 1; // שלב התחלתי

/**
 * טוען שלב ספציפי
 * @param {p5} p - מופע ה-p5
 * @param {number} levelNum - מספר השלב לטעינה
 */
function loadLevel(p, levelNum) {
    const data = levelData[levelNum];
    if (data) {
        player = { x: data.playerStart.x, y: data.playerStart.y, size: 30 };
        fruits = data.fruits.map(f => ({ ...f, size: FRUIT_SIZE }));
        enemies = [
            { x: p.random(p.width), y: p.random(p.height), size: 30, speedX: 2, speedY: 2 }
        ];
    } else {
        console.error(`נתוני שלב ${levelNum} לא נמצאו.`);
    }
}

// הגדרת הסקצ' של p5
const sketch = function(p) {
    p.setup = function() {
        const container = document.getElementById('p5-canvas-container');
        if (container) {
            p.createCanvas(container.clientWidth, container.clientHeight);
            const savedData = loadGameData();
            if (savedData) {
                initialStage = savedData.currentLevel;
            }
            loadLevel(p, initialStage);
        }
    };

    p.draw = function() {
        p.background(50);
        
        if (gamePhase === 'playing') {
            // לוגיקת תנועה, ציור וקליטת אירועים
            if (p.keyIsDown(p.LEFT_ARROW)) player.x -= 5;
            if (p.keyIsDown(p.RIGHT_ARROW)) player.x += 5;
            if (p.keyIsDown(p.UP_ARROW)) player.y -= 5;
            if (p.keyIsDown(p.DOWN_ARROW)) player.y += 5;

            p.fill(255, 100, 0);
            p.ellipse(player.x, player.y, player.size);
            
            p.fill(0, 255, 0);
            fruits.forEach(f => p.ellipse(f.x, f.y, f.size));
            
            p.fill(255, 0, 0);
            enemies.forEach(e => {
                e.x += e.speedX;
                if (e.x > p.width || e.x < 0) e.speedX *= -1;
                p.rect(e.x, e.y, e.size, e.size);
            });
            
            // בדיקת התנגשויות
            fruits = fruits.filter(f => p.dist(player.x, player.y, f.x, f.y) > (player.size / 2 + f.size / 2));
            enemies.forEach(e => {
                if (p.dist(player.x, player.y, e.x, e.y) < (player.size / 2 + e.size / 2)) {
                    gamePhase = 'game_over';
                }
            });
            
            if (fruits.length === 0) gamePhase = 'level_complete';
            
        } else if (gamePhase === 'intro') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('לחץ על "התחל לשחק"', p.width / 2, p.height / 2);
        } else if (gamePhase === 'game_over') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('Game Over', p.width / 2, p.height / 2);
        } else if (gamePhase === 'level_complete') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('Level Complete!', p.width / 2, p.height / 2);
        }
    };
    
    // פונקציה גלובלית להתחלת המשחק שנקראת מה-HTML
    window.startGame = function() {
        gamePhase = 'playing';
        // נסתר את שכבת הכפתורים לאחר ההתחלה
        const buttonsOverlay = document.getElementById('buttonsOverlay');
        const infoCard = document.getElementById('infoCard');
        if (buttonsOverlay) buttonsOverlay.style.display = 'none';
        if (infoCard) infoCard.classList.remove('visible');
    };

    // פונקציה גלובלית לאיפוס נתונים שנקראת מה-HTML
    window.resetGameData = function() {
        resetGameData(); // קורא לפונקציה המקומית
        window.location.reload();
    };

    p.windowResized = function() {
        const container = document.getElementById('p5-canvas-container');
        if (container) {
            p.resizeCanvas(container.clientWidth, container.clientHeight);
        }
    };
};

window.onload = function() {
    window.p5Instance = new p5(sketch, 'p5-canvas-container');
};
