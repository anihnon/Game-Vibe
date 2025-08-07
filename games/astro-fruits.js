        // מזהה לאחסון נתוני המשחק ב-localStorage
        const GAME_DATA_KEY = 'fruitDungeonGameData';
        const MAX_LEVELS = 55; // הגדרת מספר השלבים המקסימלי במשחק

        // פונקציית עזר להצגת תיבת הודעה
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

        /**
         * פונקציה שמייצרת נתוני שלב באופן דינמי.
         * הקושי עולה ככל שמספר השלב עולה.
         * @param {number} levelNum - מספר השלב.
         * @returns {object} - אובייקט עם נתוני השלב.
         */
        function generateLevelData(levelNum) {
            // הגדרות בסיסיות
            const playerStart = { x: 100, y: 100 };
            const platforms = [];
            const fruits = [];
            
            // הגדרה הדרגתית של קושי
            const numPlatforms = p.floor(p.map(levelNum, 1, MAX_LEVELS, 4, 15));
            const numFruits = p.floor(p.map(levelNum, 1, MAX_LEVELS, 2, 7));
            const levelHeight = 600;

            // יצירת פלטפורמות
            let lastY = 500;
            platforms.push({ x: p.width / 2, y: lastY, w: p.width - 100, h: 50 }); // פלטפורמת התחלה
            
            for (let i = 0; i < numPlatforms; i++) {
                const w = p.random(80, 200);
                const h = 20;
                const x = p.random(w / 2 + 50, p.width - w / 2 - 50);
                const y = lastY - p.random(50, 150);
                platforms.push({ x, y, w, h });
                lastY = y;
            }

            // יצירת פירות
            for (let i = 0; i < numFruits; i++) {
                const plat = p.random(platforms);
                const x = p.random(plat.x - plat.w / 2 + 10, plat.x + plat.w / 2 - 10);
                const y = plat.y - plat.h / 2 - 20;
                const type = p.floor(p.random(3));
                fruits.push({ x, y, type });
            }

            // הגדרת נקודת יציאה
            const highestPlatform = platforms.reduce((prev, curr) => (prev.y < curr.y ? prev : curr));
            const exit = { x: highestPlatform.x, y: highestPlatform.y - highestPlatform.h / 2 - 50, w: 50, h: 50 };

            return { playerStart, platforms, fruits, exit };
        }

        const sketch = (p) => {
            // משתנים גלובליים עבור סקיצת p5.js
            p.gamePhase = 'intro';
            p.startTime = 0;
            let transitionAlpha = 1;
            let activeKeys = {};
            let spacePressed = false;
            let jumpPressed = false;
            p.player;
            let currentLevelData;
            p.platforms = [];
            p.collectibleFruits = [];
            p.exitPoint;
            p.totalFruitsCollected = 0;
            p.currentLevelFruits = 0;
            p.unlockedAchievements = {};
            p.initialStage = 1;
            p.GameAssets = {};

            // הגדרות המשחק
            const GRAVITY_STRENGTH = 0.3;
            const JUMP_POWER = -7;
            const PLAYER_SPEED = 3;
            const MAX_JUMPS = 2;
            const GRAVITY_TOGGLE_LEVEL = 3;

            // פונקציה חיצונית שתופעל מה-HTML כדי להתחיל את המשחק
            p.startGame = function() {
                p.gamePhase = 'playing';
                p.startTime = p.millis();
                p.loadLevel(p.initialStage);
                p.toggleButtonsOverlay(false);
            };

            // פונקציה להצגת או הסתרת שכבת הכפתורים
            p.toggleButtonsOverlay = function(show) {
                const buttonsOverlay = document.getElementById('buttonsOverlay');
                if (buttonsOverlay) {
                    buttonsOverlay.style.display = show ? 'flex' : 'none';
                }
            };
            
            // --- לוגיקת הישגים ---
            p.checkAchievements = function() {
                if (p.totalFruitsCollected >= 10 && !p.unlockedAchievements['fruitCollector1']) {
                    p.unlockedAchievements['fruitCollector1'] = true;
                    showMessageBox('הישג חדש!', 'אספן פירות מתחיל: אספת 10 פירות!');
                    p.saveGameData(p.totalFruitsCollected, p.unlockedAchievements, p.player);
                }
                if (p.totalFruitsCollected >= 50 && !p.unlockedAchievements['fruitCollector2']) {
                    p.unlockedAchievements['fruitCollector2'] = true;
                    showMessageBox('הישג חדש!', 'אספן פירות מיומן: אספת 50 פירות!');
                    p.saveGameData(p.totalFruitsCollected, p.unlockedAchievements, p.player);
                }
                if (p.player && p.player.currentLevel >= 5 && !p.unlockedAchievements['stage5']) {
                    p.unlockedAchievements['stage5'] = true;
                    showMessageBox('הישג חדש!', 'כובש שלבים: השלמת שלב 5!');
                    p.saveGameData(p.totalFruitsCollected, p.unlockedAchievements, p.player);
                }
                if (p.player && p.player.currentLevel >= 10 && !p.unlockedAchievements['stage10']) {
                    p.unlockedAchievements['stage10'] = true;
                    showMessageBox('הישג חדש!', 'התקדמות מרשימה: השלמת שלב 10!');
                    p.saveGameData(p.totalFruitsCollected, p.unlockedAchievements, p.player);
                }
                if (p.player && p.player.currentLevel >= 25 && !p.unlockedAchievements['stage25']) {
                    p.unlockedAchievements['stage25'] = true;
                    showMessageBox('הישג חדש!', 'חצי דרך: השלמת שלב 25!');
                    p.saveGameData(p.totalFruitsCollected, p.unlockedAchievements, p.player);
                }
                if (p.player && p.player.currentLevel >= 50 && !p.unlockedAchievements['stage50']) {
                    p.unlockedAchievements['stage50'] = true;
                    showMessageBox('הישג חדש!', 'אגדה: השלמת שלב 50!');
                    p.saveGameData(p.totalFruitsCollected, p.unlockedAchievements, p.player);
                }
                // ניתן להוסיף כאן הישגים נוספים
            }
            
            // --- פונקציות לאיפוס וטעינת נתונים ---
            p.saveGameData = function(fruits, achievements, playerState) {
                const data = {
                    totalFruitsCollected: fruits,
                    unlockedAchievements: achievements,
                    lastLevel: playerState ? playerState.currentLevel : 1
                };
                localStorage.setItem(GAME_DATA_KEY, JSON.stringify(data));
            };

            p.loadGameData = function() {
                const data = localStorage.getItem(GAME_DATA_KEY);
                if (data) {
                    const parsedData = JSON.parse(data);
                    p.totalFruitsCollected = parsedData.totalFruitsCollected || 0;
                    p.unlockedAchievements = parsedData.unlockedAchievements || {};
                    p.initialStage = parsedData.lastLevel || 1;
                }
            };
            
            p.resetGameData = function() {
                localStorage.removeItem(GAME_DATA_KEY);
                p.totalFruitsCollected = 0;
                p.unlockedAchievements = {};
                p.initialStage = 1;
                showMessageBox('איפוס בוצע!', 'נתוני המשחק אופסו בהצלחה.');
            };

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
                    for (let pObj of p.platforms) {
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
                                this.x = pObj.x + p.width / 2 + this.width / 2;
                                this.velX = 0;
                            }
                        }
                    }

                    if (this.p.height && this.y > this.p.height + 50) {
                        p.gamePhase = 'game_over';
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
                        if (p.GameAssets.collectibleFruits[this.type]) {
                            this.p.image(p.GameAssets.collectibleFruits[this.type], this.x, this.y, this.width, this.height);
                        } else {
                            console.warn(`Collectible fruit asset type ${this.type} not found.`);
                            this.p.fill(255, 0, 0);
                            this.p.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
                        }
                    }
                }

                collect() {
                    this.collected = true;
                    p.totalFruitsCollected++;
                    p.currentLevelFruits++;
                    p.checkAchievements();
                    p.saveGameData(p.totalFruitsCollected, p.unlockedAchievements, p.player);
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
                    if (p.GameAssets.bossIcon) {
                        this.p.image(p.GameAssets.bossIcon, this.x, this.y, this.width * 0.8, this.height * 0.8);
                    } else {
                        console.warn("Boss icon asset not found.");
                        this.p.fill(0);
                        this.p.rect(this.x, this.y, this.width * 0.8, this.height * 0.8);
                    }
                }
            }

            // --- טעינת משאבים ---
            p.preload = function() {
                // ... (add asset loading here if needed)
                // For now, using placeholder assets
                p.GameAssets.playerIcon = p.createGraphics(32, 32);
                p.GameAssets.playerIcon.background(255, 100, 100);
                p.GameAssets.bossIcon = p.createGraphics(32, 32);
                p.GameAssets.bossIcon.background(0);
                p.GameAssets.collectibleFruits = [
                    p.createGraphics(20, 20),
                    p.createGraphics(20, 20),
                    p.createGraphics(20, 20)
                ];
                p.GameAssets.collectibleFruits[0].background(255, 0, 0); // Apple
                p.GameAssets.collectibleFruits[1].background(0, 255, 0); // Lime
                p.GameAssets.collectibleFruits[2].background(0, 0, 255); // Blueberry
            };
            
            p.setup = function() {
                const container = document.getElementById('p5-canvas-container');
                if (container) {
                    p.createCanvas(container.clientWidth, container.clientHeight).parent('p5-canvas-container');
                    p.rectMode(p.CENTER);
                    p.imageMode(p.CENTER);
                    p.loadGameData();
                    p.loadLevel(p.initialStage);
                } else {
                    console.error("Canvas container not found!");
                }
            };
            
            p.loadLevel = function(levelNum) {
                p.currentLevelFruits = 0;
                if (levelNum <= MAX_LEVELS) {
                    currentLevelData = generateLevelData(levelNum);
                    p.player = new Player(currentLevelData.playerStart.x, currentLevelData.playerStart.y, levelNum);
                    p.platforms = currentLevelData.platforms.map(plat => new Platform(plat.x, plat.y, plat.w, plat.h));
                    p.collectibleFruits = currentLevelData.fruits.map(fruit => new CollectibleFruit(fruit.x, fruit.y, fruit.type));
                    p.exitPoint = new ExitPoint(currentLevelData.exit.x, currentLevelData.exit.y, currentLevelData.exit.w, currentLevelData.exit.h);
                } else {
                    p.gamePhase = 'game_over';
                    showMessageBox('כל הכבוד!', 'השלמת את כל השלבים! נתוני המשחק אופסו כדי שתוכל לשחק שוב.');
                    p.resetGameData();
                }
            };

            p.draw = function() {
                p.background(0);
                if (p.gamePhase === 'playing') {
                    p.player.update();
                    p.player.draw();
                    p.platforms.forEach(plat => plat.draw());
                    p.collectibleFruits.forEach(fruit => fruit.draw());
                    p.exitPoint.draw();
                    checkCollisions();
                    drawHUD();
                    
                } else if (p.gamePhase === 'level_complete' || p.gamePhase === 'game_over') {
                    drawEndingScreen();
                }
            };
            
            function drawHUD() {
                p.fill(255);
                p.textSize(16);
                p.textAlign(p.LEFT, p.TOP);
                p.text(`שלב: ${p.player.currentLevel}`, 10, 10);
                p.text(`פירות: ${p.totalFruitsCollected}`, 10, 30);
                p.text(`קפיצות נותרו: ${p.player.jumpsLeft}`, 10, 50);
            }
            
            function drawEndingScreen() {
                p.fill(0, 0, 0, 150);
                p.rect(p.width / 2, p.height / 2, p.width, p.height);
                p.fill(255);
                p.textSize(32);
                p.textAlign(p.CENTER, p.CENTER);
                if (p.gamePhase === 'level_complete') {
                    p.text('כל הכבוד! השלמת את השלב.', p.width / 2, p.height / 2 - 50);
                    p.textSize(20);
                    p.text('לחץ על מקש כלשהו כדי להמשיך', p.width / 2, p.height / 2 + 50);
                } else if (p.gamePhase === 'game_over') {
                    p.text('הפסדת!', p.width / 2, p.height / 2 - 50);
                    p.textSize(20);
                    p.text('לחץ על מקש כלשהו כדי להתחיל מחדש', p.width / 2, p.height / 2 + 50);
                }
            }
            
            function checkCollisions() {
                for (let i = p.collectibleFruits.length - 1; i >= 0; i--) {
                    if (p.player.collidesWith(p.collectibleFruits[i]) && !p.collectibleFruits[i].collected) {
                        p.collectibleFruits[i].collect();
                        p.collectibleFruits.splice(i, 1);
                    }
                }
                
                if (p.player.collidesWith(p.exitPoint) && p.collectibleFruits.length === 0) {
                    p.gamePhase = 'level_complete';
                    showMessageBox('כל הכבוד!', `אספת את כל הפירות בשלב ${p.player.currentLevel}!`);
                    p.saveGameData(p.totalFruitsCollected, p.unlockedAchievements, p.player);
                }
            }

            p.keyPressed = function() {
                activeKeys[p.keyCode] = true;
                if (p.gamePhase === 'intro') {
                    if (p.keyCode === 83) { // S
                        p.startGame();
                    } else if (p.keyCode === 73) { // I
                        p.gamePhase = 'instructions';
                        // Add code to show instructions overlay
                    } else if (p.keyCode === 65) { // A
                        p.gamePhase = 'achievements';
                        // Add code to show achievements overlay
                    } else {
                        p.startGame();
                    }
                } else if (p.gamePhase === 'level_complete') {
                    p.initialStage++;
                    p.loadLevel(p.initialStage);
                    p.gamePhase = 'playing';
                    p.startTime = p.millis();
                } else if (p.gamePhase === 'game_over') {
                    p.loadGameData();
                    p.loadLevel(p.initialStage);
                    p.gamePhase = 'intro';
                    p.startTime = p.millis();
                } else if (p.gamePhase === 'instructions' || p.gamePhase === 'achievements') {
                    // Back to intro
                    p.gamePhase = 'intro';
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
