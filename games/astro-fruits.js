        const GAME_DATA_KEY = 'fruitDungeonGameData';

        function showMessageBox(title, content, callback) {
            const msgBox = document.getElementById('messageBox');
            if (msgBox) {
                document.getElementById('messageBoxTitle').innerText = title;
                document.getElementById('messageBoxBody').innerText = content;
                msgBox.style.display = 'flex';
                const closeButton = document.getElementById('messageBoxClose');
                closeButton.onclick = () => {
                    msgBox.style.display = 'none';
                    if (callback) callback();
                };
            } else {
                console.warn("אלמנט תיבת ההודעות לא נמצא. מוצגת התראה חלופית.");
                alert(`${title}\n${content}`);
                if (callback) callback();
            }
        }

        window.confirmResetData = function() {
            if (window.confirm("האם אתה בטוח שברצונך לאפס את נתוני המשחק?")) {
                resetGameData(window.p5Instance);
                window.location.reload();
            }
        };

        // נתוני השלבים
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
            3: {
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
        };

        const sketch = (p) => {
            // משתנים גלובליים עבור סקיצת p5.js
            let gamePhase = 'intro';
            let startTime = 0;
            let transitionAlpha = 1;
            let activeKeys = {};
            let spacePressed = false;
            let jumpPressed = false;
            let player;
            let currentLevelData;
            let platforms = [];
            let collectibleFruits = [];
            let exitPoint;
            let totalFruitsCollected = 0;
            let currentLevelFruits = 0;
            let unlockedAchievements = {};
            let initialStage = 1;
            let GameAssets = {};

            // הגדרות המשחק
            const GRAVITY_STRENGTH = 0.3;
            const JUMP_POWER = -7;
            const PLAYER_SPEED = 3;
            const MAX_JUMPS = 2;
            const GRAVITY_TOGGLE_LEVEL = 3;

            // --- לוגיקת הישגים ---
            function checkAchievements() {
                if (totalFruitsCollected >= 10 && !unlockedAchievements['fruitCollector']) {
                    unlockedAchievements['fruitCollector'] = true;
                    showMessageBox('הישג חדש!', 'אספן פירות: אספת 10 פירות!');
                    saveGameData(totalFruitsCollected, unlockedAchievements, player);
                }
                if (player && player.currentLevel >= 5 && !unlockedAchievements['superJumper']) {
                    unlockedAchievements['superJumper'] = true;
                    showMessageBox('הישג חדש!', 'קפצן על: השלמת שלב 5!');
                    saveGameData(totalFruitsCollected, unlockedAchievements, player);
                }
                if (player && player.currentLevel >= 10 && !unlockedAchievements['skilledExplorer']) {
                    unlockedAchievements['skilledExplorer'] = true;
                    showMessageBox('הישג חדש!', 'חוקר מיומן: השלמת שלב 10!');
                    saveGameData(totalFruitsCollected, unlockedAchievements, player);
                }
            }

            // --- מחלקת שחקן ---
            class Player {
                constructor(x, y, level) {
                    this.p = p;
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
                    this.sparkleTimer = 0;
                }

                update() {
                    if (this.gravityEnabled) {
                        this.velY += GRAVITY_STRENGTH;
                    }

                    const isLeft = activeKeys[this.p.LEFT_ARROW] || activeKeys[65];
                    const isRight = activeKeys[this.p.RIGHT_ARROW] || activeKeys[68];
                    
                    if (isLeft && !isRight) {
                        this.velX = -PLAYER_SPEED;
                    } else if (isRight && !isLeft) {
                        this.velX = PLAYER_SPEED;
                    } else {
                        this.velX = 0;
                    }

                    const jumpKeyDown = activeKeys[this.p.UP_ARROW] || activeKeys[87];
                    if (jumpKeyDown && !jumpPressed && this.jumpsLeft > 0) {
                        this.velY = JUMP_POWER;
                        this.jumpsLeft--;
                        this.onGround = false;
                        jumpPressed = true;
                    }
                    if (!jumpKeyDown) {
                        jumpPressed = false;
                    }

                    if (this.currentLevel >= GRAVITY_TOGGLE_LEVEL && activeKeys[32] && !spacePressed) {
                        this.gravityEnabled = !this.gravityEnabled;
                        spacePressed = true;
                    }
                    if (!activeKeys[32]) {
                        spacePressed = false;
                    }

                    this.x += this.velX;
                    this.y += this.velY;

                    if (this.p.width && this.p.height) {
                        if (this.x < this.width / 2) {
                            this.x = this.width / 2;
                            this.velX = 0;
                        } else if (this.x > this.p.width - this.width / 2) {
                            this.x = this.p.width - this.width / 2;
                            this.velX = 0;
                        }
                    }

                    this.onGround = false;
                    for (let pObj of platforms) {
                        if (this.collidesWith(pObj)) {
                            if (this.velY > 0 && this.y + this.height / 2 > pObj.y - pObj.height / 2 && this.y - this.height / 2 < pObj.y - pObj.height / 2) {
                                this.y = pObj.y - pObj.height / 2 - this.height / 2;
                                this.velY = 0;
                                this.onGround = true;
                                this.jumpsLeft = MAX_JUMPS;
                            } else if (this.velY < 0 && this.y - this.height / 2 < pObj.y + pObj.height / 2 && this.y + this.height / 2 > pObj.y + pObj.height / 2) {
                                this.y = pObj.y + pObj.height / 2 + this.height / 2;
                                this.velY = 0;
                            } else if (this.velX > 0) {
                                this.x = pObj.x - pObj.width / 2 - this.width / 2;
                                this.velX = 0;
                            } else if (this.velX < 0) {
                                this.x = pObj.x + pObj.width / 2 + this.width / 2;
                                this.velX = 0;
                            }
                        }
                    }

                    if (this.p.height && this.y > this.p.height + 50) {
                        gamePhase = 'game_over';
                        showMessageBox('הפסדת!', 'נפלת מהמפה. נסה שוב!');
                    }

                    this.sparkleTimer = (this.sparkleTimer + 1) % 60;
                }

                draw() {
                    if (this.p) {
                        this.p.fill(255, 100, 100);
                        this.p.rect(this.x, this.y, this.width, this.height);

                        if (this.sparkleTimer < 30) {
                            this.p.fill(255, 255, 0, 150);
                            this.p.ellipse(this.x + this.p.random(-5, 5), this.y + this.p.random(-10, 10), 5, 5);
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

            // --- מחלקת פלטפורמה ---
            class Platform {
                constructor(x, y, w, h) {
                    this.p = p;
                    this.x = x;
                    this.y = y;
                    this.width = w;
                    this.height = h;
                }

                draw() {
                    this.p.fill(100, 100, 100);
                    this.p.rect(this.x, this.y, this.width, this.height);
                }
            }

            // --- מחלקת פרי לאיסוף ---
            class CollectibleFruit {
                constructor(x, y, type) {
                    this.p = p;
                    this.x = x;
                    this.y = y;
                    this.radius = 15;
                    this.width = this.radius * 2;
                    this.height = this.radius * 2;
                    this.collected = false;
                    this.type = type;
                }

                draw() {
                    if (!this.collected) {
                        if (GameAssets.collectibleFruits[this.type]) {
                            this.p.image(GameAssets.collectibleFruits[this.type], this.x, this.y, this.width, this.height);
                        } else {
                            console.warn(`Collectible fruit asset type ${this.type} not found.`);
                            this.p.fill(255, 0, 0);
                            this.p.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
                        }
                    }
                }

                collect() {
                    this.collected = true;
                    totalFruitsCollected++;
                    currentLevelFruits++;
                    checkAchievements();
                    saveGameData(totalFruitsCollected, unlockedAchievements, player);
                }
            }

            // --- מחלקת נקודת יציאה ---
            class ExitPoint {
                constructor(x, y, w, h) {
                    this.p = p;
                    this.x = x;
                    this.y = y;
                    this.width = w;
                    this.height = h;
                }

                draw() {
                    this.p.fill(0, 200, 0, 150);
                    this.p.rect(this.x, this.y, this.width, this.height);
                    if (GameAssets.bossIcon) {
                        this.p.image(GameAssets.bossIcon, this.x, this.y, this.width * 0.8, this.height * 0.8);
                    } else {
                        console.warn("Boss icon asset not found.");
                        this.p.fill(0);
                        this.p.rect(this.x, this.y, this.width * 0.8, this.height * 0.8);
                    }
                }
            }

            // --- אתחול המשחק ---
            function loadLevel(levelNum) {
                currentLevelFruits = 0;
                if (levelData[levelNum]) {
                    currentLevelData = levelData[levelNum];
                    player = new Player(currentLevelData.playerStart.x, currentLevelData.playerStart.y, levelNum);
                    platforms = currentLevelData.platforms.map(pData => new Platform(pData.x, pData.y, pData.w, pData.h));
                    collectibleFruits = currentLevelData.fruits.map(fData => new CollectibleFruit(fData.x, fData.y, fData.type));
                    exitPoint = new ExitPoint(currentLevelData.exit.x, currentLevelData.exit.y, currentLevelData.exit.w, currentLevelData.exit.h);
                    activeKeys = {};
                } else {
                    gamePhase = 'game_over';
                    showMessageBox('כל הכבוד!', 'השלמת את כל השלבים הזמינים! אתה גיבור הפירות!');
                    player = null;
                    activeKeys = {};
                }
            }

            function saveGameData(totalFruitsCollected, unlockedAchievements, player) {
                const gameData = {
                    totalFruitsCollected: totalFruitsCollected,
                    unlockedAchievements: unlockedAchievements,
                    lastPlayedLevel: player ? player.currentLevel : 1
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
                    initialStage = gameData.lastPlayedLevel || 1;
                    console.log('Game data loaded:', gameData);
                } else {
                    console.log('No saved game data found.');
                    initialStage = 1;
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

            // פונקציית עזר ליצירת פיקסל ארט
            function createPixelArt(size, graphics) {
                let pg = p.createGraphics(size * 10, size * 10);
                pg.pixelDensity(1);
                pg.background(0, 0, 0, 0);
                pg.noStroke();
                pg.rectMode(p.CENTER);

                for (let part of graphics) {
                    pg.fill(part.color[0], part.color[1], part.color[2]);
                    for (let point of part.points) {
                        pg.rect(point[0] * size + pg.width / 2, point[1] * size + pg.height / 2, size, size);
                    }
                }
                return pg;
            }

            p.preload = function() {
                GameAssets.collectibleFruits = [
                    createPixelArt(3, [{ color: [255, 120, 120], points: [[0, 0]] }, { color: [255, 255, 0], points: [[-1, 1], [1, 1]] }]),
                    createPixelArt(3, [{ color: [100, 255, 100], points: [[0, 0], [1, 0]] }, { color: [255, 255, 0], points: [[0, 1], [1, 1]] }]),
                    createPixelArt(3, [{ color: [150, 150, 255], points: [[-1, 0], [0, 0], [1, 0], [0, -1]] }])
                ];
                GameAssets.bossIcon = createPixelArt(5, [{ color: [50, 50, 50], points: [[0, 0], [1, 0], [0, 1], [1, 1]] }]);
            };

            p.setup = function() {
                const container = document.getElementById('p5-canvas-container');
                const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
                canvas.parent('p5-canvas-container');
                p.rectMode(p.CENTER);
                p.textAlign(p.CENTER, p.CENTER);
                p.imageMode(p.CENTER);
                p.frameRate(60);

                loadGameData();
                loadLevel(initialStage);
            };

            p.draw = function() {
                p.background(50, 50, 50);

                if (gamePhase === 'playing') {
                    updateGame();
                    drawGame();
                } else if (gamePhase === 'intro') {
                    drawIntroScreen();
                } else if (gamePhase === 'game_over') {
                    drawGameOverScreen();
                } else if (gamePhase === 'level_complete') {
                    drawLevelCompleteScreen();
                } else if (gamePhase === 'instructions') {
                    drawInstructionsScreen();
                } else if (gamePhase === 'achievements') {
                    drawAchievementsScreen();
                }
                
                drawUI();
            };

            function updateGame() {
                if (player) {
                    player.update();

                    // בדיקת איסוף פירות
                    for (let i = collectibleFruits.length - 1; i >= 0; i--) {
                        if (player.collidesWith(collectibleFruits[i])) {
                            collectibleFruits[i].collect();
                            collectibleFruits.splice(i, 1);
                        }
                    }

                    // בדיקת הגעה ליציאה
                    if (player.collidesWith(exitPoint)) {
                        if (collectibleFruits.length === 0) {
                            gamePhase = 'level_complete';
                            saveGameData(totalFruitsCollected, unlockedAchievements, player);
                        } else {
                            showMessageBox('חסרים פירות!', `אסוף את כל ${currentLevelData.fruits.length - collectibleFruits.length} הפירות הנותרים כדי לעבור לשלב הבא.`);
                        }
                    }
                }
            }

            function drawGame() {
                p.background(50, 50, 50);
                for (let pObj of platforms) {
                    pObj.draw();
                }
                for (let fObj of collectibleFruits) {
                    fObj.draw();
                }
                if (exitPoint) {
                    exitPoint.draw();
                }
                if (player) {
                    player.draw();
                }
            }

            function drawUI() {
                p.textSize(16);
                p.fill(255);
                p.textAlign(p.LEFT);
                p.text(`שלב: ${player ? player.currentLevel : initialStage}`, 10, 20);
                p.text(`פירות: ${totalFruitsCollected}`, 10, 40);
                if (player && player.currentLevel >= GRAVITY_TOGGLE_LEVEL) {
                    p.text(`גרביטציה: ${player.gravityEnabled ? 'פעילה' : 'כבוי'}` + " (מקש רווח)", 10, 60);
                }
                p.textAlign(p.RIGHT);
                if (player && currentLevelData) {
                    p.text(`פירות בשלב: ${currentLevelFruits}/${currentLevelData.fruits.length}`, p.width - 10, 20);
                }

                p.textAlign(p.CENTER);
                if (gamePhase !== 'playing') {
                    p.fill(50, transitionAlpha);
                    p.rect(p.width / 2, p.height / 2, p.width, p.height);
                    transitionAlpha = p.min(200, transitionAlpha + 5);
                } else {
                    transitionAlpha = 1;
                }
            }

            // --- מסכים שונים ---
            function drawIntroScreen() {
                p.fill(255);
                p.textSize(48);
                p.text('מבוך הפירות', p.width / 2, p.height / 2 - 50);
                p.textSize(24);
                p.text('לחץ על מקש כלשהו כדי להתחיל', p.width / 2, p.height / 2 + 50);
                p.textSize(16);
                p.text('לחץ על H להוראות, A להישגים', p.width / 2, p.height / 2 + 100);
            }

            function drawLevelCompleteScreen() {
                p.fill(255);
                p.textSize(32);
                p.text('שלב הושלם!', p.width / 2, p.height / 2 - 50);
                p.textSize(24);
                p.text('לחץ על מקש כלשהו כדי להמשיך', p.width / 2, p.height / 2 + 50);
            }

            function drawGameOverScreen() {
                p.fill(255);
                p.textSize(32);
                p.text('המשחק נגמר!', p.width / 2, p.height / 2 - 50);
                p.textSize(24);
                p.text('לחץ על מקש כלשהו כדי להתחיל מחדש', p.width / 2, p.height / 2 + 50);
            }

            function drawInstructionsScreen() {
                p.fill(255);
                p.textSize(32);
                p.text('הוראות', p.width / 2, p.height / 2 - 150);
                p.textSize(20);
                p.text('השתמש ב-A/D או בחצים ימינה/שמאלה כדי לזוז', p.width / 2, p.height / 2 - 100);
                p.text('השתמש ב-W או בחץ למעלה כדי לקפוץ', p.width / 2, p.height / 2 - 50);
                p.text('אסוף את כל הפירות כדי לעבור לשלב הבא', p.width / 2, p.height / 2);
                p.text('החל משלב 3, השתמש במקש רווח כדי להחליף את כוח המשיכה', p.width / 2, p.height / 2 + 50);
                p.text('לחץ על מקש כלשהו כדי לחזור לתפריט הראשי', p.width / 2, p.height / 2 + 100);
            }

            function drawAchievementsScreen() {
                p.fill(255);
                p.textSize(32);
                p.text('הישגים', p.width / 2, p.height / 2 - 150);
                p.textSize(20);
                const achievementDescriptions = {
                    'fruitCollector': 'אספן פירות: אסוף 10 פירות',
                    'superJumper': 'קפצן על: השלם שלב 5',
                    'skilledExplorer': 'חוקר מיומן: השלם שלב 10'
                };
                let y = p.height / 2 - 100;
                for (const key in achievementDescriptions) {
                    const desc = achievementDescriptions[key];
                    const isUnlocked = unlockedAchievements[key];
                    p.fill(isUnlocked ? 100 : 255);
                    p.text(desc, p.width / 2, y);
                    if (isUnlocked) {
                        p.fill(0, 255, 0);
                        p.text('✓', p.width / 2 + p.textWidth(desc) / 2 + 15, y);
                    }
                    y += 40;
                }
                p.fill(255);
                p.text('לחץ על מקש כלשהו כדי לחזור לתפריט הראשי', p.width / 2, p.height / 2 + 100);
            }
            
            // --- ניהול אירועי קלט ---
            p.keyPressed = function() {
                activeKeys[p.keyCode] = true;
                if (gamePhase === 'intro') {
                    if (p.keyCode === 72) { // H
                        gamePhase = 'instructions';
                    } else if (p.keyCode === 65) { // A
                        gamePhase = 'achievements';
                    } else {
                        loadLevel(initialStage);
                        gamePhase = 'playing';
                        startTime = p.millis();
                    }
                } else if (gamePhase === 'level_complete') {
                    initialStage++;
                    loadLevel(initialStage);
                    gamePhase = 'playing';
                    startTime = p.millis();
                } else if (gamePhase === 'game_over') {
                    loadGameData();
                    loadLevel(initialStage);
                    gamePhase = 'intro';
                    startTime = p.millis();
                } else if (gamePhase === 'instructions' || gamePhase === 'achievements') {
                    gamePhase = 'intro';
                }
            };

            p.keyReleased = function() {
                delete activeKeys[p.keyCode];
            };
            
            // שינוי גודל הקנבס בהתאם למיכל
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
