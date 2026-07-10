// ==========================================
// GRAPHICS_V3.JS - THE ULTIMATE BATTLE DAMAGE (V5.0)
// [ĐỈNH CAO: NHÂN VẬT CHẢY MÁU, RÁCH ÁO, ĐỔ MỒ HÔI, NHỊP THỞ MỆT MỎI THEO % MÁU]
// ==========================================

window.drawBoxingRing = function(ctx, canvasWidth, canvasHeight) {
    let cmap = window.currentMap || {};
    let cAudience = cmap.audience || "#050608", cMat = cmap.mat || "#1e272e", cSpotlight = cmap.spotlight || "rgba(0, 243, 255, 0.15)", cRopes = cmap.ropes || ["#ff4757", "#ffffff", "#ff4757"], cLogo = cmap.logo || "FIGHTER";
    let vanishY = (window.GROUND_Y || 320) - 80; 

    ctx.fillStyle = cAudience; ctx.fillRect(-canvasWidth, -canvasHeight, canvasWidth * 3, canvasHeight * 3);
    let spotLight = ctx.createRadialGradient(canvasWidth/2, 50, 0, canvasWidth/2, canvasHeight - 100, 600);
    spotLight.addColorStop(0, cSpotlight); spotLight.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spotLight; ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save(); let time = Date.now() / 250; 
    for (let row = 4; row >= 0; row--) {
        let rowY = vanishY - 5 - (row * 28); let numPeople = 45 + row * 10; let rowScale = 1 - (row * 0.12); 
        for (let i = 0; i < numPeople; i++) {
            let x = -300 + (i * ((canvasWidth + 600) / numPeople)) + Math.sin(i * 123.45) * 20;
            let finalY = rowY + Math.sin(time + x * 0.02) * 5 * rowScale;
            ctx.fillStyle = (i % 5 === 0) ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.55)";
            ctx.beginPath(); ctx.arc(x, finalY, 9 * rowScale, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x, finalY + 20 * rowScale, 15 * rowScale, Math.PI, 0); ctx.fill();
            if (Math.sin(time * 1.5 + i) > 0.7) {
                ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2.5 * rowScale; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(x - 12 * rowScale, finalY + 12 * rowScale); ctx.lineTo(x - 18 * rowScale, finalY - 8 * rowScale); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x + 12 * rowScale, finalY + 12 * rowScale); ctx.lineTo(x + 18 * rowScale, finalY - 8 * rowScale); ctx.stroke();
            }
        }
    }
    ctx.restore();

    ctx.save();
    for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() > 0.98 ? Math.random() : 0.02})`;
        ctx.beginPath(); ctx.arc(Math.random() * canvasWidth, Math.random() * (canvasHeight / 2 - 50), Math.random() * 3 + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = cMat; ctx.beginPath(); ctx.moveTo(-200, canvasHeight); ctx.lineTo(canvasWidth + 200, canvasHeight); ctx.lineTo(canvasWidth - 150, vanishY); ctx.lineTo(150, vanishY); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.8)"; ctx.lineWidth = 10; ctx.stroke();

    ctx.save(); ctx.translate(canvasWidth/2, (window.GROUND_Y || 320) + 20); ctx.scale(1, 0.3); ctx.globalAlpha = 0.15;
    ctx.font = "900 110px Impact"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.fillText(cLogo, 0, 0); ctx.restore();

    ctx.lineWidth = 4; ctx.fillStyle = "#111"; ctx.fillRect(140, vanishY - 120, 25, 120); ctx.fillRect(canvasWidth - 165, vanishY - 120, 25, 120);
    ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(145, vanishY - 120, 5, 120); ctx.fillRect(canvasWidth - 160, vanishY - 120, 5, 120);
    for (let i = 0; i < 3; i++) {
        let yF = vanishY - 30 - (i * 30), yN = canvasHeight - 50 - (i * 100); ctx.strokeStyle = cRopes[i] || "#fff";
        ctx.beginPath(); ctx.moveTo(-100, yN); ctx.lineTo(150, yF); ctx.stroke(); ctx.beginPath(); ctx.moveTo(canvasWidth + 100, yN); ctx.lineTo(canvasWidth - 150, yF); ctx.stroke(); ctx.beginPath(); ctx.moveTo(150, yF); ctx.lineTo(canvasWidth - 150, yF); ctx.stroke();
    }
};

window.drawBaseLimbFPS = function(p) {
    // TÍNH TÁN TỶ LỆ MÁU ĐỂ ÁP DỤNG MỆT MỎI (EXHAUSTION)
    let hpRatio = (p.hp !== undefined && p.maxHp) ? Math.max(0, p.hp / p.maxHp) : 1;
    let isExhausted = hpRatio < 0.35; // Dưới 35% máu sẽ thở dốc
    
    // Nhịp thở mệt mỏi sẽ nặng nề và chậm hơn
    let bounceSpeed = isExhausted ? 250 : 120;
    let bounceMag = isExhausted ? 8 : (p.state === 'walk' || p.state === 'dash' ? 6 : 3);
    let bounce = Math.sin(Date.now() / bounceSpeed) * bounceMag; 
    
    // Gập cổ, buông thõng vai khi mệt
    let exhaustLean = (isExhausted && p.state === 'idle') ? 12 : 0; 
    
    let bType = p.bodyType || 'muscular';
    let sW = bType === 'heavy' ? 45 : (bType === 'lean' ? 32 : 38); 
    let hY = bType === 'heavy' ? -150 : -140; 
    
    let head = { x: 0, y: hY + bounce + exhaustLean, z: 1 }; 
    let neck = { x: 0, y: -100 + bounce + exhaustLean*0.5, z: 1 }; 
    let pelvis = { x: 0, y: -20 + bounce, z: 1 };
    let shoulderL = { x: -sW, y: -100 + bounce + exhaustLean*0.8 }; 
    let shoulderR = { x: sW, y: -100 + bounce + exhaustLean*0.8 };
    let footL = { x: -45, y: 0, z: 1 }; let kneeL = { x: -50, y: -15 + bounce, z: 1 }; 
    let footR = { x: 45, y: 0, z: 1 }; let kneeR = { x: 50, y: -15 + bounce, z: 1 };
    let handL = { x: -35, y: -110 + bounce + exhaustLean, z: 1 }; let elbowL = { x: -60, y: -65 + bounce, z: 1 }; 
    let handR = { x: 35, y: -110 + bounce + exhaustLean, z: 1 }; let elbowR = { x: 60, y: -65 + bounce, z: 1 };

    let progress = (p.attackTimer > 0) ? 1 - (p.attackTimer / (p.maxT || 22)) : 0;
    let ext = progress > 0 ? (progress < 0.4 ? Math.sin((progress / 0.4) * (Math.PI / 2)) : 1 - Math.pow((progress - 0.4) / 0.6, 2)) : 0;

    if (p.state === 'punch' || p.state === 'cross' || p.state === 'jab') { handR.x -= 38 * ext; handR.y += 50 * ext; handR.z = 1 + (ext * 5.5); shoulderR.x += 15 * ext; head.x = -15 * ext; head.y -= exhaustLean; } 
    else if (p.state === 'hook' || p.state === 'uppercut') { handL.x += 70 * ext; handL.y -= 30 * ext; handL.z = 1 + (ext * 4.5); shoulderL.x -= 15 * ext; head.x = 25 * ext; head.y -= exhaustLean; }
    else if (p.state === 'hurt') { head.y -= 15; head.x = (Math.random() - 0.5) * 20; handL.y = -30; handL.x = -65; handR.y = -30; handR.x = 65; }
    else if (p.state === 'ko_falling' || p.state === 'dead') { head.y = -20; head.x = 40; handL.y = 15; handR.y = 15; kneeL.y = 5; kneeR.y = 5; }

    return { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR };
};

// ==========================================
// 🌟 LÒ RÈN NHÂN VẬT & BATTLE DAMAGE
// ==========================================
window.drawStickman = function(ctx, p, isTrail = false) {
    if(!p || isNaN(p.x) || isNaN(p.y)) return; ctx.save(); ctx.translate(p.x, p.y); 
    
    let pts = window.drawBaseLimbFPS(p); 
    let { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR } = pts;

    let bType = p.bodyType || 'muscular'; let pType = p.pantsType || 'boxing'; let aura = p.auraType || 'none'; 
    let wArm = bType === 'heavy' ? 18 : (bType === 'lean' ? 10 : 14);
    let wLeg = bType === 'heavy' ? 20 : (bType === 'lean' ? 12 : 16);
    let torsoW = bType === 'heavy' ? 30 : (bType === 'lean' ? 18 : 22);

    let sColor = p.skinColor || "#f1c27d", jColor = p.jerseyColor || p.color || "#0984e3"; 
    let pColor = p.pantsColor || "#1e272e", sockC = p.socksColor || "#fff", shoeC = p.shoesColor || "#f1c40f";

    // 🌟 PHẦN TRĂM MÁU HIỆN TẠI ĐỂ TÍNH TOÁN ĐỘ TƠI TẢ
    let hpRatio = (p.hp !== undefined && p.maxHp) ? Math.max(0, p.hp / p.maxHp) : 1;

    // 1. VẼ HÀO QUANG (AURA) NẾU CÓ
    if (aura !== 'none' && !isTrail && p.hp > 0) {
        let aColor = aura === 'fire' ? "#ff4757" : (aura === 'god' ? "#f1c40f" : "#00f3ff");
        let aSize = Math.sin(Date.now() / 100) * 10 + 60;
        ctx.shadowBlur = 40; ctx.shadowColor = aColor; ctx.fillStyle = aColor; ctx.globalAlpha = hpRatio < 0.3 ? 0.8 : 0.3; // Aura bùng cháy mạnh khi sắp chết
        ctx.beginPath(); ctx.ellipse(0, -60, aSize, aSize * 1.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
    }

    if (!isTrail && p.hp > 0 && p.state !== 'ko_falling') { ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; ctx.beginPath(); ctx.ellipse(0, 5, 55, 15, 0, 0, Math.PI*2); ctx.fill(); }

    // 🌟 HÀM RENDER CƠ BẮP + VẾT THƯƠNG RỈ MÁU
    const draw3DLimb = (start, end, width, color, isSkin = false) => {
        let dx = end.x - start.x; let dy = end.y - start.y;
        let len = Math.sqrt(dx*dx + dy*dy); let angle = Math.atan2(dy, dx);
        ctx.save(); ctx.translate(start.x, start.y); ctx.rotate(angle);
        
        let grad = ctx.createLinearGradient(0, -width/2, 0, width/2);
        grad.addColorStop(0, "rgba(0,0,0,0.7)"); grad.addColorStop(0.3, color);
        grad.addColorStop(0.7, color); grad.addColorStop(1, "rgba(0,0,0,0.7)");

        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.lineWidth = width + 5; ctx.strokeStyle = "#000"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
        ctx.lineWidth = width; ctx.strokeStyle = grad; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();

        // 🌟 BATTLE DAMAGE LÊN DA THỊT
        if (isSkin && hpRatio <= 0.6) {
            // Vết bầm tím (Dưới 60% máu)
            ctx.lineWidth = width * 0.4; ctx.strokeStyle = "rgba(75, 0, 130, 0.35)"; 
            ctx.beginPath(); ctx.moveTo(len * 0.3, -width/4); ctx.lineTo(len * 0.6, 0); ctx.stroke();
            
            // Vết xước rỉ máu đỏ tươi (Dưới 30% máu)
            if (hpRatio <= 0.3) {
                ctx.lineWidth = 2; ctx.strokeStyle = "rgba(220, 0, 0, 0.8)";
                ctx.beginPath(); ctx.moveTo(len * 0.4, width/4); ctx.lineTo(len * 0.7, -width/5); ctx.stroke();
                // Giọt máu nhỏ giọt
                ctx.fillStyle = "rgba(220, 0, 0, 0.8)";
                ctx.beginPath(); ctx.arc(len * 0.55, width/2 + 2, 2, 0, Math.PI*2); ctx.fill();
            }
        }
        
        ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.beginPath(); ctx.moveTo(0, -width/3); ctx.lineTo(len, -width/3); ctx.stroke();
        ctx.restore();
    };

    // VẼ CHÂN VÀ TAY (Kèm cờ isSkin để nhận sát thương)
    let isLongPants = pType === 'long';
    draw3DLimb(pelvis, kneeL, wLeg, isLongPants ? pColor : sColor, !isLongPants); 
    draw3DLimb(kneeL, footL, wLeg - 2, isLongPants ? pColor : sockC, false); 
    draw3DLimb(pelvis, kneeR, wLeg, isLongPants ? pColor : sColor, !isLongPants); 
    draw3DLimb(kneeR, footR, wLeg - 2, isLongPants ? pColor : sockC, false); 

    draw3DLimb(shoulderL, elbowL, wArm, sColor, true); draw3DLimb(elbowL, handL, wArm - 2, sColor, true);
    draw3DLimb(shoulderR, elbowR, wArm, sColor, true); draw3DLimb(elbowR, handR, wArm - 2, sColor, true);

    // VẼ QUẦN ĐÙI
    if (!isLongPants) {
        ctx.fillStyle = pColor; ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.lineJoin = "round";
        ctx.beginPath(); let shortLen = pType === 'muaythai' ? -10 : -15; let flare = pType === 'muaythai' ? 18 : 12;
        ctx.moveTo(pelvis.x - 24, pelvis.y - 8); ctx.lineTo(pelvis.x + 24, pelvis.y - 8);
        ctx.lineTo(kneeR.x + flare, kneeR.y + shortLen); ctx.lineTo(pelvis.x, pelvis.y + 18); ctx.lineTo(kneeL.x - flare, kneeL.y + shortLen);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        
        // 🌟 BATTLE DAMAGE QUẦN BỊ RÁCH (Dưới 45% máu)
        if (hpRatio <= 0.45) {
            ctx.fillStyle = sColor; // Màu da hở ra
            ctx.beginPath(); ctx.moveTo(pelvis.x + 12, pelvis.y - 2); ctx.lineTo(pelvis.x + 22, pelvis.y + 10); ctx.lineTo(pelvis.x + 8, pelvis.y + 5); ctx.fill();
        }
    }

    // Đai lưng vô địch
    ctx.lineWidth = 4; ctx.fillStyle = p.hasChampBelt ? "#f1c40f" : "#111";
    ctx.beginPath(); ctx.roundRect(pelvis.x - 25, pelvis.y - 8, 50, 10, 4); ctx.fill(); ctx.stroke();

    // VẼ THÂN TRÊN ÁO ĐẤU
    let chestGrad = ctx.createLinearGradient(shoulderL.x, 0, shoulderR.x, 0);
    let tColor = p.isShirtless ? sColor : jColor;
    chestGrad.addColorStop(0, "rgba(0,0,0,0.5)"); chestGrad.addColorStop(0.5, tColor); chestGrad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = chestGrad; ctx.lineWidth = 5; ctx.strokeStyle = "#000";
    ctx.beginPath(); ctx.moveTo(shoulderL.x - 8, shoulderL.y - 5); ctx.quadraticCurveTo(0, neck.y + 15, shoulderR.x + 8, shoulderR.y - 5); 
    ctx.lineTo(pelvis.x + torsoW, pelvis.y - 8); ctx.lineTo(pelvis.x - torsoW, pelvis.y - 8); ctx.closePath(); ctx.fill(); ctx.stroke();

    // 🌟 BATTLE DAMAGE ÁO ĐẤU BỊ RÁCH TOẠC (Dưới 50% máu)
    if (!p.isShirtless && hpRatio <= 0.5) {
        ctx.fillStyle = sColor; // Màu da hở ra
        ctx.beginPath(); // Rách nách trái
        ctx.moveTo(shoulderL.x + 5, shoulderL.y + 10); ctx.lineTo(shoulderL.x + 18, shoulderL.y + 35); ctx.lineTo(shoulderL.x - 2, shoulderL.y + 25); ctx.fill();
        if (hpRatio <= 0.25) { // Rách toạc bụng
            ctx.beginPath(); ctx.moveTo(pelvis.x - 5, pelvis.y - 10); ctx.lineTo(pelvis.x + 15, pelvis.y - 35); ctx.lineTo(pelvis.x + 20, pelvis.y - 15); ctx.fill();
        }
    }

    // VẼ GIÀY
    const drawShoe = (footPt, angleMod) => {
        ctx.save(); ctx.translate(footPt.x, footPt.y); ctx.rotate(angleMod);
        ctx.fillStyle = "#ecf0f1"; ctx.lineWidth = 3; ctx.strokeStyle = "#000"; ctx.beginPath(); ctx.roundRect(-16, 2, 32, 12, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = shoeC; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.quadraticCurveTo(0, -12, 16, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    };
    drawShoe(footL, -0.1); drawShoe(footR, 0.1);

    // KHUÔN MẶT
    let faceSize = bType === 'heavy' ? 95 : 85; 
    ctx.shadowBlur = 20; ctx.shadowColor = jColor; ctx.fillStyle = jColor; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2 + 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); 
        ctx.drawImage(window.enemyFaceImg, head.x - faceSize/2, head.y - faceSize/2, faceSize, faceSize); ctx.restore();
        ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.stroke();
        
        // 🌟 BATTLE DAMAGE LÊN KHUÔN MẶT TƠI TẢ
        if (hpRatio <= 0.5) {
            // Mắt bầm đen (Black Eye)
            ctx.fillStyle = "rgba(75, 0, 130, 0.55)"; 
            ctx.beginPath(); ctx.ellipse(head.x + 12, head.y - 8, 14, 10, 0.2, 0, Math.PI*2); ctx.fill();
            
            // Chảy máu miệng đỏ tươi (Dưới 30%)
            if (hpRatio <= 0.3) {
                ctx.strokeStyle = "rgba(200, 0, 0, 0.9)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(head.x - 5, head.y + 15); 
                ctx.quadraticCurveTo(head.x - 12, head.y + 25, head.x - 8, head.y + 35); ctx.stroke();
                // Giọt máu rớt xuống cằm
                ctx.fillStyle = "rgba(200, 0, 0, 0.9)";
                ctx.beginPath(); ctx.arc(head.x - 8, head.y + 38, 2.5, 0, Math.PI*2); ctx.fill();
            }
        }
    } else { 
        ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); 
    }

    // 🌟 HIỆU ỨNG VÃ MỒ HÔI (SWEAT DROPS) KHI MỆT
    if (hpRatio <= 0.45 && p.state !== 'ko_falling' && p.state !== 'dead') {
        let sTime = Date.now() / 150;
        // Giọt mồ hôi 1 văng ra từ thái dương
        let sX1 = head.x - 30 + Math.sin(sTime) * 15;
        let sY1 = head.y - 10 + (sTime * 25) % 45;
        ctx.fillStyle = "rgba(200, 240, 255, 0.75)";
        ctx.beginPath(); ctx.arc(sX1, sY1, 3.5, 0, Math.PI*2); ctx.fill();
        
        // Giọt mồ hôi 2 nếu cực kỳ kiệt sức
        if (hpRatio <= 0.2) {
            let sX2 = head.x + 25 + Math.cos(sTime) * 10;
            let sY2 = head.y + 5 + (sTime * 30 + 20) % 50;
            ctx.beginPath(); ctx.arc(sX2, sY2, 2.5, 0, Math.PI*2); ctx.fill();
        }
    }

    // GĂNG TAY ĐẤM BỐC 3D
    const drawRealImageGlove = (handPt, isRight) => {
        ctx.save(); ctx.translate(handPt.x, handPt.y); ctx.scale(handPt.z, handPt.z); 
        ctx.shadowBlur = 25; ctx.shadowColor = "rgba(0,0,0,0.8)"; 
        if (window.enemyGloveImg && window.enemyGloveImg.complete && window.enemyGloveImg.naturalWidth > 0) {
            let gSize = bType === 'heavy' ? 75 : 65; 
            if (isRight) ctx.scale(-1, 1); 
            ctx.drawImage(window.enemyGloveImg, -gSize/2, -gSize/2, gSize, gSize);
        } else {
            ctx.fillStyle = jColor; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    };

    if (!isTrail) { drawRealImageGlove(handL, false); drawRealImageGlove(handR, true); }
    ctx.restore();
};

window.assignDrawMethods = function(statsObj) { };
