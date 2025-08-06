// Global variables for p5.js sketch
let gamePhase = 'intro'; // 'intro', 'playing', 'level_complete', 'game_over', 'instructions', 'achievements'
let startTime = 0;
let transitionAlpha = 1;
let pointerStyle = 0; // For cursor graphics
let activeKeys = {}; // Stores currently pressed keys
let spacePressed = false; // Tracks if spacebar was just pressed
let isMouseOut = false; // Tracks if mouse is outside canvas

let isLagging = false; // Can be toggled for performance (though p5.js handles this better)
let initialStage = 1; // Starting level

let player;
let currentLevelData;
let platforms = [];
let collectibleFruits = [];
let exitPoint;

let totalFruitsCollected = 0;
let currentLevelFruits = 0;
let unlockedAchievements = {}; // Stores achievement status

// Game configuration
const GRAVITY_STRENGTH = 0.3;
const JUMP_POWER = -7;
const PLAYER_SPEED = 3;
const MAX_JUMPS = 2; // Double jump
const GRAVITY_TOGGLE_LEVEL = 3; // Level from which gravity can be turned off

// Pixel art assets
let GameAssets = {};

// Function to show custom message box
function showMessageBox(title, content, callback) {
    const msgBox = document.getElementById('messageBox');
    if (msgBox) {
        document.getElementById('messageBoxTitle').innerText = title;
        document.getElementById('messageBoxContent').innerText = content;
        msgBox.style.display = 'flex';
        const closeButton = document.getElementById('messageBoxClose');
        closeButton.onclick = () => {
            msgBox.style.display = 'none';
            if (callback) callback();
        };
    } else {
        console.warn("Message box element not found. Displaying alert instead.");
        alert(`${title}\n${content}`);
        if (callback) callback();
    }
}

// --- Cookie (localStorage) Management ---
const GAME_DATA_KEY = 'fruitDungeonGameData';

function saveGameData() {
    const gameData = {
        totalFruitsCollected: totalFruitsCollected,
        unlockedAchievements: unlockedAchievements,
        lastPlayedLevel: player ? player.currentLevel : initialStage // Save current level if playing
    };
    localStorage.setItem(GAME_DATA_KEY, JSON.stringify(gameData));
    console.log('Game data saved:', gameData);
}

function loadGameData() {
    const savedData = localStorage.getItem(GAME_DATA_KEY);
    if (savedData) {
        const gameData = JSON.parse(savedData);
        totalFruitsCollected = gameData.totalFruitsCollected || 0;
        unlockedAchievements = gameData.unlockedAchievements || {};
        initialStage = gameData.lastPlayedLevel || 1; // Set starting level to last played
        console.log('Game data loaded:', gameData);
    } else {
        console.log('No saved game data found.');
    }
}

function resetGameData() {
    localStorage.removeItem(GAME_DATA_KEY);
    totalFruitsCollected = 0;
    unlockedAchievements = {};
    initialStage = 1;
    showMessageBox('איפוס נתונים', 'כל נתוני המשחק אופסו בהצלחה!');
    console.log('Game data reset.');
}

// --- Achievement Logic ---
function checkAchievements() {
    // Achievement 1: אספן פירות - collect 10 fruits
    if (totalFruitsCollected >= 10 && !unlockedAchievements['fruitCollector']) {
        unlockedAchievements['fruitCollector'] = true;
        showMessageBox('הישג חדש!', 'אספן פירות: אספת 10 פירות!');
        saveGameData();
    }
    // Achievement 2: קפצן על - complete level 5
    if (player && player.currentLevel >= 5 && !unlockedAchievements['superJumper']) {
        unlockedAchievements['superJumper'] = true;
        showMessageBox('הישג חדש!', 'קפצן על: השלמת שלב 5!');
        saveGameData();
    }
    // Achievement 3: חוקר מיומן - complete level 10
    if (player && player.currentLevel >= 10 && !unlockedAchievements['skilledExplorer']) {
        unlockedAchievements['skilledExplorer'] = true;
        showMessageBox('הישג חדש!', 'חוקר מיומן: השלמת שלב 10!');
        saveGameData();
    }
}

// --- Player Class ---
class Player {
    constructor(x, y, level, p) { // הוסף p לקונסטרקטור
        this.p = p; // שמור את מופע p5
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.width = 20;
        this.height = 30;
        this.onGround = false;
        this.jumpsLeft = MAX_JUMPS;
        this.gravityEnabled = true;
        this.currentLevel = level;
        this.sparkleTimer = 0; // For the new visual element
    }

    update() {
        // Apply gravity if enabled
        if (this.gravityEnabled) {
            this.velY += GRAVITY_STRENGTH;
        }

        // Horizontal movement
        if (activeKeys[this.p.LEFT_ARROW] || activeKeys[65]) { // Left or A
            this.velX = -PLAYER_SPEED;
        } else if (activeKeys[this.p.RIGHT_ARROW] || activeKeys[68]) { // Right or D
            this.velX = PLAYER_SPEED;
        } else {
            this.velX = 0;
        }

        // Vertical movement (jumping)
        if ((activeKeys[this.p.UP_ARROW] || activeKeys[87]) && this.jumpsLeft > 0) { // Up or W
            this.velY = JUMP_POWER;
            this.jumpsLeft--;
            this.onGround = false; // Player is off ground after jump
            activeKeys[this.p.UP_ARROW] = false; // Consume jump key press
            activeKeys[87] = false;
        }

        // Gravity toggle (spacebar)
        // ודא ש-p.keyCodes קיים לפני השימוש
        if (this.p.keyCodes && this.currentLevel >= GRAVITY_TOGGLE_LEVEL && activeKeys[this.p.keyCodes.SPACE] && !spacePressed) { 
            this.gravityEnabled = !this.gravityEnabled;
            spacePressed = true; // Mark space as pressed to prevent rapid toggling
        }
        if (this.p.keyCodes && !activeKeys[this.p.keyCodes.SPACE]) { // If spacebar is released
            spacePressed = false;
        }

        this.x += this.velX;
        this.y += this.velY;

        // Collision with canvas edges
        if (this.p.width) { // ודא ש-p.width מוגדר
            if (this.x < this.width / 2) {
                this.x = this.width / 2;
                this.velX = 0;
            } else if (this.x > this.p.width - this.width / 2) { // שימוש ב-p.width
                this.x = this.p.width - this.width / 2;
                this.velX = 0;
            }
        }


        // Collision with platforms
        this.onGround = false;
        for (let pObj of platforms) { // שינוי שם המשתנה כדי למנוע התנגשות עם p5 instance
            if (this.collidesWith(pObj)) {
                // If falling and hit top of platform
                if (this.velY > 0 && this.y + this.height / 2 > pObj.y - pObj.height / 2 && this.y - this.height / 2 < pObj.y - pObj.height / 2) {
                    this.y = pObj.y - pObj.height / 2 - this.height / 2;
                    this.velY = 0;
                    this.onGround = true;
                    this.jumpsLeft = MAX_JUMPS; // Reset jumps on ground
                }
                // If jumping and hit bottom of platform
                else if (this.velY < 0 && this.y - this.height / 2 < pObj.y + pObj.height / 2 && this.y + this.height / 2 > pObj.y + pObj.height / 2) {
                    this.y = pObj.y + pObj.height / 2 + this.height / 2;
                    this.velY = 0;
                }
                // Horizontal collision
                else if (this.velX > 0) { // Moving right
                    this.x = pObj.x - pObj.width / 2 - this.width / 2;
                    this.velX = 0;
                } else if (this.velX < 0) { // Moving left
                    this.x = pObj.x + pObj.width / 2 + this.width / 2;
                    this.velX = 0;
                }
            }
        }

        // If player falls off screen, game over
        if (this.p.height && this.y > this.p.height + 50) { // ודא ש-p.height מוגדר
            gamePhase = 'game_over';
            showMessageBox('הפסדת!', 'נפלת מהמפה. נסה שוב!');
        }

        // Update sparkle timer for visual effect
        this.sparkleTimer = (this.sparkleTimer + 1) % 60; // Cycle every second
    }

    draw() {
        if (this.p) { // ודא ש-p קיים לפני הציור
            this.p.fill(255, 100, 100); // שימוש ב-p.fill
            this.p.rect(this.x, this.y, this.width, this.height); // שימוש ב-p.rect

            // Draw sparkle effect (non-essential element)
            if (this.sparkleTimer < 30) {
                this.p.fill(255, 255, 0, 150); // שימוש ב-p.fill
                this.p.ellipse(this.x + this.p.random(-5, 5), this.y + this.p.random(-10, 10), 5, 5); // שימוש ב-p.random ו-p.ellipse
            }
        }
    }

    collidesWith(obj) {
        return (
            this.x + this.width / 2 > obj.x - obj.width / 2 &&
            this.x - this.width / 2 < obj.x + obj.width / 2 &&
            this.y + this.height / 2 > obj.y - obj.height / 2 &&
            this.y - this.height / 2 < obj.y + obj.height / 2
        );
    }
}

// --- Platform Class ---
class Platform {
    constructor(x, y, w, h, p) { // הוסף p לקונסטרקטור
        this.p = p; // שמור את מופע p5
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }

    draw() {
        if (this.p) { // ודא ש-p קיים לפני הציור
            this.p.fill(100, 100, 100); // שימוש ב-p.fill
            this.p.rect(this.x, this.y, this.width, this.height); // שימוש ב-p.rect
        }
    }
}

// --- Collectible Fruit Class ---
class CollectibleFruit {
    constructor(x, y, type, p) { // הוסף p לקונסטרקטור
        this.p = p; // שמור את מופע p5
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.collected = false;
        this.type = type; // Index for GameAssets.collectibleFruits
    }

    draw() {
        if (!this.collected && this.p) { // ודא ש-p קיים לפני הציור
            // ודא שהתמונה קיימת ונטענה לפני הציור
            if (GameAssets.collectibleFruits[this.type]) {
                this.p.image(GameAssets.collectibleFruits[this.type], this.x, this.y, this.radius * 2, this.radius * 2); // שימוש ב-p.image
            } else {
                // לוג שגיאה או ציור פרי חלופי אם התמונה לא קיימת
                console.warn(`Collectible fruit asset type ${this.type} not found.`);
                this.p.fill(255, 0, 0); // צבע אדום כחלופה
                this.p.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
            }
        }
    }

    collect() {
        this.collected = true;
        totalFruitsCollected++;
        currentLevelFruits++;
        checkAchievements();
        saveGameData();
    }
}

// --- Exit Point Class ---
class ExitPoint {
    constructor(x, y, w, h, p) { // הוסף p לקונסטרקטור
        this.p = p; // שמור את מופע p5
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }

    draw() {
        if (this.p) { // ודא ש-p קיים לפני הציור
            this.p.fill(0, 200, 0, 150); // שימוש ב-p.fill
            this.p.rect(this.x, this.y, this.width, this.height); // שימוש ב-p.rect
            // ודא שהתמונה קיימת ונטענה לפני הציור
            if (GameAssets.bossIcon) {
                this.p.image(GameAssets.bossIcon, this.x, this.y, this.width * 0.8, this.height * 0.8); // שימוש ב-p.image
            } else {
                console.warn("Boss icon asset not found.");
                this.p.fill(0); // צבע שחור כחלופה
                this.p.rect(this.x, this.y, this.width * 0.8, this.height * 0.8);
            }
        }
    }
}

// --- Level Data (Simplified for demonstration) ---
const levelData = {
    1: {
        playerStart: { x: 100, y: 100 },
        platforms: [
            { x: 300, y: 500, w: 600, h: 50 },
            { x: 150, y: 400, w: 100, h: 20 },
            { x: 450, y: 300, w: 150, h: 20 },
            { x: 200, y: 200, w: 80, h: 20 }
        ],
        fruits: [
            { x: 150, y: 350, type: 0 },
            { x: 450, y: 250, type: 1 }
        ],
        exit: { x: 550, y: 150, w: 50, h: 50 }
    },
    2: {
        playerStart: { x: 50, y: 50 },
        platforms: [
            { x: 300, y: 550, w: 600, h: 50 },
            { x: 100, y: 450, w: 100, h: 20 },
            { x: 250, y: 350, w: 120, h: 20 },
            { x: 400, y: 250, w: 100, h: 20 },
            { x: 550, y: 150, w: 80, h: 20 }
        ],
        fruits: [
            { x: 100, y: 400, type: 1 },
            { x: 300, y: 300, type: 2 },
            { x: 500, y: 100, type: 0 }
        ],
        exit: { x: 700, y: 50, w: 50, h: 50 }
    },
    3: { // Gravity toggle level
        playerStart: { x: 100, y: 100 },
        platforms: [
            { x: 300, y: 500, w: 600, h: 50 },
            { x: 150, y: 400, w: 100, h: 20 },
            { x: 450, y: 300, w: 150, h: 20 },
            { x: 200, y: 200, w: 80, h: 20 },
            { x: 500, y: 100, w: 100, h: 20 }
        ],
        fruits: [
            { x: 150, y: 350, type: 0 },
            { x: 450, y: 250, type: 1 },
            { x: 500, y: 50, type: 2 }
        ],
        exit: { x: 700, y: 50, w: 50, h: 50 }
    },
    // Add more levels as needed, up to 14
    4: {
        playerStart: { x: 50, y: 500 },
        platforms: [
            { x: 300, y: 550, w: 600, h: 50 },
            { x: 150, y: 450, w: 100, h: 20 },
            { x: 350, y: 350, w: 120, h: 20 },
            { x: 550, y: 250, w: 100, h: 20 },
            { x: 750, y: 150, w: 80, h: 20 }
        ],
        fruits: [
            { x: 150, y: 400, type: 2 },
            { x: 350, y: 300, type: 0 },
            { x: 550, y: 200, type: 1 }
        ],
        exit: { x: 750, y: 100, w: 50, h: 50 }
    },
    5: {
        playerStart: { x: 100, y: 500 },
        platforms: [
            { x: 300, y: 550, w: 600, h: 50 },
            { x: 200, y: 400, w: 100, h: 20 },
            { x: 400, y: 300, w: 120, h: 20 },
            { x: 600, y: 200, w: 100, h: 20 },
            { x: 700, y: 100, w: 80, h: 20 }
        ],
        fruits: [
            { x: 200, y: 350, type: 1 },
            { x: 400, y: 250, type: 0 },
            { x: 600, y: 150, type: 2 }
        ],
        exit: { x: 700, y: 50, w: 50, h: 50 }
    }
    // ... more levels up to 14
};

// --- Game Initialization ---
function loadLevel(levelNum) {
    currentLevelFruits = 0;
    if (levelData[levelNum]) {
        currentLevelData = levelData[levelNum];
        // ודא ש-p5Instance מוגדר לפני אתחול הקלאסים
        if (!window.p5Instance) {
            console.error("p5Instance is not defined. Cannot load level.");
            return; // עצור אם p5Instance לא זמין
        }
        player = new Player(currentLevelData.playerStart.x, currentLevelData.playerStart.y, levelNum, window.p5Instance);
        platforms = currentLevelData.platforms.map(pData => new Platform(pData.x, pData.y, pData.w, pData.h, window.p5Instance));
        collectibleFruits = currentLevelData.fruits.map(fData => new CollectibleFruit(fData.x, fData.y, fData.type, window.p5Instance));
        exitPoint = new ExitPoint(currentLevelData.exit.x, currentLevelData.exit.y, currentLevelData.exit.w, currentLevelData.exit.h, window.p5Instance);
    } else {
        // Game completed!
        gamePhase = 'game_over';
        showMessageBox('כל הכבוד!', 'השלמת את כל השלבים הזמינים! אתה גיבור הפירות!');
        player = null; // Clear player
    }
}

// --- p5.js Sketch ---
const sketch = function(p) {
    // שמור את מופע p5.js במשתנה גלובלי כדי שיהיה נגיש מחוץ לסקצ'
    window.p5Instance = p; 

    p.setup = function() {
        // קביעת גודל הקנבס כך שיתאים לגודל ה-gameContainer
        let parentDiv = p.select('#gameContainer'); // בחר את ה-div ההורה
        let canvasWidth = parentDiv.width;
        let canvasHeight = parentDiv.height; 
        let canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('gameContainer'); // ודא שהקנבס מוכנס לתוך ה-div הנכון

        p.pixelDensity(1);
        p.rectMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.imageMode(p.CENTER);
        p.frameRate(60);

        // Generate pixel art assets
        GameAssets = (function() {
            let assets = {};

            // Helper for pixel art generation
            function createPixelArt(size, graphics, scaleFactors = null) {
                let pg = p.createGraphics(p.width, p.height);
                pg.pixelDensity(1);
                pg.background(0, 0, 0, 0);
                pg.push();
                pg.translate(pg.width / 2, pg.height / 2);
                pg.scale(size);
                if (scaleFactors) {
                    pg.scale(scaleFactors[0], scaleFactors[1]);
                }
                pg.strokeWeight(1);
                let limits = [[0, 0], [0, 0]];

                for (let i = 0; i < graphics.length; i++) {
                    if (graphics[i].length === 2) {
                        pg.point(graphics[i][0], graphics[i][1]);
                        limits[0][0] = p.min(limits[0][0], graphics[i][0]);
                        limits[0][1] = p.max(limits[0][1], graphics[i][0]);
                        limits[1][0] = p.min(limits[1][0], graphics[i][1]);
                        limits[1][1] = p.max(limits[1][1], graphics[i][1]);
                    } else {
                        pg.stroke(graphics[i][0], graphics[i][1], graphics[i][2], graphics[i].length === 4 ? graphics[i][3] : 255);
                    }
                }
                pg.pop();

                let imgWidth = (p.abs(limits[0][1]) + p.abs(limits[0][0]) + 1) * size;
                let imgHeight = (p.abs(limits[1][1]) + p.abs(limits[1][0]) + 1) * size;
                let imgX = pg.width / 2 - p.abs(limits[0][0]) * size;
                let imgY = pg.height / 2 - p.abs(limits[1][0]) * size;

                imgWidth = p.max(1, imgWidth);
                imgHeight = p.max(1, imgHeight);

                // חיתוך התמונה מה-pg והחזרת p5.Image
                return pg.get(imgX, imgY, imgWidth, imgHeight);
            }

            // Asset definitions (renamed and slightly reordered)
            assets.pointerGraphics = [];
            assets.pointerGraphics.push(createPixelArt(2, [[255,255,255],[-2,-6],[-5,-5],[-4,-5],[-3,-5],[-2,-5],[-1,-5],[-5,-4],[-4,-4],[-3,-4],[0,-4],[1,-4],[-5,-3],[-4,-3],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[-6,-2],[-5,-2],[-3,-2],[-2,-2],[-1,-2],[0,-2],[1,-2],[-5,-1],[-3,-1],[-2,-1],[-1,-1],[1,-1],[2,-1],[-4,0],[-3,0],[-2,0],[0,0],[1,0],[2,0],[5,0],[6,0],[-4,1],[-3,1],[-2,1],[-1,1],[0,1],[1,1],[5,1],[6,1],[-1,2],[0,2],[4,2],[5,2],[6,2],[3,3],[4,3],[5,3],[6,3],[2,4],[3,4],[4,4],[5,4],[0,5],[1,5],[2,5],[3,5],[4,5],[0,6],[1,6],[2,6],[3,6]]));
            assets.pointerGraphics.push(createPixelArt(2, [[255,255,255],[-9,-9],[-8,-9],[-7,-9],[-6,-9],[-9,-8],[-8,-8],[-7,-8],[-6,-8],[-5,-8],[-9,-7],[-8,-7],[-7,-7],[-6,-7],[-5,-7],[-4,-7],[-3,-7],[-9,-6],[-8,-6],[-7,-6],[-3,-6],[-8,-5],[-7,-5],[-5,-5],[-4,-5],[-3,-5],[-2,-5],[-1,-5],[-7,-4],[-5,-4],[-4,-4],[-3,-4],[-2,-4],[0,-4],[-7,-3],[-6,-3],[-5,-3],[-4,-3],[-3,-3],[-2,-3],[-1,-3],[1,-3],[2,-3],[-5,-2],[-4,-2],[-3,-2],[-2,-2],[-1,-2],[0,-2],[1,-2],[2,-2],[-5,-1],[-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-4,0],[-2,0],[-1,0],[0,0],[2,0],[3,0],[-3,1],[-2,1],[-1,1],[1,1],[2,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[5,2],[0,3],[5,3],[6,3],[7,3],[8,3],[9,3],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[2,5],[3,5],[4,5],[5,5],[6,5],[3,6],[4,6],[5,6],[3,7],[4,7],[3,8],[4,8],[3,9],[4,9]]));

            assets.fontGlyphs = [];
            // A
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[-3,-3],[-2,-3],[2,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[0,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[1,1],[2,1]]));
            // B
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[2,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // C
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[3,-3],[-3,-2],[0,-2],[1,-2],[2,-2],[3,-2],[-3,-1],[0,-1],[1,-1],[2,-1],[-3,0],[0,0],[1,0],[2,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[-2,-1],[-1,-1],[-2,0],[-1,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // D
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[-3,-3],[2,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[0,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[2,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[255,255,255],[-2,-3],[-1,-3],[0,-3],[1,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[1,-1],[2,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[0,1],[1,1]]));
            // E
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[3,-3],[-3,-2],[0,-2],[1,-2],[2,-2],[3,-2],[-3,-1],[2,-1],[-3,0],[0,0],[1,0],[2,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // F
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[3,-3],[-3,-2],[0,-2],[1,-2],[2,-2],[3,-2],[-3,-1],[2,-1],[3,-1],[-3,0],[0,0],[1,0],[2,0],[-3,1],[0,1],[1,1],[2,1],[-3,2],[-2,2],[-1,2],[0,2],[-3,3],[-2,3],[-1,3],[0,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[-2,1],[-1,1]]));
            // G
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[3,-3],[-3,-2],[0,-2],[1,-2],[2,-2],[3,-2],[-3,-1],[0,-1],[1,-1],[2,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[-2,-1],[-1,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // H
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[0,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[0,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[1,1],[2,1]]));
            // I
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[-2,-3],[1,-3],[-2,-2],[1,-2],[-2,-1],[1,-1],[-2,0],[1,0],[-2,1],[1,1],[-2,2],[-1,2],[0,2],[1,2],[-2,3],[-1,3],[0,3],[1,3],[255,255,255],[-1,-3],[0,-3],[-1,-2],[0,-2],[-1,-1],[0,-1],[-1,0],[0,0],[-1,1],[0,1]]));
            // J
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[0,-4],[1,-4],[2,-4],[0,-3],[2,-3],[3,-3],[0,-2],[3,-2],[-3,-1],[-2,-1],[-1,-1],[0,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[1,-3],[1,-2],[2,-2],[1,-1],[2,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // K
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[0,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[2,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[0,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[1,1],[2,1]]));
            // L
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[-3,-3],[-2,-3],[0,-3],[-3,-2],[0,-2],[-3,-1],[0,-1],[-3,0],[0,0],[1,0],[2,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[-2,-2],[-1,-2],[-2,-1],[-1,-1],[-2,0],[-1,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // M
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-4,-3],[-3,-3],[-1,-3],[0,-3],[1,-3],[3,-3],[4,-3],[-4,-2],[0,-2],[4,-2],[-4,-1],[4,-1],[-4,0],[-1,0],[1,0],[4,0],[-4,1],[-1,1],[0,1],[1,1],[4,1],[-4,2],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[4,2],[-4,3],[-3,3],[-2,3],[-1,3],[1,3],[2,3],[3,3],[4,3],[255,255,255],[-2,-3],[2,-3],[-3,-2],[-2,-2],[-1,-2],[1,-2],[2,-2],[3,-2],[-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[3,-1],[-3,0],[-2,0],[0,0],[2,0],[3,0],[-3,1],[-2,1],[2,1],[3,1]]));
            // N
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-4,-3],[-3,-3],[-1,-3],[0,-3],[3,-3],[-4,-2],[0,-2],[3,-2],[-4,-1],[3,-1],[-4,0],[-1,0],[3,0],[-4,1],[-1,1],[0,1],[3,1],[-4,2],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-4,3],[-3,3],[-2,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-2,-3],[1,-3],[2,-3],[-3,-2],[-2,-2],[-1,-2],[1,-2],[2,-2],[-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-3,0],[-2,0],[0,0],[1,0],[2,0],[-3,1],[-2,1],[1,1],[2,1]]));
            // O
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[-3,-3],[-2,-3],[2,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[0,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[1,-1],[2,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // P
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[3,-1],[-3,0],[0,0],[1,0],[2,0],[3,0],[-3,1],[0,1],[-3,2],[-2,2],[-1,2],[0,2],[-3,3],[-2,3],[-1,3],[0,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-2,0],[-1,0],[-2,1],[-1,1]]));
            // Q
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[-4,-3],[-3,-3],[2,-3],[-4,-2],[-1,-2],[2,-2],[-4,-1],[-1,-1],[2,-1],[-4,0],[-1,0],[2,0],[3,0],[-4,1],[3,1],[-4,2],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-4,3],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-2,-3],[2,-3],[-3,-2],[-2,-2],[0,-2],[1,-2],[-3,-1],[-2,-1],[0,-1],[1,-1],[-3,0],[-2,0],[0,0],[1,0],[-3,1],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // R
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[2,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[0,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[1,1],[2,1]]));
            // S
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[-2,-3],[3,-3],[-3,-2],[0,-2],[1,-2],[2,-2],[3,-2],[-3,-1],[3,-1],[-3,0],[-2,0],[-1,0],[0,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[0,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[1,0],[2,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // T
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-4,-3],[3,-3],[-4,-2],[-3,-2],[-2,-2],[1,-2],[2,-2],[3,-2],[-2,-1],[1,-1],[-2,0],[1,0],[-2,1],[1,1],[-2,2],[-1,2],[0,2],[1,2],[-2,3],[-1,3],[0,3],[1,3],[255,255,255],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[2,-3],[-1,-2],[0,-2],[-1,-1],[0,-1],[-1,0],[0,0],[-1,1],[0,1]]));
            // U
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[-3,-3],[-2,-3],[0,-3],[2,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[0,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-1,-3],[1,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[1,-1],[2,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));
            // V
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[0,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[0,-1],[3,-1],[-3,0],[-2,0],[2,0],[3,0],[-3,1],[-2,1],[-1,1],[1,1],[2,1],[3,1],[-2,2],[-1,2],[0,2],[1,2],[2,2],[-1,3],[0,3],[1,3],[255,255,255],[-2,-3],[-1,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[1,-1],[2,-1],[-1,0],[0,0],[1,0],[0,1]]));
            // W
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-3,-4],[-2,-4],[-1,-4],[1,-4],[2,-4],[3,-4],[-4,-3],[-3,-3],[-1,-3],[0,-3],[1,-3],[3,-3],[4,-3],[-4,-2],[0,-2],[4,-2],[-4,-1],[4,-1],[-4,0],[0,0],[4,0],[-4,1],[-1,1],[0,1],[1,1],[4,1],[-4,2],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[4,2],[-4,3],[-3,3],[-2,3],[-1,3],[1,3],[2,3],[3,3],[4,3],[255,255,255],[-2,-3],[2,-3],[-3,-2],[-2,-2],[0,-2],[2,-2],[3,-2],[-3,-1],[-2,-1],[0,-1],[1,-1],[2,-1],[3,-1],[-3,0],[-2,0],[1,0],[2,0],[3,0],[-3,1],[-2,1],[2,1],[3,1]]));
            // X
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-3,-3],[0,-3],[3,-3],[-3,-2],[0,-2],[3,-2],[-3,-1],[-2,-1],[2,-1],[3,-1],[-3,0],[0,0],[3,0],[-3,1],[0,1],[3,1],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-3,3],[-2,3],[-1,3],[1,3],[2,3],[3,3],[255,255,255],[-2,-3],[-1,-3],[1,-3],[2,-3],[-2,-2],[-1,-2],[1,-2],[2,-2],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[-1,1],[1,1],[2,1]]));
            // Y
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-4,-3],[-1,-3],[0,-3],[3,-3],[-4,-2],[-1,-2],[0,-2],[3,-2],[-4,-1],[-3,-1],[2,-1],[3,-1],[-4,0],[-3,0],[-2,0],[1,0],[2,0],[3,0],[-3,1],[-2,1],[1,1],[2,1],[-2,2],[-1,2],[0,2],[1,2],[-2,3],[-1,3],[0,3],[1,3],[255,255,255],[-3,-3],[-2,-3],[1,-3],[2,-3],[-3,-2],[-2,-2],[1,-2],[2,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[-1,1],[0,1]]));
            // Z
            assets.fontGlyphs.push(createPixelArt(20, [[0,0,0],[-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[-4,-3],[3,-3],[-4,-2],[-3,-2],[-2,-2],[-1,-2],[0,-2],[3,-2],[-4,-1],[3,-1],[-4,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[-4,1],[3,1],[-4,2],[-3,2],[-2,2],[-1,2],[0,2],[1,2],[2,2],[3,2],[-4,3],[-3,3],[-2,3],[-1,3],[0,3],[1,3],[2,3],[3,3],[255,255,255],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[2,-3],[1,-2],[2,-2],[-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-3,0],[-2,0],[-3,1],[-2,1],[-1,1],[0,1],[1,1],[2,1]]));


            assets.bossIcon = createPixelArt(2, [[80,80,80],[-1,-7],[0,-7],[1,-7],[-3,-6],[-2,-6],[-1,-6],[0,-6],[1,-6],[2,-6],[3,-6],[-4,-5],[-3,-5],[-2,-5],[-1,-5],[0,-5],[1,-5],[2,-5],[3,-5],[4,-5],[-5,-4],[-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],[4,-4],[5,-4],[-5,-3],[-4,-3],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],[2,-3],[3,-3],[4,-3],[5,-3],[-5,-2],[-4,-2],[-3,-2],[-2,-2],[-1,-2],[0,-2],[1,-2],[2,-2],[3,-2],[4,-2],[5,-2],[-5,-1],[-4,-1],[-1,-1],[0,-1],[1,-1],[4,-1],[5,-1],[-5,0],[-1,0],[0,0],[1,0],[5,0],[-5,1],[-1,1],[0,1],[1,1],[5,1],[-5,2],[-4,2],[-3,2],[-2,2],[-1,2],[1,2],[2,2],[3,2],[4,2],[5,2],[-5,3],[-4,3],[-3,3],[-2,3],[2,3],[3,3],[4,3],[5,3],[-5,4],[-4,4],[-3,4],[-2,4],[-1,4],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[-4,5],[-3,5],[-2,5],[-1,5],[0,5],[1,5],[2,5],[3,5],[4,5],[-3,6],[-1,6],[0,6],[1,6],[3,6],[-3,7],[-1,7],[1,7],[3,7]]);

            // Water background (renamed)
            let waterPg = p.createGraphics(p.width, p.height);
            waterPg.pixelDensity(1);
            waterPg.background(0, 0, 0, 0);
            waterPg.strokeWeight(4);
            for(let i = 200; i < 500; i++){
                waterPg.stroke(150 - i / 1.5, 200 - i / 1.5, 255 - i / 2, 60 + (i - 200) / 4);
                waterPg.line(0, i + 100, 600, i + 100);
            }
            assets.liquidBackground = waterPg.get(0, 0, 600, 600);

            assets.collectibleFruits = [];
            // Fruit 1 (Apple-like)
            assets.collectibleFruits.push(createPixelArt(20, [[5,0,0],[-7,-15],[-6,-15],[-7,-14],[-6,-14],[-5,-14],[-7,-13],[-4,-13],[-3,-13],[-7,-12],[-3,-12],[-2,-12],[-7,-11],[-2,-11],[-1,-11],[-7,-10],[-6,-10],[-1,-10],[-6,-9],[0,-9],[-6,-8],[-5,-8],[1,-8],[-5,-7],[-4,-7],[1,-7],[-8,-6],[-7,-6],[-6,-6],[-5,-6],[-4,-6],[-3,-6],[1,-6],[2,-6],[3,-6],[4,-6],[5,-6],[6,-6],[7,-6],[8,-6],[-10,-5],[-9,-5],[-8,-5],[-3,-5],[-2,-5],[-1,-5],[0,-5],[1,-5],[8,-5],[9,-5],[10,-5],[-11,-4],[10,-4],[11,-4],[-12,-3],[-11,-3],[11,-3],[12,-3],[-13,-2],[-12,-2],[12,-2],[-13,-1],[12,-1],[13,-1],[-13,0],[13,0],[-14,1],[13,1],[14,1],[-14,2],[14,2],[-14,3],[14,3],[-14,4],[14,4],[-14,5],[14,5],[-13,6],[13,6],[-13,7],[13,7],[-13,8],[13,8],[-12,9],[12,9],[-12,10],[-11,10],[11,10],[12,10],[-11,11],[11,11],[-11,12],[-10,12],[-9,12],[10,12],[-9,13],[-8,13],[8,13],[9,13],[-8,14],[-7,14],[6,14],[7,14],[-6,15],[-5,15],[-4,15],[-3,15],[-2,15],[-1,15],[0,15],[1,15],[2,15],[3,15],[4,15],[5,15],[73,138,70],[-6,-13],[-6,-12],[-6,-11],[-5,-11],[-5,-10],[-4,-10],[-5,-9],[-4,-9],[-3,-9],[-4,-8],[-3,-8],[24,130,30],[-5,-13],[-5,-12],[-4,-12],[-4,-11],[-3,-11],[-2,-10],[-1,-9],[-1,-8],[0,-8],[-3,-7]]));
            // Add more fruits as needed
        
            return assets;
        })();

        // טען את השלב רק לאחר שכל הנכסים נוצרו
        loadGameData(); // טען נתוני משחק לפני טעינת שלב
        loadLevel(initialStage);
    };

    p.draw = function() {
        p.background(50); // Dark background

        // Draw game elements
        for (let pObj of platforms) {
            pObj.draw();
        }
        for (let f of collectibleFruits) {
            f.draw();
        }
        if (exitPoint) {
            exitPoint.draw();
        }
        if (player) {
            player.update();
            player.draw();
        }

        // Check for fruit collection
        for (let i = collectibleFruits.length - 1; i >= 0; i--) {
            if (!collectibleFruits[i].collected && player && player.collidesWith(collectibleFruits[i])) { // ודא ש-player קיים
                collectibleFruits[i].collect();
            }
        }

        // Check for level completion
        if (player && exitPoint && player.collidesWith(exitPoint) && collectibleFruits.every(f => f.collected)) {
            gamePhase = 'level_complete';
            showMessageBox('שלב הושלם!', `כל הכבוד! אספת את כל הפירות בשלב ${player.currentLevel}.`);
            saveGameData();
            loadLevel(player.currentLevel + 1); // Load next level
        }

        // Display total fruits collected
        p.fill(255);
        p.textSize(16);
        p.text(`פירות שנאספו: ${totalFruitsCollected}`, p.width - 100, 20);
        p.text(`שלב: ${player ? player.currentLevel : initialStage}`, 100, 20);

        // Display gravity status if applicable
        if (player && player.currentLevel >= GRAVITY_TOGGLE_LEVEL) {
            p.fill(player.gravityEnabled ? 0 : 255, player.gravityEnabled ? 255 : 0, 0);
            p.text(`כוח משיכה: ${player.gravityEnabled ? 'פעיל' : 'כבוי'} (רווח לשינוי)`, p.width / 2, 20);
        }
    };

    p.keyPressed = function() {
        activeKeys[p.keyCode] = true;
        // מניעת גלילת הדף עבור מקשי חצים ורווח
        if ([p.LEFT_ARROW, p.RIGHT_ARROW, p.UP_ARROW, p.DOWN_ARROW, p.keyCodes.SPACE].includes(p.keyCode)) {
            p.preventDefault();
            return false;
        }
    };

    p.keyReleased = function() {
        activeKeys[p.keyCode] = false;
    };

    p.mouseMoved = function() {
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
            isMouseOut = false;
        } else {
            isMouseOut = true;
        }
    };

    p.mouseDragged = function() {
        // Prevent default behavior to avoid scrolling on touch devices
        return false;
    };

    p.touchStarted = function() {
        // Simulate spacebar press for gravity toggle on touch
        if (player && player.currentLevel >= GRAVITY_TOGGLE_LEVEL) {
            // ודא ש-p.keyCodes קיים לפני השימוש
            if (p.keyCodes && p.keyCodes.SPACE !== undefined) {
                activeKeys[p.keyCodes.SPACE] = true;
                spacePressed = false; // Reset to allow toggle
            } else {
                console.warn("p.keyCodes.SPACE is not defined during touchStarted.");
            }
        }
        // Simulate jump for touch
        if (player && player.jumpsLeft > 0) {
            if (p.UP_ARROW !== undefined) {
                 activeKeys[p.UP_ARROW] = true;
            } else {
                console.warn("p.UP_ARROW is not defined during touchStarted.");
            }
        }
        return false; // Prevent default browser behavior
    };

    p.touchEnded = function() {
        // ודא ש-p.keyCodes קיים לפני השימוש
        if (p.keyCodes && p.keyCodes.SPACE !== undefined) {
            activeKeys[p.keyCodes.SPACE] = false; // Release spacebar
        }
        if (p.UP_ARROW !== undefined) {
            activeKeys[p.UP_ARROW] = false; // Release jump
        }
        return false; // Prevent default browser behavior
    };

    p.windowResized = function() {
        // התאמת גודל הקנבס לגודל ה-gameContainer כאשר החלון משתנה
        let parentDiv = p.select('#gameContainer');
        if (parentDiv) {
            let newWidth = parentDiv.width;
            let newHeight = parentDiv.height;
            // שמור על יחס גובה-רוחב אם המשחק שלך תלוי בזה
            let size = p.min(newWidth, newHeight);
            p.resizeCanvas(size, size);
            
            // אם אתה רוצה שהקנבס ימלא את כל הדיב:
            // p.resizeCanvas(newWidth, newHeight);
        }
    };
};
