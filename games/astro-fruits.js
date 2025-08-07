const GAME_DATA_KEY = 'fruitDungeonGameData';
let gamePhase = 'intro';
let score = 0;
let initialStage = 1;
let player, fruits, enemies, platforms, timer;
const FRUIT_SIZE = 20;
let timeRemaining;
let gameStartTime;
const NUM_LEVELS = 150;

// הגדרות פיזיקה
const GRAVITY = 0.5;
const JUMP_POWER = -12;
const PLAYER_SPEED = 5;

// פונקציה ליצירת נתונים של שלבים באופן דינמי
function generateLevels(numLevels) {
    const levels = {};
    const basePlatforms = [
        { x: 0, y: 550, w: 900, h: 50 } // פלטפורמה תחתונה קבועה
    ];

    for (let i = 1; i <= numLevels; i++) {
        // רמת הקושי עולה עם השלב
        const difficultyFactor = i / numLevels;

        // יצירת פלטפורמות באופן דינמי
        const numPlatforms = p5.prototype.floor(p5.prototype.random(2, 5 + difficultyFactor * 5));
        const newPlatforms = [...basePlatforms];
        for (let j = 0; j < numPlatforms; j++) {
            newPlatforms.push({
                x: p5.prototype.random(p5.prototype.width * 0.1, p5.prototype.width * 0.9),
                y: p5.prototype.random(p5.prototype.height * 0.2, p5.prototype.height * 0.8),
                w: p5.prototype.random(100, 250),
                h: 20
            });
        }

        // יצירת פירות
        const numFruits = p5.prototype.floor(p5.prototype.random(3, 7 + difficultyFactor * 5));
        const newFruits = [];
        for (let j = 0; j < numFruits; j++) {
            newFruits.push({
                x: p5.prototype.random(p5.prototype.width * 0.1, p5.prototype.width * 0.9),
                y: p5.prototype.random(p5.prototype.height * 0.1, p5.prototype.height * 0.9)
            });
        }
        
        // יצירת אויבים
        const numEnemies = p5.prototype.floor(p5.prototype.random(1, 3 + difficultyFactor * 3));
        const newEnemies = [];
        for (let j = 0; j < numEnemies; j++) {
            newEnemies.push({
                x: p5.prototype.random(p5.prototype.width * 0.1, p5.prototype.width * 0.9),
                y: p5.prototype.random(p5.prototype.height * 0.5, p5.prototype.height * 0.9),
                w: 40,
                h: 40,
                speedX: p5.prototype.random([-2, 2])
            });
        }

        // יצירת נתוני השלב
        levels[i] = {
            playerStart: { x: 50, y: 50 },
            platforms: newPlatforms,
            fruits: newFruits,
            enemies: newEnemies,
            timeLimit: 60 + p5.prototype.floor(difficultyFactor * 60)
        };
    }
    return levels;
}

// נתוני השלבים מיוצרים באופן דינמי במקום להיכתב ידנית
const levelData = generateLevels(NUM_LEVELS);

/**
 * פונקציה לשמירת נתוני המשחק ל-localStorage
 */
function saveGameData() {
    const data = {
        currentLevel: initialStage,
        highScore: score
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
window.resetGameData = function() {
    try {
        localStorage.removeItem(GAME_DATA_KEY);
        console.log('נתוני המשחק אופסו בהצלחה.');
    } catch (e) {
        console.error('שגיאה באיפוס נתונים מ-localStorage:', e);
    }
    window.location.reload();
};

/**
 * טוען שלב ספציפי
 * @param {p5} p - מופע ה-p5
 * @param {number} levelNum - מספר השלב לטעינה
 */
function loadLevel(p, levelNum) {
    const data = levelData[levelNum];
    if (data) {
        player = { x: data.playerStart.x, y: data.playerStart.y, w: 30, h: 30, velY: 0, isJumping: false };
        platforms = data.platforms.map(pl => ({ ...pl }));
        fruits = data.fruits.map(f => ({ ...f, size: FRUIT_SIZE, collected: false }));
        enemies = data.enemies.map(e => ({ ...e }));
        timeRemaining = data.timeLimit;
        gameStartTime = p.millis();
        score = 0;
        console.log(`שלב ${levelNum} נטען.`);
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
            if (savedData && savedData.currentLevel <= NUM_LEVELS) {
                initialStage = savedData.currentLevel;
            }
            loadLevel(p, initialStage);
        }
    };

    p.draw = function() {
        p.background(50);
        
        if (gamePhase === 'playing') {
            // עדכון טיימר
            const elapsedTime = (p.millis() - gameStartTime) / 1000;
            const currentTimer = Math.max(0, timeRemaining - p.floor(elapsedTime));
            if (currentTimer === 0) {
                gamePhase = 'game_over';
            }

            // לוגיקת תנועה של השחקן
            player.velY += GRAVITY;
            player.y += player.velY;

            // בדיקת התנגשויות עם פלטפורמות
            player.isJumping = true;
            for (let platform of platforms) {
                if (
                    player.y + player.h > platform.y &&
                    player.y < platform.y + platform.h &&
                    player.x + player.w > platform.x &&
                    player.x < platform.x + platform.w
                ) {
                    if (player.y + player.h - player.velY <= platform.y) {
                        player.y = platform.y - player.h;
                        player.velY = 0;
                        player.isJumping = false;
                    }
                }
            }

            // קלט מקשים
            if (p.keyIsDown(p.LEFT_ARROW)) player.x -= PLAYER_SPEED;
            if (p.keyIsDown(p.RIGHT_ARROW)) player.x += PLAYER_SPEED;
            
            if (p.keyIsDown(p.UP_ARROW) && !player.isJumping) {
                player.velY = JUMP_POWER;
                player.isJumping = true;
            }

            // ציור השחקן
            p.fill(255, 100, 0);
            p.rect(player.x, player.y, player.w, player.h);

            // ציור פלטפורמות
            p.fill(100, 100, 100);
            platforms.forEach(pl => p.rect(pl.x, pl.y, pl.w, pl.h));

            // ציור פירות
            p.fill(0, 255, 0);
            fruits.forEach(f => p.ellipse(f.x, f.y, f.size));

            // בדיקת איסוף פירות ועדכון ציון
            let collectedFruits = fruits.filter(f => p.dist(player.x + player.w / 2, player.y + player.h / 2, f.x, f.y) < (player.w / 2 + f.size / 2));
            collectedFruits.forEach(() => score += 10);
            fruits = fruits.filter(f => !collectedFruits.includes(f));

            // תנועה וציור אויבים
            p.fill(255, 0, 0);
            enemies.forEach(e => {
                e.x += e.speedX;
                if (e.x > p.width - e.w || e.x < 0) e.speedX *= -1;
                p.rect(e.x, e.y, e.w, e.h);
                
                // בדיקת התנגשות עם אויב
                if (p.dist(player.x + player.w / 2, player.y + player.h / 2, e.x + e.w / 2, e.y + e.h / 2) < (player.w / 2 + e.w / 2)) {
                    gamePhase = 'game_over';
                }
            });
            
            // בדיקת ניצחון בשלב
            if (fruits.length === 0) {
                if (initialStage >= NUM_LEVELS) {
                    gamePhase = 'game_won'; // ניצחון מוחלט
                } else {
                    gamePhase = 'level_complete'; // עבר שלב
                    saveGameData();
                }
            }
            
            // הצגת ציון, שלב וטיימר
            p.fill(255);
            p.textSize(20);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`שלב: ${initialStage}`, 10, 10);
            p.text(`ניקוד: ${score}`, 10, 40);
            p.textAlign(p.RIGHT, p.TOP);
            p.text(`זמן: ${currentTimer}`, p.width - 10, 10);

        } else if (gamePhase === 'intro') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('לחץ על "התחל לשחק"', p.width / 2, p.height / 2);
        } else if (gamePhase === 'game_over') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('המשחק נגמר!', p.width / 2, p.height / 2);
            p.textSize(20);
            p.text('לחץ על התחל כדי להתחיל מחדש', p.width / 2, p.height / 2 + 40);
        } else if (gamePhase === 'level_complete') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('עברת את השלב!', p.width / 2, p.height / 2);
            p.textSize(20);
            p.text('לחץ על התחל לשלב הבא', p.width / 2, p.height / 2 + 40);
        } else if (gamePhase === 'game_won') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('כל הכבוד! ניצחת את המשחק!', p.width / 2, p.height / 2);
            p.textSize(20);
            p.text('לחץ על התחל כדי להתחיל מחדש', p.width / 2, p.height / 2 + 40);
        }
    };
    
    window.startGame = function() {
        if (gamePhase === 'level_complete' && initialStage < NUM_LEVELS) {
            initialStage++;
            loadLevel(p, initialStage);
        } else if (gamePhase === 'game_over' || gamePhase === 'game_won' || gamePhase === 'level_complete') {
            initialStage = 1; 
            loadLevel(p, initialStage);
        } else {
            loadLevel(p, initialStage);
        }
        gamePhase = 'playing';
        const buttonsOverlay = document.getElementById('buttonsOverlay');
        const infoCard = document.getElementById('infoCard');
        if (buttonsOverlay) buttonsOverlay.style.display = 'none';
        if (infoCard) infoCard.classList.remove('visible');
        gameStartTime = p.millis();
    };

    p.keyPressed = function() {}
};

window.onload = function() {
    window.p5Instance = new p5(sketch, 'p5-canvas-container');
};
