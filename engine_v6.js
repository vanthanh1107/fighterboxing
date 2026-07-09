// ==========================================
// ENGINE.JS - FIRST PERSON BOXING ULTIMATE (V9.0)
// [CHẾ ĐỘ GÓC NHÌN THỨ NHẤT - TRỤC Z 3D]
// [GIỮ NGUYÊN 8 HIỆU ỨNG THỜI TIẾT & HỆ THỐNG VFX ĐỈNH CAO]
// ==========================================

window.canvas = null; window.ctx = null; window.audioCtx = null; window.isMuted = false;
window.selectedRedClass = null; 
window.floatingTexts = []; window.particles = []; window.projectiles = []; 
window.traps = []; window.slashes = []; window.shockwaves = []; window.impactSparks = [];
window.auras = []; window.lasers = []; window.customObjs = []; 

// Biến hệ thống FPS
window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, isDodging: false, isBlocking: false, attackCooldown: 0 };
window.enemyZ = 120; // Trục Z: Khoảng cách của đối thủ (Lớn = Xa, Nhỏ = Áp sát)
window.enemyFaceImg = new Image(); // Chứa ảnh khuôn mặt thật

window.gameOver = false; window.isLoopRunning = false;
window.enemies = []; window.totalEnemyMaxHp = 0; window.rewardMultiplier = 1; 

window.shakeTime = 0; window.shakeMag = 0; window.hitStopFrames = 0; window.matchResolved = false;
window.screenFlash = 0; window.cinematicTimer = 0; window.cinematicCaster = null; window.cinematicCallback = null; 
window.slowMoTimer = 0; window.introTimer = 0; window.uiShakeP1 = 0; window.uiShakeP2 = 0;
window.currentWeather = 'none'; window.weatherParticles = [];

window.GROUND_Y = 320; window.GRAVITY = 0.8; window.lastFrameTime = 0; window.FRAME_MIN_TIME = 1000 / 60;
window.matchTimer = 0; window.impactFrameTimer = 0;

window.camX = 0; window.camY = 0; window.currentZoom = 1; window.cameraTilt = 0;
window.targetCamX = 0; window.targetCamY = 0; window.targetZoom = 1; window.targetTilt = 0;
window.globalWind = 0; window.chromaTimer = 0; 
window.envHazards = []; window.koGlitchTimer = 0; window.envDamage = []; 

const MAX_PARTICLES = 150; 
const MAX_SHOCKWAVES = 5;

// ==========================================
// 1. HỆ THỐNG ÂM THANH & RUNG
// ==========================================
window.triggerVibration = function(pattern) { 
    if (typeof window !== 'undefined' && navigator && navigator.vibrate) { 
        try { navigator.vibrate(pattern); } catch(e) {} 
    } 
}

window.toggleAudio = function(e) { 
    e.stopPropagation(); window.isMuted = !window.isMuted; 
    let btn = document.getElementById("btn-audio"); 
    if(btn) btn.innerText = window.isMuted ? "🔇" : "🔊"; 
    if (!window.isMuted && window.audioCtx && window.audioCtx.state === 'suspended') { window.audioCtx.resume(); } 
}

window.playSound = function(freq, type, duration, vol, isImpact = false) { 
    if (window.isMuted) return; 
    try {
        if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
        let t = window.audioCtx.currentTime; 
        
        let osc = window.audioCtx.createOscillator(); 
        let gain = window.audioCtx.createGain(); 
        osc.connect(gain); gain.connect(window.audioCtx.destination); 
        
        let safeVol = Math.min(vol, 1.0); 
        
        if (isImpact) { 
            osc.type = type === 'sine' ? 'triangle' : type; 
            osc.frequency.setValueAtTime(freq, t); 
            osc.frequency.exponentialRampToValueAtTime(15, t + Math.min(0.15, duration)); 
            gain.gain.setValueAtTime(safeVol, t); 
            gain.gain.exponentialRampToValueAtTime(0.01, t + duration); 
            
            let snap = window.audioCtx.createOscillator();
            let snapGain = window.audioCtx.createGain();
            snap.type = 'square';
            snap.frequency.setValueAtTime(freq * 3, t);
            snap.frequency.exponentialRampToValueAtTime(30, t + 0.05);
            snapGain.gain.setValueAtTime(safeVol * 0.4, t);
            snapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            
            snap.connect(snapGain); snapGain.connect(window.audioCtx.destination);
            snap.start(t); snap.stop(t + 0.05);
        } else { 
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t); 
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration); 
            gain.gain.setValueAtTime(0.01, t); 
            gain.gain.linearRampToValueAtTime(safeVol * 0.6, t + duration * 0.1); 
            gain.gain.exponentialRampToValueAtTime(0.01, t + duration); 
        }
        osc.start(t); osc.stop(t + duration); 
    } catch(e){}
}

// ==========================================
// 2. HỆ THỐNG SPAWN VFX
// ==========================================
window.shakeScreen = function(frames, magnitude) { window.shakeTime = frames; window.shakeMag = magnitude; }

window.spawnParticles = function(x, y, color, isCrit = false) { 
    if (window.particles.length > MAX_PARTICLES) return; 
    let count = isCrit ? 15 : 8; 
    for(let i=0; i<count; i++) { 
        let angle = Math.random() * Math.PI * 2; 
        let speed = Math.random() * (isCrit?12:6) + 2; 
        window.particles.push({ x: x, y: y - 30, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 20, maxLife: 20, color: color, size: Math.random() * 4 + 2 }); 
    } 
}

window.spawnDust = function(x, y) { 
    if (window.particles.length > MAX_PARTICLES) return;
    for(let i=0; i<6; i++) { 
        window.particles.push({ x: x + (Math.random()*30-15), y: y, vx: (Math.random()-0.5)*5, vy: -Math.random()*3 - 0.5, life: 20, maxLife: 20, color: "rgba(189, 195, 199, 0.4)", size: Math.random() * 8 + 5 }); 
    } 
}

// ==========================================
// 3. ĐIỀU KHIỂN & VẬT LÝ GÓC NHÌN THỨ NHẤT (FPS)
// ==========================================

// BẠN ĐẤM ĐỐI THỦ
window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isDodging || window.playerFPS.isBlocking) return;
    window.playerFPS.attackCooldown = 15; // Tốc độ vung tay
    window.playerFPS.stamina -= 8;
    
    // Kích hoạt CSS Animation cho găng tay
    let glove = document.getElementById(hand + "-glove");
    if(glove) {
        glove.classList.add(`glove-punch-${hand}`);
        setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150);
    }
    window.playSound(350, 'sine', 0.1, 0.3);

    let e = window.enemies[0];
    if (!e || e.hp <= 0) return;

    // Xét va chạm 3D: Địch phải ở đủ gần (Z < 55) thì mới đấm trúng
    if (window.enemyZ < 55 && !e.isDodging) {
        let isCrit = Math.random() < 0.15; // 15% chí mạng
        let dmg = 45 * (isCrit ? 2 : 1);
        
        e.hp -= dmg;
        e.state = 'hurt';
        e.hitStun = 20;
        e.attackTimer = 0; // Ngắt đòn đánh của địch
        
        window.enemyZ += 20; // Bị đấm văng ra xa một chút (Knockback 3D)
        
        // Hiệu ứng máu & Rung màn hình
        window.shakeScreen(isCrit ? 15 : 8, isCrit ? 10 : 5);
        window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 50, "#ff003c", isCrit);
        window.playSound(180, 'square', 0.2, 0.6, true);
        
        window.floatingTexts.push({ x: window.canvas.width/2 + (Math.random()*40-20), y: window.canvas.height/2 - 120, text: isCrit ? `💥 -${dmg}` : `-${dmg}`, color: isCrit ? "#ff4757" : "#fff", alpha: 1, vx: (Math.random()-0.5)*2, vy: -3, font: "900 35px Arial", life: 40 });
        
        // Cập nhật máu kẻ địch
        let hpBlue = document.getElementById("hp-blue");
        if(hpBlue) hpBlue.style.width = Math.max(0, (e.hp / e.maxHp * 100)) + "%";

        if (e.hp <= 0) {
            e.hp = 0; e.state = 'ko_falling'; e.koTimer = 100; e.vy = -10;
            window.matchResolved = true; window.gameOver = true;
            window.koGlitchTimer = 60;
            window.slowMoTimer = 60;
            window.floatingTexts.push({ x: window.canvas.width/2, y: 200, text: "K.O! BẠN ĐÃ THẮNG!", color: "#f1c40f", alpha: 1, vx: 0, vy: -1, font: "900 60px Arial", life: 180 });
        }
    } else {
        // Đấm trượt
        window.floatingTexts.push({ x: window.canvas.width/2 + (hand==='left'? -50:50), y: window.canvas.height/2, text: "MISS!", color: "#7f8c8d", alpha: 1, vx: 0, vy: -2, font: "bold 25px Arial", life: 25 });
    }
};

window.blockFPS = function() {
    if (window.playerFPS.stamina < 15 || window.gameOver || window.playerFPS.isDodging) return;
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
    window.playerFPS.isDodging = true;
    window.playerFPS.stamina -= 20;
    
    let dir = Math.random() > 0.5 ? "left" : "right";
    let canvasWrap = document.querySelector(".canvas-wrapper");
    if(canvasWrap) canvasWrap.classList.add(`camera-dodge-${dir}`);
    
    window.playSound(200, 'sine', 0.2, 0.4);

    setTimeout(() => {
        window.playerFPS.isDodging = false;
        if(canvasWrap) canvasWrap.classList.remove(`camera-dodge-${dir}`);
    }, 350);
};


// ==========================================
// 4. VÒNG LẶP UPDATE CHÍNH (LOGIC AI FPS)
// ==========================================
window.update = function() {
    if (!window.canvas) { window.canvas = document.getElementById("battleCanvas"); if(window.canvas) window.ctx = window.canvas.getContext("2d"); } 
    if (!window.canvas || !window.ctx) return; 

    if (window.gameOver) { window.matchEndTimer = (window.matchEndTimer || 0) + 1; }
    if (window.koGlitchTimer > 0) window.koGlitchTimer--;

    if (window.introTimer > 0) { 
        window.introTimer--; 
        if (window.introTimer === 120 && typeof window.speakAnnouncer === 'function') { window.speakAnnouncer("Ready?"); }
        if (window.introTimer === 60) { 
            window.playSound(100, 'sine', 0.5, 0.5, true); window.shakeScreen(15, 10);
            if(typeof window.speakAnnouncer === 'function') window.speakAnnouncer("Fight!");
        }
        return; 
    }

    window.globalWind = Math.sin(Date.now() / 2500) * 1.5;
    window.matchTimer++; 
    
    let isSlowMoFrame = false; if (window.slowMoTimer > 0) { window.slowMoTimer--; if (window.slowMoTimer % 4 !== 0) isSlowMoFrame = true; }
    if (window.shakeTime > 0) window.shakeTime--; 
    if (window.screenFlash > 0) window.screenFlash -= 0.05;

    if (isSlowMoFrame) return;

    // Hồi thể lực cho người chơi
    if (window.playerFPS.attackCooldown > 0) window.playerFPS.attackCooldown--;
    if (window.playerFPS.stamina < 100 && !window.playerFPS.isBlocking) window.playerFPS.stamina += 0.3;

    // --- CẬP NHẬT KẺ ĐỊCH (AI) ---
    let e = window.enemies[0];
    if (e && e.hp > 0 && !window.gameOver) {
        if (e.hitStun > 0) {
            e.hitStun--;
            if(e.hitStun <= 0) e.state = 'idle';
        } else {
            // Logic tấn công
            if (e.attackTimer > 0) {
                e.attackTimer--;
                
                // Đỉnh điểm của cú đấm (Hit Frame)
                if (e.attackTimer === 10) {
                    if (window.playerFPS.isDodging) {
                        // Kẻ địch đánh trượt
                        window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 - 50, text: "NÉ THÀNH CÔNG!", color: "#2ecc71", alpha: 1, vx: 0, vy: -2, font: "900 35px Arial", life: 40 });
                        window.enemyZ = 40; // Lỡ đà lao lên
                    } else if (window.playerFPS.isBlocking) {
                        // Bạn đỡ đòn
                        window.playSound(600, 'triangle', 0.2, 0.5, true);
                        window.shakeScreen(5, 3);
                        window.playerFPS.stamina -= 15;
                        window.enemyZ = 60; // Bị dội ngược ra
                        window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 + 50, text: "🛡️ BLOCKED", color: "#00f3ff", alpha: 1, vx: 0, vy: -2, font: "900 30px Arial", life: 30 });
                    } else {
                        // BẠN BỊ ĐẤM TRÚNG MẶT
                        let dmg = Math.floor(15 * e.dmgMod);
                        window.playerFPS.hp -= dmg;
                        window.shakeScreen(20, 15);
                        window.playSound(150, 'square', 0.3, 0.8, true);
                        
                        // Hiệu ứng nứt kính
                        let crack = document.getElementById("screen-crack");
                        if(crack) { crack.style.opacity = 1; setTimeout(() => crack.style.opacity = 0, 300); }
                        
                        if (window.playerFPS.hp <= 0) {
                            window.playerFPS.hp = 0; window.gameOver = true; window.matchResolved = true;
                            window.koGlitchTimer = 60;
                            window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2, text: "BẠN ĐÃ BỊ HẠ GỤC!", color: "#ff4757", alpha: 1, vx: 0, vy: -1, font: "900 50px Arial", life: 180 });
                        }
                    }
                    // Cập nhật HUD Máu bạn
                    let hpRed = document.getElementById("hp-red");
                    if(hpRed) hpRed.style.width = Math.max(0, (window.playerFPS.hp / window.playerFPS.maxHp * 100)) + "%";
                }
            } else {
                // Tiếp cận
                if (window.enemyZ > 25) {
                    window.enemyZ -= e.speed * 0.4;
                    e.state = 'walk';
                    // Lắc lư sang 2 bên
                    e.x = window.canvas.width/2 + Math.sin(Date.now()/300) * (50 + (100 - window.enemyZ)); 
                } else {
                    // Đủ gần -> Tung đòn!
                    e.state = ['punch', 'cross', 'hook', 'uppercut'][Math.floor(Math.random()*4)];
                    e.attackTimer = 25; // Setup frame vung tay
                    window.enemyZ += 5; // Giật lùi nhẹ tạo đà
                }
            }
        }
    }

    if (e && e.hp <= 0) {
        if(e.koTimer > 0) e.koTimer--;
        e.vy += window.GRAVITY; 
        e.y += e.vy; 
        window.enemyZ += 2; // Rơi xuống và lùi ra xa
        if (e.y > window.GROUND_Y) { e.y = window.GROUND_Y; e.vy = 0; e.state = 'dead'; }
    }

    // --- UPDATE HIỆU ỨNG & THỜI TIẾT ---
    for (let i = window.floatingTexts.length - 1; i >= 0; i--) { let t = window.floatingTexts[i]; t.y += t.vy; t.alpha -= 0.02; if (t.alpha <= 0) window.floatingTexts.splice(i, 1); }
    for (let i = window.particles.length - 1; i >= 0; i--) { let pt = window.particles[i]; pt.vy += window.GRAVITY * 0.5; pt.x += pt.vx; pt.y += pt.vy; pt.life--; if (pt.life <= 0) window.particles.splice(i, 1); }
    
    window.weatherParticles.forEach(w => { 
        w.y += w.speed; w.x += Math.sin(w.y/50)*2 + window.globalWind; 
        if(w.y > window.canvas.height + 20) { w.y = -20; w.x = Math.random() * window.canvas.width; } 
    });
}

// ==========================================
// 5. HỆ THỐNG VẼ ĐỒ HỌA TRUNG TÂM (DRAW FPS)
// ==========================================
window.draw = function() {
    if (!window.canvas || !window.ctx) return;
    
    window.ctx.setTransform(1, 0, 0, 1, 0, 0); 
    window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height); 
    window.ctx.save();
    
    if (window.shakeTime > 0) window.ctx.translate((Math.random() - 0.5) * window.shakeMag, (Math.random() - 0.5) * window.shakeMag); 
    
    // Nền đen dự phòng
    window.ctx.fillStyle = "#05050a"; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);

    // VẼ VÕ ĐÀI 3D (Gọi từ file graphics_v3.js)
    if (typeof window.drawBoxingRing === 'function') {
        window.drawBoxingRing(window.ctx, window.canvas.width, window.canvas.height);
    }

    // VẼ ĐỐI THỦ
    let e = window.enemies[0];
    if (e) {
        window.ctx.save();
        
        // TÍNH TOÁN 3D Z-SCALE
        let perspectiveScale = 300 / (200 + Math.max(0, window.enemyZ)); 
        let renderY = window.GROUND_Y + (100 - window.enemyZ) * 0.5; // Kéo xuống khi lại gần

        window.ctx.translate(e.x, renderY);
        window.ctx.scale(perspectiveScale, perspectiveScale);
        
        let cloneE = Object.assign({}, e, {x: 0, y: 0});
        
        // Vẽ Body bằng hàm FPS mới
        if (typeof window.drawStickman === 'function') {
            window.drawStickman(window.ctx, cloneE);
        }

        window.ctx.restore();
    }

    // VẼ THỜI TIẾT & HẠT
    window.particles.forEach(pt => { 
        window.ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / pt.maxLife)); window.ctx.fillStyle = pt.color; 
        window.ctx.beginPath(); window.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); window.ctx.fill(); 
    }); window.ctx.globalAlpha = 1.0;

    // VẼ CHỮ NỔI
    window.floatingTexts.forEach(t => { 
        window.ctx.font = t.font || "900 22px Arial"; window.ctx.fillStyle = t.color; window.ctx.shadowBlur = 5; window.ctx.shadowColor = t.color; 
        window.ctx.globalAlpha = Math.max(0, t.alpha); window.ctx.textAlign = "center";
        window.ctx.fillText(t.text, t.x, t.y); window.ctx.shadowBlur = 0; 
    }); window.ctx.globalAlpha = 1.0;

    // GLITCH & FLASH MÀN HÌNH
    if (window.screenFlash > 0) { window.ctx.fillStyle = `rgba(255, 255, 255, ${window.screenFlash})`; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }
    
    if (window.koGlitchTimer > 0) {
        window.ctx.fillStyle = `rgba(255, 0, 0, ${window.koGlitchTimer / 100})`;
        window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);
        window.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; 
        for(let i=0; i<window.canvas.height; i+=5) { window.ctx.fillRect(0, i, window.canvas.width, 1); }
    }

    if (window.introTimer > 0 && !window.gameOver) {
        window.ctx.fillStyle = "rgba(0, 0, 0, 0.85)"; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.textAlign = "center";
        if (window.introTimer > 60) {
            window.ctx.font = "italic 900 80px Arial"; window.ctx.fillStyle = "#f1c40f"; 
            window.ctx.fillText("CHUYẨN BỊ...", window.canvas.width/2, window.canvas.height/2); 
        } else { 
            let scale = 1 + (window.introTimer / 60) * 0.5; window.ctx.save(); window.ctx.translate(window.canvas.width/2, window.canvas.height/2); window.ctx.scale(scale, scale); 
            window.ctx.font = "italic 900 100px Arial"; window.ctx.fillStyle = "#ff4757"; 
            window.ctx.fillText("🥊 FIGHT! 🥊", 0, 30); window.ctx.restore(); 
        }
    }

    window.ctx.restore();
}

window.gameLoopFPS = function(timestamp) { 
    if (!window.isLoopRunning) return; requestAnimationFrame(window.gameLoopFPS); 
    if (!timestamp) timestamp = 0; let deltaTime = timestamp - window.lastFrameTime; 
    if (deltaTime >= window.FRAME_MIN_TIME) { 
        window.lastFrameTime = timestamp - (deltaTime % window.FRAME_MIN_TIME); 
        try { window.update(); } catch(e) { console.error("Lỗi Update", e) } 
        try { window.draw(); } catch(e) { console.error("Lỗi Draw", e) } 
    } 
}
