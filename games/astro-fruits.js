// קובץ משחק Astro Fruits משופר, עם מטבעות, חנות ושדרוגים
const GAME_DATA_KEY = 'fruitDungeonGameData';
let gamePhase = 'intro';
let score = 0;
let initialStage = 1;
let player, fruits, enemies, platforms, coins;
const FRUIT_SIZE = 20;
const COIN_SIZE = 15;
let timeRemaining;
let gameStartTime;
const NUM_LEVELS = 100;

// הגדרות פיזיקה, אותן נשדרג בחנות
let GRAVITY = 0.5;
let JUMP_POWER = -12;
let PLAYER_SPEED = 5;
const MAX_JUMP_HEIGHT = 150;

let jumpCount = 0;

// משתנים חדשים עבור החנות
let coinsCollected = 0;
let currentSkin = 'default';
let jumpUpgradeLevel = 0;
let speedUpgradeLevel = 0;

const skinOptions = {
    'default': { color: '#FF6400', name: 'רגיל' },
    'blue_star': { color: '#00BFFF', name: 'כוכב כחול', cost: 50 },
    'green_slime': { color: '#00FF7F', name: 'ריר ירוק', cost: 100 }
};

const upgradeOptions = {
    jump: {
        name: 'שדרוג קפיצה',
        levels: [
            { power: -14, cost: 75 },
            { power: -16, cost: 150 },
            { power: -18, cost: 250 }
        ]
    },
    speed: {
        name: 'שדרוג מהירות',
        levels: [
            { speed: 7, cost: 75 },
            { speed: 9, cost: 150 },
            { speed: 11, cost: 250 }
        ]
    }
};

/**
 * פונקציה ליצירת נתונים של שלבים באופן דינמי והגיוני
 * כולל הוספת מטבעות
 */
function generateLevels(p, numLevels) {
    const levels = {};
    const width = p.width;
    const height = p.height;
    
    for (let i = 1; i <= numLevels; i++) {
        const difficultyFactor = i / numLevels;
        const newPlatforms = [];
        const newFruits = [];
        const newEnemies = [];
        const newCoins = [];
        
        // פלטפורמה התחלתית קבועה בתחתית המסך
        let lastPlatform = { x: 50, y: height - 50, w: width * 0.2, h: 50 };
        newPlatforms.push(lastPlatform);
        
        // יצירת פלטפורמות באופן הגיוני ושיטתי
        const numPlatforms = p.floor(p.random(4, 8 + difficultyFactor * 7));
        for (let j = 0; j < numPlatforms; j++) {
            let newX, newY;
            const newPlatformWidth = p.random(100, 200);

            // קביעת טווח קפיצה ושינוי כיוון אם הפלטפורמה יוצאת מהמסך
            let direction = p.random() > 0.5 ? 1 : -1;
            const minJumpDist = 150;
            const maxJumpDist = 250;
            
            // חישוב מיקום X
            let potentialX = lastPlatform.x + direction * p.random(minJumpDist, maxJumpDist);
            
            // בדיקה אם הפלטפורמה החדשה חורגת מהגבולות
            if (potentialX < 50 || potentialX + newPlatformWidth > width - 50) {
                // אם חורגת, נהפוך את הכיוון
                direction *= -1;
                potentialX = lastPlatform.x + direction * p.random(minJumpDist, maxJumpDist);
            }

            newX = potentialX;

            newY = p.random(lastPlatform.y - MAX_JUMP_HEIGHT, lastPlatform.y);
            // לוודא שהפלטפורמה לא נמוכה מדי
            newY = p.constrain(newY, height * 0.2, height * 0.8);
            
            const newPlatform = {
                x: newX,
                y: newY,
                w: newPlatformWidth,
                h: 20
            };
            newPlatforms.push(newPlatform);
            lastPlatform = newPlatform;

            // יצירת פרי ו/או מטבע על הפלטפורמה החדשה
            if (p.random() > 0.3) {
                newFruits.push({
                    x: newPlatform.x + newPlatform.w / 2,
                    y: newPlatform.y - FRUIT_SIZE / 2 - 5
                });
            } else {
                newCoins.push({
                    x: newPlatform.x + newPlatform.w / 2,
                    y: newPlatform.y - COIN_SIZE / 2 - 5
                });
            }
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
            coins: newCoins,
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
        highScore: score,
        coins: coinsCollected,
        skin: currentSkin,
        jumpLevel: jumpUpgradeLevel,
        speedLevel: speedUpgradeLevel
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
            const parsedData = JSON.parse(data);
            coinsCollected = parsedData.coins || 0;
            currentSkin = parsedData.skin || 'default';
            jumpUpgradeLevel = parsedData.jumpLevel || 0;
            speedUpgradeLevel = parsedData.speedLevel || 0;
            
            // עדכון כוח הקפיצה והמהירות על פי השדרוגים
            if (jumpUpgradeLevel > 0) {
                JUMP_POWER = upgradeOptions.jump.levels[jumpUpgradeLevel - 1].power;
            }
            if (speedUpgradeLevel > 0) {
                PLAYER_SPEED = upgradeOptions.speed.levels[speedUpgradeLevel - 1].speed;
            }
            
            return parsedData;
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
        coins = data.coins.map(c => ({ ...c, size: COIN_SIZE, collected: false }));
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
window.sketch = function(p) {
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
            p.fill(skinOptions[currentSkin].color);
            p.rect(player.x, player.y, player.w, player.h);

            // ציור פלטפורמות
            p.fill(100, 100, 100);
            platforms.forEach(pl => p.rect(pl.x, pl.y, pl.w, pl.h));

            // ציור פירות
            p.fill(0, 255, 0);
            fruits.forEach(f => p.ellipse(f.x, f.y, f.size));

            // ציור מטבעות
            p.fill(255, 200, 0);
            coins.forEach(c => p.ellipse(c.x, c.y, c.size));

            // בדיקת איסוף פירות ועדכון ציון
            let collectedFruits = fruits.filter(f => p.dist(player.x + player.w / 2, player.y + player.h / 2, f.x, f.y) < (player.w / 2 + f.size / 2));
            collectedFruits.forEach(() => score += 10);
            fruits = fruits.filter(f => !collectedFruits.includes(f));

            // בדיקת איסוף מטבעות ועדכון
            let collectedCoins = coins.filter(c => p.dist(player.x + player.w / 2, player.y + player.h / 2, c.x, c.y) < (player.w / 2 + c.size / 2));
            collectedCoins.forEach(() => coinsCollected += 1);
            coins = coins.filter(c => !collectedCoins.includes(c));

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
            
            // הצגת ציון, שלב, טיימר ומטבעות
            p.fill(255);
            p.textSize(20);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`שלב: ${initialStage}`, 10, 10);
            p.text(`ניקוד: ${score}`, 10, 40);
            p.text(`מטבעות: ${coinsCollected}`, 10, 70);
            p.textAlign(p.RIGHT, p.TOP);
            p.text(`זמן: ${currentTimer}`, p.width - 10, 10);

        } else if (gamePhase === 'intro') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('לחץ על מקש רווח כדי להתחיל', p.width / 2, p.height / 2);
        } else if (gamePhase === 'game_over') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('המשחק נגמר!', p.width / 2, p.height / 2);
            p.textSize(20);
            p.text('לחץ על מקש רווח כדי להתחיל מחדש', p.width / 2, p.height / 2 + 40);
        } else if (gamePhase === 'level_complete') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('עברת את השלב!', p.width / 2, p.height / 2);
            p.textSize(20);
            p.text('לחץ על מקש רווח לשלב הבא', p.width / 2, p.height / 2 + 40);
        } else if (gamePhase === 'game_won') {
            p.textSize(32);
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('כל הכבוד! ניצחת את המשחק!', p.width / 2, p.height / 2);
            p.textSize(20);
            p.text('לחץ על מקש רווח כדי להתחיל מחדש', p.width / 2, p.height / 2 + 40);
        } else if (gamePhase === 'store') {
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(48);
            p.text('חנות', p.width / 2, 50);

            p.textAlign(p.LEFT, p.TOP);
            p.textSize(24);
            p.text(`מטבעות: ${coinsCollected}`, 20, 20);

            p.textSize(32);
            p.text('סקינים:', 50, 150);
            
            let xPos = 50;
            let yPos = 200;
            for (let skinId in skinOptions) {
                const skin = skinOptions[skinId];
                p.fill(skin.color);
                p.rect(xPos, yPos, 80, 80);
                p.fill(255);
                p.textSize(16);
                p.textAlign(p.CENTER, p.TOP);
                p.text(skin.name, xPos + 40, yPos + 85);
                
                if (skinId !== 'default' && currentSkin !== skinId) {
                    const isAffordable = coinsCollected >= skin.cost;
                    p.fill(isAffordable ? 255 : p.color(255, 100, 100)); // צבע אדום למחיר לא מספיק
                    p.textSize(14);
                    p.text(`מחיר: ${skin.cost}`, xPos + 40, yPos + 105);
                    p.text(`(לחץ על ${skinId.charAt(0)})`, xPos + 40, yPos + 125);
                } else if (currentSkin === skinId) {
                    p.fill(0, 255, 0);
                    p.textSize(14);
                    p.text('נבחר', xPos + 40, yPos + 105);
                }
                xPos += 120;
            }

            p.textAlign(p.LEFT, p.TOP);
            p.textSize(32);
            p.text('שדרוגים:', 50, 350);

            xPos = 50;
            yPos = 400;
            for (let upgradeId in upgradeOptions) {
                const upgrade = upgradeOptions[upgradeId];
                p.fill(255);
                p.textAlign(p.LEFT, p.TOP);
                p.text(upgrade.name, xPos, yPos);
                
                const currentLevel = (upgradeId === 'jump') ? jumpUpgradeLevel : speedUpgradeLevel;
                const nextLevelIndex = currentLevel;

                if (nextLevelIndex < upgrade.levels.length) {
                    const nextLevel = upgrade.levels[nextLevelIndex];
                    const isAffordable = coinsCollected >= nextLevel.cost;
                    p.textSize(20);
                    p.fill(isAffordable ? 255 : p.color(255, 100, 100)); // צבע אדום למחיר לא מספיק
                    p.text(`דרגה הבאה: ${currentLevel + 1}`, xPos, yPos + 40);
                    p.text(`מחיר: ${nextLevel.cost}`, xPos, yPos + 70);
                    // שינוי המקש מ-S ל-D כדי למנוע התנגשות
                    const keyToPress = (upgradeId === 'jump') ? 'J' : 'D';
                    p.text(`(לחץ על ${keyToPress})`, xPos, yPos + 100);
                } else {
                    p.fill(0, 255, 0);
                    p.textSize(20);
                    p.text('מקסימום שדרוג', xPos, yPos + 40);
                }
                xPos += 300;
            }
            
            p.fill(255);
            p.textAlign(p.CENTER, p.BOTTOM);
            p.textSize(20);
            p.text('לחץ על מקש רווח כדי לחזור', p.width / 2, p.height - 20);
        }
    };
    
    // פונקציה חדשה שנקראת מכפתור ה-HTML
    window.openStore = function() {
        // ודא שהמשחק אינו במצב פעיל
        if (gamePhase !== 'playing') {
            gamePhase = 'store';
            const buttonsOverlay = document.getElementById('buttonsOverlay');
            if (buttonsOverlay) buttonsOverlay.style.display = 'none';
        } else {
            showMessageBox('אין גישה', 'לא ניתן להיכנס לחנות בזמן משחק.');
        }
    };
    
    // פונקציה חדשה לאיפוס נתונים שנקראת מכפתור ה-HTML
    window.resetGameDataAndReload = function() {
      window.resetGameData();
      window.location.reload();
    }
    
    // טיפול בלחיצת מקש עבור קפיצה כפולה, התקדמות וגישה לחנות
    p.keyPressed = function() {
        if (gamePhase === 'playing') {
            if (p.keyCode === p.UP_ARROW && jumpCount < 2) {
                player.velY = JUMP_POWER;
                jumpCount++;
            }
        } else if (gamePhase === 'intro' || gamePhase === 'game_over' || gamePhase === 'level_complete' || gamePhase === 'game_won') {
            if (p.keyCode === 32) { // מקש רווח
                window.startGame();
            } else if (p.keyCode === 83) { // מקש 'S'
                window.openStore(); // קורא לפונקציית החנות
            }
        } else if (gamePhase === 'store') {
            if (p.keyCode === 32) { // מקש רווח
                gamePhase = 'intro'; // חזרה למסך פתיחה
                const buttonsOverlay = document.getElementById('buttonsOverlay');
                if (buttonsOverlay) buttonsOverlay.style.display = 'flex';
            } else if (p.keyCode === 66) { // B for Blue
                if (coinsCollected >= skinOptions.blue_star.cost && currentSkin !== 'blue_star') {
                    coinsCollected -= skinOptions.blue_star.cost;
                    currentSkin = 'blue_star';
                    saveGameData();
                }
            } else if (p.keyCode === 71) { // G for Green
                 if (coinsCollected >= skinOptions.green_slime.cost && currentSkin !== 'green_slime') {
                    coinsCollected -= skinOptions.green_slime.cost;
                    currentSkin = 'green_slime';
                    saveGameData();
                }
            } else if (p.keyCode === 74) { // J for Jump
                const nextLevelIndex = jumpUpgradeLevel;
                if (nextLevelIndex < upgradeOptions.jump.levels.length) {
                    const upgradeCost = upgradeOptions.jump.levels[nextLevelIndex].cost;
                    if (coinsCollected >= upgradeCost) {
                        coinsCollected -= upgradeCost;
                        JUMP_POWER = upgradeOptions.jump.levels[nextLevelIndex].power;
                        jumpUpgradeLevel++;
                        saveGameData();
                    }
                }
            } else if (p.keyCode === 68) { // D for מהירות
                const nextLevelIndex = speedUpgradeLevel;
                if (nextLevelIndex < upgradeOptions.speed.levels.length) {
                    const upgradeCost = upgradeOptions.speed.levels[nextLevelIndex].cost;
                    if (coinsCollected >= upgradeCost) {
                        coinsCollected -= upgradeCost;
                        PLAYER_SPEED = upgradeOptions.speed.levels[nextLevelIndex].speed;
                        speedUpgradeLevel++;
                        saveGameData();
                    }
                }
            }
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

    // חיבור כפתור החנות מה-HTML לפונקציה המתאימה בקוד
    const storeButton = document.getElementById('storeButton');
    if (storeButton) {
        storeButton.addEventListener('click', () => {
            window.openStore();
        });
    }
};

