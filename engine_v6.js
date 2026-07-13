// ==========================================
// ENGINE.JS - THE A.I REVOLUTION (V45.0 - ULTIMATE EDITION)
// [ĐỈNH CAO: HAPTIC FEEDBACK, GLITCH EFFECT, SLOW-MO K.O, DYNAMIC SHADOWS]
// ==========================================

window.canvas = null; window.ctx = null; window.audioCtx = null; window.isMuted = false;
window.floatingTexts = []; window.particles = []; window.shockwaves = []; window.screenBlood = []; 
window.bloodPools = []; window.floorSplatters = []; window.glassShards = []; window.debris = [];
window.speechBubbles = []; 
window.matchTimer = 0; window.shakeTime = 0; window.shakeMag = 0; window.koGlitchTimer = 0;
window.GROUND_Y = 320; window.GRAVITY = 0.8; window.lastFrameTime = 0; window.FRAME_MIN_TIME = 1000 / 60;
window.globalWind = 0; window.timeScale = 1.0; // Slow-motion

window.camX = 0; window.camY = 0; window.cameraTilt = 0; window.camZoom = 1; window.targetZ = 120; 
window.damageFlashAlpha = 0; window.perfectDodgeFlash = 0; window.hitZoomTimer = 0; window.clutchFlashTimer = 0;
window.fatalBlowFlash = 0; window.blackoutTimer = 0; window.parryShieldRadius = 0;
window.glitchAmount = 0; // Chromatic Aberration

window.superArtTimer = 0; window.superArtData = null;
window.speedLinesAlpha = 0; window.heartbeatPhase = 0; window.whiteFlashAlpha = 0;
window.clashStruggleTimer = 0; window.destructiveFinishTimer = 0; 
window.clashWinner = 'none';

window.uiCache = { h1: null, h2: null, initialized: false };
window.lastUI = { h1: "", h2: "" };
window.lastBassTime = 0;

// 🌟 HAPTIC FEEDBACK (RUNG ĐIỆN THOẠI)
window.vibrateDevice = function(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e){}
};

// 🌟 ÂM THANH EPIC
window.playSound = function(freq, type, duration, vol, isImpact = false) { 
    if (window.isMuted) return; 
    try {
        if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
        let t = window.audioCtx.currentTime; let osc = window.audioCtx.createOscillator(); let gain = window.audioCtx.createGain(); 
        osc.connect(gain); gain.connect(window.audioCtx.destination); let safeVol = Math.min(vol, 1.0); 
        
        if (isImpact) { 
            osc.type = type === 'sine' ? 'triangle' : type; 
            osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(15, t + Math.min(0.15, duration)); 
            gain.gain.setValueAtTime(safeVol, t); gain.gain.exponentialRampToValueAtTime(0.01, t + duration); 
        } else { 
            osc.type = 'sine'; 
            osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration); 
            gain.gain.setValueAtTime(0.01, t); gain.gain.linearRampToValueAtTime(safeVol * 0.6, t + duration * 0.1); gain.gain.exponentialRampToValueAtTime(0.01, t + duration); 
        }
        osc.start(t); osc.stop(t + duration); 

        if (freq < 150 && isImpact && (Date.now() - window.lastBassTime > 250)) { 
            window.lastBassTime = Date.now();
            let bassOsc = window.audioCtx.createOscillator(); let bassGain = window.audioCtx.createGain();
            bassOsc.type = 'sine'; bassOsc.frequency.setValueAtTime(80, t); bassOsc.frequency.exponentialRampToValueAtTime(20, t + duration * 1.5);
            bassGain.gain.setValueAtTime(safeVol * 1.5, t); bassGain.gain.exponentialRampToValueAtTime(0.01, t + duration * 1.5);
            bassOsc.connect(bassGain); bassGain.connect(window.audioCtx.destination); bassOsc.start(t); bassOsc.stop(t + duration * 1.5);
        }
    } catch(e){}
}

window.shakeScreen = function(frames, magnitude) { window.shakeTime = frames; window.shakeMag = magnitude; }
// TIA LỬA ĐỊNH HƯỚNG MỚI
window.spawnParticles = function(x, y, color, isCrit = false, dirX = 0) { 
    let count = isCrit ? 20 : 8; 
    for(let i=0; i<count; i++) { 
        window.particles.push({ 
            x: x, y: y, 
            vx: dirX !== 0 ? (dirX * Math.random() * 15 + (Math.random()-0.5)*5) : (Math.random()-0.5)*20, 
            vy: (Math.random()-0.8)*15, 
            life: 25, maxLife: 25, color: color, size: Math.random() * 5 + 2 
        }); 
    } 
}
window.spawnScreenBlood = function() { window.screenBlood.push({ x: Math.random()*800, y: Math.random()*600, size: 30 + Math.random()*30, alpha: 0.8, vy: 0.5 + Math.random() }); }
window.spawnDamageNumber = function(x, y, text, color, isCrit) { window.floatingTexts.push({ x: x, y: y, text: text, color: color, alpha: 1.5, vx: (Math.random() - 0.5) * 8, vy: -(Math.random() * 5 + 5), font: `900 ${isCrit ? 45 : 30}px Impact`, life: 50, isPhysics: true }); };
window.spawnSpeechBubble = function(x, y, text, isLeft = false) { window.speechBubbles.push({ x: x, y: y, text: text, isLeft: isLeft, life: 50, maxLife: 50 }); };
window.spawnDebris = function(x, y, count) { let c = Math.min(count, 15); for(let i=0; i<c; i++) { window.debris.push({ x: x + (Math.random()-0.5)*60, y: y + 50, vx: (Math.random()-0.5)*20, vy: -(Math.random()*12 + 8), rot: Math.random()*3.14, vRot: (Math.random()-0.5)*0.5, size: Math.random()*12 + 5, life: 60 }); } };

// 🌟 HỒI SINH ANIME
window.handleAnimeComeback = function(fighter, isPlayer) {
    if (!fighter.animeComebackUsed && Math.random() < 0.35) { 
        fighter.animeComebackUsed = true; fighter.hp = 1; fighter.rage = 100; 
        window.shakeScreen(40, 15); window.playSound(80, 'sawtooth', 2.0, 1.0, true); 
        window.vibrateDevice([100, 50, 100, 50, 300]);
        window.isLoopRunning = false; window.damageFlashAlpha = 1.0; window.speedLinesAlpha = 1.0; 
        window.shockwaves.push({ x: 400, y: 300, radius: 10, maxRadius: 800, alpha: 1, speed: 25, thickness: 30, color: "#ff003c" });
        window.spawnDamageNumber(400, 300, "🔥 IMMORTAL WILL! 🔥", "#ff003c", true); 
        window.glitchAmount = 15;
        if(window.announce) window.announce("Immortal Will!", 0.7);
        setTimeout(() => { if(!window.gameOver) { window.isLoopRunning = true; window.glitchAmount = 0; requestAnimationFrame(window.gameLoopFPS); } }, 1500); 
        return true; 
    }
    return false; 
}

window.triggerSuperArtCutIn = function(attackerName, avatarUrl, color, skillName, isPlayer) {
    window.superArtTimer = 55; window.vibrateDevice(200);
    window.superArtData = { name: attackerName.toUpperCase(), img: new Image(), color: color, skill: skillName, isPlayer: isPlayer, offset: isPlayer ? -800 : 800 };
    window.superArtData.img.crossOrigin = "Anonymous"; window.superArtData.img.src = avatarUrl || "https://i.imgur.com/q3813rX.png";
    window.playSound(90, 'sawtooth', 1.0, 1.0, true); 
};

window.triggerFatality = function(target, isSmash = false) {
    target.hp = 0; target.state = 'ko_falling'; target.koTimer = 180;
    let finishers = ['uppercut', 'knockback', 'crumple', 'spin', 'faceplant', 'backflip', 'screensplat'];
    target.koType = finishers[Math.floor(Math.random() * finishers.length)]; 
    target.rotation = 0; target.hasHitScreen = false;
    
    let koText = "K.O!";
    if (target.koType === 'uppercut') { target.vy = -25; window.targetZ += 20; koText = "🚀 LAUNCHED!"; }
    else if (target.koType === 'knockback') { target.vy = -12; window.targetZ += 250; koText = "☄️ BLASTED!"; }
    else if (target.koType === 'crumple') { target.vy = 0; koText = "🥀 CRUMPLED!"; }
    else if (target.koType === 'spin') { target.vy = -18; window.targetZ += 50; koText = "🌪️ SPUN OUT!"; }
    else if (target.koType === 'faceplant') { target.vy = -6; window.targetZ -= 10; koText = "💀 FACEPLANT!"; }
    else if (target.koType === 'backflip') { target.vy = -20; window.targetZ += 80; koText = "🤸 BACKFLIPPED!"; }
    else if (target.koType === 'screensplat') { target.vy = -8; window.targetZ = -120; koText = "📺 SCREEN SPLAT!"; }

    window.matchResolved = true; window.gameOver = true; window.koGlitchTimer = 80; window.hitZoomTimer = 120; window.fatalBlowFlash = 10; 
    window.whiteFlashAlpha = 1.0; window.speedLinesAlpha = 1.0; window.glitchAmount = 20;
    window.vibrateDevice([200, 100, 400]);
    
    if (isSmash) {
        window.destructiveFinishTimer = 200; 
        for(let i=0; i<25; i++) { window.glassShards.push({ x: 400 + (Math.random()-0.5)*200, y: 300 + (Math.random()-0.5)*200, vx: (Math.random()-0.5)*30, vy: (Math.random()-0.5)*30, rot: Math.random()*Math.PI*2, vRot: (Math.random()-0.5)*0.5, size: Math.random()*30 + 10, life: 80 }); }
        window.playSound(100, 'square', 1.0, 1.0, true); 
    }

    window.shakeScreen(50, 30); window.playSound(60, 'sawtooth', 2.0, 1.0, true);
    window.spawnDamageNumber(400, 150, koText, "#f1c40f", true);
    
    // SLOW MOTION K.O
    window.timeScale = 0.1;
    setTimeout(() => { window.timeScale = 1.0; }, 1000);
};

window.moveFPS = function(dir) {
    if (window.superArtTimer > 0 || window.gameOver || window.playerFPS.isDodging || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return;
    window.targetZ += dir * 45; window.targetZ = Math.max(30, Math.min(220, window.targetZ)); 
    window.playerFPS.moveTimer = 25; window.playSound(200, 'sine', 0.1, 0.2);
};

window.punch = function(hand) {
    if (window.superArtTimer > 0 || window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isBlocking || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return;
    window.playerFPS.attackCooldown = 15; 
    if (window.playerFPS.rage === undefined) window.playerFPS.rage = 0;
    if (window.playerFPS.combo === undefined) window.playerFPS.combo = 0; 

    let glove = document.getElementById(hand + "-glove");
    if(glove) { glove.classList.add(`glove-punch-${hand}`); setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150); }

    let e = window.enemies[0];
    if (e && e.hp > 0 && window.enemyZ <= 90) { 
        let isPerfectCounter = window.playerFPS.perfectDodgeBuff; window.playerFPS.perfectDodgeBuff = false; 
        let punchDir = hand === 'left' ? 1 : -1;

        // 🌟 CLASH 50-50 SINH TỬ
        if (e.attackTimer > 5 && e.attackTimer < 18 && !isPerfectCounter && window.playerFPS.rage < 100) {
            window.clashStruggleTimer = 35; e.attackTimer = 0; window.playerFPS.attackCooldown = 35; window.whiteFlashAlpha = 0.8; 
            window.targetZ += 50; window.enemyZ += 30; window.cameraTilt = (Math.random() > 0.5 ? 0.3 : -0.3); 
            window.shakeScreen(35, 20); window.playSound(90, 'square', 0.8, 1.0, true); 
            window.vibrateDevice([100, 100, 100]);
            window.hitZoomTimer = 35; window.fatalBlowFlash = 6; 
            window.shockwaves.push({ x: 400, y: 300, radius: 20, maxRadius: 500, alpha: 1, speed: 20, thickness: 15, color: "#fff" });
            window.spawnDamageNumber(400, 200, "⚔️ POWER STRUGGLE! ⚔️", "#ffffff", true);
            window.spawnParticles(400, 150, "#f1c40f", true, 0); window.spawnDebris(400, window.GROUND_Y, 10); 
            window.clashWinner = Math.random() > 0.5 ? 'player' : 'enemy';
            return; 
        }

        if (e.attackTimer <= 0 && e.hitStun <= 0 && (!e.dodgeTimer || e.dodgeTimer <= 0) && window.playerFPS.rage < 100 && !isPerfectCounter) {
            let defenseRoll = Math.random();
            if (defenseRoll < 0.30) { 
                window.playerFPS.combo = 0; window.floatingTexts.push({ x: e.x, y: 150, text: "💨 SLIP!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "italic 900 30px Arial", life: 30 });
                e.dodgeDir = Math.random() > 0.5 ? 1 : -1; e.dodgeTimer = 35; e.baseTargetX = e.x; 
                if(Math.random() < 0.4) window.spawnSpeechBubble(e.x + 50, e.y - 180, ["Too slow!", "Missed!"][Math.floor(Math.random()*2)], true);
                if (Math.random() < 0.80) { setTimeout(() => { if (e.hp > 0 && !window.gameOver && e.guardBreakTimer <= 0) { e.state = ['hook', 'uppercut'][Math.floor(Math.random()*2)]; e.attackTimer = 20; window.targetZ -= 25; window.floatingTexts.push({ x: e.x, y: 180, text: "⚡ COUNTER!", color: "#ff4757", alpha: 1, vx: 0, vy: -2, font: "italic 900 28px Arial", life: 30 }); } }, 150); } return; 
            } else if (defenseRoll < 0.60) { 
                window.playerFPS.combo = 0; window.playSound(600, 'triangle', 0.2, 0.4, true); window.targetZ += 8; e.hp -= 2; window.playerFPS.rage += 5; e.guardHealth = (e.guardHealth || 100) - 35; 
                if (e.guardHealth <= 0) { 
                    e.guardBreakTimer = 60; e.guardHealth = 100; window.hitZoomTimer = 20; window.whiteFlashAlpha = 0.6; window.vibrateDevice(100);
                    window.playSound(80, 'square', 1.0, 1.0, true); 
                    window.spawnDamageNumber(e.x, 150, "💀 ARMOR SHATTERED!", "#ff9f43", true); window.shakeScreen(20, 10); 
                    window.spawnSpeechBubble(200, 400, ["Weak!", "Gotcha!", "Guard crushed!"][Math.floor(Math.random()*3)], false);
                } 
                else { window.floatingTexts.push({ x: e.x, y: 150, text: "🛡️ BLOCK!", color: "#3498db", alpha: 1, vx: 0, vy: -1, font: "900 30px Arial", life: 30 }); }
                return; 
            }
        }

        window.playerFPS.combo++; let comboMult = 1 + (window.playerFPS.combo * 0.15); 
        let isRagePunch = window.playerFPS.rage >= 100; let isCrit = Math.random() < 0.25 || isRagePunch || isPerfectCounter; 
        let dmg = 40 * comboMult; let punchColor = window.playerFPS.combo >= 4 ? "#ff9f43" : "#fff";

        if (isRagePunch) { 
            dmg = 150 * comboMult; window.playerFPS.rage = 0; punchColor = "#f1c40f"; 
            let pName = "YOU"; let pColor = "#00f3ff"; let pAvatar = "https://i.imgur.com/q3813rX.png";
            if (window.classStats && window.selectedRedClass) { let myChar = window.classStats[window.selectedRedClass]; pName = myChar.className; pColor = myChar.color || "#00f3ff"; pAvatar = myChar.avatarUrl || pAvatar; }
            window.triggerSuperArtCutIn(pName, pAvatar, pColor, "ULTIMATE SMASH!", true);
            window.targetZ += 60; window.enemyZ += 40; e.targetLean = (Math.random() - 0.5) * 0.8; 
            window.hitZoomTimer = 40; window.speedLinesAlpha = 1.0; window.blackoutTimer = 25; window.cameraTilt = (Math.random() > 0.5 ? 0.3 : -0.3); 
            window.spawnDamageNumber(400, 180, "🔥 MEGA SMASH! 🔥", "#f1c40f", true); 
            window.playSound(80, 'sawtooth', 1.0, 1.0, true); 
            window.shockwaves.push({ x: 400, y: 300, radius: 30, maxRadius: 800, alpha: 1, speed: 25, thickness: 30, color: "#f1c40f" }); 
            window.spawnDebris(e.x, window.GROUND_Y, 25); 
            window.vibrateDevice([300, 100, 300]); window.glitchAmount = 10;
        } 
        else if (isPerfectCounter) { dmg = 100 * comboMult; punchColor = "#00f3ff"; window.targetZ += 30; window.hitZoomTimer = 15; window.whiteFlashAlpha = 0.5; window.cameraTilt = 0.15; window.spawnDamageNumber(400, 180, "⚔️ PUNISHMENT! ⚔️", "#00f3ff", true); window.vibrateDevice(150); } 
        else { window.playerFPS.rage = Math.min(100, window.playerFPS.rage + 15); if (isCrit) { dmg = Math.floor(dmg * 1.8); punchColor = "#ff4757"; window.hitZoomTimer = 10; window.whiteFlashAlpha = 0.3; window.cameraTilt = (Math.random() > 0.5 ? 0.1 : -0.1); window.vibrateDevice(50); } }

        if (window.playerFPS.clutchActive) dmg = Math.floor(dmg * 1.4);
        window.targetZ += (isCrit ? 30 : 10); 
        if (window.targetZ >= 200 && !isRagePunch) { window.targetZ -= 80; e.vy = -6; e.hitStun += 35; dmg = Math.floor(dmg * 1.5); window.spawnDamageNumber(e.x, 130, "💢 WALL BOUNCE!", "#ff4d4d", true); window.shakeScreen(20, 15); window.playSound(120, 'triangle', 0.5, 0.9, true); window.vibrateDevice(200); }

        e.hp -= dmg;
        if (isCrit || isRagePunch) { window.floorSplatters.push({ x: e.x + (Math.random()-0.5)*150, z: window.enemyZ + (Math.random()-0.5)*50, size: 5 + Math.random()*15, color: "rgba(180, 0, 0, 0.6)" }); }

        if (e.hp <= 0) {
            if (!window.handleAnimeComeback(e, false)) { window.triggerFatality(e, isRagePunch); window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, "rgba(220, 0, 0, 0.9)", true, punchDir); window.spawnScreenBlood(); }
        } else {
            if (isCrit || isRagePunch || isPerfectCounter) { e.state = 'hurt'; e.hitStun = isRagePunch ? 45 : 25; e.attackTimer = 0; e.guardBreakTimer = 0; if (isCrit) window.spawnScreenBlood(); } else { if (e.attackTimer <= 0) { e.state = 'hurt'; e.hitStun = 10; } }
            if (!isRagePunch) { 
                let hitStopDuration = (isCrit || isPerfectCounter) ? 80 : 0; // Tăng thời gian khựng hình
                if (hitStopDuration > 0) { 
                    window.timeScale = 0.05; // Hiệu ứng Hit-stop cực mạnh
                    setTimeout(() => { window.timeScale = 1.0; }, hitStopDuration); 
                } 
            }
            window.shakeScreen(isCrit ? 15 : 8, isCrit ? 12 : 5); 
            window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, punchColor, isCrit, punchDir);
            
            if (window.playerFPS.combo > 1 && window.spawnDamageNumber) {
                let comboRank = "NICE!"; let fontSize = 35;
                if (window.playerFPS.combo === 3) { comboRank = "🔥 AWESOME!"; fontSize = 42; window.announce("Awesome!"); }
                if (window.playerFPS.combo === 5) { comboRank = "⚡ UNSTOPPABLE!"; fontSize = 50; punchColor = "#00f3ff"; window.announce("Unstoppable!"); }
                if (window.playerFPS.combo === 7) { comboRank = "👑 GODLIKE!!!"; fontSize = 60; punchColor = "#f1c40f"; window.shakeScreen(8, 5); window.announce("Godlike!", 0.7); }
                window.spawnDamageNumber(250 + Math.random()*20, 250 + Math.random()*20, `${comboRank} (x${window.playerFPS.combo})`, punchColor, window.playerFPS.combo >= 5);
            }
            window.spawnDamageNumber(e.x + (Math.random()*40-20), e.y - 120, isRagePunch ? `💥💥 -${Math.floor(dmg)}` : (isCrit ? `💥 -${Math.floor(dmg)}` : `-${Math.floor(dmg)}`), punchColor, isCrit);
        }
    } else { window.playerFPS.combo = 0; window.floatingTexts.push({ x: window.canvas.width/2 + (hand==='left'? -80:80), y: window.canvas.height/2, text: "MISS!", color: "#7f8c8d", alpha: 1, vx: 0, vy: -1, font: "bold 25px Arial", life: 25 }); }
};

window.blockFPS = function() { 
    if (window.superArtTimer > 0 || window.gameOver || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return; 
    let e = window.enemies[0]; let isParry = (e && e.attackTimer > 5 && e.attackTimer < 18);
    window.playerFPS.isBlocking = true; document.getElementById("left-glove").classList.add("glove-block-left"); document.getElementById("right-glove").classList.add("glove-block-right"); 

    if (isParry) {
        window.playSound(700, 'triangle', 0.4, 0.9, true); 
        window.playSound(100, 'sawtooth', 0.8, 1.0, true); window.vibrateDevice(100);
        window.shakeScreen(15, 10); window.whiteFlashAlpha = 0.6; window.hitZoomTimer = 10;
        window.playerFPS.rage = Math.min(100, window.playerFPS.rage + 25); 
        window.parryShieldRadius = 150; 
        window.spawnDamageNumber(400, window.canvas.height/2 + 50, "🛡️ PERFECT PARRY! 🛡️", "#f1c40f", true);
        window.spawnParticles(400, 300, "#f1c40f", true, 0); window.shockwaves.push({ x: 400, y: 300, radius: 10, maxRadius: 300, alpha: 1, speed: 20, thickness: 10, color: "#f1c40f" });
        e.attackTimer = 0; e.hitStun = 30; window.playerFPS.parryInvuln = 10; 
        if(Math.random() < 0.5) window.spawnSpeechBubble(200, 450, ["Gotcha!", "Too weak!"][Math.floor(Math.random()*2)], false);
    }
    const releaseBlock = () => { window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); document.removeEventListener('mouseup', releaseBlock); document.removeEventListener('touchend', releaseBlock); }; 
    document.addEventListener('mouseup', releaseBlock); document.addEventListener('touchend', releaseBlock); 
};

window.dodgeFPS = function() { 
    if (window.superArtTimer > 0 || window.playerFPS.isDodging || window.gameOver || window.playerFPS.guardBreakTimer > 0 || window.clashStruggleTimer > 0) return; 
    let e = window.enemies[0]; let isPerfect = (e && e.attackTimer > 5 && e.attackTimer < 20); 
    window.playerFPS.isDodging = true; window.playerFPS.iFrames = isPerfect ? 50 : 30; window.playerFPS.dodgeDir = Math.random() > 0.5 ? 1 : -1; window.playerFPS.dodgeTimer = isPerfect ? 45 : 35; 
    if (isPerfect) { 
        window.perfectDodgeFlash = 1.0; window.speedLinesAlpha = 1.0; window.playerFPS.perfectDodgeBuff = true; window.playSound(800, 'sine', 0.5, 0.6); 
        window.spawnDamageNumber(400, window.canvas.height/2 + 80, "⚡ MATRIX DODGE! ⚡", "#00f3ff", true); window.vibrateDevice(50);
        window.camZoom = 1.25; window.cameraTilt = window.playerFPS.dodgeDir * 0.3; e.attackTimer = 0; e.state = 'idle'; e.hitStun = 40; 
        window.announce("Dodge!", 1.5);
        window.timeScale = 0.2; // Matrix Time slow
        setTimeout(() => { window.timeScale = 1.0; }, 400);
        setTimeout(() => { let counterHand = window.playerFPS.dodgeDir === 1 ? 'right' : 'left'; window.punch(counterHand); }, 350); 
    } else { window.playSound(200, 'sine', 0.2, 0.4); if (Math.random() < 0.75) { setTimeout(() => { let counterHand = window.playerFPS.dodgeDir === 1 ? 'right' : 'left'; window.punch(counterHand); }, 180); } } setTimeout(() => { window.playerFPS.isDodging = false; }, isPerfect ? 600 : 400); 
};

window.update = function() {
    if (!window.canvas) { window.canvas = document.getElementById("battleCanvas"); if(window.canvas) window.ctx = window.canvas.getContext("2d"); } 
    if (!window.canvas || !window.ctx) return; 
    
    // Áp dụng TimeScale cho MỌI TỐC ĐỘ (Vật lý, Hạt, Timer)
    let t = window.timeScale;

    if (!window.uiCache.initialized) {
        window.uiCache.h1 = document.getElementById("hp-red"); window.uiCache.h2 = document.getElementById("hp-blue"); window.uiCache.initialized = true;
    }

    if (window.superArtTimer > 0) {
        window.superArtTimer -= t;
        if (window.superArtData) { window.superArtData.offset += (0 - window.superArtData.offset) * 0.15 * t; }
        return; 
    }

    if (window.particles.length > 60) window.particles.splice(0, window.particles.length - 60);
    if (window.debris.length > 20) window.debris.splice(0, window.debris.length - 20);

    for (let i = window.speechBubbles.length - 1; i >= 0; i--) { let b = window.speechBubbles[i]; b.life-=t; b.y -= 0.5*t; if(b.life <= 0) window.speechBubbles.splice(i, 1); }

    window.heartbeatPhase += 0.15 * t;
    for (let i = window.shockwaves.length - 1; i >= 0; i--) { let sw = window.shockwaves[i]; sw.radius += sw.speed*t; sw.alpha -= 0.05*t; sw.thickness *= 1 - (0.15*t); if (sw.alpha <= 0) window.shockwaves.splice(i, 1); }
    for (let i = window.screenBlood.length - 1; i >= 0; i--) { let sb = window.screenBlood[i]; sb.y += sb.vy*t; sb.alpha -= 0.005*t; if (sb.alpha <= 0) window.screenBlood.splice(i, 1); }
    for (let i = window.glassShards.length - 1; i >= 0; i--) { let g = window.glassShards[i]; g.x += g.vx*t; g.vy += 0.5*t; g.y += g.vy*t; g.rot += g.vRot*t; g.life-=t; if (g.life <= 0 || g.y > 1000) window.glassShards.splice(i, 1); }
    for (let i = window.debris.length - 1; i >= 0; i--) { let d = window.debris[i]; d.vy += window.GRAVITY*t; d.x += d.vx*t; d.y += d.vy*t; d.rot += d.vRot*t; if (d.y > window.GROUND_Y) { d.y = window.GROUND_Y; d.vy *= -0.4; d.vx *= 0.6; } d.life-=t; if (d.life <= 0) window.debris.splice(i, 1); }

    if(window.parryShieldRadius > 0) window.parryShieldRadius += 15*t; if(window.parryShieldRadius > 500) window.parryShieldRadius = 0;

    window.clutchFlashTimer+=t; if (window.damageFlashAlpha > 0) window.damageFlashAlpha -= 0.05*t; if (window.perfectDodgeFlash > 0) window.perfectDodgeFlash -= 0.06*t; if (window.hitZoomTimer > 0) window.hitZoomTimer-=t;
    if (window.fatalBlowFlash > 0) window.fatalBlowFlash-=t; if (window.speedLinesAlpha > 0) window.speedLinesAlpha -= 0.04*t; if (window.whiteFlashAlpha > 0) window.whiteFlashAlpha -= 0.08*t;
    if (window.blackoutTimer > 0) window.blackoutTimer-=t; if (window.glitchAmount > 0) window.glitchAmount -= 0.5*t;
    
    if (window.clashStruggleTimer > 0) {
        window.clashStruggleTimer-=t; window.shakeScreen(5, 8); window.spawnParticles(400, 200, "#f1c40f", false, 0); 
        if (window.clashStruggleTimer <= 0) { 
            if (window.clashWinner === 'player') {
                window.targetZ -= 40; window.enemies[0].hitStun = 30; window.spawnDamageNumber(400, 200, "🔥 OVERPOWERED!", "#00f3ff", true);
            } else {
                window.targetZ += 60; window.playerFPS.hp -= 30; window.damageFlashAlpha = 0.5; window.shakeScreen(20, 15); window.vibrateDevice(200);
                window.spawnDamageNumber(400, 200, "💥 OVERWHELMED!", "#ff4757", true);
            }
        } 
        return; 
    }
    
    if (window.koGlitchTimer > 0) window.koGlitchTimer-=t; if (window.introTimer > 0) { window.introTimer-=t; if (window.introTimer <= 60 && window.introTimer > 59) { window.playSound(100, 'sine', 0.5, 0.5, true); window.shakeScreen(10, 8); } return; }
    window.globalWind = Math.sin(Date.now() / 2500) * 1.5; window.matchTimer+=t; if (window.shakeTime > 0) window.shakeTime-=t; 
    
    if (window.playerFPS.attackCooldown > 0) window.playerFPS.attackCooldown-=t; if (window.playerFPS.iFrames > 0) window.playerFPS.iFrames-=t;
    if (!window.playerFPS.guardBreakTimer) window.playerFPS.guardBreakTimer = 0; if (window.playerFPS.parryInvuln > 0) window.playerFPS.parryInvuln-=t;
    
    if (window.playerFPS.guardBreakTimer > 0) { 
        window.playerFPS.guardBreakTimer-=t; window.playerFPS.isBlocking = false; 
        document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); 
    } else { 
        if (!window.playerFPS.isBlocking) { window.playerFPS.guardHealth = Math.min(100, (window.playerFPS.guardHealth || 100) + 0.5*t); } 
    }

    let e = window.enemies[0];
    if (e && e.rage === undefined) e.rage = 0; if (e && !e.guardBreakTimer) e.guardBreakTimer = 0;
    if (e && e.guardBreakTimer > 0) { e.guardBreakTimer-=t; e.state = 'hurt'; e.hitStun = 10; } 

    if (window.playerFPS.hp <= 300 && !window.playerFPS.clutchUsed && !window.gameOver) { window.playerFPS.clutchUsed = true; window.playerFPS.clutchActive = true; window.playerFPS.rage = 100; window.spawnDamageNumber(400, 130, "🔥 SURVIVAL INSTINCT!", "#f1c40f", true); window.playSound(80, 'sawtooth', 1.0, 1.0, true); window.shakeScreen(20, 10); window.speedLinesAlpha = 1.0; }
    if (e && e.hp <= e.maxHp * 0.3 && !e.clutchUsed && !window.gameOver) { e.clutchUsed = true; e.clutchActive = true; e.rage = 100; window.spawnDamageNumber(e.x, e.y - 170, "🚨 ENEMY ENRAGED! 🚨", "#ff003c", true); window.playSound(80, 'sawtooth', 1.0, 1.0, true); window.shakeScreen(20, 10); }

    let targetCamX = 0; let targetCamY = 0; let targetTilt = 0; let targetZoom = 1.0;
    if (window.hitZoomTimer > 0) { targetZoom = window.gameOver ? 1.25 : 1.15; if(!window.gameOver && e) { targetCamX = (e.x - 400) * 0.5; targetCamY = (e.y - 300) * 0.2; } } 
    if (window.playerFPS.rage >= 100) { targetZoom = Math.max(targetZoom, 1.05); targetCamY += Math.sin(window.matchTimer * 0.1)*5; }

    if (window.playerFPS.hp <= 0) { targetCamY = 300; targetTilt = -Math.PI / 6; targetZoom = 1.2; window.damageFlashAlpha = 0.6; } else { targetCamY += Math.sin(window.matchTimer * 0.03) * 3; targetCamX += Math.cos(window.matchTimer * 0.02) * 2; }
    if (e && e.hp > 0) { let enemyOffsetX = e.x - 400; targetCamX += enemyOffsetX * 0.45; targetTilt += (enemyOffsetX / 400) * 0.08; }

    if (window.playerFPS.dodgeTimer > 0) { window.playerFPS.dodgeTimer-=t; let phase = Math.sin((window.playerFPS.dodgeTimer / (window.playerFPS.perfectDodgeBuff?45:35)) * Math.PI); targetCamX += window.playerFPS.dodgeDir * 240 * phase; targetTilt += window.playerFPS.dodgeDir * 0.25 * phase; targetCamY += 35 * phase; if(window.hitZoomTimer <= 0) targetZoom = 1.08; }
    if (window.playerFPS.moveTimer > 0) { window.playerFPS.moveTimer-=t; let phase = Math.sin((window.playerFPS.moveTimer / 25) * Math.PI); targetCamY += 15 * phase; if(window.hitZoomTimer <= 0) targetZoom = 1.03; }

    window.camX += (targetCamX - window.camX) * 0.15 * t; window.camY += (targetCamY - window.camY) * 0.15 * t; window.cameraTilt += (targetTilt - window.cameraTilt) * 0.15 * t; window.camZoom += (targetZoom - window.camZoom) * 0.15 * t;
    if (window.playerFPS.hp > 0) window.enemyZ += (window.targetZ - window.enemyZ) * 0.15 * t; 
    if (Math.abs(window.cameraTilt) > 0.05) window.cameraTilt *= 1 - (0.15*t);

    if (e && e.hp > 0 && !window.gameOver && window.introTimer <= 0) {
        if (!window.playerFPS.aiStateTimer) window.playerFPS.aiStateTimer = 0; if (window.playerFPS.aiStateTimer > 0) window.playerFPS.aiStateTimer-=t;
        
        if (e.y < window.GROUND_Y && e.hitStun > 0 && window.enemyZ < 150) { 
            if (Math.floor(window.matchTimer) % 15 === 0) { let hand = Math.random() > 0.5 ? 'left' : 'right'; window.punch(hand); } 
        }
        else if (!window.playerFPS.isBlocking && e.hitStun <= 0 && (!window.playerFPS.dodgeTimer || window.playerFPS.dodgeTimer <= 0) && window.playerFPS.guardBreakTimer <= 0) {
            if (window.playerFPS.aiStateTimer <= 0) {
                window.playerFPS.aiStateTimer = window.playerFPS.clutchActive ? Math.floor(10 + Math.random() * 15) : Math.floor(20 + Math.random() * 20); 
                
                if (e.attackTimer > 5 && e.attackTimer < 18) { 
                    let defendRoll = Math.random(); 
                    if (defendRoll < 0.35) { window.blockFPS(); setTimeout(() => { if(window.playerFPS.guardBreakTimer <= 0) { window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); } }, 400); } else if (defendRoll < 0.70) { window.dodgeFPS(); } 
                } 
                else { 
                    if (window.enemyZ > 75) { window.moveFPS(-1); window.playerFPS.aiStateTimer = 8; } 
                    else if (window.enemyZ < 40 && Math.random() < 0.3) { window.moveFPS(1); } 
                    else { let hand = Math.random() > 0.5 ? 'left' : 'right'; window.punch(hand); } 
                }
            }
        }
    }

    if (e && e.hp > 0 && !window.gameOver) {
        if (!e.baseTargetX) e.baseTargetX = 400; if (!e.targetX) e.targetX = 400; if (!e.lean) e.lean = 0; if (!e.targetLean) e.targetLean = 0;
        if (e.hitStun > 0 || e.guardBreakTimer > 0) { if (e.hitStun > 0) e.hitStun-=t; if (e.hitStun <= 0 && e.guardBreakTimer <= 0) e.state = 'idle'; } 
        else {
            if (e.dodgeTimer && e.dodgeTimer > 0) { e.dodgeTimer-=t; let phase = Math.sin((e.dodgeTimer / 35) * Math.PI); e.targetX = e.baseTargetX + e.dodgeDir * 240 * phase; e.targetLean = e.dodgeDir * 0.55 * phase; if (e.attackTimer > 0) { e.attackTimer-=t; if (e.attackTimer <= 8 && e.attackTimer+t > 8) window.enemyAttackAction(e); } } 
            else {
                if (e.attackTimer > 0) { e.attackTimer-=t; if (e.attackTimer <= 8 && e.attackTimer+t > 8) window.enemyAttackAction(e); } 
                else {
                    if (Math.floor(window.matchTimer) % 45 === 0) { e.baseTargetX = 400 + (Math.random() - 0.5) * 180; if (window.enemyZ > 65) window.targetZ = 35; else if (Math.random() < 0.1) window.targetZ = 95; }
                    e.targetX = e.baseTargetX; e.targetLean = -(e.x - 400) * 0.002; e.targetX += Math.sin(window.matchTimer * 0.05) * 5; 
                    let attackChance = e.clutchActive ? 0.22 : 0.13;
                    if (window.enemyZ <= 85 && Math.random() < attackChance) { 
                        e.state = ['punch', 'cross', 'hook', 'uppercut'][Math.floor(Math.random()*4)]; e.attackTimer = 22; e.targetLean = (Math.random() - 0.5) * 0.4; 
                        if (e.rage >= 100) { window.triggerSuperArtCutIn(e.className, e.avatarUrl, e.color, "FATAL COMBO!", false); e.rage = 0; e.dmgMod *= 1.8; }
                    } else if (Math.abs(e.targetX - e.x) > 15) { e.state = 'dash'; } else { e.state = 'idle'; }
                }
            } e.x += (e.targetX - e.x) * 0.12 * t; e.lean += (e.targetLean - e.lean) * 0.15 * t; 
        }
    }

    if (e && e.hp <= 0) { 
        if(e.koTimer > 0) e.koTimer-=t; 
        if (e.koType === 'spin' && e.state === 'ko_falling') e.rotation += 0.35*t; 
        if (e.koType === 'backflip' && e.state === 'ko_falling') { e.rotation -= 0.2*t; window.enemyZ += 2*t; }
        if (e.koType === 'screensplat') {
            if (!e.hasHitScreen) { window.enemyZ -= 8*t; if (window.enemyZ <= -110) { e.hasHitScreen = true; e.vy = 0; window.enemyZ = -110; window.shakeScreen(30, 20); window.playSound(100, 'square', 0.5, 1.0, true); window.vibrateDevice(300); } } else { e.vy += 0.1*t; e.y += e.vy*t; if (e.y > window.GROUND_Y + 200) e.state = 'dead'; }
        }
        else if (e.koType === 'crumple') { if (e.state === 'ko_falling') { e.y += 2.5*t; if (e.y > window.GROUND_Y + 50) { e.state = 'dead'; } } } else {
            e.vy += window.GRAVITY*t; e.y += e.vy*t; 
            if (e.koType === 'knockback') window.enemyZ += 6*t; if (e.koType === 'uppercut') window.enemyZ += 0.5*t;
            if (e.y > window.GROUND_Y) { 
                e.y = window.GROUND_Y; if (e.bounceCount === undefined) e.bounceCount = 0;
                if (e.bounceCount < 2) { window.spawnDebris(e.x, e.y, 6); }
                if (e.koType === 'uppercut' && e.bounceCount < 1) { e.vy = -7; e.bounceCount++; window.playSound(250, 'square', 0.2, 0.4, true); } 
                else if (e.koType === 'spin' && e.bounceCount < 1) { e.vy = -4; e.bounceCount++; window.playSound(250, 'square', 0.2, 0.4, true); } 
                else if (e.koType === 'backflip' && e.bounceCount < 1) { e.vy = -6; e.bounceCount++; window.playSound(200, 'square', 0.3, 0.5, true); } 
                else { e.vy = 0; e.state = 'dead'; if(e.bounceCount < 2) { window.spawnDebris(e.x, e.y, 8); e.bounceCount = 2; } }
            } 
        }
        if (e.state === 'dead' && (e.koType === 'crumple' || e.koType === 'faceplant')) { if (Math.random() < 0.2) window.bloodPools.push({ x: e.x + (Math.random()-0.5)*80, y: window.GROUND_Y + 15 + (Math.random()-0.5)*10, size: 2, maxSize: 15 + Math.random()*20 }); }
    }

    let h1W = (window.playerFPS.hp / window.playerFPS.maxHp * 100).toFixed(1) + "%";
    if (window.lastUI.h1 !== h1W && window.uiCache.h1) { window.uiCache.h1.style.width = h1W; window.lastUI.h1 = h1W; }
    if (e) { let h2W = (e.hp / e.maxHp * 100).toFixed(1) + "%"; if (window.lastUI.h2 !== h2W && window.uiCache.h2) { window.uiCache.h2.style.width = h2W; window.lastUI.h2 = h2W; } }
    
    for (let i = window.floatingTexts.length - 1; i >= 0; i--) { 
        let txt = window.floatingTexts[i]; 
        if (txt.isPhysics) { txt.vy += window.GRAVITY * 0.4 * t; txt.x += txt.vx * t; txt.y += txt.vy * t; if (txt.y > window.GROUND_Y) { txt.y = window.GROUND_Y; txt.vy *= -0.5; txt.vx *= 0.8; } } else { txt.y += txt.vy * t; }
        txt.alpha -= 0.02 * t; if (txt.alpha <= 0) window.floatingTexts.splice(i, 1); 
    }
    for (let i = window.particles.length - 1; i >= 0; i--) { let pt = window.particles[i]; pt.vy += window.GRAVITY * 0.5 * t; pt.x += pt.vx * t; pt.y += pt.vy * t; pt.life-=t; if (pt.life <= 0) window.particles.splice(i, 1); }
    if(window.weatherParticles) { window.weatherParticles.forEach(w => { w.y += w.speed*t; w.x += (Math.sin(w.y/50)*2 + window.globalWind)*t; if(w.y > window.canvas.height + 20) { w.y = -20; w.x = Math.random() * window.canvas.width; } }); }
}

window.enemyAttackAction = function(e) {
    if (window.playerFPS.iFrames > 0 || window.playerFPS.isDodging || window.enemyZ > 90) { 
        window.playerFPS.combo = 0; window.floatingTexts.push({ x: 400, y: 200, text: "MISS!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "900 35px Arial", life: 40 }); window.targetZ += 15; e.targetLean = (Math.random() - 0.5) * 0.2;
    } 
    else if (window.playerFPS.isBlocking && window.playerFPS.parryInvuln > 0) { return; }
    else if (window.playerFPS.isBlocking) { 
        if (window.playerFPS.combo >= 3) { window.spawnDamageNumber(400, 150, "💔 COMBO BROKEN!", "#e74c3c", true); window.shakeScreen(10, 8); }
        window.playerFPS.combo = 0; window.playSound(600, 'triangle', 0.2, 0.5, true); window.shakeScreen(5, 3); window.targetZ += 15; window.playerFPS.rage += 12; window.whiteFlashAlpha = 0.3;
        
        window.playerFPS.guardHealth = (window.playerFPS.guardHealth || 100) - 35; 
        if (window.playerFPS.guardHealth <= 0) { 
            window.playerFPS.guardBreakTimer = 45; window.shakeScreen(15, 10); window.damageFlashAlpha = 0.5; window.whiteFlashAlpha = 0.8; window.vibrateDevice(100);
            window.spawnDamageNumber(400, window.canvas.height/2, "💔 ARMOR SHATTERED!", "#ef4444", true); window.playSound(80, 'square', 1.0, 1.0, true); 
            window.playerFPS.guardHealth = 100;
        }
    } 
    else {
        if (window.playerFPS.combo >= 3) { window.spawnDamageNumber(400, 150, "💔 COMBO BROKEN!", "#e74c3c", true); window.shakeScreen(10, 8); }
        window.playerFPS.combo = 0; 
        
        let dmg = Math.floor((22 + Math.random() * 8) * e.dmgMod); if (e.clutchActive) dmg = Math.floor(dmg * 1.4); 
        if (e.dmgMod > 1.4) { dmg = Math.floor(dmg * 2.5); window.hitZoomTimer = 30; window.spawnDamageNumber(400, 150, "🔥 FATAL STRIKE!", "#f1c40f", true); e.dmgMod = e.dmgMod / 1.5; window.vibrateDevice([100,50,200]); }
        if (window.enemyZ >= 190) { dmg = Math.floor(dmg * 1.3); window.spawnDamageNumber(400, 230, "💥 HEAVY CORNER DMG!", "#ff4d4d", true); }
        
        window.playerFPS.hp -= dmg; window.playerFPS.rage = Math.min(100, (window.playerFPS.rage || 0) + 20); window.shakeScreen(20, 15); window.playSound(150, 'square', 0.3, 0.8, true); window.damageFlashAlpha = 0.65; window.whiteFlashAlpha = 0.5; window.vibrateDevice(150);
        window.cameraTilt = (Math.random() > 0.5 ? 0.15 : -0.15); 

        if (window.playerFPS.hp <= 0) { 
            if (!window.handleAnimeComeback(window.playerFPS, true)) {
                window.playerFPS.hp = 0; window.gameOver = true; window.koGlitchTimer = 60; window.whiteFlashAlpha = 1.0; window.glitchAmount = 25; window.vibrateDevice([300, 100, 500]);
                window.spawnDamageNumber(400, 200, "YOU ARE DEFEATED!", "#ff4757", true); window.spawnParticles(window.canvas.width/2, window.canvas.height/2, "rgba(220, 0, 0, 0.9)", true); window.spawnScreenBlood(); 
                window.announce("You Lose!", 0.6);
            }
        } else if (Math.random() < 0.25) { window.spawnScreenBlood(); }
    }
}

// 🌟 RENDER LOOP VỚI GLITCH EFFECT VÀ DYNAMIC SHADOW
window.draw = function() {
    let cvs = window.canvas; let cx = window.ctx;
    if (!cvs || !cx) return;
    
    let w = cvs.width; let h = cvs.height;

    // Hỗ trợ Chromatic Aberration (Glitch)
    if (window.glitchAmount > 0) {
        cx.save(); cx.translate((Math.random()-0.5)*window.glitchAmount, (Math.random()-0.5)*window.glitchAmount);
    }

    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, w, h); cx.save();
    if (window.shakeTime > 0) { cx.translate((Math.random() - 0.5) * window.shakeMag, (Math.random() - 0.5) * window.shakeMag); }

    if (typeof window.drawBoxingRing === 'function') { window.drawBoxingRing(cx, w, h); } 
    else { cx.fillStyle = "#05050a"; cx.fillRect(0, 0, w, h); }

    window.floorSplatters.forEach(sp => { cx.save(); let pScale = 300 / (200 + sp.z); cx.translate(sp.x, window.GROUND_Y + (100 - sp.z) * 0.5 + 20); cx.scale(pScale, pScale * 0.3); cx.fillStyle = sp.color; cx.beginPath(); cx.arc(0, 0, sp.size, 0, 6.28); cx.fill(); cx.restore(); });
    window.bloodPools.forEach(bp => { if (bp.size < bp.maxSize) bp.size += 0.2; cx.save(); let pScale = 300 / (200 + window.enemyZ); cx.translate(bp.x, bp.y); cx.scale(pScale, pScale * 0.3); cx.fillStyle = "rgba(139, 0, 0, 0.75)"; cx.beginPath(); cx.arc(0, 0, bp.size, 0, 6.28); cx.fill(); cx.restore(); });
    window.debris.forEach(d => { cx.save(); cx.translate(d.x, d.y); cx.rotate(d.rot); cx.fillStyle = "#34495e"; cx.strokeStyle = "#111"; cx.lineWidth = 1; cx.beginPath(); cx.rect(-d.size/2, -d.size/2, d.size, d.size); cx.fill(); cx.stroke(); cx.restore(); });

    let e = window.enemies[0];
    if (window.playerFPS.clutchActive || (e && e.clutchActive)) {
        cx.save(); cx.globalCompositeOperation = "multiply";
        let darkGrad = cx.createRadialGradient(w/2, h/2 + 50, 150, w/2, h/2 + 50, 500);
        darkGrad.addColorStop(0, "rgba(255,255,255, 1)"); darkGrad.addColorStop(0.5, "rgba(100,100,100, 1)"); darkGrad.addColorStop(1, "rgba(10,10,10, 1)"); 
        cx.fillStyle = darkGrad; cx.fillRect(0, 0, w, h); cx.restore();
    }

    if (e) {
        cx.save(); let pScale = 300 / (200 + Math.max(0, window.enemyZ)); let renderY = window.GROUND_Y + (100 - window.enemyZ) * 0.5;
        
        // DYNAMIC SHADOW CHO ĐỊCH
        if(e.state !== 'dead' && !e.hasHitScreen) {
            cx.save(); cx.translate(e.x, window.GROUND_Y + (100 - window.enemyZ) * 0.5 + 5); 
            cx.scale(pScale, pScale * 0.25);
            let shadowAlpha = Math.max(0.1, 0.6 - (window.GROUND_Y - e.y)*0.005);
            cx.fillStyle = `rgba(0,0,0,${shadowAlpha})`; cx.beginPath(); cx.arc(0, 0, 60, 0, Math.PI*2); cx.fill(); cx.restore();
        }

        cx.translate(e.x, renderY - (window.GROUND_Y - e.y)*pScale); // Lệch Y cho các pha hất tung
        cx.scale(pScale, pScale); if (e.lean) cx.rotate(e.lean); 
        let cloneE = Object.assign({}, e, {x: 0, y: 0}); if (typeof window.drawStickman === 'function') { window.drawStickman(cx, cloneE); } cx.restore();
    }

    if (window.superArtTimer > 0 && window.superArtData) {
        cx.save(); let sa = window.superArtData; let progress = 1 - (window.superArtTimer / 65); 
        cx.fillStyle = "rgba(0, 0, 0, 0.85)"; cx.fillRect(0, 0, w, h); cx.translate(w/2, h/2);
        cx.strokeStyle = `rgba(${window.hexToRgb?window.hexToRgb(sa.color):'255,255,255'}, ${Math.random()*0.5 + 0.5})`; cx.lineWidth = 3; cx.beginPath();
        for(let i=0; i<30; i++) { let ang = Math.random() * 6.28; cx.moveTo(Math.cos(ang)*0, Math.sin(ang)*0); cx.lineTo(Math.cos(ang)*1500, Math.sin(ang)*1500); } cx.stroke();
        cx.rotate(-0.15); cx.beginPath(); cx.rect(-1000, -150, 2000, 300); cx.clip(); cx.fillStyle = sa.color; cx.fillRect(-1000, -150, 2000, 300); 
        if(sa.img && sa.img.complete) { cx.drawImage(sa.img, sa.offset - 150, -250, 400, 400); }
        cx.rotate(0.15); cx.fillStyle = "#fff"; cx.shadowBlur = 10; cx.shadowColor = "#000"; cx.font = "italic 900 80px Impact"; cx.textAlign = "center";
        let textScale = 1 + (1-progress)*2; cx.scale(textScale, textScale); cx.fillText(sa.skill, 0, 0); cx.restore();
        cx.fillStyle = "rgba(0,0,0,0.5)"; cx.fillRect(0,0,w,h); return; 
    }

    window.speechBubbles.forEach(b => {
        cx.save(); cx.translate(b.x, b.y); cx.globalAlpha = Math.min(1, b.life / 20); 
        cx.fillStyle = "#fff"; cx.strokeStyle = "#000"; cx.lineWidth = 3;
        cx.beginPath(); if(cx.roundRect) { cx.roundRect(-80, -30, 160, 40, 10); } else { cx.rect(-80, -30, 160, 40); } cx.fill(); cx.stroke();
        cx.beginPath(); if(b.isLeft) { cx.moveTo(-20, 10); cx.lineTo(-40, 30); cx.lineTo(0, 10); } else { cx.moveTo(20, 10); cx.lineTo(40, 30); cx.lineTo(0, 10); } cx.fill(); cx.stroke();
        cx.fillStyle = "#000"; cx.font = "bold 18px Arial"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(b.text, 0, -10); cx.restore();
    });

    if(window.parryShieldRadius > 0 && window.parryShieldRadius < 400) { cx.save(); cx.translate(400, 300); cx.beginPath(); cx.arc(0, 0, window.parryShieldRadius, 0, 6.28); cx.lineWidth = 15; cx.strokeStyle = `rgba(0, 243, 255, ${1 - window.parryShieldRadius/400})`; cx.stroke(); let hexRadius = window.parryShieldRadius * 0.8; cx.beginPath(); for (let i = 0; i < 6; i++) { cx.lineTo(hexRadius * Math.cos(i * Math.PI / 3), hexRadius * Math.sin(i * Math.PI / 3)); } cx.closePath(); cx.fillStyle = `rgba(0, 243, 255, ${0.3 * (1 - window.parryShieldRadius/400)})`; cx.fill(); cx.restore(); }
    if (window.speedLinesAlpha > 0) { cx.save(); cx.translate(w/2, h/2); cx.strokeStyle = `rgba(255, 255, 255, ${window.speedLinesAlpha})`; cx.lineWidth = 3; cx.beginPath(); for(let i=0; i<15; i++) { let ang = Math.random() * 6.28; cx.moveTo(Math.cos(ang)*250, Math.sin(ang)*250); cx.lineTo(Math.cos(ang)*1200, Math.sin(ang)*1200); } cx.stroke(); cx.restore(); }
    window.shockwaves.forEach(sw => { cx.beginPath(); cx.arc(sw.x, sw.y, sw.radius, 0, 6.28); cx.lineWidth = sw.thickness; cx.strokeStyle = sw.color ? `rgba(${window.hexToRgb?window.hexToRgb(sw.color):'255,255,255'}, ${sw.alpha})` : `rgba(255, 255, 255, ${sw.alpha})`; cx.stroke(); });
    window.screenBlood.forEach(sb => { cx.fillStyle = `rgba(200, 0, 0, ${sb.alpha})`; cx.beginPath(); cx.ellipse(sb.x, sb.y, sb.size, sb.size*1.5, 0, 0, 6.28); cx.fill(); cx.beginPath(); cx.ellipse(sb.x - sb.size*0.3, sb.y + sb.size, sb.size*0.5, sb.size*2, 0, 0, 6.28); cx.fill(); });
    window.glassShards.forEach(g => { cx.save(); cx.translate(g.x, g.y); cx.rotate(g.rot); cx.fillStyle = "rgba(200, 240, 255, 0.6)"; cx.strokeStyle = "rgba(255, 255, 255, 0.8)"; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(0, -g.size); cx.lineTo(g.size, g.size/2); cx.lineTo(-g.size/2, g.size); cx.closePath(); cx.fill(); cx.stroke(); cx.restore(); });

    if(window.weatherParticles) { cx.lineWidth = 2; window.weatherParticles.forEach(w => { if (window.currentWeather === 'snow') { cx.fillStyle = "rgba(255, 255, 255, 0.8)"; cx.beginPath(); cx.arc(w.x, w.y, w.size, 0, 6.28); cx.fill(); } else if (window.currentWeather === 'rain' || window.currentWeather === 'blood_rain') { cx.strokeStyle = window.currentWeather === 'rain' ? "rgba(155, 155, 255, 0.6)" : "rgba(214, 48, 49, 0.75)"; cx.beginPath(); cx.moveTo(w.x, w.y); cx.lineTo(w.x - 6, w.y + 15); cx.stroke(); } }); }
    window.particles.forEach(pt => { cx.globalAlpha = Math.max(0, Math.min(1, pt.life / pt.maxLife)); cx.fillStyle = pt.color; cx.beginPath(); cx.arc(pt.x, pt.y, pt.size, 0, 6.28); cx.fill(); }); cx.globalAlpha = 1.0;
    
    // GLITCH EFFECT TEXT (Chỉ áp dụng nếu đang bị Glitch)
    window.floatingTexts.forEach(t => { 
        cx.font = t.font || "900 22px Arial"; cx.globalAlpha = Math.max(0, t.alpha); cx.textAlign = "center"; cx.lineWidth = 4;
        if (window.glitchAmount > 0 && t.color !== "#fff") {
            cx.fillStyle = "cyan"; cx.fillText(t.text, t.x - window.glitchAmount, t.y);
            cx.fillStyle = "red"; cx.fillText(t.text, t.x + window.glitchAmount, t.y);
        }
        cx.strokeStyle = "#000"; cx.strokeText(t.text, t.x, t.y); cx.fillStyle = t.color; cx.fillText(t.text, t.x, t.y); 
    }); cx.globalAlpha = 1.0;

    if (window.blackoutTimer > 0 || window.fatalBlowFlash > 0) { cx.fillStyle = window.fatalBlowFlash > 0 ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)"; cx.fillRect(0,0,w,h); }

    if (window.destructiveFinishTimer > 0) { cx.save(); cx.translate(w/2, h/2 - 50); let scale = 1 + (200 - window.destructiveFinishTimer) * 0.01; cx.scale(scale, scale); cx.font = "900 180px 'Yu Mincho', 'MS Mincho', serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = `rgba(255, 0, 60, ${window.destructiveFinishTimer / 200})`; cx.fillText("滅", 0, 0); cx.restore(); }
    if (window.perfectDodgeFlash > 0 && !window.gameOver) { let dodgeGrad = cx.createRadialGradient(w/2, h/2, 100, w/2, h/2, 800); dodgeGrad.addColorStop(0, "rgba(0, 243, 255, 0)"); dodgeGrad.addColorStop(1, `rgba(0, 243, 255, ${window.perfectDodgeFlash * 0.5})`); cx.fillStyle = dodgeGrad; cx.fillRect(0, 0, w, h); }
    if (window.playerFPS.clutchActive && !window.gameOver) { let beat = Math.abs(Math.sin(window.heartbeatPhase)); let heartGrad = cx.createRadialGradient(w/2, h/2, 200, w/2, h/2, 600); heartGrad.addColorStop(0, "rgba(220, 20, 60, 0)"); heartGrad.addColorStop(1, `rgba(220, 20, 60, ${0.15 + beat*0.25})`); cx.fillStyle = heartGrad; cx.fillRect(0, 0, w, h); }
    if (window.damageFlashAlpha > 0 && !window.gameOver) { cx.fillStyle = `rgba(255, 0, 0, ${window.damageFlashAlpha})`; cx.fillRect(0, 0, w, h); }
    if (window.whiteFlashAlpha > 0) { cx.fillStyle = `rgba(255, 255, 255, ${window.whiteFlashAlpha})`; cx.fillRect(0, 0, w, h); }
    
    if (window.gameOver && window.matchResolved) { cx.fillStyle = "rgba(0, 0, 0, 0.5)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#000"; cx.fillRect(0, 0, w, 80); cx.fillRect(0, h - 80, w, 80); }

    if (window.introTimer > 0 && !window.gameOver) { cx.fillStyle = "rgba(0, 0, 0, 0.7)"; cx.fillRect(0, 0, w, h); cx.textAlign = "center"; if (window.introTimer > 60) { cx.font = "italic 900 60px Arial"; cx.fillStyle = "#f1c40f"; cx.fillText("GET READY...", w/2, h/2); } else { let scale = 1 + (window.introTimer / 60) * 0.5; cx.save(); cx.translate(w/2, h/2); cx.scale(scale, scale); cx.font = "italic 900 80px Arial"; cx.fillStyle = "#ff4757"; cx.fillText("🥊 FIGHT! 🥊", 0, 20); cx.restore(); } }
    
    if (window.glitchAmount > 0) cx.restore(); // Restore Chromatic Aberration Transform
    cx.restore();
}

window.hexToRgb = function(hex) { let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 255, 255"; }
window.gameLoopFPS = function(timestamp) { if (!window.isLoopRunning) return; requestAnimationFrame(window.gameLoopFPS); if (!timestamp) timestamp = 0; let deltaTime = timestamp - window.lastFrameTime; if (deltaTime >= window.FRAME_MIN_TIME) { window.lastFrameTime = timestamp - (deltaTime % window.FRAME_MIN_TIME); try { window.update(); } catch(e) {} try { window.draw(); } catch(e) {} } }
