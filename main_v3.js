// ==========================================
// MAIN.JS - FIRST-PERSON BRAWLER EDITION
// [ĐÃ FIX LỖI: TỰ ĐỘNG LOAD MAP VÀ CĂN GIỮA CAMERA]
// ==========================================

window.BGM_BASE_POOL = [
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/A_Slipping_Glimpse_-_Nihilore.mp3",
    "https://upload.wikimedia.org/wikipedia/commons/c/c2/The_Descent_-_Kevin_MacLeod.mp3"
];

window.loadedCharacters = {}; 
window.enemyZ = 120; 
window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, isDodging: false, isBlocking: false, attackCooldown: 0 };
window.enemyFaceImg = new Image(); 

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
    const carousel = document.getElementById("character-carousel"); if(!carousel) return; carousel.innerHTML = ""; let firstCardId = null;
    
    for (let id in window.classStats) {
        let item = window.classStats[id]; let card = document.createElement("div"); card.className = "char-card"; 
        card.innerHTML = `<div class="char-avatar"><img src="${item.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/png?seed=error'}"></div><div class="char-name">${item.className || 'Unknown'}</div>`;
        
        card.onclick = async () => { 
            window.selectedRedClass = id; document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected')); card.classList.add('selected'); 
            let desc = document.getElementById("desc-red");
            await window.loadCharacterDynamic(id);
            let activeItem = window.classStats[id];
            
            // Tải ảnh khuôn mặt
            window.enemyFaceImg.crossOrigin = "Anonymous";
            window.enemyFaceImg.src = activeItem.avatarUrl;

            if(desc) desc.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px; text-align: left;">
                    <span style="font-size:24px; color:#f1c40f; font-weight:900; text-transform: uppercase;">${activeItem.className}</span>
                    <span style="color:#fff;">❤️ Máu: <strong style="color:#ff4757;">${activeItem.hp || 1000}</strong></span>
                    <span style="color:#fff;">💨 Tốc độ rê: <strong style="color:#3498db;">${activeItem.speed || 5}</strong></span>
                    <span style="color:#fff;">⚠️ Cảnh báo: Sẽ áp sát đấm bạn!</span>
                </div>`; 
            
            window.startPreviewLoop(activeItem);
        };
        carousel.appendChild(card); if (!firstCardId) { firstCardId = id; }
    }
    if(!window.selectedRedClass && firstCardId) { let firstCard = carousel.querySelector(`.char-card`); if(firstCard) firstCard.click(); }
}

window.backToMenu = function() { 
    if (typeof window.stopRecording === 'function') window.stopRecording();
    let game = document.getElementById("game-screen"); if(game) game.style.display = "none"; 
    let sel = document.getElementById("selection-screen"); if(sel) sel.style.display = "block"; 
    window.gameOver = true; window.isLoopRunning = false; 
    if(window.selectedRedClass && window.classStats) window.startPreviewLoop(window.classStats[window.selectedRedClass]);
}

window.startGame = async function() { 
    if(!window.selectedRedClass) return;
    window.isPreviewRunning = false; 
    if (window.previewAnimId) cancelAnimationFrame(window.previewAnimId);
    
    let sel = document.getElementById("selection-screen"); if(sel) sel.style.display = "none"; 
    let game = document.getElementById("game-screen"); if(game) game.style.display = "block"; 
    
    if (window.bgmBase) { window.bgmBase.pause(); }
    window.bgmBase = new Audio(window.BGM_BASE_POOL[Math.floor(Math.random() * window.BGM_BASE_POOL.length)]);
    window.bgmBase.loop = true; window.bgmBase.volume = 0.3; window.bgmBase.play().catch(e=>{});

    await window.matchStartFPS(); 
    if (!window.isLoopRunning) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } 
}

window.matchStartFPS = async function() {
    window.gameOver = false;
    window.matchResolved = false;
    window.enemyZ = 120; 
    window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, isDodging: false, isBlocking: false, attackCooldown: 0 };
    
    // FIX: TỰ ĐỘNG CHỌN MAP ĐỂ VẼ VÕ ĐÀI
    if (window.MAPS && window.MAPS.length > 0) {
        window.currentMap = window.MAPS[Math.floor(Math.random() * window.MAPS.length)];
        window.currentWeather = window.currentMap.weather || 'none';
        
        // Khởi tạo thời tiết
        window.weatherParticles = [];
        let ptCount = (window.currentWeather === 'none') ? 0 : 150; 
        for(let i=0; i<ptCount; i++) { 
            window.weatherParticles.push({ 
                x: Math.random() * 800, 
                y: Math.random() * 500, 
                speed: (window.currentWeather === 'rain') ? 12 + Math.random() * 10 : 2 + Math.random() * 3, 
                size: Math.random() * 3 + 1, ang: Math.random() * Math.PI * 2 
            }); 
        }
    }

    let s2 = window.classStats[window.selectedRedClass];
    let eHp = s2.hp || 1000;
    
    // FIX: X = 400 ĐỂ KẺ ĐỊCH LUÔN ĐỨNG GIỮA MÀN HÌNH
    window.enemies = [{ 
        id: "enemy_fps", classId: window.selectedRedClass, isPlayer: false, 
        x: 400, y: window.GROUND_Y, 
        vx: 0, vy: 0, speed: s2.speed || 5, 
        color: s2.color || "#ff003c", hp: eHp, maxHp: eHp, dmgMod: s2.dmgMod || 1, scale: s2.scale || 1, 
        onGround: true, isFacingRight: false, state: 'idle', attackTimer: 0, hitStun: 0, 
        className: s2.className, avatarUrl: s2.avatarUrl,
        drawMethod: s2.drawMethod
    }];
    
    let nb = document.getElementById("name-display-blue");
    if(nb) nb.innerText = "🤖 " + s2.className;
    
    // Đặt máu bạn lên HUD
    let h1 = document.getElementById("hp-red"), h2 = document.getElementById("hp-blue");
    if(h1) h1.style.width = "100%"; if(h2) h2.style.width = "100%";
    
    window.introTimer = 120;
    if (typeof window.startRecording === 'function') window.startRecording();
}

window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isDodging || window.playerFPS.isBlocking) return;
    window.playerFPS.attackCooldown = 15;
    window.playerFPS.stamina -= 10;
    
    let glove = document.getElementById(hand + "-glove");
    if(glove) {
        glove.classList.add(`glove-punch-${hand}`);
        setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150);
    }
    if(typeof window.playSound === 'function') window.playSound(350, 'sine', 0.1, 0.3);

    let e = window.enemies[0];
    if (e && e.hp > 0 && window.enemyZ < 55) {
        let isCrit = Math.random() < 0.2;
        let dmg = 45 * (isCrit ? 2 : 1);
        
        e.hp -= dmg; e.state = 'hurt'; e.hitStun = 20; e.attackTimer = 0;
        window.enemyZ += 20; 
        
        if(typeof window.shakeScreen === 'function') window.shakeScreen(isCrit ? 15 : 8, isCrit ? 10 : 5);
        if(typeof window.spawnParticles === 'function') window.spawnParticles(e.x, e.y - 60, "#ff003c", isCrit);
        
        window.floatingTexts.push({ x: e.x + (Math.random()*40-20), y: e.y - 120, text: isCrit ? `💥 -${dmg}` : `-${dmg}`, color: isCrit ? "#ff4757" : "#fff", alpha: 1, vx: 0, vy: -3, font: "900 35px Arial", life: 40 });
        
        if (e.hp <= 0) {
            e.hp = 0; e.state = 'ko_falling'; e.koTimer = 100; e.vy = -10;
            window.matchResolved = true; window.gameOver = true;
            window.floatingTexts.push({ x: 400, y: 200, text: "K.O! BẠN ĐÃ THẮNG!", color: "#f1c40f", alpha: 1, vx: 0, vy: -1, font: "900 60px Arial", life: 180 });
        }
    }
};

window.blockFPS = function() {
    if (window.playerFPS.stamina < 15 || window.gameOver) return;
    window.playerFPS.isBlocking = true;
    document.getElementById("left-glove").classList.add("glove-block-left");
    document.getElementById("right-glove").classList.add("glove-block-right");
    
    const releaseBlock = () => {
        window.playerFPS.isBlocking = false;
        document.getElementById("left-glove").classList.remove("glove-block-left");
        document.getElementById("right-glove").classList.remove("glove-block-right");
        document.removeEventListener('mouseup', releaseBlock);
        document.removeEventListener('touchend', releaseBlock);
    };
    document.addEventListener('mouseup', releaseBlock);
    document.addEventListener('touchend', releaseBlock);
};

window.dodgeFPS = function() {
    if (window.playerFPS.stamina < 20 || window.playerFPS.isDodging || window.gameOver) return;
    window.playerFPS.isDodging = true; window.playerFPS.stamina -= 20;
    
    let dir = Math.random() > 0.5 ? "left" : "right";
    let canvasWrap = document.querySelector(".canvas-wrapper");
    if(canvasWrap) canvasWrap.classList.add(`camera-dodge-${dir}`);
    
    if(typeof window.playSound === 'function') window.playSound(200, 'sine', 0.2, 0.4);
    setTimeout(() => { window.playerFPS.isDodging = false; if(canvasWrap) canvasWrap.classList.remove(`camera-dodge-${dir}`); }, 350);
};

window.previewAnimId = null;
window.startPreviewLoop = function(charStats) {
    if (window.previewAnimId) cancelAnimationFrame(window.previewAnimId);
    window.isPreviewRunning = true;
    
    let pTime = 0;
    const loop = () => {
        if (!window.isPreviewRunning) return;
        let pCanvas = document.getElementById("preview-canvas");
        if(pCanvas) {
            let pCtx = pCanvas.getContext("2d");
            pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
            pCtx.save();
            pCtx.translate(pCanvas.width/2, pCanvas.height - 40);
            pCtx.scale(1.5, 1.5);
            
            let fakeChar = { x: 0, y: 0, state: 'idle', isFacingRight: false, color: charStats.color };
            if(Math.floor(pTime/60)%2 === 0) fakeChar.state = 'punch'; 
            
            if(charStats.drawMethod) charStats.drawMethod(pCtx, fakeChar, 0, 0, 0, false);
            else if(typeof window.drawStickman === 'function') window.drawStickman(pCtx, fakeChar);
            
            if (window.enemyFaceImg && window.enemyFaceImg.complete) {
                pCtx.save(); pCtx.beginPath(); pCtx.arc(0, -135, 30, 0, Math.PI*2); pCtx.clip();
                pCtx.drawImage(window.enemyFaceImg, -30, -165, 60, 60); pCtx.restore();
            }
            pCtx.restore();
        }
        pTime++;
        window.previewAnimId = requestAnimationFrame(loop);
    };
    loop();
}
