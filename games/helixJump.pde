// פונקציות גלובליות לעוגיות
// שמירת עוגייה
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// קריאת עוגייה
function getCookie(cname) {
  const name = cname + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}



// קובץ JavaScript מבוסס Processing
var main = function() {
//תמונה ממוזערת
//{
var thumbnail, getThumb = "";
//}

//טבלת מובילים
//{
var leaderboard = [
    ["טל", 13649],
    ["איתי", 2324],
    ["פינגווין מלך 🐧", 4401],
    ["דובי רוקד", 5599],
    ["שירלי", 1200],
    ["נועם", 74655],
    ["דן", 46587],
    ["זכריה", 20134],
    ["כריסטיאן", 2326],
    ["מטייל כוכבים", 5039],
    ["הבזק", 2267],
    ["ברקו", 3789],
    ["ליאור", 7160],
    ["אור", 5128],
    ["דוד", 3821],
    ["מקס", 3338],
    ["יוסי", 11169],
    ["מני", 13124],
    ["אלון", 61723],
    ["שחר", 4898],
    ["רפאל", 5395],
    ["יוסי", 108821],
    ["פריזמה", 4456],
    ["אבי", 11904],
    ["אורי", 27777],
    ["כפיר", 15028],
    ["מריה", 23588],
    ["אלה", 13232],
    ["גיל", 46588],
    ["עומר", 1929],
    ["האקר", 2145],
    ["שיר", 1827],
    ["יונתן", 6197],
    ["נלי", 2072],
    ["בר", 29080],
    ["אלי", 5718],
    ["עקיבא", 65583],
    ["ירון", 61456],
    ["יניב", 17115],
    ["רועי", 72190],
    ["דן", 6694],
    ["מחשב?", 125670],
    ["סלמנדרה מטורפת", 65576],
    ["ניקי", 33740],
    ["ברק", 65386],
    ["המתכנת #1", 88321],
    ["יואב", 62055],
    ["אדם", 43236],
    ["אור", 9325],
    ["מנחם", 5559],
    ["רוברט", 19898],
    ["אייל", 7824],
    ["אנג'ל", 40198],
    ["אלפרדו", 1544],
    ["דב", 6113],
    ["אורי", 559],
    ["אנדרו", 3611],
    ["החתיך", 6552],
    ["מיסאבו", 14925],
    ["ב.קרוז", 4880],
    ["ירין", 14891],
    ["אייל", 5000],
    ["עידן", 4276],
    ["אלמוג", 20937],
    ["נוח", 7785],
    ["אלירן", 4222],
    ["י.רמירז", 1653],
    ["אבי", 1578],
    ["נועה", 8173],
    ["שרון", 3157],
    ["איתן", 4699],
    ["דניאל", 7383],
    ["הנרי", 7649],
    ["ג'לי", 15934],
    ["קודי", 30567],
    ["שמשון", 80921],
    ["הבזק", 13198],
    ["יוסי", 1772],
    ["דקל", 2118],
    ["דניאל", 2377],
    ["אור בחושך", 4114],
    ["ק.ג.", 1712],
    ["ארן", 5130],
    ["איתמר", 5916],
    ["בן", 8577],
    ["ידידיה", 125890],
    ["אני", 5054],
    ["אמילי", 7038],
    ["קיקי", 1438],
    ["~מתכנת~", 1355],
    ["זכרי", 40751],
    ["אולפן וולף", 4867],
    ["ה.מ.", 9685],
    ["יריב", 5008],
    ["אליהו", 3998],
    ["גל", 1756],
    ["הריסון", 9127],
    ["הוטרוד", 14567],
    ["בחור אקראי", 91094],
    ["יוסף", 71234],
    ["מוצא", 10919],
    ["שי", 6407],
    ["רועי", 2268],
    ["אוהד", 2515],
    ["בני", 13735],
    ["מלך החרבות", 9168],
    ["אלכסנדר", 17030],
    ["גלית", 196],
    ["רבקה", 1243],
    ["ישראל", 11532],
    ["מר.מתכנת", 4851],
    ["כוכב סתיו", 929],
    ["אורן", 2113],
    ["מלך המתכנתים", 114898],
    ["👑👑👑עידן סנצז👑👑", 11657],
    ["הנרי", 5238],
    ["מר. לימונס", 2951],
    ["ברווז דינו", 10679],
    ["בנימין", 109724],
    ["צביקה", 1342],
    ["❄קרחון❄", 4187],
    ["חדירה", 4340]
];
var sortArr = function(arr, ind){
    for(var i = 0; i < arr.length - 1; i++){
        for(var j = i + 1; j < arr.length; j++){
            if(arr[j][ind] >= arr[i][ind]){
                var temp = arr[j];
                arr[j] = arr[i];
                arr[i] = temp;
                if(arr[j][0] === arr[i][0]){
                    arr.splice(i, 1);
                }
            }
        }
    }
};
sortArr(leaderboard, 1);
//}

//תצורה ראשונית
//{
var verify = 0;
//}

//פונטים
//{
var fonts = [createFont("calibri Bold"), createFont("arial black Bold Italic"), createFont("arial black Bold")];
//}

//תמונה לעמוד
//{
background(255);
background(0);

fill(255);
ellipse(125 / 2, 55, 125, 110);

var Ellipse = get(0, 0, 125, 110);

background(255);

fill(0, 7.5);
for(var i = 0; i < 9; i++){
    rect(0, 0, i * 2, 110);
}

var ShadeEllipse = get(0, 0, 125, 110);
//ShadeEllipse.mask(Ellipse);
//}

//צבעים
//{
//ערכות צבעים
var palettes = [
    //עמוד מרכזי, צבע פלטפורמה, רקע, כדור, לבה     
    [color(255, 255, 255), color(249, 241, 219), color(252, 213, 129), color(213, 41, 65), color(153, 13, 53)],
    [color(248, 244, 227), color(255, 137, 102), color(42, 43, 42), color(112, 108, 157), color(229, 68, 109)],
    [color(255, 228, 250), color(225, 218, 189), color(71, 99, 152), color(141, 200, 178), color(255, 196, 35)],
    [color(249, 234, 225), color(19, 190, 156), color(170, 153, 143), color(204, 139, 134), color(125, 79, 80)],
    [color(228, 214, 167), color(200, 130, 196), color(28, 17, 10), color(80, 162, 167), color(155, 41, 21)],
    [color(165, 196, 212), color(123, 109, 141), color(73, 59, 42), color(132, 153, 177), color(89, 63, 98)],
    [color(255, 238, 242), color(255, 200, 251), color(89, 87, 88), color(185, 188, 223), color(255, 146, 194)],
    [color(255, 253, 253), color(240, 225, 0), color(11, 60, 73), color(183, 190, 188), color(125, 35, 109)],
    [color(203, 121, 58), color(154, 3, 30), color(50, 19, 37), color(95, 15, 64), color(252, 220, 77)],
    [color(178, 221, 247), color(76, 181, 174), color(100, 180, 200), color(202, 186, 200), color(255, 32, 62)],
    [color(178, 221, 247), color(48, 107, 172), color(20, 27, 65), color(11, 156, 235), color(145, 142, 244)],
    [color(232, 233, 243), color(177, 229, 242), color(39, 38, 53), color(166, 166, 168), color(200, 200, 200)],
    [color(247, 255, 221), color(219, 161, 89), color(232, 233, 155), color(239, 200, 128), color(208, 227, 204)],
    [color(0, 117, 196), color(214, 81, 8), color(239, 160, 11), color(239, 160, 11), color(89, 31, 10)],
    [color(240, 231, 216), color(166, 58, 80), color(177, 155, 150), color(186, 110, 110), color(201, 223, 74)],
    [color(246, 216, 174), color(244, 211, 94), color(46, 64, 87), color(8, 61, 119), color(218, 65, 103)],
    [color(241, 242, 235), color(86, 98, 70), color(74, 74, 72), color(164, 194, 165), color(216, 218, 211)],
    [color(255, 194, 226), color(110, 68, 255), color(184, 146, 255), color(255, 144, 179), color(239, 122, 133)],
    [color(228, 223, 218), color(115, 29, 216), color(193, 102, 107), color(72, 169, 166), color(212, 180, 131)],
    [color(239, 214, 172), color(67, 37, 52), color(40, 61, 101), color(54, 88, 85), color(196, 73, 0)],
    [color(145, 245, 173), color(116, 82, 150), color(99, 42, 80), color(139, 158, 183), color(194, 232, 18)],
    [color(212, 228, 188), color(150, 172, 183), color(72, 35, 60), color(54, 85, 143), color(64, 55, 110)],
    [color(161, 204, 165), color(65, 93, 67), color(17, 29, 19), color(112, 151, 117), color(143, 155, 190)],
    [color(213, 230, 141), color(107, 5, 4), color(36, 16, 35), color(163, 50, 11), color(71, 160, 37)],
    [color(251, 251, 249), color(166, 52, 70), color(0, 0, 4), color(126, 25, 70), color(12, 98, 145)],
];
var Cur_Pal = 1;
//צבעי רכיבים ספציפיים
var central = color(255), platform = color(255), bg = color(255), ball = color(255), lava = color(255);
//מעדכן את ערכת הצבעים
var switchCol = function(col1, col2){
    var r = red(col1), g = green(col1), b = blue(col1);
    
    r -= (r - red(col2)) / 10;
    g -= (g - green(col2)) / 10;
    b -= (b - blue(col2)) / 10;
    
    var newCol = color(r, g, b);
    return(newCol);
};
var updatePalette = function(index){
    if(index === undefined){
        index = Cur_Pal % (palettes.length - 1);
    }
    
    central = switchCol(central, palettes[index][0]);
    platform = switchCol(platform, palettes[index][1]);
    bg = switchCol(bg, palettes[index][2]);
    ball = switchCol(ball, palettes[index][3]);
    lava = switchCol(lava, palettes[index][4]);
};
for(var i = 0; i < 25; i++){
    updatePalette();
}
//}

//מערכים
//{
//הדפים השונים
var scenes = [true, false, false, false];
//משמש למקשי החיצים
var keys = [];
//מערך המכיל את כל השכבות
var layers = [];
//מציג נקודות שהושגו
var ptsEarned = [];
//לתפריט
var titles = [["אינסופי", 0], ["שחק", 0], ["טבלת מובילים", 0], ["קרדיטים", 0]];
//}

//אובייקט שחקן
//{
var p = {
    begin : false,
    mode : "play",
    score : 0, hiscore : 0,
    
    y : 215,
    prevLev : 0, level : 0,
    current : 0, goal : 15,
    jump : -9, maxJump : 9,
    Level : 1, gameOver : false,
    splatter : [],
    display : function(){
        pushMatrix();
        translate(width / 2, this.y);
        scale(1 + sin(this.bounce & 180) / 5, 1 - sin(this.bounce % 180) / 5);
        
        if(this.level - this.prevLev > 2){
            fill(255, 100, 50);
            ellipse(0, 0, 40, 40);
            
            for(var i = 0; i < 5; i++){
                for(var j = 0; j < 2; j++){
                    stroke(255, 100 * j, 50 * j, 180);
                    strokeWeight(30 - i * 6);
                    var randy = random(-3, 3) * i;
                    line(randy, i * -15, randy, i * -15 - 10);
                }
            }
        }
        
        noStroke();
        if(this.level - this.prevLev > 2){
            fill(lerpColor(this.fill, color(255, 50, 0), 0.6));
        } else {
            fill(this.fill);
        }
        ellipse(0, 0, 30, 30);
        
        fill(255, 7.5);
        for(var i = 0; i < 10; i++){
            ellipse(2 + i / 2, -2 - i / 2, 20 - i / 2, 20 - i / 2);
        }
        
        popMatrix();
        
        for(var i = 0; i < this.splatter.length; i++){
            fill(this.fill);
            ellipse(this.splatter[i][0], this.splatter[i][1], this.splatter[i][4], this.splatter[i][4]);
            stroke(255, 50);
            strokeWeight(this.splatter[i][4] / 3);
            noFill();
            arc(this.splatter[i][0], this.splatter[i][1], this.splatter[i][4] / 3, this.splatter[i][4] / 3, 270, 360);
            noStroke();
            
            this.splatter[i][0] += this.splatter[i][2];
            this.splatter[i][1] += this.splatter[i][3];
            this.splatter[i][3] += 0.25;
            
            if(this.splatter[i][0] < 0 || this.splatter[i][0] > width || this.splatter[i][1] < 0 || this.splatter[i][1] > height){
                this.splatter.splice(i, 1);
            }
        }
        
        if(!p.begin){
            fill(0, 150);
            rect(0, 100, width, 400);
            fill(255);
            textFont(fonts[0], 36);
            text("מקשי חצים\nאו החלקה\nכדי לזוז.\n\nהימנע מאיזורים\nצבעוניים\nבפלטפורמות.", width / 2, height / 2 - 30);
            fill(255, 200, 50);
            text("> אישור <", width / 2, height / 2 + 150);
            
            if(mouseY > height / 2 + 130 && mouseY < height / 2 + 170){
                this.point = true;
                if(mouseIsPressed && verify === 0){
                    this.begin = true;
                    verify = 1;
                }
            } else {
                this.point = false;
            }
        }
    },
    
    //
    bounce : 0,
    speed : 0,
    fill : color(255, 255, 255),
    
    //
    fall : function(){
        this.y += this.speed;
        this.speed += 0.25;
        
        if(this.speed >= 10){
            this.speed = 10;
        }
    },
    
    //
    collide : function(index, a, b){
        var platform;
        for(var i = layers.length - 1; i >= 0; i--){
            platform = layers[i].platform[0];
            
            if(platform.y < this.y - 12.5 || platform.y > this.y + 12.5){
                continue;
            }
            
            if(dist(width / 2, this.y, width / 2, platform.y) < 12.5 + platform.height / 2 && dist(width / 2, this.y, width / 2, platform.y) > 12.5 - platform.height / 2){
                //
                if(layers[i].safe === true){
                    if(dist(width / 2, this.y, width / 2, layers[i].platform[0].y) <= (layers[i].platform[0].height / 2) + 12.5 && this.speed > 0){
                        //
                        if(this.y + this.speed > layers[i].platform[0].y){
                            this.speed = this.jump;
                            this.bounce = 0;
                            
                            //
                            layers[i].hit = true;
                            
                            if(this.prevLev !== this.level){
                                this.prevLev = this.level;
                                this.level++;
                            }
                            
                            //
                            if(this.score < hiscore){
                                this.score = hiscore;
                            }
                        }
                    }
                }
            }
        }
        this.bounce++;
    },
    
    //
    death : function(){
        if(this.y > height){
            this.gameOver = true;
        }
    },
};
//}

//Layers object
//{
var layer = function(y, safe){
    this.y = y;
    this.platform = [];
    this.platform.push({
        x : width / 2, y : this.y,
        width : 250, height : 20,
    });
    
    this.rot = 0;
    this.safe = safe;
    this.hit = false;
    this.opacity = 255;
    
    this.display = function(){
        pushMatrix();
        translate(this.platform[0].x, this.platform[0].y);
        this.rot += 1;
        rotate(this.rot);
        
        //
        if(this.hit && this.opacity > 0){
            this.opacity -= 5;
        }
        
        //
        if(this.opacity <= 0){
            layers.splice(layers.indexOf(this), 1);
        }
        
        noStroke();
        fill(platform);
        
        for(var i = 0; i < 11; i++){
            //
            if(i !== 5 && this.safe && i !== 6){
                if(i !== 0){
                    if(this.platform[0].width - (i * 20) <= 0){
                        break;
                    }
                }
                
                pushMatrix();
                rotate(360 / 11 * i);
                rect(-this.platform[0].width / 2 + 10, -this.platform[0].height / 2, this.platform[0].width / 2.2 - 20, this.platform[0].height);
                popMatrix();
            }
        }
        
        //
        for(var i = 0; i < 2; i++){
            if(this.safe === false){
                for(var j = 0; j < 5; j++){
                    pushMatrix();
                    
                    if(i === 0){
                        rotate(360 / 11 * (j * 2 + 0.1));
                    } else {
                        rotate(-360 / 11 * (j * 2 + 0.1));
                    }
                    
                    fill(lava);
                    rect(-this.platform[0].width / 2 + 10, -this.platform[0].height / 2, this.platform[0].width / 2.2 - 20, this.platform[0].height);
                    popMatrix();
                }
            }
        }
        
        popMatrix();
    };
};
//}

//Points object
//{
var pts = function(x, y, s, life){
    this.x = x;
    this.y = y;
    this.s = s;
    this.life = life;
    this.text = s;
    
    this.display = function(){
        noStroke();
        fill(255, 255, 255, this.life);
        
        this.y -= 1;
        this.life -= 2.5;
        this.s += 0.5;
        
        textFont(fonts[0], this.s);
        text("+" + this.text, this.x, this.y);
    };
};
//}

//Scenes
//{
//Background
var BG = function(){
    updatePalette();
    background(bg);
    
    fill(central);
    rect(width / 2 - 20, 0, 40, height);
    
    fill(100, 150);
    rect(0, 0, width, height);
    
    noStroke();
    
    //
    for(var i = 0; i < 20; i++){
        fill(100, 150);
        
        ellipse(width / 2 - 25, 55 + 55 * i, 50, 50);
        ellipse(width / 2 + 25, 55 + 55 * i, 50, 50);
        
        //
        fill(255, 150);
        ellipse(width / 2 - 20, 55 + 55 * i, 40, 40);
        ellipse(width / 2 + 20, 55 + 55 * i, 40, 40);
    }
};

//Menu
var MenuScene = function(){
    BG();
    
    //
    fill(255, 100);
    for(var i = 0; i < titles.length; i++){
        rect(width / 2 - 150, height / 2 + 150 / 4 * i - 130, 300, 60, 5);
        
        //
        titles[i][1] = 0;
        if(mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height / 2 + 150 / 4 * i - 130 && mouseY < height / 2 + 150 / 4 * i - 70){
            titles[i][1] = 1;
        }
    }
    
    //
    for(var i = 0; i < titles.length; i++){
        textFont(fonts[0], 36);
        fill(255, 150 - 50 * titles[i][1]);
        text(titles[i][0], width / 2, height / 2 + 150 / 4 * i - 100);
    }
    
    if(mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height / 2 - 130 && mouseY < height / 2 - 70 && mouseIsPressed){
        scenes[0] = false;
        scenes[1] = true;
    }
    
    if(mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height / 2 - 92.5 && mouseY < height / 2 - 32.5 && mouseIsPressed){
        scenes[0] = false;
        scenes[1] = true;
    }
    
    if(mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height / 2 - 55 && mouseY < height / 2 + 5 && mouseIsPressed){
        scenes[0] = false;
        scenes[2] = true;
    }
    
    if(mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height / 2 - 17.5 && mouseY < height / 2 + 42.5 && mouseIsPressed){
        scenes[0] = false;
        scenes[3] = true;
    }
    
    //
    textFont(fonts[1], 80);
    text("קפיצת סליל", width / 2, height / 2 - 150, color(50, 150, 250));
    
    //
    textFont(fonts[0], 36);
    fill(255);
    text("ציון גבוה: " + hiscore, width / 2, height / 2 + 200);
};

//Gameplay
var PlayScene = function(){
    updatePalette();
    background(bg);
    
    //
    var prevHiscore = hiscore;
    p.hiscore = hiscore;
    
    if(p.score > p.hiscore){
        p.hiscore = p.score;
        hiscore = p.score;
    }
    
    if(prevHiscore !== hiscore){
      setCookie("hiscore", hiscore + "", 365);
    }

    if(p.score < hiscore){
        p.score = hiscore;
    }
    
    //
    fill(central);
    rect(width / 2 - 20, 0, 40, height);
    
    //
    for(var i = 0; i < layers.length; i++){
        layers[i].platform[0].y += p.speed * -1;
    }
    
    //
    if(layers[layers.length - 1].platform[0].y > 100){
        //
        var safe = true;
        if(random(0, 1) < 0.25){
            safe = false;
        }
        
        layers.push(new layer(layers[layers.length - 1].platform[0].y - 50, safe));
    }
    
    //
    for(var i = 0; i < layers.length; i++){
        if(layers[i].platform[0].y > height){
            layers.splice(i, 1);
        }
    }
    
    //
    for(var i = 0; i < layers.length; i++){
        layers[i].display();
    }
    
    //
    p.fall();
    p.death();
    p.collide();
    p.display();
    
    //
    fill(central);
    rect(width / 2 - 20, 0, 40, height);
    fill(bg);
    rect(width / 2 - 15, 0, 30, height);
    
    //
    if(p.gameOver){
        fill(255, 100);
        rect(0, 0, width, height);
        
        fill(255, 255, 255, 255);
        textFont(fonts[0], 50);
        text("המשחק נגמר", width / 2, height / 2 - 100);
        
        textFont(fonts[0], 25);
        text("הציון שלך: " + p.score, width / 2, height / 2);
        
        textFont(fonts[0], 25);
        text("ציון גבוה: " + hiscore, width / 2, height / 2 + 50);
        
        fill(255, 200, 50);
        textFont(fonts[0], 36);
        text("שחק שוב", width / 2, height / 2 + 150);
        
        if(mouseY > height / 2 + 130 && mouseY < height / 2 + 170 && mouseIsPressed){
            scenes[1] = false;
            scenes[0] = true;
            
            p.gameOver = false;
            p.score = 0;
            p.y = 215;
            p.speed = 0;
            p.prevLev = 0;
            p.level = 0;
            p.current = 0;
            p.goal = 15;
            p.jump = -9;
            p.maxJump = 9;
            p.Level = 1;
            p.splatter = [];
            
            layers = [];
            layers.push(new layer(height - 100, true));
            layers.push(new layer(height / 2, true));
            layers.push(new layer(height / 2 - 50, true));
            layers.push(new layer(height / 2 - 100, true));
        }
    }
    
    //
    fill(255);
    textFont(fonts[0], 36);
    text("ציון: " + p.score, width / 2, 50);
    text("ציון גבוה: " + hiscore, width / 2, 90);
    
    //
    p.score++;
    
    //
    for(var i = 0; i < ptsEarned.length; i++){
        ptsEarned[i].display();
        
        if(ptsEarned[i].life <= 0){
            ptsEarned.splice(i, 1);
        }
    }
};

//Leaderboard
var Leaderboard = function(){
    BG();
    
    //
    textFont(fonts[0], 36);
    fill(255);
    text("טבלת מובילים", width / 2, 50);
    
    //
    for(var i = 0; i < 15; i++){
        textFont(fonts[0], 20);
        text(i + 1 + ". " + leaderboard[i][0], width / 2 - 100, 100 + i * 30);
        text(leaderboard[i][1], width / 2 + 100, 100 + i * 30);
    }
    
    //
    fill(255, 200, 50);
    textFont(fonts[0], 36);
    text("חזרה", width / 2, height - 50);
    
    if(mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height - 70 && mouseY < height - 30 && mouseIsPressed){
        scenes[2] = false;
        scenes[0] = true;
    }
};

//Credits
var Credits = function(){
    BG();
    
    //
    fill(255);
    textFont(fonts[0], 30);
    text("המשחק מבוסס על\nהמשחק Helix Jump", width / 2, height / 2 - 150);
    
    //
    fill(255, 200, 50);
    textFont(fonts[0], 36);
    text("חזרה", width / 2, height - 50);
    
    if(mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height - 70 && mouseY < height - 30 && mouseIsPressed){
        scenes[3] = false;
        scenes[0] = true;
    }
};
//}

//Setup function
void setup() {
    size(400, 600);
    smooth();
    noStroke();
    
    // טען את שיא הניקוד מהעוגייה (אם קיים)
    let saved = getCookie("hiscore");
    if (saved !== "") {
      p.hiscore = parseInt(saved);
    }
    hiscore = p.hiscore;

    textAlign(CENTER, CENTER);
    
    layers.push(new layer(height - 100, true));
    layers.push(new layer(height / 2, true));
    layers.push(new layer(height / 2 - 50, true));
    layers.push(new layer(height / 2 - 100, true));
}

//Draw function
void draw() {
    background(255);
    
    if(scenes[1]){
        PlayScene();
    } else {
        BG();
    }
    
    if(scenes[0]){
        MenuScene();
    }
    if(scenes[2]){
        Leaderboard();
    }
    if(scenes[3]){
        Credits();
    }
    
    if(getThumb === "saycheese;]"){
        Cur_Pal = 17;
        
        thumbnail = get(0, 0, width, height);
        
        fill(255);
        rect(0, 0, width, height);
        image(thumbnail, width * width / height / 4, 0, width * width / height, height);
    }
    
    // שמור את hiscore בעוגייה ל־365 ימים
    setCookie("hiscore", hiscore + "", 365);
};
}();

