// קובץ משחק של Astro Fruits, משופר עם יצירת שלבים לוגית וקפיצה כפולה.
const GAME_DATA_KEY = 'fruitDungeonGameData';
let gamePhase = 'intro';
let score = 0;
let initialStage = 1;
let player, fruits, enemies, platforms;
const FRUIT_SIZE = 20;
let timeRemaining;
let gameStartTime;
const NUM_LEVELS = 100;

// הגדרות פיזיקה
const GRAVITY = 0.5;
const JUMP_POWER = -12;
const PLAYER_SPEED = 5;
const MAX_JUMP_DISTANCE_X = 200;
const MAX_JUMP_HEIGHT = 150;

let jumpCount = 0;

// פונקציה ליצירת נתונים של שלבים באופן דינמי והגיוני
function generateLevels(p, numLevels) {
    const levels = {};
    const width = p.width;
    const height = p.height;
    
    for (let i = 1; i <= numLevels; i++) {
        const difficultyFactor = i / numLevels;
        const newPlatforms = [];
        const newFruits = [];
        const newEnemies = [];
        
        // פלטפורמה התחלתית קבועה בתחתית המסך
        let lastPlatform = { x: 0, y: height - 50, w: width * 0.2, h: 50 };
        newPlatforms.push(lastPlatform);
        
        // יצירת פלטפורמות באופן הגיוני ושיטתי
        const numPlatforms = p.floor(p.random(4, 8 + difficultyFactor * 7));
        for (let j = 0; j < numPlatforms; j++) {
            let newX, newY;
            
            // הגרלת מיקום לפלטפורמה חדשה במרחק קפיצה הגיוני מהקודמת
            newX = p.random(lastPlatform.x + 150, p.width - 200);
            
            // לוודא שהפלטפורמה לא תצא מחוץ למסך
            if (newX > width - 100) {
                newX = p.random(50, width * 0.2);
            }
            
            newY = p.random(lastPlatform.y - MAX_JUMP_HEIGHT, lastPlatform.y);
            // לוודא שהפלטפורמה לא נמוכה מדי
            newY = p.constrain(newY, height * 0.2, height * 0.8);

            const newPlatform = {
                x: newX,
                y: newY,
                w: p.random(100, 200),
                h: 20
            };
            newPlatforms.push(newPlatform);
            lastPlatform = newPlatform;

            // יצירת פרי על הפלטפורמה החדשה
            newFruits.push({
                x: newPlatform.x + newPlatform.w / 2,
                y: newPlatform.y - FRUIT_SIZE / 2 - 5
            });
        }
        
        // יצירת אויבים, ממוקמים על פלטפורמות
        const numEnemies = p.floor(p.random(1, 3 + difficultyFactor * 2));
        for (let j = 0; j < numEnemies; j++) {
            const platformForEnemy = newPlatforms[p.floor(p.random(1, newPlatforms.length))]; // לא על הפלטפורמה הראשונה
            newEnemies.push({
                x: p.random(platformForEnemy.x, platformForEnemy.x + platformForEnemy.w - 40),
                y: platformForEnemy.y - 40,
                w: 40,
                h: 40,
                speedX: p.random([-2, 2]) * (1 + difficultyFactor)
            });
        }
        
        // יצירת נתוני השלב
        levels[i] = {
            playerStart: { x: 50, y: height - 100 },
            platforms: newPlatforms,
            fruits: newFruits,
            enemies: newEnemies,
            timeLimit: p.floor(80 + difficultyFactor * 40)
        };
    }
    return levels;
}

// נתוני השלבים מיוצרים באופן דינמי
let levelData;

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
        jumpCount = 0; // איפוס קפיצות
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
            levelData = generateLevels(p, NUM_LEVELS); // יצירת שלבים ראשונית
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
            let onPlatform = false;
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
                        onPlatform = true;
                    }
                }
            }

            if (onPlatform) {
                jumpCount = 0; // איפוס קפיצות כשהשחקן על פלטפורמה
            }

            // בדיקת נפילה מחוץ למפה
            if (player.y > p.height) {
                gamePhase = 'game_over';
            }

            // קלט מקשים
            if (p.keyIsDown(p.LEFT_ARROW)) player.x -= PLAYER_SPEED;
            if (p.keyIsDown(p.RIGHT_ARROW)) player.x += PLAYER_SPEED;
            
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
            p.text('לחץ על "התחל לשחק" כדי להתחיל מחדש', p.width / 2, p.height / 2 + 40);
        } else if (gamePhase === 'level_complete') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('עברת את השלב!', p.width / 2, p.height / 2);
            p.textSize(20);
            p.text('לחץ על "התחל לשחק" לשלב הבא', p.width / 2, p.height / 2 + 40);
        } else if (gamePhase === 'game_won') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('כל הכבוד! ניצחת את המשחק!', p.width / 2, p.height / 2);
            p.textSize(20);
            p.text('לחץ על "התחל לשחק" כדי להתחיל מחדש', p.width / 2, p.height / 2 + 40);
        }
    };
    
    // טיפול בלחיצת מקש עבור קפיצה כפולה וגם התקדמות
    p.keyPressed = function() {
        if (gamePhase === 'playing') {
            if (p.keyCode === p.UP_ARROW && jumpCount < 2) {
                player.velY = JUMP_POWER;
                jumpCount++;
            }
        } else if (p.keyCode === 32) { // 32 הוא keycode של רווח
            window.startGame();
        }
    };

    window.startGame = function() {
        // אם המשחק הסתיים בהצלחה או בכישלון, מתחילים מהשלב הראשון.
        if (gamePhase === 'game_over' || gamePhase === 'game_won') {
            initialStage = 1;
        } 
        // אם השלב הושלם, מתקדמים לשלב הבא
        else if (gamePhase === 'level_complete' && initialStage < NUM_LEVELS) {
            initialStage++;
        }
        
        loadLevel(p, initialStage);
        gamePhase = 'playing';
        const buttonsOverlay = document.getElementById('buttonsOverlay');
        const infoCard = document.getElementById('infoCard');
        if (buttonsOverlay) buttonsOverlay.style.display = 'none';
        if (infoCard) infoCard.classList.remove('visible');
        gameStartTime = p.millis();
    };
};

window.onload = function() {
    window.p5Instance = new p5(sketch, 'p5-canvas-container');
};
