// מערכת הליבה של המשחק
const GameCoreSystem = function() {

    // נתוני שמירת משחק, מפורקים למשתנים נגישים
    let gamePersistenceData = [100, false, false, false, false, true, false, "Rainbow Fish", false, false, false, 2, false, false, false];
    let currentCoinBalance = gamePersistenceData[0];
    let phantomSkinAcquired = gamePersistenceData[1]; // רוח רפאים
    let predatorSkinAcquired = gamePersistenceData[2]; // טורף
    let forgetfulSkinAcquired = gamePersistenceData[3]; // שכחן
    let prismaticSkinAcquired = gamePersistenceData[4]; // פריזמטי
    let phantomAbilityActive = gamePersistenceData[5];
    let predatorAbilityActive = gamePersistenceData[6];
    let activePlayerAvatar = gamePersistenceData[7]; // אווטאר השחקן הנוכחי
    let achievementLogEntryOne = gamePersistenceData[8];
    let achievementLogEntryTwo = gamePersistenceData[9];
    let achievementLogEntryThree = gamePersistenceData[10];
    let currentExpeditionLevel = gamePersistenceData[11]; // רמת המסע הנוכחית
    let grandMasterAchievement = gamePersistenceData[12];
    let achievementLogEntryFour = gamePersistenceData[13];
    let achievementLogEntryFive = gamePersistenceData[14];

    // מצב המסך הפעיל
    let activeGameScene = "home";

    // מאפייני יצור השחקן
    let playerCoordinates = { x: 500, y: 300 };
    let playerRenderSize = 50;
    let playerFacingAngle = 0;
    let playerVerticalMovementRate = 0;
    let playerBaseMovementSpeed = 4;
    let playerPhantomEnergy = 100;
    let playerPhasedState = false; // מצב חמקמק
    let phasedCooldownTimer = 0;

    // ניהול קלט מקלדת
    let keyboardInputStates = [];

    // אובייקטים בתוך הסביבה הימית
    let docileAquaticLife = []; // יצורים ימיים רגועים (דגים קטנים)
    let aggressiveOceanicCreatures = []; // יצורים אוקיינוסים תוקפניים (כרישים)
    let seaMines = []; // מוקשי ים חדשים
    let launchedProjectiles = []; // קליעים שנורו
    let playerHealthPoints = 3;
    let colossalCreatureHealth = 100; // בריאות יצור ענק (בוס)
    let isPlayerEliminated = false;
    let playerAccumulatedScore = 0;
    let sustenanceMeterVisualSize = 250; // גודל מד המזון

    // מכניקת גלי הים
    let oceanWavePosition = -140;
    let oceanWaveCycleTimer = random(10, 30);
    let oceanWaveDirection = false;
    let oceanWaveFluctuationRange = random(50, 200);

    // יצור נדיר (נמו) - הוסר מהמשחק
    // let rareCreatureInstance = { x: -4000, y: 0, velocity: 0 };
    // let isRareCreaturePresent = false;
    
    // מערכת ירי
    let canPlayerInitiateFire = false;
    let weaponRecoilTimer = 0;

    // אנימציות מעבר בין סצנות
    let sceneFadeOutAlpha = 0;
    let sceneFadeInAlpha = 255;
    let isSceneTransitionUnderway = false;
    let nextSceneTarget = "";
    
    // הגדרות כלליות של P5.js
    rectMode(CENTER);
    textFont("Comic Sans MS");
    textAlign(CENTER, CENTER);

    // פונקציות עזר לציור יצורים - שינוי מראה הדגים
    const renderBasicAquaticForm = (xPos, yPos, sizeRatio, rotationAngle, mainColor, outlineShade, eyeTint) => {
        fill(mainColor);
        stroke(outlineShade);
        strokeWeight(sizeRatio / 60); // עובי קו
        push();
        translate(xPos, yPos);
        scale(sizeRatio / 70);
        rotate(rotationAngle);
        
        // גוף - אליפסה מוארכת
        ellipse(0, 0, 30, 20); 
        
        // סנפיר זנב - משולש מוארך
        push();
        translate(-15, 0); // מיקום
        rotate(sin(frameCount * 15) * 10); // אנימציית סנפיר
        triangle(0, 0, -15, 10, -15, -10); // צורה
        pop();

        // סנפיר גב
        triangle(5, -10, 15, -15, 10, -5);

        // עין - מרובעת
        fill(eyeTint);
        noStroke();
        rect(8, -2, 4, 4); // מיקום וצורה
        
        // פה - קו ישר
        stroke(0);
        strokeWeight(1);
        line(10, 5, 15, 5); // מיקום וצורה

        pop();
    };

    const renderAzureFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, color(0, 100, 200), color(0, 50, 150), color(0)); // כחול
    const renderCrimsonFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, color(200, 50, 0), color(150, 20, 0), color(0)); // אדום
    const renderGoldenFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, color(200, 200, 0), color(150, 150, 0), color(0)); // צהוב
    const renderRoseFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, color(200, 0, 100), color(150, 0, 70), color(0)); // ורוד
    const renderPhantomFin = (x, y, s, r) => renderBasicAquaticForm(x, y, s, r, color(189, 196, 255, playerPhasedState ? 50 : 255), color(205, 218, 255, playerPhasedState ? 50 : 255), color(255, 255, 255, playerPhasedState ? 50 : 255)); // רוח רפאים
    
    // ציור יצור פריזמטי (קשת בענן)
    const renderPrismaticFin = (x, y, s, r) => {
        push();
        translate(x, y);
        scale(s / 70);
        rotate(r);

        // גוף - אליפסה מוארכת
        ellipse(0, 0, 30, 20); 
        
        // סנפיר זנב - משולש מוארך
        push();
        translate(-15, 0); // מיקום
        rotate(sin(frameCount * 15) * 10); // אנימציית סנפיר
        triangle(0, 0, -15, 10, -15, -10); // צורה
        pop();

        // סנפיר גב
        triangle(5, -10, 15, -15, 10, -5);

        // פסים בצבעי הקשת - מלבנים קטנים לאורך הגוף
        noStroke();
        let huePalette = [
            color(255, 0, 0), color(255, 128, 0), color(255, 255, 0),
            color(0, 200, 0), color(0, 0, 255), color(128, 0, 128)
        ];
        for (let i = 0; i < huePalette.length; i++) {
            fill(huePalette[i]);
            rect(-10 + i * 4, 0, 3, 20); // מלבנים קטנים לאורך
        }
        
        // עין - מרובעת
        fill(0); // עין שחורה
        noStroke();
        rect(8, -2, 4, 4); // מיקום וצורה
        
        // פה - קו ישר
        stroke(0);
        strokeWeight(1);
        line(10, 5, 15, 5); // מיקום וצורה

        pop();
    };

    const renderForgetfulFin = (x, y, s, r) => { // שכחן (דורי)
        push();
        translate(x, y);
        scale(s / 70);
        rotate(r);
        
        // גוף - אליפסה מוארכת
        fill(0, 100, 200); // צבע כחול
        stroke(0, 50, 150);
        strokeWeight(s / 60);
        ellipse(0, 0, 30, 20); 
        
        // סנפיר זנב - צהוב
        fill(255, 200, 0);
        stroke(200, 150, 0);
        triangle(-15, 0, -30, 10, -30, -10);

        // סנפיר גב - צהוב
        fill(255, 200, 0);
        stroke(200, 150, 0);
        triangle(5, -10, 15, -15, 10, -5);

        // פסים כהים
        fill(0);
        noStroke();
        rect(5, 0, 5, 20); // פס קדמי
        rect(-5, 0, 5, 20); // פס אחורי

        // עין
        fill(0);
        noStroke();
        rect(8, -2, 4, 4);
        
        // פה
        stroke(0);
        strokeWeight(1);
        line(10, 5, 15, 5);

        pop();
    };

    const renderPredatorFin = (x, y, s, r) => { // טורף (כריש)
        push();
        translate(x, y);
        scale(s / 70);
        rotate(r);
        
        // גוף - צורה חדה יותר
        fill(100, 100, 100);
        stroke(70, 70, 70);
        strokeWeight(s / 60);
        beginShape();
        vertex(20, 0);
        bezierVertex(10, -15, -10, -15, -20, 0);
        bezierVertex(-10, 15, 10, 15, 20, 0);
        endShape(CLOSE);
        
        // סנפיר גב
        triangle(0, -10, 10, -25, 20, -10);

        // סנפיר זנב
        triangle(-20, 0, -30, 10, -30, -10);

        // עין
        fill(0);
        noStroke();
        ellipse(10, -5, 3, 3);

        // פה (שיניים)
        fill(255);
        noStroke();
        triangle(10, 5, 12, 8, 8, 8); // שן 1
        triangle(15, 5, 17, 8, 13, 8); // שן 2

        pop();
    };

    // פונקציה חדשה לציור מוקש ימי
    const renderSeaMine = (x, y, size) => {
        push();
        translate(x, y);
        scale(size / 50); // התאמת קנה מידה
        fill(50, 50, 50); // צבע אפור כהה
        stroke(20, 20, 20); // קו מתאר כהה
        strokeWeight(2);
        ellipse(0, 0, 40, 40); // גוף עגול
        
        // קוצים למוקש
        for (let i = 0; i < 8; i++) {
            push();
            rotate(i * (360 / 8)); // סיבוב לכל קוץ
            line(0, 20, 0, 30); // קוץ
            ellipse(0, 30, 5, 5); // קצה הקוץ
            pop();
        }
        pop();
    };
    
    // בדיקת התנגשויות בין צורות מעגליות
    const checkCircularCollision = (x1, y1, r1, x2, y2, r2) => {
        return dist(x1, y1, x2, y2) < r1 + r2;
    };
    
    // יצירת ישויות חדשות לסביבה
    const generateNewDocileAquaticLife = () => {
        if (frameCount % 60 === 0) { // כל שנייה בערך
            let newEntity = {
                x: random(width, width + 1000),
                y: random(height),
                size: random(30, 80),
                type: floor(random(0, 4)) // 0: כחול, 1: אדום, 2: צהוב, 3: ורוד
            };
            docileAquaticLife.push(newEntity);
        }
    };
    
    const generateNewAggressiveOceanicCreature = () => {
        if (frameCount % 120 === 0) {
            let newPredator = {
                x: random(width, width + 1000),
                y: random(height),
                size: random(playerRenderSize * 1.5, playerRenderSize * 3),
                velocity: random(2, 5)
            };
            aggressiveOceanicCreatures.push(newPredator);
        }
    };

    // פונקציה חדשה ליצירת מוקשי ים
    const generateSeaMine = () => {
        if (frameCount % 180 === 0) { // כל 3 שניות בערך
            let newMine = {
                x: random(width, width + 500),
                y: random(height),
                size: random(30, 60),
                velocity: random(0.5, 1.5) // תנועה איטית
            };
            seaMines.push(newMine);
        }
    };

    // יצור נדיר (נמו) - הפונקציה הוסרה
    // const generateRareCreatureInstance = () => {
    //     // לוגיקה הוסרה
    // };

    // פונקציית setup() של P5.js
    this.setup = () => {
        createCanvas(windowWidth, windowHeight);
    };

    // פונקציית draw() של P5.js
    this.draw = () => {
        
        if (isSceneTransitionUnderway) {
            // לוגיקת דעיכה חלקה בין סצנות
            background(20, 20, 100);
            fill(0, 0, 0, sceneFadeOutAlpha);
            rect(width/2, height/2, width, height);
            sceneFadeOutAlpha += 5;
            if (sceneFadeOutAlpha > 255) {
                activeGameScene = nextSceneTarget;
                isSceneTransitionUnderway = false;
                sceneFadeInAlpha = 255;
            }
        } else {
            background(20, 20, 100);

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
                fill(0, 0, 0, sceneFadeInAlpha);
                rect(width/2, height/2, width, height);
                sceneFadeInAlpha -= 5;
            }
        }
    };
    
    const renderMainTitleScreen = () => {
        // ציור רקע, כותרת ראשית וכפתורי ניווט
        fill(255);
        textSize(100);
        text("הגאות הגדולה", width/2, 100); // כותרת חדשה
        
        // כפתור התחלת מסע
        fill(255, 0, 0);
        if (dist(mouseX, mouseY, width/2, height/2) < 50) {
            fill(200, 0, 0);
            cursor(HAND);
        } else {
            fill(255, 0, 0);
            cursor(ARROW);
        }
        ellipse(width/2, height/2, 100, 100);
        fill(255);
        textSize(40);
        text("התחל מסע", width/2, height/2); // תורגם
        
        // כפתור צפייה בהישגים
        fill(0, 255, 0);
        if (dist(mouseX, mouseY, width/2, height/2 + 150) < 50) {
            fill(0, 200, 0);
            cursor(HAND);
        } else {
            fill(0, 255, 0);
            cursor(ARROW);
        }
        ellipse(width/2, height/2 + 150, 100, 100);
        fill(255);
        textSize(40);
        text("הישגים", width/2, height/2 + 150); // תורגם

        // כפתור בחירת אווטארים
        fill(0, 0, 255);
        if (dist(mouseX, mouseY, width/2, height/2 + 300) < 50) {
            fill(0, 0, 200);
            cursor(HAND);
        } else {
            fill(0, 0, 255);
            cursor(ARROW);
        }
        ellipse(width/2, height/2 + 300, 100, 100);
        fill(255);
        textSize(40);
        text("אווטארים", width/2, height/2 + 300); // תורגם
    };
    
    const renderGamePlayScreen = () => {
        // עדכון מיקום יצור השחקן
        if (keyboardInputStates[RIGHT_ARROW] || keyboardInputStates[68]) {
            playerCoordinates.x += playerBaseMovementSpeed;
        }
        if (keyboardInputStates[LEFT_ARROW] || keyboardInputStates[65]) {
            playerCoordinates.x -= playerBaseMovementSpeed;
        }
        if (keyboardInputStates[UP_ARROW] || keyboardInputStates[87]) {
            playerCoordinates.y -= playerBaseMovementSpeed;
        }
        if (keyboardInputStates[DOWN_ARROW] || keyboardInputStates[83]) {
            playerCoordinates.y += playerBaseMovementSpeed;
        }
        
        // לוגיקת יכולת מצב חמקמק (Ghost)
        if (phantomAbilityActive) {
            if (mouseIsPressed && playerPhantomEnergy > 0) {
                playerPhasedState = true;
                playerPhantomEnergy -= 1;
            } else {
                playerPhasedState = false;
                if (playerPhantomEnergy < 100) playerPhantomEnergy += 0.5;
            }
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
            if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, entity.x, entity.y, entity.size / 2) && playerRenderSize >= entity.size) {
                playerRenderSize += entity.size / 10;
                playerAccumulatedScore += round(entity.size);
                currentCoinBalance += round(entity.size);
                docileAquaticLife.splice(i, 1);
            } else if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, entity.x, entity.y, entity.size / 2) && playerRenderSize < entity.size && !playerPhasedState) {
                playerHealthPoints--;
                playerRenderSize = 50; // איפוס גודל
                if (playerHealthPoints <= 0) {
                    isSceneTransitionUnderway = true;
                    nextSceneTarget = "death";
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
                if (playerHealthPoints <= 0) {
                    isSceneTransitionUnderway = true;
                    nextSceneTarget = "death";
                }
            }
        }

        // עדכון וציור מוקשי ים
        for (let i = seaMines.length - 1; i >= 0; i--) {
            const mine = seaMines[i];
            mine.x -= mine.velocity;
            renderSeaMine(mine.x, mine.y, mine.size);

            // בדיקת התנגשות עם מוקש
            if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, mine.x, mine.y, mine.size / 2) && !playerPhasedState) {
                playerHealthPoints--;
                seaMines.splice(i, 1); // הסרת המוקש לאחר פגיעה
                if (playerHealthPoints <= 0) {
                    isSceneTransitionUnderway = true;
                    nextSceneTarget = "death";
                }
            }
            if (mine.x < -mine.size) {
                seaMines.splice(i, 1); // הסרת מוקש שיצא מהמסך
            }
        }
        
        // לוגיקת גלי הים
        oceanWavePosition += oceanWaveDirection ? 0.5 : -0.5;
        if (oceanWavePosition < -oceanWaveFluctuationRange) oceanWaveDirection = true;
        if (oceanWavePosition > -100) oceanWavePosition = false; // הגבלת גובה הגל
        fill(0, 0, 100, 200);
        noStroke();
        rect(width/2, oceanWavePosition + 140, width, height);
        
        // ציור ממשק משתמש
        fill(255);
        textSize(20);
        text(`ניקוד: ${playerAccumulatedScore}`, 50, 30); // תורגם
        text(`חיים: ${playerHealthPoints}`, 50, 60); // תורגם
        text(`מטבעות: ${currentCoinBalance}`, 50, 90); // תורגם
        
        // ציור מד אנרגיית מצב חמקמק
        if (phantomAbilityActive) {
            stroke(255);
            noFill();
            rect(width/2, 20, 200, 20);
            fill(255, 255, 255, 100);
            noStroke();
            rect(width/2 - 100 + playerPhantomEnergy, 20, playerPhantomEnergy * 2, 20);
        }
        
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
        generateSeaMine(); // קריאה לפונקציית יצירת מוקשים
    };

    const renderAccomplishmentsScreen = () => {
        // ציור כותרת ורשימת הישגים
        fill(255);
        textSize(50);
        text("הישגים", width/2, 50); // תורגם
        
        // כפתור חזרה למסך הראשי
        fill(163, 163, 255, 100);
        if(dist(mouseX, mouseY, 100, 500) <= 50) {
            fill(163, 163, 255, 50);
            cursor(HAND);
        } else {
            fill(163, 163, 255, 100);
            cursor(ARROW);
        }
        ellipse(100, 500, 100, 100);
        fill(255);
        text("חזור", 100, 500); // תורגם
    };

    const renderAvatarSelectionScreen = () => {
        // ציור כותרת ואפשרויות בחירת אווטאר
        fill(255);
        textSize(50);
        text("בחירת אווטאר", width/2, 50); // תורגם
        
        // כפתור חזרה למסך הראשי
        fill(163, 163, 255, 100);
        if(dist(mouseX, mouseY, 100, 500) <= 50) {
            fill(163, 163, 255, 50);
            cursor(HAND);
        } else {
            fill(163, 163, 255, 100);
            cursor(ARROW);
        }
        ellipse(100, 500, 100, 100);
        fill(255);
        text("חזור", 100, 500); // תורגם
    };

    const renderGameOverScreen = () => {
        fill(255);
        textSize(100);
        text("המסע נגמר", width/2, height/2 - 50); // תורגם
        textSize(50);
        text(`ניקוד סופי: ${playerAccumulatedScore}`, width/2, height/2 + 50); // תורגם
        
        // כפתור חזרה למסך הכותרת
        fill(255, 0, 0);
        if (dist(mouseX, mouseY, width/2, height/2 + 150) < 50) {
            fill(200, 0, 0);
            cursor(HAND);
        } else {
            fill(255, 0, 0);
            cursor(ARROW);
        }
        ellipse(width/2, height/2 + 150, 100, 100);
        fill(255);
        textSize(40);
        text("חזרה לתפריט", width/2, height/2 + 150); // תורגם
    };
    
    // פונקציות קלט של P5.js
    this.keyPressed = () => {
        keyboardInputStates[keyCode] = true;
    };
    
    this.keyReleased = () => {
        keyboardInputStates[keyCode] = false;
    };

    this.mousePressed = () => {
        mouseIsPressed = true; // שימוש במשתנה גלובלי של p5
        
        // לוגיקת לחיצה על כפתורים
        if (activeGameScene === "home") {
            if (dist(mouseX, mouseY, width/2, height/2) < 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "game";
            }
            if (dist(mouseX, mouseY, width/2, height/2 + 150) < 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "achievements";
            }
            if (dist(mouseX, mouseY, width/2, height/2 + 300) < 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "skins";
            }
        }
        
        if (activeGameScene === "achievements" || activeGameScene === "skins") {
             if(dist(mouseX, mouseY, 100, 500) <= 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "home";
            }
        }
        
        if (activeGameScene === "death") {
             if(dist(mouseX, mouseY, width/2, height/2 + 150) <= 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "home";
                playerAccumulatedScore = 0;
                playerHealthPoints = 3;
                playerRenderSize = 50;
            }
        }
        
    };
    this.mouseReleased = () => {
        mouseIsPressed = false; // שימוש במשתנה גלובלי של p5
    };
    
    // פונקציות נוספות של P5.js
    this.windowResized = () => {
        resizeCanvas(windowWidth, windowHeight);
    };
};

let gameInstance;

function setup() {
    gameInstance = new GameCoreSystem();
    gameInstance.setup();
}

function draw() {
    gameInstance.draw();
}

function keyPressed() {
    gameInstance.keyPressed();
}

function keyReleased() {
    gameInstance.keyReleased();
}

function mousePressed() {
    gameInstance.mousePressed();
}

function mouseReleased() {
    gameInstance.mouseReleased();
}

function windowResized() {
    gameInstance.windowResized();
}

