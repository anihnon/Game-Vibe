// game-script.js - כל לוגיקת המשחק עבור Tower Drop בעברית, עם שמירת נתונים ב-Firebase Firestore
// הקוד עודכן כדי לכלול את כל התכונות מהקוד המקורי שהועלה.

// =================================================================
// קובץ זה נועד לעבוד עם קובץ HTML המכיל
// קנבס עם ה-ID 'gameCanvas'.
//
// כדי שהסאונד יעבוד, אנא ודא שה-HTML שלך כולל את השורה הבאה:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
// =================================================================

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables from the canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase and Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let userId = null;
let isAuthReady = false;

// Authenticate the user
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
    } else {
        userId = crypto.randomUUID(); // Fallback for unauthenticated users
    }
    isAuthReady = true;
    console.log("Authentication state changed. userId:", userId);
    // Once authenticated, load the leaderboard and populate dummy data if needed
    loadLeaderboardFromFirestore();
    populateDummyScores();
});

// פונקציה ליצירת משתמשים פיקטיביים ב-Firestore (אם הלוח ריק)
async function populateDummyScores() {
    if (!isAuthReady) {
        setTimeout(populateDummyScores, 100);
        return;
    }
    const leaderboardCollectionRef = collection(db, `artifacts/${appId}/public/data/leaderboard`);
    const q = query(leaderboardCollectionRef);

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log("Leaderboard is empty. Populating with dummy scores.");
            const dummyUsers = [
                { name: "פיקטיבי 1", score: 10 },
                { name: "פיקטיבי 2", score: 100 },
                { name: "פיקטיבי 3", score: 200 },
                { name: "פיקטיבי 4", score: 300 },
                { name: "פיקטיבי 5", score: 400 },
                { name: "פיקטיבי 6", score: 500 },
                { name: "פיקטיבי 7", score: 600 },
                { name: "פיקטיבי 8", score: 700 },
                { name: "פיקטיבי 9", score: 800 },
                { name: "פיקטיבי 10", score: 900 }
            ];

            for (const user of dummyUsers) {
                await setDoc(doc(leaderboardCollectionRef), {
                    name: user.name,
                    score: user.score,
                    timestamp: new Date()
                });
            }
        }
    } catch (e) {
        console.error("Error populating dummy scores: ", e);
    }
}

// משתנים גלובליים
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth > 600 ? window.innerWidth * 0.8 : window.innerWidth * 0.95;
let height = window.innerHeight > 800 ? window.innerHeight * 0.8 : window.innerHeight * 0.9;
canvas.width = width;
canvas.height = height;

// הגדרות כלליות
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const fonts = ['Varela Round', 'arial black Bold Italic', 'arial black Bold'];

let scenes = [true, false, false, false, false]; // [menu, play, leaderboard, credits, save score]

// משתנים של המשחק
let ball, platforms, score, isGameOver;
let rotationSpeed = 0;
let towerRotation = 0;
const GRAVITY = 0.5;

// נתוני לוח תוצאות (נטען מ-Firestore)
let leaderboard = [];

// פונקציית מיון לוח התוצאות (בזיכרון)
const sortArr = (arr) => {
    arr.sort((a, b) => b.score - a.score);
};

// טעינת נתונים מ-Firestore
function loadLeaderboardFromFirestore() {
    if (!isAuthReady) return;

    const leaderboardCollectionRef = collection(db, `artifacts/${appId}/public/data/leaderboard`);
    const q = query(leaderboardCollectionRef);

    onSnapshot(q, (querySnapshot) => {
        const scores = [];
        querySnapshot.forEach((doc) => {
            scores.push(doc.data());
        });
        leaderboard = scores;
        sortArr(leaderboard);
        console.log("Leaderboard updated from Firestore.");
    }, (error) => {
        console.error("Error fetching leaderboard: ", error);
    });
}

// פונקציה לשמירת ניקוד ב-Firestore
async function saveScoreToFirestore(userName, userScore) {
    if (!isAuthReady) return;
    const leaderboardCollectionRef = collection(db, `artifacts/${appId}/public/data/leaderboard`);
    try {
        await setDoc(doc(leaderboardCollectionRef), {
            name: userName,
            score: userScore,
            timestamp: new Date()
        });
        console.log("Score saved successfully!");
        scenes = [false, false, true, false, false]; // מעבר ללוח תוצאות
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// צבעים
const palettes = [
    // עמוד מרכזי, צבע פלטפורמה, רקע, כדור, לבה
    ['#FFFFFF', '#F9F1DB', '#FCD581', '#D52941', '#990D35'],
    ['#F8F4E3', '#FF8966', '#2A2B2A', '#706C9D', '#E5446D'],
    ['#FFE4FA', '#E1DABD', '#476398', '#8DC8B2', '#FFC423'],
    ['#F9EAE1', '#13BE9C', '#AA998F', '#CC8B86', '#7D4F50'],
    ['#E4D6A7', '#C882C4', '#1C110A', '#50A2A7', '#9B2915'],
    ['#A5C4D4', '#7B6D8D', '#493B2A', '#8499B1', '#593F62'],
    ['#FFEEF2', '#FFC8FB', '#595758', '#B9BCDF', '#FF92C2'],
    ['#FFFDFD', '#F0E100', '#0B3C49', '#B7BEDC', '#7D236D'],
    ['#CB793A', '#9A031E', '#321325', '#5F0F40', '#FCDD4D'],
    ['#B2DDF7', '#4CB5AE', '#64B4C8', '#CAC8C8', '#FF203E'],
    ['#B2DDF7', '#306BAC', '#141B41', '#0B9CEB', '#918EF4'],
    ['#E8E9F3', '#B1E5F2', '#272635', '#A6A6A8', '#C8C8C8'],
    ['#F7FFDD', '#DBA159', '#E8E99B', '#EFC880', '#D0E3CC'],
    ['#0074C4', '#D65108', '#EFa00b', '#EFa00b', '#591F0A'],
    ['#F0E7D8', '#A63A50', '#B19B96', '#BA6E6E', '#C9DF4A'],
    ['#F6D8AE', '#F4D35E', '#2E4057', '#083D77', '#DA4167'],
    ['#F1F2EB', '#566246', '#4A4A48', '#A4C2A5', '#D8DA98'],
    ['#FFC2E2', '#6E44FF', '#B892FF', '#FF90B3', '#EF7A85'],
    ['#E4DFDA', '#731DC8', '#C1666B', '#48A9A6', '#D4B483'],
    ['#EFC4AC', '#432534', '#283D65', '#365855', '#C44900'],
];

let Cur_Pal = 0; // פלטת הצבעים הנוכחית
let userNameInput = ""; // משתנה לשמירת קלט שם המשתמש
let hasSavedScore = false; // Flag to ensure score is saved only once

// Tone.js audio setup
let jumpSynth;
let gameOverNoise;
let isAudioInitialized = false;

// פונקציית אתחול אודיו
async function initAudio() {
    if (!isAudioInitialized) {
        await Tone.start();
        console.log("AudioContext started.");
        jumpSynth = new Tone.PolySynth().toDestination();
        gameOverNoise = new Tone.NoiseSynth({
            noise: {
                type: "pink"
            },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.05
            }
        }).toDestination();
        isAudioInitialized = true;
    }
}

// הגדרת המשחק מחדש
function setup() {
    // בחר פלטה רנדומלית חדשה
    Cur_Pal = Math.floor(Math.random() * palettes.length);

    ball = {
        x: width / 2,
        y: height * 0.1,
        radius: 15,
        speedY: 0,
        isJumping: false,
    };
    platforms = [];
    score = 0;
    isGameOver = false;
    hasSavedScore = false;
    towerRotation = 0;
    rotationSpeed = 0;

    // יצירת פלטפורמות
    for (let i = 0; i < 15; i++) {
        createPlatform(height - 100 - i * 150);
    }
}

// יצירת פלטפורמה בודדת
function createPlatform(y) {
    const segments = [];
    const numSegments = 10;
    const dangerousSegment = Math.floor(Math.random() * numSegments);
    const startAngle = Math.random() * 2 * Math.PI;

    for (let i = 0; i < numSegments; i++) {
        const isDangerous = i === dangerousSegment;
        segments.push({
            startAngle: startAngle + i * (2 * Math.PI / numSegments),
            endAngle: startAngle + (i + 1) * (2 * Math.PI / numSegments) - 0.2,
            isDangerous: isDangerous,
        });
    }
    platforms.push({ y, segments, rotation: 0 });
}

// פונקציות ציור
function drawButton(text, x, y, buttonWidth, buttonHeight, color, textColor) {
    ctx.fillStyle = color;
    ctx.fillRect(x - buttonWidth / 2, y, buttonWidth, buttonHeight);
    ctx.fillStyle = textColor;
    ctx.font = '24px Varela Round';
    ctx.fillText(text, x, y + buttonHeight / 2);
}

function drawMenu() {
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '60px arial black Bold';
    ctx.fillText("Tower Drop", width / 2, height / 4);

    drawButton("התחל משחק", width / 2, height / 2, 200, 50, 'green', 'white');
    drawButton("לוח תוצאות", width / 2, height / 2 + 70, 200, 50, 'blue', 'white');
    drawButton("קרדיטים", width / 2, height / 2 + 140, 200, 50, 'purple', 'white');
}

function drawLeaderboard() {
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '40px arial black Bold';
    ctx.fillText("לוח תוצאות", width / 2, 50);

    ctx.font = '20px Varela Round';
    if (leaderboard.length > 0) {
        for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
            const entry = leaderboard[i];
            ctx.fillText(`${i + 1}. ${entry.name}: ${entry.score}`, width / 2, 120 + i * 30);
        }
    } else {
        ctx.fillText("טוען לוח תוצאות...", width / 2, 150);
    }

    drawButton("חזור", width / 2, height - 80, 200, 50, 'gray', 'white');
}

function drawCredits() {
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '40px arial black Bold';
    ctx.fillText("קרדיטים", width / 2, 50);
    ctx.font = '20px Varela Round';
    ctx.fillText("כל הקוד נכתב על ידי Game Vibe", width / 2, 165);
    ctx.fillText("מבוסס על המשחק Helix Jump של Voodoo", width / 2, 200);
    ctx.fillText("תודה לכל הבודקים והתומכים!", width / 2, 235);


    drawButton("חזור", width / 2, height - 80, 200, 50, 'gray', 'white');
}

function drawSaveScoreScene() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Varela Round';
    ctx.fillText("המשחק נגמר! הניקוד שלך: " + score, width / 2, height / 2 - 80);
    ctx.fillText("הכנס את שמך:", width / 2, height / 2 - 20);

    // ציור שדה הקלט
    ctx.fillStyle = 'white';
    ctx.fillRect(width / 2 - 150, height / 2 + 10, 300, 40);
    ctx.fillStyle = 'black';
    ctx.font = '24px Varela Round';
    ctx.fillText(userNameInput, width / 2, height / 2 + 30);

    // ציור כפתור
    drawButton("שמור ניקוד", width / 2, height / 2 + 70, 200, 50, 'green', 'white');
}

function drawPlayScene() {
    ctx.fillStyle = palettes[Cur_Pal][2];
    ctx.fillRect(0, 0, width, height);
    
    // ציור המגדל
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(towerRotation);
    ctx.translate(-width / 2, -height / 2);
    
    // ציור הפלטפורמות
    platforms.forEach(platform => {
        ctx.beginPath();
        const innerRadius = 70;
        const outerRadius = 150;
        
        platform.segments.forEach(segment => {
            const segmentColor = segment.isDangerous ? palettes[Cur_Pal][4] : palettes[Cur_Pal][1];
            ctx.fillStyle = segmentColor;
            
            ctx.beginPath();
            ctx.arc(width / 2, platform.y, outerRadius, segment.startAngle, segment.endAngle);
            ctx.arc(width / 2, platform.y, innerRadius, segment.endAngle, segment.startAngle, true);
            ctx.closePath();
            ctx.fill();
        });
    });
    
    // ציור המוט המרכזי
    ctx.fillStyle = palettes[Cur_Pal][0];
    ctx.fillRect(width / 2 - 20, 0, 40, height);

    ctx.restore();

    // ציור הכדור
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = palettes[Cur_Pal][3];
    ctx.fill();

    // ציור ציון
    ctx.fillStyle = 'white';
    ctx.font = '30px Varela Round';
    ctx.fillText(`ניקוד: ${score}`, width / 2, 30);
    
    if (isGameOver) {
        if (!hasSavedScore) {
            drawSaveScoreScene();
        } else {
            drawButton("התחל מחדש", width / 2, height / 2, 200, 50, 'green', 'white');
        }
    }
}

// לולאת המשחק הראשית
function gameLoop() {
    if (scenes[0]) {
        drawMenu();
    } else if (scenes[1]) {
        if (!isGameOver) {
            update();
        }
        drawPlayScene();
    } else if (scenes[2]) {
        drawLeaderboard();
    } else if (scenes[3]) {
        drawCredits();
    } else if (scenes[4]) {
        drawSaveScoreScene();
    }
    requestAnimationFrame(gameLoop);
}

// עדכון לוגיקת המשחק
function update() {
    // תנועת הכדור
    ball.speedY += GRAVITY;
    ball.y += ball.speedY;

    // תנועת המגדל
    towerRotation += rotationSpeed;
    rotationSpeed *= 0.95; // האטה סיבובית

    // בדיקת התנגשויות
    platforms.forEach(platform => {
        // בדוק אם הכדור נוחת על פלטפורמה
        if (ball.y + ball.radius >= platform.y && ball.y + ball.radius <= platform.y + 10) {
            
            const ballAngle = Math.atan2(ball.y - platform.y, ball.x - width / 2) - towerRotation;
            let normalizedBallAngle = (ballAngle + 2 * Math.PI) % (2 * Math.PI);
            
            platform.segments.forEach(segment => {
                const segmentEnd = segment.endAngle;
                const segmentStart = segment.startAngle;
                
                // וודא שהזווית נכונה
                if (normalizedBallAngle > segmentStart && normalizedBallAngle < segmentEnd) {
                    if (segment.isDangerous) {
                        isGameOver = true;
                        if (isAudioInitialized) {
                            gameOverNoise.triggerAttackRelease("16n");
                        }
                    } else {
                        ball.speedY = -15; // קפיצה
                        score += 10;
                        if (isAudioInitialized) {
                            jumpSynth.triggerAttackRelease(["C4"], "8n");
                        }
                    }
                }
            });
        }
    });

    // בדיקת נפילה מחוץ למסך
    if (ball.y > height) {
        isGameOver = true;
        if (isAudioInitialized) {
            gameOverNoise.triggerAttackRelease("16n");
        }
    }
}

// טפל בסיבוב המגדל באמצעות עכבר/מגע
let touchStartX = null;
let lastMouseX = null;

canvas.addEventListener('mousedown', (e) => {
    initAudio(); // אתחל אודיו בלחיצה ראשונה
    lastMouseX = e.clientX;
});

canvas.addEventListener('mousemove', (e) => {
    if (lastMouseX !== null && scenes[1] && !isGameOver) {
        const deltaX = e.clientX - lastMouseX;
        rotationSpeed = deltaX * 0.005;
        lastMouseX = e.clientX;
    }
});

canvas.addEventListener('mouseup', () => {
    lastMouseX = null;
});

canvas.addEventListener('touchstart', (e) => {
    initAudio(); // אתחל אודיו במגע ראשון
    touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    if (touchStartX !== null && scenes[1] && !isGameOver) {
        const deltaX = e.touches[0].clientX - touchStartX;
        rotationSpeed = deltaX * 0.005;
        touchStartX = e.touches[0].clientX;
    }
});

canvas.addEventListener('touchend', () => {
    touchStartX = null;
});

// טיפול בקלט שם המשתמש
document.addEventListener('keydown', (e) => {
    if (scenes[4]) {
        if (e.key === "Backspace") {
            userNameInput = userNameInput.slice(0, -1);
        } else if (e.key.length === 1 && userNameInput.length < 15) {
            userNameInput += e.key;
        } else if (e.key === "Enter") {
            if (userNameInput.trim() !== "" && !hasSavedScore) {
                saveScoreToFirestore(userNameInput, score);
                hasSavedScore = true;
                userNameInput = "";
            }
        }
    }
});

// טפל בקליקים של עכבר על כפתורי התפריט
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (scenes[0]) { // תפריט
        // כפתור התחל משחק
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 && mouseY < height / 2 + 50) {
            scenes = [false, true, false, false, false];
            setup();
        }
        // כפתור לוח תוצאות
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 70 && mouseY < height / 2 + 120) {
            scenes = [false, false, true, false, false];
        }
        // כפתור קרדיטים
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 140 && mouseY < height / 2 + 190) {
            scenes = [false, false, false, true, false];
        }
    } else if (scenes[1] && isGameOver && !hasSavedScore) {
        // כפתור שמור ניקוד במסך משחק שנגמר
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 70 && mouseY < height / 2 + 120) {
            scenes = [false, false, false, false, true];
        }
    } else if (scenes[4]) { // מסך שמירת ניקוד
        // כפתור שמור ניקוד
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 70 && mouseY < height / 2 + 120) {
            if (userNameInput.trim() !== "" && !hasSavedScore) {
                saveScoreToFirestore(userNameInput, score);
                hasSavedScore = true;
                userNameInput = "";
            }
        }
    } else if (scenes[1] && isGameOver && hasSavedScore) {
        // כפתור התחל מחדש (אחרי שהניקוד נשמר)
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 50 && mouseY < height / 2 + 100) {
            scenes = [true, false, false, false, false];
        }
    } else if (scenes[2] || scenes[3]) { // כפתור חזור
        if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height - 80 && mouseY < height - 30) {
            scenes = [true, false, false, false, false];
        }
    }
});

// אתחל את לולאת המשחק
window.onload = async function() {
    // Sign in anonymously if no custom token is provided
    if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken);
    } else {
        await signInAnonymously(auth);
    }

    // Set up initial state and start the game loop
    setup();
    gameLoop();
}
