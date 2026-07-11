// ==========================================
// MAIN.JS - THE KINETIC UI EDITION (V37.0 - ULTIMATE MENU)
// [ĐỈNH CAO: HỐ ĐEN NĂNG LƯỢNG, QUÉT LASER 3D, GIAO DIỆN GLITCH IMPACT]
// ==========================================

window.BGM_BASE_POOL = [
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/A_Slipping_Glimpse_-_Nihilore.mp3",
    "https://upload.wikimedia.org/wikipedia/commons/c/c2/The_Descent_-_Kevin_MacLeod.mp3",
    "https://upload.wikimedia.org/wikipedia/commons/3/3c/Gothic_Dark_Electronic_Music_-_Ominous.mp3" 
];

window.loadedCharacters = {}; 
window.enemyZ = 120; 
window.targetZ = 120; 
window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, isDodging: false, isBlocking: false, attackCooldown: 0 };
window.enemyFaceImg = new Image(); 
window.enemyGloveImg = new Image(); 

window.previewGlitchTimer = 0; 
window.menuDustParticles = []; 

window.announce = function(text, pitch = 0.8) {
    try {
        if (window.isMuted) return;
        speechSynthesis.cancel(); 
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-US'; msg.rate = 1.3; msg.pitch = pitch; msg.volume = 0.9;
        speechSynthesis.speak(msg);
    } catch(e) {}
};

for(let i=0; i<40; i++) {
    window.menuDustParticles.push({
        x: Math.random() * 2000 - 1000, y: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5, vy: -Math.random() * 1.5,
        size: Math.random() * 2.5 + 0.5, alpha: Math.random() * 0.5 + 0.1
    });
}

// ==========================================
// 1. KHỞI TẠO VÀ CHỌN TƯỚNG TẠI MENU
// ==========================================
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
            if (window.selectedRedClass === id) return;

            window.selectedRedClass = id; 
            document.querySelectorAll('.char-card').forEach(c => { c.classList.remove('selected'); c.style.transform = "scale(1)"; }); 
            
            // 🌟 HIỆU ỨNG THẺ BÀI GIẬT CẤP (IMPACT)
            card.classList.add('selected'); 
            card.style.transition = "transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            card.style.transform = "scale(1.15) rotate(-3deg)";
            setTimeout(() => { if (card.classList.contains('selected')) card.style.transform = "scale(1.05) rotate(0deg)"; }, 150);

            if(typeof window.playSound === 'function') {
                window.playSound(600, 'square', 0.1, 0.4);
                setTimeout(() => window.playSound(200, 'triangle', 0.2, 0.6), 50); // Tiếng Echo vi tính
            }
            window.announce("CHALLENGER ACCEPTS!", 0.9); 
            window.previewGlitchTimer = 35; 

            let desc = document.getElementById("desc-red");
            await window.loadCharacterDynamic(id);
            let activeItem = window.classStats[id];
            
            window.enemyFaceImg.crossOrigin = "Anonymous"; window.enemyFaceImg.src = activeItem.avatarUrl;
            window.enemyGloveImg.crossOrigin = "Anonymous"; window.enemyGloveImg.src = activeItem.gloveUrl || 'https://cdn-icons-png.flaticon.com/512/2950/2950586.png';

            if(desc) desc.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px; text-align: left; animation: fadeIn 0.3s ease;">
                    <span style="font-size:38px; color:${activeItem.color || '#f1c40f'}; font-weight:900; text-transform: uppercase; text-shadow: 0 0 15px ${activeItem.color || '#f1c40f'}; letter-spacing: 2px;">${activeItem.className}</span>
                    <div style="height: 2px; background: linear-gradient(90deg, ${activeItem.color || '#f1c40f'}, transparent); width: 80%; margin-bottom: 5px;"></div>
                    <span style="color:#fff; font-size:18px;">❤️ Sinh Lực: <strong style="color:#ff4757;">${activeItem.hp || 1000}</strong></span>
                    <span style="color:#fff; font-size:18px;">💨 Tốc Độ: <strong style="color:#3498db;">${activeItem.speed || 5}</strong></span>
                    <span style="color:#fff; font-size:18px;">✨ Sức Mạnh: <strong style="color:#f1c40f;">${(activeItem.dmgMod || 1) * 100}%</strong></span>
                    <span style="color:#00f3ff; font-weight: bold; margin-top: 10px; background: rgba(0, 243, 255, 0.1); padding: 5px 10px; border-radius: 5px; border-left: 4px solid #00f3ff; display: inline-block;">🤖 A.I KICKBOXING ENGINE</span>
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
// 2. CHUYỂN CẢNH KỊCH TÍNH (CINEMATIC VS SCREEN VỚI QUOTES)
// ==========================================
window.backToMenu = function() { 
    if (typeof window.stopRecording === 'function') window.stopRecording();
    let game = document.getElementById("game-screen"); if(game) game.style.display = "none"; 
    let sel = document.getElementById("selection-screen"); if(sel) sel.style.display = "block"; 
    window.gameOver = true; window.isLoopRunning = false; 
    if(window.selectedRedClass && window.classStats) {
        window.previewGlitchTimer = 35; 
        window.startPreviewLoop(window.classStats[window.selectedRedClass]);
    }
}

window.startGame = async function() { 
    if(!window.selectedRedClass) return;
    window.isPreviewRunning = false; 
    if (window.previewAnimId) cancelAnimationFrame(window.previewAnimId);
    
    let allKeys = Object.keys(window.classStats);
    let randomEnemyId = allKeys[Math.floor(Math.random() * allKeys.length)];
    await window.loadCharacterDynamic(randomEnemyId);
    let eChar = window.classStats[randomEnemyId]; 
    let mChar = window.classStats[window.selectedRedClass];

    let pQuotes = ["Ta sẽ nghiền nát ngươi!", "Chuẩn bị vào viện đi!", "Để xem mi trụ được mấy giây?", "Sức mạnh thực sự là đây!"];
    let eQuotes = ["Đừng hòng chạy thoát!", "Đến đây mà lấy mạng ta!", "Ngươi đùa ta chắc?", "Múa may vớ vẩn!"];
    let q1 = pQuotes[Math.floor(Math.random() * pQuotes.length)];
    let q2 = eQuotes[Math.floor(Math.random() * eQuotes.length)];

    let vsDiv = document.createElement("div");
    vsDiv.id = "vs-screen-overlay";
    vsDiv.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; background: #000; display: flex; overflow: hidden;`;
    vsDiv.innerHTML = `
        <div style="flex:1; background: ${mChar.color || '#00f3ff'}; transform: skewX(-15deg) scale(1.2); display: flex; flex-direction: column; justify-content: center; align-items: flex-end; padding-right: 15%; animation: slideRight 0.4s ease forwards;">
            <h1 style="color: #fff; font-size: 90px; font-family: 'Impact'; font-style: italic; transform: skewX(15deg); text-shadow: 0 5px 15px rgba(0,0,0,0.8); margin: 0;">${mChar.className.toUpperCase()}</h1>
            <p style="color: #f1c40f; font-size: 26px; font-family: Arial; font-weight: 900; font-style: italic; transform: skewX(15deg); text-shadow: 2px 2px 0 #000; margin: 0; overflow: hidden; white-space: nowrap; animation: typing 1s steps(30, end) forwards; animation-delay: 0.3s; opacity: 0; animation-fill-mode: forwards;">"${q1}"</p>
        </div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
            <h1 style="color: #fff; font-size: 130px; font-family: 'Impact'; font-style: italic; text-shadow: 0 0 40px #000, 0 0 10px #fff; animation: pulse 0.4s infinite alternate;">VS</h1>
        </div>
        <div style="flex:1; background: ${eChar.color || '#ff003c'}; transform: skewX(-15deg) scale(1.2); display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding-left: 15%; animation: slideLeft 0.4s ease forwards;">
            <h1 style="color: #fff; font-size: 90px; font-family: 'Impact'; font-style: italic; transform: skewX(15deg); text-shadow: 0 5px 15px rgba(0,0,0,0.8); margin: 0;">${eChar.className.toUpperCase()}</h1>
            <p style="color: #fff; font-size: 26px; font-family: Arial; font-weight: 900; font-style: italic; transform: skewX(15deg); text-shadow: 2px 2px 0 #000; margin: 0; overflow: hidden; white-space: nowrap; animation: typing 1s steps(30, end) forwards; animation-delay: 0.6s; opacity: 0; animation-fill-mode: forwards;">"${q2}"</p>
        </div>
        <style>
            @keyframes slideRight { from { transform: skewX(-15deg) scale(1.2) translateX(-100%); } to { transform: skewX(-15deg) scale(1.2) translateX(0); } }
            @keyframes slideLeft { from { transform: skewX(-15deg) scale(1.2) translateX(100%); } to { transform: skewX(-15deg) scale(1.2) translateX(0); } }
            @keyframes pulse { from { transform: translate(-50%, -50%) scale(1); } to { transform: translate(-50%, -50%) scale(1.15); } }
            @keyframes typing { from { width: 0; opacity: 1; } to { width: 100%; opacity: 1; } }
        </style>
    `;
    document.body.appendChild(vsDiv);
    
    if(typeof window.playSound === 'function') window.playSound(150, 'sawtooth', 1.0, 0.8, true);
    window.announce("FIGHT!", 0.9);

    setTimeout(async () => {
        vsDiv.style.opacity = 0; vsDiv.style.transition = "opacity 0.3s";
        setTimeout(() => vsDiv.remove(), 300);

        let sel = document.getElementById("selection-screen"); if(sel) sel.style.display = "none"; 
        let game = document.getElementById("game-screen"); if(game) game.style.display = "block"; 
        
        if (window.bgmBase) { window.bgmBase.pause(); }
        window.bgmBase = new Audio(window.BGM_BASE_POOL[Math.floor(Math.random() * window.BGM_BASE_POOL.length)]);
        window.bgmBase.loop = true; window.bgmBase.volume = 0.3; window.bgmBase.play().catch(e=>{});

        await window.matchStartFPS(randomEnemyId); 
        
        if (!window.isLoopRunning) { 
            window.isLoopRunning = true; 
            requestAnimationFrame(window.gameLoopFPS); 
        } 
    }, 2200);
}

window.matchStartFPS = async function(randomEnemyId) {
    window.gameOver = false; window.matchResolved = false; 
    window.enemyZ = 120; window.targetZ = 120; 
    window.camX = 0; window.camY = 0; window.cameraTilt = 0; window.camZoom = 1.0;
    
    window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, rage: 0, combo: 0, isDodging: false, isBlocking: false, attackCooldown: 0, parryInvuln: 0, guardBreakTimer: 0, clutchUsed: false, clutchActive: false };
    
    window.floatingTexts = []; window.particles = []; window.shockwaves = []; window.screenBlood = []; 
    window.bloodPools = []; window.floorSplatters = []; window.glassShards = []; window.debris = []; window.speechBubbles = [];
    window.damageFlashAlpha = 0; window.perfectDodgeFlash = 0; window.hitZoomTimer = 0; 
    window.clutchFlashTimer = 0; window.fatalBlowFlash = 0; window.blackoutTimer = 0; window.parryShieldRadius = 0;
    window.speedLinesAlpha = 0; window.heartbeatPhase = 0; window.whiteFlashAlpha = 0; window.clashStruggleTimer = 0; window.destructiveFinishTimer = 0; window.superArtTimer = 0;

    let crack = document.getElementById("screen-crack"); if(crack) crack.style.opacity = 0;
    
    if (window.MAPS && window.MAPS.length > 0) {
        window.currentMap = window.MAPS[Math.floor(Math.random() * window.MAPS.length)];
        window.currentWeather = window.currentMap.weather || 'none';
        window.weatherParticles = []; let ptCount = (window.currentWeather === 'none') ? 0 : 150; 
        for(let i=0; i<ptCount; i++) { window.weatherParticles.push({ x: Math.random() * 800, y: Math.random() * 500, speed: (window.currentWeather === 'rain') ? 12 + Math.random() * 10 : 2 + Math.random() * 3, size: Math.random() * 3 + 1, ang: Math.random() * Math.PI * 2 }); }
    }

    let s2 = window.classStats[randomEnemyId]; 
    let eHp = s2.hp || 1000;
    
    window.enemies = [{ 
        id: "enemy_fps", classId: randomEnemyId, isPlayer: false, x: 400, y: window.GROUND_Y, 
        vx: 0, vy: 0, speed: s2.speed || 5, color: s2.color || "#ff003c", hp: eHp, maxHp: eHp, dmgMod: s2.dmgMod || 1, scale: s2.scale || 1, 
        onGround: true, isFacingRight: false, state: 'idle', attackTimer: 0, hitStun: 0, bounceCount: 0,
        className: s2.className, avatarUrl: s2.avatarUrl, drawMethod: s2.drawMethod,
        bodyType: s2.bodyType, isShirtless: s2.isShirtless, skinColor: s2.skinColor, hasTattoos: s2.hasTattoos, jerseyColor: s2.jerseyColor, jerseyNumber: s2.jerseyNumber, pantsType: s2.pantsType, pantsColor: s2.pantsColor, shortsColor: s2.shortsColor, socksColor: s2.socksColor, shoesColor: s2.shoesColor, auraType: s2.auraType, glowingEyes: s2.glowingEyes, hasHeadband: s2.hasHeadband, hasChampBelt: s2.hasChampBelt, beltText: s2.beltText
    }];
    
    let myChar = window.classStats[window.selectedRedClass];
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

    window.enemyFaceImg = new Image(); window.enemyFaceImg.crossOrigin = "Anonymous"; window.enemyFaceImg.src = s2.avatarUrl; 
    window.enemyGloveImg = new Image(); window.enemyGloveImg.crossOrigin = "Anonymous"; window.enemyGloveImg.src = s2.gloveUrl || defaultGlove;

    let nb = document.getElementById("name-display-blue"); if(nb) nb.innerText = "🤖 " + s2.className;
    let nR = document.getElementById("name-display-red"); if(nR) nR.innerText = "👤 " + myChar.className; 
    let h1 = document.getElementById("hp-red"), h2 = document.getElementById("hp-blue"); if(h1) h1.style.width = "100%"; if(h2) h2.style.width = "100%";
    
    window.introTimer = 120;
    setTimeout(() => { window.announce("FIGHT!", 0.8); }, 2000); 

    if (typeof window.startRecording === 'function') window.startRecording();
}

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
    
    let pTime = 0;
    let curX = 0, curY = 0;

    const loop = () => {
        if (!window.isPreviewRunning) return;
        let pCanvas = document.getElementById("preview-canvas");
        if(pCanvas) {
            let pCtx = pCanvas.getContext("2d");
            pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
            pCtx.save();
            
            curX += (window.mouseX * 40 - curX) * 0.1;
            curY += (window.mouseY * 20 - curY) * 0.1;

            // 1. TIA SÁNG GOD RAYS
            pCtx.save();
            pCtx.translate(pCanvas.width/2 - curX*0.2, -100); 
            let rayGrad = pCtx.createLinearGradient(0, 0, 0, pCanvas.height + 200);
            rayGrad.addColorStop(0, `rgba(${window.hexToRgb?window.hexToRgb(charStats.color || '#fff'):'255,255,255'}, 0.25)`);
            rayGrad.addColorStop(1, "rgba(0,0,0,0)");
            pCtx.fillStyle = rayGrad;
            
            for(let r=0; r<3; r++) {
                let angBase = (r - 1) * 0.4; 
                let sway = Math.sin(pTime*0.01 + r) * 0.15; 
                pCtx.beginPath();
                pCtx.moveTo(0, 0);
                pCtx.lineTo(Math.cos(Math.PI/2 + angBase + sway - 0.2) * 1500, Math.sin(Math.PI/2 + angBase + sway - 0.2) * 1500);
                pCtx.lineTo(Math.cos(Math.PI/2 + angBase + sway + 0.2) * 1500, Math.sin(Math.PI/2 + angBase + sway + 0.2) * 1500);
                pCtx.closePath(); pCtx.fill();
            }
            pCtx.restore();

            pCtx.translate(curX, curY);

            // 2. MẶT SÀN KÍNH
            let matGrad = pCtx.createLinearGradient(0, pCanvas.height - 100, 0, pCanvas.height);
            matGrad.addColorStop(0, "#0a0f16"); matGrad.addColorStop(1, "#020305");
            pCtx.fillStyle = matGrad; pCtx.fillRect(-100, pCanvas.height - 100, pCanvas.width + 200, 100);
            
            pCtx.strokeStyle = "rgba(0, 243, 255, 0.5)"; pCtx.lineWidth = 2;
            pCtx.beginPath(); pCtx.moveTo(-100, pCanvas.height - 100); pCtx.lineTo(pCanvas.width + 100, pCanvas.height - 100); pCtx.stroke();

            // 🌟 3. HỐ ĐEN NĂNG LƯỢNG (VORTEX) DƯỚI CHÂN NHÂN VẬT
            if (charStats.auraType && charStats.auraType !== 'none') {
                let aColor = charStats.auraType === 'fire' ? "#ff4757" : (charStats.auraType === 'god' ? "#f1c40f" : "#00f3ff");
                pCtx.save();
                pCtx.translate(pCanvas.width/2 - curX*0.5, pCanvas.height - 60);
                pCtx.scale(1, 0.25); // Ép dẹt thành hình elip 3D
                pCtx.rotate(pTime * 0.05); // Lốc xoáy quay tròn
                
                // Vẽ các vòng cung xoáy
                pCtx.strokeStyle = aColor; pCtx.lineWidth = 3; pCtx.globalAlpha = 0.6;
                for (let i = 0; i < 4; i++) {
                    pCtx.beginPath();
                    pCtx.arc(0, 0, 80 + Math.sin(pTime*0.1 + i)*20, i*Math.PI/2, i*Math.PI/2 + Math.PI/1.5);
                    pCtx.stroke();
                }
                
                // Lõi phát sáng
                let coreGrad = pCtx.createRadialGradient(0, 0, 0, 0, 0, 150);
                coreGrad.addColorStop(0, `rgba(${window.hexToRgb?window.hexToRgb(aColor):'255,255,255'}, 0.8)`);
                coreGrad.addColorStop(1, "rgba(0,0,0,0)");
                pCtx.fillStyle = coreGrad; pCtx.globalAlpha = 1.0;
                pCtx.beginPath(); pCtx.arc(0, 0, 150, 0, Math.PI*2); pCtx.fill();
                pCtx.restore();
            }

            let bounce = Math.sin(pTime * 0.05) * 5;
            pCtx.translate(pCanvas.width/2, pCanvas.height - 90 + bounce);
            pCtx.scale(1.8, 1.8); 
            
            let fakeChar = Object.assign({}, charStats, { x: 0, y: 0, state: 'idle', isFacingRight: false, hp: 1000, maxHp: 1000 });
            
            if(pTime % 180 > 150) { 
                fakeChar.state = 'punch'; fakeChar.attackTimer = 15; 
                if (pTime % 180 === 151 && typeof window.playSound === 'function') window.playSound(200, 'sine', 0.1, 0.1); 
            } 
            
            if(typeof window.drawStickman === 'function') window.drawStickman(pCtx, fakeChar);
            
            // 🌟 4. HIỆU ỨNG QUÉT LASER (CYBER SCANLINE) LÊN NHÂN VẬT
            if (pTime % 300 < 100) { // Thỉnh thoảng quét 1 lần
                let scanY = -200 + ((pTime % 300) / 100) * 300; // Quét từ đầu xuống chân
                pCtx.fillStyle = `rgba(${window.hexToRgb?window.hexToRgb(charStats.color || '#00f3ff'):'0,243,255'}, 0.8)`;
                pCtx.shadowBlur = 15; pCtx.shadowColor = charStats.color || "#00f3ff";
                pCtx.fillRect(-50, scanY, 100, 2); // Tia laser mỏng
                pCtx.shadowBlur = 0;
            }

            pCtx.restore();

            // 🌟 5. BỤI LƠ LỬNG
            pCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
            window.menuDustParticles.forEach(d => {
                d.x += d.vx - (window.mouseX * d.size); 
                d.y += d.vy - (window.mouseY * d.size);
                if (d.y < -100) d.y = pCanvas.height + 100;
                if (d.x < -100) d.x = pCanvas.width + 100;
                if (d.x > pCanvas.width + 100) d.x = -100;

                pCtx.globalAlpha = d.alpha * (Math.sin(pTime*0.05 + d.x) * 0.5 + 0.5); 
                pCtx.beginPath(); pCtx.arc(d.x, d.y, d.size, 0, Math.PI*2); pCtx.fill();
            });
            pCtx.globalAlpha = 1.0;

            // 🌟 6. HOLOGRAM GLITCH KHI CHỌN TƯỚNG
            if (window.previewGlitchTimer > 0) {
                window.previewGlitchTimer--;
                let gPower = window.previewGlitchTimer; 
                
                pCtx.globalCompositeOperation = 'screen';
                pCtx.drawImage(pCanvas, (Math.random()-0.5)*gPower, 0); 
                pCtx.globalCompositeOperation = 'source-over';
                
                pCtx.fillStyle = `rgba(255, 255, 255, ${gPower * 0.01})`;
                for(let i=0; i<10; i++) {
                    pCtx.fillRect(0, Math.random()*pCanvas.height, pCanvas.width, Math.random()*10);
                }
            }
        }
        pTime++;
        window.previewAnimId = requestAnimationFrame(loop);
    };
    loop();
}
