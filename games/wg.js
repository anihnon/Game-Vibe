/** @CONGRATS   
        {+} I JUST WANNA SAY IM REALLY PROUD... 
            THIS GOT 1400 VOTES IN TWO WEEKS AND 1.2K IN 7 DAYS!!!
            CAN YOU BELIEVE THAT?
        {+} JUST HIT 1.7K THIS OCTOBER, 2019! FOR A THOUSAND LINES 
            OF CODE, THAT'S NOT BAD!
    
    @REMINDER
        
        {+} נ.ב. אם הטקסטים נראים לא במקומם, טען מחדש את העמוד :)
        {+} כדי להכנס לטבלת הדירוג, פרסם את הניקוד שלך ב-T&T
    
    @CREDITS
    
        {+} תודה ל-Eclipse OS, T1PP, Apollo, ולכל העוקבים שבדקו את המשחק שלי
        {+} כל הקוד נכתב על ידי Arrowhead Co. ומבוסס על המשחק Helix Jump של Voodoo
    
    @INFO
    
        {+} המשחק האחד-עשר שלי
        
        {+} התחלה: 09 / 05 / 2019
        {+} סיום: 11 / 05 / 2019
        {+} יציאה לאור: 13 / 05 / 2019
**/


/***************************************************************************************/



/***************************************************************************************/

var main = function() {

    //
    // ------------------------------------
    // משתנים גלובליים, מחלקות, קבועים
    // ------------------------------------
    //

    //Thumbnail
    //
    var thumbnail, getThumb = "";
    //
    
    //Leaderboard
    //
    var leaderboard = [
        ["Ethan Botha", 999999999],
        ["Voodoo", 999999999],
        ["Me", 999999999],
        ["Ethan Botha", 999999999],
        ["Aaron", 999999999],
        ["Eclipse OS", 999999999],
        ["Jett", 999999999],
        ["T1PP", 999999999],
        ["Apollo", 999999999],
        ["Eminem", 999999999],
        ["Pikachu", 999999999],
        ["Spongebob", 999999999],
        ["Patrick Star", 999999999],
        ["Squidward", 999999999],
        ["Mr Krabs", 999999999],
        ["Plankton", 999999999],
        ["Sandy", 999999999],
        ["Doodlebob", 999999999],
        ["My Leg", 999999999],
        ["Squilliam", 999999999],
        ["Kevin", 999999999],
        ["Pearl", 999999999],
        ["Mrs Puff", 999999999],
        ["Old Man Jenkins", 999999999],
        ["Fred", 999999999],
        ["Bubble Bass", 999999999],
        ["The Hash Slinging Slasher", 999999999],
        ["Flying Dutchman", 999999999],
        ["King Neptune", 999999999],
        ["Man Ray", 999999999],
        ["Barnacle Boy", 999999999],
        ["Mermaid Man", 999999999]
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
        alive : true
    };
    
    //Levels
    //
    var palettes = [
        [//PURPLE
            color(50, 150, 250), //BG
            color(255), //Text
            color(0), //Player
            color(255, 0, 0), //Danger
            color(255), //Normal
            color(100), //Shadows
        ],
        [//NEON
            color(10, 250, 250),
            color(255),
            color(20, 20, 20),
            color(250, 250, 10),
            color(250, 10, 250),
            color(200, 200, 200),
        ],
        [//HELL
            color(255, 0, 0),
            color(0),
            color(20, 20, 20),
            color(10, 250, 250),
            color(250, 250, 10),
            color(255, 150, 150),
        ],
        [//FROSTY
            color(100, 100, 255),
            color(255),
            color(20, 20, 20),
            color(255, 0, 0),
            color(255),
            color(200, 200, 200),
        ],
        [//DARK
            color(50, 50, 50),
            color(255),
            color(255),
            color(255, 0, 0),
            color(100),
            color(0),
        ],
        [//BEACH
            color(250, 250, 100),
            color(50, 50, 50),
            color(250, 150, 0),
            color(255, 0, 0),
            color(250, 250, 200),
            color(200, 200, 200),
        ],
        [//SPACE
            color(10, 10, 50),
            color(255),
            color(250, 250, 10),
            color(255, 0, 0),
            color(100),
            color(0),
        ],
        [//JUNGLE
            color(0, 100, 0),
            color(255),
            color(20, 20, 20),
            color(255, 0, 0),
            color(255),
            color(0, 50, 0),
        ],
        [//GREEN
            color(100, 250, 100),
            color(255),
            color(0),
            color(255, 0, 0),
            color(255),
            color(100, 200, 100),
        ],
        [//DARKGREEN
            color(0, 50, 0),
            color(255),
            color(0),
            color(255, 0, 0),
            color(100),
            color(0, 25, 0),
        ],
        [//ORANGE
            color(250, 150, 100),
            color(255),
            color(0),
            color(255, 0, 0),
            color(255),
            color(250, 100, 0),
        ],
        [//WHITE
            color(255),
            color(0),
            color(0),
            color(255, 0, 0),
            color(255),
            color(200),
        ],
        [//BROWN
            color(100, 50, 0),
            color(255),
            color(0),
            color(255, 0, 0),
            color(255),
            color(50, 25, 0),
        ],
        [//RED
            color(250, 50, 50),
            color(255),
            color(0),
            color(0, 255, 0),
            color(255),
            color(200, 0, 0),
        ],
        [//BLACK
            color(0, 0, 0),
            color(255),
            color(255),
            color(0, 255, 0),
            color(100),
            color(0),
        ],
        [//PINK
            color(250, 150, 250),
            color(255),
            color(0),
            color(255, 0, 0),
            color(255),
            color(200, 100, 200),
        ],
        [//CYAN
            color(50, 250, 250),
            color(255),
            color(0),
            color(255, 0, 0),
            color(255),
            color(0, 200, 200),
        ],
        [//GRAY
            color(150),
            color(255),
            color(0),
            color(255, 0, 0),
            color(255),
            color(100),
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
        stroke(palettes[Cur_Pal][a]);
        fill(palettes[Cur_Pal][b]);
        tint(palettes[Cur_Pal][c]);
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
        fill(c);
        text(t, x, y);
    };
    //
    
    //Render layers
    //
    var renderLayers = function() {
        
        for(var i = layers.length - 1; i >= 0; i--) {
            var l = layers[i];
            
            pushMatrix();
            translate(width / 2, l.y);
            rotate(radians(l.angle));
            
            for(var p = 0; p < l.parts.length; p += 2) {
                
                if(l.parts[p + 1] === l.parts[p] + l.width) {
                    
                    
                    switchCol(5, 3, 255);
                    arc(0, 0, l.r, l.r, l.parts[p], l.parts[p + 1]);
                    
                } else {
                    
                    switchCol(5, 4, 255);
                    arc(0, 0, l.r, l.r, l.parts[p], l.parts[p + 1]);
                }
            }
            popMatrix();
        }
    };
    //
    
    //Render player
    //
    var renderPlayer = function() {
        
        
        pushMatrix();
        translate(width / 2 + p.x, p.y);
        rotate(radians(p.angle));
        
        
        switchCol(2, 2, 255);
        ellipse(0, 0, p.r, p.r);
        
        popMatrix();
        
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
            
            Text("שיא: " + hiscore, width / 2, 40, palettes[Cur_Pal][1]);
            Text("ניקוד: " + score, width / 2, 70, palettes[Cur_Pal][1]);
            
            //
            
            
        } else {
            
            //Game over
            //
            fill(palettes[Cur_Pal][1]);
            
            textFont(fonts[2], 80);
            Text("המשחק נגמר", width / 2, height / 2 - 150, palettes[Cur_Pal][1]);
            
            textFont(fonts[2], 50);
            Text(">.<", width / 2, height / 2 - 70, palettes[Cur_Pal][1]);
            
            
            textFont(fonts[0], 50);
            Text("נסה שוב", width / 2, height / 2 + 100, palettes[Cur_Pal][1]);
            
            Text("תפריט", width / 2, height / 2 + 200, palettes[Cur_Pal][1]);
            
            if(score > hiscore) {
                hiscore = score;
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
        
        
        switchCol(0, 0, 255);
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
            
            pushMatrix();
            translate(width / 2, l.y);
            rotate(radians(l.angle));
            
            
            switchCol(5, 4, 255);
            
            
            for(var p = 0; p < l.parts.length; p += 2) {
                arc(0, 0, l.r, l.r, l.parts[p], l.parts[p + 1]);
            }
            
            popMatrix();
            
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
        
        
        switchCol(5, 4, 255);
        ellipse(width / 2, height / 2, 100, 100);
        
        ellipse(width / 2, height / 2 + 100, 100, 100);
        
        ellipse(width / 2, height / 2 + 200, 100, 100);
        
        textFont(fonts[2], 80);
        Text("Helix\nJump", width / 2, height / 2 - 150, palettes[Cur_Pal][1]);
        
        textFont(fonts[0], 30);
        Text("שחק", width / 2, height / 2, palettes[Cur_Pal][1]);
        
        Text("לוח תוצאות", width / 2, height / 2 + 100, palettes[Cur_Pal][1]);
        
        Text("קרדיטים", width / 2, height / 2 + 200, palettes[Cur_Pal][1]);
        
        textFont(fonts[0], 20);
        Text("שיא: " + hiscore, width / 2, height - 50, palettes[Cur_Pal][1]);
        
        textFont(fonts[0], 100);
        Text(">", width / 2, height / 2, palettes[Cur_Pal][1]);
        Text("☰", width / 2, height / 2 + 100, palettes[Cur_Pal][1]);
        Text("ℹ", width / 2, height / 2 + 200, palettes[Cur_Pal][1]);
        
    };
    //
    
    //Leaderboard scene
    //
    var Leaderboard = function() {
        
        BG();
        
        leaderboard.sort(sortArr);
        
        textFont(fonts[2], 80);
        Text("לוח\nתוצאות", width / 2, height / 2 - 150, palettes[Cur_Pal][1]);
        
        var y = height / 2 - 50;
        var r = 10;
        
        
        for(var i = 0; i < leaderboard.length; i++) {
            
            if(y > height - 100) {
                break;
            }
            
            textFont(fonts[0], 15);
            Text(leaderboard[i][0] + " | " + leaderboard[i][1], width / 2, y, palettes[Cur_Pal][1]);
            
            y += r * 3;
            
            r += 10;
        }
        
        textFont(fonts[0], 50);
        Text("חזור", width / 2, height / 2 + 250, palettes[Cur_Pal][1]);
        
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
        
        
        textFont(fonts[2], 80);
        Text("קרדיטים", width / 2, height / 2 - 150, palettes[Cur_Pal][1]);
        
        textAlign(LEFT, CENTER);
        textFont(fonts[0], 30);
        Text("כל הקוד מאת\nArrowhead Co.\n\nמבוסס על\nHELIX JUMP מאת\nVoodoo", width / 2 - 160, height / 2 + 90, palettes[Cur_Pal][1]);
        textAlign(CENTER, CENTER);
        
        
        textFont(fonts[0], 50);
        Text("חזור", width / 2, height / 2 + 250, palettes[Cur_Pal][1]);
        
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

    setup = function() {
        size(400, 600);
        smooth();
        noStroke();
        textFont(createFont("Arial", 12));
        
        fonts[0] = createFont("Impact");
        fonts[1] = createFont("Helvetica");
        fonts[2] = createFont("Comic Sans MS");
        
        for(var i = 0; i < 20; i++) {
            layers.push(new Layer(height / 2 - i * 100, 300, 20, 1));
        }
        
    };

    //
    // ------------------------------------
    // draw()
    // ------------------------------------
    //

    draw = function() {
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
};
//
// ------------------------------------
// הפעלת הקוד
// ------------------------------------
//
main();
//
