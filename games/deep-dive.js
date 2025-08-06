// Global variables for p5.js sketch
let gamePhase = 'intro'; // 'intro', 'playing', 'level_complete', 'game_over', 'instructions', 'achievements'
let startTime = 0;
let transitionAlpha = 1;
let pointerStyle = 0; // For cursor graphics
let activeKeys = {}; // Stores currently pressed keys
let spacePressed = false; // Tracks if spacebar was just pressed
let isMouseOut = false; // Tracks if mouse is outside canvas

let isLagging = false; // Can be toggled for performance (though p5.js handles this better)
let initialStage = 1; // Starting level - this is from the Fruit Quest, not used in Tide game.

// Game specific variables for "The Great Tide"
let playerCoordinates = { x: 0, y: 0 };
let playerRenderSize;
let playerFacingAngle = 0;
let playerBaseMovementSpeed;
let playerPhantomEnergy = 100;
let playerPhasedState = false;

let keyboardInputStates = [];

let docileAquaticLife = [];
let aggressiveOceanicCreatures = [];
let seaMines = [];
let playerHealthPoints = 3;
let playerAccumulatedScore = 0;
let fishEatenCount = 0;
let largeFishEatenCount = 0;
let minesDodgedCount = 0;
let gameTimeElapsed = 0;

let currentFoodSize = 0;
let maxFoodSize = 0;

let oceanWavePosition;
let oceanWaveDirection = false;
let oceanWaveFluctuationRange;

let sceneFadeOutAlpha = 0;
let sceneFadeInAlpha = 255;
let isSceneTransitionUnderway = false;
let nextSceneTarget = "";

// Base dimensions for responsive scaling
const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

// Game persistence data (from user's snippet)
let gamePersistenceData = [100, false, false, false, false, true, false, "סנפיר תכלת", false, false, false, 2, false, false, false, false, false, false, false, false];
let currentCoinBalance = gamePersistenceData[0];
let phantomSkinAcquired = gamePersistenceData[1];
let predatorSkinAcquired = gamePersistenceData[2];
let forgetfulSkinAcquired = gamePersistenceData[3];
let prismaticSkinAcquired = gamePersistenceData[4];
let phantomAbilityActive = gamePersistenceData[5];
let predatorAbilityActive = gamePersistenceData[6];
let activePlayerAvatar = gamePersistenceData[7];
let achievementLogEntryOne = gamePersistenceData[8];
let achievementLogEntryTwo = gamePersistenceData[9];
let achievementLogEntryThree = gamePersistenceData[10];
let currentExpeditionLevel = gamePersistenceData[11];
let grandMasterAchievement = gamePersistenceData[12];
let achievementLogEntryFour = gamePersistenceData[13];
let achievementLogEntryFive = gamePersistenceData[14];
let achievementLogEntrySix = gamePersistenceData[15];
let achievementLogEntrySeven = gamePersistenceData[16];
let achievementLogEntryEight = gamePersistenceData[17];
let achievementLogEntryNine = gamePersistenceData[18];
let achievementLogEntryTen = gamePersistenceData[19];

// Skins data (newly defined)
const skinsData = [
    { name: "סנפיר תכלת", cost: 0, acquiredFlag: "default", renderFunc: null }, // renderFunc will be assigned in setup
    { name: "רוח רפאים", cost: 500, acquiredFlag: "phantomSkinAcquired", renderFunc: null },
    { name: "טורף", cost: 1000, acquiredFlag: "predatorSkinAcquired", renderFunc: null },
    { name: "שכחן", cost: 750, acquiredFlag: "forgetfulSkinAcquired", renderFunc: null },
    { name: "פריזמטי", cost: 1500, acquiredFlag: "prismaticSkinAcquired", renderFunc: null }
];

// Function to show custom message box (assuming this is in play.html or a shared script)
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
const GAME_DATA_KEY = 'greatTideGameData'; // Changed key to avoid conflict with old game

function saveGameData() {
    gamePersistenceData = [
        currentCoinBalance, phantomSkinAcquired, predatorSkinAcquired, forgetfulSkinAcquired, prismaticSkinAcquired,
        phantomAbilityActive, predatorAbilityActive, activePlayerAvatar, achievementLogEntryOne, achievementLogEntryTwo,
        achievementLogEntryThree, currentExpeditionLevel, grandMasterAchievement, achievementLogEntryFour,
        achievementLogEntryFive, achievementLogEntrySix, achievementLogEntrySeven, achievementLogEntryEight,
        achievementLogEntryNine, achievementLogEntryTen
    ];
    localStorage.setItem(GAME_DATA_KEY, JSON.stringify(gamePersistenceData));
    console.log('Game data saved:', gamePersistenceData);
}

function loadGameData() {
    const savedData = localStorage.getItem(GAME_DATA_KEY);
    if (savedData) {
        const loadedData = JSON.parse(savedData);
        if (loadedData && Array.isArray(loadedData) && loadedData.length === 20) { // Ensure correct structure
            gamePersistenceData = loadedData;
            currentCoinBalance = gamePersistenceData[0];
            phantomSkinAcquired = gamePersistenceData[1];
            predatorSkinAcquired = gamePersistenceData[2];
            forgetfulSkinAcquired = gamePersistenceData[3];
            prismaticSkinAcquired = gamePersistenceData[4];
            phantomAbilityActive = gamePersistenceData[5];
            predatorAbilityActive = gamePersistenceData[6];
            activePlayerAvatar = gamePersistenceData[7];
            achievementLogEntryOne = gamePersistenceData[8];
            achievementLogEntryTwo = gamePersistenceData[9];
            achievementLogEntryThree = gamePersistenceData[10];
            currentExpeditionLevel = gamePersistenceData[11];
            grandMasterAchievement = gamePersistenceData[12];
            achievementLogEntryFour = gamePersistenceData[13];
            achievementLogEntryFive = gamePersistenceData[14];
            achievementLogEntrySix = gamePersistenceData[15];
            achievementLogEntrySeven = gamePersistenceData[16];
            achievementLogEntryEight = gamePersistenceData[17];
            achievementLogEntryNine = gamePersistenceData[18];
            achievementLogEntryTen = gamePersistenceData[19];
            console.log('Game data loaded:', gamePersistenceData);
        } else {
            console.warn('Invalid saved game data structure. Starting new game data.');
            resetGameData(); // Reset if data is corrupt
        }
    } else {
        console.log('No saved game data found. Initializing new game data.');
        saveGameData(); // Save initial data if none exists
    }
}

function resetGameData() {
    localStorage.removeItem(GAME_DATA_KEY);
    gamePersistenceData = [100, false, false, false, false, true, false, "סנפיר תכלת", false, false, false, 2, false, false, false, false, false, false, false, false];
    currentCoinBalance = gamePersistenceData[0];
    phantomSkinAcquired = gamePersistenceData[1];
    predatorSkinAcquired = gamePersistenceData[2];
    forgetfulSkinAcquired = gamePersistenceData[3];
    prismaticSkinAcquired = gamePersistenceData[4];
    phantomAbilityActive = gamePersistenceData[5];
    predatorAbilityActive = gamePersistenceData[6];
    activePlayerAvatar = gamePersistenceData[7];
    achievementLogEntryOne = gamePersistenceData[8];
    achievementLogEntryTwo = gamePersistenceData[9];
    achievementLogEntryThree = gamePersistenceData[10];
    currentExpeditionLevel = gamePersistenceData[11];
    grandMasterAchievement = gamePersistenceData[12];
    achievementLogEntryFour = gamePersistenceData[13];
    achievementLogEntryFive = gamePersistenceData[14];
    achievementLogEntrySix = gamePersistenceData[15];
    achievementLogEntrySeven = gamePersistenceData[16];
    achievementLogEntryEight = gamePersistenceData[17];
    achievementLogEntryNine = gamePersistenceData[18];
    achievementLogEntryTen = gamePersistenceData[19];
    showMessageBox('איפוס נתונים', 'כל נתוני המשחק אופסו בהצלחה!');
    console.log('Game data reset.');
    saveGameData(); // Save the reset data
}

// --- Achievement Logic ---
function checkAchievements() {
    // Achievement 1: 100 points
    if (playerAccumulatedScore >= 100 && !achievementLogEntryOne) {
        achievementLogEntryOne = true;
        showMessageBox('הישג חדש!', 'ציון 100: השגת 100 נקודות!');
        saveGameData();
    }
    // Achievement 2: 500 points
    if (playerAccumulatedScore >= 500 && !achievementLogEntryTwo) {
        achievementLogEntryTwo = true;
        showMessageBox('הישג חדש!', 'ציון 500: השגת 500 נקודות!');
        saveGameData();
    }
    // Achievement 3: 1000 points
    if (playerAccumulatedScore >= 1000 && !achievementLogEntryThree) {
        achievementLogEntryThree = true;
        showMessageBox('הישג חדש!', 'ציון 1000: השגת 1000 נקודות!');
        saveGameData();
    }
    // Achievement 4: Eat 100 creatures
    if (fishEatenCount >= 100 && !achievementLogEntryFour) {
        achievementLogEntryFour = true;
        showMessageBox('הישג חדש!', 'טורף קטן: אכלת 100 יצורים ימיים!');
        saveGameData();
    }
    // Achievement 5: Dodge 50 mines
    if (minesDodgedCount >= 50 && !achievementLogEntryFive) {
        achievementLogEntryFive = true;
        showMessageBox('הישג חדש!', 'חמקן מיומן: התחמקת מ-50 מוקשים!');
        saveGameData();
    }
    // Achievement 6: Earn 1000 coins
    if (currentCoinBalance >= 1000 && !achievementLogEntrySix) {
        achievementLogEntrySix = true;
        showMessageBox('הישג חדש!', 'עשיר מתחת למים: הרווחת 1000 מטבעות!');
        saveGameData();
    }
    // Achievement 7: Play 5 minutes
    if (gameTimeElapsed >= 300 && !achievementLogEntrySeven) { // 5 minutes * 60 seconds/minute
        achievementLogEntrySeven = true;
        showMessageBox('הישג חדש!', 'שחקן ותיק: שיחקת 5 דקות!');
        saveGameData();
    }
    // Achievement 8: Reach size 200
    if (playerRenderSize >= 200 * (window.p5Instance.width / BASE_WIDTH) && !achievementLogEntryEight) {
        achievementLogEntryEight = true;
        showMessageBox('הישג חדש!', 'ענק ים: הגעת לגודל 200!');
        saveGameData();
    }
    // Achievement 9: Survive 10 minutes
    if (gameTimeElapsed >= 600 && !achievementLogEntryNine) { // 10 minutes * 60 seconds/minute
        achievementLogEntryNine = true;
        showMessageBox('הישג חדש!', 'שורד אולטימטיבי: שרדת 10 דקות!');
        saveGameData();
    }
    // Achievement 10: Eat 50 large fish
    if (largeFishEatenCount >= 50 && !achievementLogEntryTen) {
        achievementLogEntryTen = true;
        showMessageBox('הישג חדש!', 'מפלצת ים: אכלת 50 דגים גדולים!');
        saveGameData();
    }
}


// הגדרת הסקצ' של p5.js במצב מופע
const sketch = function(p) {

    // הגדרות בסיס לגודל יחסי (עבור חישובים)
    const BASE_WIDTH = 800;
    const BASE_HEIGHT = 600;

    // פונקציית setup() של P5.js - מוגדרת בתוך המופע
    p.setup = () => {
        // יצירת הקנבס והצמדתו ל-div עם id 'gameContainer'
        const container = document.getElementById('gameContainer');
        const containerRect = container.getBoundingClientRect();
        
        let canvasWidth = containerRect.width;
        let canvasHeight = containerRect.width * (BASE_HEIGHT / BASE_WIDTH);

        if (canvasHeight > containerRect.height) {
            canvasHeight = containerRect.height;
            canvasWidth = containerRect.height * (BASE_WIDTH / BASE_HEIGHT);
        }

        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('gameContainer'); 
        
        // מרכז את הקנבס בתוך ה-div שלו
        canvas.style('display', 'block');
        canvas.style('margin', 'auto');

        // אתחול מצבי רינדור של p5.js
        p.rectMode(p.CENTER);
        p.textFont("Comic Sans MS");
        p.textAlign(p.CENTER, p.CENTER);

        // אתחול מיקום השחקן למרכז הקנבס
        playerCoordinates.x = p.width / 2;
        playerCoordinates.y = p.height / 2;

        // אתחול גדלים ומהירויות יחסיות
        playerRenderSize = Math.max(10, 50 * (p.width / BASE_WIDTH)); // גודל מינימלי של 10
        playerBaseMovementSpeed = Math.max(1, 4 * (p.width / BASE_WIDTH)); // מהירות מינימלית של 1
        oceanWavePosition = -140 * (p.height / BASE_HEIGHT);
        oceanWaveFluctuationRange = 100 * (p.height / BASE_HEIGHT);

        // שמור את מופע p5.js במשתנה גלובלי כדי שיהיה נגיש מחוץ לסקצ'
        window.p5Instance = p; 

        // Assign render functions to skinsData after p is available
        skinsData.find(s => s.name === "סנפיר תכלת").renderFunc = renderAzureFin;
        skinsData.find(s => s.name === "רוח רפאים").renderFunc = renderPhantomFin;
        skinsData.find(s => s.name === "טורף").renderFunc = renderPredatorFin;
        skinsData.find(s => s.name === "שכחן").renderFunc = renderForgetfulFin;
        skinsData.find(s => s.name === "פריזמטי").renderFunc = renderPrismaticFin;

        loadGameData(); // Load game data after p is initialized
    };

    // פונקציית draw() של P5.js - מוגדרת בתוך המופע
    p.draw = () => {
        // עדכון זמן המשחק
        if (activeGameScene === "game") {
            gameTimeElapsed = p.floor(p.frameCount / 60); // כל 60 פריימים = שנייה
            checkAchievements(); // Check achievements during gameplay
        }

        if (isSceneTransitionUnderway) {
            // לוגיקת דעיכה חלקה בין סצנות
            p.background(20, 20, 100);
            p.fill(0, 0, 0, sceneFadeOutAlpha);
            p.rect(p.width/2, p.height/2, p.width, p.height);
            sceneFadeOutAlpha += 5;
            if (sceneFadeOutAlpha > 255) {
                activeGameScene = nextSceneTarget;
                isSceneTransitionUnderway = false;
                sceneFadeInAlpha = 255;
                sceneFadeOutAlpha = 0; // Reset for next fade out
            }
        } else {
            p.background(20, 20, 100);

            // ניהול לוגיקת המשחק בהתאם לסצנה הפעילה
            switch (activeGameScene) {
                case "home":
                    renderMainTitleScreen();
                    break;
                case "game":
                    renderGamePlayScreen();
                    break;
                case "achievements":
                    renderAccomplishmentsScreen();
                    break;
                case "skins":
                    renderAvatarSelectionScreen();
                    break;
                case "death":
                    renderGameOverScreen();
                    break;
            }
            
            // לוגיקת דעיכה חלקה פנימה לסצנה
            if (sceneFadeInAlpha > 0) {
                p.fill(0, 0, 0, sceneFadeInAlpha);
                p.rect(p.width/2, p.height/2, p.width, p.height);
                sceneFadeInAlpha -= 5;
            }
        }
    };
    
    // פונקציות קלט של P5.js - מוגדרות בתוך המופע
    p.keyPressed = () => {
        keyboardInputStates[p.keyCode] = true;
        // מניעת גלילת הדף עבור מקשי חצים ורווח
        // שימוש ב-p.preventDefault() כדי לוודא עצירה מוחלטת של פעולת ברירת המחדל
        if ([p.LEFT_ARROW, p.RIGHT_ARROW, p.UP_ARROW, p.DOWN_ARROW, p.keyCodes.SPACE].includes(p.keyCode)) {
            p.preventDefault(); // מונע את פעולת ברירת המחדל של הדפדפן
            return false; // מונע גם את הבועה של האירוע
        }
    };
    
    p.keyReleased = () => {
        keyboardInputStates[p.keyCode] = false;
    };

    p.mousePressed = () => {
        if (activeGameScene === "home") {
            const buttonWidth = 200 * (p.width / BASE_WIDTH);
            const buttonHeight = 60 * (p.height / BASE_HEIGHT);
            const buttonSpacing = 20 * (p.height / BASE_HEIGHT);
            const startY = p.height * 0.5 - (buttonHeight + buttonSpacing) * 0.5;

            // כפתור התחלת מסע
            if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
                p.mouseY > startY - buttonHeight/2 && p.mouseY < startY + buttonHeight/2) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "game";
                // איפוס מצב המשחק כשמתחילים משחק חדש
                playerHealthPoints = 3;
                playerAccumulatedScore = 0;
                playerRenderSize = Math.max(10, 50 * (p.width / BASE_WIDTH));
                fishEatenCount = 0;
                largeFishEatenCount = 0;
                minesDodgedCount = 0;
                gameTimeElapsed = 0;
                docileAquaticLife = [];
                aggressiveOceanicCreatures = [];
                seaMines = [];
                playerCoordinates.x = p.width / 2;
                playerCoordinates.y = p.height / 2;
                saveGameData(); // Save game state on start
            }
            // כפתור צפייה בהישגים
            const achievementsY = startY + buttonHeight + buttonSpacing;
            if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
                p.mouseY > achievementsY - buttonHeight/2 && p.mouseY < achievementsY + buttonHeight/2) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "achievements";
            }
            // כפתור בחירת אווטארים
            const skinsY = startY + (buttonHeight + buttonSpacing) * 2;
            if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
                p.mouseY > skinsY - buttonHeight/2 && p.mouseY < skinsY + buttonHeight/2) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "skins";
            }
        }
        
        if (activeGameScene === "achievements" || activeGameScene === "skins") {
            const backButtonSize = 100 * (p.width / BASE_WIDTH);
             if(p.dist(p.mouseX, p.mouseY, 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT))) <= backButtonSize / 2) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "home";
                saveGameData(); // Save game state when returning to home
            }
            // לוגיקת קניית סקינים במסך הסקינים
            if (activeGameScene === "skins") {
                const skinButtonRadius = 30 * (p.width / BASE_WIDTH); // רדיוס כפתור הסקין
                const skinLineHeight = 80 * (p.height / BASE_HEIGHT);
                const skinX = p.width * 0.2;

                skinsData.forEach(skin => {
                    const currentSkinY = p.height * 0.25 + (skinsData.indexOf(skin) * skinLineHeight);
                    if (p.dist(p.mouseX, p.mouseY, skinX, currentSkinY) < skinButtonRadius) {
                        if (activePlayerAvatar !== skin.name) { // אם זה לא הסקין הפעיל כרגע
                            let isAcquired = false;
                            if (skin.acquiredFlag === "default") isAcquired = true;
                            else if (skin.acquiredFlag === "phantomSkinAcquired") isAcquired = phantomSkinAcquired;
                            else if (skin.acquiredFlag === "predatorSkinAcquired") isAcquired = predatorSkinAcquired;
                            else if (skin.acquiredFlag === "forgetfulSkinAcquired") isAcquired = forgetfulSkinAcquired;
                            else if (skin.acquiredFlag === "prismaticSkinAcquired") isAcquired = prismaticSkinAcquired;

                            if (!isAcquired) { // אם לא נרכש עדיין
                                if (currentCoinBalance >= skin.cost) {
                                    currentCoinBalance -= skin.cost;
                                    // עדכון דגל הרכישה המתאים
                                    if (skin.acquiredFlag === "phantomSkinAcquired") phantomSkinAcquired = true;
                                    else if (skin.acquiredFlag === "predatorSkinAcquired") predatorSkinAcquired = true;
                                    else if (skin.acquiredFlag === "forgetfulSkinAcquired") forgetfulSkinAcquired = true;
                                    else if (skin.acquiredFlag === "prismaticSkinAcquired") prismaticSkinAcquired = true;
                                    activePlayerAvatar = skin.name; // הפעלת הסקין מיד לאחר הרכישה
                                    saveGameData();
                                } else {
                                    showMessageBox('אין מספיק מטבעות', `אתה צריך ${skin.cost - currentCoinBalance} מטבעות נוספים כדי לרכוש את ${skin.name}.`);
                                }
                            } else { // אם כבר נרכש, פשוט הפעל אותו
                                activePlayerAvatar = skin.name;
                                saveGameData();
                            }
                        }
                    }
                });
            }
        }
        
        if (activeGameScene === "death") {
            const buttonWidth = 200 * (p.width / BASE_WIDTH);
            const buttonHeight = 60 * (p.height / BASE_HEIGHT);
            const buttonY = p.height/2 + (150 * (p.height / BASE_HEIGHT));

            if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
                p.mouseY > buttonY - buttonHeight/2 && p.mouseY < buttonY + buttonHeight/2) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "home";
                // איפוס מצב המשחק כשחוזרים למסך הבית לאחר מוות
                playerAccumulatedScore = 0;
                playerHealthPoints = 3;
                playerRenderSize = Math.max(10, 50 * (p.width / BASE_WIDTH));
                fishEatenCount = 0;
                largeFishEatenCount = 0;
                minesDodgedCount = 0;
                gameTimeElapsed = 0;
                docileAquaticLife = [];
                aggressiveOceanicCreatures = [];
                seaMines = [];
                playerCoordinates.x = p.width / 2;
                playerCoordinates.y = p.height / 2;
                saveGameData(); // Save game state on death
            }
        }
        
    };
    p.mouseReleased = () => {
        // אין צורך בפעולה ספציפית כאן עבור p.mouseReleased
    };
    
    // פונקציית שינוי גודל חלון - מוגדרת בתוך המופע
    p.windowResized = () => {
        const container = document.getElementById('gameContainer');
        const containerRect = container.getBoundingClientRect();
        
        let canvasWidth = containerRect.width;
        let canvasHeight = containerRect.width * (BASE_HEIGHT / BASE_WIDTH);

        if (canvasHeight > containerRect.height) {
            canvasHeight = containerRect.height;
            canvasWidth = containerRect.height * (BASE_WIDTH / BASE_HEIGHT);
        }
        p.resizeCanvas(canvasWidth, canvasHeight);
        
        // עדכון מיקום השחקן לאחר שינוי גודל
        playerCoordinates.x = p.width / 2;
        playerCoordinates.y = p.height / 2;
        // עדכון גודל השחקן ביחס לגודל החדש של הקנבס
        playerRenderSize = Math.max(10, 50 * (p.width / BASE_WIDTH)); // וודא גודל מינימלי גם בשינוי גודל
        playerBaseMovementSpeed = Math.max(1, 4 * (p.width / BASE_WIDTH)); // וודא מהירות מינימלית גם בשינוי גודל
        oceanWavePosition = -140 * (p.height / BASE_HEIGHT);
        oceanWaveFluctuationRange = 100 * (p.height / BASE_HEIGHT);
    };

    // פונקציות עזר לציור יצורים - כעת פנימיות לסקצ'
    const renderBasicAquaticForm = (xPos, yPos, sizeRatio, rotationAngle, mainColor, outlineShade, eyeTint) => {
        const scaledSize = sizeRatio * (p.width / BASE_WIDTH); // התאמת גודל יחסי
        p.fill(mainColor);
        p.stroke(outlineShade);
        p.strokeWeight(scaledSize / 60);
        p.push();
        p.translate(xPos, yPos);
        p.scale(scaledSize / 70);
        p.rotate(rotationAngle);
        
        p.ellipse(0, 0, 30, 20); // גוף
        
        p.push();
        p.translate(-15, 0);
        p.rotate(p.sin(p.frameCount * 0.1) * 0.5); // אנימציה קלה לזנב
        p.triangle(0, 0, -15, 10, -15, -10); // זנב
        p.pop();

        p.triangle(5, -10, 15, -15, 10, -5); // סנפיר עליון

        p.fill(eyeTint);
        p.noStroke();
        p.ellipse(8, -2, 4, 4); // עין
        
        p.stroke(0);
        p.strokeWeight(1);
        p.line(10, 5, 15, 5); // פה

        p.pop();
    };

    const renderAzureFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, p.color(0, 100, 200), p.color(0, 50, 150), p.color(0));
    const renderCrimsonFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, p.color(200, 50, 0), p.color(150, 20, 0), p.color(0));
    const renderGoldenFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, p.color(200, 200, 0), p.color(150, 150, 0), p.color(0));
    const renderRoseFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, p.color(200, 0, 100), p.color(150, 0, 70), p.color(0));
    const renderPhantomFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, p.color(189, 196, 255, playerPhasedState ? 50 : 255), p.color(205, 218, 255, playerPhasedState ? 50 : 255), p.color(255, 255, 255, playerPhasedState ? 50 : 255));
    
    // ציור יצור פריזמטי (קשת בענן)
    const renderPrismaticFin = (x, y, s, r) => {
        const scaledSize = s * (p.width / BASE_WIDTH);
        p.push();
        p.translate(x, y);
        p.scale(scaledSize / 70);
        p.rotate(r);

        p.ellipse(0, 0, 30, 20); // גוף
        
        p.push();
        p.translate(-15, 0);
        p.rotate(p.sin(p.frameCount * 0.1) * 0.5);
        p.triangle(0, 0, -15, 10, -15, -10);
        p.pop();

        p.triangle(5, -10, 15, -15, 10, -5);

        p.noStroke();
        let huePalette = [
            p.color(255, 0, 0), p.color(255, 128, 0), p.color(255, 255, 0),
            p.color(0, 200, 0), p.color(0, 0, 255), p.color(128, 0, 128)
        ];
        // ציור פסים צבעוניים
        for (let i = 0; i < huePalette.length; i++) {
            p.fill(huePalette[(p.frameCount + i * 5) % huePalette.length]); // אנימציית צבעים
            p.rect(-10 + i * 4, 0, 3, 20);
        }
        
        p.fill(0);
        p.noStroke();
        p.ellipse(8, -2, 4, 4); // עין
        
        p.stroke(0);
        p.strokeWeight(1);
        p.line(10, 5, 15, 5); // פה

        p.pop();
    };

    const renderForgetfulFin = (x, y, s, r) => { // שכחן (דורי)
        const scaledSize = s * (p.width / BASE_WIDTH);
        p.push();
        p.translate(x, y);
        p.scale(scaledSize / 70);
        p.rotate(r);
        
        p.fill(0, 100, 200);
        p.stroke(0, 50, 150);
        p.strokeWeight(scaledSize / 60);
        p.ellipse(0, 0, 30, 20); // גוף
        
        p.fill(255, 200, 0);
        p.stroke(200, 150, 0);
        p.triangle(-15, 0, -30, 10, -30, -10); // זנב צהוב

        p.fill(0);
        p.noStroke();
        p.rect(5, 0, 5, 20); // פסים שחורים
        p.rect(-5, 0, 5, 20);

        p.fill(0);
        p.noStroke();
        p.ellipse(8, -2, 4, 4); // עין
        
        p.stroke(0);
        p.strokeWeight(1);
        p.line(10, 5, 15, 5); // פה

        p.pop();
    };

    const renderPredatorFin = (x, y, s, r) => { // טורף (כריש)
        const scaledSize = s * (p.width / BASE_WIDTH);
        p.push();
        p.translate(x, y);
        p.scale(scaledSize / 70);
        p.rotate(r);
        
        p.fill(100, 100, 100);
        p.stroke(70, 70, 70);
        p.strokeWeight(scaledSize / 60);
        p.beginShape();
        p.vertex(20, 0);
        p.bezierVertex(10, -15, -10, -15, -20, 0);
        p.bezierVertex(-10, 15, 10, 15, 20, 0);
        p.endShape(p.CLOSE);
        
        p.triangle(0, -10, 10, -25, 20, -10); // סנפיר גב

        p.triangle(-20, 0, -30, 10, -30, -10); // זנב

        p.fill(0);
        p.noStroke();
        p.ellipse(10, -5, 3, 3); // עין

        p.fill(255);
        p.noStroke();
        p.triangle(10, 5, 12, 8, 8, 8); // שיניים
        p.triangle(15, 5, 17, 8, 13, 8);

        p.pop();
    };

    // פונקציה חדשה לציור מוקש ימי
    const renderSeaMine = (x, y, size) => {
        const scaledSize = size * (p.width / BASE_WIDTH);
        p.push();
        p.translate(x, y);
        p.scale(scaledSize / 50);
        p.fill(50, 50, 50);
        p.stroke(20, 20, 20);
        p.strokeWeight(2);
        p.ellipse(0, 0, 40, 40); // גוף המוקש
        
        for (let i = 0; i < 8; i++) {
            p.push();
            p.rotate(p.radians(i * (360 / 8))); // שימוש ב-p.radians
            p.line(0, 20, 0, 30);
            p.ellipse(0, 30, 5, 5); // קצה קוץ
            p.pop();
        }
        p.pop();
    };
    
    // בדיקת התנגשויות בין צורות מעגליות
    const checkCircularCollision = (x1, y1, r1, x2, y2, r2) => {
        return p.dist(x1, y1, x2, y2) < r1 + r2;
    };
    
    // יצירת ישויות חדשות לסביבה
    const generateNewDocileAquaticLife = () => {
        // יצירת דגים קטנים
        if (p.frameCount % p.floor(60 / (p.width / BASE_WIDTH)) === 0) { // קצב יצירה יחסי
            let newEntity = {
                x: p.random(p.width, p.width + 1000 * (p.width / BASE_WIDTH)),
                y: p.random(p.height),
                size: p.random(20, playerRenderSize * 1.2), // גודל דג קטן יותר או מעט גדול יותר מהשחקן
                type: p.floor(p.random(0, 4))
            };
            docileAquaticLife.push(newEntity);
        }
    };
    
    const generateNewAggressiveOceanicCreature = () => {
        // יצירת כרישים
        if (p.frameCount % p.floor(180 / (p.width / BASE_WIDTH)) === 0) { // קצב יצירה יחסי
            let newPredator = {
                x: p.random(p.width, p.width + 1000 * (p.width / BASE_WIDTH)),
                y: p.random(p.height),
                size: p.random(playerRenderSize * 1.5, playerRenderSize * 3),
                velocity: p.random(2, 5) * (p.width / BASE_WIDTH) // מהירות יחסית
            };
            aggressiveOceanicCreatures.push(newPredator);
        }
    };

    // פונקציה חדשה ליצירת מוקשי ים
    const generateSeaMine = () => {
        if (p.frameCount % p.floor(240 / (p.width / BASE_WIDTH)) === 0) { // קצב יצירה יחסי
            let newMine = {
                x: p.random(p.width, p.width + 500 * (p.width / BASE_WIDTH)),
                y: p.random(p.height),
                size: p.random(30, 60) * (p.width / BASE_WIDTH), // גודל יחסי
                velocity: p.random(0.5, 1.5) * (p.width / BASE_WIDTH) // מהירות יחסית
            };
            seaMines.push(newMine);
        }
    };

    const renderMainTitleScreen = () => {
        p.fill(255);
        p.textSize(p.width * 0.1); // גודל טקסט יחסי
        p.text("הגאות הגדולה", p.width/2, p.height * 0.2);
        
        const buttonWidth = 200 * (p.width / BASE_WIDTH);
        const buttonHeight = 60 * (p.height / BASE_HEIGHT);
        const buttonSpacing = 20 * (p.height / BASE_HEIGHT);
        const startY = p.height * 0.5 - (buttonHeight + buttonSpacing) * 0.5; // מיקום התחלתי Y עבור 3 כפתורים

        // כפתור התחלת מסע
        p.fill(255, 0, 0);
        if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
            p.mouseY > startY - buttonHeight/2 && p.mouseY < startY + buttonHeight/2) {
            p.fill(200, 0, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(255, 0, 0);
            p.cursor(p.ARROW);
        }
        p.rect(p.width/2, startY, buttonWidth, buttonHeight, 10 * (p.width / BASE_WIDTH)); // כפתור מלבני עם פינות מעוגלות
        p.fill(255);
        p.textSize(40 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("התחל מסע", p.width/2, startY);
        
        // כפתור צפייה בהישגים
        const achievementsY = startY + buttonHeight + buttonSpacing;
        p.fill(0, 255, 0);
        if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
            p.mouseY > achievementsY - buttonHeight/2 && p.mouseY < achievementsY + buttonHeight/2) {
            p.fill(0, 200, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(0, 255, 0);
            p.cursor(p.ARROW);
        }
        p.rect(p.width/2, achievementsY, buttonWidth, buttonHeight, 10 * (p.width / BASE_WIDTH));
        p.fill(255);
        p.textSize(40 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("הישגים", p.width/2, achievementsY);

        // כפתור בחירת אווטארים
        const skinsY = startY + (buttonHeight + buttonSpacing) * 2;
        p.fill(0, 0, 255);
        if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
            p.mouseY > skinsY - buttonHeight/2 && p.mouseY < skinsY + buttonHeight/2) {
            p.fill(0, 0, 200);
            p.cursor(p.HAND);
        } else {
            p.fill(0, 0, 255);
            p.cursor(p.ARROW);
        }
        p.rect(p.width/2, skinsY, buttonWidth, buttonHeight, 10 * (p.width / BASE_WIDTH));
        p.fill(255);
        p.textSize(40 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("אווטארים", p.width/2, skinsY);

        // מונה מטבעות במסך הבית
        p.fill(255);
        p.textSize(25 * (p.width / BASE_WIDTH));
        p.textAlign(p.LEFT);
        p.text(`מטבעות: ${currentCoinBalance}`, p.width * 0.05, p.height * 0.05);
        p.textAlign(p.CENTER); // החזרת יישור למרכז
    };

    const renderGamePlayScreen = () => {
        // עדכון מיקום יצור השחקן
        if (keyboardInputStates[p.RIGHT_ARROW] || keyboardInputStates[68]) {
            playerCoordinates.x += playerBaseMovementSpeed;
            playerFacingAngle = 0; // פונה ימינה
        }
        if (keyboardInputStates[p.LEFT_ARROW] || keyboardInputStates[65]) {
            playerCoordinates.x -= playerBaseMovementSpeed;
            playerFacingAngle = p.PI; // פונה שמאלה
        }
        if (keyboardInputStates[p.UP_ARROW] || keyboardInputStates[87]) {
            playerCoordinates.y -= playerBaseMovementSpeed;
        }
        if (keyboardInputStates[p.DOWN_ARROW] || keyboardInputStates[83]) {
            playerCoordinates.y += playerBaseMovementSpeed;
        }

        // הגבלת תנועת השחקן לגבולות הקנבס
        playerCoordinates.x = p.constrain(playerCoordinates.x, playerRenderSize / 2, p.width - playerRenderSize / 2);
        playerCoordinates.y = p.constrain(playerCoordinates.y, playerRenderSize / 2, p.height - playerRenderSize / 2);
        
        // לוגיקת יכולת מצב חמקמק (Ghost)
        if (activePlayerAvatar === "רוח רפאים") { // רק אם סקין רוח רפאים נבחר
            phantomAbilityActive = true; // הפעלת היכולת
            if (p.mouseIsPressed && playerPhantomEnergy > 0) {
                playerPhasedState = true;
                playerPhantomEnergy -= 1;
            } else {
                playerPhasedState = false;
                if (playerPhantomEnergy < 100) playerPhantomEnergy += 0.5;
            }
        } else {
            phantomAbilityActive = false; // כיבוי היכולת אם סקין אחר נבחר
            playerPhasedState = false;
            playerPhantomEnergy = 100; // איפוס מד האנרגיה
        }
        
        // יצירת ישויות חדשות
        generateNewDocileAquaticLife();
        generateNewAggressiveOceanicCreature();
        generateSeaMine();

        // עדכון וציור יצורים ימיים רגועים
        for (let i = docileAquaticLife.length - 1; i >= 0; i--) {
            const entity = docileAquaticLife[i];
            entity.x -= 2 * (p.width / BASE_WIDTH); // קצב תנועה יחסי
            const renderFn = skinsData.find(s => s.name === activePlayerAvatar).renderFunc; // השתמש בפונקציית הרינדור של הסקין הנוכחי
            if (renderFn) {
                renderFn(entity.x, entity.y, entity.size, 0); // ציור היצור
            }
            
            // בדיקת אינטראקציית אכילה והתנגשות
            if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, entity.x, entity.y, entity.size / 2)) {
                if (playerRenderSize >= entity.size) { // יכול לאכול
                    playerRenderSize += entity.size / 10;
                    playerAccumulatedScore += p.round(entity.size);
                    currentCoinBalance += p.round(entity.size);
                    fishEatenCount++; // עדכון מונה דגים שנאכלו
                    if (entity.size >= 100 * (p.width / BASE_WIDTH)) { // אם הדג גדול יחסית
                        largeFishEatenCount++;
                    }
                    // עדכון מד הדג-מטר
                    currentFoodSize = entity.size;
                    maxFoodSize = playerRenderSize; // גודל השחקן הנוכחי
                    docileAquaticLife.splice(i, 1);
                } else if (!playerPhasedState) { // לא יכול לאכול ואינו במצב חמקמק
                    playerHealthPoints--;
                    playerRenderSize = Math.max(10, 50 * (p.width / BASE_WIDTH)); // איפוס גודל יחסי
                    // איפוס מד הדג-מטר
                    currentFoodSize = 0;
                    maxFoodSize = 0;
                    docileAquaticLife.splice(i, 1); // הסרת הדג לאחר התנגשות
                    if (playerHealthPoints <= 0) {
                        isSceneTransitionUnderway = true;
                        nextSceneTarget = "death";
                        saveGameData();
                    }
                }
            }
        }
        
        // עדכון וציור יצורים אוקיינוסים תוקפניים
        for (let i = aggressiveOceanicCreatures.length - 1; i >= 0; i--) {
            const predator = aggressiveOceanicCreatures[i];
            predator.x -= predator.velocity;
            renderPredatorFin(predator.x, predator.y, predator.size, 0);
            
            // התנגשות עם טורף
            if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, predator.x, predator.y, predator.size / 2) && !playerPhasedState) {
                playerHealthPoints--;
                playerRenderSize = Math.max(10, 50 * (p.width / BASE_WIDTH)); // איפוס גודל יחסי
                aggressiveOceanicCreatures.splice(i, 1); // הסרת הטורף לאחר פגיעה
                if (playerHealthPoints <= 0) {
                    isSceneTransitionUnderway = true;
                    nextSceneTarget = "death";
                    saveGameData();
                }
            }
            if (predator.x < -predator.size) { // הסרת טורף שיצא מהמסך
                aggressiveOceanicCreatures.splice(i, 1);
            }
        }

        // עדכון וציור מוקשי ים
        for (let i = seaMines.length - 1; i >= 0; i--) {
            const mine = seaMines[i];
            mine.x -= mine.velocity;
            renderSeaMine(mine.x, mine.y, mine.size);

            // בדיקת התנגשות עם מוקש
            if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, mine.x, mine.y, mine.size / 2)) {
                if (!playerPhasedState) { // אם לא במצב חמקמק
                    playerHealthPoints--;
                    seaMines.splice(i, 1); // הסרת המוקש לאחר פגיעה
                    if (playerHealthPoints <= 0) {
                        isSceneTransitionUnderway = true;
                        nextSceneTarget = "death";
                        saveGameData();
                    }
                } else { // אם במצב חמקמק, חומק מהמוקש
                    minesDodgedCount++; // עדכון מונה מוקשים שחמקו
                    seaMines.splice(i, 1); // הסרת המוקש גם אם חמק
                }
            }
            if (mine.x < -mine.size) {
                seaMines.splice(i, 1); // הסרת מוקש שיצא מהמסך
            }
        }
        
        // לוגיקת גלי הים
        oceanWavePosition += oceanWaveDirection ? 0.5 * (p.height / BASE_HEIGHT) : -0.5 * (p.height / BASE_HEIGHT); // מהירות יחסית
        if (oceanWavePosition < -oceanWaveFluctuationRange) oceanWaveDirection = true;
        if (oceanWavePosition > p.height * 0.2) oceanWaveDirection = false; // הגבלת גובה הגל לחלק עליון של המסך
        p.fill(0, 0, 100, 200);
        p.noStroke();
        p.rect(p.width/2, oceanWavePosition + p.height * 0.2, p.width, p.height * 0.4); // ציור הגל
        
        // ציור ממשק משתמש
        p.fill(255);
        p.textSize(20 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.textAlign(p.LEFT);
        p.text(`ניקוד: ${playerAccumulatedScore}`, p.width * 0.05, p.height * 0.05);
        p.text(`חיים: ${playerHealthPoints}`, p.width * 0.05, p.height * 0.1);
        p.text(`מטבעות: ${currentCoinBalance}`, p.width * 0.05, p.height * 0.15);
        p.text(`זמן: ${gameTimeElapsed} שניות`, p.width * 0.05, p.height * 0.2);

        // ציור מד הדג-מטר
        p.fill(200);
        p.rect(p.width * 0.75, p.height * 0.075, 200 * (p.width / BASE_WIDTH), 20 * (p.height / BASE_HEIGHT), 5);
        p.fill(0, 200, 0);
        let foodMeterWidth = p.map(playerRenderSize, 10, 200 * (p.width / BASE_WIDTH), 0, 200 * (p.width / BASE_WIDTH));
        p.rect(p.width * 0.75 - (200 * (p.width / BASE_WIDTH) - foodMeterWidth) / 2, p.height * 0.075, foodMeterWidth, 20 * (p.height / BASE_HEIGHT), 5);
        p.fill(255);
        p.textSize(15 * (p.width / BASE_WIDTH));
        p.text("מד גודל", p.width * 0.75, p.height * 0.075);

        // ציור מד אנרגיה רוח רפאים (אם הסקין פעיל)
        if (phantomAbilityActive) {
            p.fill(200);
            p.rect(p.width * 0.75, p.height * 0.15, 200 * (p.width / BASE_WIDTH), 20 * (p.height / BASE_HEIGHT), 5);
            p.fill(0, 200, 200);
            let energyMeterWidth = p.map(playerPhantomEnergy, 0, 100, 0, 200 * (p.width / BASE_WIDTH));
            p.rect(p.width * 0.75 - (200 * (p.width / BASE_WIDTH) - energyMeterWidth) / 2, p.height * 0.15, energyMeterWidth, 20 * (p.height / BASE_HEIGHT), 5);
            p.fill(255);
            p.textSize(15 * (p.width / BASE_WIDTH));
            p.text("אנרגיית חמקנות", p.width * 0.75, p.height * 0.15);
        }

        // ציור השחקן
        const currentPlayerRenderFn = skinsData.find(s => s.name === activePlayerAvatar).renderFunc;
        if (currentPlayerRenderFn) {
            currentPlayerRenderFn(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
        } else {
            // Fallback if no render function found
            renderAzureFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
        }
        p.textAlign(p.CENTER); // החזרת יישור למרכז
    };

    const renderAccomplishmentsScreen = () => {
        p.fill(255);
        p.textSize(p.width * 0.08);
        p.text("הישגים", p.width/2, p.height * 0.1);

        p.textSize(p.width * 0.03);
        p.textAlign(p.LEFT);
        let lineHeight = p.height * 0.05;
        let startY = p.height * 0.2;

        p.text(`ציון 100: ${achievementLogEntryOne ? '✅' : '❌'}`, p.width * 0.1, startY);
        p.text(`ציון 500: ${achievementLogEntryTwo ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight);
        p.text(`ציון 1000: ${achievementLogEntryThree ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight * 2);
        p.text(`טורף קטן (100 דגים): ${achievementLogEntryFour ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight * 3);
        p.text(`חמקן מיומן (50 מוקשים): ${achievementLogEntryFive ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight * 4);
        p.text(`עשיר מתחת למים (1000 מטבעות): ${achievementLogEntrySix ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight * 5);
        p.text(`שחקן ותיק (5 דקות): ${achievementLogEntrySeven ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight * 6);
        p.text(`ענק ים (גודל 200): ${achievementLogEntryEight ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight * 7);
        p.text(`שורד אולטימטיבי (10 דקות): ${achievementLogEntryNine ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight * 8);
        p.text(`מפלצת ים (50 דגים גדולים): ${achievementLogEntryTen ? '✅' : '❌'}`, p.width * 0.1, startY + lineHeight * 9);


        // כפתור חזרה
        const backButtonSize = 100 * (p.width / BASE_WIDTH);
        p.fill(200, 100, 0);
        if(p.dist(p.mouseX, p.mouseY, 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT))) <= backButtonSize / 2) {
            p.fill(150, 70, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(200, 100, 0);
            p.cursor(p.ARROW);
        }
        p.ellipse(100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT)), backButtonSize, backButtonSize);
        p.fill(255);
        p.textSize(25 * (p.width / BASE_WIDTH));
        p.text("חזור", 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT)));
        p.textAlign(p.CENTER);
    };

    const renderAvatarSelectionScreen = () => {
        p.fill(255);
        p.textSize(p.width * 0.08);
        p.text("בחר אווטאר", p.width/2, p.height * 0.1);

        p.textSize(p.width * 0.03);
        p.textAlign(p.LEFT);
        let lineHeight = 80 * (p.height / BASE_HEIGHT);
        let startY = p.height * 0.25;
        const skinX = p.width * 0.2;
        const textX = p.width * 0.5;
        const skinButtonRadius = 30 * (p.width / BASE_WIDTH);

        skinsData.forEach(skin => {
            const currentSkinY = startY + (skinsData.indexOf(skin) * lineHeight);
            let isAcquired = false;
            if (skin.acquiredFlag === "default") isAcquired = true;
            else if (skin.acquiredFlag === "phantomSkinAcquired") isAcquired = phantomSkinAcquired;
            else if (skin.acquiredFlag === "predatorSkinAcquired") isAcquired = predatorSkinAcquired;
            else if (skin.acquiredFlag === "forgetfulSkinAcquired") isAcquired = forgetfulSkinAcquired;
            else if (skin.acquiredFlag === "prismaticSkinAcquired") isAcquired = prismaticSkinAcquired;

            // ציור הסקין
            if (skin.renderFunc) {
                skin.renderFunc(skinX, currentSkinY, 50, 0); // גודל קבוע לתצוגה מקדימה
            } else {
                renderAzureFin(skinX, currentSkinY, 50, 0); // Fallback
            }

            // ציור כפתור בחירה/קנייה
            p.fill(isAcquired ? (activePlayerAvatar === skin.name ? p.color(0, 200, 0) : p.color(100, 100, 255)) : p.color(255, 100, 0));
            if (p.dist(p.mouseX, p.mouseY, skinX, currentSkinY) < skinButtonRadius) {
                p.fill(isAcquired ? (activePlayerAvatar === skin.name ? p.color(0, 150, 0) : p.color(70, 70, 200)) : p.color(200, 70, 0));
                p.cursor(p.HAND);
            } else {
                p.cursor(p.ARROW);
            }
            p.ellipse(skinX, currentSkinY, skinButtonRadius * 2, skinButtonRadius * 2);

            p.fill(255);
            p.text(skin.name, textX, currentSkinY - 15);
            if (isAcquired) {
                p.text(activePlayerAvatar === skin.name ? "פעיל" : "בחר", textX, currentSkinY + 15);
            } else {
                p.text(`מחיר: ${skin.cost} מטבעות`, textX, currentSkinY + 15);
            }
        });

        // מונה מטבעות במסך הסקינים
        p.fill(255);
        p.textSize(25 * (p.width / BASE_WIDTH));
        p.textAlign(p.LEFT);
        p.text(`מטבעות: ${currentCoinBalance}`, p.width * 0.05, p.height * 0.05);
        p.textAlign(p.CENTER);

        // כפתור חזרה
        const backButtonSize = 100 * (p.width / BASE_WIDTH);
        p.fill(200, 100, 0);
        if(p.dist(p.mouseX, p.mouseY, 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT))) <= backButtonSize / 2) {
            p.fill(150, 70, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(200, 100, 0);
            p.cursor(p.ARROW);
        }
        p.ellipse(100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT)), backButtonSize, backButtonSize);
        p.fill(255);
        p.textSize(25 * (p.width / BASE_WIDTH));
        p.text("חזור", 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT)));
        p.textAlign(p.CENTER);
    };

    const renderGameOverScreen = () => {
        p.fill(255);
        p.textSize(p.width * 0.1);
        p.text("המשחק נגמר!", p.width/2, p.height * 0.2);
        p.textSize(p.width * 0.05);
        p.text(`הניקוד שלך: ${playerAccumulatedScore}`, p.width/2, p.height * 0.4);
        p.text(`מטבעות שהרווחת: ${currentCoinBalance}`, p.width/2, p.height * 0.5);

        // כפתור חזרה למסך הבית
        const buttonWidth = 200 * (p.width / BASE_WIDTH);
        const buttonHeight = 60 * (p.height / BASE_HEIGHT);
        const buttonY = p.height/2 + (150 * (p.height / BASE_HEIGHT));

        p.fill(255, 0, 0);
        if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
            p.mouseY > buttonY - buttonHeight/2 && p.mouseY < buttonY + buttonHeight/2) {
            p.fill(200, 0, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(255, 0, 0);
            p.cursor(p.ARROW);
        }
        p.rect(p.width/2, buttonY, buttonWidth, buttonHeight, 10 * (p.width / BASE_WIDTH));
        p.fill(255);
        p.textSize(40 * (p.width / BASE_WIDTH));
        p.text("חזור לבית", p.width/2, buttonY);
    };
};
