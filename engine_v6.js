// ==========================================
// ENGINE.JS - DESTRUCTIVE FINISH EDITION (V32.0)
// [ĐỈNH CAO NHẤT: SCREEN SPLAT, KANJI HỦY DIỆT, ĐẤT ĐÁ VĂNG TUNG TÓE, KHIÊN PARRY]
// ==========================================

window.canvas = null; window.ctx = null; window.audioCtx = null; window.isMuted = false;
window.floatingTexts = []; window.particles = []; window.shockwaves = []; window.screenBlood = []; 
window.bloodPools = []; window.floorSplatters = []; window.glassShards = []; window.debris = []; // 🌟 Đất đá văng
window.matchTimer = 0; window.shakeTime = 0; window.shakeMag = 0; window.koGlitchTimer = 0;
window.GROUND_Y = 320; window.GRAVITY = 0.8; window.lastFrameTime = 0; window.FRAME_MIN_TIME = 1000 / 60;
window.globalWind = 0;

window.camX = 0; window.camY = 0; window.cameraTilt = 0; window.camZoom = 1; window.targetZ = 120; 
window.damageFlashAlpha = 0; window.perfectDodgeFlash = 0; window.hitZoomTimer = 0; window.clutchFlashTimer = 0;
window.fatalBlowFlash = 0; window.blackoutTimer = 0; window.parryShieldRadius = 0;

window.speedLinesAlpha = 0; window.heartbeatPhase = 0; window.whiteFlashAlpha = 0;
window.clashStruggleTimer = 0; window.destructiveFinishTimer = 0; // 🌟 Chữ Kanji Hủy Diệt

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
window.spawnScreenBlood = function() { for(let i=0; i<3; i++) { window.screenBlood.push({ x: Math.random()*800, y: Math.random()*600, size: 20 + Math.random()*50, alpha: 0.85, vy: 0.5 + Math.random() }); } }

window.spawnDamageNumber = function(x, y, text, color, isCrit) {
    let size = isCrit ? 55 : 35;
    window.floatingTexts.push({ x: x, y: y, text: text, color: color, alpha: 1.5, vx: (Math.random() - 0.5) * 10, vy: -(Math.random() * 8 + 6), font: `900 ${size}px Impact`, life: 80, isPhysics: true });
};

// 🌟 HÀM TẠO ĐẤT ĐÁ VĂNG (DEBRIS)
window.spawnDebris = function(x, y, count) {
    for(let i=0; i<count; i++) {
        window.debris.push({
            x: x + (Math.random()-0.5)*100, y: y + 50,
            vx: (Math.random()-0.5)*25, vy: -(Math.random()*15 + 10),
            rot: Math.random()*Math.PI, vRot: (Math.random()-0.5)*0.5,
            size: Math.random()*15 + 5, life: 100
        });
    }
};

window.handleAnimeComeback = function(fighter, isPlayer) {
    if (!fighter.animeComebackUsed && Math.random() < 0.35) { 
        fighter.animeComebackUsed = true; fighter.hp = 1; fighter.rage = 100; fighter.stamina = 100;
        window.shakeScreen(50, 20); window.playSound(50, 'sawtooth', 2.0, 1.0, true);
        window.isLoopRunning = false; window.damageFlashAlpha = 1.0; window.speedLinesAlpha = 1.0; 
        window.shockwaves.push({ x: 400, y: 300, radius: 10, maxRadius: 1000, alpha: 1, speed: 25, thickness: 40, color: "#ff003c" });
        window.spawnDamageNumber(400, 300, "🔥 Ý CHÍ BẤT DIỆT! 🔥", "#ff003c", true);
        setTimeout(() => { if(!window.gameOver) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } }, 1800); 
        return true; 
    }
    return false; 
}

window.triggerFatality = function(target, isSmash = false) {
    target.hp = 0; target.state = 'ko_falling'; target.koTimer = 200;
    
    // 🌟 THÊM KIỂU SCREENSPLAT (Đập vào màn hình)
    let finishers = ['uppercut', 'knockback', 'crumple', 'spin', 'faceplant', 'backflip', 'screensplat'];
    target.koType = finishers[Math.floor(Math.random() * finishers.length)]; 
    target.rotation = 0; target.hasHitScreen = false;
    
    let koText = "K.O!";
    if (target.koType === 'uppercut') { target.vy = -20; window.targetZ += 20; koText = "🚀 LAUNCHED!"; }
    else if (target.koType === 'knockback') { target.vy = -8; window.targetZ += 220; koText = "☄️ BLASTED!"; }
    else if (target.koType === 'crumple') { target.vy = 0; koText = "🥀 CRUMPLED!"; }
    else if (target.koType === 'spin') { target.vy = -16; window.targetZ += 50; koText = "🌪️ SPUN OUT!"; }
    else if (target.koType === 'faceplant') { target.vy = -4; window.targetZ -= 10; koText = "💀 FACEPLANT!"; }
    else if (target.koType === 'backflip') { target.vy = -18; window.targetZ += 80; koText = "🤸 BACKFLIPPED!"; }
    else if (target.koType === 'screensplat') { target.vy = -6; window.targetZ = -120; koText = "📺 SCREEN SPLAT!"; } // 🌟 Bắn thẳng về phía Camera

    window.matchResolved = true; window.gameOver = true; window.koGlitchTimer = 80; window.hitZoomTimer = 120; window.fatalBlowFlash = 10; 
    window.whiteFlashAlpha = 1.0; window.speedLinesAlpha = 1.0; 
    
    if (isSmash) {
        window.destructiveFinishTimer = 250; // 🌟 BẬT KANJI DESTRUCTIVE FINISH
        for(let i=0; i<30; i++) { window.glassShards.push({ x: 400 + (Math.random()-0.5)*200, y: 300 + (Math.random()-0.5)*200, vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20, rot: Math.random()*Math.PI*2, vRot: (Math.random()-0.5)*0.5, size: Math.random()*40 + 10, life: 100 }); }
        window.playSound(400, 'square', 1.0, 1.0, true); 
    }

    window.shakeScreen(50, 35); window.playSound(60, 'sawtooth', 2.0, 1.0, true);
    window.spawnDamageNumber(400, 150, koText, "#f1c40f", true);

    window.isLoopRunning = false;
    setTimeout(() => { if(!window.gameOver || window.matchResolved) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } }, 700);
};

window.moveFPS = function(dir) {
    if (window.playerFPS.stamina < 5 || window.gameOver || window.playerFPS.isDodging || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return;
    window.playerFPS.stamina -= 5; window.targetZ += dir * 45; window.targetZ = Math.max(30, Math.min(220, window.targetZ)); 
    window.playerFPS.moveTimer = 25; window.playSound(200, 'sine', 0.1, 0.2);
};

window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isBlocking || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return;
    window.playerFPS.attackCooldown = 15; window.playerFPS.stamina -= 10; 
    if (window.playerFPS.rage === undefined) window.playerFPS.rage = 0;
    if (window.playerFPS.combo === undefined) window.playerFPS.combo = 0; 

    let glove = document.getElementById(hand + "-glove");
    if(glove) { glove.classList.add(`glove-punch-${hand}`); setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150); }

    let e = window.enemies[0];
    if (e && e.hp > 0 && window.enemyZ <= 90) { 
        let isPerfectCounter = window.playerFPS.perfectDodgeBuff; window.playerFPS.perfectDodgeBuff = false; 

        // CLASH
        if (e.attackTimer > 5 && e.attackTimer < 18 && !isPerfectCounter && window.playerFPS.rage < 100) {
            window.clashStruggleTimer = 45; 
            e.attackTimer = 0; window.playerFPS.attackCooldown = 45; window.whiteFlashAlpha = 0.8; 
            window.targetZ += 50; window.enemyZ += 30; 
            window.cameraTilt = (Math.random() > 0.5 ? 0.3 : -0.3); 
            window.shakeScreen(45, 30); window.playSound(100, 'square', 0.8, 1.0, true);
            window.hitZoomTimer = 45; window.fatalBlowFlash = 6; 
            window.shockwaves.push({ x: 400, y: 300, radius: 20, maxRadius: 600, alpha: 1, speed: 20, thickness: 15, color: "#fff" });
            window.spawnDamageNumber(400, 200, "⚔️ POWER STRUGGLE! ⚔️", "#ffffff", true);
            window.spawnParticles(400, 150, "#f1c40f", true);
            window.spawnDebris(400, window.GROUND_Y, 20); // 🌟 Bắn tung đất đá lên
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
                if (e.guardHealth <= 0) { e.guardBreakTimer = 60; e.guardHealth = 100; window.hitZoomTimer = 15; window.whiteFlashAlpha = 0.6; window.spawnDamageNumber(e.x, 150, "💔 GUARD BREAK!", "#ff9f43", true); window.shakeScreen(15, 10); } 
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
            window.spawnDamageNumber(400, 180, "🔥 MEGA SMASH! 🔥", "#f1c40f", true); 
            window.playSound(180, 'sawtooth', 0.6, 0.8, true); window.shockwaves.push({ x: 400, y: 300, radius: 30, maxRadius: 1000, alpha: 1, speed: 30, thickness: 35, color: "#f1c40f" }); 
            window.spawnDebris(e.x, window.GROUND_Y, 40); // 🌟 Mega Smash cày nát sàn đấu
        } 
        else if (isPerfectCounter) { dmg = 100 * comboMult; punchColor = "#00f3ff"; window.targetZ += 30; window.hitZoomTimer = 15; window.whiteFlashAlpha = 0.6; window.cameraTilt = 0.15; window.spawnDamageNumber(400, 180, "⚔️ TRỪNG PHẠT! ⚔️", "#00f3ff", true); } 
        else { window.playerFPS.rage = Math.min(100, window.playerFPS.rage + 15); if (isCrit) { dmg = Math.floor(dmg * 1.8); punchColor = "#ff4757"; window.hitZoomTimer = 10; window.whiteFlashAlpha = 0.4; window.cameraTilt = (Math.random() > 0.5 ? 0.1 : -0.1); } }

        if (window.playerFPS.clutchActive) dmg = Math.floor(dmg * 1.4);
        window.targetZ += (isCrit ? 30 : 10); 
        if (window.targetZ >= 200 && !isRagePunch) { window.targetZ -= 80; e.vy = -6; e.hitStun += 35; dmg = Math.floor(dmg * 1.5); window.spawnDamageNumber(e.x, 130, "💢 BẬT DÂY ĐÀI!", "#ff4d4d", true); window.shakeScreen(25, 20); window.playSound(250, 'triangle', 0.4, 0.8, true); }

        e.hp -= dmg;
        if (isCrit || isRagePunch) { window.floorSplatters.push({ x: e.x + (Math.random()-0.5)*150, z: window.enemyZ + (Math.random()-0.5)*50, size: 5 + Math.random()*15, color: "rgba(180, 0, 0, 0.6)" }); }

        if (e.hp <= 0) {
            if (!window.handleAnimeComeback(e, false)) { window.triggerFatality(e, isRagePunch); window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, "rgba(220, 0, 0, 0.9)", true); window.spawnScreenBlood(); }
        } else {
            if (isCrit || isRagePunch || isPerfectCounter) { e.state = 'hurt'; e.hitStun = isRagePunch ? 45 : 25; e.attackTimer = 0; e.guardBreakTimer = 0; if (isCrit) window.spawnScreenBlood(); } else { if (e.attackTimer <= 0) { e.state = 'hurt'; e.hitStun = 10; } }
            let hitStopDuration = isRagePunch ? 180 : (isCrit || isPerfectCounter ? 80 : 0);
            if (hitStopDuration > 0) { window.isLoopRunning = false; setTimeout(() => { if(!window.gameOver) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } }, hitStopDuration); }
            window.shakeScreen(isCrit ? 22 : 8, isCrit ? 15 : 5); window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, punchColor, isCrit);
            
            if (window.playerFPS.combo > 1) {
                let comboRank = "NICE!"; let fontSize = 35;
                if (window.playerFPS.combo >= 3) { comboRank = "🔥 AWESOME!"; fontSize = 42; }
                if (window.playerFPS.combo >= 5) { comboRank = "⚡ UNSTOPPABLE!"; fontSize = 50; punchColor = "#00f3ff"; }
                if (window.playerFPS.combo >= 7) { comboRank = "👑 GODLIKE!!!"; fontSize = 65; punchColor = "#f1c40f"; window.shakeScreen(8, 8); }
                window.spawnDamageNumber(250 + Math.random()*20, 250 + Math.random()*20, `${comboRank} (x${window.playerFPS.combo})`, punchColor, window.playerFPS.combo >= 5);
            }
            window.spawnDamageNumber(e.x + (Math.random()*40-20), e.y - 120, isRagePunch ? `💥💥 -${Math.floor(dmg)}` : (isCrit ? `💥 -${Math.floor(dmg)}` : `-${Math.floor(dmg)}`), punchColor, isCrit);
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
        window.parryShieldRadius = 150; // 🌟 BẬT KHIÊN PARRY
        window.spawnDamageNumber(400, window.canvas.height/2 + 50, "🛡️ PERFECT PARRY! 🛡️", "#f1c40f", true);
        window.spawnParticles(400, 300, "#f1c40f", true); window.shockwaves.push({ x: 400, y: 300, radius: 10, maxRadius: 400, alpha: 1, speed: 20, thickness: 10, color: "#f1c40f" });
        e.attackTimer = 0; e.hitStun = 30; window.playerFPS.parryInvuln = 10; 
    }

    const releaseBlock = () => { window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); document.removeEventListener('mouseup', releaseBlock); document.removeEventListener('touchend', releaseBlock); }; 
    document.addEventListener('mouseup', releaseBlock); document.addEventListener('touchend', releaseBlock); 
};

window.dodgeFPS = function() { 
    if (window.playerFPS.stamina < 20 || window.playerFPS.isDodging || window.gameOver || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return; 
    let e = window.enemies[0]; let isPerfect = (e && e.attackTimer > 5 && e.attackTimer < 20); 
    window.playerFPS.isDodging = true; window.playerFPS.iFrames = isPerfect ? 50 : 30; window.playerFPS.stamina -= (isPerfect ? 0 : 20); window.playerFPS.dodgeDir = Math.random() > 0.5 ? 1 : -1; window.playerFPS.dodgeTimer = isPerfect ? 45 : 35; 
    if (isPerfect) { 
        window.perfectDodgeFlash = 1.0; window.speedLinesAlpha = 1.0; window.playerFPS.perfectDodgeBuff = true; window.playSound(800, 'sine', 0.5, 0.6); window.spawnDamageNumber(400, window.canvas.height/2 + 80, "⚡ MATRIX DODGE! ⚡", "#00f3ff", true); 
        window.camZoom = 1.25; window.cameraTilt = window.playerFPS.dodgeDir * 0.4;
        e.attackTimer = 0; e.state = 'idle'; e.hitStun = 40; 
        window.isLoopRunning = false; setTimeout(() => { if(!window.gameOver) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } }, 300);
        setTimeout(() => { let counterHand = window.playerFPS.dodgeDir === 1 ? 'right' : 'left'; window.punch(counterHand); }, 450); 
    } else { window.playSound(200, 'sine', 0.2, 0.4); if (Math.random() < 0.75) { setTimeout(() => { let counterHand = window.playerFPS.dodgeDir === 1 ? 'right' : 'left'; window.punch(counterHand); }, 180); } } setTimeout(() => { window.playerFPS.isDodging = false; }, isPerfect ? 600 : 400); 
};

window.update = function() {
    if (!window.canvas) { window.canvas = document.getElementById("battleCanvas"); if(window.canvas) window.ctx = window.canvas.getContext("2d"); } 
    if (!window.canvas || !window.ctx) return; 

    window.heartbeatPhase += 0.15;
    for (let i = window.shockwaves.length - 1; i >= 0; i--) { let sw = window.shockwaves[i]; sw.radius += sw.speed; sw.alpha -= 0.04; sw.thickness *= 0.9; if (sw.alpha <= 0) window.shockwaves.splice(i, 1); }
    for (let i = window.screenBlood.length - 1; i >= 0; i--) { let sb = window.screenBlood[i]; sb.y += sb.vy; sb.alpha -= 0.005; if (sb.alpha <= 0) window.screenBlood.splice(i, 1); }
    for (let i = window.glassShards.length - 1; i >= 0; i--) { let g = window.glassShards[i]; g.x += g.vx; g.vy += 0.5; g.y += g.vy; g.rot += g.vRot; g.life--; if (g.life <= 0 || g.y > 1000) window.glassShards.splice(i, 1); }
    
    // 🌟 QUẢN LÝ ĐẤT ĐÁ VĂNG
    for (let i = window.debris.length - 1; i >= 0; i--) { 
        let d = window.debris[i]; 
        d.vy += window.GRAVITY; d.x += d.vx; d.y += d.vy; d.rot += d.vRot; 
        if (d.y > window.GROUND_Y) { d.y = window.GROUND_Y; d.vy *= -0.4; d.vx *= 0.6; } // Nảy trên đất
        d.life--; if (d.life <= 0) window.debris.splice(i, 1); 
    }

    if(window.parryShieldRadius > 0) window.parryShieldRadius += 10; if(window.parryShieldRadius > 500) window.parryShieldRadius = 0;

    window.clutchFlashTimer++; if (window.damageFlashAlpha > 0) window.damageFlashAlpha -= 0.04; if (window.perfectDodgeFlash > 0) window.perfectDodgeFlash -= 0.05; if (window.hitZoomTimer > 0) window.hitZoomTimer--;
    if (window.fatalBlowFlash > 0) window.fatalBlowFlash--; if (window.speedLinesAlpha > 0) window.speedLinesAlpha -= 0.03; if (window.whiteFlashAlpha > 0) window.whiteFlashAlpha -= 0.08;
    if (window.blackoutTimer > 0) window.blackoutTimer--; 
    
    if (window.clashStruggleTimer > 0) {
        window.clashStruggleTimer--; window.shakeScreen(5, 10); window.spawnParticles(400, 200, "#f1c40f", false); 
        if (window.clashStruggleTimer === 0) { window.targetZ -= 40; window.enemies[0].hitStun = 20; } return; 
    }
    
    if (window.koGlitchTimer > 0) window.koGlitchTimer--; if (window.introTimer > 0) { window.introTimer--; if (window.introTimer === 60) { window.playSound(100, 'sine', 0.5, 0.5, true); window.shakeScreen(15, 10); } return; }
    window.globalWind = Math.sin(Date.now() / 2500) * 1.5; window.matchTimer++; if (window.shakeTime > 0) window.shakeTime--; 
    
    if (window.playerFPS.attackCooldown > 0) window.playerFPS.attackCooldown--; if (window.playerFPS.iFrames > 0) window.playerFPS.iFrames--;
    if (!window.playerFPS.guardBreakTimer) window.playerFPS.guardBreakTimer = 0; if (window.playerFPS.parryInvuln > 0) window.playerFPS.parryInvuln--;
    
    if (window.playerFPS.guardBreakTimer > 0) { window.playerFPS.guardBreakTimer--; window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); } 
    else { if (window.playerFPS.isBlocking && window.playerFPS.parryInvuln <= 0) { window.playerFPS.stamina -= 0.6; if (window.playerFPS.stamina <= 0) { window.playerFPS.guardBreakTimer = 45; window.shakeScreen(20, 15); window.damageFlashAlpha = 0.5; window.spawnDamageNumber(400, window.canvas.height/2, "💔 BỊ PHÁ GIÁP!", "#ef4444", true); } } else if (window.playerFPS.stamina < 100) { window.playerFPS.stamina += 0.45; } }

    let e = window.enemies[0];
    if (e && e.rage === undefined) e.rage = 0; if (e && !e.guardBreakTimer) e.guardBreakTimer = 0;
    if (e && e.guardBreakTimer > 0) { e.guardBreakTimer--; e.state = 'hurt'; e.hitStun = 10; } 

    if (window.playerFPS.hp <= 300 && !window.playerFPS.clutchUsed && !window.gameOver) { window.playerFPS.clutchUsed = true; window.playerFPS.clutchActive = true; window.playerFPS.stamina = 100; window.playerFPS.rage = 100; window.spawnDamageNumber(400, 130, "🔥 TRẠNG THÁI SINH TỬ!", "#f1c40f", true); window.playSound(800, 'sawtooth', 0.5, 0.5); window.shakeScreen(30, 15); window.speedLinesAlpha = 1.0; }
    if (e && e.hp <= e.maxHp * 0.3 && !e.clutchUsed && !window.gameOver) { e.clutchUsed = true; e.clutchActive = true; e.rage = 100; window.spawnDamageNumber(e.x, e.y - 170, "🚨 ĐỊCH ĐIÊN CUỒNG BẠO KÍCH! 🚨", "#ff003c", true); window.playSound(140, 'square', 0.5, 0.5); window.shakeScreen(30, 15); }

    let targetCamX = 0; let targetCamY = 0; let targetTilt = 0; let targetZoom = 1.0;
    if (window.hitZoomTimer > 0) targetZoom = window.gameOver ? 1.25 : 1.15; 
    
    if (window.playerFPS.hp <= 0) { targetCamY = 300; targetTilt = -Math.PI / 6; targetZoom = 1.2; window.damageFlashAlpha = 0.6; } else { targetCamY += Math.sin(window.matchTimer * 0.03) * 3; targetCamX += Math.cos(window.matchTimer * 0.02) * 2; }
    if (e && e.hp > 0) { let enemyOffsetX = e.x - 400; targetCamX += enemyOffsetX * 0.45; targetTilt += (enemyOffsetX / 400) * 0.08; document.documentElement.style.setProperty('--enemy-offset-x', `${enemyOffsetX * 0.5}px`); document.documentElement.style.setProperty('--enemy-tilt-rad', `${(enemyOffsetX / 400) * 0.15}rad`); }

    if (window.playerFPS.dodgeTimer > 0) { window.playerFPS.dodgeTimer--; let phase = Math.sin((window.playerFPS.dodgeTimer / (window.playerFPS.perfectDodgeBuff?45:35)) * Math.PI); targetCamX += window.playerFPS.dodgeDir * 240 * phase; targetTilt += window.playerFPS.dodgeDir * 0.25 * phase; targetCamY += 35 * phase; if(window.hitZoomTimer <= 0) targetZoom = 1.08; }
    if (window.playerFPS.moveTimer > 0) { window.playerFPS.moveTimer--; let phase = Math.sin((window.playerFPS.moveTimer / 25) * Math.PI); targetCamY += 15 * phase; if(window.hitZoomTimer <= 0) targetZoom = 1.03; }

    window.camX += (targetCamX - window.camX) * 0.12; window.camY += (targetCamY - window.camY) * 0.12; window.cameraTilt += (targetTilt - window.cameraTilt) * 0.12; window.camZoom += (targetZoom - window.camZoom) * 0.1;
    if (window.playerFPS.hp > 0) window.enemyZ += (window.targetZ - window.enemyZ) * 0.12; 

    if (Math.abs(window.cameraTilt) > 0.05) window.cameraTilt *= 0.85;

    let wrapper = document.querySelector(".canvas-wrapper");
    if (wrapper) { wrapper.style.transform = `scale(${window.camZoom}) translate(${-window.camX}px, ${window.camY}px) rotate(${-window.cameraTilt}rad)`; }

    if (e && e.hp > 0 && !window.gameOver && window.introTimer <= 0) {
        if (!window.playerFPS.aiStateTimer) window.playerFPS.aiStateTimer = 0; if (window.playerFPS.aiStateTimer > 0) window.playerFPS.aiStateTimer--;
        if (e.y < window.GROUND_Y && e.hitStun > 0 && window.enemyZ < 150 && window.playerFPS.stamina > 10) { if (window.matchTimer % 15 === 0) { let hand = Math.random() > 0.5 ? 'left' : 'right'; window.punch(hand); } }
        else if (!window.playerFPS.isBlocking && e.hitStun <= 0 && (!window.playerFPS.dodgeTimer || window.playerFPS.dodgeTimer <= 0) && window.playerFPS.guardBreakTimer <= 0) {
            if (window.playerFPS.aiStateTimer <= 0) {
                window.playerFPS.aiStateTimer = window.playerFPS.clutchActive ? Math.floor(10 + Math.random() * 15) : Math.floor(20 + Math.random() * 20); 
                if (e.attackTimer > 5 && e.attackTimer < 18) { let defendRoll = Math.random(); if (defendRoll < 0.25 && window.playerFPS.stamina > 20) { window.blockFPS(); setTimeout(() => { if(window.playerFPS.guardBreakTimer <= 0) { window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); } }, 400); } else if (defendRoll < 0.70) { window.dodgeFPS(); } } else if (window.playerFPS.stamina > 25 || window.playerFPS.clutchActive) { if (window.enemyZ > 75) { window.moveFPS(-1); window.playerFPS.aiStateTimer = 8; } else { let hand = Math.random() > 0.5 ? 'left' : 'right'; window.punch(hand); } } else { window.moveFPS(1); window.playerFPS.aiStateTimer = 35; }
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

    if (e && e.hp <= 0) { 
        if(e.koTimer > 0) e.koTimer--; 
        if (e.koType === 'spin' && e.state === 'ko_falling') e.rotation += 0.35; 
        if (e.koType === 'backflip' && e.state === 'ko_falling') { e.rotation -= 0.2; window.enemyZ += 2; }
        
        // 🌟 XỬ LÝ SCREENSPLAT (ĐẬP MÀN HÌNH)
        if (e.koType === 'screensplat') {
            if (!e.hasHitScreen) {
                window.enemyZ -= 8; // Bay vùn vụt về phía cam
                if (window.enemyZ <= -110) { 
                    e.hasHitScreen = true; e.vy = 0; window.enemyZ = -110; 
                    window.shakeScreen(30, 20); window.playSound(200, 'square', 0.5, 1.0, true);
                    let crack = document.getElementById("screen-crack"); if(crack) { crack.style.opacity = 1; }
                }
            } else {
                e.vy += 0.1; e.y += e.vy; // Trượt từ từ xuống mặt kính
                if (e.y > window.GROUND_Y + 200) e.state = 'dead';
            }
        }
        else if (e.koType === 'crumple') { if (e.state === 'ko_falling') { e.y += 2.5; if (e.y > window.GROUND_Y + 50) { e.state = 'dead'; } } } else {
            e.vy += window.GRAVITY; e.y += e.vy; 
            if (e.koType === 'knockback') window.enemyZ += 6; if (e.koType === 'uppercut') window.enemyZ += 0.5;
            
            if (e.y > window.GROUND_Y) { 
                e.y = window.GROUND_Y; if (e.bounceCount === undefined) e.bounceCount = 0;
                
                if (e.bounceCount < 2) { window.spawnDebris(e.x, e.y, 8); }

                if (e.koType === 'uppercut' && e.bounceCount < 1) { e.vy = -7; e.bounceCount++; window.playSound(250, 'square', 0.2, 0.4, true); } 
                else if (e.koType === 'spin' && e.bounceCount < 1) { e.vy = -4; e.bounceCount++; window.playSound(250, 'square', 0.2, 0.4, true); } 
                else if (e.koType === 'backflip' && e.bounceCount < 1) { e.vy = -6; e.bounceCount++; window.playSound(200, 'square', 0.3, 0.5, true); } 
                else { e.vy = 0; e.state = 'dead'; if(e.bounceCount < 2) { window.spawnDebris(e.x, e.y, 10); e.bounceCount = 2; } }
            } 
        }
        
        if (e.state === 'dead' && (e.koType === 'crumple' || e.koType === 'faceplant')) {
            if (Math.random() < 0.2) window.bloodPools.push({ x: e.x + (Math.random()-0.5)*80, y: window.GROUND_Y + 15 + (Math.random()-0.5)*10, size: 2, maxSize: 15 + Math.random()*20 });
        }
    }

    let h1 = document.getElementById("hp-red"), h2 = document.getElementById("hp-blue"), s1 = document.getElementById("stamina-red");
    if(h1) h1.style.width = (window.playerFPS.hp / window.playerFPS.maxHp * 100) + "%"; if(h2 && e) h2.style.width = (e.hp / e.maxHp * 100) + "%"; if(s1) s1.style.width = window.playerFPS.stamina + "%";
    
    for (let i = window.floatingTexts.length - 1; i >= 0; i--) { 
        let t = window.floatingTexts[i]; 
        if (t.isPhysics) { t.vy += window.GRAVITY * 0.4; t.x += t.vx; t.y += t.vy; if (t.y > window.GROUND_Y) { t.y = window.GROUND_Y; t.vy *= -0.5; t.vx *= 0.8; } } else { t.y += t.vy; }
        t.alpha -= 0.02; if (t.alpha <= 0) window.floatingTexts.splice(i, 1); 
    }
    for (let i = window.particles.length - 1; i >= 0; i--) { let pt = window.particles[i]; pt.vy += window.GRAVITY * 0.5; pt.x += pt.vx; pt.y += pt.vy; pt.life--; if (pt.life <= 0) window.particles.splice(i, 1); }
    if(window.weatherParticles) { window.weatherParticles.forEach(w => { w.y += w.speed; w.x += Math.sin(w.y/50)*2 + window.globalWind; if(w.y > window.canvas.height + 20) { w.y = -20; w.x = Math.random() * window.canvas.width; } }); }
}

window.enemyAttackAction = function(e) {
    if (window.playerFPS.iFrames > 0 || window.playerFPS.isDodging || window.enemyZ > 90) { 
        window.playerFPS.combo = 0; window.floatingTexts.push({ x: 400, y: 200, text: "MISS!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "900 35px Arial", life: 40 }); window.targetZ += 15; e.targetLean = (Math.random() - 0.5) * 0.2;
    } 
    else if (window.playerFPS.isBlocking && window.playerFPS.parryInvuln > 0) { return; }
    else if (window.playerFPS.isBlocking) { 
        if (window.playerFPS.combo >= 3) { window.spawnDamageNumber(400, 150, "💔 COMBO BROKEN!", "#e74c3c", true); window.shakeScreen(10, 8); }
        window.playerFPS.combo = 0; window.playSound(600, 'triangle', 0.2, 0.5, true); window.shakeScreen(5, 3); window.playerFPS.stamina -= 25; window.targetZ += 15; window.playerFPS.rage += 12; window.whiteFlashAlpha = 0.3;
        if (window.playerFPS.stamina <= 0) { window.playerFPS.guardBreakTimer = 45; window.shakeScreen(20, 15); window.damageFlashAlpha = 0.5; window.whiteFlashAlpha = 0.8; window.spawnDamageNumber(400, window.canvas.height/2, "💔 BỊ PHÁ GIÁP!", "#ef4444", true); }
    } 
    else {
        if (window.playerFPS.combo >= 3) { window.spawnDamageNumber(400, 150, "💔 COMBO BROKEN!", "#e74c3c", true); window.shakeScreen(10, 8); }
        window.playerFPS.combo = 0; 
        let dmg = Math.floor((22 + Math.random() * 8) * e.dmgMod); if (e.clutchActive) dmg = Math.floor(dmg * 1.4); 
        if (window.enemyZ >= 190) { dmg = Math.floor(dmg * 1.3); window.spawnDamageNumber(400, 230, "💥 BỊ ÉP GÓC ĐAU ĐỚN!", "#ff4d4d", true); }
        
        window.playerFPS.hp -= dmg; window.playerFPS.rage = Math.min(100, (window.playerFPS.rage || 0) + 20); window.shakeScreen(28, 20); window.playSound(150, 'square', 0.3, 0.8, true); window.damageFlashAlpha = 0.65; window.whiteFlashAlpha = 0.5;
        let crack = document.getElementById("screen-crack"); if(crack) { crack.style.opacity = 1; setTimeout(() => crack.style.opacity = 0, 300); }
        window.cameraTilt = (Math.random() > 0.5 ? 0.15 : -0.15); 

        if (window.playerFPS.hp <= 0) { 
            if (!window.handleAnimeComeback(window.playerFPS, true)) {
                window.playerFPS.hp = 0; window.gameOver = true; window.koGlitchTimer = 60; window.whiteFlashAlpha = 1.0; 
                window.spawnDamageNumber(400, 200, "VÕ SĨ CỦA BẠN ĐÃ GỤC!", "#ff4757", true); window.spawnParticles(window.canvas.width/2, window.canvas.height/2, "rgba(220, 0, 0, 0.9)", true); window.spawnScreenBlood(); 
            }
        } else if (Math.random() < 0.25) { window.spawnScreenBlood(); }
    }
}

// ==========================================
// 4. VÒNG LẶP VẼ (DRAW ĐIỆN ẢNH)
// ==========================================
window.draw = function() {
    if (!window.canvas || !window.ctx) return;
    window.ctx.setTransform(1, 0, 0, 1, 0, 0); window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.save();

    if (window.blackoutTimer > 0) { window.ctx.filter = "invert(100%) grayscale(100%) contrast(300%)"; }
    else if (window.gameOver && window.matchResolved) { window.ctx.filter = "grayscale(80%) sepia(50%) hue-rotate(-30deg) contrast(120%)"; }
    else if (window.fatalBlowFlash > 0) { window.ctx.filter = "invert(100%) contrast(150%) hue-rotate(180deg)"; }

    if (window.shakeTime > 0) { window.ctx.translate((Math.random() - 0.5) * window.shakeMag, (Math.random() - 0.5) * window.shakeMag); }

    if (typeof window.drawBoxingRing === 'function') { window.drawBoxingRing(window.ctx, window.canvas.width, window.canvas.height); } 
    else { window.ctx.fillStyle = "#05050a"; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }

    window.floorSplatters.forEach(sp => { window.ctx.save(); let pScale = 300 / (200 + sp.z); window.ctx.translate(sp.x, window.GROUND_Y + (100 - sp.z) * 0.5 + 20); window.ctx.scale(pScale, pScale * 0.3); window.ctx.fillStyle = sp.color; window.ctx.beginPath(); window.ctx.arc(0, 0, sp.size, 0, Math.PI*2); window.ctx.fill(); window.ctx.restore(); });
    window.bloodPools.forEach(bp => { if (bp.size < bp.maxSize) bp.size += 0.2; window.ctx.save(); let pScale = 300 / (200 + window.enemyZ); window.ctx.translate(bp.x, bp.y); window.ctx.scale(pScale, pScale * 0.3); window.ctx.fillStyle = "rgba(139, 0, 0, 0.75)"; window.ctx.beginPath(); window.ctx.arc(0, 0, bp.size, 0, Math.PI*2); window.ctx.fill(); window.ctx.restore(); });

    // 🌟 VẼ CÁC CỤC ĐÁ VĂNG
    window.debris.forEach(d => {
        window.ctx.save();
        window.ctx.translate(d.x, d.y); window.ctx.rotate(d.rot);
        window.ctx.fillStyle = "#34495e"; window.ctx.strokeStyle = "#111"; window.ctx.lineWidth = 1;
        window.ctx.beginPath(); window.ctx.rect(-d.size/2, -d.size/2, d.size, d.size); window.ctx.fill(); window.ctx.stroke();
        window.ctx.restore();
    });

    let e = window.enemies[0];
    if (window.playerFPS.clutchActive || (e && e.clutchActive)) {
        window.ctx.save(); window.ctx.globalCompositeOperation = "multiply";
        let darkGrad = window.ctx.createRadialGradient(window.canvas.width/2, window.canvas.height/2 + 50, 150, window.canvas.width/2, window.canvas.height/2 + 50, 500);
        darkGrad.addColorStop(0, "rgba(255,255,255, 1)"); darkGrad.addColorStop(0.5, "rgba(100,100,100, 1)"); darkGrad.addColorStop(1, "rgba(10,10,10, 1)"); 
        window.ctx.fillStyle = darkGrad; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.restore();
    }

    if (e) {
        window.ctx.save(); let pScale = 300 / (200 + Math.max(0, window.enemyZ)); let renderY = window.GROUND_Y + (100 - window.enemyZ) * 0.5;
        window.ctx.translate(e.x, renderY); window.ctx.scale(pScale, pScale); if (e.lean) window.ctx.rotate(e.lean); 
        let cloneE = Object.assign({}, e, {x: 0, y: 0}); if (typeof window.drawStickman === 'function') { window.drawStickman(window.ctx, cloneE); } window.ctx.restore();
    }

    window.ctx.filter = "none"; 

    // 🌟 KHIÊN PARRY ENERGY SHIELD
    if(window.parryShieldRadius > 0 && window.parryShieldRadius < 400) {
        window.ctx.save(); window.ctx.translate(400, 300);
        window.ctx.beginPath(); window.ctx.arc(0, 0, window.parryShieldRadius, 0, Math.PI*2);
        window.ctx.lineWidth = 15; window.ctx.strokeStyle = `rgba(0, 243, 255, ${1 - window.parryShieldRadius/400})`;
        window.ctx.stroke();
        
        let hexRadius = window.parryShieldRadius * 0.8;
        window.ctx.beginPath();
        for (let i = 0; i < 6; i++) { window.ctx.lineTo(hexRadius * Math.cos(i * Math.PI / 3), hexRadius * Math.sin(i * Math.PI / 3)); }
        window.ctx.closePath();
        window.ctx.fillStyle = `rgba(0, 243, 255, ${0.3 * (1 - window.parryShieldRadius/400)})`; window.ctx.fill();
        window.ctx.restore();
    }

    if (window.speedLinesAlpha > 0) { window.ctx.save(); window.ctx.translate(window.canvas.width/2, window.canvas.height/2); window.ctx.strokeStyle = `rgba(255, 255, 255, ${window.speedLinesAlpha})`; window.ctx.lineWidth = 1.5; window.ctx.beginPath(); for(let i=0; i<80; i++) { let ang = Math.random() * Math.PI * 2; let r1 = 250 + Math.random()*200; let r2 = 1200; window.ctx.moveTo(Math.cos(ang)*r1, Math.sin(ang)*r1); window.ctx.lineTo(Math.cos(ang)*r2, Math.sin(ang)*r2); } window.ctx.stroke(); window.ctx.restore(); }
    window.shockwaves.forEach(sw => { window.ctx.beginPath(); window.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI*2); window.ctx.lineWidth = sw.thickness; window.ctx.strokeStyle = sw.color ? `rgba(${window.hexToRgb(sw.color)}, ${sw.alpha})` : `rgba(255, 255, 255, ${sw.alpha})`; window.ctx.stroke(); });
    window.screenBlood.forEach(sb => { window.ctx.fillStyle = `rgba(200, 0, 0, ${sb.alpha})`; window.ctx.beginPath(); window.ctx.ellipse(sb.x, sb.y, sb.size, sb.size*1.5, 0, 0, Math.PI*2); window.ctx.fill(); window.ctx.beginPath(); window.ctx.ellipse(sb.x - sb.size*0.3, sb.y + sb.size, sb.size*0.5, sb.size*2, 0, 0, Math.PI*2); window.ctx.fill(); });
    window.glassShards.forEach(g => { window.ctx.save(); window.ctx.translate(g.x, g.y); window.ctx.rotate(g.rot); window.ctx.fillStyle = "rgba(200, 240, 255, 0.6)"; window.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; window.ctx.lineWidth = 1.5; window.ctx.beginPath(); window.ctx.moveTo(0, -g.size); window.ctx.lineTo(g.size, g.size/2); window.ctx.lineTo(-g.size/2, g.size); window.ctx.closePath(); window.ctx.fill(); window.ctx.stroke(); window.ctx.restore(); });

    if(window.weatherParticles) { window.ctx.lineWidth = 2; window.weatherParticles.forEach(w => { if (window.currentWeather === 'snow') { window.ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; window.ctx.beginPath(); window.ctx.arc(w.x, w.y, w.size, 0, Math.PI*2); window.ctx.fill(); } else if (window.currentWeather === 'rain' || window.currentWeather === 'blood_rain') { window.ctx.strokeStyle = window.currentWeather === 'rain' ? "rgba(155, 155, 255, 0.6)" : "rgba(214, 48, 49, 0.75)"; window.ctx.beginPath(); window.ctx.moveTo(w.x, w.y); window.ctx.lineTo(w.x - 6, w.y + 15); window.ctx.stroke(); } }); }
    window.particles.forEach(pt => { window.ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / pt.maxLife)); window.ctx.fillStyle = pt.color; window.ctx.beginPath(); window.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); window.ctx.fill(); }); window.ctx.globalAlpha = 1.0;
    window.floatingTexts.forEach(t => { window.ctx.font = t.font || "900 22px Arial"; window.ctx.fillStyle = t.color; window.ctx.shadowBlur = 5; window.ctx.shadowColor = t.color; window.ctx.globalAlpha = Math.max(0, t.alpha); window.ctx.textAlign = "center"; window.ctx.fillText(t.text, t.x, t.y); window.ctx.shadowBlur = 0; }); window.ctx.globalAlpha = 1.0;

    // 🌟 KANJI DESTRUCTIVE FINISH HIỆN RA
    if (window.destructiveFinishTimer > 0) {
        window.destructiveFinishTimer--;
        window.ctx.save();
        window.ctx.translate(window.canvas.width/2, window.canvas.height/2 - 50);
        let scale = 1 + (250 - window.destructiveFinishTimer) * 0.01;
        window.ctx.scale(scale, scale);
        window.ctx.font = "900 180px 'Yu Mincho', 'MS Mincho', serif";
        window.ctx.textAlign = "center"; window.ctx.textBaseline = "middle";
        window.ctx.fillStyle = `rgba(255, 0, 60, ${window.destructiveFinishTimer / 250})`;
        window.ctx.shadowBlur = 50; window.ctx.shadowColor = "#ff003c";
        window.ctx.fillText("滅", 0, 0); // KANJI "DIỆT"
        window.ctx.restore();
    }

    if (window.perfectDodgeFlash > 0 && !window.gameOver) { let dodgeGrad = window.ctx.createRadialGradient(window.canvas.width/2, window.canvas.height/2, 100, window.canvas.width/2, window.canvas.height/2, 800); dodgeGrad.addColorStop(0, "rgba(0, 243, 255, 0)"); dodgeGrad.addColorStop(1, `rgba(0, 243, 255, ${window.perfectDodgeFlash * 0.5})`); window.ctx.fillStyle = dodgeGrad; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }
    if (window.playerFPS.clutchActive && !window.gameOver) { let beat = Math.abs(Math.sin(window.heartbeatPhase)); let heartGrad = window.ctx.createRadialGradient(window.canvas.width/2, window.canvas.height/2, 200, window.canvas.width/2, window.canvas.height/2, 600); heartGrad.addColorStop(0, "rgba(220, 20, 60, 0)"); heartGrad.addColorStop(1, `rgba(220, 20, 60, ${0.15 + beat*0.25})`); window.ctx.fillStyle = heartGrad; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }
    if (window.damageFlashAlpha > 0 && !window.gameOver) { window.ctx.fillStyle = `rgba(255, 0, 0, ${window.damageFlashAlpha})`; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }
    if (window.whiteFlashAlpha > 0) { window.ctx.fillStyle = `rgba(255, 255, 255, ${window.whiteFlashAlpha})`; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }
    if (window.gameOver && window.matchResolved) { window.ctx.fillStyle = "#000"; window.ctx.fillRect(0, 0, window.canvas.width, 80); window.ctx.fillRect(0, window.canvas.height - 80, window.canvas.width, 80); }

    if (window.introTimer > 0 && !window.gameOver) { window.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.textAlign = "center"; if (window.introTimer > 60) { window.ctx.font = "italic 900 60px Arial"; window.ctx.fillStyle = "#f1c40f"; window.ctx.fillText("CHUẨN BỊ...", window.canvas.width/2, window.canvas.height/2); } else { let scale = 1 + (window.introTimer / 60) * 0.5; window.ctx.save(); window.ctx.translate(window.canvas.width/2, window.canvas.height/2); window.ctx.scale(scale, scale); window.ctx.font = "italic 900 80px Arial"; window.ctx.fillStyle = "#ff4757"; window.ctx.fillText("🥊 FIGHT! 🥊", 0, 20); window.ctx.restore(); } }
    window.ctx.restore();
}

window.hexToRgb = function(hex) { let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 255, 255"; }
window.gameLoopFPS = function(timestamp) { if (!window.isLoopRunning) return; requestAnimationFrame(window.gameLoopFPS); if (!timestamp) timestamp = 0; let deltaTime = timestamp - window.lastFrameTime; if (deltaTime >= window.FRAME_MIN_TIME) { window.lastFrameTime = timestamp - (deltaTime % window.FRAME_MIN_TIME); try { window.update(); } catch(e) {} try { window.draw(); } catch(e) {} } }
