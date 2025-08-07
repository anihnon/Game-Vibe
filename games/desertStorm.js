/**
 * desertStorm.js
 *
 * יוזמה ופיתוח: ש. פרייס
 * גרפיקה ועיצוב: צוות הפרויקט
 *
 * פסאודוקוד:
 *
 * 1. אתחול גלובלי:
 * - הגדרת משתנים למצב המשחק (מסך, שחקן, אויבים, וכו').
 * - יצירת מערכים לאחסון אובייקטים דינמיים (קליעים, חלקיקים, אויבים).
 *
 * 2. פונקציית `setup` (הכנה):
 * - יצירת קנבס שמתאים לגודל המיכל.
 * - טעינת נתונים שמורים מה-localStorage (אם קיימים).
 * - אתחול אובייקט השחקן הראשי.
 * - קביעת קצב פריימים.
 *
 * 3. לולאת `draw` (ציור):
 * - ניקוי המסך בכל פריים.
 * - שימוש ב-switch-case כדי לקבוע איזה מסך להציג (תפריט, משחק, חנות וכו').
 * - קריאה לפונקציות המתאימות לציור ועדכון של כל מסך.
 * - טיפול במעברים בין מסכים.
 *
 * 4. מנגנון המשחק (בתוך `gameLoop`):
 * - הזזת המצלמה כדי לעקוב אחרי השחקן.
 * - ציור הרקע, המכשולים, והדמויות.
 * - טיפול בקלט מהמשתמש (תנועה, ירי).
 * - עדכון וציור של כל האויבים, כולל AI בסיסי (מעקב וירי).
 * - עדכון וציור של כל הקליעים ובדיקת פגיעות.
 * - בדיקת התנגשויות בין השחקן/אויבים לבין עצמים במפה.
 * - הפעלת מערכת הסופה והקטנת אזור המשחק.
 * - הצגת ממשק משתמש (חיים, תחמושת, משימות).
 *
 * 5. ניהול נתונים:
 * - פונקציית `saveGameState` לשמירת התקדמות (כסף, משימות, סקינים) ב-localStorage.
 * - פונקציית `loadGameState` לטעינת ההתקדמות בתחילת המשחק.
 *
 * 6. אובייקטים (Classes/Constructors):
 * - `Fighter`: מייצג את השחקן והאויבים. כולל מתודות לתנועה, ירי, טיפול בנזק וציור.
 * - `Projectile`: מייצג קליעים. כולל תנועה ובדיקת טווח.
 * - `UIButton`: כפתורים לממשק המשתמש.
 * - `WorldObject`: עצמים סטטיים במפה (עצים, סלעים).
 * - `Collectible`: פריטים לאיסוף (נשקים, תחמושת).
 *
 * 7. פונקציות עזר:
 * - פונקציות לבדיקת התנגשויות בין צורות גיאומטריות שונות.
 * - פונקציות לציור אלמנטים גרפיים מורכבים (דמויות, נשקים).
 */

const sketch = (p) => {
  // ==================================================
  // הגדרות גלובליות ומשתני משחק
  // ==================================================
  let gameState = 'loading'; // loading, mainMenu, gameplay, shop, instructions, missionControl, gameOver
  let player;
  let opponents = [];
  let projectiles = [];
  let worldObjects = {
    trees: [],
    rocks: [],
    crates: [],
    houses: [],
  };
  let collectibles = [];
  let particles = [];
  let floatingTexts = [];

  let keysPressed = {};
  let isMouseReleased = false;

  let camera = {
    x: 0,
    y: 0,
  };
  let transition = {
    alpha: 0,
    speed: 15,
    isActive: false,
    targetState: '',
  };

  let gameData = {
    currency: 0,
    missionsCompleted: [],
    skinsUnlocked: [1],
    currentSkin: 1,
  };

  // משתני עזר למידות רספונסיביות
  let baseWidth = 1800;
  let baseHeight = 1800;
  let scaleFactor = 1;

  const ENEMY_COUNT = 15;
  const CRATE_COUNT = 25;
  const TREE_COUNT = 20;
  const ROCK_COUNT = 20;
  const HOUSE_COUNT = 3;

  let storm = {
    x: baseWidth / 2,
    y: baseHeight / 2,
    size: 2800,
    shrinkRate: 0.3,
  };

  // רקע מונפש לתפריט
  let menuStars = [];

  // ==================================================
  // P5.js פונקציות ליבה
  // ==================================================

  p.setup = () => {
    let canvasContainer = document.getElementById('p5-canvas-container');
    let canvas = p.createCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvas.parent('p5-canvas-container');
    p.frameRate(30);
    p.textAlign(p.CENTER, p.CENTER);
    p.rectMode(p.CENTER);

    loadGameState();
    player = new Fighter(true, baseWidth / 2, baseHeight / 2);

    // אתחול כוכבים לרקע התפריט
    for (let i = 0; i < 100; i++) {
      menuStars.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(1, 3),
        speed: p.random(0.2, 1),
      });
    }

    // חשיפת פונקציות גלובליות לחלון
    window.startGame = () => {
      resetGame();
      runTransition('gameplay');
      document.getElementById('buttonsOverlay').style.display = 'none';
    };
    window.resetGameData = () => {
        localStorage.removeItem('desertStormSave');
        loadGameState(); // טוען את ערכי ברירת המחדל
        // צריך לרענן את התצוגה אם יש כזו
        showMessageBox('איפוס', 'הנתונים אופסו בהצלחה.');
    };
  };

  p.draw = () => {
    isMouseReleased = false;
    scaleFactor = p.min(p.width, p.height) / 800;

    switch (gameState) {
      case 'loading':
        // המעבר ל-mainMenu יקרה מה-HTML אחרי טעינת הנתונים
        p.background(34, 43, 58);
        p.fill(230);
        p.textSize(32 * scaleFactor);
        p.text('...מכין את שדה הקרב', p.width / 2, p.height / 2);
        break;
      case 'mainMenu':
        mainMenuScreen();
        break;
      case 'gameplay':
        gameLoop();
        break;
      case 'shop':
        shopScreen();
        break;
      case 'missionControl':
        missionScreen();
        break;
      case 'gameOver':
        gameOverScreen();
        break;
    }

    runTransitionEffect();
  };

  p.windowResized = () => {
    let canvasContainer = document.getElementById('p5-canvas-container');
    p.resizeCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);
    // עדכון כוכבי התפריט מחדש אם צריך
    menuStars = [];
     for (let i = 0; i < 100; i++) {
      menuStars.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(1, 3),
        speed: p.random(0.2, 1)
      });
    }
  };

  p.keyPressed = () => {
    keysPressed[p.keyCode] = true;
    keysPressed[p.key.toLowerCase()] = true;
  };

  p.keyReleased = () => {
    keysPressed[p.keyCode] = false;
    keysPressed[p.key.toLowerCase()] = false;
  };

  p.mouseReleased = () => {
    isMouseReleased = true;
  };

  // ==================================================
  // ניהול מצבי משחק ומסכים
  // ==================================================

  function gameLoop() {
    p.background(194, 178, 128); // צבע חול

    updateCamera();
    p.push();
    p.translate(camera.x, camera.y);

    drawGrid();

    // ציור אובייקטים
    Object.values(worldObjects).flat().forEach(obj => obj.draw());
    collectibles.forEach(c => c.draw());

    // עדכון וציור קליעים
    for (let i = projectiles.length - 1; i >= 0; i--) {
      projectiles[i].update();
      projectiles[i].draw();
      if (projectiles[i].isOutOfBounds()) {
        projectiles.splice(i, 1);
      }
    }

    // עדכון וציור שחקן ואויבים
    player.update();
    player.draw();

    for (let i = opponents.length - 1; i >= 0; i--) {
      opponents[i].update();
      opponents[i].draw();
      if (opponents[i].isDead()) {
        player.xp += 20; // תגמול על הריגה
        player.kills++;
        checkMissionsOnEvent('kill');
        createLoot(opponents[i].x, opponents[i].y);
        createExplosion(opponents[i].x, opponents[i].y, [200, 0, 0]);
        opponents.splice(i, 1);
      }
    }
    
    // בדיקת התנגשויות
    handleCollisions();

    // עדכון וציור חלקיקים וטקסטים צפים
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isFaded()) {
        particles.splice(i, 1);
      }
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].update();
        floatingTexts[i].draw();
        if (floatingTexts[i].isFaded()) {
            floatingTexts.splice(i, 1);
        }
    }

    updateStorm();
    drawStorm();

    p.pop(); // שחרור המצלמה

    drawHUD();

    if (player.isDead()) {
      runTransition('gameOver');
    }
  }
  
  function mainMenuScreen() {
      p.background(10, 20, 40);
      // רקע כוכבים מונפש
      p.noStroke();
      menuStars.forEach(star => {
          star.y += star.speed;
          if (star.y > p.height) {
              star.y = 0;
              star.x = p.random(p.width);
          }
          p.fill(255, 255, 255, p.random(100, 200));
          p.ellipse(star.x, star.y, star.size, star.size);
      });

      p.fill(255);
      p.textSize(60 * scaleFactor);
      p.text('סופת מדבר', p.width / 2, p.height * 0.2);
      
      // כאן ניתן להוסיף כפתורים אם רוצים לנהל אותם מתוך הקנבס
      // כרגע הכפתורים מנוהלים מה-HTML
  }

  function gameOverScreen() {
      p.background(50, 20, 20);
      p.fill(255);
      p.textSize(60 * scaleFactor);
      p.text('המשחק נגמר', p.width / 2, p.height * 0.3);
      
      p.textSize(30 * scaleFactor);
      p.text(`הריגות: ${player.kills}`, p.width / 2, p.height * 0.5);
      p.text(`שרדת ${Math.floor(player.timeAlive)} שניות`, p.width / 2, p.height * 0.6);

      // כפתור חזרה לתפריט
      let backButton = new UIButton(p.width / 2, p.height * 0.8, 200 * scaleFactor, 50 * scaleFactor, 'חזרה לתפריט', () => {
          document.getElementById('buttonsOverlay').style.display = 'flex';
          runTransition('mainMenu');
      });
      backButton.draw();
      backButton.checkClick();
  }

  // פונקציות מסכים נוספות (חנות, הוראות, משימות) יכולות להתווסף כאן
  // ...

  // ==================================================
  // ניהול משחק
  // ==================================================

  function resetGame() {
    opponents = [];
    projectiles = [];
    collectibles = [];
    particles = [];
    floatingTexts = [];
    
    worldObjects.crates = [];
    worldObjects.trees = [];
    worldObjects.rocks = [];
    worldObjects.houses = [];

    // אתחול אובייקטים במפה
    for (let i = 0; i < TREE_COUNT; i++) worldObjects.trees.push(new WorldObject('tree'));
    for (let i = 0; i < ROCK_COUNT; i++) worldObjects.rocks.push(new WorldObject('rock'));
    for (let i = 0; i < CRATE_COUNT; i++) worldObjects.crates.push(new WorldObject('crate'));
    for (let i = 0; i < HOUSE_COUNT; i++) worldObjects.houses.push(new WorldObject('house'));
    
    // אתחול אויבים
    for (let i = 0; i < ENEMY_COUNT; i++) {
        let pos = findSafeSpawnPoint();
        opponents.push(new Fighter(false, pos.x, pos.y));
    }

    player.reset();
    
    storm.size = 2800;
  }

  function findSafeSpawnPoint() {
      let safe = false;
      let x, y;
      while (!safe) {
          x = p.random(200, baseWidth - 200);
          y = p.random(200, baseHeight - 200);
          safe = true;
          // בדיקה שהנקודה לא בתוך בית
          for (const house of worldObjects.houses) {
              if (p.dist(x, y, house.x, house.y) < house.size) {
                  safe = false;
                  break;
              }
          }
      }
      return { x, y };
  }

  function handleCollisions() {
      let allFighters = [player, ...opponents];
      let allSolidObjects = [...Object.values(worldObjects).flat()];

      // התנגשות קליעים
      for (let i = projectiles.length - 1; i >= 0; i--) {
          let proj = projectiles[i];
          let hit = false;

          // פגיעה בלוחמים
          for (const fighter of allFighters) {
              if (proj.owner !== fighter && p.dist(proj.x, proj.y, fighter.x, fighter.y) < fighter.size / 2) {
                  fighter.takeDamage(proj.damage);
                  hit = true;
                  if (proj.owner === player && fighter.isDead()) {
                    player.xp += 20;
                    player.kills++;
                  }
                  break;
              }
          }
          if (hit) { 
              projectiles.splice(i, 1); 
              continue; 
          }

          // פגיעה בעצמים
          for (const obj of allSolidObjects) {
              if (obj.isHit(proj.x, proj.y)) {
                  obj.takeDamage(proj.damage);
                  hit = true;
                  break;
              }
          }
          if (hit) { 
              projectiles.splice(i, 1); 
          }
      }
      
      // התנגשות לוחמים עם עצמים
      for (const fighter of allFighters) {
          for (const obj of allSolidObjects) {
              obj.collide(fighter);
          }
      }
  }
  
  function createLoot(x, y) {
      if (p.random() < 0.8) { // 80% סיכוי לנפילת פריט
          const lootTable = [
              { type: 'ammo_small', weight: 30 },
              { type: 'ammo_medium', weight: 20 },
              { type: 'ammo_large', weight: 10 },
              { type: 'medkit', weight: 15 },
              { type: 'weapon_smg', weight: 5 },
              { type: 'weapon_ar', weight: 3 },
          ];
          let totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);
          let random = p.random(totalWeight);
          let chosenLoot;
          for (const item of lootTable) {
              random -= item.weight;
              if (random < 0) {
                  chosenLoot = item.type;
                  break;
              }
          }
          collectibles.push(new Collectible(x, y, chosenLoot));
      }
  }


  // ==================================================
  // מצלמה, ממשק משתמש ואפקטים
  // ==================================================

  function updateCamera() {
    camera.x = p.lerp(camera.x, p.width / 2 - player.x, 0.1);
    camera.y = p.lerp(camera.y, p.height / 2 - player.y, 0.1);
  }

  function drawHUD() {
    // מד חיים
    p.fill(50, 50, 50, 200);
    p.rect(p.width / 2, p.height - 30, 200, 20, 5);
    p.fill(0, 200, 0);
    let healthWidth = p.map(player.health, 0, 100, 0, 200);
    p.rect((p.width/2 - 100) + healthWidth/2, p.height - 30, healthWidth, 20, 5);

    // תצוגת תחמושת
    p.fill(50, 50, 50, 200);
    p.rect(p.width - 100, p.height - 30, 150, 40, 5);
    p.fill(255);
    p.textSize(18 * scaleFactor);
    let currentAmmo = player.getAmmoCount();
    p.text(`${player.weapon.name}: ${currentAmmo}`, p.width - 100, p.height - 30);
    
    // תצוגת הריגות
    p.fill(255);
    p.textSize(20 * scaleFactor);
    p.text(`הריגות: ${player.kills}`, 80, 30);
    p.text(`אויבים: ${opponents.length}`, 80, 60);
  }
  
  function drawGrid() {
      p.stroke(0, 0, 0, 20);
      p.strokeWeight(1);
      for (let x = -baseWidth; x < baseWidth * 2; x += 50) {
          p.line(x, -baseHeight, x, baseHeight * 2);
      }
      for (let y = -baseHeight; y < baseHeight * 2; y += 50) {
          p.line(-baseWidth, y, baseWidth * 2, y);
      }
  }

  function updateStorm() {
    if (storm.size > 500) {
        storm.size -= storm.shrinkRate;
    }
    if (p.dist(player.x, player.y, storm.x, storm.y) > storm.size / 2) {
        player.takeDamage(0.1); // נזק קטן לאורך זמן
    }
  }

  function drawStorm() {
      p.noFill();
      p.strokeWeight(100);
      p.stroke(150, 0, 200, 50);
      p.ellipse(storm.x, storm.y, storm.size + 100, storm.size + 100);
      p.stroke(150, 0, 200, 100);
      p.ellipse(storm.x, storm.y, storm.size, storm.size);
  }

  function runTransition(target) {
    transition.isActive = true;
    transition.targetState = target;
  }

  function runTransitionEffect() {
    if (transition.isActive) {
      p.fill(0, transition.alpha);
      p.rect(p.width / 2, p.height / 2, p.width, p.height);
      transition.alpha += transition.speed;

      if (transition.alpha >= 255) {
        transition.alpha = 255;
        transition.speed *= -1;
        gameState = transition.targetState;
      }

      if (transition.alpha < 0) {
        transition.isActive = false;
        transition.alpha = 0;
        transition.speed *= -1;
      }
    }
  }
  
  function createExplosion(x, y, col) {
      for (let i = 0; i < 20; i++) {
          particles.push(new Particle(x, y, col));
      }
  }

  // ==================================================
  // מחלקות (Classes)
  // ==================================================

  class Fighter {
    constructor(isPlayer, x, y) {
      this.isPlayer = isPlayer;
      this.x = x;
      this.y = y;
      this.size = 40;
      this.speed = 4;
      this.velX = 0;
      this.velY = 0;
      this.angle = 0;

      this.health = 100;
      this.maxHealth = 100;
      
      this.fireCooldown = 0;
      this.weapon = getWeaponStats('pistol');
      this.ammo = { small: 50, medium: 0, large: 0 };
      
      this.xp = 0;
      this.level = 1;
      this.kills = 0;
      this.timeAlive = 0;

      // AI-specific
      this.aiState = 'idle'; // idle, seeking, attacking
      this.aiTarget = null;
      this.aiMoveTarget = { x, y };
      this.aiStateTimer = 0;
    }

    update() {
      if (this.isPlayer) {
        this.handlePlayerInput();
        this.timeAlive += p.deltaTime / 1000;
      } else {
        this.runAI();
      }
      this.move();
      this.fireCooldown = Math.max(0, this.fireCooldown - 1);
    }
    
    getAmmoCount() {
        if (!this.weapon.ammoType) return '∞';
        return this.ammo[this.weapon.ammoType];
    }

    handlePlayerInput() {
      // תנועה
      let moveX = 0;
      let moveY = 0;
      if (keysPressed['a'] || keysPressed[p.LEFT_ARROW]) moveX -= 1;
      if (keysPressed['d'] || keysPressed[p.RIGHT_ARROW]) moveX += 1;
      if (keysPressed['w'] || keysPressed[p.UP_ARROW]) moveY -= 1;
      if (keysPressed['s'] || keysPressed[p.DOWN_ARROW]) moveY += 1;

      // נרמול וקטור התנועה
      let moveVec = p.createVector(moveX, moveY);
      if (moveVec.mag() > 0) {
          moveVec.normalize();
      }
      
      this.velX = moveVec.x * this.speed;
      this.velY = moveVec.y * this.speed;

      // כיוון
      this.angle = p.atan2(p.mouseY - p.height / 2, p.mouseX - p.width / 2);

      // ירי
      if (p.mouseIsPressed) {
        this.shoot();
      }
    }

    runAI() {
        this.aiStateTimer--;
        // בחירת מטרה
        if (!this.aiTarget || this.aiTarget.isDead() || this.aiStateTimer <= 0) {
            this.aiTarget = player; // כרגע תמיד תוקף את השחקן
            this.aiStateTimer = p.random(100, 200);
        }

        if (this.aiTarget) {
            let distToTarget = p.dist(this.x, this.y, this.aiTarget.x, this.aiTarget.y);
            this.angle = p.atan2(this.aiTarget.y - this.y, this.aiTarget.x - this.x);

            if (distToTarget > this.weapon.range * 0.8) {
                // התקרב למטרה
                this.velX = p.cos(this.angle) * this.speed * 0.7;
                this.velY = p.sin(this.angle) * this.speed * 0.7;
            } else if (distToTarget < this.weapon.range * 0.5) {
                // התרחק מעט
                 this.velX = -p.cos(this.angle) * this.speed * 0.5;
                 this.velY = -p.sin(this.angle) * this.speed * 0.5;
            } else {
                // שמור על מרחק וירה
                this.velX = 0;
                this.velY = 0;
                this.shoot();
            }
        }
    }

    move() {
        this.x += this.velX;
        this.y += this.velY;
        this.x = p.constrain(this.x, this.size / 2, baseWidth - this.size / 2);
        this.y = p.constrain(this.y, this.size / 2, baseHeight - this.size / 2);
    }

    shoot() {
      if (this.fireCooldown <= 0) {
        let hasAmmo = this.weapon.ammoType ? this.ammo[this.weapon.ammoType] > 0 : true;
        
        if (hasAmmo) {
            for (let i = 0; i < this.weapon.pellets; i++) {
                let spreadAngle = this.angle + p.random(-this.weapon.spread, this.weapon.spread);
                projectiles.push(new Projectile(this.x, this.y, spreadAngle, this));
            }
            this.fireCooldown = this.weapon.fireRate;
            if(this.weapon.ammoType) {
                this.ammo[this.weapon.ammoType]--;
            }
        }
      }
    }

    draw() {
      p.push();
      p.translate(this.x, this.y);
      p.rotate(this.angle);

      // גוף
      p.fill(this.isPlayer ? [0, 150, 0] : [150, 0, 0]);
      p.stroke(0);
      p.strokeWeight(2);
      p.ellipse(0, 0, this.size, this.size);

      // קנה הנשק
      p.fill(80);
      p.rect(this.size / 2, 0, this.size * 0.7, this.size * 0.2);

      p.pop();
      
      // מד חיים
      p.noStroke();
      p.fill(50);
      p.rect(this.x, this.y - this.size * 0.8, this.size, 5);
      p.fill(0,255,0);
      let healthW = p.map(this.health, 0, this.maxHealth, 0, this.size);
      p.rect(this.x - (this.size - healthW)/2, this.y - this.size * 0.8, healthW, 5);
    }

    takeDamage(amount) {
      this.health -= amount;
      if (this.health < 0) this.health = 0;
    }

    isDead() {
      return this.health <= 0;
    }
    
    reset() {
        this.health = this.maxHealth;
        this.x = baseWidth / 2;
        this.y = baseHeight / 2;
        this.weapon = getWeaponStats('pistol');
        this.ammo = { small: 50, medium: 30, large: 10 };
        this.kills = 0;
        this.timeAlive = 0;
    }
  }

  class Projectile {
    constructor(x, y, angle, owner) {
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.owner = owner;
      this.speed = 15;
      this.damage = owner.weapon.damage;
      this.range = owner.weapon.range;
      this.startX = x;
      this.startY = y;
    }

    update() {
      this.x += p.cos(this.angle) * this.speed;
      this.y += p.sin(this.angle) * this.speed;
    }

    draw() {
      p.push();
      p.stroke(255, 200, 0);
      p.strokeWeight(4);
      p.point(this.x, this.y);
      p.pop();
    }
    
    isOutOfBounds() {
        return p.dist(this.x, this.y, this.startX, this.startY) > this.range;
    }
  }

  class WorldObject {
      constructor(type) {
          this.type = type;
          let pos = findSafeSpawnPoint();
          this.x = pos.x;
          this.y = pos.y;
          
          if (type === 'tree') {
              this.size = p.random(40, 80);
              this.health = 50;
          } else if (type === 'rock') {
              this.size = p.random(50, 100);
              this.health = 200;
          } else if (type === 'crate') {
              this.size = 60;
              this.health = 30;
          } else if (type === 'house') {
              this.size = p.random(250, 400);
              this.health = 1000;
          }
      }

      draw() {
          p.push();
          p.translate(this.x, this.y);
          p.stroke(0);
          p.strokeWeight(2);
          if (this.type === 'tree') {
              p.fill(34, 139, 34); // ירוק
              p.ellipse(0, 0, this.size, this.size);
          } else if (this.type === 'rock') {
              p.fill(139, 137, 137); // אפור
              p.rect(0, 0, this.size, this.size);
          } else if (this.type === 'crate') {
              p.fill(139, 69, 19); // חום
              p.rect(0, 0, this.size, this.size);
          } else if (this.type === 'house') {
              p.fill(210, 180, 140); // בז'
              p.rect(0, 0, this.size, this.size);
          }
          p.pop();
      }
      
      isHit(px, py) {
          return p.dist(px, py, this.x, this.y) < this.size / 2;
      }
      
      takeDamage(amount) {
          this.health -= amount;
          if (this.health <= 0) {
              this.destroy();
          }
      }
      
      destroy() {
          // הסרת האובייקט מהמערך
          const arr = worldObjects[this.type + 's'];
          const index = arr.indexOf(this);
          if (index > -1) {
              arr.splice(index, 1);
          }
          if (this.type === 'crate') {
              createLoot(this.x, this.y);
          }
          createExplosion(this.x, this.y, [139, 69, 19]);
      }
      
      collide(fighter) {
          let d = p.dist(fighter.x, fighter.y, this.x, this.y);
          if (d < (fighter.size / 2 + this.size / 2)) {
              let angle = p.atan2(fighter.y - this.y, fighter.x - this.x);
              let overlap = (fighter.size / 2 + this.size / 2) - d;
              fighter.x += p.cos(angle) * overlap;
              fighter.y += p.sin(angle) * overlap;
          }
      }
  }
  
  class Collectible {
      constructor(x, y, type) {
          this.x = x;
          this.y = y;
          this.type = type;
          this.size = 20;
      }
      
      draw() {
          p.push();
          p.translate(this.x, this.y);
          p.stroke(255, 255, 0);
          p.strokeWeight(3);
          if (this.type.includes('ammo')) {
              p.fill(100, 100, 100);
          } else if (this.type.includes('medkit')) {
              p.fill(255, 0, 0);
          } else {
              p.fill(0, 0, 255);
          }
          p.ellipse(0, 0, this.size, this.size);
          p.pop();
          
          // בדיקת איסוף
          if (p.dist(this.x, this.y, player.x, player.y) < (this.size / 2 + player.size / 2)) {
              this.collect();
          }
      }
      
      collect() {
          let collected = false;
          if (this.type === 'medkit' && player.health < player.maxHealth) {
              player.health = Math.min(player.maxHealth, player.health + 25);
              collected = true;
          } else if (this.type === 'ammo_small') {
              player.ammo.small += 20;
              collected = true;
          } else if (this.type === 'ammo_medium') {
              player.ammo.medium += 15;
              collected = true;
          } else if (this.type === 'ammo_large') {
              player.ammo.large += 10;
              collected = true;
          }
          // איסוף נשקים...
          
          if (collected) {
              floatingTexts.push(new FloatingText(this.x, this.y, `+ ${this.type.replace('_', ' ')}`));
              const index = collectibles.indexOf(this);
              if (index > -1) {
                  collectibles.splice(index, 1);
              }
          }
      }
  }

  class Particle {
      constructor(x, y, col) {
          this.x = x;
          this.y = y;
          this.vel = p5.Vector.random2D().mult(p.random(1, 4));
          this.lifespan = 255;
          this.col = col;
          this.size = p.random(3, 8);
      }
      
      update() {
          this.x += this.vel.x;
          this.y += this.vel.y;
          this.vel.mult(0.95);
          this.lifespan -= 5;
      }
      
      draw() {
          p.noStroke();
          p.fill(this.col[0], this.col[1], this.col[2], this.lifespan);
          p.ellipse(this.x, this.y, this.size, this.size);
      }
      
      isFaded() {
          return this.lifespan < 0;
      }
  }
  
  class FloatingText {
      constructor(x, y, txt) {
          this.x = x;
          this.y = y;
          this.txt = txt;
          this.lifespan = 255;
      }
      
      update() {
          this.y -= 1;
          this.lifespan -= 4;
      }
      
      draw() {
          p.fill(255, this.lifespan);
          p.textSize(16 * scaleFactor);
          p.text(this.txt, this.x, this.y);
      }
      
      isFaded() {
          return this.lifespan < 0;
      }
  }

  class UIButton {
      constructor(x, y, w, h, text, onClick) {
          this.x = x;
          this.y = y;
          this.w = w;
          this.h = h;
          this.text = text;
          this.onClick = onClick;
      }

      draw() {
          p.push();
          p.rectMode(p.CENTER);
          let mouseOver = this.isMouseOver();
          if (mouseOver) {
              p.fill(100, 150, 100);
          } else {
              p.fill(80, 120, 80);
          }
          p.stroke(200);
          p.strokeWeight(2);
          p.rect(this.x, this.y, this.w, this.h, 10);
          
          p.fill(255);
          p.noStroke();
          p.textSize(this.h * 0.4);
          p.text(this.text, this.x, this.y);
          p.pop();
      }

      isMouseOver() {
          return p.mouseX > this.x - this.w / 2 && p.mouseX < this.x + this.w / 2 &&
                 p.mouseY > this.y - this.h / 2 && p.mouseY < this.y + this.h / 2;
      }

      checkClick() {
          if (this.isMouseOver() && isMouseReleased) {
              this.onClick();
          }
      }
  }

  // ==================================================
  // נתוני משחק (נשקים, משימות)
  // ==================================================
  
  function getWeaponStats(name) {
      const weapons = {
          'pistol': { name: 'אקדח', damage: 8, fireRate: 20, spread: 0.1, pellets: 1, range: 400, ammoType: null },
          'smg':    { name: 'תמ"ק', damage: 10, fireRate: 5, spread: 0.3, pellets: 1, range: 500, ammoType: 'small' },
          'ar':     { name: 'רובה סער', damage: 15, fireRate: 8, spread: 0.2, pellets: 1, range: 700, ammoType: 'medium' },
          'shotgun':{ name: 'שוטגאן', damage: 7, fireRate: 40, spread: 0.5, pellets: 8, range: 300, ammoType: 'large' },
      };
      return weapons[name];
  }

  const missions = [
      { id: 'first_blood', text: 'הריגה ראשונה', goal: { type: 'kill', amount: 1 }, reward: 50 },
      { id: 'five_kills', text: 'חמש הריגות', goal: { type: 'kill', amount: 5 }, reward: 150 },
      { id: 'survivalist_1', text: 'שרוד 60 שניות', goal: { type: 'time', amount: 60 }, reward: 100 },
  ];

  function checkMissionsOnEvent(eventType) {
      missions.forEach(mission => {
          if (!gameData.missionsCompleted.includes(mission.id) && mission.goal.type === eventType) {
              let progress = 0;
              if (eventType === 'kill') progress = player.kills;
              if (eventType === 'time') progress = player.timeAlive;
              
              if (progress >= mission.goal.amount) {
                  gameData.missionsCompleted.push(mission.id);
                  gameData.currency += mission.reward;
                  floatingTexts.push(new FloatingText(player.x, player.y - 50, `משימה הושלמה: ${mission.text}`));
                  saveGameState();
              }
          }
      });
  }

  // ==================================================
  // שמירה וטעינה
  // ==================================================

  function saveGameState() {
    try {
        localStorage.setItem('desertStormSave', JSON.stringify(gameData));
    } catch (e) {
        console.error("Failed to save game state:", e);
    }
  }

  function loadGameState() {
    try {
        const savedData = localStorage.getItem('desertStormSave');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // אימות בסיסי של הנתונים
            if (typeof parsedData.currency === 'number') {
                gameData = parsedData;
            }
        }
    } catch (e) {
        console.error("Failed to load game state:", e);
    }
  }
};
