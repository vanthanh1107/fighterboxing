// ==========================================
// ENGINE.JS - AUTO-BATTLER CINEMATIC EDITION (V14.0)
// [TÍNH NĂNG MỚI: CAMERA LẮC LƯ THEO BƯỚC CHÂN & NGHIÊNG KHI NÉ ĐÒN]
// ==========================================

window.canvas = null; window.ctx = null; window.audioCtx = null; window.isMuted = false;
window.floatingTexts = []; window.particles = []; window.shockwaves = [];
window.matchTimer = 0; window.shakeTime = 0; window.shakeMag = 0; window.koGlitchTimer = 0;
window.GROUND_Y = 320; window.GRAVITY = 0.8; window.lastFrameTime = 0; window.FRAME_MIN_TIME = 1000 / 60;
window.globalWind = 0;

// Hệ thống Camera 3D
window.camX = 0; 
window.camY = 0; 
window.cameraTilt = 0;

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
window.spawnParticles = function(x, y, color, isCrit = false) { let count = isCrit ? 15 : 8; for(let i=0; i<count; i++) { let angle = Math.random() * Math.PI * 2; let speed = Math.random() * (isCrit?12:6) + 2; window.particles.push({ x: x, y: y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 20, maxLife: 20, color: color, size: Math.random() * 4 + 2 }); } }

// ==========================================
// 2. CÁC HÀM HÀNH ĐỘNG CỦA NGƯỜI CHƠI (TÍCH HỢP CAMERA)
// ==========================================
window.moveFPS = function(dir) {
    if (window.playerFPS.stamina < 5 || window.gameOver || window.playerFPS.isDodging) return;
    window.playerFPS.stamina -= 5;
    
    let e = window.enemies[0];
    if (e) {
        // Thay đổi đích đến (Target) thay vì giật cục để Lerp mượt mà
        e.targetZ += dir * 45; 
        e.targetZ = Math.max(30, Math.min(220, e.targetZ)); 
    }

    // Kích hoạt biến rung lắc bước chân (Head-bobbing)
    window.playerFPS.moveTimer = 20; 
    window.playSound(200, 'sine', 0.1, 0.2);
};

window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isDodging || window.playerFPS.isBlocking) return;
    window.playerFPS.attackCooldown = 15; 
    window.playerFPS.stamina -= 12; 
    
    let glove = document.getElementById(hand + "-glove");
    if(glove) { glove.classList.add(`glove-punch-${hand}`); setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150); }
    window.playSound(350, 'sine', 0.1, 0.3);

    let e = window.enemies[0];
    if (e && e.hp > 0 && window.enemyZ <= 65) {
        
        let defenseRoll = Math.random();
        if (e.attackTimer <= 0 && e.hitStun <= 0) {
            if (defenseRoll < 0.15) {
                window.floatingTexts.push({ x: 400, y: 150, text: "💨 ĐỊCH NÉ!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "bold 30px Arial", life: 30 });
                e.x += (Math.random() > 0.5 ? 40 : -40); 
                return; 
            } else if (defenseRoll < 0.40) {
                window.floatingTexts.push({ x: 400, y: 150, text: "🛡️ ĐỊCH ĐỠ!", color: "#3498db", alpha: 1, vx: 0, vy: -1, font: "bold 30px Arial", life: 30 });
                window.playSound(600, 'triangle', 0.2, 0.4, true);
                window.enemyZ += 5; 
                e.hp -= 2; 
                return; 
            }
        }

        let isCrit = Math.random() < 0.25; 
        let dmg = 40 * (isCrit ? 2 : 1);
        
        e.hp -= dmg; e.state = 'hurt'; e.hitStun = isCrit ? 25 : 12; e.attackTimer = 0; 
        e.targetZ += (isCrit ? 25 : 5); 
        
        window.shakeScreen(isCrit ? 15 : 8, isCrit ? 10 : 5);
        window.spawnParticles(window.canvas.width/2, window.canvas.height/2 - 60, "#ff003c", isCrit);
        window.floatingTexts.push({ x: e.x + (Math.random()*40-20), y: e.y - 120, text: isCrit ? `💥 -${dmg}` : `-${dmg}`, color: isCrit ? "#ff4757" : "#fff", alpha: 1, vx: 0, vy: -3, font: "900 35px Arial", life: 40 });
        
        if (e.hp <= 0) { e.hp = 0; e.state = 'ko_falling'; e.koTimer = 100; e.vy = -10; window.matchResolved = true; window.gameOver = true; window.koGlitchTimer = 60; window.floatingTexts.push({ x: 400, y: 200, text: "K.O! BẠN ĐÃ THẮNG!", color: "#f1c40f", alpha: 1, vx: 0, vy: -1, font: "900 60px Arial", life: 180 }); }
    } else {
        window.floatingTexts.push({ x: window.canvas.width/2 + (hand==='left'? -80:80), y: window.canvas.height/2, text: "MISS!", color: "#7f8c8d", alpha: 1, vx: 0, vy: -1, font: "bold 25px Arial", life: 25 });
    }
};

window.blockFPS = function() {
    if (window.playerFPS.stamina < 15 || window.gameOver) return;
    window.playerFPS.isBlocking = true;
    document.getElementById("left-glove").classList.add("glove-block-left"); document.getElementById("right-glove").classList.add("glove-block-right");
    const releaseBlock = () => { window.playerFPS.isBlocking = false; document.getElementById("left-glove").classList.remove("glove-block-left"); document.getElementById("right-glove").classList.remove("glove-block-right"); document.removeEventListener('mouseup', releaseBlock); document.removeEventListener('touchend', releaseBlock); };
    document.addEventListener('mouseup', releaseBlock); document.addEventListener('touchend', releaseBlock);
};

window.dodgeFPS = function() {
    if (window.playerFPS.stamina < 20 || window.playerFPS.isDodging || window.gameOver) return;
    window.playerFPS.isDodging = true; window.playerFPS.iFrames = 25; window.playerFPS.stamina -= 20;
    
    // Kích hoạt biến Camera Trượt/Nghiêng
    window.playerFPS.dodgeDir = Math.random() > 0.5 ? 1 : -1;
    window.playerFPS.dodgeTimer = 25; 
    
    window.playSound(200, 'sine', 0.2, 0.4);
    setTimeout(() => { window.playerFPS.isDodging = false; }, 400);
};

// ==========================================
// 3. VÒNG LẶP UPDATE (GIAO TRANH & CAMERA LERP)
// ==========================================
window.update = function() {
    if (!window.canvas) { window.canvas = document.getElementById("battleCanvas"); if(window.canvas) window.ctx = window.canvas.getContext("2d"); } 
    if (!window.canvas || !window.ctx) return; 

    if (window.koGlitchTimer > 0) window.koGlitchTimer--;
    if (window.introTimer > 0) { window.introTimer--; if (window.introTimer === 60) { window.playSound(100, 'sine', 0.5, 0.5, true); window.shakeScreen(15, 10); } return; }

    window.globalWind = Math.sin(Date.now() / 2500) * 1.5; window.matchTimer++; if (window.shakeTime > 0) window.shakeTime--; 
    
    if (window.playerFPS.attackCooldown > 0) window.playerFPS.attackCooldown--;
    if (window.playerFPS.iFrames > 0) window.playerFPS.iFrames--;
    if (window.playerFPS.stamina < 100 && !window.playerFPS.isBlocking) window.playerFPS.stamina += 0.4;

    // --- 🌟 TÍNH TOÁN CAMERA NỘI SUY MƯỢT MÀ ---
    let targetCamX = 0; let targetCamY = 0; let targetTilt = 0;

    // Trượt và Nghiêng Camera khi Né
    if (window.playerFPS.dodgeTimer > 0) {
        window.playerFPS.dodgeTimer--;
        targetCamX = window.playerFPS.dodgeDir * 120; // Lướt ngang 120px
        targetTilt = window.playerFPS.dodgeDir * 0.08; // Nghiêng đầu 4.5 độ
        targetCamY = 30; // Hơi cúi đầu xuống
    }

    // Lắc lư đầu chữ U (Head-bobbing) khi Bước tiến/lùi
    if (window.playerFPS.moveTimer > 0) {
        window.playerFPS.moveTimer--;
        targetCamY += Math.sin(window.playerFPS.moveTimer * 0.5) * 20;
        targetCamX += Math.cos(window.playerFPS.moveTimer * 0.5) * 10;
    }

    // Lerp Camera thực tế
    window.camX += (targetCamX - window.camX) * 0.15;
    window.camY += (targetCamY - window.camY) * 0.15;
    window.cameraTilt += (targetTilt - window.cameraTilt) * 0.15;

    let e = window.enemies[0];
    
    // --- [1] AI AUTO-BATTLER CỦA BẠN ---
    if (e && e.hp > 0 && !window.gameOver && window.introTimer <= 0) {
        if (!window.playerFPS.aiStateTimer) window.playerFPS.aiStateTimer = 0;
        if (window.playerFPS.aiStateTimer > 0) window.playerFPS.aiStateTimer--;

        if (!window.playerFPS.isBlocking && e.hitStun <= 0) {
            if (window.playerFPS.aiStateTimer <= 0) {
                window.playerFPS.aiStateTimer = Math.floor(15 + Math.random() * 35); 
                
                if (e.attackTimer > 5) {
                    let defendRoll = Math.random();
                    if (defendRoll < 0.15 && window.playerFPS.stamina > 20) {
                        window.blockFPS();
                        setTimeout(() => { 
                            window.playerFPS.isBlocking = false; 
                            document.getElementById("left-glove").classList.remove("glove-block-left"); 
                            document.getElementById("right-glove").classList.remove("glove-block-right"); 
                        }, 400);
                        window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 + 50, text: "🛡️ TỰ ĐỠ ĐÒN!", color: "#00f3ff", alpha: 1, vx: 0, vy: -2, font: "900 25px Arial", life: 30 });
                    } else if (defendRoll < 0.30) {
                        window.dodgeFPS();
                        window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 + 50, text: "💨 TỰ LÁCH NÉ!", color: "#f1c40f", alpha: 1, vx: 0, vy: -2, font: "900 25px Arial", life: 30 });
                    }
                } 
                else if (window.playerFPS.stamina > 25) {
                    if (window.enemyZ > 65) {
                        window.moveFPS(-1);
                        window.playerFPS.aiStateTimer = 10; 
                    } else {
                        let hand = Math.random() > 0.5 ? 'left' : 'right';
                        window.punch(hand);
                        window.playerFPS.aiStateTimer = 8; 
                    }
                }
                else {
                    window.moveFPS(1); 
                    window.playerFPS.aiStateTimer = 30; 
                }
            }
        }
    }

    // --- [2] AI CỦA KẺ ĐỊCH ---
    if (e && e.hp > 0 && !window.gameOver) {
        if (!e.targetX) e.targetX = 400;
        if (!e.targetZ) e.targetZ = 120;

        if (e.hitStun > 0) { 
            e.hitStun--; if(e.hitStun <= 0) e.state = 'idle'; 
            // KHÔNG đẩy lùi `enemyZ` trực tiếp nữa, chỉ thay đổi `targetZ`
            e.targetZ += (window.enemyZ - e.targetZ) * 0.05; 
        } 
        else {
            if (e.attackTimer > 0) {
                e.attackTimer--;
                if (e.attackTimer === 8) { 
                    if (window.playerFPS.iFrames > 0 || window.playerFPS.isDodging || window.enemyZ > 75) { 
                        window.floatingTexts.push({ x: 400, y: 200, text: "MISS!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "900 35px Arial", life: 40 }); 
                        e.targetZ = 60; 
                    } 
                    else if (window.playerFPS.isBlocking) { 
                        window.playSound(600, 'triangle', 0.2, 0.5, true); window.shakeScreen(5, 3); window.playerFPS.stamina -= 15; 
                        e.targetZ = 80; 
                        window.floatingTexts.push({ x: 400, y: 250, text: "🛡️ BLOCKED", color: "#00f3ff", alpha: 1, vx: 0, vy: -2, font: "900 30px Arial", life: 30 }); 
                    } 
                    else {
                        let dmg = Math.floor((18 + Math.random() * 8) * e.dmgMod); 
                        window.playerFPS.hp -= dmg; 
                        window.shakeScreen(25, 18); 
                        window.playSound(150, 'square', 0.3, 0.8, true);
                        
                        let crack = document.getElementById("screen-crack"); if(crack) { crack.style.opacity = 1; setTimeout(() => crack.style.opacity = 0, 300); }
                        if (window.playerFPS.hp <= 0) { window.playerFPS.hp = 0; window.gameOver = true; window.koGlitchTimer = 60; window.floatingTexts.push({ x: 400, y: 200, text: "VÕ SĨ CỦA BẠN ĐÃ GỤC!", color: "#ff4757", alpha: 1, vx: 0, vy: -1, font: "900 40px Arial", life: 180 }); }
                    }
                }
            } else {
                if (window.matchTimer % 40 === 0) {
                    e.targetX = 400 + (Math.random() - 0.5) * 120;
                    if (window.enemyZ > 55) e.targetZ = 30; 
                    else if (Math.random() < 0.15) e.targetZ = 90; 
                    else e.targetZ = 45; 
                }

                e.x += (e.targetX - e.x) * 0.08;
                window.enemyZ += (e.targetZ - window.enemyZ) * 0.08; 

                if (window.enemyZ <= 60 && Math.random() < 0.09) { 
                    e.state = ['punch', 'cross', 'hook', 'uppercut'][Math.floor(Math.random()*4)]; 
                    e.attackTimer = 20; 
                } else if (Math.abs(e.targetX - e.x) > 10) {
                    e.state = 'dash';
                } else {
                    e.state = 'idle'; 
                }
            }
        }
    }

    if (e && e.hp <= 0) { if(e.koTimer > 0) e.koTimer--; e.vy += window.GRAVITY; e.y += e.vy; window.enemyZ += 2; if (e.y > window.GROUND_Y) { e.y = window.GROUND_Y; e.vy = 0; e.state = 'dead'; } }

    let h1 = document.getElementById("hp-red"), h2 = document.getElementById("hp-blue"), s1 = document.getElementById("stamina-red");
    if(h1) h1.style.width = (window.playerFPS.hp / window.playerFPS.maxHp * 100) + "%"; if(h2 && e) h2.style.width = (e.hp / e.maxHp * 100) + "%"; if(s1) s1.style.width = window.playerFPS.stamina + "%";

    for (let i = window.floatingTexts.length - 1; i >= 0; i--) { let t = window.floatingTexts[i]; t.y += t.vy; t.alpha -= 0.02; if (t.alpha <= 0) window.floatingTexts.splice(i, 1); }
    for (let i = window.particles.length - 1; i >= 0; i--) { let pt = window.particles[i]; pt.vy += window.GRAVITY * 0.5; pt.x += pt.vx; pt.y += pt.vy; pt.life--; if (pt.life <= 0) window.particles.splice(i, 1); }
    if(window.weatherParticles) { window.weatherParticles.forEach(w => { w.y += w.speed; w.x += Math.sin(w.y/50)*2 + window.globalWind; if(w.y > window.canvas.height + 20) { w.y = -20; w.x = Math.random() * window.canvas.width; } }); }
}

// ==========================================
// 4. VÒNG LẶP VẼ (DRAW TÍCH HỢP CAMERA)
// ==========================================
window.draw = function() {
    if (!window.canvas || !window.ctx) return;
    window.ctx.setTransform(1, 0, 0, 1, 0, 0); window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.save();
    
    // 🌟 PHÉP MÀU CỦA CAMERA 3D NẰM Ở ĐÂY 🌟
    // Dịch tâm xoay ra giữa màn hình
    window.ctx.translate(window.canvas.width/2, window.canvas.height/2);
    
    // Phóng to nhẹ để khi nghiêng Camera không bị hở góc viền đen
    window.ctx.scale(1.08, 1.08); 
    
    // Lắc lư khi bước đi và Nghiêng khi Né đòn
    window.ctx.rotate(window.cameraTilt);
    window.ctx.translate(-window.canvas.width/2 + window.camX, -window.canvas.height/2 + window.camY);

    if (window.shakeTime > 0) { window.ctx.translate((Math.random() - 0.5) * window.shakeMag, (Math.random() - 0.5) * window.shakeMag); }

    if (typeof window.drawBoxingRing === 'function') { window.drawBoxingRing(window.ctx, window.canvas.width, window.canvas.height); } 
    else { window.ctx.fillStyle = "#05050a"; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); }

    let e = window.enemies[0];
    if (e) {
        window.ctx.save();
        let perspectiveScale = 300 / (200 + Math.max(0, window.enemyZ)); let renderY = window.GROUND_Y + (100 - window.enemyZ) * 0.5;
        window.ctx.translate(e.x, renderY); window.ctx.scale(perspectiveScale, perspectiveScale);
        let cloneE = Object.assign({}, e, {x: 0, y: 0});
        if (typeof window.drawStickman === 'function') { window.drawStickman(window.ctx, cloneE); }
        window.ctx.restore();
    }

    if(window.weatherParticles) {
        window.ctx.lineWidth = 2;
        window.weatherParticles.forEach(w => { 
            if (window.currentWeather === 'snow') { window.ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; window.ctx.beginPath(); window.ctx.arc(w.x, w.y, w.size, 0, Math.PI*2); window.ctx.fill(); } 
            else if (window.currentWeather === 'rain' || window.currentWeather === 'blood_rain') { window.ctx.strokeStyle = window.currentWeather === 'rain' ? "rgba(155, 155, 255, 0.6)" : "rgba(214, 48, 49, 0.75)"; window.ctx.beginPath(); window.ctx.moveTo(w.x, w.y); window.ctx.lineTo(w.x - 6, w.y + 15); window.ctx.stroke(); } 
            else if (window.currentWeather === 'matrix_rain') { window.ctx.fillStyle = `rgba(0, 255, 68, 0.6)`; window.ctx.font = "bold 15px monospace"; window.ctx.fillText("1", w.x, w.y); }
        });
    }

    window.particles.forEach(pt => { window.ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / pt.maxLife)); window.ctx.fillStyle = pt.color; window.ctx.beginPath(); window.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); window.ctx.fill(); }); window.ctx.globalAlpha = 1.0;
    window.floatingTexts.forEach(t => { window.ctx.font = t.font || "900 22px Arial"; window.ctx.fillStyle = t.color; window.ctx.shadowBlur = 5; window.ctx.shadowColor = t.color; window.ctx.globalAlpha = Math.max(0, t.alpha); window.ctx.textAlign = "center"; window.ctx.fillText(t.text, t.x, t.y); window.ctx.shadowBlur = 0; }); window.ctx.globalAlpha = 1.0;

    // Reset Camera cho các hiệu ứng UI màn hình cố định
    window.ctx.restore(); 

    if (window.koGlitchTimer > 0) { window.ctx.fillStyle = `rgba(255, 0, 0, ${window.koGlitchTimer / 100})`; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; for(let i=0; i<window.canvas.height; i+=5) { window.ctx.fillRect(0, i, window.canvas.width, 1); } }

    if (window.introTimer > 0 && !window.gameOver) {
        window.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height); window.ctx.textAlign = "center";
        if (window.introTimer > 60) { window.ctx.font = "italic 900 60px Arial"; window.ctx.fillStyle = "#f1c40f"; window.ctx.fillText("CHUẨN BỊ...", window.canvas.width/2, window.canvas.height/2); } 
        else { let scale = 1 + (window.introTimer / 60) * 0.5; window.ctx.save(); window.ctx.translate(window.canvas.width/2, window.canvas.height/2); window.ctx.scale(scale, scale); window.ctx.font = "italic 900 80px Arial"; window.ctx.fillStyle = "#ff4757"; window.ctx.fillText("🥊 FIGHT! 🥊", 0, 20); window.ctx.restore(); }
    }
}

window.gameLoopFPS = function(timestamp) { 
    if (!window.isLoopRunning) return; requestAnimationFrame(window.gameLoopFPS); 
    if (!timestamp) timestamp = 0; let deltaTime = timestamp - window.lastFrameTime; 
    if (deltaTime >= window.FRAME_MIN_TIME) { window.lastFrameTime = timestamp - (deltaTime % window.FRAME_MIN_TIME); try { window.update(); } catch(e) {} try { window.draw(); } catch(e) {} } 
}
