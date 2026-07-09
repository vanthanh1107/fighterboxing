// ==========================================
// CHAR_MESSI.JS - CHIBI CARTOON EDITION
// [NÂNG CẤP: DA THỊT COMIC, ÁO ARGENTINA, SỐ 10 TRÊN NGỰC]
// ==========================================

if (!window.cr7Balls) window.cr7Balls = [];

if (!window.cr7Hooked) {
    let oldUpdate = window.update;
    window.update = function() {
        if (typeof oldUpdate === 'function') oldUpdate();
        if (window.matchTimer === 1) window.cr7Balls = [];
        if (window.isCinematicActive || !window.playerFPS) return;

        if (window.cr7Balls && window.cr7Balls.length > 0) {
            for (let i = window.cr7Balls.length - 1; i >= 0; i--) {
                let ball = window.cr7Balls[i];
                ball.z -= ball.speed; ball.rotation += 0.5;

                // Khi quả bóng bay áp sát mặt bạn
                if (ball.z <= 20 && !ball.hasHit) {
                    ball.hasHit = true;
                    if (window.playerFPS.iFrames > 0 || window.playerFPS.isDodging || window.enemyZ > 80) {
                        window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 - 80, text: "💨 NÉ BÓNG!", color: "#2ecc71", alpha: 1, vx: 0, vy: -2, font: "900 30px Arial", life: 40 });
                        window.playSound(200, 'sine', 0.2, 0.4);
                    } else {
                        let damage = ball.dmg;
                        if (window.playerFPS.isBlocking) {
                            damage = Math.floor(damage * 0.3); 
                            window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 - 80, text: "🛡️ CHẶN BÓNG!", color: "#00f3ff", alpha: 1, vx: 0, vy: -2, font: "900 30px Arial", life: 40 });
                            window.playSound(600, 'triangle', 0.2, 0.5, true);
                        } else {
                            let crack = document.getElementById("screen-crack");
                            if(crack) { crack.style.opacity = 1; setTimeout(() => crack.style.opacity = 0, 300); }
                            window.playSound(150, 'square', 0.3, 0.8, true);
                        }
                        window.playerFPS.hp -= damage; window.shakeScreen(20, 15);
                        if (window.playerFPS.hp <= 0) {
                            window.playerFPS.hp = 0; window.gameOver = true; window.matchResolved = true; window.koGlitchTimer = 60;
                            window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2, text: "K.O! BÓNG VÀO MẶT!", color: "#ff4757", alpha: 1, vx: 0, vy: -1, font: "900 50px Arial", life: 180 });
                        }
                    }
                }
                if (ball.z < -100) window.cr7Balls.splice(i, 1);
            }
        }
    };

    let oldDraw = window.draw;
    window.draw = function() {
        if (typeof oldDraw === 'function') oldDraw();
        if (window.cr7Balls && window.cr7Balls.length > 0 && window.ctx && window.canvas) {
            window.ctx.save();
            window.cr7Balls.forEach(ball => {
                if (ball.z < 0 && ball.hasHit) return; 
                window.ctx.save();
                let scale = 300 / (200 + Math.max(0, ball.z));
                let renderY = window.GROUND_Y - 20 + (100 - ball.z) * 0.5;

                window.ctx.translate(window.canvas.width/2 + ball.offsetX * scale, renderY);
                window.ctx.scale(scale, scale); window.ctx.rotate(ball.rotation);

                window.ctx.shadowBlur = 15; window.ctx.shadowColor = "#00f3ff"; window.ctx.fillStyle = "#fff"; 
                window.ctx.beginPath(); window.ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); window.ctx.fill(); window.ctx.lineWidth = 2; window.ctx.strokeStyle = "#111"; window.ctx.stroke();
                
                window.ctx.fillStyle = "#111"; window.ctx.shadowBlur = 0;
                window.ctx.beginPath(); window.ctx.arc(0, 0, ball.radius * 0.4, 0, Math.PI * 2); window.ctx.fill();
                window.ctx.fillRect(-ball.radius*0.8, -2, ball.radius*1.6, 4); window.ctx.fillRect(-2, -ball.radius*0.8, 4, ball.radius*1.6);
                window.ctx.restore();
            });
            window.ctx.restore();
        }
    };
    window.cr7Hooked = true;
}

window.currentLoadedChar = {
    id: "messi", className: "Messi", hp: 1000, speed: 9.0, dmgMod: 1.4, color: "#0984e3", scale: 0.9, 
    avatarUrl: "https://i.ibb.co/GvCyKPj7/Generated-Image-July-05-2026-9-20-PM.jpg",
    gloveUrl: "https://cdn-icons-png.flaticon.com/512/8145/8145417.png", // Găng tay Xanh Dương
    
    executeUltimate: function(caster, target, baseDmg) {
        caster.state = 'dash_back'; caster.attackTimer = 60; window.enemyZ = 250; 
        if (typeof window.playSound === 'function') window.playSound(250, 'sawtooth', 0.2, 0.3);
        if (typeof window.floatingTexts !== 'undefined') window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 - 120, text: "⚽ ANKARA MESSI!", color: "#0984e3", alpha: 1, vx: 0, vy: -1, font: "900 40px Arial", life: 60 });

        setTimeout(() => {
            if (window.gameOver || caster.hp <= 0) return;
            caster.state = 'kick'; window.enemyZ -= 30; 
            if (typeof window.playSound === 'function') window.playSound(180, 'square', 0.2, 0.5, true);
            if (typeof window.shakeScreen === 'function') window.shakeScreen(15, 8);

            window.cr7Balls.push({ z: window.enemyZ, offsetX: (Math.random() - 0.5) * 50, speed: 12, radius: 18, hasHit: false, dmg: baseDmg * 1.5, rotation: 0 });
        }, 400); 
        
        setTimeout(() => { if (window.gameOver || caster.hp <= 0) return; caster.state = 'idle'; caster.attackTimer = 0; window.enemyZ = 120; }, 1000);
    },
    
    drawMethod: function(ctx, p, bounce, ext, pext, isTrail) {
        let pts = typeof window.drawBaseLimbFPS === 'function' ? window.drawBaseLimbFPS(p) : window.drawBaseLimb(ctx, p, bounce, ext, pext, isTrail);
        let {head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR} = pts;

        // 🌟 HÀM VẼ TAY CHÂN MẬP MẠP (COMIC STYLE)
        const drawLimb = (start, end, width, color) => {
            // Vẽ viền đen bên ngoài
            ctx.lineWidth = width + 4; ctx.strokeStyle = "#111"; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
            // Vẽ màu lõi bên trong
            ctx.lineWidth = width; ctx.strokeStyle = color;
            ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
        };

        // Vẽ Cánh tay (Da người)
        let skinColor = "#f1c27d";
        drawLimb(shoulderL, elbowL, 10, skinColor); drawLimb(elbowL, handL, 8, skinColor);
        drawLimb(shoulderR, elbowR, 10, skinColor); drawLimb(elbowR, handR, 8, skinColor); 

        // Vẽ Chân (Da đùi + Tất trắng)
        drawLimb(pelvis, kneeL, 12, skinColor); drawLimb(kneeL, footL, 10, "#ffffff"); // Tất trắng
        drawLimb(pelvis, kneeR, 12, skinColor); drawLimb(kneeR, footR, 10, "#ffffff"); // Tất trắng

        // 🌟 VẼ QUẦN ĐÙI THỂ THAO
        ctx.fillStyle = "#1e272e"; ctx.lineWidth = 3; ctx.strokeStyle = "#111";
        ctx.beginPath();
        ctx.moveTo(pelvis.x - 20, pelvis.y - 5);
        ctx.lineTo(pelvis.x + 20, pelvis.y - 5);
        ctx.lineTo(kneeR.x + 12, kneeR.y - 12);
        ctx.lineTo(pelvis.x, pelvis.y + 15);
        ctx.lineTo(kneeL.x - 12, kneeL.y - 12);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 🌟 VẼ ÁO ĐẤU ARGENTINA
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(shoulderL.x - 8, shoulderL.y - 5);
        ctx.lineTo(shoulderR.x + 8, shoulderR.y - 5);
        ctx.lineTo(pelvis.x + 20, pelvis.y);
        ctx.lineTo(pelvis.x - 20, pelvis.y);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Sọc xanh dương trên áo
        ctx.fillStyle = "#74b9ff";
        ctx.beginPath(); ctx.moveTo(shoulderL.x + 10, shoulderL.y - 5); ctx.lineTo(shoulderL.x + 22, shoulderL.y - 5); ctx.lineTo(pelvis.x + 10, pelvis.y); ctx.lineTo(pelvis.x, pelvis.y); ctx.fill();
        ctx.beginPath(); ctx.moveTo(shoulderR.x - 22, shoulderR.y - 5); ctx.lineTo(shoulderR.x - 10, shoulderR.y - 5); ctx.lineTo(pelvis.x, pelvis.y); ctx.lineTo(pelvis.x - 10, pelvis.y); ctx.fill();

        // 🌟 VẼ SỐ 10 TRÊN NGỰC
        let chestX = (shoulderL.x + shoulderR.x) / 2;
        let chestY = (shoulderL.y + pelvis.y) / 2 - 5;
        ctx.fillStyle = "#111"; 
        ctx.font = "900 24px 'Teko', sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("10", chestX, chestY);

        // 🌟 VẼ GIÀY VÀNG (GOLDEN BOOTS)
        ctx.fillStyle = "#f1c40f"; ctx.strokeStyle = "#111"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(footL.x - 5, footL.y + 5, 14, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(footR.x + 5, footR.y + 5, 14, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();

        // 🌟 VẼ GĂNG TAY 3D TỪ ẢNH
        const drawGlove = (handPt, color, isRight) => {
            ctx.save(); ctx.translate(handPt.x, handPt.y); ctx.scale(handPt.z || 1, handPt.z || 1); 
            if (window.enemyGloveImg && window.enemyGloveImg.complete) {
                let gSize = 55; // Găng to ra một xíu cho hợp với phong cách Chibi
                if (isRight) ctx.scale(-1, 1);
                ctx.drawImage(window.enemyGloveImg, -gSize/2, -gSize/2, gSize, gSize);
            } else {
                ctx.shadowBlur = 10; ctx.shadowColor = color; ctx.fillStyle = color;
                ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill(); 
                ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill(); 
            }
            ctx.restore();
        };

        if (!isTrail) { 
            drawGlove(handL, "#0984e3", false); 
            drawGlove(handR, "#0984e3", true); 
        }
    }
};

if (!window.classStats) window.classStats = {}; window.classStats["messi"] = window.currentLoadedChar;
