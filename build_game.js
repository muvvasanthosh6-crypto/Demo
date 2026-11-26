const fs = require('fs');
const path = require('path');

const toDataUri = (relPath, mime) => 'data:' + mime + ';base64,' + fs.readFileSync(path.join(__dirname, relPath)).toString('base64');

const runnerB64 = fs.readFileSync(path.join(__dirname, 'bhai_runner_cutout.png')).toString('base64');
const obstaclesB64 = JSON.stringify(Array.from({ length: 8 }, (_, i) => toDataUri(`obstacles/obs_${i + 1}.jpg`, 'image/jpeg')));
const flyingObstaclesB64 = JSON.stringify(Array.from({ length: 4 }, (_, i) => toDataUri(`obstacles/fly_${i + 1}.jpg`, 'image/jpeg')));
const winB64 = toDataUri('bhai_win.jpg', 'image/jpeg');
const levelAudiosB64 = JSON.stringify([
    'bhai 1.mpeg', 'bhai 2.mpeg', 'bhai 3.mpeg', 'bhai 4.mpeg',
    'bhai 5 .mpeg', 'bhai 6.mpeg', 'bhai 7.mpeg', 'bhai 8.mpeg'
].map(f => toDataUri(f, 'audio/mpeg')));
const bhaiOutB64 = toDataUri('bhai out.mpeg', 'audio/mpeg');
const bossOutB64 = toDataUri('boss_out.jpg', 'image/jpeg');
const bossAudioB64 = toDataUri('boss.mpeg', 'audio/mpeg');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Bhai 3D Dino Run - Realistic Multi-Level Edition</title>
    <style>
        * {
            box-sizing: border-box;
            user-select: none;
            -webkit-user-select: none;
            margin: 0;
            padding: 0;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow-x: hidden;
        }
        body {
            background-color: #0b0d13;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #f1f3f4;
            transition: background-color 0.6s ease;
            padding: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 8px;
            width: 100%;
            max-width: 1360px;
        }
        .header h1 {
            font-size: 32px;
            letter-spacing: 2.5px;
            margin-bottom: 3px;
            font-weight: 900;
            text-transform: uppercase;
            background: linear-gradient(90deg, #ff9f43, #ff5252, #ee5253);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 2px 14px rgba(255, 82, 82, 0.4);
        }
        .header .subtitle {
            font-size: 13px;
            opacity: 0.9;
            letter-spacing: 1px;
            color: #c8d6e5;
            font-weight: 500;
        }
        .badge {
            display: inline-block;
            background: linear-gradient(135deg, #ff4757, #e84118);
            color: white;
            font-size: 11px;
            font-weight: 800;
            padding: 2px 9px;
            border-radius: 12px;
            margin-left: 6px;
            vertical-align: middle;
            -webkit-text-fill-color: initial;
            box-shadow: 0 2px 8px rgba(232, 65, 24, 0.5);
        }
        #game-wrapper {
            position: relative;
            width: 100%;
            max-width: 1360px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        /* Top Distance Bar (Outside Canvas - Never covers character) */
        .distance-bar {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            background: #161926;
            padding: 8px 16px;
            border-radius: 12px 12px 0 0;
            border: 2px solid #282e3e;
            border-bottom: none;
            font-size: 13px;
            flex-wrap: wrap;
        }
        .distance-level {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: #ffa502;
            white-space: nowrap;
        }
        .distance-track {
            flex: 1;
            min-width: 100px;
            height: 8px;
            background: rgba(255, 255, 255, 0.12);
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .distance-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #ff9f43, #ee5253);
            border-radius: 6px;
            transition: width 0.2s linear;
            box-shadow: 0 0 10px rgba(238, 82, 83, 0.8);
        }
        .distance-text {
            font-size: 12px;
            color: #dfe4ea;
            font-weight: 700;
            white-space: nowrap;
        }
        #game-container {
            position: relative;
            width: 100%;
            background: #10121b;
            border-radius: 0 0 16px 16px;
            overflow: hidden;
            box-shadow: 0 16px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08);
            border: 2px solid #282e3e;
            transition: border-color 0.4s ease;
        }
        canvas {
            display: block;
            width: 100%;
            height: auto;
            background: transparent;
            cursor: pointer;
        }
        .controls-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-top: 10px;
            padding: 0 8px;
            color: #a4b0be;
            font-size: 13px;
            font-weight: 600;
        }
        .keys {
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
        }
        .key-badge {
            background: #2f3542;
            color: #f1f2f6;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid #57606f;
            box-shadow: 0 2px 0 #1e272e;
            font-size: 12px;
            font-weight: 700;
        }
        #speed-meter {
            color: #ff9f43;
            font-weight: 800;
            letter-spacing: 1px;
        }
        .action-bar {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            background: #2f3542;
            border: 1px solid #57606f;
            color: #f1f2f6;
            padding: 9px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            transition: all 0.2s ease;
            box-shadow: 0 3px 0 #1e272e;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn:hover {
            background: #57606f;
            color: #ffffff;
            transform: translateY(-1px);
        }
        .btn:active {
            transform: translateY(2px);
            box-shadow: none;
        }
        .btn-primary {
            background: linear-gradient(135deg, #ff4757, #ee5253);
            border-color: #ff6b81;
            box-shadow: 0 3px 0 #b33939;
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #ff6b81, #ff4757);
        }
        .mobile-controls {
            display: none;
            width: 100%;
            justify-content: space-around;
            margin-top: 12px;
            gap: 14px;
        }
        @media (max-width: 820px) {
            .mobile-controls {
                display: flex;
            }
        }
        .touch-btn {
            flex: 1;
            padding: 16px;
            font-size: 16px;
            font-weight: 800;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            background: #3742fa;
            color: #fff;
            box-shadow: 0 4px 0 #1b1464;
            touch-action: manipulation;
        }
        .touch-btn:active {
            transform: translateY(4px);
            box-shadow: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Bhai 3D Dino Run <span class="badge">4K REALISTIC SPRITE &bull; 8 LEVELS 🔥</span></h1>
        <div class="subtitle">Realistic 3D Sprinting Physics &bull; Authentic Cutout &bull; Multi-Level Distance Progression</div>
    </div>

    <div id="game-wrapper">
        <div class="distance-bar">
            <div class="distance-level" id="hud-level-title">LEVEL 1 &bull; DESERT SUNRISE</div>
            <div class="distance-track">
                <div class="distance-fill" id="hud-progress-fill"></div>
            </div>
            <div class="distance-text" id="hud-progress-text">0m / 500m (0%)</div>
        </div>
        <div id="game-container">
            <canvas id="gameCanvas" width="1360" height="500"></canvas>
        </div>

        <div class="controls-info">
            <div class="keys">
                <span><span class="key-badge">SPACE</span> or <span class="key-badge">&uarr;</span> JUMP</span>
                <span><span class="key-badge">&darr;</span> DUCK / 3D SLIDE</span>
                <span><span class="key-badge">R</span> RESTART</span>
            </div>
            <div>
                <span id="speed-meter">SPEED: 6.5x</span>
            </div>
        </div>

        <div class="mobile-controls">
            <button class="touch-btn" id="m-duck">DUCK / SLIDE &#9660;</button>
            <button class="touch-btn" id="m-jump">JUMP &#9650;</button>
        </div>

        <div class="action-bar">
            <button class="btn btn-primary" id="btn-restart">&#10227; RESTART RUN</button>
            <button class="btn" id="btn-sound">&#128266; SOUND: ON</button>
            <button class="btn" id="btn-fullscreen">&#x26F6; FULLSCREEN</button>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Widescreen High Definition Canvas Resolution
        const V_WIDTH = 1360;
        const V_HEIGHT = 500;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

        function setupCanvas() {
            canvas.width = Math.floor(V_WIDTH * dpr);
            canvas.height = Math.floor(V_HEIGHT * dpr);
            canvas.style.aspectRatio = V_WIDTH + '/' + V_HEIGHT;
            ctx.scale(dpr, dpr);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }
        setupCanvas();

        // Load the Authentic Transparent Cutout Image
        const RUNNER_B64 = 'data:image/png;base64,${runnerB64}';
        const bhaiImg = new Image();
        let bhaiImgLoaded = false;
        bhaiImg.onload = () => { bhaiImgLoaded = true; };
        bhaiImg.onerror = () => {
            // Fallback to embedded base64 if local file blocked
            if (bhaiImg.src !== RUNNER_B64) {
                bhaiImg.src = RUNNER_B64;
            }
        };
        bhaiImg.src = 'bhai_runner_cutout.png';

        // Load 8 Ground Obstacle Images
        const OBSTACLES_B64_DATA = ${obstaclesB64};
        const obstacleImages = [];
        for (let i = 0; i < 8; i++) {
            const img = new Image();
            const b64Src = OBSTACLES_B64_DATA[i];
            img.src = 'obstacles/obs_' + (i + 1) + '.jpg';
            img.onerror = () => { img.src = b64Src; };
            obstacleImages.push(img);
        }

        // Load 4 Flying Obstacle Images (replacing birds)
        const FLYING_B64_DATA = ${flyingObstaclesB64};
        const flyingImages = [];
        for (let i = 0; i < 4; i++) {
            const img = new Image();
            const b64Src = FLYING_B64_DATA[i];
            img.src = 'obstacles/fly_' + (i + 1) + '.jpg';
            img.onerror = () => { img.src = b64Src; };
            flyingImages.push(img);
        }

        // Load Level Complete Victory Laughing Image
        const WIN_B64 = '${winB64}';
        const bhaiWinImg = new Image();
        bhaiWinImg.src = 'bhai_win.jpg';
        bhaiWinImg.onerror = () => { bhaiWinImg.src = WIN_B64; };

        // Load 8 Level Audio Tracks (bhai 8.mpeg -> Level 1 ... bhai 1.mpeg -> Level 8)
        const LEVEL_AUDIO_FILES = [
            'bhai 8.mpeg',
            'bhai 7.mpeg',
            'bhai 6.mpeg',
            'bhai 5 .mpeg',
            'bhai 4.mpeg',
            'bhai 3.mpeg',
            'bhai 2.mpeg',
            'bhai 1.mpeg'
        ];
        const LEVEL_AUDIO_B64 = (${levelAudiosB64}).reverse();
        const levelAudios = LEVEL_AUDIO_FILES.map((fileName, idx) => {
            const audio = new Audio();
            audio.loop = true;
            audio.volume = 0.65;
            audio.preload = 'auto';
            audio.src = encodeURI(fileName);
            audio.onerror = () => {
                if (audio.src !== LEVEL_AUDIO_B64[idx]) {
                    audio.src = LEVEL_AUDIO_B64[idx];
                }
            };
            return audio;
        });

        function stopAllLevelAudio() {
            levelAudios.forEach(a => {
                try {
                    a.pause();
                } catch(e) {}
            });
        }

        function playLevelAudio(levelIdx, resetTime = true) {
            stopAllLevelAudio();
            if (!soundEnabled) return;
            const audio = levelAudios[levelIdx];
            if (!audio) return;
            try {
                if (resetTime) audio.currentTime = 0;
                const p = audio.play();
                if (p && p.catch) p.catch(() => {});
            } catch(e) {}
        }

        // Load Bhai Out Audio (plays when out in any level)
        const BHAI_OUT_B64 = '${bhaiOutB64}';
        const bhaiOutAudio = new Audio();
        bhaiOutAudio.volume = 0.85;
        bhaiOutAudio.preload = 'auto';
        bhaiOutAudio.src = encodeURI('bhai out.mpeg');
        bhaiOutAudio.onerror = () => {
            if (bhaiOutAudio.src !== BHAI_OUT_B64) {
                bhaiOutAudio.src = BHAI_OUT_B64;
            }
        };

        function stopBhaiOutAudio() {
            try {
                bhaiOutAudio.pause();
                bhaiOutAudio.currentTime = 0;
            } catch(e) {}
        }

        function playBhaiOutAudio() {
            if (!soundEnabled) return;
            try {
                bhaiOutAudio.currentTime = 0;
                const p = bhaiOutAudio.play();
                if (p && p.catch) p.catch(() => {});
            } catch(e) {}
        }

        // Load Boss Out Photo & Audio (plays & displays when player is out)
        const BOSS_OUT_B64 = '${bossOutB64}';
        const bossOutImg = new Image();
        bossOutImg.src = 'boss_out.jpg';
        bossOutImg.onerror = () => { bossOutImg.src = BOSS_OUT_B64; };

        const BOSS_AUDIO_B64 = '${bossAudioB64}';
        const bossOutAudio = new Audio();
        bossOutAudio.volume = 0.85;
        bossOutAudio.preload = 'auto';
        bossOutAudio.src = 'boss.mpeg';
        bossOutAudio.onerror = () => {
            if (bossOutAudio.src !== BOSS_AUDIO_B64) {
                bossOutAudio.src = BOSS_AUDIO_B64;
            }
        };

        function stopBossOutAudio() {
            try {
                bossOutAudio.pause();
                bossOutAudio.currentTime = 0;
            } catch(e) {}
        }

        function playBossOutAudio() {
            if (!soundEnabled) return;
            try {
                bossOutAudio.currentTime = 0;
                const p = bossOutAudio.play();
                if (p && p.catch) p.catch(() => {});
            } catch(e) {}
        }

        // Universal High-Clarity Image Cover Renderer (Preserves Aspect Ratio without distortion)
        function drawImageCover(img, dx, dy, dw, dh) {
            if (!img || !img.complete || img.naturalWidth === 0) return false;
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const targetRatio = dw / dh;
            let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
            if (imgRatio > targetRatio) {
                sw = img.naturalHeight * targetRatio;
                sx = (img.naturalWidth - sw) / 2;
            } else {
                sh = img.naturalWidth / targetRatio;
                sy = (img.naturalHeight - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
            return true;
        }

        // Sound System (Web Audio API)
        let soundEnabled = true;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioCtx = null;

        function getAudioContext() {
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return audioCtx;
        }

        function playJumpSound() {
            if (!soundEnabled) return;
            try {
                const actx = getAudioContext();
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(180, actx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(620, actx.currentTime + 0.16);
                gain.gain.setValueAtTime(0.22, actx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, actx.currentTime + 0.16);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start();
                osc.stop(actx.currentTime + 0.16);
            } catch(e) {}
        }

        function playSlideSound() {
            if (!soundEnabled) return;
            try {
                const actx = getAudioContext();
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(320, actx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(110, actx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.14, actx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, actx.currentTime + 0.2);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start();
                osc.stop(actx.currentTime + 0.2);
            } catch(e) {}
        }

        function playLevelUpSound() {
            if (!soundEnabled) return;
            try {
                const actx = getAudioContext();
                const now = actx.currentTime;
                [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
                    const osc = actx.createOscillator();
                    const gain = actx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + i * 0.07);
                    gain.gain.setValueAtTime(0.24, now + i * 0.07);
                    gain.gain.linearRampToValueAtTime(0.01, now + i * 0.07 + 0.28);
                    osc.connect(gain);
                    gain.connect(actx.destination);
                    osc.start(now + i * 0.07);
                    osc.stop(now + i * 0.07 + 0.28);
                });
            } catch(e) {}
        }

        function playMilestoneSound() {
            if (!soundEnabled) return;
            try {
                const actx = getAudioContext();
                const now = actx.currentTime;
                [ { f: 659.25, t: 0, d: 0.11 }, { f: 987.77, t: 0.11, d: 0.24 } ].forEach(tone => {
                    const osc = actx.createOscillator();
                    const gain = actx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(tone.f, now + tone.t);
                    gain.gain.setValueAtTime(0.22, now + tone.t);
                    gain.gain.linearRampToValueAtTime(0.01, now + tone.t + tone.d);
                    osc.connect(gain);
                    gain.connect(actx.destination);
                    osc.start(now + tone.t);
                    osc.stop(now + tone.t + tone.d);
                });
            } catch(e) {}
        }

        function playHitSound() {
            if (!soundEnabled) return;
            try {
                const actx = getAudioContext();
                const now = actx.currentTime;
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(35, now + 0.38);
                gain.gain.setValueAtTime(0.38, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.38);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.38);
            } catch(e) {}
        }

        // ==========================================
        // 8 MULTI-LEVEL WORLDS CONFIGURATION
        // ==========================================
        const LEVELS = [
            {
                level: 1,
                name: "Desert Sunrise",
                goalDistance: 500,
                coinReward: 50,
                baseSpeed: 6.5,
                skyTop: '#ff9f43',
                skyBottom: '#feca57',
                mountainColor: '#ee5253',
                duneColor: '#ff793f',
                roadColor: '#c0392b',
                roadBorder: '#e74c3c',
                roadLine: 'rgba(255, 234, 167, 0.7)',
                groundColor: '#d35400',
                cactusColor: '#2c3e50',
                sunType: 'morning',
                pterodactyls: false
            },
            {
                level: 2,
                name: "Cyber Neon Highway",
                goalDistance: 1000,
                coinReward: 120,
                baseSpeed: 7.8,
                skyTop: '#0a192f',
                skyBottom: '#172a45',
                mountainColor: '#1f4068',
                duneColor: '#162447',
                roadColor: '#1b1b2f',
                roadBorder: '#00d2d3',
                roadLine: 'rgba(0, 210, 211, 0.9)',
                groundColor: '#0f141d',
                cactusColor: '#00d2d3',
                sunType: 'neon',
                pterodactyls: true
            },
            {
                level: 3,
                name: "Synthwave Sunset",
                goalDistance: 1600,
                coinReward: 200,
                baseSpeed: 9.0,
                skyTop: '#2c2c54',
                skyBottom: '#ff7979',
                mountainColor: '#40407a',
                duneColor: '#706fd3',
                roadColor: '#341f97',
                roadBorder: '#ff5252',
                roadLine: 'rgba(255, 221, 89, 0.85)',
                groundColor: '#222f3e',
                cactusColor: '#ff5252',
                sunType: 'sunset',
                pterodactyls: true
            },
            {
                level: 4,
                name: "Pushpa Wildfire",
                goalDistance: 2300,
                coinReward: 320,
                baseSpeed: 10.2,
                skyTop: '#1a0000',
                skyBottom: '#8b0000',
                mountainColor: '#3d0c02',
                duneColor: '#b33939',
                roadColor: '#4b1e1e',
                roadBorder: '#ff3838',
                roadLine: 'rgba(255, 159, 67, 0.8)',
                groundColor: '#2c0c0c',
                cactusColor: '#ff3838',
                sunType: 'bloodmoon',
                pterodactyls: true
            },
            {
                level: 5,
                name: "Midnight Storm",
                goalDistance: 3100,
                coinReward: 450,
                baseSpeed: 11.2,
                skyTop: '#0b0c10',
                skyBottom: '#1f2833',
                mountainColor: '#2c3e50',
                duneColor: '#1a252f',
                roadColor: '#0f1923',
                roadBorder: '#66fcf1',
                roadLine: 'rgba(102, 252, 241, 0.85)',
                groundColor: '#080e14',
                cactusColor: '#45a29e',
                sunType: 'neon',
                pterodactyls: true
            },
            {
                level: 6,
                name: "Crimson Canyon",
                goalDistance: 4000,
                coinReward: 600,
                baseSpeed: 12.0,
                skyTop: '#4a001f',
                skyBottom: '#c0392b',
                mountainColor: '#641e16',
                duneColor: '#922b21',
                roadColor: '#511845',
                roadBorder: '#ff9f43',
                roadLine: 'rgba(255, 195, 18, 0.85)',
                groundColor: '#3b0b22',
                cactusColor: '#ffc312',
                sunType: 'sunset',
                pterodactyls: true
            },
            {
                level: 7,
                name: "Golden Dynasty",
                goalDistance: 5000,
                coinReward: 800,
                baseSpeed: 12.8,
                skyTop: '#b7950b',
                skyBottom: '#f7dc6f',
                mountainColor: '#7d6608',
                duneColor: '#d4ac0d',
                roadColor: '#5d4037',
                roadBorder: '#ffeaa7',
                roadLine: 'rgba(255, 255, 255, 0.85)',
                groundColor: '#4e342e',
                cactusColor: '#1e272e',
                sunType: 'morning',
                pterodactyls: true
            },
            {
                level: 8,
                name: "Cosmic Apex Legend",
                goalDistance: Infinity,
                coinReward: 0,
                baseSpeed: 13.6,
                skyTop: '#050505',
                skyBottom: '#191b3b',
                mountainColor: '#30336b',
                duneColor: '#535c68',
                roadColor: '#130f40',
                roadBorder: '#f9ca24',
                roadLine: 'rgba(249, 202, 36, 0.95)',
                groundColor: '#0a0a14',
                cactusColor: '#f9ca24',
                sunType: 'cosmos',
                pterodactyls: true
            }
        ];

        let currentLevelIdx = 0;
        let currentLevel = LEVELS[0];
        let levelUpBannerTimer = 0;
        let levelUpBannerText = '';

        // Game Constants & Dimensions
        const GROUND_Y = 422;
        const ROAD_TOP = 405;
        const GRAVITY = 0.74;
        const JUMP_FORCE = -17.6;
        const MIN_OBSTACLE_GAP = 580;

        // Game State
        let gameState = 'START';  // START, PLAYING, LEVEL_COMPLETE, GAMEOVER
        let score = 0;
        let distanceTraveled = 0;
        let levelDistance = 0;      // distance within the current level (resets each level)
        let totalScore = 0;         // cumulative distance across all levels
        let highScore = parseInt(localStorage.getItem('bhai_dino_hi_score') || '0', 10);
        let gameSpeed = 6.5;
        let lastMilestone = 0;
        let milestoneFlashTimer = 0;

        // Coin System
        let coins = 0;
        let totalCoins = parseInt(localStorage.getItem('bhai_dino_coins') || '0', 10);
        let coinParticles = [];
        let levelCompleteData = null;  // holds info for the completion screen

        // Visual FX Systems
        let particles = [];
        let afterimages = [];
        let stars = [];
        let embers = [];

        // Stars for night levels
        for (let i = 0; i < 90; i++) {
            stars.push({
                x: Math.random() * V_WIDTH,
                y: Math.random() * 260,
                size: Math.random() > 0.65 ? 2.5 : 1.4,
                blink: Math.random() * 10
            });
        }
        // Embers for Pushpa wildfire
        for (let i = 0; i < 40; i++) {
            embers.push({
                x: Math.random() * V_WIDTH,
                y: Math.random() * V_HEIGHT,
                vx: -(Math.random() * 3 + 2.5),
                vy: -(Math.random() * 2 + 0.4),
                size: Math.random() * 3 + 1.5,
                alpha: Math.random()
            });
        }

        // ==========================================
        // REALISTIC 3D CHARACTER CONTROLLER (BHAI)
        // ==========================================
        const bhai = {
            x: 125,
            y: GROUND_Y,
            // Bigger proportional dimensions for 766x1024 cutout
            baseW: 168,
            baseH: 224,
            w: 168,
            h: 224,
            // Split ratio: top 28% = head (stable), bottom 72% = body (animated)
            headRatio: 0.28,
            vy: 0,
            isGrounded: true,
            isDucking: false,
            
            // 3D Motion & Stride Variables
            strideTimer: 0,
            strideRate: 0.17,
            pelvisBob: 0,
            squashX: 1.0,
            squashY: 1.0,
            leanAngle: 0.11,
            torsoYaw: 0,
            landingSquash: 0,
            shadowScale: 1.0,
            shadowAlpha: 0.45,

            jump() {
                if (this.isGrounded && gameState === 'PLAYING') {
                    this.vy = JUMP_FORCE;
                    this.isGrounded = false;
                    playJumpSound();
                    createGroundShockwave(this.x + 55, GROUND_Y, 18);
                } else if (gameState === 'START' || gameState === 'GAMEOVER') {
                    startGame();
                }
            },

            duck(isDucking) {
                if (gameState !== 'PLAYING') return;
                if (!this.isGrounded) return;
                if (isDucking && !this.isDucking) {
                    playSlideSound();
                }
                this.isDucking = isDucking;
            },

            update() {
                this.y += this.vy;

                if (!this.isGrounded) {
                    this.vy += GRAVITY;

                    // Mid-air physics: character remains clean and fixed during jump
                    this.leanAngle = 0;
                    this.squashX = 1.0;
                    this.squashY = 1.0;
                    this.torsoYaw = 0;

                    // Height calculation for 3D shadow
                    const jumpHeight = Math.max(0, GROUND_Y - this.y);
                    this.shadowScale = Math.max(0.45, 1.0 - jumpHeight * 0.0028);
                    this.shadowAlpha = Math.max(0.1, 0.45 - jumpHeight * 0.0018);

                    // Landing Check
                    if (this.y >= GROUND_Y) {
                        this.y = GROUND_Y;
                        this.vy = 0;
                        this.isGrounded = true;
                        this.landingSquash = 1.0;
                        createGroundShockwave(this.x + 55, GROUND_Y, 20);
                    }
                } else {
                    // Ground Running Mechanics
                    this.shadowScale = 1.0;
                    this.shadowAlpha = 0.45;

                    this.strideTimer += (gameSpeed * this.strideRate);
                    const phase = this.strideTimer;

                    // Character is fixed/steady (no distortion, bobbing, or shaking)
                    this.pelvisBob = 0;
                    this.leanAngle = 0;
                    this.torsoYaw = 0;
                    this.squashX = 1.0;
                    this.squashY = 1.0;
                    this.landingSquash = 0;

                    // Foot-strike dust particles kick backward occasionally to show ground movement
                    if (Math.random() < 0.25) {
                        particles.push({
                            x: this.x + 30 + (Math.random() - 0.5) * 16,
                            y: GROUND_Y - 2,
                            vx: -(gameSpeed * 0.48 + Math.random() * 3.5),
                            vy: -(1.4 + Math.random() * 2.8),
                            size: 3.5 + Math.random() * 4.5,
                            alpha: 0.85,
                            color: currentLevel.groundColor
                        });
                    }
                }

                // Handle Ducking / Sliding
                if (this.isDucking && this.isGrounded) {
                    this.w = 210;
                    this.h = 130;
                    this.leanAngle = 0.34;
                    
                    // Friction slide sparks and dust
                    if (Math.random() < 0.8) {
                        particles.push({
                            x: this.x + 50 + Math.random() * 70,
                            y: GROUND_Y - 2,
                            vx: -(gameSpeed * 0.65 + Math.random() * 5),
                            vy: -(0.6 + Math.random() * 2.2),
                            size: 3 + Math.random() * 4,
                            alpha: 1.0,
                            color: Math.random() > 0.4 ? '#ff9f43' : '#fbc531'
                        });
                    }
                } else {
                    this.w = this.baseW;
                    this.h = this.baseH;
                }
            },

            draw() {
                if (!bhaiImgLoaded || !bhaiImg.complete) {
                    ctx.save();
                    ctx.fillStyle = '#ff5252';
                    ctx.fillRect(this.x, this.y - this.h, this.w, this.h);
                    ctx.restore();
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                const bob = (this.isGrounded && !this.isDucking) ? this.pelvisBob : 0;

                // The neck pivot is at ~25% from the top of the character
                // All rotation/squash pivots here so the head stays naturally stable
                // while the torso and legs swing below
                const neckRatio = 0.25;
                const neckOffsetFromCenter = (0.5 - neckRatio) * this.h;  // positive = neck above center

                // 1. Ground Shadow (always flat on road surface)
                ctx.save();
                ctx.translate(this.x + this.w * 0.48, GROUND_Y);
                ctx.scale(this.shadowScale, this.shadowScale * 0.26);
                ctx.fillStyle = 'rgba(0, 0, 0, ' + this.shadowAlpha + ')';
                ctx.beginPath();
                ctx.ellipse(0, 0, this.w * 0.62, 24, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // 2. Speed Afterimages (Ghost Trails)
                afterimages.forEach(trail => {
                    ctx.save();
                    ctx.globalAlpha = trail.alpha;
                    ctx.translate(trail.x + trail.w / 2, trail.y - trail.h / 2);
                    ctx.rotate(trail.lean * 0.4);
                    ctx.drawImage(bhaiImg, -trail.w / 2, -trail.h / 2, trail.w, trail.h);
                    ctx.restore();
                });

                // 3. Draw the character fixed & steady (no distortion or shaking)
                ctx.save();
                ctx.drawImage(
                    bhaiImg,
                    this.x,
                    this.y - this.h,
                    this.w,
                    this.h
                );
                ctx.restore();

                // 4. Game Over Indicator
                if (gameState === 'GAMEOVER') {
                    ctx.save();
                    ctx.font = 'bold 26px system-ui, sans-serif';
                    ctx.fillStyle = '#ff4757';
                    ctx.shadowColor = '#000';
                    ctx.shadowBlur = 8;
                    ctx.textAlign = 'center';
                    ctx.fillText('💥 X_X', this.x + this.w / 2, this.y - this.h - 14);
                    ctx.restore();
                }
            },

            getHitbox() {
                // Precise, forgiving hitbox around character torso and legs
                const insetX = 38;
                const insetTop = 28;
                const insetBottom = 10;
                return {
                    x: this.x + insetX,
                    y: this.y - this.h + insetTop,
                    w: this.w - insetX * 2,
                    h: this.h - insetTop - insetBottom
                };
            }
        };

        function createGroundShockwave(x, y, count) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI;
                const spd = 2 + Math.random() * 5;
                particles.push({
                    x: x + (Math.random() - 0.5) * 44,
                    y: y - Math.random() * 5,
                    vx: -(gameSpeed * 0.45 + (Math.random() - 0.25) * 6),
                    vy: -(1.5 + Math.random() * 4),
                    size: 3.5 + Math.random() * 5,
                    alpha: 1.0,
                    color: currentLevel.groundColor
                });
            }
        }

        function updateParticles() {
            // Update ground dust particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.028;
                if (p.alpha <= 0) particles.splice(i, 1);
            }
            // Update afterimages
            for (let i = afterimages.length - 1; i >= 0; i--) {
                const a = afterimages[i];
                a.alpha -= 0.045;
                if (a.alpha <= 0) afterimages.splice(i, 1);
            }
        }

        function drawParticles() {
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.restore();
            });
        }

        // ==========================================
        // 3D PARALLAX ENVIRONMENT & SCROLLING ROAD
        // ==========================================
        let mountainOffset = 0;
        let duneOffset = 0;
        let poleOffset = 0;
        let roadOffset = 0;

        function drawSkyAndAtmosphere() {
            // Sky gradient
            const skyGrad = ctx.createLinearGradient(0, 0, 0, ROAD_TOP);
            skyGrad.addColorStop(0, currentLevel.skyTop);
            skyGrad.addColorStop(1, currentLevel.skyBottom);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, V_WIDTH, ROAD_TOP);

            // Celestial bodies by level type
            if (currentLevel.sunType === 'morning' || currentLevel.sunType === 'sunset') {
                const sunX = V_WIDTH - 200;
                const sunY = 95;
                const glow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 120);
                glow.addColorStop(0, 'rgba(255, 234, 167, 0.6)');
                glow.addColorStop(1, 'rgba(255, 234, 167, 0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fbc531';
                ctx.beginPath();
                ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
                ctx.fill();
            } else if (currentLevel.sunType === 'bloodmoon') {
                const moonX = V_WIDTH - 200;
                const moonY = 90;
                const glow = ctx.createRadialGradient(moonX, moonY, 20, moonX, moonY, 140);
                glow.addColorStop(0, 'rgba(255, 71, 87, 0.5)');
                glow.addColorStop(1, 'rgba(255, 71, 87, 0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(moonX, moonY, 140, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ff4757';
                ctx.beginPath();
                ctx.arc(moonX, moonY, 44, 0, Math.PI * 2);
                ctx.fill();

                embers.forEach(e => {
                    ctx.save();
                    ctx.globalAlpha = e.alpha;
                    ctx.fillStyle = '#ffa502';
                    ctx.fillRect(e.x, e.y, e.size, e.size);
                    ctx.restore();
                    e.x += e.vx;
                    e.y += e.vy;
                    if (e.x < -10) e.x = V_WIDTH + 10;
                    if (e.y < -10) e.y = ROAD_TOP;
                });
            } else {
                // Neon or Cosmos stars
                ctx.fillStyle = '#ffffff';
                stars.forEach(s => {
                    s.blink += 0.05;
                    if (Math.sin(s.blink) > -0.25) {
                        ctx.fillRect(s.x, s.y, s.size, s.size);
                    }
                });

                // Crescent Moon
                ctx.fillStyle = '#f5f6fa';
                ctx.beginPath();
                ctx.arc(V_WIDTH - 200, 85, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = currentLevel.skyTop;
                ctx.beginPath();
                ctx.arc(V_WIDTH - 212, 77, 28, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawMountains() {
            ctx.fillStyle = currentLevel.mountainColor;
            ctx.beginPath();
            ctx.moveTo(0, ROAD_TOP);

            const mWidth = 280;
            const numPeaks = Math.ceil(V_WIDTH / mWidth) + 2;
            const startX = -(mountainOffset % mWidth);

            for (let i = 0; i < numPeaks; i++) {
                const px = startX + i * mWidth;
                const peakH = 135 + ((i * 43) % 80);
                ctx.lineTo(px + mWidth * 0.5, ROAD_TOP - peakH);
                ctx.lineTo(px + mWidth, ROAD_TOP);
            }
            ctx.lineTo(V_WIDTH, ROAD_TOP);
            ctx.closePath();
            ctx.fill();
        }

        function drawDunes() {
            ctx.fillStyle = currentLevel.duneColor;
            ctx.beginPath();
            ctx.moveTo(0, ROAD_TOP);

            const dWidth = 340;
            const numDunes = Math.ceil(V_WIDTH / dWidth) + 2;
            const startX = -(duneOffset % dWidth);

            for (let i = 0; i < numDunes; i++) {
                const px = startX + i * dWidth;
                const duneH = 50 + ((i * 31) % 45);
                ctx.bezierCurveTo(
                    px + dWidth * 0.35, ROAD_TOP - duneH,
                    px + dWidth * 0.65, ROAD_TOP - duneH * 0.8,
                    px + dWidth, ROAD_TOP
                );
            }
            ctx.lineTo(V_WIDTH, ROAD_TOP);
            ctx.closePath();
            ctx.fill();
        }

        function drawPoles() {
            ctx.strokeStyle = currentLevel.groundColor;
            ctx.fillStyle = currentLevel.groundColor;
            ctx.lineWidth = 3.5;

            const poleSpacing = 480;
            const startX = -(poleOffset % poleSpacing);
            const numPoles = Math.ceil(V_WIDTH / poleSpacing) + 2;

            for (let i = 0; i < numPoles; i++) {
                const px = startX + i * poleSpacing;
                ctx.beginPath();
                ctx.moveTo(px, ROAD_TOP);
                ctx.lineTo(px, ROAD_TOP - 150);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(px - 22, ROAD_TOP - 135);
                ctx.lineTo(px + 22, ROAD_TOP - 135);
                ctx.stroke();

                ctx.fillRect(px - 20, ROAD_TOP - 142, 5, 8);
                ctx.fillRect(px + 15, ROAD_TOP - 142, 5, 8);

                ctx.beginPath();
                ctx.moveTo(px + 22, ROAD_TOP - 135);
                ctx.quadraticCurveTo(px + poleSpacing * 0.5, ROAD_TOP - 110, px + poleSpacing - 22, ROAD_TOP - 135);
                ctx.stroke();
            }
        }

        // 3D Perspective Road Track Marks
        const NUM_DASHES = 24;
        function draw3DRoad() {
            // Road Bed
            const roadGrad = ctx.createLinearGradient(0, ROAD_TOP, 0, V_HEIGHT);
            roadGrad.addColorStop(0, currentLevel.roadColor);
            roadGrad.addColorStop(1, currentLevel.groundColor);
            ctx.fillStyle = roadGrad;
            ctx.fillRect(0, ROAD_TOP, V_WIDTH, V_HEIGHT - ROAD_TOP);

            // Upper 3D Road Border Curb
            ctx.strokeStyle = currentLevel.roadBorder;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, ROAD_TOP);
            ctx.lineTo(V_WIDTH, ROAD_TOP);
            ctx.stroke();

            // Ground baseline where feet touch
            ctx.strokeStyle = currentLevel.roadBorder;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, GROUND_Y);
            ctx.lineTo(V_WIDTH, GROUND_Y);
            ctx.stroke();

            // Perspective Scrolling Road Markings (3D effect)
            ctx.fillStyle = currentLevel.roadLine;
            const dashSpacing = 75;
            const dashW = 34;
            const startX = -(roadOffset % dashSpacing);
            const count = Math.ceil(V_WIDTH / dashSpacing) + 2;

            for (let i = 0; i < count; i++) {
                const dx = startX + i * dashSpacing;
                // Upper fast perspective dash
                ctx.fillRect(dx, ROAD_TOP + 6, dashW * 0.6, 2.5);
                // Lower ground dash
                ctx.fillRect(dx + 10, GROUND_Y + 12, dashW, 3.5);
                // Subtle roadside pebbles in perspective
                if (i % 3 === 0) {
                    ctx.fillRect(dx + 30, GROUND_Y + 28, 6, 3);
                }
            }
        }

        function updateEnvironment() {
            mountainOffset += gameSpeed * 0.12;
            duneOffset += gameSpeed * 0.32;
            poleOffset += gameSpeed * 0.75;
            roadOffset = (roadOffset + gameSpeed) % V_WIDTH;
        }

        // ==========================================
        // OBSTACLES (GROUND & FLYING FACES)
        // ==========================================
        let obstacles = [];
        let nextObstacleDistance = 300;

        const GROUND_OBSTACLE_SIZES = [
            { w: 74, h: 96 },
            { w: 78, h: 102 },
            { w: 72, h: 92 },
            { w: 80, h: 106 }
        ];

        function spawnObstacle() {
            const canFly = currentLevel.pterodactyls && Math.random() < 0.35;

            if (canFly) {
                // Flying face obstacle heights:
                // High (run under safely): GROUND_Y - 170
                // Mid (duck / slide under): GROUND_Y - 110
                // Low (jump over): GROUND_Y - 55
                const heights = [ GROUND_Y - 55, GROUND_Y - 110, GROUND_Y - 170 ];
                const flyY = heights[Math.floor(Math.random() * heights.length)];
                const imgIdx = Math.floor(Math.random() * 4);
                obstacles.push({
                    kind: 'flying',
                    x: V_WIDTH + 40,
                    y: flyY,
                    w: 74,
                    h: 74,
                    imgIdx: imgIdx,
                    floatTimer: Math.random() * 10
                });
            } else {
                const config = GROUND_OBSTACLE_SIZES[Math.floor(Math.random() * GROUND_OBSTACLE_SIZES.length)];
                const imgIdx = Math.floor(Math.random() * 8);
                obstacles.push({
                    kind: 'cactus',
                    x: V_WIDTH + 40,
                    y: GROUND_Y,
                    w: config.w,
                    h: config.h,
                    imgIdx: imgIdx
                });
            }

            // Generous spacing: guarantee enough reaction time between obstacles
            const speedFactor = gameSpeed * 34;
            nextObstacleDistance = MIN_OBSTACLE_GAP + speedFactor + Math.random() * 320;
        }

        function updateObstacles() {
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x -= gameSpeed;

                if (checkCollision(bhai.getHitbox(), obs)) {
                    gameOver();
                    break;
                }

                if (obs.x + obs.w < -60) {
                    obstacles.splice(i, 1);
                }
            }

            nextObstacleDistance -= gameSpeed;
            if (nextObstacleDistance <= 0) {
                spawnObstacle();
            }
        }

        function drawPixelCactus(obs) {
            const x = obs.x;
            const y = obs.y;
            const w = obs.w;
            const h = obs.h;
            const img = obstacleImages[obs.imgIdx % 8];

            // 1. Ground contact shadow
            ctx.save();
            ctx.scale(1.0, 0.28);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(x + w / 2, y / 0.28, w * 0.58, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 2. Crisp, high-contrast framed card with full clarity
            const radius = 12;
            ctx.save();
            ctx.shadowColor = currentLevel.cactusColor;
            ctx.shadowBlur = 12;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.roundRect(x, y - h, w, h, radius);
            ctx.stroke();
            ctx.clip(); // Mask

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const drawn = drawImageCover(img, x, y - h, w, h);
            if (!drawn) {
                ctx.fillStyle = currentLevel.cactusColor;
                ctx.fillRect(x, y - h, w, h);
            }

            // Subtle dark bottom gradient for visual pop
            const grad = ctx.createLinearGradient(x, y - h, x, y);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.82, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.4)');
            ctx.fillStyle = grad;
            ctx.fillRect(x, y - h, w, h);

            ctx.restore();
        }

        function drawFlyingObstacle(obs) {
            const x = obs.x;
            const y = obs.y;
            const w = obs.w;
            const h = obs.h;
            const img = flyingImages[obs.imgIdx % 4];

            obs.floatTimer = (obs.floatTimer || 0) + 0.08;
            const floatBob = Math.sin(obs.floatTimer) * 4;
            const drawY = y + floatBob;

            // Ground shadow far below for altitude depth
            const altitude = GROUND_Y - drawY;
            if (altitude > 0) {
                ctx.save();
                ctx.scale(1.0, 0.25);
                const shadowAlpha = Math.max(0.08, 0.32 - altitude * 0.0012);
                ctx.fillStyle = 'rgba(0, 0, 0, ' + shadowAlpha + ')';
                ctx.beginPath();
                ctx.ellipse(x + w / 2, GROUND_Y / 0.25, (w * 0.5) * Math.max(0.4, 1 - altitude * 0.002), 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            ctx.save();
            const radius = 14;

            // Glowing flying card aura
            ctx.shadowColor = '#feca57';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#feca57';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.roundRect(x, drawY - h, w, h, radius);
            ctx.stroke();
            ctx.clip(); // Mask

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const drawn = drawImageCover(img, x, drawY - h, w, h);
            if (!drawn) {
                ctx.fillStyle = '#ff7675';
                ctx.fillRect(x, drawY - h, w, h);
            }

            ctx.restore();

            // Flying sparkle / wing thruster effect
            ctx.save();
            ctx.fillStyle = 'rgba(254, 202, 87, 0.8)';
            ctx.beginPath();
            ctx.arc(x + w + 5, drawY - h / 2, 4 + Math.sin(obs.floatTimer * 2) * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function drawObstacles() {
            obstacles.forEach(obs => {
                if (obs.kind === 'cactus') {
                    drawPixelCactus(obs);
                } else if (obs.kind === 'flying' || obs.kind === 'bird') {
                    drawFlyingObstacle(obs);
                }
            });
        }

        function checkCollision(player, obs) {
            let obsBox = {};
            if (obs.kind === 'cactus') {
                obsBox = {
                    x: obs.x + 8,
                    y: obs.y - obs.h + 8,
                    w: obs.w - 16,
                    h: obs.h - 10
                };
            } else if (obs.kind === 'flying' || obs.kind === 'bird') {
                const floatBob = obs.floatTimer ? Math.sin(obs.floatTimer) * 4 : 0;
                const actualY = obs.y + floatBob;
                obsBox = {
                    x: obs.x + 8,
                    y: actualY - obs.h + 8,
                    w: obs.w - 16,
                    h: obs.h - 14
                };
            }
            return (
                player.x < obsBox.x + obsBox.w &&
                player.x + player.w > obsBox.x &&
                player.y < obsBox.y + obsBox.h &&
                player.y + player.h > obsBox.y
            );
        }

        // ==========================================
        // MULTI-LEVEL LOGIC & HUD
        // ==========================================
        function updateLevelProgression() {
            const tick = gameSpeed * 0.05;
            distanceTraveled += tick;
            levelDistance += tick;
            totalScore = Math.floor(distanceTraveled);
            score = Math.floor(levelDistance);

            gameSpeed = currentLevel.baseSpeed + Math.min(totalScore * 0.003, 5.0);
            document.getElementById('speed-meter').textContent = 'SPEED: ' + gameSpeed.toFixed(1) + 'x';

            const currentGoal = currentLevel.goalDistance;

            // Trigger Level Complete: pause game and show completion screen
            if (score >= currentGoal && currentLevelIdx < LEVELS.length - 1) {
                const earnedCoins = currentLevel.coinReward + Math.floor(score * 0.1);
                coins += earnedCoins;
                totalCoins += earnedCoins;
                localStorage.setItem('bhai_dino_coins', totalCoins.toString());
                levelCompleteData = {
                    levelNum: currentLevel.level,
                    levelName: currentLevel.name,
                    distance: score,
                    coinsEarned: earnedCoins,
                    totalCoins: totalCoins,
                    nextLevelName: LEVELS[currentLevelIdx + 1].name,
                    nextLevelGoal: LEVELS[currentLevelIdx + 1].goalDistance,
                    animTimer: 0,
                    coinCountUp: 0
                };
                gameState = 'LEVEL_COMPLETE';
                stopAllLevelAudio();
                playBhaiOutAudio();
                return;
            }

            // Update Top Distance Bar
            updateDistanceBar();

            // Milestone Beep every 100m within the level
            if (score > 0 && score % 100 === 0 && score !== lastMilestone) {
                lastMilestone = score;
                milestoneFlashTimer = 35;
                playMilestoneSound();
            }
        }

        function updateDistanceBar() {
            const hudTitle = document.getElementById('hud-level-title');
            const hudFill = document.getElementById('hud-progress-fill');
            const hudText = document.getElementById('hud-progress-text');
            if (!hudTitle || !hudFill || !hudText) return;

            hudTitle.innerHTML = 'LEVEL ' + currentLevel.level + ' &bull; ' + currentLevel.name.toUpperCase();
            if (currentLevel.goalDistance !== Infinity) {
                const pct = Math.min(100, Math.floor((score / currentLevel.goalDistance) * 100));
                hudFill.style.width = pct + '%';
                hudText.textContent = score + 'm / ' + currentLevel.goalDistance + 'm (' + pct + '%) • TOTAL: ' + totalScore + 'm';
            } else {
                hudFill.style.width = '100%';
                hudText.textContent = score + 'm (ENDLESS) • TOTAL: ' + totalScore + 'm';
            }
        }

        function playCoinSound() {
            if (!soundEnabled) return;
            try {
                const actx = getAudioContext();
                const now = actx.currentTime;
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            } catch(e) {}
        }

        function drawLevelCompleteScreen() {
            if (!levelCompleteData) return;
            const d = levelCompleteData;
            d.animTimer++;

            // Animate coin count-up
            if (d.coinCountUp < d.coinsEarned) {
                d.coinCountUp += Math.max(1, Math.ceil(d.coinsEarned / 60));
                if (d.coinCountUp > d.coinsEarned) d.coinCountUp = d.coinsEarned;
                if (d.animTimer % 4 === 0) playCoinSound();
            }

            // Dim overlay
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, ' + Math.min(0.85, d.animTimer * 0.025) + ')';
            ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

            // Central card panel
            const cardW = 540;
            const cardH = 430;
            const cx = V_WIDTH / 2;
            const cy = V_HEIGHT / 2;
            const cardX = cx - cardW / 2;
            const cardY = cy - cardH / 2;

            // Panel background with smooth zoom-in scale
            const panelScale = Math.min(1, d.animTimer * 0.06);
            ctx.translate(cx, cy);
            ctx.scale(panelScale, panelScale);
            ctx.translate(-cx, -cy);

            // Glow behind card
            ctx.shadowColor = '#fbc531';
            ctx.shadowBlur = 40;
            ctx.fillStyle = '#16192b';
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 22);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Gold border
            ctx.strokeStyle = '#fbc531';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 22);
            ctx.stroke();

            // Inner shine gradient
            const shine = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
            shine.addColorStop(0, 'rgba(251, 197, 49, 0.15)');
            shine.addColorStop(0.35, 'rgba(251, 197, 49, 0.02)');
            shine.addColorStop(1, 'rgba(251, 197, 49, 0.08)');
            ctx.fillStyle = shine;
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 22);
            ctx.fill();

            // === VICTORY PHOTO (Allu Arjun Laughing) ===
            const photoW = 120;
            const photoH = 96;
            const photoX = cx - photoW / 2;
            const photoY = cardY + 20;

            ctx.save();
            ctx.shadowColor = '#fbc531';
            ctx.shadowBlur = 18;
            ctx.strokeStyle = '#fbc531';
            ctx.lineWidth = 3.5;

            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoW, photoH, 14);
            ctx.stroke();
            ctx.clip(); // Mask

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const drawnPhoto = drawImageCover(bhaiWinImg, photoX, photoY, photoW, photoH);
            if (!drawnPhoto) {
                ctx.fillStyle = '#fbc531';
                ctx.fillRect(photoX, photoY, photoW, photoH);
            }
            ctx.restore();

            // Gold Trophy badge overlay on the photo
            ctx.save();
            ctx.font = '28px system-ui, sans-serif';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 8;
            ctx.fillText('🏆', photoX + photoW - 6, photoY + photoH + 2);
            ctx.restore();

            ctx.textAlign = 'center';

            // "LEVEL X COMPLETED!" title
            ctx.font = '900 26px system-ui, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 8;
            ctx.fillText('LEVEL ' + d.levelNum + ' COMPLETED!', cx, cardY + 152);

            // Level name & meters cleared
            ctx.font = '700 15px system-ui, sans-serif';
            ctx.fillStyle = '#c8d6e5';
            ctx.shadowBlur = 0;
            ctx.fillText(d.levelName.toUpperCase() + '  —  ' + d.distance + 'm CLEARED 🔥', cx, cardY + 178);

            // Divider line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cardX + 50, cardY + 196);
            ctx.lineTo(cardX + cardW - 50, cardY + 196);
            ctx.stroke();

            // Coin icon and count-up
            ctx.font = '36px system-ui, sans-serif';
            ctx.fillText('🪙', cx - 75, cardY + 240);

            ctx.font = '900 30px system-ui, sans-serif';
            ctx.fillStyle = '#fbc531';
            ctx.textAlign = 'left';
            ctx.fillText('+' + d.coinCountUp, cx - 44, cardY + 238);

            ctx.font = '600 13px system-ui, sans-serif';
            ctx.fillStyle = '#a4b0be';
            ctx.fillText('COINS EARNED', cx - 44, cardY + 256);

            // Total coins
            ctx.textAlign = 'center';
            ctx.font = '700 15px system-ui, sans-serif';
            ctx.fillStyle = '#dfe4ea';
            ctx.fillText('💰 Total Coins: ' + d.totalCoins, cx, cardY + 288);

            // Next Level Info
            if (d.nextLevelGoal !== Infinity) {
                ctx.font = '600 13px system-ui, sans-serif';
                ctx.fillStyle = '#7ed6df';
                ctx.fillText('NEXT: ' + d.nextLevelName.toUpperCase() + '  —  ' + d.nextLevelGoal + 'm', cx, cardY + 314);
            }

            // "NEXT LEVEL" button (pulsing)
            const btnW = 240;
            const btnH = 46;
            const btnX = cx - btnW / 2;
            const btnY = cardY + cardH - 80;
            const pulse = 1.0 + Math.sin(d.animTimer * 0.08) * 0.03;

            ctx.save();
            ctx.translate(cx, btnY + btnH / 2);
            ctx.scale(pulse, pulse);
            ctx.translate(-cx, -(btnY + btnH / 2));

            const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
            btnGrad.addColorStop(0, '#ff9f43');
            btnGrad.addColorStop(1, '#ee5253');
            ctx.fillStyle = btnGrad;
            ctx.shadowColor = 'rgba(238, 82, 83, 0.6)';
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 14);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.font = '800 18px system-ui, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('▶  NEXT LEVEL', cx, btnY + 30);
            ctx.restore();

            // Hint text
            ctx.font = '500 12px system-ui, sans-serif';
            ctx.fillStyle = '#636e72';
            ctx.fillText('Press SPACE, ENTER, or TAP to continue', cx, cardY + cardH - 12);

            ctx.restore();
        }

        function goToNextLevel() {
            if (!levelCompleteData) return;
            stopBhaiOutAudio();
            currentLevelIdx++;
            currentLevel = LEVELS[currentLevelIdx];
            levelDistance = 0;
            score = 0;
            lastMilestone = 0;
            obstacles = [];
            particles = [];
            afterimages = [];
            nextObstacleDistance = 300;
            gameSpeed = currentLevel.baseSpeed;
            bhai.y = GROUND_Y;
            bhai.vy = 0;
            bhai.isGrounded = true;
            bhai.isDucking = false;
            levelCompleteData = null;
            levelUpBannerTimer = 140;
            levelUpBannerText = '🎉 LEVEL ' + currentLevel.level + ': ' + currentLevel.name.toUpperCase() + ' — GO!';
            gameState = 'PLAYING';
            document.getElementById('speed-meter').textContent = 'SPEED: ' + gameSpeed.toFixed(1) + 'x';
            updateDistanceBar();
            playJumpSound();
            playLevelAudio(currentLevelIdx, true);
        }

        function formatScore(num) {
            return num.toString().padStart(5, '0');
        }

        function drawHUD() {
            ctx.save();
            ctx.font = '800 20px system-ui, monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = 6;

            let hudText = 'HI ' + formatScore(highScore) + '   TOTAL ' + formatScore(totalScore) + 'm';
            ctx.fillText(hudText, V_WIDTH - 25, 42);

            // Coin display
            ctx.textAlign = 'right';
            ctx.font = '700 15px system-ui, sans-serif';
            ctx.fillStyle = '#fbc531';
            ctx.fillText('🪙 ' + totalCoins, V_WIDTH - 25, 65);

            // Level Up Celebration Banner
            if (levelUpBannerTimer > 0) {
                levelUpBannerTimer--;
                ctx.textAlign = 'center';
                ctx.font = '900 34px system-ui, sans-serif';
                ctx.fillStyle = '#fbc531';
                ctx.shadowColor = '#e84118';
                ctx.shadowBlur = 14;
                ctx.fillText(levelUpBannerText, V_WIDTH / 2, 130);
            }
            ctx.restore();
        }

        function drawStartScreen() {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = '900 32px system-ui, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = 10;
            ctx.fillText('PRESS SPACE OR TAP TO RUN!', V_WIDTH / 2, 180);

            ctx.font = '700 16px system-ui, sans-serif';
            ctx.fillStyle = '#dcdde1';
            ctx.fillText('Realistic 3D Sprinting • Clear distance to conquer all 8 desert worlds!', V_WIDTH / 2, 220);
            ctx.restore();
        }

        const MEME_QUOTES = [
            "THAGGEDHE LE! 🔥",
            "BHAI IS ON FIRE! 💥",
            "JHUKEGA NAHI SAALA! 👑",
            "AREEE BHAI... EK AUR BAAR! 🚀",
            "FIRE HAI BHAI! WILDFIRE! ⚡"
        ];

        function drawGameOverScreen() {
            const cx = V_WIDTH / 2;

            // Boss Out Photo Card
            const photoW = 112;
            const photoH = 136;
            const photoX = cx - photoW / 2;
            const photoY = 34;

            ctx.save();
            ctx.shadowColor = '#ff4757';
            ctx.shadowBlur = 18;
            ctx.strokeStyle = '#ff4757';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoW, photoH, 14);
            ctx.stroke();
            ctx.clip();

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            if (!drawImageCover(bossOutImg, photoX, photoY, photoW, photoH)) {
                ctx.fillStyle = '#2f3542';
                ctx.fillRect(photoX, photoY, photoW, photoH);
            }
            ctx.restore();

            ctx.save();
            ctx.textAlign = 'center';

            ctx.font = '900 36px system-ui, sans-serif';
            ctx.fillStyle = '#ff4757';
            ctx.shadowColor = 'rgba(0,0,0,0.95)';
            ctx.shadowBlur = 12;
            ctx.fillText('G A M E   O V E R', cx, 212);

            ctx.font = '800 22px system-ui, sans-serif';
            ctx.fillStyle = '#ffa502';
            ctx.fillText(bhai.memeText, cx, 248);

            ctx.font = '700 15px system-ui, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('PRESS SPACE, R, OR TAP TO RESTART', cx, 282);

            // Replay circular arrow icon
            const rx = cx;
            const ry = 324;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(rx, ry, 18, 0.4 * Math.PI, 1.8 * Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(rx + 15, ry - 20);
            ctx.lineTo(rx + 21, ry - 9);
            ctx.lineTo(rx + 10, ry - 12);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.restore();
        }

        function gameOver() {
            gameState = 'GAMEOVER';
            stopAllLevelAudio();
            playBossOutAudio();

            if (totalScore > highScore) {
                highScore = totalScore;
                localStorage.setItem('bhai_dino_hi_score', highScore.toString());
            }

            bhai.memeText = MEME_QUOTES[Math.floor(Math.random() * MEME_QUOTES.length)];
        }

        function startGame() {
            gameState = 'PLAYING';
            stopBhaiOutAudio();
            stopBossOutAudio();
            // Keep currentLevelIdx and currentLevel — restart from same level!
            // Only reset to Level 1 if called from the START screen (first play)
            score = 0;
            levelDistance = 0;
            levelCompleteData = null;
            lastMilestone = 0;
            gameSpeed = currentLevel.baseSpeed;
            obstacles = [];
            particles = [];
            afterimages = [];
            nextObstacleDistance = 300;
            bhai.y = GROUND_Y;
            bhai.vy = 0;
            bhai.isGrounded = true;
            bhai.isDucking = false;
            document.getElementById('speed-meter').textContent = 'SPEED: ' + gameSpeed.toFixed(1) + 'x';
            updateDistanceBar();
            playJumpSound();
            playLevelAudio(currentLevelIdx, true);
        }

        // Full restart from Level 1 (only when user explicitly presses RESTART button)
        function restartFromLevel1() {
            currentLevelIdx = 0;
            currentLevel = LEVELS[0];
            distanceTraveled = 0;
            totalScore = 0;
            coins = 0;
            startGame();
        }

        function gameLoop() {
            ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

            drawSkyAndAtmosphere();
            drawMountains();
            drawDunes();
            drawPoles();
            draw3DRoad();

            if (gameState === 'PLAYING') {
                updateLevelProgression();
                updateEnvironment();
                bhai.update();
                updateObstacles();
                updateParticles();
            } else if (gameState === 'START') {
                updateEnvironment();
                bhai.update();
                drawStartScreen();
            } else if (gameState === 'GAMEOVER') {
                drawGameOverScreen();
            }

            drawParticles();
            drawObstacles();
            bhai.draw();
            drawHUD();

            // Draw level complete overlay LAST (on top of everything)
            if (gameState === 'LEVEL_COMPLETE') {
                drawLevelCompleteScreen();
            }

            requestAnimationFrame(gameLoop);
        }

        // ==========================================
        // INPUT CONTROLS
        // ==========================================
        window.addEventListener('keydown', e => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                e.preventDefault();
                getAudioContext();
                if (gameState === 'LEVEL_COMPLETE') {
                    goToNextLevel();
                } else {
                    bhai.jump();
                }
            } else if (e.code === 'Enter') {
                e.preventDefault();
                getAudioContext();
                if (gameState === 'LEVEL_COMPLETE') {
                    goToNextLevel();
                }
            } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                e.preventDefault();
                getAudioContext();
                bhai.duck(true);
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                if (gameState !== 'LEVEL_COMPLETE') {
                    startGame();
                }
            }
        });

        window.addEventListener('keyup', e => {
            if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                e.preventDefault();
                bhai.duck(false);
            }
        });

        canvas.addEventListener('pointerdown', e => {
            e.preventDefault();
            getAudioContext();
            if (gameState === 'LEVEL_COMPLETE') {
                goToNextLevel();
            } else {
                bhai.jump();
            }
        });

        const mJump = document.getElementById('m-jump');
        const mDuck = document.getElementById('m-duck');

        mJump.addEventListener('pointerdown', e => {
            e.preventDefault();
            getAudioContext();
            if (gameState === 'LEVEL_COMPLETE') {
                goToNextLevel();
            } else {
                bhai.jump();
            }
        });

        mDuck.addEventListener('pointerdown', e => {
            e.preventDefault();
            getAudioContext();
            bhai.duck(true);
        });
        mDuck.addEventListener('pointerup', e => {
            e.preventDefault();
            bhai.duck(false);
        });
        mDuck.addEventListener('pointerleave', e => {
            bhai.duck(false);
        });

        document.getElementById('btn-sound').addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            document.getElementById('btn-sound').innerHTML = soundEnabled ? '&#128266; SOUND: ON' : '&#128263; SOUND: OFF';
            if (soundEnabled && gameState === 'PLAYING') {
                playLevelAudio(currentLevelIdx, false);
            } else {
                stopAllLevelAudio();
                stopBhaiOutAudio();
                stopBossOutAudio();
            }
        });

        document.getElementById('btn-fullscreen').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.getElementById('game-wrapper').requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            getAudioContext();
            restartFromLevel1();
        });

        // Start Loop immediately
        requestAnimationFrame(gameLoop);
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
console.log('Successfully generated index.html with authentic cutout and 3D running physics!');
