// הגדרת הסקצ' של p5.js במצב מופע
const gameSketch = function(p) {

    // הגדרות בסיס לגודל יחסי (עבור חישובים)
    const BASE_WIDTH = 800;
    const BASE_HEIGHT = 600;

    // נתוני שמירת משחק, מפורקים למשתנים נגישים
    // [מטבעות, רוח רפאים נרכש, טורף נרכש, שכחן נרכש, פריזמטי נרכש, רוח רפאים פעיל, טורף פעיל, אווטאר פעיל, הישג 1, הישג 2, הישג 3, רמה, הישג 100 רמות, הישג 4, הישג 5, הישג 6, הישג 7, הישג 8, הישג 9, הישג 10]
    let gamePersistenceData = [100, false, false, false, false, true, false, "Azure Fin", false, false, false, 2, false, false, false, false, false, false, false, false];
    let currentCoinBalance = gamePersistenceData[0];
    let phantomSkinAcquired = gamePersistenceData[1]; // רוח רפאים
    let predatorSkinAcquired = gamePersistenceData[2]; // טורף
    let forgetfulSkinAcquired = gamePersistenceData[3]; // שכחן
    let prismaticSkinAcquired = gamePersistenceData[4]; // פריזמטי
    let phantomAbilityActive = gamePersistenceData[5]; // האם יכולת רוח רפאים פעילה (אם נבחר הסקין)
    let predatorAbilityActive = gamePersistenceData[6]; // האם יכולת טורף פעילה (אם נבחר הסקין)
    let activePlayerAvatar = gamePersistenceData[7]; // אווטאר השחקן הנוכחי
    let achievementLogEntryOne = gamePersistenceData[8]; // הישג: 100 נקודות
    let achievementLogEntryTwo = gamePersistenceData[9]; // הישג: 500 נקודות
    let achievementLogEntryThree = gamePersistenceData[10]; // הישג: 1000 נקודות
    let currentExpeditionLevel = gamePersistenceData[11]; // רמת המסע הנוכחית
    let grandMasterAchievement = gamePersistenceData[12]; // הישג: רמה 100 (לא בשימוש כרגע)
    let achievementLogEntryFour = gamePersistenceData[13]; // הישג: אכל 100 יצורים
    let achievementLogEntryFive = gamePersistenceData[14]; // הישג: התחמק מ-50 מוקשים
    let achievementLogEntrySix = gamePersistenceData[15]; // הישג: הרוויח 1000 מטבעות
    let achievementLogEntrySeven = gamePersistenceData[16]; // הישג: שיחק 5 דקות
    let achievementLogEntryEight = gamePersistenceData[17]; // הישג: הגיע לגודל 200
    let achievementLogEntryNine = gamePersistenceData[18]; // הישג: שרד 10 דקות
    let achievementLogEntryTen = gamePersistenceData[19]; // הישג: אכל 50 דגים גדולים

    // מצב המסך הפעיל
    let activeGameScene = "home";

    // מאפייני יצור השחקן
    let playerCoordinates = { x: 0, y: 0 }; // יאותחל ב-setup
    let playerRenderSize; // יאותחל ב-setup, גודל יחסי
    let playerFacingAngle = 0;
    let playerBaseMovementSpeed; // יאותחל ב-setup, מהירות יחסית
    let playerPhantomEnergy = 100; // מד אנרגיה ליכולת רוח רפאים
    let playerPhasedState = false; // מצב חמקמק (בלתי פגיע)

    // ניהול קלט מקלדת
    let keyboardInputStates = [];

    // אובייקטים בתוך הסביבה הימית
    let docileAquaticLife = []; // יצורים ימיים רגועים (דגים קטנים)
    let aggressiveOceanicCreatures = []; // יצורים אוקיינוסים תוקפניים (כרישים)
    let seaMines = []; // מוקשי ים חדשים
    let playerHealthPoints = 3;
    let playerAccumulatedScore = 0;
    let fishEatenCount = 0; // מונה דגים שנאכלו
    let largeFishEatenCount = 0; // מונה דגים גדולים שנאכלו
    let minesDodgedCount = 0; // מונה מוקשים שחמקו
    let gameTimeElapsed = 0; // זמן משחק בשניות

    // מד "הדג-מטר"
    let currentFoodSize = 0; // גודל הדג האחרון שנאכל
    let maxFoodSize = 0; // גודל הדג המקסימלי שניתן לאכול

    // מכניקת גלי הים
    let oceanWavePosition; // יאותחל ב-setup, מיקום יחסי
    let oceanWaveDirection = false;
    let oceanWaveFluctuationRange; // יאותחל ב-setup, טווח תנודה יחסי

    // אנימציות מעבר בין סצנות
    let sceneFadeOutAlpha = 0;
    let sceneFadeInAlpha = 255;
    let isSceneTransitionUnderway = false;
    let nextSceneTarget = "";
    
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
        playerRenderSize = 50 * (p.width / BASE_WIDTH);
        playerBaseMovementSpeed = Math.max(1, 4 * (p.width / BASE_WIDTH)); // מהירות מינימלית של 1
        oceanWavePosition = -140 * (p.height / BASE_HEIGHT);
        oceanWaveFluctuationRange = 100 * (p.height / BASE_HEIGHT);
    };

    // פונקציית draw() של P5.js - מוגדרת בתוך המופע
    p.draw = () => {
        // עדכון זמן המשחק
        if (activeGameScene === "game") {
            gameTimeElapsed = p.floor(p.frameCount / 60); // כל 60 פריימים = שנייה
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
            }
        } else {
            p.background(20, 20, 100);

            // עדכון וציור יצורים ימיים רגועים
            for (let i = docileAquaticLife.length - 1; i >= 0; i--) {
                const entity = docileAquaticLife[i];
                entity.x -= 2 * (p.width / BASE_WIDTH); // מהירות יחסית
                if (entity.type === 0) renderAzureFin(entity.x, entity.y, entity.size, 0);
                if (entity.type === 1) renderCrimsonFin(entity.x, entity.y, entity.size, 0);
                if (entity.type === 2) renderGoldenFin(entity.x, entity.y, entity.size, 0);
                if (entity.type === 3) renderRoseFin(entity.x, entity.y, entity.size, 0);
                if (entity.x < -entity.size) {
                    docileAquaticLife.splice(i, 1);
                }
            }

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
        if ([p.LEFT_ARROW, p.RIGHT_ARROW, p.UP_ARROW, p.DOWN_ARROW, 32].includes(p.keyCode)) {
            p.preventDefault(); // מונע את פעולת ברירת המחדל של הדפדפן
            return false; // מונע גם את הבועה של האירוע
        }
    };
    
    p.keyReleased = () => {
        keyboardInputStates[p.keyCode] = false;
    };

    p.mousePressed = () => {
        if (activeGameScene === "home") {
            const buttonWidth = 200 * (p.width / BASE_WIDTH); // רוחב כפתור
            const buttonHeight = 60 * (p.height / BASE_HEIGHT); // גובה כפתור
            const buttonSpacing = 20 * (p.height / BASE_HEIGHT); // מרווח בין כפתורים
            const startY = p.height * 0.5 - (buttonHeight + buttonSpacing) * 0.5; // מיקום התחלתי Y עבור כפתורים מאונכים

            // כפתור התחלת מסע
            if (p.mouseX > p.width/2 - buttonWidth/2 && p.mouseX < p.width/2 + buttonWidth/2 &&
                p.mouseY > startY - buttonHeight/2 && p.mouseY < startY + buttonHeight/2) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "game";
                // איפוס מצב המשחק כשמתחילים משחק חדש
                playerHealthPoints = 3;
                playerAccumulatedScore = 0;
                playerRenderSize = 50 * (p.width / BASE_WIDTH); // איפוס גודל יחסי
                fishEatenCount = 0;
                largeFishEatenCount = 0;
                minesDodgedCount = 0;
                gameTimeElapsed = 0; // איפוס זמן משחק
                docileAquaticLife = [];
                aggressiveOceanicCreatures = [];
                seaMines = [];
                playerCoordinates.x = p.width / 2; // איפוס מיקום שחקן
                playerCoordinates.y = p.height / 2;
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
            }
            // לוגיקת קניית סקינים במסך הסקינים
            if (activeGameScene === "skins") {
                const skinButtonRadius = 30 * (p.width / BASE_WIDTH); // רדיוס כפתור הסקין
                const skinLineHeight = 80 * (p.height / BASE_HEIGHT);
                const skinX = p.width * 0.2;
                const textX = p.width * 0.5;

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
                                    activePlayerAvatar = skin.name;
                                }
                            } else { // אם כבר נרכש, פשוט הפעל אותו
                                activePlayerAvatar = skin.name;
                            }
                        }
                    }
                });
            }
        }
        
        if (activeGameScene === "death") {
            const buttonSize = 100 * (p.width / BASE_WIDTH);
             if(p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2 + (150 * (p.height / BASE_HEIGHT))) <= buttonSize / 2) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "home";
                playerAccumulatedScore = 0;
                playerHealthPoints = 3;
                playerRenderSize = 50 * (p.width / BASE_WIDTH);
                fishEatenCount = 0;
                largeFishEatenCount = 0;
                minesDodgedCount = 0;
                gameTimeElapsed = 0; // איפוס זמן משחק
                docileAquaticLife = [];
                aggressiveOceanicCreatures = [];
                seaMines = [];
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
        playerRenderSize = 50 * (p.width / BASE_WIDTH);
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
        
        p.ellipse(0, 0, 30, 20); 
        
        p.push();
        p.translate(-15, 0);
        p.rotate(p.sin(p.frameCount * 15) * 10);
        p.triangle(0, 0, -15, 10, -15, -10);
        p.pop();

        p.triangle(5, -10, 15, -15, 10, -5);

        p.fill(eyeTint);
        p.noStroke();
        p.rect(8, -2, 4, 4);
        
        p.stroke(0);
        p.strokeWeight(1);
        p.line(10, 5, 15, 5);

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

        p.ellipse(0, 0, 30, 20); 
        
        p.push();
        p.translate(-15, 0);
        p.rotate(p.sin(p.frameCount * 15) * 10);
        p.triangle(0, 0, -15, 10, -15, -10);
        p.pop();

        p.triangle(5, -10, 15, -15, 10, -5);

        p.noStroke();
        let huePalette = [
            p.color(255, 0, 0), p.color(255, 128, 0), p.color(255, 255, 0),
            p.color(0, 200, 0), p.color(0, 0, 255), p.color(128, 0, 128)
        ];
        for (let i = 0; i < huePalette.length; i++) {
            p.fill(huePalette[i]);
            p.rect(-10 + i * 4, 0, 3, 20);
        }
        
        p.fill(0);
        p.noStroke();
        p.rect(8, -2, 4, 4);
        
        p.stroke(0);
        p.strokeWeight(1);
        p.line(10, 5, 15, 5);

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
        p.ellipse(0, 0, 30, 20); 
        
        p.fill(255, 200, 0);
        p.stroke(200, 150, 0);
        p.triangle(-15, 0, -30, 10, -30, -10);

        p.fill(255, 200, 0);
        p.stroke(200, 150, 0);
        p.triangle(5, -10, 15, -15, 10, -5);

        p.fill(0);
        p.noStroke();
        p.rect(5, 0, 5, 20);
        p.rect(-5, 0, 5, 20);

        p.fill(0);
        p.noStroke();
        p.rect(8, -2, 4, 4);
        
        p.stroke(0);
        p.strokeWeight(1);
        p.line(10, 5, 15, 5);

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
        
        p.triangle(0, -10, 10, -25, 20, -10);

        p.triangle(-20, 0, -30, 10, -30, -10);

        p.fill(0);
        p.noStroke();
        p.ellipse(10, -5, 3, 3);

        p.fill(255);
        p.noStroke();
        p.triangle(10, 5, 12, 8, 8, 8);
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
        p.ellipse(0, 0, 40, 40);
        
        for (let i = 0; i < 8; i++) {
            p.push();
            p.rotate(i * (360 / 8));
            p.line(0, 20, 0, 30);
            p.ellipse(0, 30, 5, 5);
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
        if (activePlayerAvatar === "Phantom") { // רק אם סקין רוח רפאים נבחר
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
        
        // עדכון וציור יצורים ימיים רגועים
        for (let i = docileAquaticLife.length - 1; i >= 0; i--) {
            const entity = docileAquaticLife[i];
            entity.x -= 2 * (p.width / BASE_WIDTH); // קצב תנועה יחסי
            if (entity.type === 0) renderAzureFin(entity.x, entity.y, entity.size, 0);
            if (entity.type === 1) renderCrimsonFin(entity.x, entity.y, entity.size, 0);
            if (entity.type === 2) renderGoldenFin(entity.x, entity.y, entity.size, 0);
            if (entity.type === 3) renderRoseFin(entity.x, entity.y, entity.size, 0);
            
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
                    playerRenderSize = 50 * (p.width / BASE_WIDTH); // איפוס גודל יחסי
                    // איפוס מד הדג-מטר
                    currentFoodSize = 0;
                    maxFoodSize = 0;
                    docileAquaticLife.splice(i, 1); // הסרת הדג לאחר התנגשות
                    if (playerHealthPoints <= 0) {
                        isSceneTransitionUnderway = true;
                        nextSceneTarget = "death";
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
                playerRenderSize = 50 * (p.width / BASE_WIDTH); // איפוס גודל יחסי
                aggressiveOceanicCreatures.splice(i, 1); // הסרת הטורף לאחר פגיעה
                if (playerHealthPoints <= 0) {
                    isSceneTransitionUnderway = true;
                    nextSceneTarget = "death";
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
        p.text(`ניקוד: ${playerAccumulatedScore}`, p.width * 0.1, p.height * 0.05);
        p.text(`חיים: ${playerHealthPoints}`, p.width * 0.1, p.height * 0.1);
        p.text(`מטבעות: ${currentCoinBalance}`, p.width * 0.1, p.height * 0.15);
        
        // ציור מד אנרגיית מצב חמקמק
        if (phantomAbilityActive) {
            const meterWidth = 200 * (p.width / BASE_WIDTH);
            const meterHeight = 20 * (p.height / BASE_HEIGHT);
            p.stroke(255);
            p.noFill();
            p.rect(p.width * 0.5, p.height * 0.05, meterWidth, meterHeight);
            p.fill(255, 255, 255, 100);
            p.noStroke();
            p.rect(p.width * 0.5 - meterWidth/2 + (playerPhantomEnergy / 100) * meterWidth / 2, p.height * 0.05, (playerPhantomEnergy / 100) * meterWidth, meterHeight);
        }

        // ציור מד הדג-מטר (Fish-o-meter)
        const meterWidth = 200 * (p.width / BASE_WIDTH);
        const meterHeight = 20 * (p.height / BASE_HEIGHT);
        p.stroke(255);
        p.noFill();
        p.rect(p.width * 0.5, p.height * 0.1, meterWidth, meterHeight); // מסגרת המד
        if (maxFoodSize > 0) {
            let meterFill = p.map(currentFoodSize, 0, maxFoodSize, 0, meterWidth);
            p.fill(0, 200, 0, 150); // צבע ירוק
            p.noStroke();
            p.rect(p.width * 0.5 - meterWidth/2 + meterFill / 2, p.height * 0.1, meterFill, meterHeight);
        }
        p.fill(255);
        p.textSize(16 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("דג-מטר", p.width * 0.5, p.height * 0.1 + (25 * (p.height / BASE_HEIGHT)));
        
        // ציור אווטאר השחקן הנוכחי
        switch (activePlayerAvatar) {
            case "Azure Fin": // כחול
                renderAzureFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Crimson Fin": // אדום
                renderCrimsonFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Golden Fin": // צהוב
                renderGoldenFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Rose Fin": // ורוד
                renderRoseFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Phantom": // רוח רפאים
                renderPhantomFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Predator": // טורף
                renderPredatorFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Forgetful": // שכחן
                renderForgetfulFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Prismatic": // פריזמטי
                renderPrismaticFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
        }
        
        generateNewDocileAquaticLife();
        generateNewAggressiveOceanicCreature();
        generateSeaMine();
    };

    const renderAccomplishmentsScreen = () => {
        p.fill(255);
        p.textSize(50 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("הישגים", p.width/2, p.height * 0.1);
        
        p.textSize(25 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.textAlign(p.RIGHT); // יישור לימין לרשימת הישגים
        let achievementY = p.height * 0.25;
        const lineHeight = 40 * (p.height / BASE_HEIGHT); // מרווח שורה יחסי

        // הישג 1: 100 נקודות
        p.fill(achievementLogEntryOne ? p.color(0, 200, 0) : p.color(150)); // ירוק אם הושג, אפור אחרת
        p.text(`השג 100 נקודות: ${achievementLogEntryOne ? "הושלם!" : "לא הושלם"}`, p.width * 0.8, achievementY);
        if (playerAccumulatedScore >= 100 && !achievementLogEntryOne) {
            achievementLogEntryOne = true;
        }

        // הישג 2: 500 נקודות
        achievementY += lineHeight;
        p.fill(achievementLogEntryTwo ? p.color(0, 200, 0) : p.color(150));
        p.text(`השג 500 נקודות: ${achievementLogEntryTwo ? "הושלם!" : "לא הושלם"}`, p.width * 0.8, achievementY);
        if (playerAccumulatedScore >= 500 && !achievementLogEntryTwo) {
            achievementLogEntryTwo = true;
        }

        // הישג 3: 1000 נקודות
        achievementY += lineHeight;
        p.fill(achievementLogEntryThree ? p.color(0, 200, 0) : p.color(150));
        p.text(`השג 1000 נקודות: ${achievementLogEntryThree ? "הושלם!" : "לא הושלם"}`, p.width * 0.8, achievementY);
        if (playerAccumulatedScore >= 1000 && !achievementLogEntryThree) {
            achievementLogEntryThree = true;
        }

        // הישג 4: אכל 100 יצורים
        achievementY += lineHeight;
        p.fill(achievementLogEntryFour ? p.color(0, 200, 0) : p.color(150));
        p.text(`אכל 100 יצורים ימיים: ${achievementLogEntryFour ? "הושלם!" : `(${fishEatenCount}/100)`}`, p.width * 0.8, achievementY);
        if (fishEatenCount >= 100 && !achievementLogEntryFour) {
            achievementLogEntryFour = true;
        }

        // הישג 5: התחמק מ-50 מוקשים
        achievementY += lineHeight;
        p.fill(achievementLogEntryFive ? p.color(0, 200, 0) : p.color(150));
        p.text(`התחמק מ-50 מוקשי ים: ${achievementLogEntryFive ? "הושלם!" : `(${minesDodgedCount}/50)`}`, p.width * 0.8, achievementY);
        if (minesDodgedCount >= 50 && !achievementLogEntryFive) {
            achievementLogEntryFive = true;
        }

        // הישג 6: הרוויח 1000 מטבעות
        achievementY += lineHeight;
        p.fill(achievementLogEntrySix ? p.color(0, 200, 0) : p.color(150));
        p.text(`הרווח 1000 מטבעות: ${achievementLogEntrySix ? "הושלם!" : `(${currentCoinBalance}/1000)`}`, p.width * 0.8, achievementY);
        if (currentCoinBalance >= 1000 && !achievementLogEntrySix) {
            achievementLogEntrySix = true;
        }

        // הישג 7: שיחק 5 דקות (300 שניות)
        achievementY += lineHeight;
        p.fill(achievementLogEntrySeven ? p.color(0, 200, 0) : p.color(150));
        p.text(`שחק 5 דקות: ${achievementLogEntrySeven ? "הושלם!" : `(${p.floor(gameTimeElapsed/60)}/${5})`}`, p.width * 0.8, achievementY);
        if (gameTimeElapsed >= 300 && !achievementLogEntrySeven) {
            achievementLogEntrySeven = true;
        }

        // הישג 8: הגיע לגודל 200
        achievementY += lineHeight;
        p.fill(achievementLogEntryEight ? p.color(0, 200, 0) : p.color(150));
        p.text(`הגיע לגודל ${p.round(200 * (p.width / BASE_WIDTH))}: ${achievementLogEntryEight ? "הושלם!" : `(${p.round(playerRenderSize)}/${p.round(200 * (p.width / BASE_WIDTH))})`}`, p.width * 0.8, achievementY);
        if (playerRenderSize >= 200 * (p.width / BASE_WIDTH) && !achievementLogEntryEight) {
            achievementLogEntryEight = true;
        }

        // הישג 9: שרד 10 דקות (600 שניות)
        achievementY += lineHeight;
        p.fill(achievementLogEntryNine ? p.color(0, 200, 0) : p.color(150));
        p.text(`שרד 10 דקות: ${achievementLogEntryNine ? "הושלם!" : `(${p.floor(gameTimeElapsed/60)}/${10})`}`, p.width * 0.8, achievementY);
        if (gameTimeElapsed >= 600 && !achievementLogEntryNine) {
            achievementLogEntryNine = true;
        }

        // הישג 10: אכל 50 דגים גדולים (גודל מעל 100)
        achievementY += lineHeight;
        p.fill(achievementLogEntryTen ? p.color(0, 200, 0) : p.color(150));
        p.text(`אכל 50 יצורים ימיים גדולים: ${achievementLogEntryTen ? "הושלם!" : `(${largeFishEatenCount}/50)`}`, p.width * 0.8, achievementY);
        if (largeFishEatenCount >= 50 && !achievementLogEntryTen) {
            achievementLogEntryTen = true;
        }

        p.textAlign(p.CENTER); // החזרת יישור למרכז
        
        // כפתור חזרה למסך הראשי
        const backButtonSize = 100 * (p.width / BASE_WIDTH);
        p.fill(163, 163, 255, 100);
        if(p.dist(p.mouseX, p.mouseY, 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT))) <= backButtonSize / 2) {
            p.fill(163, 163, 255, 50);
            p.cursor(p.HAND);
        } else {
            p.fill(163, 163, 255, 100);
            p.cursor(p.ARROW);
        }
        p.ellipse(100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT)), backButtonSize, backButtonSize);
        p.fill(255);
        p.textSize(40 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("חזור", 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT)));
    };

    // נתוני סקינים (שם, עלות, דגל רכישה בקוד)
    const skinsData = [
        { name: "סנפיר תכלת", cost: 0, acquiredFlag: "default", renderFunc: renderAzureFin }, // ברירת מחדל
        { name: "סנפיר ארגמן", cost: 1500, acquiredFlag: "predatorSkinAcquired", renderFunc: renderCrimsonFin },
        { name: "סנפיר זהב", cost: 3000, acquiredFlag: "forgetfulSkinAcquired", renderFunc: renderGoldenFin },
        { name: "סנפיר ורד", cost: 5000, acquiredFlag: "prismaticSkinAcquired", renderFunc: renderRoseFin },
        { name: "רוח רפאים", cost: 8000, acquiredFlag: "phantomSkinAcquired", renderFunc: renderPhantomFin },
        { name: "טורף", cost: 12000, acquiredFlag: "predatorSkinAcquired", renderFunc: renderPredatorFin }, // שימוש חוזר בדגל, נתקן את זה
        { name: "שכחן", cost: 15000, acquiredFlag: "forgetfulSkinAcquired", renderFunc: renderForgetfulFin }, // שימוש חוזר בדגל, נתקן את זה
        { name: "פריזמטי", cost: 20000, acquiredFlag: "prismaticSkinAcquired", renderFunc: renderPrismaticFin } // שימוש חוזר בדגל, נתקן את זה
    ];

    const renderAvatarSelectionScreen = () => {
        p.fill(255);
        p.textSize(50 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("בחירת אווטאר", p.width/2, p.height * 0.1);
        
        p.textSize(25 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        let skinY = p.height * 0.25;
        const skinLineHeight = 80 * (p.height / BASE_HEIGHT);
        const skinX = p.width * 0.2; // מיקום עמודת אווטארים
        const textX = p.width * 0.5; // מיקום עמודת טקסט
        const buttonRadius = 30 * (p.width / BASE_WIDTH); // רדיוס כפתורי הסקין

        skinsData.forEach((skin, index) => {
            const currentSkinY = p.height * 0.25 + (index * skinLineHeight);
            let isAcquired = false;
            // בדיקה האם הסקין נרכש (באמצעות הדגל המתאים)
            if (skin.acquiredFlag === "default") {
                isAcquired = true; // סקין ברירת מחדל תמיד נרכש
            } else if (skin.acquiredFlag === "phantomSkinAcquired") {
                isAcquired = phantomSkinAcquired;
            } else if (skin.acquiredFlag === "predatorSkinAcquired") {
                isAcquired = predatorSkinAcquired;
            } else if (skin.acquiredFlag === "forgetfulSkinAcquired") {
                isAcquired = forgetfulSkinAcquired;
            } else if (skin.acquiredFlag === "prismaticSkinAcquired") {
                isAcquired = prismaticSkinAcquired;
            }

            p.fill(255);
            p.text(`${skin.name} (${skin.cost} מטבעות)`, textX, currentSkinY);
            
            // ציור האווטאר באמצעות פונקציית הרינדור הספציפית
            skin.renderFunc(skinX, currentSkinY, 50 * (p.width / BASE_WIDTH), 0);

            if (activePlayerAvatar === skin.name) { p.text("פעיל", textX + 150 * (p.width / BASE_WIDTH), currentSkinY); }
            else if (isAcquired || skin.cost === 0) { // אם נרכש או ברירת מחדל
                p.fill(0, 200, 0); p.text("בחר", textX + 150 * (p.width / BASE_WIDTH), currentSkinY);
                if (p.dist(p.mouseX, p.mouseY, skinX, currentSkinY) < buttonRadius && p.mouseIsPressed) {
                    activePlayerAvatar = skin.name;
                }
            } else if (currentCoinBalance >= skin.cost) { // אם יש מספיק מטבעות לקנות
                p.fill(0, 200, 0); p.text("קנה", textX + 150 * (p.width / BASE_WIDTH), currentSkinY);
                if (p.dist(p.mouseX, p.mouseY, skinX, currentSkinY) < buttonRadius && p.mouseIsPressed) {
                    currentCoinBalance -= skin.cost;
                    // עדכון דגל הרכישה המתאים
                    if (skin.acquiredFlag === "phantomSkinAcquired") phantomSkinAcquired = true;
                    else if (skin.acquiredFlag === "predatorSkinAcquired") predatorSkinAcquired = true;
                    else if (skin.acquiredFlag === "forgetfulSkinAcquired") forgetfulSkinAcquired = true;
                    else if (skin.acquiredFlag === "prismaticSkinAcquired") prismaticSkinAcquired = true;
                    activePlayerAvatar = skin.name;
                }
            } else { // אין מספיק מטבעות
                p.fill(200, 0, 0); p.text("חסר", textX + 150 * (p.width / BASE_WIDTH), currentSkinY);
            }
            if (p.dist(p.mouseX, p.mouseY, skinX, currentSkinY) < buttonRadius) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        });


        // כפתור חזרה למסך הראשי
        const backButtonSize = 100 * (p.width / BASE_WIDTH);
        p.fill(163, 163, 255, 100);
        if(p.dist(p.mouseX, p.mouseY, 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT))) <= backButtonSize / 2) {
            p.fill(163, 163, 255, 50);
            p.cursor(p.HAND);
        } else {
            p.fill(163, 163, 255, 100);
            p.cursor(p.ARROW);
        }
        p.ellipse(100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT)), backButtonSize, backButtonSize);
        p.fill(255);
        p.textSize(40 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("חזור", 100 * (p.width / BASE_WIDTH), p.height - (50 * (p.height / BASE_HEIGHT)));
    };

    const renderGameOverScreen = () => {
        p.fill(255);
        p.textSize(100 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("המסע נגמר", p.width/2, p.height/2 - (50 * (p.height / BASE_HEIGHT)));
        p.textSize(50 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text(`ניקוד סופי: ${playerAccumulatedScore}`, p.width/2, p.height/2 + (50 * (p.height / BASE_HEIGHT)));
        
        // כפתור חזרה למסך הכותרת
        const buttonSize = 100 * (p.width / BASE_WIDTH);
        p.fill(255, 0, 0);
        if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2 + (150 * (p.height / BASE_HEIGHT))) < buttonSize / 2) {
            p.fill(200, 0, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(255, 0, 0);
            p.cursor(p.ARROW);
        }
        p.ellipse(p.width/2, p.height/2 + (150 * (p.height / BASE_HEIGHT)), buttonSize, buttonSize);
        p.fill(255);
        p.textSize(40 * (p.width / BASE_WIDTH)); // גודל טקסט יחסי
        p.text("חזרה לתפריט", p.width/2, p.height/2 + (150 * (p.height / BASE_HEIGHT)));
    };
};
