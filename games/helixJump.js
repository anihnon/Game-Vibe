//
// ------------------------------------
// משתנים גלובליים, מחלקות, קבועים
// ------------------------------------
//

// פונקציות לטיפול בעוגיות
//
// שמירת עוגייה
var setCookie = function(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

// קבלת ערך מעוגייה
var getCookie = function(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};
//

//Thumbnail
//
var thumbnail, getThumb = "";
//

//Leaderboard
//
var leaderboard = [
    ["איתן", 999999999],
    ["דניאל", 876543210],
    ["אני", 789123456],
    ["שיר", 654321098],
    ["משה", 555444333],
    ["אילן", 423567890],
    ["עידן", 398765432],
    ["טל", 312345678],
    ["תום", 256789012],
    ["אביב", 210987654],
    ["פיקאצ'ו", 187654321],
    ["בובספוג", 154321098],
    ["פטריק", 123456789],
    ["סקווידוויד", 98765432],
    ["מר קראב", 76543210],
    ["פלנקטון", 55443322],
    ["סנדי", 43210987],
    ["דודל בוב", 31234567],
    ["הרגל שלי", 21098765],
    ["סקוויליאם", 15678901],
    ["קווין", 12345678],
    ["פנינה", 9876543],
    ["גברת פאף", 6543210],
    ["זקן ג'נקינס", 4433221],
    ["פרד", 2109876],
    ["באבל באס", 1567890],
    ["הסלאשר התולה", 987654],
    ["ההולנדי המעופף", 543210],
    ["המלך נפטון", 123456],
    ["איש מדוזה", 50000],
    ["ילד ים", 10000],
    ["איש הים", 5000]
];
//

//Player
//
var p = {
    x : 0, y : 0,
    r : 20,
    vx : 0, vy : 0,
    ax : 0, ay : 0,
    onground : false,
    alive : true,
    angle: 0
};

//Levels
//
var palettes = [
    [//PURPLE
        [50, 150, 250], //BG
        [255, 255, 255], //Text
        [0, 0, 0], //Player
        [255, 0, 0], //Danger
        [255, 255, 255], //Normal
        [100, 100, 100], //Shadows
    ],
    [//NEON
        [10, 250, 250],
        [255, 255, 255],
        [20, 20, 20],
        [250, 250, 10],
        [250, 10, 250],
        [200, 200, 200],
    ],
    [//HELL
        [255, 0, 0],
        [0, 0, 0],
        [20, 20, 20],
        [10, 250, 250],
        [250, 250, 10],
        [255, 150, 150],
    ],
    [//FROSTY
        [100, 100, 255],
        [255, 255, 255],
        [20, 20, 20],
        [255, 0, 0],
        [255, 255, 255],
        [200, 200, 200],
    ],
    [//DARK
        [50, 50, 50],
        [255, 255, 255],
        [255, 255, 255],
        [255, 0, 0],
        [100, 100, 100],
        [0, 0, 0],
    ],
    [//BEACH
        [250, 250, 100],
        [50, 50, 50],
        [250, 150, 0],
        [255, 0, 0],
        [250, 250, 200],
        [200, 200, 200],
    ],
    [//SPACE
        [10, 10, 50],
        [255, 255, 255],
        [250, 250, 10],
        [255, 0, 0],
        [100, 100, 100],
        [0, 0, 0],
    ],
    [//JUNGLE
        [0, 100, 0],
        [255, 255, 255],
        [20, 20, 20],
        [255, 0, 0],
        [255, 255, 255],
        [0, 50, 0],
    ],
    [//GREEN
        [100, 250, 100],
        [255, 255, 255],
        [0, 0, 0],
        [255, 0, 0],
        [255, 255, 255],
        [100, 200, 100],
    ],
    [//DARKGREEN
        [0, 50, 0],
        [255, 255, 255],
        [0, 0, 0],
        [255, 0, 0],
        [100, 100, 100],
        [0, 25, 0],
    ],
    [//ORANGE
        [250, 150, 100],
        [255, 255, 255],
        [0, 0, 0],
        [255, 0, 0],
        [255, 255, 255],
        [250, 100, 0],
    ],
    [//WHITE
        [255, 255, 255],
        [0, 0, 0],
        [0, 0, 0],
        [255, 0, 0],
        [255, 255, 255],
        [200, 200, 200],
    ],
    [//BROWN
        [100, 50, 0],
        [255, 255, 255],
        [0, 0, 0],
        [255, 0, 0],
        [255, 255, 255],
        [50, 25, 0],
    ],
    [//RED
        [250, 50, 50],
        [255, 255, 255],
        [0, 0, 0],
        [0, 255, 0],
        [255, 255, 255],
        [200, 0, 0],
    ],
    [//BLACK
        [0, 0, 0],
        [255, 255, 255],
        [255, 255, 255],
        [0, 255, 0],
        [100, 100, 100],
        [0, 0, 0],
    ],
    [//PINK
        [250, 150, 250],
        [255, 255, 255],
        [0, 0, 0],
        [255, 0, 0],
        [255, 255, 255],
        [200, 100, 200],
    ],
    [//CYAN
        [50, 250, 250],
        [255, 255, 255],
        [0, 0, 0],
        [255, 0, 0],
        [255, 255, 255],
        [0, 200, 200],
    ],
    [//GRAY
        [150, 150, 150],
        [255, 255, 255],
        [0, 0, 0],
        [255, 0, 0],
        [255, 255, 255],
        [100, 100, 100],
    ]
];

var scenes = [false, true, false, false];
var levels = [[], []];
var layers = [];
var f;
var xVel, yVel, rotVel;
var Cur_Pal = 0;
var score = 0;
var hiscore = 0;

//Fonts
//
var fonts = [];
//

//Layer class
//
var Layer = function(y, r, w, d) {
    this.y = y;
    this.r = r;
    this.width = w;
    this.dir = d;
    this.parts = [];
    this.angle = 0;
    
    var a = -this.width / 2;
    var end = a + this.width;
    
    while(a < 360) {
        
        this.parts.push(a);
        a = a + end;
        
        
        var c = random(10);
        
        if(c > 8) {
            this.parts.push(a);
            a = a + this.width;
        }
        
        
    }
};
//

//sorts the array for the leaderboard
//
var sortArr = function(a, b) {
    return b[1] - a[1];
};
//

//Switching the colors
//
var switchCol = function(a, b, c) {
    let strokeColor = palettes[Cur_Pal][a];
    stroke(strokeColor[0], strokeColor[1], strokeColor[2]);
    let fillColor = palettes[Cur_Pal][b];
    fill(fillColor[0], fillColor[1], fillColor[2]);
    let tintColor = palettes[Cur_Pal][c];
    tint(tintColor[0], tintColor[1], tintColor[2]);
};
//

//updates the colors based on the current palette
//
var updatePalette = function(id) {
    Cur_Pal = id;
};
//

//Custom Text function
//
var Text = function(t, x, y, c) {
    let fillColor = palettes[Cur_Pal][c];
    fill(fillColor[0], fillColor[1], fillColor[2]);
    text(t, x, y);
};
//

//Render layers
//
var renderLayers = function() {
    
    for(var i = layers.length - 1; i >= 0; i--) {
        var l = layers[i];
        
        push();
        translate(width / 2, l.y);
        rotate(radians(l.angle));
        
        for(var p = 0; p < l.parts.length; p += 2) {
            
            if(l.parts[p + 1] === l.parts[p] + l.width) {
                
                
                switchCol(5, 3, 4);
                arc(0, 0, l.r, l.r, l.parts[p], l.parts[p + 1]);
                
            } else {
                
                switchCol(5, 4, 4);
                arc(0, 0, l.r, l.r, l.parts[p], l.parts[p + 1]);
            }
        }
        pop();
    }
};
//

//Render player
//
var renderPlayer = function() {
    
    
    push();
    translate(width / 2 + p.x, p.y);
    rotate(radians(p.angle));
    
    
    switchCol(2, 2, 4);
    ellipse(0, 0, p.r, p.r);
    
    pop();
    
};
//

//Play scene
//
var PlayScene = function() {
    
    
    if(p.alive) {
        
        
        //Movement
        //
        p.x += p.vx;
        p.y += p.vy;
        
        p.vx += p.ax;
        p.vy += p.ay;
        
        p.vy *= 0.99;
        p.vy += 0.05;
        
        p.ax = -p.vx * 0.1;
        
        if(p.x > width / 2) {
            p.x = width / 2;
            p.vx = 0;
        }
        if(p.x < -width / 2) {
            p.x = -width / 2;
            p.vx = 0;
        }
        
        //
        
        //Layers
        //
        for(var i = 0; i < layers.length; i++) {
            
            var l = layers[i];
            l.angle += l.dir * 0.1;
            
            l.y += 1;
            if(l.y > p.y + height) {
                l.y -= 1;
            }
            
            
            if(l.y > p.y) {
                
                
                var dist = Math.sqrt(Math.pow((width / 2 + p.x) - width / 2, 2) + Math.pow(p.y - l.y, 2));
                
                if(dist <= l.r / 2 + p.r / 2) {
                    
                    
                    var angle = atan2(p.y - l.y, (width / 2 + p.x) - width / 2);
                    
                    angle -= l.angle;
                    angle += 180;
                    angle %= 360;
                    
                    angle = 360 - angle;
                    angle %= 360;
                    
                    
                    
                    if(!p.onground) {
                        
                        var onsafe = false;
                        
                        for(var a = 0; a < l.parts.length; a += 2) {
                            
                            if(angle > l.parts[a] && angle < l.parts[a + 1]) {
                                
                                if(l.parts[a + 1] === l.parts[a] + l.width) {
                                    
                                    p.ay = 0;
                                    p.vy = -10;
                                    
                                    if(l.y > p.y) {
                                        p.y = l.y - 1;
                                    }
                                    
                                    score += 10;
                                    
                                    onsafe = true;
                                    
                                } else {
                                    
                                    p.alive = false;
                                    
                                }
                            }
                        }
                        
                        if(onsafe) {
                            p.onground = true;
                        } else {
                            p.onground = false;
                        }
                        
                    }
                }
                
            }
            
        }
        
        //
        
        
        //Render
        //
        renderLayers();
        renderPlayer();
        //
        
        
        //UI
        //
        
        Text("שיא: " + hiscore, width / 2, 40, 1);
        Text("ניקוד: " + score, width / 2, 70, 1);
        
        //
        
        
    } else {
        
        //Game over
        //
        let textColor = palettes[Cur_Pal][1];
        fill(textColor[0], textColor[1], textColor[2]);
        
        textFont("Comic Sans MS", 80);
        Text("המשחק נגמר", width / 2, height / 2 - 150, 1);
        
        textFont("Comic Sans MS", 50);
        Text(">.<", width / 2, height / 2 - 70, 1);
        
        
        textFont("Impact", 50);
        Text("נסה שוב", width / 2, height / 2 + 100, 1);
        
        Text("תפריט", width / 2, height / 2 + 200, 1);
        
        if(score > hiscore) {
            hiscore = score;
            setCookie("hiscore", hiscore, 365);
        }
        
        //
        
        
        //Reset
        //
        if(mouseIsPressed) {
            
            if(dist(mouseX, mouseY, width / 2, height / 2 + 100) < 100) {
                
                p.alive = true;
                p.x = 0;
                p.y = 0;
                p.vx = 0; p.vy = 0;
                p.ax = 0; p.ay = 0;
                p.angle = 0;
                score = 0;
                
                layers = [];
                for(var i = 0; i < 20; i++) {
                    layers.push(new Layer(height / 2 - i * 100, 300, 20, 1));
                }
                
            } else if(dist(mouseX, mouseY, width / 2, height / 2 + 200) < 100) {
                
                scenes[1] = false;
                scenes[0] = true;
                
                p.alive = true;
                p.x = 0;
                p.y = 0;
                p.vx = 0; p.vy = 0;
                p.ax = 0; p.ay = 0;
                p.angle = 0;
                score = 0;
                
                layers = [];
                for(var i = 0; i < 20; i++) {
                    layers.push(new Layer(height / 2 - i * 100, 300, 20, 1));
                }
                
                
            }
        }
        
        //
        
    }
};
//

//Background scene
//
var BG = function() {
    
    
    switchCol(0, 0, 4);
    rect(0, 0, width, height);
    
    for(var i = 0; i < layers.length; i++) {
        
        var l = layers[i];
        
        l.angle += l.dir * 0.1;
        
        if(l.y > height + 200) {
            l.y = -200;
            l.angle = random(360);
            l.dir *= -1;
        } else {
            l.y += 1;
        }
        
        push();
        translate(width / 2, l.y);
        rotate(radians(l.angle));
        
        
        switchCol(5, 4, 4);
        
        
        for(var p = 0; p < l.parts.length; p += 2) {
            arc(0, 0, l.r, l.r, l.parts[p], l.parts[p + 1]);
        }
        
        pop();
        
    }
    
};
//

//Menu scene
//
var MenuScene = function() {
    
    BG();
    
    if(mouseIsPressed) {
        
        if(dist(mouseX, mouseY, width / 2, height / 2) < 50) {
            
            scenes[0] = false;
            scenes[1] = true;
            
        } else if(dist(mouseX, mouseY, width / 2, height / 2 + 100) < 50) {
            
            scenes[0] = false;
            scenes[2] = true;
            
        } else if(dist(mouseX, mouseY, width / 2, height / 2 + 200) < 50) {
            
            scenes[0] = false;
            scenes[3] = true;
            
        }
        
        
    }
    
    
    switchCol(5, 4, 4);
    ellipse(width / 2, height / 2, 100, 100);
    
    ellipse(width / 2, height / 2 + 100, 100, 100);
    
    ellipse(width / 2, height / 2 + 200, 100, 100);
    
    textFont("Comic Sans MS", 80);
    Text("Helix\nJump", width / 2, height / 2 - 150, 1);
    
    textFont("Impact", 30);
    Text("שחק", width / 2, height / 2, 1);
    
    Text("לוח תוצאות", width / 2, height / 2 + 100, 1);
    
    Text("קרדיטים", width / 2, height / 2 + 200, 1);
    
    textFont("Impact", 20);
    Text("שיא: " + hiscore, width / 2, height - 50, 1);
    
    textFont("Impact", 100);
    Text(">", width / 2, height / 2, 1);
    Text("☰", width / 2, height / 2 + 100, 1);
    Text("ℹ", width / 2, height / 2 + 200, 1);
    
};
//

//Leaderboard scene
//
var Leaderboard = function() {
    
    BG();
    
    leaderboard.sort(sortArr);
    
    textFont("Comic Sans MS", 80);
    Text("לוח\nתוצאות", width / 2, height / 2 - 150, 1);
    
    var y = height / 2 - 50;
    var r = 10;
    
    
    for(var i = 0; i < leaderboard.length; i++) {
        
        if(y > height - 100) {
            break;
        }
        
        textFont("Impact", 15);
        Text(leaderboard[i][0] + " | " + leaderboard[i][1], width / 2, y, 1);
        
        y += r * 3;
        
        r += 10;
    }
    
    textFont("Impact", 50);
    Text("חזור", width / 2, height / 2 + 250, 1);
    
    if(mouseIsPressed) {
        
        if(dist(mouseX, mouseY, width / 2, height / 2 + 250) < 100) {
            scenes[2] = false;
            scenes[0] = true;
        }
        
    }
};
//

//Credits scene
//
var Credits = function() {
    
    BG();
    
    
    textFont("Comic Sans MS", 80);
    Text("קרדיטים", width / 2, height / 2 - 150, 1);
    
    textAlign(LEFT, CENTER);
    textFont("Impact", 30);
    Text("כל הקוד מאת\nArrowhead Co.\n\nמבוסס על\nHELIX JUMP מאת\nVoodoo", width / 2 - 160, height / 2 + 90, 1);
    textAlign(CENTER, CENTER);
    
    
    textFont("Impact", 50);
    Text("חזור", width / 2, height / 2 + 250, 1);
    
    if(mouseIsPressed) {
        
        if(dist(mouseX, mouseY, width / 2, height / 2 + 250) < 100) {
            scenes[3] = false;
            scenes[0] = true;
        }
        
    }
};
//

//
// ------------------------------------
// setup()
// ------------------------------------
//

function setup() {
    let cnv = createCanvas(400, 600);
    cnv.parent("gameContainer");
    smooth();
    noStroke();
    
    // טעינת הניקוד הגבוה מהעוגייה
    let savedHiscore = getCookie("hiscore");
    if (savedHiscore !== "") {
        hiscore = parseInt(savedHiscore);
    }
    
    for(var i = 0; i < 20; i++) {
        layers.push(new Layer(height / 2 - i * 100, 300, 20, 1));
    }
};

//
// ------------------------------------
// draw()
// ------------------------------------
//

function draw() {
    background(255);
    
    if(scenes[1]) {
        PlayScene();
    } else {
        BG();
    }
    
    if(scenes[0]) {
        MenuScene();
    }
    if(scenes[2]) {
        Leaderboard();
    }
    if(scenes[3]) {
        Credits();
    }
    
    if(getThumb === "saycheese;]") {
        Cur_Pal = 17;
        
        thumbnail = get(0, 0, width, height);
        
        fill(255);
        rect(0, 0, width, height);
        image(thumbnail, width * width / height / 4, 0, width * width / height, height);
    }
};
