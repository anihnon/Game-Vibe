// הגדרת הסקצ' של p5.js במצב מופע
const gameSketch = function(p) {

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
    let playerBaseMovementSpeed = 4;
    let playerPhantomEnergy = 100;
    let playerPhasedState = false; // מצב חמקמק

    // ניהול קלט מקלדת
    let keyboardInputStates = [];

    // אובייקטים בתוך הסביבה הימית
    let docileAquaticLife = []; // יצורים ימיים רגועים (דגים קטנים)
    let aggressiveOceanicCreatures = []; // יצורים אוקיינוסים תוקפניים (כרישים)
    let seaMines = []; // מוקשי ים חדשים
    let playerHealthPoints = 3;
    let playerAccumulatedScore = 0;

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
        // p.createCanvas משמש ליצירת הקנבס בתוך מופע P5
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('gameContainer'); 
        
        // התאמת גודל הקנבס למיכל שלו באופן מיידי
        const containerRect = document.getElementById('gameContainer').getBoundingClientRect();
        p.resizeCanvas(containerRect.width, containerRect.height);

        // אתחול מצבי רינדור של p5.js
        p.rectMode(p.CENTER);
        p.textFont("Comic Sans MS");
        p.textAlign(p.CENTER, p.CENTER);
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
        // p.mouseIsPressed משמש לגישה למצב כפתור העכבר בתוך מופע P5
        if (activeGameScene === "home") {
            if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2) < 50) {
                isSceneTransitionUnderway = true;
                nextSceneTarget = "game";
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
            }
        }
        
    };
    p.mouseReleased = () => {
        // אין צורך בפעולה ספציפית כאן עבור p.mouseReleased
    };
    
    // פונקציית שינוי גודל חלון - מוגדרת בתוך המופע
    p.windowResized = () => {
        const containerRect = document.getElementById('gameContainer').getBoundingClientRect();
        p.resizeCanvas(containerRect.width, containerRect.height);
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
        if (p.frameCount % 60 === 0) {
            let newEntity = {
                x: p.random(p.width, p.width + 1000),
                y: p.random(p.height),
                size: p.random(30, 80),
                type: p.floor(p.random(0, 4))
            };
            docileAquaticLife.push(newEntity);
        }
    };
    
    const generateNewAggressiveOceanicCreature = () => {
        if (p.frameCount % 120 === 0) {
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
        if (p.frameCount % 180 === 0) {
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
        p.textSize(100);
        p.text("הגאות הגדולה", p.width/2, 100);
        
        p.fill(255, 0, 0);
        if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2) < 50) {
            p.fill(200, 0, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(255, 0, 0);
            p.cursor(p.ARROW);
        }
        p.ellipse(p.width/2, p.height/2, 100, 100);
        p.fill(255);
        p.textSize(40);
        p.text("התחל מסע", p.width/2, p.height/2);
        
        p.fill(0, 255, 0);
        if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2 + 150) < 50) {
            p.fill(0, 200, 0);
            p.cursor(p.HAND);
        } else {
            p.fill(0, 255, 0);
            p.cursor(p.ARROW);
        }
        p.ellipse(p.width/2, p.height/2 + 150, 100, 100);
        p.fill(255);
        p.textSize(40);
        p.text("הישגים", p.width/2, p.height/2 + 150);

        p.fill(0, 0, 255);
        if (p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2 + 300) < 50) {
            p.fill(0, 0, 200);
            p.cursor(p.HAND);
        } else {
            p.fill(0, 0, 255);
            p.cursor(p.ARROW);
        }
        p.ellipse(p.width/2, p.height/2 + 300, 100, 100);
        p.fill(255);
        p.textSize(40);
        p.text("אווטארים", p.width/2, p.height/2 + 300);
    };

    const renderGamePlayScreen = () => {
        if (keyboardInputStates[p.RIGHT_ARROW] || keyboardInputStates[68]) {
            playerCoordinates.x += playerBaseMovementSpeed;
        }
        if (keyboardInputStates[p.LEFT_ARROW] || keyboardInputStates[65]) {
            playerCoordinates.x -= playerBaseMovementSpeed;
        }
        if (keyboardInputStates[p.UP_ARROW] || keyboardInputStates[87]) {
            playerCoordinates.y -= playerBaseMovementSpeed;
        }
        if (keyboardInputStates[p.DOWN_ARROW] || keyboardInputStates[83]) {
            playerCoordinates.y += playerBaseMovementSpeed;
        }
        
        if (phantomAbilityActive) {
            if (p.mouseIsPressed && playerPhantomEnergy > 0) {
                playerPhasedState = true;
                playerPhantomEnergy -= 1;
            } else {
                playerPhasedState = false;
                if (playerPhantomEnergy < 100) playerPhantomEnergy += 0.5;
            }
        }
        
        for (let i = docileAquaticLife.length - 1; i >= 0; i--) {
            const entity = docileAquaticLife[i];
            entity.x -= 2;
            if (entity.type === 0) renderAzureFin(entity.x, entity.y, entity.size, 0);
            if (entity.type === 1) renderCrimsonFin(entity.x, entity.y, entity.size, 0);
            if (entity.type === 2) renderGoldenFin(entity.x, entity.y, entity.size, 0);
            if (entity.type === 3) renderRoseFin(entity.x, entity.y, entity.size, 0);
            
            if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, entity.x, entity.y, entity.size / 2) && playerRenderSize >= entity.size) {
                playerRenderSize += entity.size / 10;
                playerAccumulatedScore += p.round(entity.size);
                currentCoinBalance += p.round(entity.size);
                docileAquaticLife.splice(i, 1);
            } else if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, entity.x, entity.y, entity.size / 2) && playerRenderSize < entity.size && !playerPhasedState) {
                playerHealthPoints--;
                playerRenderSize = 50;
                if (playerHealthPoints <= 0) {
                    isSceneTransitionUnderway = true;
                    nextSceneTarget = "death";
                }
            }
        }
        
        for (let i = aggressiveOceanicCreatures.length - 1; i >= 0; i--) {
            const predator = aggressiveOceanicCreatures[i];
            predator.x -= predator.velocity;
            renderPredatorFin(predator.x, predator.y, predator.size, 0);
            
            if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, predator.x, predator.y, predator.size / 2) && !playerPhasedState) {
                playerHealthPoints--;
                playerRenderSize = 50;
                if (playerHealthPoints <= 0) {
                    isSceneTransitionUnderway = true;
                    nextSceneTarget = "death";
                }
            }
        }

        for (let i = seaMines.length - 1; i >= 0; i--) {
            const mine = seaMines[i];
            mine.x -= mine.velocity;
            renderSeaMine(mine.x, mine.y, mine.size);

            if (checkCircularCollision(playerCoordinates.x, playerCoordinates.y, playerRenderSize / 2, mine.x, mine.y, mine.size / 2) && !playerPhasedState) {
                playerHealthPoints--;
                seaMines.splice(i, 1);
                if (playerHealthPoints <= 0) {
                    isSceneTransitionUnderway = true;
                    nextSceneTarget = "death";
                }
            }
            if (mine.x < -mine.size) {
                seaMines.splice(i, 1);
            }
        }
        
        oceanWavePosition += oceanWaveDirection ? 0.5 : -0.5;
        if (oceanWavePosition < -oceanWaveFluctuationRange) oceanWaveDirection = true;
        if (oceanWavePosition > -100) oceanWavePosition = false;
        p.fill(0, 0, 100, 200);
        p.noStroke();
        p.rect(p.width/2, oceanWavePosition + 140, p.width, p.height);
        
        p.fill(255);
        p.textSize(20);
        p.text(`ניקוד: ${playerAccumulatedScore}`, 50, 30);
        p.text(`חיים: ${playerHealthPoints}`, 50, 60);
        p.text(`מטבעות: ${currentCoinBalance}`, 50, 90);
        
        if (phantomAbilityActive) {
            p.stroke(255);
            p.noFill();
            p.rect(p.width/2, 20, 200, 20);
            p.fill(255, 255, 255, 100);
            p.noStroke();
            p.rect(p.width/2 - 100 + playerPhantomEnergy, 20, playerPhantomEnergy * 2, 20);
        }
        
        switch (activePlayerAvatar) {
            case "Azure Fin":
                renderAzureFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Crimson Fin":
                renderCrimsonFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Golden Fin":
                renderGoldenFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Rose Fin":
                renderRoseFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Phantom":
                renderPhantomFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Predator":
                renderPredatorFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Forgetful":
                renderForgetfulFin(playerCoordinates.x, playerCoordinates.y, playerRenderSize, playerFacingAngle);
                break;
            case "Prismatic":
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
        p.text("הישגים", p.width/2, 50);
        
        p.fill(163, 163, 255, 100);
        if(p.dist(p.mouseX, p.mouseY, 100, 500) <= 50) {
            p.fill(163, 163, 255, 50);
            p.cursor(p.HAND);
        } else {
            p.fill(163, 163, 255, 100);
            p.cursor(p.ARROW);
        }
        p.ellipse(100, 500, 100, 100);
        p.fill(255);
        p.text("חזור", 100, 500);
    };

    const renderAvatarSelectionScreen = () => {
        p.fill(255);
        p.textSize(50);
        p.text("בחירת אווטאר", p.width/2, 50);
        
        p.fill(163, 163, 255, 100);
        if(p.dist(p.mouseX, p.mouseY, 100, 500) <= 50) {
            p.fill(163, 163, 255, 50);
            p.cursor(p.HAND);
        } else {
            p.fill(163, 163, 255, 100);
            p.cursor(p.ARROW);
        }
        p.ellipse(100, 500, 100, 100);
        p.fill(255);
        p.text("חזור", 100, 500);
    };

    const renderGameOverScreen = () => {
        p.fill(255);
        p.textSize(100);
        p.text("המסע נגמר", p.width/2, p.height/2 - 50);
        p.textSize(50);
        p.text(`ניקוד סופי: ${playerAccumulatedScore}`, p.width/2, p.height/2 + 50);
        
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
