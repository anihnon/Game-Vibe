// הגדרת הסקצ' של p5.js במצב מופע
const gameSketch = function(p) {

    // נתוני שמירת משחק, מפורקים למשתנים נגישים
    // [מטבעות, רוח רפאים נרכש, טורף נרכש, שכחן נרכש, פריזמטי נרכש, רוח רפאים פעיל, טורף פעיל, אווטאר פעיל, הישג 1, הישג 2, הישג 3, רמה, הישג 100 רמות, הישג 4, הישג 5]
    let gamePersistenceData = [100, false, false, false, false, true, false, "Azure Fin", false, false, false, 2, false, false, false];
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
    let grandMasterAchievement = gamePersistenceData[12]; // הישג: רמה 100
    let achievementLogEntryFour = gamePersistenceData[13]; // הישג: אכל 100 דגים
    let achievementLogEntryFive = gamePersistenceData[14]; // הישג: התחמק מ-50 מוקשים

    // מצב המסך הפעיל
    let activeGameScene = "home";

    // מאפייני יצור השחקן
    let playerCoordinates = { x: 0, y: 0 }; // יאותחל ב-setup
    let playerRenderSize = 50;
    let playerFacingAngle = 0;
    let playerBaseMovementSpeed = 4;
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
    let minesDodgedCount = 0; // מונה מוקשים שחמקו

    // מד "הדג-מטר"
    let currentFoodSize = 0; // גודל הדג האחרון שנאכל
    let maxFoodSize = 0; // גודל הדג המקסימלי שניתן לאכול

    // מכניקת גלי הים
    let oceanWavePosition = -140;
    let oceanWaveDirection = false;
    let oceanWaveFluctuationRange = 100;

    // אנימציות מעבר בין סצנות
    let sceneFadeOutAlpha = 0;
    let sceneFadeInAlpha = 255;
    let isSceneTransitionUnderway = false;
    let nextSceneTarget = "";
    
    // פונקציית setup() של P5.js - מוגדרת בתוך המופע
    p.setup = () => {
        // יצירת הקנבס והצמדתו ל-div עם id 'gameContainer'
        const canvas = p.createCanvas(800, 600); // גודל התחלתי קבוע
        canvas.parent('gameContainer'); 
        
        // התאמת גודל הקנבס למיכל שלו באופן מיידי
        const containerRect = document.getElementById('gameContainer').getBoundingClientRect();
        p.resizeCanvas(containerRect.width, containerRect.width * (600/800)); // שמירה על יחס גובה-רוחב

        // אתחול מצבי רינדור של p5.js
        p.rectMode(p.CENTER);
        p.textFont("Comic Sans MS");
        p.textAlign(p.CENTER, p.CENTER);

        // אתחול מיקום השחקן למרכז הקנבס
        playerCoordinates.x = p.width / 2;
        playerCoordinates.y = p.height / 2;
    };

    // פונקציית draw() של P5.js - מוגדרת בתוך המופע
    p.draw = () => {
        
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
                entity.x -= 2;
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
    };
    
    p.keyReleased = () => {
        keyboardInputStates[p.keyCode] = false;
    };

    p.mousePressed = () => {
        if (activeGameScene === "home") {
            if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2) < 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "game";
                // איפוס מצב המשחק כשמתחילים משחק חדש
                playerHealthPoints = 3;
                playerAccumulatedScore = 0;
                playerRenderSize = 50;
                fishEatenCount = 0;
                minesDodgedCount = 0;
                docileAquaticLife = [];
                aggressiveOceanicCreatures = [];
                seaMines = [];
            }
            if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2 + 150) < 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "achievements";
            }
            if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2 + 300) < 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "skins";
            }
        }
        
        if (activeGameScene === "achievements" || activeGameScene === "skins") {
             if(p.dist(p.mouseX, p.mouseY, 100, 500) <= 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "home";
            }
        }
        
        if (activeGameScene === "death") {
             if(p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2 + 150) <= 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "home";
                playerAccumulatedScore = 0;
                playerHealthPoints = 3;
                playerRenderSize = 50;
                fishEatenCount = 0;
                minesDodgedCount = 0;
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
        const containerRect = document.getElementById('gameContainer').getBoundingClientRect();
        p.resizeCanvas(containerRect.width, containerRect.width * (600/800)); // שמירה על יחס גובה-רוחב
        // עדכון מיקום השחקן לאחר שינוי גודל
        playerCoordinates.x = p.width / 2;
        playerCoordinates.y = p.height / 2;
    };

    // פונקציות עזר לציור יצורים - כעת פנימיות לסקצ'
    const renderBasicAquaticForm = (xPos, yPos, sizeRatio, rotationAngle, mainColor, outlineShade, eyeTint) => {
        p.fill(mainColor);
        p.stroke(outlineShade);
        p.strokeWeight(sizeRatio / 60);
        p.push();
        p.translate(xPos, yPos);
        p.scale(sizeRatio / 70);
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
        p.push();
        p.translate(x, y);
        p.scale(s / 70);
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
        p.push();
        p.translate(x, y);
        p.scale(s / 70);
        p.rotate(r);
        
        p.fill(0, 100, 200);
        p.stroke(0, 50, 150);
        p.strokeWeight(s / 60);
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
        p.push();
        p.translate(x, y);
        p.scale(s / 70);
        p.rotate(r);
        
        p.fill(100, 100, 100);
        p.stroke(70, 70, 70);
        p.strokeWeight(s / 60);
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
        p.push();
        p.translate(x, y);
        p.scale(size / 50);
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
        if (p.frameCount % 60 === 0) {
            let newEntity = {
                x: p.random(p.width, p.width + 1000),
                y: p.random(p.height),
                size: p.random(20, playerRenderSize * 1.2), // גודל דג קטן יותר או מעט גדול יותר מהשחקן
                type: p.floor(p.random(0, 4))
            };
            docileAquaticLife.push(newEntity);
        }
    };
    
    const generateNewAggressiveOceanicCreature = () => {
        // יצירת כרישים
        if (p.frameCount % 180 === 0) { // פחות כרישים
            let newPredator = {
                x: p.random(p.width, p.width + 1000),
                y: p.random(p.height),
                size: p.random(playerRenderSize * 1.5, playerRenderSize * 3),
                velocity: p.random(2, 5)
            };
            aggressiveOceanicCreatures.push(newPredator);
        }
    };

    // פונקציה חדשה ליצירת מוקשי ים
    const generateSeaMine = () => {
        if (p.frameCount % 240 === 0) { // כל 4 שניות בערך
            let newMine = {
                x: p.random(p.width, p.width + 500),
                y: p.random(p.height),
                size: p.random(30, 60),
                velocity: p.random(0.5, 1.5)
            };
            seaMines.push(newMine);
        }
    };

    const renderMainTitleScreen = () => {
        p.fill(255);
        p.textSize(p.width * 0.1); // גודל טקסט יחסי
        p.text("הגאות הגדולה", p.width/2, p.height * 0.2);
        
        // כפתור התחלת מסע
        p.fill(255, 0, 0);
        if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height * 0.5) < 50) {
            p.fill(200, 0, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(255, 0, 0);
            p.cursor(p.ARROW);
        }
        p.ellipse(p.width/2, p.height * 0.5, 100, 100);
        p.fill(255);
        p.textSize(40);
        p.text("התחל מסע", p.width/2, p.height * 0.5);
        
        // כפתור צפייה בהישגים
        p.fill(0, 255, 0);
        if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height * 0.5 + 150) < 50) {
            p.fill(0, 200, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(0, 255, 0);
            p.cursor(p.ARROW);
        }
        p.ellipse(p.width/2, p.height * 0.5 + 150, 100, 100);
        p.fill(255);
        p.textSize(40);
        p.text("הישגים", p.width/2, p.height * 0.5 + 150);

        // כפתור בחירת אווטארים
        p.fill(0, 0, 255);
        if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height * 0.5 + 300) < 50) {
            p.fill(0, 0, 200);
            p.cursor(p.HAND);
        } else {
            p.fill(0, 0, 255);
            p.cursor(p.ARROW);
        }
        p.ellipse(p.width/2, p.height * 0.5 + 300, 100, 100);
        p.fill(255);
        p.textSize(40);
        p.text("אווטארים", p.width/2, p.height * 0.5 + 300);
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
            entity.x -= 2; // קצב תנועה
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
                    // עדכון מד הדג-מטר
                    currentFoodSize = entity.size;
                    maxFoodSize = playerRenderSize; // גודל השחקן הנוכחי
                    docileAquaticLife.splice(i, 1);
                } else if (!playerPhasedState) { // לא יכול לאכול ואינו במצב חמקמק
                    playerHealthPoints--;
                    playerRenderSize = 50; // איפוס גודל
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
                playerRenderSize = 50; // איפוס גודל
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
        oceanWavePosition += oceanWaveDirection ? 0.5 : -0.5;
        if (oceanWavePosition < -oceanWaveFluctuationRange) oceanWaveDirection = true;
        if (oceanWavePosition > p.height * 0.2) oceanWaveDirection = false; // הגבלת גובה הגל לחלק עליון של המסך
        p.fill(0, 0, 100, 200);
        p.noStroke();
        p.rect(p.width/2, oceanWavePosition + p.height * 0.2, p.width, p.height * 0.4); // ציור הגל
        
        // ציור ממשק משתמש
        p.fill(255);
        p.textSize(20);
        p.text(`ניקוד: ${playerAccumulatedScore}`, p.width * 0.1, p.height * 0.05);
        p.text(`חיים: ${playerHealthPoints}`, p.width * 0.1, p.height * 0.1);
        p.text(`מטבעות: ${currentCoinBalance}`, p.width * 0.1, p.height * 0.15);
        
        // ציור מד אנרגיית מצב חמקמק
        if (phantomAbilityActive) {
            p.stroke(255);
            p.noFill();
            p.rect(p.width * 0.5, p.height * 0.05, 200, 20);
            p.fill(255, 255, 255, 100);
            p.noStroke();
            p.rect(p.width * 0.5 - 100 + playerPhantomEnergy, p.height * 0.05, playerPhantomEnergy * 2, 20);
        }

        // ציור מד הדג-מטר (Fish-o-meter)
        p.stroke(255);
        p.noFill();
        p.rect(p.width * 0.5, p.height * 0.1, 200, 20); // מסגרת המד
        if (maxFoodSize > 0) {
            let meterFill = p.map(currentFoodSize, 0, maxFoodSize, 0, 200);
            p.fill(0, 200, 0, 150); // צבע ירוק
            p.noStroke();
            p.rect(p.width * 0.5 - 100 + meterFill / 2, p.height * 0.1, meterFill, 20);
        }
        p.fill(255);
        p.textSize(16);
        p.text("דג-מטר", p.width * 0.5, p.height * 0.1 + 25);
        
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
        p.textSize(50);
        p.text("הישגים", p.width/2, p.height * 0.1);
        
        p.textSize(25);
        p.textAlign(p.RIGHT); // יישור לימין לרשימת הישגים
        let achievementY = p.height * 0.25;
        const lineHeight = 40;

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

        // הישג 4: אכל 100 דגים
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

        p.textAlign(p.CENTER); // החזרת יישור למרכז
        
        // כפתור חזרה למסך הראשי
        p.fill(163, 163, 255, 100);
        if(p.dist(p.mouseX, p.mouseY, 100, p.height - 50) <= 50) { // מיקום יחסי
            p.fill(163, 163, 255, 50);
            p.cursor(p.HAND);
        } else {
            p.fill(163, 163, 255, 100);
            p.cursor(p.ARROW);
        }
        p.ellipse(100, p.height - 50, 100, 100);
        p.fill(255);
        p.text("חזור", 100, p.height - 50);
    };

    const renderAvatarSelectionScreen = () => {
        p.fill(255);
        p.textSize(50);
        p.text("בחירת אווטאר", p.width/2, p.height * 0.1);
        
        p.textSize(25);
        let skinY = p.height * 0.25;
        const skinLineHeight = 80;
        const skinX = p.width * 0.2; // מיקום עמודת אווטארים
        const textX = p.width * 0.5; // מיקום עמודת טקסט

        // סקין כחול (ברירת מחדל)
        p.fill(255);
        p.text("סנפיר תכלת (ברירת מחדל)", textX, skinY);
        renderAzureFin(skinX, skinY, 50, 0);
        if (activePlayerAvatar === "Azure Fin") { p.text("פעיל", textX + 150, skinY); }
        if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { activePlayerAvatar = "Azure Fin"; }

        // סקין אדום
        skinY += skinLineHeight;
        p.fill(255);
        p.text("סנפיר ארגמן (100 מטבעות)", textX, skinY);
        renderCrimsonFin(skinX, skinY, 50, 0);
        if (activePlayerAvatar === "Crimson Fin") { p.text("פעיל", textX + 150, skinY); }
        else if (currentCoinBalance >= 100 || predatorSkinAcquired) {
            p.fill(0, 200, 0); p.text("קנה", textX + 150, skinY);
            if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && p.mouseIsPressed && !predatorSkinAcquired) {
                currentCoinBalance -= 100; predatorSkinAcquired = true; activePlayerAvatar = "Crimson Fin";
            }
        } else { p.fill(200, 0, 0); p.text("חסר", textX + 150, skinY); }
        if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && (currentCoinBalance >= 100 || predatorSkinAcquired)) { activePlayerAvatar = "Crimson Fin"; }

        // סקין צהוב
        skinY += skinLineHeight;
        p.fill(255);
        p.text("סנפיר זהב (200 מטבעות)", textX, skinY);
        renderGoldenFin(skinX, skinY, 50, 0);
        if (activePlayerAvatar === "Golden Fin") { p.text("פעיל", textX + 150, skinY); }
        else if (currentCoinBalance >= 200 || forgetfulSkinAcquired) {
            p.fill(0, 200, 0); p.text("קנה", textX + 150, skinY);
            if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && p.mouseIsPressed && !forgetfulSkinAcquired) {
                currentCoinBalance -= 200; forgetfulSkinAcquired = true; activePlayerAvatar = "Golden Fin";
            }
        } else { p.fill(200, 0, 0); p.text("חסר", textX + 150, skinY); }
        if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && (currentCoinBalance >= 200 || forgetfulSkinAcquired)) { activePlayerAvatar = "Golden Fin"; }

        // סקין ורוד
        skinY += skinLineHeight;
        p.fill(255);
        p.text("סנפיר ורד (300 מטבעות)", textX, skinY);
        renderRoseFin(skinX, skinY, 50, 0);
        if (activePlayerAvatar === "Rose Fin") { p.text("פעיל", textX + 150, skinY); }
        else if (currentCoinBalance >= 300 || prismaticSkinAcquired) {
            p.fill(0, 200, 0); p.text("קנה", textX + 150, skinY);
            if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && p.mouseIsPressed && !prismaticSkinAcquired) {
                currentCoinBalance -= 300; prismaticSkinAcquired = true; activePlayerAvatar = "Rose Fin";
            }
        } else { p.fill(200, 0, 0); p.text("חסר", textX + 150, skinY); }
        if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && (currentCoinBalance >= 300 || prismaticSkinAcquired)) { activePlayerAvatar = "Rose Fin"; }

        // סקין רוח רפאים
        skinY += skinLineHeight;
        p.fill(255);
        p.text("רוח רפאים (400 מטבעות)", textX, skinY);
        renderPhantomFin(skinX, skinY, 50, 0);
        if (activePlayerAvatar === "Phantom") { p.text("פעיל", textX + 150, skinY); }
        else if (currentCoinBalance >= 400 || phantomSkinAcquired) {
            p.fill(0, 200, 0); p.text("קנה", textX + 150, skinY);
            if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && p.mouseIsPressed && !phantomSkinAcquired) {
                currentCoinBalance -= 400; phantomSkinAcquired = true; activePlayerAvatar = "Phantom";
            }
        } else { p.fill(200, 0, 0); p.text("חסר", textX + 150, skinY); }
        if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && (currentCoinBalance >= 400 || phantomSkinAcquired)) { activePlayerAvatar = "Phantom"; }

        // סקין טורף
        skinY += skinLineHeight;
        p.fill(255);
        p.text("טורף (500 מטבעות)", textX, skinY);
        renderPredatorFin(skinX, skinY, 50, 0);
        if (activePlayerAvatar === "Predator") { p.text("פעיל", textX + 150, skinY); }
        else if (currentCoinBalance >= 500 || predatorSkinAcquired) { // שימוש ב-predatorSkinAcquired שכבר קיים
            p.fill(0, 200, 0); p.text("קנה", textX + 150, skinY);
            if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && p.mouseIsPressed && !predatorSkinAcquired) {
                currentCoinBalance -= 500; predatorSkinAcquired = true; activePlayerAvatar = "Predator";
            }
        } else { p.fill(200, 0, 0); p.text("חסר", textX + 150, skinY); }
        if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && (currentCoinBalance >= 500 || predatorSkinAcquired)) { activePlayerAvatar = "Predator"; }

        // סקין שכחן
        skinY += skinLineHeight;
        p.fill(255);
        p.text("שכחן (600 מטבעות)", textX, skinY);
        renderForgetfulFin(skinX, skinY, 50, 0);
        if (activePlayerAvatar === "Forgetful") { p.text("פעיל", textX + 150, skinY); }
        else if (currentCoinBalance >= 600 || forgetfulSkinAcquired) { // שימוש ב-forgetfulSkinAcquired שכבר קיים
            p.fill(0, 200, 0); p.text("קנה", textX + 150, skinY);
            if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && p.mouseIsPressed && !forgetfulSkinAcquired) {
                currentCoinBalance -= 600; forgetfulSkinAcquired = true; activePlayerAvatar = "Forgetful";
            }
        } else { p.fill(200, 0, 0); p.text("חסר", textX + 150, skinY); }
        if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && (currentCoinBalance >= 600 || forgetfulSkinAcquired)) { activePlayerAvatar = "Forgetful"; }

        // סקין פריזמטי
        skinY += skinLineHeight;
        p.fill(255);
        p.text("פריזמטי (700 מטבעות)", textX, skinY);
        renderPrismaticFin(skinX, skinY, 50, 0);
        if (activePlayerAvatar === "Prismatic") { p.text("פעיל", textX + 150, skinY); }
        else if (currentCoinBalance >= 700 || prismaticSkinAcquired) { // שימוש ב-prismaticSkinAcquired שכבר קיים
            p.fill(0, 200, 0); p.text("קנה", textX + 150, skinY);
            if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && p.mouseIsPressed && !prismaticSkinAcquired) {
                currentCoinBalance -= 700; prismaticSkinAcquired = true; activePlayerAvatar = "Prismatic";
            }
        } else { p.fill(200, 0, 0); p.text("חסר", textX + 150, skinY); }
        if (p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30) { p.cursor(p.HAND); } else { p.cursor(p.ARROW); }
        if (p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, skinX, skinY) < 30 && (currentCoinBalance >= 700 || prismaticSkinAcquired)) { activePlayerAvatar = "Prismatic"; }


        // כפתור חזרה למסך הראשי
        p.fill(163, 163, 255, 100);
        if(p.dist(p.mouseX, p.mouseY, 100, p.height - 50) <= 50) {
            p.fill(163, 163, 255, 50);
            p.cursor(p.HAND);
        } else {
            p.fill(163, 163, 255, 100);
            p.cursor(p.ARROW);
        }
        p.ellipse(100, p.height - 50, 100, 100);
        p.fill(255);
        p.text("חזור", 100, p.height - 50);
    };

    const renderGameOverScreen = () => {
        p.fill(255);
        p.textSize(100);
        p.text("המסע נגמר", p.width/2, p.height/2 - 50);
        p.textSize(50);
        p.text(`ניקוד סופי: ${playerAccumulatedScore}`, p.width/2, p.height/2 + 50);
        
        // כפתור חזרה למסך הכותרת
        p.fill(255, 0, 0);
        if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2 + 150) < 50) {
            p.fill(200, 0, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(255, 0, 0);
            p.cursor(p.ARROW);
        }
        p.ellipse(p.width/2, p.height/2 + 150, 100, 100);
        p.fill(255);
        p.textSize(40);
        p.text("חזרה לתפריט", p.width/2, p.height/2 + 150);
    };
};

// אין צורך במשתנה גלובלי gameInstance או בפונקציות setup/draw/etc. גלובליות
// מכיוון שהסקצ' יופעל במצב מופע מה-HTML
