// ==========================================
// GRAPHICS_V3.JS - UNREAL ENGINE SHADING EDITION (V8.0)
// [ĐỈNH CAO: DA THỊT ĐẪM MỒ HÔI, KHÓI THỞ DỐC, SÁU MÚI 3D, BÓNG NỘI THỂ]
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
    let hpRatio = (p.hp !== undefined && p.maxHp) ? Math.max(0, p.hp / p.maxHp) : 1;
    let isExhausted = hpRatio < 0.40; 
    let bounceSpeed = isExhausted ? 250 : 120; let bounceMag = isExhausted ? 8 : (p.state === 'walk' || p.state === 'dash' ? 6 : 3);
    let bounce = Math.sin(Date.now() / bounceSpeed) * bounceMag; 
    let exhaustLean = (isExhausted && p.state === 'idle') ? 15 : 0; 
    
    let bType = p.bodyType || 'muscular';
    let sW = bType === 'heavy' ? 45 : (bType === 'lean' ? 32 : 38); let hY = bType === 'heavy' ? -150 : -140; 
    
    let head = { x: 0, y: hY + bounce + exhaustLean, z: 1 }; let neck = { x: 0, y: -100 + bounce + exhaustLean*0.5, z: 1 }; let pelvis = { x: 0, y: -20 + bounce, z: 1 };
    let shoulderL = { x: -sW, y: -100 + bounce + exhaustLean*0.8 }; let shoulderR = { x: sW, y: -100 + bounce + exhaustLean*0.8 };
    let footL = { x: -45, y: 0, z: 1 }; let kneeL = { x: -50, y: -15 + bounce, z: 1 }; 
    let footR = { x: 45, y: 0, z: 1 }; let kneeR = { x: 50, y: -15 + bounce, z: 1 };
    let handL = { x: -35, y: -110 + bounce + exhaustLean, z: 1 }; let elbowL = { x: -60, y: -65 + bounce, z: 1 }; 
    let handR = { x: 35, y: -110 + bounce + exhaustLean, z: 1 }; let elbowR = { x: 60, y: -65 + bounce, z: 1 };

    let progress = (p.attackTimer > 0) ? 1 - (p.attackTimer / (p.maxT || 22)) : 0;
    let ext = progress > 0 ? (progress < 0.4 ? Math.sin((progress / 0.4) * (Math.PI / 2)) : 1 - Math.pow((progress - 0.4) / 0.6, 2)) : 0;

    if (p.state === 'punch' || p.state === 'cross' || p.state === 'jab') { handR.x -= 38 * ext; handR.y += 50 * ext; handR.z = 1 + (ext * 5.5); shoulderR.x += 15 * ext; head.x = -15 * ext; head.y -= exhaustLean; } 
    else if (p.state === 'hook' || p.state === 'uppercut') { handL.x += 70 * ext; handL.y -= 30 * ext; handL.z = 1 + (ext * 4.5); shoulderL.x -= 15 * ext; head.x = 25 * ext; head.y -= exhaustLean; }
    else if (p.state === 'hurt') { head.y -= 15; head.x = (Math.random() - 0.5) * 20; handL.y = -30; handL.x = -65; handR.y = -30; handR.x = 65; }
    else if (p.state === 'ko_falling' || p.state === 'dead') { 
        let koType = p.koType || 'knockback';
        if (koType === 'uppercut') { head.y -= 30; head.x = 15; pelvis.y -= 10; handL.y = -30; handL.x = -50; elbowL.y = -60; elbowL.x = -40; handR.y = -30; handR.x = 50; elbowR.y = -60; elbowR.x = 40; kneeL.y = 10; kneeL.x = -35; kneeR.y = 10; kneeR.x = 35; footL.y = 30; footR.y = 30; } 
        else if (koType === 'knockback') { head.y = -10; head.x = 40; neck.x = 20; pelvis.x = -10; handL.y = -80; handL.x = 55; elbowL.y = -70; elbowL.x = 10; handR.y = -80; handR.x = 85; elbowR.y = -70; elbowR.x = 40; kneeL.x = -40; kneeL.y = 0; kneeR.x = -60; kneeR.y = -10; }
        else if (koType === 'crumple') { let drop = p.state === 'dead' ? 60 : 35; head.y = hY + drop + 20; head.x = 35; neck.y = -100 + drop; pelvis.y = -20 + drop; shoulderL.y = -100 + drop; shoulderR.y = -100 + drop; kneeL.x = -25; kneeL.y = drop + 10; footL.x = -45; footL.y = drop + 10; kneeR.x = 25; kneeR.y = drop + 10; footR.x = 45; footR.y = drop + 10; handL.y = drop; handL.x = -30; handR.y = drop; handR.x = 30; }
        else if (koType === 'spin') { head.y = hY + 20; head.x = 15; handL.y = -50; handL.x = -20; handR.y = -50; handR.x = 20; kneeL.y = -30; kneeR.y = -30; }
        else if (koType === 'faceplant') { let drop = p.state === 'dead' ? 120 : 60; head.y = hY + drop + 40; head.x = 0; neck.y = -100 + drop; pelvis.y = -20 + drop; handL.y = drop - 20; handL.x = -30; handR.y = drop - 20; handR.x = 30; kneeL.y = drop - 20; kneeR.y = drop - 20; if(p.state === 'dead') { head.y = 20; head.x = 20; } }
        else if (koType === 'backflip') { head.y = hY + 30; head.x = -15; neck.y = -80; pelvis.y = 0; handL.y = -120; handL.x = -40; handR.y = -120; handR.x = 40; kneeL.y = -20; kneeR.y = -20; }
        if (p.state === 'dead' && koType !== 'crumple' && koType !== 'faceplant') { head.y = -20; head.x = 40; neck.y = -15; pelvis.y = -5; handL.y = 15; handL.x = -65; elbowL.y = 5; handR.y = 15; handR.x = 65; elbowR.y = 5; kneeL.y = 10; kneeR.y = 10; footL.y = 15; footR.y = 15; }
    }

    return { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR };
};

// ==========================================
// 🌟 UNREAL RENDERING ENGINE
// ==========================================
window.drawStickman = function(ctx, p, isTrail = false) {
    if(!p || isNaN(p.x) || isNaN(p.y)) return; ctx.save(); ctx.translate(p.x, p.y); 
    if (p.rotation) { ctx.translate(0, -60); ctx.rotate(p.rotation); ctx.translate(0, 60); }
    
    let pts = window.drawBaseLimbFPS(p); 
    let { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR } = pts;

    let bType = p.bodyType || 'muscular'; let pType = p.pantsType || 'boxing'; let aura = p.auraType || 'none'; 
    let wArm = bType === 'heavy' ? 20 : (bType === 'lean' ? 12 : 16);
    let wLeg = bType === 'heavy' ? 22 : (bType === 'lean' ? 14 : 18);
    let torsoW = bType === 'heavy' ? 32 : (bType === 'lean' ? 18 : 24);

    let sColor = p.skinColor || "#f1c27d", jColor = p.jerseyColor || p.color || "#0984e3"; 
    let pColor = p.pantsColor || "#1e272e", sockC = p.socksColor || "#fff", shoeC = p.shoesColor || "#f1c40f";

    let hpRatio = (p.hp !== undefined && p.maxHp) ? Math.max(0, p.hp / p.maxHp) : 1;
    let sweatFactor = Math.max(0, 1 - hpRatio * 1.5); // Càng ít máu da càng bóng láng mồ hôi

    // 1. AURA VÀ BÓNG DƯỚI CHÂN
    if (aura !== 'none' && !isTrail && p.hp > 0) {
        let aColor = aura === 'fire' ? "#ff4757" : (aura === 'god' ? "#f1c40f" : "#00f3ff");
        let aSize = Math.sin(Date.now() / 100) * 10 + 60;
        ctx.shadowBlur = 50; ctx.shadowColor = aColor; ctx.fillStyle = aColor; ctx.globalAlpha = hpRatio < 0.3 ? 0.9 : 0.4;
        ctx.beginPath(); ctx.ellipse(0, -60, aSize, aSize * 1.5, 0, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
    }
    if (!isTrail && p.hp > 0 && p.state !== 'ko_falling') { ctx.fillStyle = "rgba(0, 0, 0, 0.85)"; ctx.beginPath(); ctx.ellipse(0, 5, 55, 12, 0, 0, Math.PI*2); ctx.fill(); }

    // 🌟 2. HÀM RENDER DA THỊT ĐẪM MỒ HÔI (GLOSS SHADER)
    const draw3DLimb = (start, end, width, color, isSkin = false) => {
        let dx = end.x - start.x; let dy = end.y - start.y; let len = Math.sqrt(dx*dx + dy*dy); let angle = Math.atan2(dy, dx);
        ctx.save(); ctx.translate(start.x, start.y); ctx.rotate(angle);
        
        let grad = ctx.createLinearGradient(0, -width/2, 0, width/2);
        grad.addColorStop(0, "rgba(5,5,5,0.85)"); // Đổ bóng sâu
        grad.addColorStop(0.2, color);
        // Điểm lóa sáng mồ hôi 3D
        if (isSkin && sweatFactor > 0) { grad.addColorStop(0.5, `rgba(255,255,255,${0.3 * sweatFactor})`); }
        grad.addColorStop(0.8, color);
        grad.addColorStop(1, "rgba(5,5,5,0.9)"); 

        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.lineWidth = width + 5; ctx.strokeStyle = "#000"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
        ctx.lineWidth = width; ctx.strokeStyle = grad; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();

        if (isSkin && hpRatio <= 0.6) {
            ctx.lineWidth = width * 0.4; ctx.strokeStyle = "rgba(75, 0, 130, 0.35)"; ctx.beginPath(); ctx.moveTo(len * 0.3, -width/4); ctx.lineTo(len * 0.6, 0); ctx.stroke();
            if (hpRatio <= 0.3) { ctx.lineWidth = 2; ctx.strokeStyle = "rgba(220, 0, 0, 0.9)"; ctx.beginPath(); ctx.moveTo(len * 0.4, width/4); ctx.lineTo(len * 0.7, -width/5); ctx.stroke(); ctx.fillStyle = "rgba(220, 0, 0, 0.9)"; ctx.beginPath(); ctx.arc(len * 0.55, width/2 + 2, 2, 0, Math.PI*2); ctx.fill(); }
        }
        
        // Cạnh ven sáng Rim-light siêu thực
        ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${0.2 + sweatFactor*0.3})`; ctx.beginPath(); ctx.moveTo(0, -width/2.5); ctx.lineTo(len, -width/2.5); ctx.stroke();
        ctx.restore();
    };

    let isLongPants = pType === 'long';
    draw3DLimb(pelvis, kneeL, wLeg, isLongPants ? pColor : sColor, !isLongPants); draw3DLimb(kneeL, footL, wLeg - 2, isLongPants ? pColor : sockC, false); 
    draw3DLimb(pelvis, kneeR, wLeg, isLongPants ? pColor : sColor, !isLongPants); draw3DLimb(kneeR, footR, wLeg - 2, isLongPants ? pColor : sockC, false); 
    draw3DLimb(shoulderL, elbowL, wArm, sColor, true); draw3DLimb(elbowL, handL, wArm - 2, sColor, true);
    draw3DLimb(shoulderR, elbowR, wArm, sColor, true); draw3DLimb(elbowR, handR, wArm - 2, sColor, true);

    if (!isLongPants) {
        ctx.fillStyle = pColor; ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.lineJoin = "round";
        ctx.beginPath(); let shortLen = pType === 'muaythai' ? -10 : -15; let flare = pType === 'muaythai' ? 18 : 12;
        ctx.moveTo(pelvis.x - 24, pelvis.y - 8); ctx.lineTo(pelvis.x + 24, pelvis.y - 8); ctx.lineTo(kneeR.x + flare, kneeR.y + shortLen); ctx.lineTo(pelvis.x, pelvis.y + 18); ctx.lineTo(kneeL.x - flare, kneeL.y + shortLen); ctx.closePath(); ctx.fill(); ctx.stroke();
        if (hpRatio <= 0.45) { ctx.fillStyle = sColor; ctx.beginPath(); ctx.moveTo(pelvis.x + 12, pelvis.y - 2); ctx.lineTo(pelvis.x + 22, pelvis.y + 10); ctx.lineTo(pelvis.x + 8, pelvis.y + 5); ctx.fill(); }
    }

    ctx.lineWidth = 4; ctx.fillStyle = p.hasChampBelt ? "#f1c40f" : "#111"; ctx.beginPath(); ctx.roundRect(pelvis.x - 25, pelvis.y - 8, 50, 10, 4); ctx.fill(); ctx.stroke();

    // 🌟 3. VẼ THÂN TRÊN VÀ ĐỔ BÓNG NỘI THỂ (AMBIENT OCCLUSION)
    let chestGrad = ctx.createLinearGradient(shoulderL.x, 0, shoulderR.x, 0);
    let tColor = p.isShirtless ? sColor : jColor;
    chestGrad.addColorStop(0, "rgba(5,5,5,0.7)"); chestGrad.addColorStop(0.2, tColor); 
    if(p.isShirtless && sweatFactor > 0) chestGrad.addColorStop(0.5, `rgba(255,255,255,${0.2 * sweatFactor})`); // Lóa mồ hôi ngực
    chestGrad.addColorStop(0.8, tColor); chestGrad.addColorStop(1, "rgba(5,5,5,0.7)");
    
    ctx.fillStyle = chestGrad; ctx.lineWidth = 5; ctx.strokeStyle = "#000";
    ctx.beginPath(); ctx.moveTo(shoulderL.x - 8, shoulderL.y - 5); ctx.quadraticCurveTo(0, neck.y + 15, shoulderR.x + 8, shoulderR.y - 5); ctx.lineTo(pelvis.x + torsoW, pelvis.y - 8); ctx.lineTo(pelvis.x - torsoW, pelvis.y - 8); ctx.closePath(); ctx.fill(); ctx.stroke();

    // Bóng râm dưới cổ hắt xuống ngực
    let occlGrad = ctx.createRadialGradient(0, neck.y + 15, 0, 0, neck.y + 15, 30);
    occlGrad.addColorStop(0, "rgba(0,0,0,0.5)"); occlGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = occlGrad; ctx.beginPath(); ctx.arc(0, neck.y + 15, 30, 0, Math.PI*2); ctx.fill();

    // 🌟 4. HD ABS & PECTORALS (CƠ NGỰC VÀ BỤNG DẬP NỔI 3D)
    if (p.isShirtless && (bType === 'muscular' || bType === 'lean')) {
        let absOpacity = 0.4 + sweatFactor * 0.3; // Mồ hôi làm sáu múi rõ nét hơn
        
        const drawEmbossLine = (x1, y1, x2, y2, curveY) => {
            // Nét tối tạo độ sâu
            ctx.lineWidth = 3; ctx.strokeStyle = `rgba(0,0,0,${absOpacity})`;
            ctx.beginPath(); ctx.moveTo(x1, y1); if(curveY) ctx.quadraticCurveTo((x1+x2)/2, curveY, x2, y2); else ctx.lineTo(x2, y2); ctx.stroke();
            // Nét sáng tạo độ lồi
            ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${absOpacity*0.6})`;
            ctx.beginPath(); ctx.moveTo(x1, y1+2); if(curveY) ctx.quadraticCurveTo((x1+x2)/2, curveY+2, x2, y2+2); else ctx.lineTo(x2, y2+2); ctx.stroke();
        };

        // Cơ ngực (Pectorals)
        drawEmbossLine(0, shoulderL.y + 20, shoulderL.x + 15, shoulderL.y + 12, shoulderL.y + 25);
        drawEmbossLine(0, shoulderR.y + 20, shoulderR.x - 15, shoulderR.y + 12, shoulderR.y + 25);
        
        // Rãnh bụng giữa
        drawEmbossLine(0, shoulderL.y + 20, 0, pelvis.y - 10);
        
        // Sáu múi
        for(let a=0; a<3; a++) {
            let abY = shoulderL.y + 35 + (a * 15);
            drawEmbossLine(-12, abY, 12, abY, abY + 5);
        }
    }

    if (!p.isShirtless && hpRatio <= 0.5) {
        ctx.fillStyle = sColor; ctx.beginPath(); ctx.moveTo(shoulderL.x + 5, shoulderL.y + 10); ctx.lineTo(shoulderL.x + 18, shoulderL.y + 35); ctx.lineTo(shoulderL.x - 2, shoulderL.y + 25); ctx.fill();
        if (hpRatio <= 0.25) { ctx.beginPath(); ctx.moveTo(pelvis.x - 5, pelvis.y - 10); ctx.lineTo(pelvis.x + 15, pelvis.y - 35); ctx.lineTo(pelvis.x + 20, pelvis.y - 15); ctx.fill(); }
    }

    const drawShoe = (footPt, angleMod) => { ctx.save(); ctx.translate(footPt.x, footPt.y); ctx.rotate(angleMod); ctx.fillStyle = "#ecf0f1"; ctx.lineWidth = 3; ctx.strokeStyle = "#000"; ctx.beginPath(); ctx.roundRect(-16, 2, 32, 12, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = shoeC; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.quadraticCurveTo(0, -12, 16, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); };
    drawShoe(footL, -0.1); drawShoe(footR, 0.1);

    let faceSize = bType === 'heavy' ? 95 : 85; 
    ctx.shadowBlur = 20; ctx.shadowColor = jColor; ctx.fillStyle = jColor; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2 + 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); ctx.drawImage(window.enemyFaceImg, head.x - faceSize/2, head.y - faceSize/2, faceSize, faceSize); ctx.restore();
        ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.stroke();
        
        if (hpRatio <= 0.5) {
            ctx.fillStyle = "rgba(75, 0, 130, 0.55)"; ctx.beginPath(); ctx.ellipse(head.x + 12, head.y - 8, 14, 10, 0.2, 0, Math.PI*2); ctx.fill();
            if (hpRatio <= 0.3) { 
                ctx.strokeStyle = "rgba(220, 0, 0, 0.9)"; ctx.lineWidth = 4; ctx.lineCap = "round"; 
                ctx.beginPath(); ctx.moveTo(head.x - 5, head.y + 15); ctx.quadraticCurveTo(head.x - 12, head.y + 25, head.x - 8, head.y + 35); ctx.stroke(); 
                
                // 🌟 5. MÁU NHỎ GIỌT ĐỘNG TỪ MIỆNG (PHYSICS)
                if(!window.bloodDrops) window.bloodDrops = [];
                if(Math.random() < 0.05 && p.state !== 'ko_falling' && p.state !== 'dead') {
                    window.bloodDrops.push({ x: head.x - 8, y: head.y + 38, vy: 0 });
                }
            }
        }

        if (p.glowingEyes) {
            ctx.globalCompositeOperation = 'lighter'; // Phát sáng chói
            ctx.shadowBlur = 20; ctx.shadowColor = p.glowingEyes; ctx.fillStyle = p.glowingEyes;
            ctx.beginPath(); ctx.ellipse(head.x - 12, head.y - 5, 8, 3, Math.PI/8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(head.x + 12, head.y - 5, 8, 3, -Math.PI/8, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
        }
    } else { ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }

    // RENDER MÁU RƠI
    if(window.bloodDrops) {
        ctx.fillStyle = "rgba(220, 0, 0, 0.9)";
        for (let i = window.bloodDrops.length - 1; i >= 0; i--) {
            let bd = window.bloodDrops[i];
            bd.vy += 0.5; bd.y += bd.vy;
            ctx.beginPath(); ctx.arc(bd.x, bd.y, 2.5, 0, Math.PI*2); ctx.fill();
            if (bd.y > pelvis.y + 50) window.bloodDrops.splice(i, 1);
        }
    }

    // 🌟 6. HIỆU ỨNG KHÓI THỞ DỐC (BREATHING FROST) KHI KIỆT SỨC
    if (hpRatio <= 0.40 && p.state !== 'ko_falling' && p.state !== 'dead') {
        if(!window.breathMist) window.breathMist = [];
        
        // Phả khói theo nhịp thở (khi đầu cúi xuống thấp nhất)
        let bouncePhase = Math.sin(Date.now() / (hpRatio < 0.2 ? 250 : 120));
        if (bouncePhase > 0.8 && Math.random() < 0.4) {
            window.breathMist.push({
                x: head.x + (Math.random()*10 - 5), y: head.y + 20,
                vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random() * 2,
                life: 30, maxLife: 30, size: 5 + Math.random() * 8
            });
        }
    }
    
    // Render khói thở
    if(window.breathMist) {
        for (let i = window.breathMist.length - 1; i >= 0; i--) {
            let bm = window.breathMist[i];
            bm.x += bm.vx; bm.y += bm.vy; bm.size += 0.5; bm.life--;
            ctx.fillStyle = `rgba(255, 255, 255, ${ (bm.life / bm.maxLife) * 0.4 })`;
            ctx.beginPath(); ctx.arc(bm.x, bm.y, bm.size, 0, Math.PI*2); ctx.fill();
            if(bm.life <= 0) window.breathMist.splice(i, 1);
        }
    }

    const drawRealImageGlove = (handPt, isRight) => { ctx.save(); ctx.translate(handPt.x, handPt.y); ctx.scale(handPt.z, handPt.z); ctx.shadowBlur = 25; ctx.shadowColor = "rgba(0,0,0,0.8)"; if (window.enemyGloveImg && window.enemyGloveImg.complete && window.enemyGloveImg.naturalWidth > 0) { let gSize = bType === 'heavy' ? 75 : 65; if (isRight) ctx.scale(-1, 1); ctx.drawImage(window.enemyGloveImg, -gSize/2, -gSize/2, gSize, gSize); } else { ctx.fillStyle = jColor; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill(); } ctx.restore(); };
    if (!isTrail) { drawRealImageGlove(handL, false); drawRealImageGlove(handR, true); } ctx.restore();
};

window.assignDrawMethods = function(statsObj) { };
