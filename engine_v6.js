// ==========================================
// ENGINE.JS - FATALITY CINEMATIC EDITION (V26.0)
// [ĐỈNH CAO: CHỚP ÂM BẢN X-RAY, VIỀN PHIM RẠP, 6 KIỂU NGÃ GỤC]
// ==========================================

window.canvas = null; window.ctx = null; window.audioCtx = null; window.isMuted = false;
window.floatingTexts = []; window.particles = []; window.shockwaves = [];
window.matchTimer = 0; window.shakeTime = 0; window.shakeMag = 0; window.koGlitchTimer = 0;
window.GROUND_Y = 320; window.GRAVITY = 0.8; window.lastFrameTime = 0; window.FRAME_MIN_TIME = 1000 / 60;
window.globalWind = 0;

window.camX = 0; window.camY = 0; window.cameraTilt = 0; window.camZoom = 1; window.targetZ = 120; 
window.damageFlashAlpha = 0; window.perfectDodgeFlash = 0; window.hitZoomTimer = 0; window.clutchFlashTimer = 0;
window.fatalBlowFlash = 0; // Biến chớp sáng X-Ray

window.playSound = function(freq, type, duration, vol, isImpact = false) { 
    if (window.isMuted) return; 
    try {
        if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
        let t = window.audioCtx.currentTime; let osc = window.audioCtx.createOscillator(); let gain = window.audioCtx.createGain(); 
        osc.connect(gain); gain.connect(window.audioCtx.destination); let safeVol = Math.min(vol, 1.0); 
        if (isImpact) { osc.type = type === 'sine' ? 'triangle' : type; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(15, t + Math.min(0.15, duration)); gain.gain.setValueAtTime(safeVol, t); gain.gain.exponentialRampToValueAtTime(0.01, t + duration); } 
        else { osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration); gain.gain.setValueAtTime(0.01, t); gain.gain.linearRampToValueAtTime(safeVol * 0.6, t + duration * 0.1); gain.gain.exponentialRampToValueAtTime(0.01, t + duration); }
        osc.start(t); osc.stop(t + duration); 
    } catch(e){}
}

window.shakeScreen = function(frames, magnitude) { window.shakeTime = frames; window.shakeMag = magnitude; }
window.spawnParticles = function(x, y, color, isCrit = false) { let count = isCrit ? 25 : 12; for(let i=0; i<count; i++) { let angle = Math.random() * Math.PI * 2; let speed = Math.random() * (isCrit?15:6) + 2; window.particles.push({ x: x, y: y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 30, maxLife: 30, color: color, size: Math.random() * 5 + 2 }); } }

// 🌟 HÀM KẾT LIỄU NÂNG CẤP (6 KIỂU)
window.triggerFatality = function(target) {
    target.hp = 0; target.state = 'ko_falling'; target.koTimer = 200;
    
    // 6 Kiểu Kết Liễu!
    let finishers = ['uppercut', 'knockback', 'crumple', 'spin', 'faceplant', 'backflip'];
    target.koType = finishers[Math.floor(Math.random() * finishers.length)];
    target.rotation = 0;
    
    let koText = "K.O!";
    if (target.koType === 'uppercut') { target.vy = -18; window.targetZ += 20; koText = "🚀 LAUNCHED!"; }
    else if (target.koType === 'knockback') { target.vy = -8; window.targetZ += 180; koText = "☄️ BLASTED!"; }
    else if (target.koType === 'crumple') { target.vy = 0; koText = "🥀 CRUMPLED!"; }
    else if (target.koType === 'spin') { target.vy = -14; window.targetZ += 50; koText = "🌪️ SPUN OUT!"; }
    else if (target.koType === 'faceplant') { target.vy = -4; window.targetZ -= 10; koText = "💀 FACEPLANT!"; }
    else if (target.koType === 'backflip') { target.vy = -16; window.targetZ += 60; koText = "🤸 BACKFLIPPED!"; }

    window.matchResolved = true; window.gameOver = true; window.koGlitchTimer = 80;
    window.hitZoomTimer = 120; // Zoom sát cảnh kết liễu cực lâu
    window.fatalBlowFlash = 10; // Kích hoạt chớp Âm bản (X-Ray)

    window.shakeScreen(50, 35);
    window.playSound(60, 'sawtooth', 2.0, 1.0, true);

    window.floatingTexts.push({ x: 400, y: 150, text: koText, color: "#f1c40f", alpha: 1, vx: 0, vy: -1.5, font: "italic 900 65px Impact", life: 180 });

    window.isLoopRunning = false;
    setTimeout(() => { if(!window.gameOver || window.matchResolved) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } }, 700);
};

window.moveFPS = function(dir) {
    if (window.playerFPS.stamina < 5 || window.gameOver || window.playerFPS.isDodging || window.playerFPS.guardBreakTimer > 0) return;
    window.playerFPS.stamina -= 5; window.targetZ += dir * 45; window.targetZ = Math.max(30, Math.min(220, window.targetZ)); 
    window.playerFPS.moveTimer = 25; window.playSound(200, 'sine', 0.1, 0.2);
};

window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isBlocking || window.playerFPS.guardBreakTimer > 0) return;
    window.playerFPS.attackCooldown = 15; window.playerFPS.stamina -= 10; 
    if (window.playerFPS.rage === undefined) window.playerFPS.rage = 0;

    let glove = document.getElementById(hand + "-glove");
    if(glove) { glove.classList.add(`glove-punch-${hand}`); setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150); }

    let e = window.enemies[0];
    if (e && e.hp > 0 && window.enemyZ <= 90) { 
        let isPerfectCounter = window.playerFPS.perfectDodgeBuff; window.playerFPS.perfectDodgeBuff = false; 

        if (e.attackTimer <= 0 && e.hitStun <= 0 && (!e.dodgeTimer || e.dodgeTimer <= 0) && window.playerFPS.rage < 100 && !isPerfectCounter) {
            let defenseRoll = Math.random();
            if (defenseRoll < 0.25) { 
                window.playerFPS.stamina -= 15; window.floatingTexts.push({ x: e.x, y: 150, text: "💨 SLIP!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "italic 900 30px Arial", life: 30 });
                e.dodgeDir = Math.random() > 0.5 ? 1 : -1; e.dodgeTimer = 35; e.baseTargetX = e.x; 
                if (Math.random() < 0.70) {
                    setTimeout(() => { if (e.hp > 0 && !window.gameOver && e.guardBreakTimer <= 0) { e.state = ['hook', 'uppercut'][Math.floor(Math.random()*2)]; e.attackTimer = 20; window.targetZ -= 25; window.floatingTexts.push({ x: e.x, y: 180, text: "⚡ COUNTER!", color: "#ff4757", alpha: 1, vx: 0, vy: -2, font: "italic 900 28px Arial", life: 30 }); } }, 150); 
                } return; 
            } else if (defenseRoll < 0.55) { 
                window.playSound(600, 'triangle', 0.2, 0.4, true); window.targetZ += 8; e.hp -= 2; window.playerFPS.rage += 5; 
                e.guardHealth = (e.guardHealth || 100) - 35; 
                if (e.guardHealth <= 0) { e.guardBreakTimer = 60; e.guardHealth = 100; window.hitZoomTimer = 15; window.floatingTexts.push({ x: e.x, y: 150, text: "💔 GUARD BREAK!", color: "#ff9f43", alpha: 1, vx: 0, vy: -3, font: "900 35px Arial", life: 50 }); window.shakeScreen(15, 10); } 
                else { window.floatingTexts.push({ x: e.x, y: 150, text: "🛡️ BLOCK!", color: "#3498db", alpha: 1, vx: 0, vy: -1, font: "900 30px Arial", life: 30 }); }
                return; 
            }
        }

        let isRagePunch = window.playerFPS.rage >= 100;
        let isCrit = Math.random() < 0.25 || isRagePunch || isPerfectCounter; 
        let dmg = 40; let punchColor = "#fff";

        if (isRagePunch) { dmg = 120; window.playerFPS.rage = 0; punchColor = "#f1c40f"; window.targetZ += 55; window.enemyZ += 35; e.targetLean = (Math.random() - 0.5) * 0.8; window.hitZoomTimer = 25; window.floatingTexts.push({ x: 400, y: 180, text: "🔥 MEGA SMASH TỐI THƯỢNG! 🔥", color: "#f1c40f", alpha: 1, vx: 0, vy: -3, font: "italic 900 38px Impact", life: 60 }); window.playSound(180, 'sawtooth', 0.6, 0.8, true); } 
        else if (isPerfectCounter) { dmg = 100; punchColor = "#00f3ff"; window.targetZ += 30; window.hitZoomTimer = 15; window.floatingTexts.push({ x: 400, y: 180, text: "⚔️ TRỪNG PHẠT! ⚔️", color: "#00f3ff", alpha: 1, vx: 0, vy: -2, font: "italic 900 32px Impact", life: 50 }); } 
        else { window.playerFPS.rage = Math.min(100, window.playerFPS.rage + 15); if (isCrit) { dmg = Math.floor(dmg * 1.8); punchColor = "#ff4757"; window.hitZoomTimer = 10; } }

        if (window.playerFPS.clutchActive) dmg = Math.floor(dmg * 1.4);
        e.hp -= dmg;
        
        if (e.hp <= 0) {
            window.triggerFatality(e);
            window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, "rgba(220, 0, 0, 0.9)", true); 
        } else {
            if (isCrit || isRagePunch || isPerfectCounter) { e.state = 'hurt'; e.hitStun = isRagePunch ? 45 : 25; e.attackTimer = 0; e.guardBreakTimer = 0; } else { if (e.attackTimer <= 0) { e.state = 'hurt'; e.hitStun = 10; } }
            let hitStopDuration = isRagePunch ? 150 : (isCrit || isPerfectCounter ? 80 : 0);
            if (hitStopDuration > 0) { window.isLoopRunning = false; setTimeout(() => { if(!window.gameOver) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } }, hitStopDuration); }
            window.shakeScreen(isCrit ? 18 : 8, isCrit ? 12 : 5);
            window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, punchColor, isCrit);
            let textLabel = isRagePunch ? `💥💥 -${dmg}` : (isCrit ? `💥 -${dmg}` : `-${dmg}`);
            window.floatingTexts.push({ x: e.x + (Math.random()*40-20), y: e.y - 120, text: textLabel, color: punchColor, alpha: 1, vx: 0, vy: -3, font: "900 35px Arial", life: 40 });
        }
    } else {
        window.playerFPS.stamina -= 12; window.floatingTexts.push({ x: window.canvas.width/2 + (hand==='left'? -80:80), y: window.canvas.height/2, text: "MISS!", color: "#7f8c8d", alpha: 1, vx: 0, vy: -1, font: "bold 25px Arial", life: 25 });
    }
};

window.blockFPS = function() { if (window.playerFPS.stamina <= 0 || window.gameOver || window.playerFPS.guardBreakTimer > 0) return; window.playerFPS.isBlocking = true; document.getElementById("left-glove").classList.add("glove-block-left"); document.getElementById("right-glove").classList.add("glove-block-right"); const releaseBlock = () => { window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); document.removeEventListener('mouseup', releaseBlock); document.removeEventListener('touchend', releaseBlock); }; document.addEventListener('mouseup', releaseBlock); document.addEventListener('touchend', releaseBlock); };
window.dodgeFPS = function() { if (window.playerFPS.stamina < 20 || window.playerFPS.isDodging || window.gameOver || window.playerFPS.guardBreakTimer > 0) return; let e = window.enemies[0]; let isPerfect = (e && e.attackTimer > 5 && e.attackTimer < 20); window.playerFPS.isDodging = true; window.playerFPS.iFrames = isPerfect ? 50 : 30; window.playerFPS.stamina -= (isPerfect ? 0 : 20); window.playerFPS.dodgeDir = Math.random() > 0.5 ? 1 : -1; window.playerFPS.dodgeTimer = isPerfect ? 45 : 35; if (isPerfect) { window.perfectDodgeFlash = 1.0; window.playerFPS.perfectDodgeBuff = true; window.playSound(800, 'sine', 0.5, 0.6); window.floatingTexts.push({ x: 400, y: window.canvas.height/2 + 80, text: "⚡ PERFECT DODGE! ⚡", color: "#00f3ff", alpha: 1, vx: 0, vy: -2, font: "italic 900 38px Arial", life: 50 }); e.attackTimer = 0; e.state = 'idle'; e.hitStun = 30; window.camZoom = 1.15; setTimeout(() => { let counterHand = window.playerFPS.dodgeDir === 1 ? 'right' : 'left'; window.punch(counterHand); }, 250); } else { window.playSound(200, 'sine', 0.2, 0.4); if (Math.random() < 0.75) { setTimeout(() => { let counterHand = window.playerFPS.dodgeDir === 1 ? 'right' : 'left'; window.punch(counterHand); }, 180); } } setTimeout(() => { window.playerFPS.isDodging = false; }, isPerfect ? 600 : 400); };

window.update = function() {
    if (!window.canvas) { window.canvas = document.getElementById("battleCanvas"); if(window.canvas) window.ctx = window.canvas.getContext("2d"); } 
    if (!window.canvas || !window.ctx) return; 

    window.clutchFlashTimer++; if (window.damageFlashAlpha > 0) window.damageFlashAlpha -= 0.04; if (window.perfectDodgeFlash > 0) window.perfectDodgeFlash -= 0.05; if (window.hitZoomTimer > 0) window.hitZoomTimer--;
    if (window.fatalBlowFlash > 0) window.fatalBlowFlash--; 
    
    if (window.koGlitchTimer > 0) window.koGlitchTimer--; if (window.introTimer > 0) { window.introTimer--; if (window.introTimer === 60) { window.playSound(100, 'sine', 0.5, 0.5, true); window.shakeScreen(15, 10); } return; }
    window.globalWind = Math.sin(Date.now() / 2500) * 1.5; window.matchTimer++; if (window.shakeTime > 0) window.shakeTime--; 
    
    if (window.playerFPS.attackCooldown > 0) window.playerFPS.attackCooldown--; if (window.playerFPS.iFrames > 0) window.playerFPS.iFrames--;
    if (!window.playerFPS.guardBreakTimer) window.playerFPS.guardBreakTimer = 0;
    
    if (window.playerFPS.guardBreakTimer > 0) { window.playerFPS.guardBreakTimer--; window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); } 
    else { if (window.playerFPS.isBlocking) { window.playerFPS.stamina -= 0.6; if (window.playerFPS.stamina <= 0) { window.playerFPS.guardBreakTimer = 45; window.shakeScreen(20, 15); window.damageFlashAlpha = 0.5; window.floatingTexts.push({ x: 400, y: window.canvas.height/2, text: "💔 BỊ PHÁ GIÁP!", color: "#ef4444", alpha: 1, vx: 0, vy: -1, font: "900 40px Impact", life: 60 }); } } else if (window.playerFPS.stamina < 100) { window.playerFPS.stamina += 0.45; } }

    let e = window.enemies[0];
    if (e && e.rage === undefined) e.rage = 0; if (e && !e.guardBreakTimer) e.guardBreakTimer = 0;
    if (e && e.guardBreakTimer > 0) { e.guardBreakTimer--; e.state = 'hurt'; e.hitStun = 10; } 

    if (window.playerFPS.hp <= 300 && !window.playerFPS.clutchUsed && !window.gameOver) { window.playerFPS.clutchUsed = true; window.playerFPS.clutchActive = true; window.playerFPS.stamina = 100; window.playerFPS.rage = 100; window.floatingTexts.push({ x: 400, y: 130, text: "🔥 TRẠNG THÁI SINH TỬ: LẬT KÈO!!! 🔥", color: "#f1c40f", alpha: 1, vx: 0, vy: -1, font: "italic 900 35px Impact", life: 90 }); window.playSound(800, 'sawtooth', 0.5, 0.5); window.shakeScreen(30, 15); }
    if (e && e.hp <= e.maxHp * 0.3 && !e.clutchUsed && !window.gameOver) { e.clutchUsed = true; e.clutchActive = true; e.rage = 100; window.floatingTexts.push({ x: e.x, y: e.y - 170, text: "🚨 ĐỊCH ĐIÊN CUỒNG BẠO KÍCH! 🚨", color: "#ff003c", alpha: 1, vx: 0, vy: -1, font: "italic 900 35px Impact", life: 90 }); window.playSound(140, 'square', 0.5, 0.5); window.shakeScreen(30, 15); }

    let targetCamX = 0; let targetCamY = 0; let targetTilt = 0; let targetZoom = 1.0;
    if (window.hitZoomTimer > 0) targetZoom = window.gameOver ? 1.25 : 1.15; // Phóng to cực đại khi K.O
    
    if (window.playerFPS.hp <= 0) {
        targetCamY = 300; targetTilt = -Math.PI / 6; targetZoom = 1.2; window.damageFlashAlpha = 0.6; 
    } else {
        targetCamY += Math.sin(window.matchTimer * 0.03) * 3; targetCamX += Math.cos(window.matchTimer * 0.02) * 2;
    }

    if (e && e.hp > 0) {
        let enemyOffsetX = e.x - 400; targetCamX += enemyOffsetX * 0.45; targetTilt += (enemyOffsetX / 400) * 0.08;
        document.documentElement.style.setProperty('--enemy-offset-x', `${enemyOffsetX * 0.5}px`); document.documentElement.style.setProperty('--enemy-tilt-rad', `${(enemyOffsetX / 400) * 0.15}rad`);
    }

    if (window.playerFPS.dodgeTimer > 0) { window.playerFPS.dodgeTimer--; let phase = Math.sin((window.playerFPS.dodgeTimer / (window.playerFPS.perfectDodgeBuff?45:35)) * Math.PI); targetCamX += window.playerFPS.dodgeDir * 240 * phase; targetTilt += window.playerFPS.dodgeDir * 0.25 * phase; targetCamY += 35 * phase; if(window.hitZoomTimer <= 0) targetZoom = 1.08; }
    if (window.playerFPS.moveTimer > 0) { window.playerFPS.moveTimer--; let phase = Math.sin((window.playerFPS.moveTimer / 25) * Math.PI); targetCamY += 15 * phase; if(window.hitZoomTimer <= 0) targetZoom = 1.03; }

    window.camX += (targetCamX - window.camX) * 0.12; window.camY += (targetCamY - window.camY) * 0.12; window.cameraTilt += (targetTilt - window.cameraTilt) * 0.12; window.camZoom += (targetZoom - window.camZoom) * 0.1;
    if (window.playerFPS.hp > 0) window.enemyZ += (window.targetZ - window.enemyZ) * 0.12; 

    let wrapper = document.querySelector(".canvas-wrapper");
    if (wrapper) { wrapper.style.transform = `scale(${window.camZoom}) translate(${-window.camX}px, ${window.camY}px) rotate(${-window.cameraTilt}rad)`; }

    if (e && e.hp > 0 && !window.gameOver && window.introTimer <= 0) {
        if (!window.playerFPS.aiStateTimer) window.playerFPS.aiStateTimer = 0;
        if (window.playerFPS.aiStateTimer > 0) window.playerFPS.aiStateTimer--;
        if (!window.playerFPS.isBlocking && e.hitStun <= 0 && (!window.playerFPS.dodgeTimer || window.playerFPS.dodgeTimer <= 0) && window.playerFPS.guardBreakTimer <= 0) {
            if (window.playerFPS.aiStateTimer <= 0) {
                window.playerFPS.aiStateTimer = window.playerFPS.clutchActive ? Math.floor(10 + Math.random() * 15) : Math.floor(20 + Math.random() * 20); 
                if (e.attackTimer > 5 && e.attackTimer < 18) { 
                    let defendRoll = Math.random(); if (defendRoll < 0.25 && window.playerFPS.stamina > 20) { window.blockFPS(); setTimeout(() => { if(window.playerFPS.guardBreakTimer <= 0) { window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); } }, 400); } else if (defendRoll < 0.70) { window.dodgeFPS(); }
                } else if (window.playerFPS.stamina > 25 || window.playerFPS.clutchActive) { 
                    if (window.enemyZ > 75) { window.moveFPS(-1); window.playerFPS.aiStateTimer = 8; } else { let hand = Math.random() > 0.5 ? 'left' : 'right'; window.punch(hand); }
                } else { window.moveFPS(1); window.playerFPS.aiStateTimer = 35; }
            }
        }
    }

    if (e && e.hp > 0 && !window.gameOver) {
        if (!e.baseTargetX) e.baseTargetX = 400; if (!e.targetX) e.targetX = 400; if (!e.lean) e.lean = 0; if (!e.targetLean) e.targetLean = 0;
        if (e.hitStun > 0 || e.guardBreakTimer > 0) { if (e.hitStun > 0) e.hitStun--; if (e.hitStun <= 0 && e.guardBreakTimer <= 0) e.state = 'idle'; } 
        else {
            if (e.dodgeTimer && e.dodgeTimer > 0) { e.dodgeTimer--; let phase = Math.sin((e.dodgeTimer / 35) * Math.PI); e.targetX = e.baseTargetX + e.dodgeDir * 240 * phase; e.targetLean = e.dodgeDir * 0.55 * phase; if (e.attackTimer > 0) { e.attackTimer--; if (e.attackTimer === 8) window.enemyAttackAction(e); } } 
            else {
                if (e.attackTimer > 0) { e.attackTimer--; if (e.attackTimer === 8) window.enemyAttackAction(e); } 
                else {
                    if (window.matchTimer % 45 === 0) { e.baseTargetX = 400 + (Math.random() - 0.5) * 180; if (window.enemyZ > 65) window.targetZ = 35; else if (Math.random() < 0.1) window.targetZ = 95; }
                    e.targetX = e.baseTargetX; e.targetLean = -(e.x - 400) * 0.002; e.targetX += Math.sin(window.matchTimer * 0.05) * 5; 
                    let attackChance = e.clutchActive ? 0.22 : 0.13;
                    if (window.enemyZ <= 85 && Math.random() < attackChance) { e.state = ['punch', 'cross', 'hook', 'uppercut'][Math.floor(Math.random()*4)]; e.attackTimer = 22; e.targetLean = (Math.random() - 0.5) * 0.4; } else if (Math.abs(e.targetX - e.x) > 15) { e.state = 'dash'; } else { e.state = 'idle'; }
                }
            } e.x += (e.targetX - e.x) * 0.12; e.lean += (e.targetLean - e.lean) * 0.15; 
        }
    }

    // 🌟 VẬT LÝ NGÃ RAGDOLL 6 KIỂU KHÁC NHAU
    if (e && e.hp <= 0) { 
        if(e.koTimer > 0) e.koTimer--; 
        
        if (e.koType === 'spin' && e.state === 'ko_falling') e.rotation += 0.35; 
        if (e.koType === 'backflip' && e.state === 'ko_falling') { e.rotation -= 0.2; window.enemyZ += 2; }
        
        if (e.koType === 'crumple') {
            if (e.state === 'ko_falling') { e.y += 2.5; if (e.y > window.GROUND_Y + 50) { e.state = 'dead'; } }
        } else {
            e.vy += window.GRAVITY; e.y += e.vy; 
            
            if (e.koType === 'knockback') window.enemyZ += 6; 
            if (e.koType === 'uppercut') window.enemyZ += 0.5;
            
            // Xử lý nảy trên mặt đất
            if (e.y > window.GROUND_Y) { 
                e.y = window.GROUND_Y; 
                if (e.bounceCount === undefined) e.bounceCount = 0;
                
                if (e.koType === 'uppercut' && e.bounceCount < 1) {
                    e.vy = -7; e.bounceCount++; window.playSound(250, 'square', 0.2, 0.4, true); 
                } else if (e.koType === 'spin' && e.bounceCount < 1) {
                    e.vy = -4; e.bounceCount++; window.playSound(250, 'square', 0.2, 0.4, true);
                } else if (e.koType === 'backflip' && e.bounceCount < 1) {
                    e.vy = -6; e.bounceCount++; window.playSound(200, 'square', 0.3, 0.5, true);
                } else {
                    e.vy = 0; e.state = 'dead'; 
                }
            } 
        }
    }

    let h1 = document.getElementById("hp-red"), h2 = document.getElementById("hp-blue"), s1 = document.getElementById("stamina-red");
    if(h1) h1.style.width = (window.playerFPS.hp / window.playerFPS.maxHp * 100) + "%"; if(h2 && e) h2.style.width = (e.hp / e.maxHp * 100) + "%"; if(s1) s1.style.width = window.playerFPS.stamina + "%";
    
    for (let i = window.floatingTexts.length - 1; i >= 0; i--) { let t = window.floatingTexts[i]; t.y += t.vy; t.alpha -= 0.02; if (t.alpha <= 0) window.floatingTexts.splice(i, 1); }
    for (let i = window.particles.length - 1; i >= 0; i--) { let pt = window.particles[i]; pt.vy += window.GRAVITY * 0.5; pt.x += pt.vx; pt.y += pt.vy; pt.life--; if (pt.life <= 0) window.particles.splice(i, 1); }
    if(window.weatherParticles) { window.weatherParticles.forEach(w => { w.y += w.speed; w.x += Math.sin(w.y/50)*2 + window.globalWind; if(w.y > window.canvas.height + 20) { w.y = -20; w.x = Math.random() * window.canvas.width; } }); }
}

window.enemyAttackAction = function(e) {
    if (window.playerFPS.iFrames > 0 || window.playerFPS.isDodging || window.enemyZ > 90) { 
        window.floatingTexts.push({ x: 400, y: 200, text: "MISS!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "900 35px Arial", life: 40 }); window.targetZ += 15; e.targetLean = (Math.random() - 0.5) * 0.2;
    } 
    else if (window.playerFPS.isBlocking) { 
        window.playSound(600, 'triangle', 0.2, 0.5, true); window.shakeScreen(5, 3); window.playerFPS.stamina -= 25; window.targetZ += 15; window.playerFPS.rage += 12; 
        if (window.playerFPS.stamina <= 0) { window.playerFPS.guardBreakTimer = 45; window.shakeScreen(20, 15); window.damageFlashAlpha = 0.5; window.floatingTexts.push({ x: 400, y: window.canvas.height/2, text: "💔 BỊ PHÁ GIÁP!", color: "#ef4444", alpha: 1, vx: 0, vy: -1, font: "900 40px Impact", life: 60 }); }
    } 
    else {
        let dmg = Math.floor((22 + Math.random() * 8) * e.dmgMod); if (e.clutchActive) dmg = Math.floor(dmg * 1.4); 
        if (window.enemyZ >= 190) { dmg = Math.floor(dmg * 1.3); window.floatingTexts.push({ x: 400, y: 230, text: "💥 BỊ ÉP GÓC ĐAU ĐỚN!", color: "#ff4d4d", alpha: 1, vx: 0, vy: -1, font: "bold 25px Arial", life: 30 }); }
        
        window.playerFPS.hp -= dmg; window.playerFPS.rage = Math.min(100, (window.playerFPS.rage || 0) + 20); window.shakeScreen(28, 20); window.playSound(150, 'square', 0.3, 0.8, true); window.damageFlashAlpha = 0.65; 
        
        let crack = document.getElementById("screen-crack"); if(crack) { crack.style.opacity = 1; setTimeout(() => crack.style.opacity = 0, 300); }
        if (window.playerFPS.hp <= 0) { 
            window.playerFPS.hp = 0; window.gameOver = true; window.koGlitchTimer = 60; 
            window.floatingTexts.push({ x: 400, y: 200, text: "VÕ SĨ CỦA BẠN ĐÃ GỤC!", color: "#ff4757", alpha: 1, vx: 0, vy: -1, font: "900 40px Arial", life: 180 }); 
            window.spawnParticles(window.canvas.width/2, window.canvas.height/2, "rgba(220, 0, 0, 0.9)", true); 
        }
    }
}

// ==========================================
// 4. VÒNG LẶP VẼ (DRAW ĐIỆN ẢNH BỘ LỌC)
// ==========================================
window.draw = function() {
    if (!window.canvas || !window.ctx) return;
    window.ctx.setTransform(1, 0, 0, 1, 0, 0); window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.save();

    // 🌟 KHI GAME OVER -> MÀU SẮC CHUYỂN U ÁM (CINEMATIC DEATH SCREEN)
    if (window.gameOver && window.matchResolved) {
        window.ctx.filter = "grayscale(80%) sepia(50%) hue-rotate(-30deg) contrast(120%)";
    }
    
    if (window.shakeTime > 0) { window.ctx.translate((Math.random() - 0.5) * window.shakeMag, (Math.random() - 0.5) * window.shakeMag); }

    // 🌟 X-RAY FLASH ÂM BẢN KHI RA ĐÒN KẾT LIỄU
    if (window.fatalBlowFlash > 0) {
        window.ctx.filter = "invert(100%) contrast(150%) hue-rotate(180deg)";
    }

    if (typeof window.drawBoxingRing === 'function') { window.drawBoxingRing(window.ctx, window.canvas.width, window.canvas.height); } 
    else { window.ctx.fillStyle = "#05050a"; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }

    let e = window.enemies[0];
    if (e) {
        window.ctx.save();
        let perspectiveScale = 300 / (200 + Math.max(0, window.enemyZ)); let renderY = window.GROUND_Y + (100 - window.enemyZ) * 0.5;
        window.ctx.translate(e.x, renderY); window.ctx.scale(perspectiveScale, perspectiveScale);
        if (e.lean) window.ctx.rotate(e.lean); 
        let cloneE = Object.assign({}, e, {x: 0, y: 0});
        if (typeof window.drawStickman === 'function') { window.drawStickman(window.ctx, cloneE); }
        window.ctx.restore();
    }

    window.ctx.filter = "none"; // Xóa bộ lọc cho các thành phần HUD/Hạt bên trên

    if(window.weatherParticles) {
        window.ctx.lineWidth = 2;
        window.weatherParticles.forEach(w => { 
            if (window.currentWeather === 'snow') { window.ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; window.ctx.beginPath(); window.ctx.arc(w.x, w.y, w.size, 0, Math.PI*2); window.ctx.fill(); } 
            else if (window.currentWeather === 'rain' || window.currentWeather === 'blood_rain') { window.ctx.strokeStyle = window.currentWeather === 'rain' ? "rgba(155, 155, 255, 0.6)" : "rgba(214, 48, 49, 0.75)"; window.ctx.beginPath(); window.ctx.moveTo(w.x, w.y); window.ctx.lineTo(w.x - 6, w.y + 15); window.ctx.stroke(); } 
        });
    }

    window.particles.forEach(pt => { window.ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / pt.maxLife)); window.ctx.fillStyle = pt.color; window.ctx.beginPath(); window.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); window.ctx.fill(); }); window.ctx.globalAlpha = 1.0;
    window.floatingTexts.forEach(t => { window.ctx.font = t.font || "900 22px Arial"; window.ctx.fillStyle = t.color; window.ctx.shadowBlur = 5; window.ctx.shadowColor = t.color; window.ctx.globalAlpha = Math.max(0, t.alpha); window.ctx.textAlign = "center"; window.ctx.fillText(t.text, t.x, t.y); window.ctx.shadowBlur = 0; }); window.ctx.globalAlpha = 1.0;

    if (window.perfectDodgeFlash > 0 && !window.gameOver) { let dodgeGrad = window.ctx.createRadialGradient(window.canvas.width/2, window.canvas.height/2, 100, window.canvas.width/2, window.canvas.height/2, 800); dodgeGrad.addColorStop(0, "rgba(0, 243, 255, 0)"); dodgeGrad.addColorStop(1, `rgba(0, 243, 255, ${window.perfectDodgeFlash * 0.5})`); window.ctx.fillStyle = dodgeGrad; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }
    if (window.playerFPS.clutchActive && Math.floor(window.clutchFlashTimer / 8) % 2 === 0 && !window.gameOver) { let grad = window.ctx.createRadialGradient(window.canvas.width/2, window.canvas.height/2, 200, window.canvas.width/2, window.canvas.height/2, 500); grad.addColorStop(0, "rgba(241, 196, 15, 0)"); grad.addColorStop(1, "rgba(241, 196, 15, 0.25)"); window.ctx.fillStyle = grad; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }
    if (window.damageFlashAlpha > 0 && !window.gameOver) { window.ctx.fillStyle = `rgba(255, 0, 0, ${window.damageFlashAlpha})`; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }
    
    // 🌟 2 DẢI VIỀN ĐEN PHIM RẠP KHI K.O (Cinematic Letterbox)
    if (window.gameOver && window.matchResolved) {
        window.ctx.fillStyle = "#000";
        window.ctx.fillRect(0, 0, window.canvas.width, 80); // Viền trên
        window.ctx.fillRect(0, window.canvas.height - 80, window.canvas.width, 80); // Viền dưới
    }

    if (window.introTimer > 0 && !window.gameOver) {
        window.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.textAlign = "center";
        if (window.introTimer > 60) { window.ctx.font = "italic 900 60px Arial"; window.ctx.fillStyle = "#f1c40f"; window.ctx.fillText("CHUẨN BỊ...", window.canvas.width/2, window.canvas.height/2); } 
        else { let scale = 1 + (window.introTimer / 60) * 0.5; window.ctx.save(); window.ctx.translate(window.canvas.width/2, window.canvas.height/2); window.ctx.scale(scale, scale); window.ctx.font = "italic 900 80px Arial"; window.ctx.fillStyle = "#ff4757"; window.ctx.fillText("🥊 FIGHT! 🥊", 0, 20); window.ctx.restore(); }
    }
    window.ctx.restore();
}

window.gameLoopFPS = function(timestamp) { 
    if (!window.isLoopRunning) return; requestAnimationFrame(window.gameLoopFPS); 
    if (!timestamp) timestamp = 0; let deltaTime = timestamp - window.lastFrameTime; 
    if (deltaTime >= window.FRAME_MIN_TIME) { window.lastFrameTime = timestamp - (deltaTime % window.FRAME_MIN_TIME); try { window.update(); } catch(e) {} try { window.draw(); } catch(e) {} } 
}
