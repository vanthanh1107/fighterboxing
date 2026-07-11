// ==========================================
// GRAPHICS_V3.JS - NEXT-GEN ANATOMY EDITION (V43.0)
// [ĐỈNH CAO: TƯ THẾ BOXING CHUYÊN NGHIỆP, CƠ BẮP 3D TỰ NHIÊN, NẾP GẤP QUẦN ÁO, RIM LIGHT]
// ==========================================

window.drawBoxingRing = function(ctx, canvasWidth, canvasHeight) {
    let cmap = window.currentMap || {};
    let cAudience = cmap.audience || "#030406", cMat = cmap.mat || "#0a0d14", cSpotlight = cmap.spotlight || "rgba(0, 243, 255, 0.12)", cRopes = cmap.ropes || ["#ff4757", "#ffffff", "#ff4757"], cLogo = cmap.logo || "PRO-LEAGUE";
    let vanishY = (window.GROUND_Y || 320) - 80; 

    // Nền khán giả tối tăm
    ctx.fillStyle = cAudience; ctx.fillRect(-canvasWidth, -canvasHeight, canvasWidth * 3, canvasHeight * 3);
    
    // Dàn đèn Spotlight rọi thẳng xuống sàn
    let spotLight = ctx.createRadialGradient(canvasWidth/2, 20, 0, canvasWidth/2, canvasHeight - 50, 700);
    spotLight.addColorStop(0, cSpotlight); spotLight.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spotLight; ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save(); let time = Date.now() / 250; 
    // Khán giả nhấp nhô
    for (let row = 4; row >= 0; row--) {
        let rowY = vanishY - 5 - (row * 28); let numPeople = 45 + row * 10; let rowScale = 1 - (row * 0.12); 
        for (let i = 0; i < numPeople; i++) {
            let x = -300 + (i * ((canvasWidth + 600) / numPeople)) + Math.sin(i * 123.45) * 20;
            let finalY = rowY + Math.sin(time + x * 0.02) * 5 * rowScale;
            ctx.fillStyle = (i % 5 === 0) ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.55)";
            ctx.beginPath(); ctx.arc(x, finalY, 9 * rowScale, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x, finalY + 20 * rowScale, 15 * rowScale, Math.PI, 0); ctx.fill();
            
            // Tay khán giả giơ lên
            if (Math.sin(time * 1.5 + i) > 0.7) {
                ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2.5 * rowScale; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(x - 12 * rowScale, finalY + 12 * rowScale); ctx.lineTo(x - 18 * rowScale, finalY - 8 * rowScale); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x + 12 * rowScale, finalY + 12 * rowScale); ctx.lineTo(x + 18 * rowScale, finalY - 8 * rowScale); ctx.stroke();
            }
        }
    }
    ctx.restore();

    // Flash máy ảnh của phóng viên
    ctx.save();
    for (let i = 0; i < 40; i++) {
        let flashAlpha = Math.random() > 0.97 ? Math.random() : 0.01;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.beginPath(); ctx.arc(Math.random() * canvasWidth, Math.random() * (vanishY), Math.random() * 4 + 1, 0, Math.PI * 2); ctx.fill();
        // Tia lóe sáng chéo
        if(flashAlpha > 0.5) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha*0.5})`; ctx.lineWidth = 1;
            let fx = Math.random() * canvasWidth, fy = Math.random() * vanishY;
            ctx.beginPath(); ctx.moveTo(fx-10, fy-10); ctx.lineTo(fx+10, fy+10); ctx.moveTo(fx-10, fy+10); ctx.lineTo(fx+10, fy-10); ctx.stroke();
        }
    }
    ctx.restore();

    // 🌟 SÀN VÕ ĐÀI SIÊU BÓNG KÍNH (ULTRA GLOSSY MAT)
    let matGrad = ctx.createLinearGradient(0, vanishY, 0, canvasHeight);
    matGrad.addColorStop(0, cMat); 
    matGrad.addColorStop(0.5, "#151e2b"); 
    matGrad.addColorStop(1, "#05080c"); 
    ctx.fillStyle = matGrad; 
    ctx.beginPath(); ctx.moveTo(-200, canvasHeight); ctx.lineTo(canvasWidth + 200, canvasHeight); ctx.lineTo(canvasWidth - 150, vanishY); ctx.lineTo(150, vanishY); ctx.fill();
    
    // Viền phát sáng ranh giới sàn điện tử
    ctx.strokeStyle = cSpotlight; ctx.lineWidth = 3; ctx.stroke();

    // Logo Giải Đấu
    ctx.save(); ctx.translate(canvasWidth/2, (window.GROUND_Y || 320) + 30); ctx.scale(1, 0.35); ctx.globalAlpha = 0.1;
    ctx.font = "900 130px Impact"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.fillText(cLogo, 0, 0); 
    ctx.lineWidth = 4; ctx.strokeText(cLogo, 0, 0);
    ctx.restore();

    // Cọc đài và Dây thừng
    ctx.lineWidth = 4; ctx.fillStyle = "#111"; ctx.fillRect(140, vanishY - 120, 25, 120); ctx.fillRect(canvasWidth - 165, vanishY - 120, 25, 120);
    let metalGrad = ctx.createLinearGradient(140, 0, 165, 0); metalGrad.addColorStop(0,"#222"); metalGrad.addColorStop(0.5,"#888"); metalGrad.addColorStop(1,"#111");
    ctx.fillStyle = metalGrad; ctx.fillRect(140, vanishY - 120, 25, 120); ctx.fillRect(canvasWidth - 165, vanishY - 120, 25, 120);
    
    for (let i = 0; i < 3; i++) {
        let yF = vanishY - 30 - (i * 30), yN = canvasHeight - 50 - (i * 100); ctx.strokeStyle = cRopes[i] || "#fff"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(-100, yN); ctx.lineTo(150, yF); ctx.stroke(); ctx.beginPath(); ctx.moveTo(canvasWidth + 100, yN); ctx.lineTo(canvasWidth - 150, yF); ctx.stroke(); ctx.beginPath(); ctx.moveTo(150, yF); ctx.lineTo(canvasWidth - 150, yF); ctx.stroke();
    }
};

// 🌟 V43: TƯ THẾ BOXING CHUYÊN NGHIỆP (PRO STANCE RIGGING)
window.drawBaseLimbFPS = function(p) {
    let hpRatio = (p.hp !== undefined && p.maxHp) ? Math.max(0, p.hp / p.maxHp) : 1;
    let isExhausted = hpRatio < 0.40; 
    
    // Nhịp thở và Lắc lư hông (Bob and Weave)
    let bounceSpeed = isExhausted ? 250 : 100; 
    let bounceMag = isExhausted ? 10 : (p.state === 'walk' || p.state === 'dash' ? 8 : 4);
    let bounceY = Math.sin(Date.now() / bounceSpeed) * bounceMag; 
    let weaveX = Math.cos(Date.now() / (bounceSpeed * 1.5)) * (bounceMag * 0.8); // Lách qua lại
    
    let exhaustLean = (isExhausted && p.state === 'idle') ? 18 : 0; 
    
    let bType = p.bodyType || 'muscular';
    let sW = bType === 'heavy' ? 48 : (bType === 'lean' ? 34 : 40); 
    let hY = bType === 'heavy' ? -150 : -145; 
    
    // 🌟 CHỈNH DÁNG (RIGGING): Rụt cổ, che cằm, hạ trọng tâm
    let head = { x: weaveX*1.2, y: hY + bounceY + exhaustLean + 10, z: 1 }; // Cúi đầu xuống
    let neck = { x: weaveX, y: -105 + bounceY + exhaustLean*0.5, z: 1 }; 
    let pelvis = { x: weaveX*0.5, y: -15 + bounceY, z: 1 }; // Chùng gối
    
    let shoulderL = { x: -sW + weaveX, y: -100 + bounceY + exhaustLean*0.8 }; 
    let shoulderR = { x: sW + weaveX, y: -100 + bounceY + exhaustLean*0.8 };
    
    // Chân dạng rộng, gối chùng (Combat Stance)
    let footL = { x: -55, y: 0, z: 1 }; let kneeL = { x: -60 + weaveX*0.2, y: -20 + bounceY, z: 1 }; 
    let footR = { x: 45, y: 0, z: 1 }; let kneeR = { x: 55 + weaveX*0.2, y: -15 + bounceY, z: 1 };
    
    // 🌟 HIGH GUARD: Tay giơ cao che mặt hờm sẵn
    let handL = { x: -30 + weaveX*1.5, y: hY + 30 + bounceY + exhaustLean, z: 1.1 }; 
    let elbowL = { x: -50 + weaveX, y: -65 + bounceY, z: 1 }; 
    let handR = { x: 30 + weaveX*1.5, y: hY + 30 + bounceY + exhaustLean, z: 0.9 }; 
    let elbowR = { x: 50 + weaveX, y: -65 + bounceY, z: 1 };

    // Vung tay đánh (Kinematics)
    let progress = (p.attackTimer > 0) ? 1 - (p.attackTimer / (p.maxT || 22)) : 0;
    let ext = progress > 0 ? (progress < 0.4 ? Math.sin((progress / 0.4) * (Math.PI / 2)) : 1 - Math.pow((progress - 0.4) / 0.6, 2)) : 0;

    if (p.state === 'punch' || p.state === 'cross' || p.state === 'jab') { 
        handR.x -= 45 * ext; handR.y += 60 * ext; handR.z = 1 + (ext * 6.5); 
        elbowR.x -= 20 * ext; elbowR.y += 20 * ext;
        shoulderR.x += 20 * ext; head.x = -20 * ext; head.y -= exhaustLean; pelvis.x += 10*ext;
    } 
    else if (p.state === 'hook' || p.state === 'uppercut') { 
        handL.x += 75 * ext; handL.y -= 40 * ext; handL.z = 1 + (ext * 5.0); 
        elbowL.x += 30 * ext; elbowL.y -= 10 * ext;
        shoulderL.x -= 20 * ext; head.x = 30 * ext; head.y -= exhaustLean; pelvis.x -= 10*ext;
    }
    else if (p.state === 'hurt') { 
        head.y -= 25; head.x = (Math.random() - 0.5) * 30; 
        handL.y = -40; handL.x = -75; elbowL.y = -50;
        handR.y = -40; handR.x = 75; elbowR.y = -50;
        pelvis.x = (Math.random() - 0.5) * 15;
    }
    else if (p.state === 'ko_falling' || p.state === 'dead') { 
        let koType = p.koType || 'knockback';
        if (koType === 'uppercut') { head.y -= 40; head.x = 20; pelvis.y -= 10; handL.y = -40; handL.x = -55; elbowL.y = -70; elbowL.x = -45; handR.y = -40; handR.x = 55; elbowR.y = -70; elbowR.x = 45; kneeL.y = 15; kneeL.x = -40; kneeR.y = 15; kneeR.x = 40; footL.y = 35; footR.y = 35; } 
        else if (koType === 'knockback') { head.y = -10; head.x = 50; neck.x = 25; pelvis.x = -15; handL.y = -90; handL.x = 60; elbowL.y = -80; elbowL.x = 15; handR.y = -90; handR.x = 90; elbowR.y = -80; elbowR.x = 45; kneeL.x = -45; kneeL.y = 0; kneeR.x = -65; kneeR.y = -10; }
        else if (koType === 'crumple') { let drop = p.state === 'dead' ? 70 : 40; head.y = hY + drop + 25; head.x = 40; neck.y = -100 + drop; pelvis.y = -20 + drop; shoulderL.y = -100 + drop; shoulderR.y = -100 + drop; kneeL.x = -30; kneeL.y = drop + 15; footL.x = -50; footL.y = drop + 15; kneeR.x = 30; kneeR.y = drop + 15; footR.x = 50; footR.y = drop + 15; handL.y = drop+10; handL.x = -35; handR.y = drop+10; handR.x = 35; }
        else if (koType === 'spin') { head.y = hY + 25; head.x = 20; handL.y = -60; handL.x = -25; handR.y = -60; handR.x = 25; kneeL.y = -35; kneeR.y = -35; }
        else if (koType === 'faceplant') { let drop = p.state === 'dead' ? 130 : 70; head.y = hY + drop + 45; head.x = 0; neck.y = -100 + drop; pelvis.y = -20 + drop; handL.y = drop - 25; handL.x = -35; handR.y = drop - 25; handR.x = 35; kneeL.y = drop - 25; kneeR.y = drop - 25; if(p.state === 'dead') { head.y = 25; head.x = 25; } }
        else if (koType === 'backflip') { head.y = hY + 35; head.x = -20; neck.y = -85; pelvis.y = 5; handL.y = -130; handL.x = -45; handR.y = -130; handR.x = 45; kneeL.y = -25; kneeR.y = -25; }
        if (p.state === 'dead' && koType !== 'crumple' && koType !== 'faceplant') { head.y = -20; head.x = 45; neck.y = -15; pelvis.y = -5; handL.y = 20; handL.x = -70; elbowL.y = 10; handR.y = 20; handR.x = 70; elbowR.y = 10; kneeL.y = 15; kneeR.y = 15; footL.y = 20; footR.y = 20; }
    }

    return { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR };
};

// ==========================================
// 🌟 V43: UNREAL RENDERING ENGINE (ANATOMY & LIGHTING)
// ==========================================
window.drawStickman = function(ctx, p, isTrail = false) {
    if(!p || isNaN(p.x) || isNaN(p.y)) return; ctx.save(); ctx.translate(p.x, p.y); 
    if (p.rotation) { ctx.translate(0, -60); ctx.rotate(p.rotation); ctx.translate(0, 60); }
    
    let pts = window.drawBaseLimbFPS(p); 
    let { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR } = pts;

    let bType = p.bodyType || 'muscular'; let pType = p.pantsType || 'boxing'; let aura = p.auraType || 'none'; 
    let wArm = bType === 'heavy' ? 24 : (bType === 'lean' ? 14 : 18); 
    let wLeg = bType === 'heavy' ? 26 : (bType === 'lean' ? 16 : 20); 
    let torsoW = bType === 'heavy' ? 36 : (bType === 'lean' ? 22 : 28);
    
    let sColor = p.skinColor || "#f1c27d", jColor = p.jerseyColor || p.color || "#0984e3"; 
    let pColor = p.pantsColor || "#1e272e", sockC = p.socksColor || "#fff", shoeC = p.shoesColor || "#f1c40f";

    let hpRatio = (p.hp !== undefined && p.maxHp) ? Math.max(0, p.hp / p.maxHp) : 1;
    let sweatFactor = Math.max(0, 1 - hpRatio * 1.5); 

    // 1. BÓNG ĐỔ VÀ HÀO QUANG
    if (!isTrail && p.hp > 0 && p.state !== 'ko_falling') { 
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)"; ctx.beginPath(); ctx.ellipse(pelvis.x, 5, 55, 12, 0, 0, Math.PI*2); ctx.fill(); 
        let refGrad = ctx.createRadialGradient(pelvis.x, 15, 0, pelvis.x, 15, 60);
        refGrad.addColorStop(0, `rgba(${window.hexToRgb?window.hexToRgb(jColor):'255,255,255'}, 0.4)`);
        refGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = refGrad; ctx.beginPath(); ctx.ellipse(pelvis.x, 15, 60, 20, 0, 0, Math.PI*2); ctx.fill();
    }

    if (aura !== 'none' && !isTrail && p.hp > 0) {
        let aColor = aura === 'fire' ? "#ff4757" : (aura === 'god' ? "#f1c40f" : "#00f3ff");
        ctx.save(); ctx.globalCompositeOperation = "screen"; 
        let t = Date.now() / 150;
        for (let i = 0; i < 12; i++) {
            let pX = pelvis.x + Math.sin(t + i * 2) * 50; 
            let pY = pelvis.y - 10 - ((t * 20 + i * 15) % 120); 
            let pSize = Math.max(2, 25 - Math.abs(pY) * 0.15); 
            let flameGrad = ctx.createRadialGradient(pX, pY, 0, pX, pY, pSize);
            flameGrad.addColorStop(0, "#fff"); flameGrad.addColorStop(0.3, aColor); flameGrad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = flameGrad; ctx.beginPath();
            ctx.moveTo(pX, pY - pSize*1.5); ctx.quadraticCurveTo(pX + pSize, pY, pX, pY + pSize); ctx.quadraticCurveTo(pX - pSize, pY, pX, pY - pSize*1.5); ctx.fill();
        }
        ctx.restore();
    }

    // 🌟 2. HÀM VẼ CƠ BẮP 3D SIÊU THỰC (VOLUMETRIC LIMBS)
    const draw3DMuscleLimb = (start, end, width, color, isSkin = false, isArm = false) => {
        let dx = end.x - start.x; let dy = end.y - start.y; let len = Math.sqrt(dx*dx + dy*dy); let angle = Math.atan2(dy, dx);
        ctx.save(); ctx.translate(start.x, start.y); ctx.rotate(angle);
        
        // Cấu trúc trụ 3D (Cylinder shading)
        let grad = ctx.createLinearGradient(0, -width/2, 0, width/2);
        grad.addColorStop(0, "rgba(5,5,5,0.9)"); // Bóng lõm (Core shadow)
        grad.addColorStop(0.2, color); // Màu gốc
        if (isSkin && sweatFactor > 0) { grad.addColorStop(0.4, `rgba(255,255,255,${0.35 * sweatFactor})`); } // Điểm lóa mồ hôi 3D
        grad.addColorStop(0.8, color); 
        grad.addColorStop(1, "rgba(10,10,10,0.85)"); // Bóng mờ viền dưới
        
        // Vẽ phần chi dưới dạng đường thẳng với viền mềm
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.lineWidth = width + 6; ctx.strokeStyle = "#000"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
        ctx.lineWidth = width; ctx.strokeStyle = grad; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();

        // 🌟 BICEP/CALF BULGE (Đánh khối cơ bắp nhô lên)
        if (isSkin && bType !== 'lean') {
            ctx.fillStyle = `rgba(0,0,0,0.15)`; // Rãnh cơ
            ctx.beginPath();
            ctx.ellipse(len*0.4, 0, len*0.25, width*0.35, 0, 0, Math.PI*2);
            ctx.fill();
        }

        // Gân xanh khi nổi điên
        if (isSkin && hpRatio <= 0.5 && bType === 'muscular') {
            ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(0, 100, 50, 0.4)";
            ctx.beginPath(); ctx.moveTo(len*0.2, width/4); ctx.quadraticCurveTo(len*0.5, width/2, len*0.8, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(len*0.4, -width/4); ctx.quadraticCurveTo(len*0.6, 0, len*0.9, -width/5); ctx.stroke();
        }

        // Vết bầm / Xước máu
        if (isSkin && hpRatio <= 0.6) {
            ctx.lineWidth = width * 0.4; ctx.strokeStyle = "rgba(75, 0, 130, 0.35)"; ctx.beginPath(); ctx.moveTo(len * 0.3, -width/4); ctx.lineTo(len * 0.6, 0); ctx.stroke();
            if (hpRatio <= 0.3) { ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(200, 0, 0, 0.9)"; ctx.beginPath(); ctx.moveTo(len * 0.4, width/4); ctx.lineTo(len * 0.7, -width/5); ctx.stroke(); ctx.fillStyle = "rgba(200, 0, 0, 0.9)"; ctx.beginPath(); ctx.arc(len * 0.55, width/2 + 2, 2.5, 0, Math.PI*2); ctx.fill(); }
        }
        
        // 🌟 DYNAMIC SPOTLIGHT RIM-LIGHTING (Đánh sáng ven)
        ctx.lineWidth = 2; 
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + sweatFactor*0.4})`; // Sáng gắt hơn nếu đẫm mồ hôi
        ctx.beginPath(); 
        // Tia sáng chiếu từ trên xuống, nên vẽ viền sáng ở mép trên của tay/chân
        ctx.moveTo(0, -width/2.2); ctx.lineTo(len*0.9, -width/2.2); 
        ctx.stroke();

        ctx.restore();
    };

    let isLongPants = pType === 'long';
    // Đùi và Cẳng chân
    draw3DMuscleLimb(pelvis, kneeL, wLeg, isLongPants ? pColor : sColor, !isLongPants); draw3DMuscleLimb(kneeL, footL, wLeg - 3, isLongPants ? pColor : sockC, false); 
    draw3DMuscleLimb(pelvis, kneeR, wLeg, isLongPants ? pColor : sColor, !isLongPants); draw3DMuscleLimb(kneeR, footR, wLeg - 3, isLongPants ? pColor : sockC, false); 
    // Bắp tay và Cẳng tay
    draw3DMuscleLimb(shoulderL, elbowL, wArm, sColor, true, true); draw3DMuscleLimb(elbowL, handL, wArm - 2, sColor, true, true);
    draw3DMuscleLimb(shoulderR, elbowR, wArm, sColor, true, true); draw3DMuscleLimb(elbowR, handR, wArm - 2, sColor, true, true);

    // 🌟 3. VẼ QUẦN ĐÙI CÓ NẾP GẤP VẢI (FABRIC WRINKLES)
    if (!isLongPants) {
        ctx.fillStyle = pColor; ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.lineJoin = "round";
        ctx.beginPath(); let shortLen = pType === 'muaythai' ? -15 : -25; let flare = pType === 'muaythai' ? 20 : 15;
        ctx.moveTo(pelvis.x - 26, pelvis.y - 8); ctx.lineTo(pelvis.x + 26, pelvis.y - 8); 
        ctx.lineTo(kneeR.x + flare, kneeR.y + shortLen); ctx.lineTo(pelvis.x, pelvis.y + 20); ctx.lineTo(kneeL.x - flare, kneeL.y + shortLen); 
        ctx.closePath(); ctx.fill(); ctx.stroke();
        
        // Vẽ nếp gấp vải ở háng
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath(); ctx.moveTo(pelvis.x, pelvis.y + 10); ctx.lineTo(pelvis.x - 15, pelvis.y - 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pelvis.x, pelvis.y + 10); ctx.lineTo(pelvis.x + 15, pelvis.y - 5); ctx.stroke();

        // Battle Damage Rách quần
        if (hpRatio <= 0.45) { ctx.fillStyle = sColor; ctx.beginPath(); ctx.moveTo(pelvis.x + 12, pelvis.y - 2); ctx.lineTo(pelvis.x + 24, pelvis.y + 12); ctx.lineTo(pelvis.x + 8, pelvis.y + 5); ctx.fill(); }
    }

    // Đai lưng Vô địch (Chạm khắc 3D)
    if (p.hasChampBelt) {
        ctx.lineWidth = 4; ctx.fillStyle = "#f1c40f"; ctx.strokeStyle = "#000";
        ctx.beginPath(); ctx.roundRect(pelvis.x - 28, pelvis.y - 12, 56, 14, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(pelvis.x, pelvis.y - 5, 8, 0, Math.PI*2); ctx.fill(); // Huy hiệu giữa
    } else {
        ctx.lineWidth = 4; ctx.fillStyle = "#111"; ctx.beginPath(); ctx.roundRect(pelvis.x - 26, pelvis.y - 10, 52, 10, 4); ctx.fill(); ctx.stroke();
    }

    // 🌟 4. THÂN TRÊN (TORSO) VÀ CƠ NGỰC DẬP NỔI CAO CẤP
    let chestGrad = ctx.createLinearGradient(shoulderL.x, 0, shoulderR.x, 0);
    let tColor = p.isShirtless ? sColor : jColor;
    chestGrad.addColorStop(0, "rgba(5,5,5,0.85)"); 
    chestGrad.addColorStop(0.2, tColor); 
    if(p.isShirtless && sweatFactor > 0) chestGrad.addColorStop(0.5, `rgba(255,255,255,${0.3 * sweatFactor})`); 
    chestGrad.addColorStop(0.8, tColor); 
    chestGrad.addColorStop(1, "rgba(5,5,5,0.85)");
    
    ctx.fillStyle = chestGrad; ctx.lineWidth = 5; ctx.strokeStyle = "#000";
    ctx.beginPath(); ctx.moveTo(shoulderL.x - 10, shoulderL.y - 5); ctx.quadraticCurveTo(neck.x, neck.y + 15, shoulderR.x + 10, shoulderR.y - 5); 
    ctx.lineTo(pelvis.x + torsoW, pelvis.y - 8); ctx.lineTo(pelvis.x - torsoW, pelvis.y - 8); ctx.closePath(); ctx.fill(); ctx.stroke();

    // Bóng râm cằm đổ xuống cổ
    let occlGrad = ctx.createRadialGradient(neck.x, neck.y + 15, 0, neck.x, neck.y + 15, 35);
    occlGrad.addColorStop(0, "rgba(0,0,0,0.6)"); occlGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = occlGrad; ctx.beginPath(); ctx.arc(neck.x, neck.y + 15, 35, 0, Math.PI*2); ctx.fill();

    if (p.isShirtless && (bType === 'muscular' || bType === 'lean')) {
        let absOpacity = 0.5 + sweatFactor * 0.4; 
        const drawEmbossCurve = (x1, y1, cx, cy, x2, y2) => {
            ctx.lineWidth = 3; ctx.strokeStyle = `rgba(0,0,0,${absOpacity})`;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
            ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(255,255,255,${absOpacity*0.7})`; // Phản quang mồ hôi
            ctx.beginPath(); ctx.moveTo(x1, y1+2); ctx.quadraticCurveTo(cx, cy+2, x2, y2+2); ctx.stroke();
        };

        // Cơ ngực sắc nét (Pectorals)
        let pecY = shoulderL.y + 25;
        drawEmbossCurve(neck.x, pecY + 5, shoulderL.x + 15, pecY, shoulderL.x + 20, pecY - 10); // Ngực trái
        drawEmbossCurve(neck.x, pecY + 5, shoulderR.x - 15, pecY, shoulderR.x - 20, pecY - 10); // Ngực phải
        
        // Rãnh bụng giữa (Linea Alba)
        ctx.lineWidth = 4; ctx.strokeStyle = `rgba(0,0,0,${absOpacity*0.8})`;
        ctx.beginPath(); ctx.moveTo(neck.x, pecY + 5); ctx.lineTo(pelvis.x, pelvis.y - 12); ctx.stroke();
        
        // 6 Múi bụng (Abs)
        let absStartX = pelvis.x - 14; let absEndX = pelvis.x + 14;
        for(let a=0; a<3; a++) { 
            let abY = pecY + 15 + (a * 18); 
            drawEmbossCurve(absStartX, abY, neck.x, abY+8, absEndX, abY); 
        }
    }

    if (!p.isShirtless && hpRatio <= 0.5) {
        ctx.fillStyle = sColor; ctx.beginPath(); ctx.moveTo(shoulderL.x + 5, shoulderL.y + 10); ctx.lineTo(shoulderL.x + 18, shoulderL.y + 35); ctx.lineTo(shoulderL.x - 2, shoulderL.y + 25); ctx.fill();
        if (hpRatio <= 0.25) { ctx.beginPath(); ctx.moveTo(pelvis.x - 5, pelvis.y - 10); ctx.lineTo(pelvis.x + 15, pelvis.y - 35); ctx.lineTo(pelvis.x + 20, pelvis.y - 15); ctx.fill(); }
    }

    // 🌟 GIÀY THỂ THAO CHI TIẾT CAO
    const drawShoe = (footPt, angleMod) => { 
        ctx.save(); ctx.translate(footPt.x, footPt.y); ctx.rotate(angleMod); 
        // Đế giày
        ctx.fillStyle = "#ecf0f1"; ctx.lineWidth = 3; ctx.strokeStyle = "#000"; 
        ctx.beginPath(); ctx.roundRect(-18, 4, 36, 12, 6); ctx.fill(); ctx.stroke(); 
        // Thân giày
        ctx.fillStyle = shoeC; ctx.beginPath(); ctx.moveTo(-14, 6); ctx.quadraticCurveTo(0, -15, 18, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); 
        // Dây giày
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(5, 0); ctx.moveTo(-2, -8); ctx.lineTo(8, -3); ctx.stroke();
        ctx.restore(); 
    };
    drawShoe(footL, -0.15); drawShoe(footR, 0.15);

    // 🌟 KHUÔN MẶT CÚI GẰM (CHIN TUCKED) VÀ BĂNG TRÁN
    let faceSize = bType === 'heavy' ? 98 : 88; 
    ctx.shadowBlur = 15; ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.fillStyle = jColor; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2 + 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); ctx.drawImage(window.enemyFaceImg, head.x - faceSize/2, head.y - faceSize/2, faceSize, faceSize); ctx.restore();
        ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.stroke();
        
        if (p.hasHeadband) {
            ctx.fillStyle = "#e74c3c"; ctx.lineWidth = 2; ctx.strokeStyle = "#000";
            let wind = window.globalWind || Math.sin(Date.now()/500)*2;
            // Đuôi băng trán
            ctx.beginPath(); ctx.moveTo(head.x + faceSize/2 - 10, head.y);
            ctx.quadraticCurveTo(head.x + 85, head.y - 25 + wind*18, head.x + 110 + wind*12, head.y + 20); ctx.lineTo(head.x + 100 + wind*12, head.y + 25);
            ctx.quadraticCurveTo(head.x + 75, head.y - 15 + wind*18, head.x + faceSize/2 - 10, head.y + 10); ctx.fill(); ctx.stroke();
            // Quấn trán
            ctx.beginPath(); ctx.rect(head.x - faceSize/2, head.y - faceSize/3, faceSize, 14); ctx.fill(); ctx.stroke();
        }

        if (hpRatio <= 0.5) {
            ctx.fillStyle = "rgba(75, 0, 130, 0.65)"; ctx.beginPath(); ctx.ellipse(head.x + 14, head.y - 6, 16, 12, 0.2, 0, Math.PI*2); ctx.fill();
            if (hpRatio <= 0.3) { 
                ctx.strokeStyle = "rgba(220, 0, 0, 0.9)"; ctx.lineWidth = 4; ctx.lineCap = "round"; 
                ctx.beginPath(); ctx.moveTo(head.x - 6, head.y + 18); ctx.quadraticCurveTo(head.x - 14, head.y + 28, head.x - 10, head.y + 40); ctx.stroke(); 
                if(!window.bloodDrops) window.bloodDrops = [];
                if(Math.random() < 0.08 && p.state !== 'ko_falling' && p.state !== 'dead') { window.bloodDrops.push({ x: head.x - 10, y: head.y + 42, vy: 0 }); }
            }
        }

        // 🌟 VỆT MẮT MA THUẬT (GLOWING EYE TRAILS)
        if (p.glowingEyes) {
            ctx.globalCompositeOperation = 'lighter'; 
            let trailLength = Math.max(0, Math.abs(p.x - (p.lastX || p.x)) * 2.5); 
            p.lastX = p.x; 
            
            ctx.shadowBlur = 25; ctx.shadowColor = p.glowingEyes; ctx.fillStyle = p.glowingEyes;
            ctx.beginPath(); ctx.ellipse(head.x - 14 - trailLength/2, head.y - 4, 10 + trailLength, 4, Math.PI/8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(head.x + 14 - trailLength/2, head.y - 4, 10 + trailLength, 4, -Math.PI/8, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
        }
    } else { ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }

    if(window.bloodDrops) {
        ctx.fillStyle = "rgba(220, 0, 0, 0.9)";
        for (let i = window.bloodDrops.length - 1; i >= 0; i--) {
            let bd = window.bloodDrops[i]; bd.vy += 0.5; bd.y += bd.vy;
            ctx.beginPath(); ctx.arc(bd.x, bd.y, 3, 0, Math.PI*2); ctx.fill();
            if (bd.y > pelvis.y + 60) window.bloodDrops.splice(i, 1);
        }
    }

    if (hpRatio <= 0.40 && p.state !== 'ko_falling' && p.state !== 'dead') {
        if(!window.breathMist) window.breathMist = [];
        let bouncePhase = Math.sin(Date.now() / (hpRatio < 0.2 ? 250 : 120));
        if (bouncePhase > 0.8 && Math.random() < 0.5) {
            window.breathMist.push({ x: head.x + (Math.random()*12 - 6), y: head.y + 25, vx: (Math.random() - 0.5) * 1.8, vy: -1.5 - Math.random() * 2.5, life: 35, maxLife: 35, size: 6 + Math.random() * 10 });
        }
    }
    
    if(window.breathMist) {
        for (let i = window.breathMist.length - 1; i >= 0; i--) {
            let bm = window.breathMist[i]; bm.x += bm.vx; bm.y += bm.vy; bm.size += 0.6; bm.life--;
            ctx.fillStyle = `rgba(255, 255, 255, ${ (bm.life / bm.maxLife) * 0.45 })`;
            ctx.beginPath(); ctx.arc(bm.x, bm.y, bm.size, 0, Math.PI*2); ctx.fill();
            if(bm.life <= 0) window.breathMist.splice(i, 1);
        }
    }

    // 🌟 GĂNG TAY ĐẤM BỐC BẮT SÁNG ĐỘNG CÓ MOTION BLUR
    const drawRealImageGlove = (handPt, isRight, state) => { 
        ctx.save(); ctx.translate(handPt.x, handPt.y); ctx.scale(handPt.z, handPt.z); 
        
        // Nếu đang ra đòn, tạo vệt Motion Blur
        if (state === 'punch' || state === 'cross' || state === 'hook' || state === 'uppercut') {
            ctx.globalAlpha = 0.3;
            let blurDist = 30;
            if (window.enemyGloveImg && window.enemyGloveImg.complete) {
                let gSize = bType === 'heavy' ? 85 : 75; 
                ctx.drawImage(window.enemyGloveImg, (-gSize/2) - (isRight?-blurDist:blurDist), -gSize/2 + blurDist/2, gSize, gSize);
            }
            ctx.globalAlpha = 1.0;
        }

        ctx.shadowBlur = 30; ctx.shadowColor = "rgba(0,0,0,0.9)"; 
        if (window.enemyGloveImg && window.enemyGloveImg.complete && window.enemyGloveImg.naturalWidth > 0) { 
            let gSize = bType === 'heavy' ? 85 : 75; // Găng tay to hơn, ngầu hơn
            if (isRight) ctx.scale(-1, 1); 
            ctx.drawImage(window.enemyGloveImg, -gSize/2, -gSize/2, gSize, gSize); 
            
            // Tia lóa sáng (Rim Light) trên găng
            ctx.globalCompositeOperation = 'screen';
            let gLight = ctx.createRadialGradient(0, -gSize/4, 0, 0, -gSize/4, gSize/2);
            gLight.addColorStop(0, "rgba(255,255,255,0.4)"); gLight.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gLight; ctx.beginPath(); ctx.arc(0, 0, gSize/2, 0, Math.PI*2); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';

        } else { ctx.fillStyle = jColor; ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI*2); ctx.fill(); } 
        ctx.restore(); 
    };
    if (!isTrail) { drawRealImageGlove(handL, false, p.state); drawRealImageGlove(handR, true, p.state); } ctx.restore();
};

window.assignDrawMethods = function(statsObj) { };
