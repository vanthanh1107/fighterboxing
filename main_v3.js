// ==========================================
// MAIN.JS - BROADCAST ESPORTS EDITION (FINAL FIX)
// Tích hợp: Fallback Engine, Polyfill, Anti-Crash, 3D Render
// ==========================================

window.BGM_BASE_POOL = [
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/A_Slipping_Glimpse_-_Nihilore.mp3",
    "https://upload.wikimedia.org/wikipedia/commons/c/c2/The_Descent_-_Kevin_MacLeod.mp3",
    "https://upload.wikimedia.org/wikipedia/commons/3/3c/Gothic_Dark_Electronic_Music_-_Ominous.mp3" 
];

window.loadedCharacters = {}; 
window.enemyZ = 120; 
window.targetZ = 120; 
window.GROUND_Y = 350;

// ==========================================
// 🛡️ HỆ THỐNG POLYFILL (CHỐNG CRASH NẾU THIẾU HÀM)
// ==========================================
window.playSound = window.playSound || function(freq, type, vol, dur) { console.log("Sound played:", freq); };
window.shakeScreen = window.shakeScreen || function(amount, duration) { window.cameraTilt = (Math.random() > 0.5 ? 0.1 : -0.1); };
window.spawnDamageNumber = window.spawnDamageNumber || function(x, y, text, color, isCrit) {
    if(!window.floatingTexts) window.floatingTexts = [];
    window.floatingTexts.push({ x: x, y: y, text: text, color: color, alpha: 1, vx: (Math.random()-0.5)*2, vy: -2 - Math.random()*2, font: isCrit ? "italic 900 35px Arial" : "bold 25px Arial", life: 40 });
};
window.spawnParticles = window.spawnParticles || function(x, y, color, isCrit) {
    if(!window.particles) window.particles = [];
    let count = isCrit ? 20 : 5;
    for(let i=0; i<count; i++) window.particles.push({x: x, y: y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, size: Math.random()*5+2, color: color, life: 30, alpha: 1});
};
window.spawnDebris = window.spawnDebris || function(x, y, count) {};
window.spawnScreenBlood = window.spawnScreenBlood || function() { window.damageFlashAlpha = 0.6; };

// ==========================================
// 🚀 HỆ THỐNG CỨU HỘ ĐỒ HỌA (RENDER FALLBACK)
// ==========================================
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
        cx.fillRect(i * 250 - midOffset + w/2, window.GROUND_Y - bHeight - cxY * 0.4, 120, bHeight);
    }
    
    // Mặt sàn đấu 3D
    let floorGrad = cx.createLinearGradient(0, window.GROUND_Y, 0, h);
    floorGrad.addColorStop(0, "#111"); floorGrad.addColorStop(1, "#333");
    cx.fillStyle = floorGrad; cx.fillRect(-w, window.GROUND_Y - cxY, w * 3, h);
    cx.restore();
};

window.drawStickman = window.drawStickman || function(ctx, charObj) {
    ctx.save();
    ctx.fillStyle = charObj.color || "#ff003c";
    
    // Đầu
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
    } else {
        ctx.fillStyle = "#ff4757";
        ctx.beginPath(); ctx.arc(-45, -55, 15, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(45, -55, 15, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
};

// ==========================================
// ⚙️ GAME ENGINE: UPDATE & DRAW (LÕI XỬ LÝ KHUNG HÌNH)
// ==========================================
window.update = function() {
    if (window.gameOver) return;

    // Cập nhật Camera & Nội tại 3D
    if (window.targetZ !== undefined && window.enemyZ !== undefined) {
        window.enemyZ += (window.targetZ - window.enemyZ) * 0.1; // Chuyển động mượt
    }
    if (window.hitZoomTimer > 0) window.hitZoomTimer--;
    if (window.cameraTilt !== 0) window.cameraTilt *= 0.8;

    // Logic Kẻ Địch AI
    if (window.enemies && window.enemies.length > 0) {
        let e = window.enemies[0];
        if (e.hp > 0) {
            if (e.hitStun > 0) {
                e.hitStun--;
            } else {
                e.attackTimer++;
                if (e.attackTimer > 70 && window.enemyZ < 150) { // Địch tấn công
                    if (window.playerFPS && !window.playerFPS.isDodging && !window.playerFPS.isBlocking) {
                        window.playerFPS.hp -= (20 * (e.dmgMod || 1));
                        window.damageFlashAlpha = 0.5;
                        window.shakeScreen(15, 10);
                        if(window.spawnScreenBlood) window.spawnScreenBlood();
                        
                        // Cập nhật thanh máu người chơi nếu có UI
                        let hpBar = document.getElementById("hp-red");
                        if(hpBar) hpBar.style.width = Math.max(0, (window.playerFPS.hp / window.playerFPS.maxHp) * 100) + "%";
                        
                        if (window.playerFPS.hp <= 0) {
                            window.gameOver = true;
                            window.announce("You Lose!", 0.8);
                        }
                    }
                    e.attackTimer = 0;
                }
            }
        }
    }

    // Cập nhật Hạt (Particles) & Text
    if (window.floatingTexts) {
        window.floatingTexts.forEach(t => { t.x += t.vx; t.y += t.vy; t.life--; t.alpha = Math.max(0, t.life / 30); });
        window.floatingTexts = window.floatingTexts.filter(t => t.life > 0);
    }
    if (window.particles) {
        window.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.alpha = Math.max(0, p.life/20); });
        window.particles = window.particles.filter(p => p.life > 0);
    }
};

window.draw = function() {
    let canvas = document.getElementById("game-canvas") || document.querySelector("canvas");
    if (!canvas) return; 
    let ctx = canvas.getContext("2d");
    let w = canvas.width; let h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Camera Shake & Zoom
    let shakeX = 0, shakeY = 0;
    if (window.hitZoomTimer > 0) {
        shakeX = (Math.random() - 0.5) * 15;
        shakeY = (Math.random() - 0.5) * 15;
    }
    ctx.translate(shakeX, shakeY);
    
    if (window.camZoom) {
        ctx.translate(w/2, h/2);
        ctx.scale(window.camZoom, window.camZoom);
        ctx.rotate(window.cameraTilt || 0);
        ctx.translate(-w/2, -h/2);
    }

    // 1. Vẽ Map
    window.drawMap(ctx, w, h);

    // 2. Vẽ Kẻ địch
    if (window.enemies && window.enemies.length > 0) {
        let e = window.enemies[0];
        if (e.hp > 0 || e.hitStun > 0) {
            ctx.save();
            let distance = window.enemyZ || 120;
            let scale = Math.max(0.5, 200 / Math.max(50, distance)); 
            
            ctx.translate(w/2, window.GROUND_Y + (distance * 0.2));
            ctx.scale(scale, scale);
            
            if (e.hitStun > 0) {
                ctx.translate((Math.random()-0.5)*15, (Math.random()-0.5)*15);
                ctx.rotate((Math.random()-0.5)*0.15);
            }
            window.drawStickman(ctx, e);
            ctx.restore();
        }
    }

    // 3. Vẽ Text và Hạt
    if (window.floatingTexts) {
        window.floatingTexts.forEach(t => {
            ctx.fillStyle = t.color || "#fff";
            ctx.globalAlpha = t.alpha;
            ctx.font = t.font || "bold 20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(t.text, t.x, t.y);
            ctx.globalAlpha = 1;
        });
    }

    if (window.particles) {
        window.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1;
        });
    }

    ctx.restore();

    // 4. Màn hình chớp đỏ khi nhận sát thương
    if (window.damageFlashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${window.damageFlashAlpha})`;
        ctx.fillRect(0, 0, w, h);
        window.damageFlashAlpha -= 0.05;
    }
};

window.gameLoopFPS = function(timestamp) {
    if (!window.isLoopRunning) return;
    requestAnimationFrame(window.gameLoopFPS);
    if (!timestamp) timestamp = performance.now();
    if (!window.lastFrameTime) window.lastFrameTime = timestamp;
    
    let deltaTime = timestamp - window.lastFrameTime;
    if (deltaTime >= 16) { 
        window.lastFrameTime = timestamp - (deltaTime % 16);
        // Hiển thị lỗi ra Console F12 thay vì im lặng
        try { window.update(); } catch(e) { console.error("Update Error:", e); }
        try { window.draw(); } catch(e) { console.error("Draw Error:", e); }
    }
};

// ==========================================
// 🎙️ TIỆN ÍCH GAME (AUDIO & LOAD)
// ==========================================
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

// ==========================================
// 🎮 KHỞI TẠO MENU & NHÂN VẬT
// ==========================================
window.initGame = async function() {
    if (!window.classStats) window.classStats = { default: { className: "Fighter", hp: 1000, speed: 5, color: "#f1c40f" } };
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
            
            window.playSound(600, 'square', 0.1, 0.4);
            
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
                    <span style="color:#00f3ff; font-size:13px; font-weight: bold; margin-top: 5px; background: rgba(0, 243, 255, 0.1); padding: 5px 8px; border-radius: 5px; border-left: 4px solid #00f3ff; display: inline-block;">🤖 AI READY</span>
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
// ⚔️ ĐIỀU HƯỚNG & VÀO TRẬN (VS SCREEN)
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
    window.playSound(150, 'sawtooth', 1.0, 0.8, true);
    window.announce("Get Ready!", 0.9);

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

    await window.matchStartFPS(randomEnemyId); 
    
    window.isLoopRunning = true; 
    requestAnimationFrame(window.gameLoopFPS); 
}

window.matchStartFPS = async function(randomEnemyId) {
    window.canvas = document.getElementById("game-canvas") || document.querySelector("canvas");
    let canvasW = window.canvas ? window.canvas.width : 800;
    let canvasH = window.canvas ? window.canvas.height : 600;

    window.gameOver = false; window.matchResolved = false; 
    window.enemyZ = 120; window.targetZ = 120; 
    window.camX = 0; window.camY = 0; window.cameraTilt = 0; window.camZoom = 1.0;
    
    window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, rage: 0, combo: 0, isDodging: false, isBlocking: false, attackCooldown: 0 };
    
    window.floatingTexts = []; window.particles = []; window.damageFlashAlpha = 0; window.hitZoomTimer = 0;
    
    let s2 = (window.classStats && window.classStats[randomEnemyId]) ? window.classStats[randomEnemyId] : { className: "Enemy", hp: 1000, speed: 5 }; 
    let eHp = s2.hp || 1000;
    
    window.enemies = [{ 
        id: "enemy_fps", isPlayer: false, x: canvasW/2, y: window.GROUND_Y, 
        vx: 0, vy: 0, speed: s2.speed || 5, color: s2.color || "#ff003c", hp: eHp, maxHp: eHp, dmgMod: s2.dmgMod || 1, 
        state: 'idle', attackTimer: 0, hitStun: 0,
        className: s2.className || "Enemy", avatarUrl: s2.avatarUrl || ""
    }];
    
    let myChar = (window.classStats && window.classStats[window.selectedRedClass]) ? window.classStats[window.selectedRedClass] : { className: "Player", color: "#00f3ff" };
    let defaultGlove = 'https://cdn-icons-png.flaticon.com/512/2950/2950586.png'; 
    
    let leftGloveEl = document.getElementById('left-glove');
    let rightGloveEl = document.getElementById('right-glove');
    if (leftGloveEl && rightGloveEl) {
        leftGloveEl.style.backgroundImage = `url('${myChar.gloveUrl || defaultGlove}')`;
        rightGloveEl.style.backgroundImage = `url('${myChar.gloveUrl || defaultGlove}')`;
    }

    window.enemyFaceImg = new Image(); window.enemyFaceImg.crossOrigin = "Anonymous"; window.enemyFaceImg.src = s2.avatarUrl || ""; 
    window.enemyGloveImg = new Image(); window.enemyGloveImg.crossOrigin = "Anonymous"; window.enemyGloveImg.src = s2.gloveUrl || defaultGlove;

    let nb = document.getElementById("name-display-blue"); if(nb) nb.innerText = "🤖 " + (s2.className || "Enemy");
    let nR = document.getElementById("name-display-red"); if(nR) nR.innerText = "👤 " + (myChar.className || "Player"); 
    let h1 = document.getElementById("hp-red"), h2 = document.getElementById("hp-blue"); 
    if(h1) h1.style.width = "100%"; if(h2) h2.style.width = "100%";
    
    setTimeout(() => { window.announce("FIGHT!", 0.8); }, 2000); 
}

// ==========================================
// 🥊 HỆ THỐNG CHIẾN ĐẤU (PUNCH, BLOCK, DODGE)
// ==========================================
window.moveFPS = function(dir) {
    if (window.playerFPS.stamina < 5 || window.gameOver || window.playerFPS.isDodging) return;
    window.playerFPS.stamina -= 5; window.targetZ += dir * 45; window.targetZ = Math.max(30, Math.min(220, window.targetZ)); 
    window.playSound(200, 'sine', 0.1, 0.2);
};

window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isBlocking) return;
    window.playerFPS.attackCooldown = 15; window.playerFPS.stamina -= 10; 

    let glove = document.getElementById(hand + "-glove");
    if(glove) { glove.classList.add(`glove-punch-${hand}`); setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150); }

    let e = window.enemies[0];
    let cW = window.canvas ? window.canvas.width/2 : 400;

    if (e && e.hp > 0 && window.enemyZ <= 100) { 
        window.playerFPS.combo++; let comboMult = 1 + (window.playerFPS.combo * 0.15); 
        let isCrit = Math.random() < 0.25; 
        let dmg = 40 * comboMult; let punchColor = window.playerFPS.combo >= 4 ? "#ff9f43" : "#fff";

        if (isCrit) { 
            dmg = Math.floor(dmg * 1.8); punchColor = "#ff4757"; 
            window.hitZoomTimer = 10; window.cameraTilt = (Math.random() > 0.5 ? 0.1 : -0.1); 
        } 

        window.targetZ += (isCrit ? 30 : 10); 
        e.hp -= dmg;
        e.hitStun = isCrit ? 25 : 10;
        e.attackTimer = 0;

        let hpBar = document.getElementById("hp-blue");
        if(hpBar) hpBar.style.width = Math.max(0, (e.hp / e.maxHp) * 100) + "%";

        if (e.hp <= 0) {
            window.spawnParticles(cW, 200, "rgba(220, 0, 0, 0.9)", true); 
            window.spawnScreenBlood(); 
            window.announce("K.O!", 0.6); 
            window.gameOver = true;
        } else {
            window.shakeScreen(isCrit ? 22 : 8, isCrit ? 15 : 5); 
            window.spawnParticles(cW, 200, punchColor, isCrit);
            window.spawnDamageNumber(cW + (Math.random()*40-20), 150, isCrit ? `💥 -${Math.floor(dmg)}` : `-${Math.floor(dmg)}`, punchColor, isCrit);
        }
    } else { 
        window.playerFPS.combo = 0; window.playerFPS.stamina -= 12; 
        window.spawnDamageNumber(cW + (hand==='left'? -80:80), 300, "MISS!", "#7f8c8d", false);
    }
    
    // Auto reset cooldown
    setTimeout(()=>{ window.playerFPS.attackCooldown = 0; }, 250);
};

window.blockFPS = function() { 
    if (window.playerFPS.stamina <= 0 || window.gameOver) return; 
    window.playerFPS.isBlocking = true; 
    let gl = document.getElementById("left-glove"); if(gl) gl.classList.add("glove-block-left"); 
    let gr = document.getElementById("right-glove"); if(gr) gr.classList.add("glove-block-right"); 

    const releaseBlock = () => { 
        window.playerFPS.isBlocking = false; 
        if(gl) gl.classList.remove("glove-block-left"); 
        if(gr) gr.classList.remove("glove-block-right"); 
        document.removeEventListener('mouseup', releaseBlock); 
        document.removeEventListener('touchend', releaseBlock); 
    }; 
    document.addEventListener('mouseup', releaseBlock); 
    document.addEventListener('touchend', releaseBlock); 
};

window.dodgeFPS = function() { 
    if (window.playerFPS.stamina < 20 || window.playerFPS.isDodging || window.gameOver) return; 
    window.playerFPS.isDodging = true; window.playerFPS.stamina -= 20; 
    window.playSound(200, 'sine', 0.2, 0.4); 
    window.camZoom = 0.9;
    setTimeout(() => { window.playerFPS.isDodging = false; window.camZoom = 1.0; }, 400); 
};

// ==========================================
// 👁️ HIỂN THỊ ANIMATION NHÂN VẬT CHỜ Ở MENU
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

            // Sàn giả 3D
            let matGrad = pCtx.createLinearGradient(0, pCanvas.height - 100, 0, pCanvas.height);
            matGrad.addColorStop(0, "#111820"); matGrad.addColorStop(1, "#05080c");
            pCtx.fillStyle = matGrad; pCtx.fillRect(-50, pCanvas.height - 100, pCanvas.width + 100, 100);
            
            let bounce = Math.sin(pTime * 0.05) * 5;
            pCtx.translate(pCanvas.width/2, pCanvas.height - 30 + bounce);
            pCtx.scale(1.2, 1.2); 
            
            let fakeChar = Object.assign({}, charStats, { x: 0, y: 0 });
            window.drawStickman(pCtx, fakeChar);
            pCtx.restore();
        }
        pTime++;
        window.previewAnimId = requestAnimationFrame(loop);
    };
    loop();
}
