// ==========================================
// MAIN.JS - BROADCAST ESPORTS EDITION (FINAL VERSION)
// [TÍCH HỢP SẴN: LÕI RENDER DỰ PHÒNG CHỐNG ĐEN MÀN HÌNH, ANTI-CRASH]
// ==========================================

window.BGM_BASE_POOL = [
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/A_Slipping_Glimpse_-_Nihilore.mp3",
    "https://upload.wikimedia.org/wikipedia/commons/c/c2/The_Descent_-_Kevin_MacLeod.mp3",
    "https://upload.wikimedia.org/wikipedia/commons/3/3c/Gothic_Dark_Electronic_Music_-_Ominous.mp3" 
];

window.loadedCharacters = {}; 
window.enemyZ = 120; 
window.targetZ = 120; 

// ==========================================
// 🚀 HỆ THỐNG CỨU HỘ ĐỒ HỌA (CHỐNG ĐEN MÀN HÌNH)
// ==========================================

// 1. Hàm vẽ Map dự phòng (Tạo chiều sâu 3D)
window.drawMap = window.drawMap || function(cx, w, h) {
    cx.save();
    let cxX = window.camX || 0; let cxY = window.camY || 0;
    
    // Bầu trời
    let bgGrad = cx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#0f172a"); bgGrad.addColorStop(1, "#1e293b"); 
    cx.fillStyle = bgGrad; cx.fillRect(0, 0, w, h);
    
    // Mặt trăng
    cx.fillStyle = "rgba(255, 255, 200, 0.8)";
    cx.beginPath(); cx.arc(w/2 - cxX*0.1, 150 - cxY*0.1, 60, 0, Math.PI*2); cx.fill();
    
    // Bối cảnh thành phố phía sau
    let midOffset = cxX * 0.4; cx.fillStyle = "#020617";
    for(let i = -2; i < 5; i++) {
        let bHeight = 200 + Math.abs(Math.sin(i) * 150);
        cx.fillRect(i * 250 - midOffset + w/2, (window.GROUND_Y || 320) - bHeight - cxY * 0.4, 120, bHeight);
    }
    
    // Mặt sàn đấu 3D
    let floorGrad = cx.createLinearGradient(0, (window.GROUND_Y || 320), 0, h);
    floorGrad.addColorStop(0, "#111"); floorGrad.addColorStop(1, "#333");
    cx.fillStyle = floorGrad; cx.fillRect(-w, (window.GROUND_Y || 320) - cxY, w * 3, h);
    cx.restore();
};

// Ép lõi engine.js dùng drawMap thay vì tô màu đen
window.drawBoxingRing = window.drawMap;

// 2. Hàm vẽ Kẻ địch dự phòng (Chống tàng hình nhân vật)
if (typeof window.drawStickman !== 'function') {
    window.drawStickman = function(ctx, charObj) {
        ctx.save();
        ctx.fillStyle = charObj.color || "#ff003c";
        
        // Vẽ đầu (Avatar nếu có, không thì hình tròn)
        if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
            ctx.drawImage(window.enemyFaceImg, -35, -130, 70, 70);
        } else {
            ctx.beginPath(); ctx.arc(0, -95, 30, 0, Math.PI * 2); ctx.fill();
        }
        
        // Thân, Vai, Chân
        ctx.fillRect(-15, -60, 30, 60); // Thân
        ctx.fillRect(-45, -60, 90, 15); // Vai ngang
        ctx.fillRect(-20, 0, 15, 50); // Chân trái
        ctx.fillRect(5, 0, 15, 50);   // Chân phải
        
        // Găng tay
        if (window.enemyGloveImg && window.enemyGloveImg.complete && window.enemyGloveImg.naturalWidth > 0) {
            ctx.drawImage(window.enemyGloveImg, -60, -70, 30, 30);
            ctx.drawImage(window.enemyGloveImg, 30, -70, 30, 30);
        }
        ctx.restore();
    };
}

// ==========================================
// 🚀 LÕI BẢO VỆ VÀ THIẾT LẬP GAME
// ==========================================

window.gameLoopFPS = window.gameLoopFPS || function(timestamp) {
    if (!window.isLoopRunning) return;
    requestAnimationFrame(window.gameLoopFPS);
    if (!timestamp) timestamp = performance.now();
    if (!window.lastFrameTime) window.lastFrameTime = timestamp;
    
    let deltaTime = timestamp - window.lastFrameTime;
    if (deltaTime >= 16) { 
        window.lastFrameTime = timestamp - (deltaTime % 16);
        try { if (typeof window.update === 'function') window.update(); } catch(e) {}
        try { if (typeof window.draw === 'function') window.draw(); } catch(e) {}
    }
};

window.announce = function(text, pitch = 0.8) {
    try {
        if (window.isMuted) return;
        speechSynthesis.cancel();
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-US'; msg.rate = 1.3; msg.pitch = pitch; msg.volume = 0.9;
        speechSynthesis.speak(msg);
    } catch(e) {}
};

window.loadCharacterDynamic = function(charId) {
    return new Promise((resolve) => {
        if (window.classStats && window.classStats[charId]) {
            window.loadedCharacters[charId] = window.classStats[charId];
            return resolve(window.classStats[charId]);
        }
        resolve(null);
    });
};

window.initGame = async function() {
    if (!window.classStats) window.classStats = {};
    for (let id in window.classStats) {
        if (!window.classStats[id].hp) window.classStats[id].hp = 1000;
        if (!window.classStats[id].speed) window.classStats[id].speed = 5;
    }
    window.renderCharacterGrid(); 
}

window.renderCharacterGrid = function() {
    const carousel = document.getElementById("character-carousel"); 
    if(!carousel) return; carousel.innerHTML = ""; 
    let firstCardId = null;
    
    for (let id in window.classStats) {
        let item = window.classStats[id]; 
        let card = document.createElement("div"); 
        card.className = "char-card"; 
        card.innerHTML = `<div class="char-avatar"><img src="${item.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/png?seed=error'}"></div><div class="char-name">${item.className || 'Unknown'}</div>`;
        
        card.onclick = async () => { 
            window.selectedRedClass = id; 
            document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected')); 
            card.classList.add('selected'); 
            
            if(typeof window.playSound === 'function') window.playSound(600, 'square', 0.1, 0.4);
            
            let desc = document.getElementById("desc-red");
            await window.loadCharacterDynamic(id);
            let activeItem = window.classStats[id];
            
            window.enemyFaceImg = new Image(); window.enemyFaceImg.crossOrigin = "Anonymous"; window.enemyFaceImg.src = activeItem.avatarUrl || "";
            let defaultGlove = 'https://cdn-icons-png.flaticon.com/512/2950/2950586.png';
            window.enemyGloveImg = new Image(); window.enemyGloveImg.crossOrigin = "Anonymous"; window.enemyGloveImg.src = activeItem.gloveUrl || defaultGlove;

            if(desc) desc.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:6px; text-align: left; animation: fadeIn 0.3s ease; max-height: 100%; overflow-y: auto; padding-right: 5px; padding-bottom: 5px;">
                    <span style="font-size:28px; color:${activeItem.color || '#f1c40f'}; font-weight:900; text-transform: uppercase; text-shadow: 0 0 10px ${activeItem.color || '#f1c40f'}; margin-bottom: 2px;">${activeItem.className || 'Unknown'}</span>
                    <span style="color:#fff; font-size:16px;">❤️ Sinh Lực: <strong style="color:#ff4757;">${activeItem.hp || 1000}</strong></span>
                    <span style="color:#fff; font-size:16px;">💨 Tốc Độ: <strong style="color:#3498db;">${activeItem.speed || 5}</strong></span>
                    <span style="color:#fff; font-size:16px;">✨ Sức Mạnh: <strong style="color:#f1c40f;">${(activeItem.dmgMod || 1) * 100}%</strong></span>
                    <span style="color:#00f3ff; font-size:13px; font-weight: bold; margin-top: 5px; background: rgba(0, 243, 255, 0.1); padding: 5px 8px; border-radius: 5px; border-left: 4px solid #00f3ff; display: inline-block;">🤖 AI AUTO-BATTLER READY</span>
                </div>`; 
            
            window.startPreviewLoop(activeItem);
        };
        carousel.appendChild(card); 
        if (!firstCardId) { firstCardId = id; }
    }
    if(!window.selectedRedClass && firstCardId) { 
        let firstCard = carousel.querySelector(`.char-card`); 
        if(firstCard) firstCard.click(); 
    }
}

// ==========================================
// 2. CHUYỂN CẢNH KỊCH TÍNH (CINEMATIC VS SCREEN)
// ==========================================
window.backToMenu = function() { 
    if (typeof window.stopRecording === 'function') try { window.stopRecording(); } catch(e){}
    let game = document.getElementById("game-screen"); if(game) game.style.display = "none"; 
    let sel = document.getElementById("selection-screen"); if(sel) sel.style.display = "block"; 
    window.gameOver = true; window.isLoopRunning = false; 
    if(window.selectedRedClass && window.classStats) window.startPreviewLoop(window.classStats[window.selectedRedClass]);
}

window.startGame = async function() { 
    if(!window.selectedRedClass) return;
    window.isPreviewRunning = false; 
    if (window.previewAnimId) cancelAnimationFrame(window.previewAnimId);
    
    let allKeys = Object.keys(window.classStats || {});
    let randomEnemyId = allKeys.length > 0 ? allKeys[Math.floor(Math.random() * allKeys.length)] : "default";
    await window.loadCharacterDynamic(randomEnemyId);
    
    let eChar = (window.classStats && window.classStats[randomEnemyId]) ? window.classStats[randomEnemyId] : { className: 'Unknown', color: '#ff003c' }; 
    let mChar = (window.classStats && window.classStats[window.selectedRedClass]) ? window.classStats[window.selectedRedClass] : { className: 'Player', color: '#00f3ff' };

    let eName = (eChar.className || 'Unknown').toUpperCase();
    let mName = (mChar.className || 'Player').toUpperCase();

    let sel = document.getElementById("selection-screen"); if(sel) sel.style.display = "none"; 
    let game = document.getElementById("game-screen"); 
    if(game) { game.style.display = "block"; game.style.position = "relative"; }

    let vsDiv = document.createElement("div");
    vsDiv.id = "vs-screen-overlay";
    vsDiv.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 99999; background: #000; display: flex; overflow: hidden;`;
    vsDiv.innerHTML = `
        <div style="flex:1; background: ${mChar.color || '#00f3ff'}; transform: skewX(-15deg) scale(1.2); display: flex; justify-content: flex-end; align-items: center; padding-right: 15%; animation: slideRight 0.4s ease forwards;">
            <h1 style="color: #fff; font-size: 55px; font-family: 'Impact'; font-style: italic; transform: skewX(15deg); text-shadow: 0 5px 15px rgba(0,0,0,0.8);">${mName}</h1>
        </div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
            <h1 style="color: #fff; font-size: 80px; font-family: 'Impact'; font-style: italic; text-shadow: 0 0 30px #000; animation: pulse 0.5s infinite alternate;">VS</h1>
        </div>
        <div style="flex:1; background: ${eChar.color || '#ff003c'}; transform: skewX(-15deg) scale(1.2); display: flex; justify-content: flex-start; align-items: center; padding-left: 15%; animation: slideLeft 0.4s ease forwards;">
            <h1 style="color: #fff; font-size: 55px; font-family: 'Impact'; font-style: italic; transform: skewX(15deg); text-shadow: 0 5px 15px rgba(0,0,0,0.8);">${eName}</h1>
        </div>
        <style>
            @keyframes slideRight { from { transform: skewX(-15deg) scale(1.2) translateX(-100%); } to { transform: skewX(-15deg) scale(1.2) translateX(0); } }
            @keyframes slideLeft { from { transform: skewX(-15deg) scale(1.2) translateX(100%); } to { transform: skewX(-15deg) scale(1.2) translateX(0); } }
            @keyframes pulse { from { transform: translate(-50%, -50%) scale(1); } to { transform: translate(-50%, -50%) scale(1.2); } }
        </style>
    `;
    
    if (game) game.appendChild(vsDiv); else document.body.appendChild(vsDiv);
    if(typeof window.playSound === 'function') window.playSound(150, 'sawtooth', 1.0, 0.8, true);
    window.announce("Get Ready for the Next Battle!", 0.9);

    setTimeout(() => {
        try {
            if (vsDiv) {
                vsDiv.style.opacity = 0; vsDiv.style.transition = "opacity 0.3s";
                setTimeout(() => vsDiv.remove(), 300);
            }
            if (window.bgmBase) { window.bgmBase.pause(); }
            window.bgmBase = new Audio(window.BGM_BASE_POOL[Math.floor(Math.random() * window.BGM_BASE_POOL.length)]);
            window.bgmBase.loop = true; window.bgmBase.volume = 0.3; window.bgmBase.play().catch(e=>{});
        } catch(e) {}
    }, 1500);

    try { await window.matchStartFPS(randomEnemyId); } catch(err) {}
    
    window.isLoopRunning = true; 
    requestAnimationFrame(window.gameLoopFPS); 
}

window.matchStartFPS = async function(randomEnemyId) {
    window.gameOver = false; window.matchResolved = false; 
    window.enemyZ = 120; window.targetZ = 120; 
    window.camX = 0; window.camY = 0; window.cameraTilt = 0; window.camZoom = 1.0;
    
    window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, rage: 0, combo: 0, isDodging: false, isBlocking: false, attackCooldown: 0, parryInvuln: 0, guardBreakTimer: 0, clutchUsed: false, clutchActive: false, moveTimer: 0, dodgeTimer: 0, aiStateTimer: 0 };
    
    window.floatingTexts = []; window.particles = []; window.shockwaves = []; window.screenBlood = []; 
    window.bloodPools = []; window.floorSplatters = []; window.glassShards = []; window.debris = [];
    window.speechBubbles = []; window.weatherParticles = []; 
    
    window.uiCache = { h1: null, h2: null, initialized: false };
    window.lastUI = { h1: "", h2: "" };

    window.damageFlashAlpha = 0; window.perfectDodgeFlash = 0; window.hitZoomTimer = 0; 
    window.clutchFlashTimer = 0; window.fatalBlowFlash = 0; window.blackoutTimer = 0; window.parryShieldRadius = 0;
    window.speedLinesAlpha = 0; window.heartbeatPhase = 0; window.whiteFlashAlpha = 0; window.clashStruggleTimer = 0; window.destructiveFinishTimer = 0;
    window.koGlitchTimer = 0;

    let crack = document.getElementById("screen-crack"); if(crack) crack.style.opacity = 0;
    
    if (window.MAPS && window.MAPS.length > 0) {
        window.currentMap = window.MAPS[Math.floor(Math.random() * window.MAPS.length)];
        window.currentWeather = window.currentMap.weather || 'none';
        let ptCount = (window.currentWeather === 'none') ? 0 : 150; 
        for(let i=0; i<ptCount; i++) { window.weatherParticles.push({ x: Math.random() * 800, y: Math.random() * 500, speed: (window.currentWeather === 'rain') ? 12 + Math.random() * 10 : 2 + Math.random() * 3, size: Math.random() * 3 + 1, ang: Math.random() * Math.PI * 2 }); }
    }

    let s2 = (window.classStats && window.classStats[randomEnemyId]) ? window.classStats[randomEnemyId] : { className: "Enemy", hp: 1000, speed: 5 }; 
    let eHp = s2.hp || 1000;
    
    window.enemies = [{ 
        id: "enemy_fps", classId: randomEnemyId, isPlayer: false, x: 400, y: window.GROUND_Y || 320, 
        vx: 0, vy: 0, speed: s2.speed || 5, color: s2.color || "#ff003c", hp: eHp, maxHp: eHp, dmgMod: s2.dmgMod || 1, scale: s2.scale || 1, 
        onGround: true, isFacingRight: false, state: 'idle', attackTimer: 0, hitStun: 0, bounceCount: 0,
        className: s2.className || "Enemy", avatarUrl: s2.avatarUrl || "", drawMethod: s2.drawMethod,
        bodyType: s2.bodyType, isShirtless: s2.isShirtless, skinColor: s2.skinColor, hasTattoos: s2.hasTattoos, jerseyColor: s2.jerseyColor, jerseyNumber: s2.jerseyNumber, pantsType: s2.pantsType, pantsColor: s2.pantsColor, shortsColor: s2.shortsColor, socksColor: s2.socksColor, shoesColor: s2.shoesColor, auraType: s2.auraType, glowingEyes: s2.glowingEyes, hasHeadband: s2.hasHeadband, hasChampBelt: s2.hasChampBelt, beltText: s2.beltText
    }];
    
    let myChar = (window.classStats && window.classStats[window.selectedRedClass]) ? window.classStats[window.selectedRedClass] : { className: "Player", color: "#00f3ff" };
    let myColor = myChar.color || "#ff003c";
    let defaultGlove = 'https://cdn-icons-png.flaticon.com/512/2950/2950586.png'; 
    let myGloveUrl = myChar.gloveUrl || defaultGlove;
    
    let leftGloveEl = document.getElementById('left-glove');
    let rightGloveEl = document.getElementById('right-glove');
    if (leftGloveEl && rightGloveEl) {
        leftGloveEl.style.backgroundImage = `url('${myGloveUrl}')`;
        rightGloveEl.style.backgroundImage = `url('${myGloveUrl}')`;
        leftGloveEl.style.filter = `drop-shadow(0 25px 20px ${myColor})`;
        rightGloveEl.style.filter = `drop-shadow(0 25px 20px ${myColor})`;
    }

    window.enemyFaceImg = new Image(); window.enemyFaceImg.crossOrigin = "Anonymous"; window.enemyFaceImg.src = s2.avatarUrl || ""; 
    window.enemyGloveImg = new Image(); window.enemyGloveImg.crossOrigin = "Anonymous"; window.enemyGloveImg.src = s2.gloveUrl || defaultGlove;

    let nb = document.getElementById("name-display-blue"); if(nb) nb.innerText = "🤖 " + (s2.className || "Enemy");
    let nR = document.getElementById("name-display-red"); if(nR) nR.innerText = "👤 " + (myChar.className || "Player"); 
    let h1 = document.getElementById("hp-red"), h2 = document.getElementById("hp-blue"); if(h1) h1.style.width = "100%"; if(h2) h2.style.width = "100%";
    
    window.introTimer = 120;
    setTimeout(() => { window.announce("FIGHT!", 0.8); }, 2000); 

    if (typeof window.startRecording === 'function') {
        try { window.startRecording(); } catch(e) {}
    }
}

// ==========================================
// 3. ĐỒNG BỘ ACTION VỚI LÕI VẬT LÝ HỦY DIỆT
// ==========================================

window.moveFPS = function(dir) {
    if (window.playerFPS.stamina < 5 || window.gameOver || window.playerFPS.isDodging || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return;
    window.playerFPS.stamina -= 5; window.targetZ += dir * 45; window.targetZ = Math.max(30, Math.min(220, window.targetZ)); 
    window.playerFPS.moveTimer = 25; window.playSound(200, 'sine', 0.1, 0.2);
};

window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isBlocking || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return;
    window.playerFPS.attackCooldown = 15; window.playerFPS.stamina -= 10; 
    if (window.playerFPS.rage === undefined) window.playerFPS.rage = 0; if (window.playerFPS.combo === undefined) window.playerFPS.combo = 0; 

    let glove = document.getElementById(hand + "-glove");
    if(glove) { glove.classList.add(`glove-punch-${hand}`); setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150); }

    let e = window.enemies[0];
    if (e && e.hp > 0 && window.enemyZ <= 90) { 
        let isPerfectCounter = window.playerFPS.perfectDodgeBuff; window.playerFPS.perfectDodgeBuff = false; 

        if (e.attackTimer > 5 && e.attackTimer < 18 && !isPerfectCounter && window.playerFPS.rage < 100) {
            window.clashStruggleTimer = 45; e.attackTimer = 0; window.playerFPS.attackCooldown = 45; window.whiteFlashAlpha = 0.8; 
            window.targetZ += 50; window.enemyZ += 30; window.cameraTilt = (Math.random() > 0.5 ? 0.3 : -0.3); 
            window.shakeScreen(45, 30); window.playSound(100, 'square', 0.8, 1.0, true);
            window.hitZoomTimer = 45; window.fatalBlowFlash = 6; 
            if(window.shockwaves) window.shockwaves.push({ x: 400, y: 300, radius: 20, maxRadius: 600, alpha: 1, speed: 20, thickness: 15, color: "#fff" });
            if(window.spawnDamageNumber) window.spawnDamageNumber(400, 200, "⚔️ POWER STRUGGLE! ⚔️", "#ffffff", true);
            window.spawnParticles(400, 150, "#f1c40f", true);
            if(window.spawnDebris) window.spawnDebris(400, window.GROUND_Y || 320, 20);
            return; 
        }

        if (e.attackTimer <= 0 && e.hitStun <= 0 && (!e.dodgeTimer || e.dodgeTimer <= 0) && window.playerFPS.rage < 100 && !isPerfectCounter) {
            let defenseRoll = Math.random();
            if (defenseRoll < 0.25) { 
                window.playerFPS.combo = 0; window.playerFPS.stamina -= 15; window.floatingTexts.push({ x: e.x, y: 150, text: "💨 SLIP!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "italic 900 30px Arial", life: 30 });
                e.dodgeDir = Math.random() > 0.5 ? 1 : -1; e.dodgeTimer = 35; e.baseTargetX = e.x; 
                if (Math.random() < 0.70) { setTimeout(() => { if (e.hp > 0 && !window.gameOver && e.guardBreakTimer <= 0) { e.state = ['hook', 'uppercut'][Math.floor(Math.random()*2)]; e.attackTimer = 20; window.targetZ -= 25; window.floatingTexts.push({ x: e.x, y: 180, text: "⚡ COUNTER!", color: "#ff4757", alpha: 1, vx: 0, vy: -2, font: "italic 900 28px Arial", life: 30 }); } }, 150); } return; 
            } else if (defenseRoll < 0.55) { 
                window.playerFPS.combo = 0; window.playSound(600, 'triangle', 0.2, 0.4, true); window.targetZ += 8; e.hp -= 2; window.playerFPS.rage += 5; 
                e.guardHealth = (e.guardHealth || 100) - 35; 
                if (e.guardHealth <= 0) { e.guardBreakTimer = 60; e.guardHealth = 100; window.hitZoomTimer = 15; window.whiteFlashAlpha = 0.6; if(window.spawnDamageNumber) window.spawnDamageNumber(e.x, 150, "💔 GUARD BREAK!", "#ff9f43", true); window.shakeScreen(15, 10); window.announce("Guard Broken!"); } 
                else { window.floatingTexts.push({ x: e.x, y: 150, text: "🛡️ BLOCK!", color: "#3498db", alpha: 1, vx: 0, vy: -1, font: "900 30px Arial", life: 30 }); }
                return; 
            }
        }

        window.playerFPS.combo++; let comboMult = 1 + (window.playerFPS.combo * 0.15); 
        let isRagePunch = window.playerFPS.rage >= 100; let isCrit = Math.random() < 0.25 || isRagePunch || isPerfectCounter; 
        let dmg = 40 * comboMult; let punchColor = window.playerFPS.combo >= 4 ? "#ff9f43" : "#fff";

        if (isRagePunch) { 
            dmg = 150 * comboMult; window.playerFPS.rage = 0; punchColor = "#f1c40f"; 
            window.targetZ += 60; window.enemyZ += 40; e.targetLean = (Math.random() - 0.5) * 0.8; 
            window.hitZoomTimer = 40; window.speedLinesAlpha = 1.0; window.blackoutTimer = 25; window.cameraTilt = (Math.random() > 0.5 ? 0.3 : -0.3); 
            if(window.spawnDamageNumber) window.spawnDamageNumber(400, 180, "🔥 MEGA SMASH! 🔥", "#f1c40f", true); 
            window.playSound(180, 'sawtooth', 0.6, 0.8, true); if(window.shockwaves) window.shockwaves.push({ x: 400, y: 300, radius: 30, maxRadius: 1000, alpha: 1, speed: 30, thickness: 35, color: "#f1c40f" }); 
            if(window.spawnDebris) window.spawnDebris(e.x, window.GROUND_Y || 320, 40); 
            window.announce("Ultimate Smash!", 0.7); 
        } 
        else if (isPerfectCounter) { dmg = 100 * comboMult; punchColor = "#00f3ff"; window.targetZ += 30; window.hitZoomTimer = 15; window.whiteFlashAlpha = 0.6; window.cameraTilt = 0.15; if(window.spawnDamageNumber) window.spawnDamageNumber(400, 180, "⚔️ TRỪNG PHẠT! ⚔️", "#00f3ff", true); } 
        else { window.playerFPS.rage = Math.min(100, window.playerFPS.rage + 15); if (isCrit) { dmg = Math.floor(dmg * 1.8); punchColor = "#ff4757"; window.hitZoomTimer = 10; window.whiteFlashAlpha = 0.4; window.cameraTilt = (Math.random() > 0.5 ? 0.1 : -0.1); } }

        if (window.playerFPS.clutchActive) dmg = Math.floor(dmg * 1.4);
        window.targetZ += (isCrit ? 30 : 10); 
        if (window.targetZ >= 200 && !isRagePunch) { window.targetZ -= 80; e.vy = -6; e.hitStun += 35; dmg = Math.floor(dmg * 1.5); if(window.spawnDamageNumber) window.spawnDamageNumber(e.x, 130, "💢 BẬT DÂY ĐÀI!", "#ff4d4d", true); window.shakeScreen(25, 20); window.playSound(250, 'triangle', 0.4, 0.8, true); }

        e.hp -= dmg;
        if (isCrit || isRagePunch) { if(window.floorSplatters) window.floorSplatters.push({ x: e.x + (Math.random()-0.5)*150, z: window.enemyZ + (Math.random()-0.5)*50, size: 5 + Math.random()*15, color: "rgba(180, 0, 0, 0.6)" }); }

        if (e.hp <= 0) {
            if (!window.handleAnimeComeback || !window.handleAnimeComeback(e, false)) { 
                if(window.triggerFatality) window.triggerFatality(e, isRagePunch); 
                window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, "rgba(220, 0, 0, 0.9)", true); 
                if(window.spawnScreenBlood) window.spawnScreenBlood(); 
                window.announce("K.O!", 0.6); 
            }
        } else {
            if (isCrit || isRagePunch || isPerfectCounter) { e.state = 'hurt'; e.hitStun = isRagePunch ? 45 : 25; e.attackTimer = 0; e.guardBreakTimer = 0; if (isCrit && window.spawnScreenBlood) window.spawnScreenBlood(); } else { if (e.attackTimer <= 0) { e.state = 'hurt'; e.hitStun = 10; } }
            let hitStopDuration = isRagePunch ? 180 : (isCrit || isPerfectCounter ? 80 : 0);
            if (hitStopDuration > 0) { window.isLoopRunning = false; setTimeout(() => { if(!window.gameOver) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } }, hitStopDuration); }
            window.shakeScreen(isCrit ? 22 : 8, isCrit ? 15 : 5); window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, punchColor, isCrit);
            
            if (window.playerFPS.combo > 1 && window.spawnDamageNumber) {
                let comboRank = "NICE!"; let fontSize = 35;
                if (window.playerFPS.combo === 3) { comboRank = "🔥 AWESOME!"; fontSize = 42; window.announce("Awesome!"); }
                if (window.playerFPS.combo === 5) { comboRank = "⚡ UNSTOPPABLE!"; fontSize = 50; punchColor = "#00f3ff"; window.announce("Unstoppable!"); }
                if (window.playerFPS.combo === 7) { comboRank = "👑 GODLIKE!!!"; fontSize = 65; punchColor = "#f1c40f"; window.shakeScreen(8, 8); window.announce("Godlike!", 0.7); }
                window.spawnDamageNumber(250 + Math.random()*20, 250 + Math.random()*20, `${comboRank} (x${window.playerFPS.combo})`, punchColor, window.playerFPS.combo >= 5);
            }
            if(window.spawnDamageNumber) window.spawnDamageNumber(e.x + (Math.random()*40-20), e.y - 120, isRagePunch ? `💥💥 -${Math.floor(dmg)}` : (isCrit ? `💥 -${Math.floor(dmg)}` : `-${Math.floor(dmg)}`), punchColor, isCrit);
        }
    } else { window.playerFPS.combo = 0; window.playerFPS.stamina -= 12; window.floatingTexts.push({ x: window.canvas.width/2 + (hand==='left'? -80:80), y: window.canvas.height/2, text: "MISS!", color: "#7f8c8d", alpha: 1, vx: 0, vy: -1, font: "bold 25px Arial", life: 25 }); }
};

window.blockFPS = function() { 
    if (window.playerFPS.stamina <= 0 || window.gameOver || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return; 

    let e = window.enemies[0]; let isParry = (e && e.attackTimer > 5 && e.attackTimer < 18);
    window.playerFPS.isBlocking = true; document.getElementById("left-glove").classList.add("glove-block-left"); document.getElementById("right-glove").classList.add("glove-block-right"); 

    if (isParry) {
        window.playSound(700, 'triangle', 0.4, 0.9, true); window.shakeScreen(20, 15); window.whiteFlashAlpha = 0.8; window.hitZoomTimer = 15;
        window.playerFPS.rage = Math.min(100, window.playerFPS.rage + 25); 
        window.parryShieldRadius = 150; 
        if(window.spawnDamageNumber) window.spawnDamageNumber(400, window.canvas.height/2 + 50, "🛡️ PERFECT PARRY! 🛡️", "#f1c40f", true);
        window.spawnParticles(400, 300, "#f1c40f", true); if(window.shockwaves) window.shockwaves.push({ x: 400, y: 300, radius: 10, maxRadius: 400, alpha: 1, speed: 20, thickness: 10, color: "#f1c40f" });
        e.attackTimer = 0; e.hitStun = 30; window.playerFPS.parryInvuln = 10; 
        window.announce("Perfect!", 1.2);
    }

    const releaseBlock = () => { window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); document.removeEventListener('mouseup', releaseBlock); document.removeEventListener('touchend', releaseBlock); }; 
    document.addEventListener('mouseup', releaseBlock); document.addEventListener('touchend', releaseBlock); 
};

window.dodgeFPS = function() { 
    if (window.playerFPS.stamina < 20 || window.playerFPS.isDodging || window.gameOver || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return; 
    let e = window.enemies[0]; let isPerfect = (e && e.attackTimer > 5 && e.attackTimer < 20); 
    window.playerFPS.isDodging = true; window.playerFPS.iFrames = isPerfect ? 50 : 30; window.playerFPS.stamina -= (isPerfect ? 0 : 20); window.playerFPS.dodgeDir = Math.random() > 0.5 ? 1 : -1; window.playerFPS.dodgeTimer = isPerfect ? 45 : 35; 
    if (isPerfect) { 
        window.perfectDodgeFlash = 1.0; window.speedLinesAlpha = 1.0; window.playerFPS.perfectDodgeBuff = true; window.playSound(800, 'sine', 0.5, 0.6); 
        if(window.spawnDamageNumber) window.spawnDamageNumber(400, window.canvas.height/2 + 80, "⚡ MATRIX DODGE! ⚡", "#00f3ff", true); 
        window.camZoom = 1.25; window.cameraTilt = window.playerFPS.dodgeDir * 0.4;
        e.attackTimer = 0; e.state = 'idle'; e.hitStun = 40; 
        window.announce("Dodge!", 1.5);
        window.isLoopRunning = false; setTimeout(() => { if(!window.gameOver) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } }, 300);
        setTimeout(() => { let counterHand = window.playerFPS.dodgeDir === 1 ? 'right' : 'left'; window.punch(counterHand); }, 450); 
    } else { window.playSound(200, 'sine', 0.2, 0.4); if (Math.random() < 0.75) { setTimeout(() => { let counterHand = window.playerFPS.dodgeDir === 1 ? 'right' : 'left'; window.punch(counterHand); }, 180); } } setTimeout(() => { window.playerFPS.isDodging = false; }, isPerfect ? 600 : 400); 
};

// ==========================================
// 4. HIỂN THỊ ANIMATION NHÂN VẬT CHỜ (LIVE 3D PARALLAX SHOWCASE)
// ==========================================
window.previewAnimId = null;
window.mouseX = 0; window.mouseY = 0;

document.addEventListener('mousemove', (e) => {
    window.mouseX = (e.clientX / window.innerWidth) * 2 - 1; 
    window.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

window.startPreviewLoop = function(charStats) {
    if (window.previewAnimId) cancelAnimationFrame(window.previewAnimId);
    window.isPreviewRunning = true;
    
    let pTime = 0; let curX = 0, curY = 0;

    const loop = () => {
        if (!window.isPreviewRunning) return;
        let pCanvas = document.getElementById("preview-canvas");
        if(pCanvas) {
            let pCtx = pCanvas.getContext("2d");
            pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
            pCtx.save();
            
            curX += (window.mouseX * 30 - curX) * 0.1;
            curY += (window.mouseY * 15 - curY) * 0.1;
            pCtx.translate(curX, curY);

            let matGrad = pCtx.createLinearGradient(0, pCanvas.height - 100, 0, pCanvas.height);
            matGrad.addColorStop(0, "#111820"); matGrad.addColorStop(1, "#05080c");
            pCtx.fillStyle = matGrad; pCtx.fillRect(-50, pCanvas.height - 100, pCanvas.width + 100, 100);
            
            pCtx.strokeStyle = "rgba(0, 243, 255, 0.5)"; pCtx.lineWidth = 2;
            pCtx.beginPath(); pCtx.moveTo(-50, pCanvas.height - 100); pCtx.lineTo(pCanvas.width + 100, pCanvas.height - 100); pCtx.stroke();

            if (charStats.auraType && charStats.auraType !== 'none') {
                let aColor = charStats.auraType === 'fire' ? "#ff4757" : (charStats.auraType === 'god' ? "#f1c40f" : "#00f3ff");
                let refGrad = pCtx.createRadialGradient(pCanvas.width/2 - curX*0.5, pCanvas.height - 60, 0, pCanvas.width/2 - curX*0.5, pCanvas.height - 60, 150);
                refGrad.addColorStop(0, `rgba(${window.hexToRgb?window.hexToRgb(aColor):'255,255,255'}, 0.4)`);
                refGrad.addColorStop(1, "rgba(0,0,0,0)");
                pCtx.fillStyle = refGrad; pCtx.beginPath(); pCtx.ellipse(pCanvas.width/2 - curX*0.5, pCanvas.height - 60, 150, 40, 0, 0, Math.PI*2); pCtx.fill();
            }

            let bounce = Math.sin(pTime * 0.05) * 5;
            pCtx.translate(pCanvas.width/2, pCanvas.height - 30 + bounce);
            pCtx.scale(1.2, 1.2); 
            
            let fakeChar = Object.assign({}, charStats, { 
                x: 0, y: 0, state: 'idle', isFacingRight: false, hp: 1000, maxHp: 1000 
            });
            
            if(pTime % 180 > 150) { 
                fakeChar.state = 'punch'; fakeChar.attackTimer = 15; 
                if (pTime % 180 === 151 && typeof window.playSound === 'function') {
                    window.playSound(200, 'sine', 0.1, 0.1); 
                }
            } 
            if(typeof window.drawStickman === 'function') window.drawStickman(pCtx, fakeChar);
            pCtx.restore();
        }
        pTime++;
        window.previewAnimId = requestAnimationFrame(loop);
    };
    loop();
}
