// ==========================================
// GRAPHICS_V3.JS - THE ULTIMATE CHARACTER FORGE (V4.0)
// [ĐỈNH CAO: TÙY BIẾN THỂ HÌNH, HÀO QUANG, TRANG PHỤC, HÌNH XĂM TỪ FILE CONFIG]
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
    let bounce = (p.state === 'walk' || p.state === 'dash') ? Math.sin(Date.now() / 120) * 6 : Math.sin(Date.now() / 250) * 3; 
    
    // Tự động scale khung xương theo thể hình (bodyType)
    let bType = p.bodyType || 'muscular';
    let sW = bType === 'heavy' ? 45 : (bType === 'lean' ? 32 : 38); // Chiều rộng vai
    let hY = bType === 'heavy' ? -150 : -140; // Chiều cao đầu
    
    let head = { x: 0, y: hY + bounce, z: 1 }; let neck = { x: 0, y: -100 + bounce, z: 1 }; let pelvis = { x: 0, y: -20 + bounce, z: 1 };
    let shoulderL = { x: -sW, y: -100 + bounce }; let shoulderR = { x: sW, y: -100 + bounce };
    let footL = { x: -45, y: 0, z: 1 }; let kneeL = { x: -50, y: -15 + bounce, z: 1 }; 
    let footR = { x: 45, y: 0, z: 1 }; let kneeR = { x: 50, y: -15 + bounce, z: 1 };
    let handL = { x: -35, y: -110 + bounce, z: 1 }; let elbowL = { x: -60, y: -65 + bounce, z: 1 }; 
    let handR = { x: 35, y: -110 + bounce, z: 1 }; let elbowR = { x: 60, y: -65 + bounce, z: 1 };

    let progress = (p.attackTimer > 0) ? 1 - (p.attackTimer / (p.maxT || 22)) : 0;
    let ext = progress > 0 ? (progress < 0.4 ? Math.sin((progress / 0.4) * (Math.PI / 2)) : 1 - Math.pow((progress - 0.4) / 0.6, 2)) : 0;

    if (p.state === 'punch' || p.state === 'cross' || p.state === 'jab') { handR.x -= 38 * ext; handR.y += 50 * ext; handR.z = 1 + (ext * 5.5); shoulderR.x += 15 * ext; head.x = -15 * ext; } 
    else if (p.state === 'hook' || p.state === 'uppercut') { handL.x += 70 * ext; handL.y -= 30 * ext; handL.z = 1 + (ext * 4.5); shoulderL.x -= 15 * ext; head.x = 25 * ext; }
    else if (p.state === 'hurt') { head.y -= 15; head.x = (Math.random() - 0.5) * 20; handL.y = -30; handL.x = -65; handR.y = -30; handR.x = 65; }
    else if (p.state === 'ko_falling' || p.state === 'dead') { head.y = -20; head.x = 40; handL.y = 15; handR.y = 15; kneeL.y = 5; kneeR.y = 5; }

    return { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR };
};

// ==========================================
// 🌟 LÒ RÈN NHÂN VẬT (RENDER THEO THÔNG SỐ CONFIG)
// ==========================================
window.drawStickman = function(ctx, p, isTrail = false) {
    if(!p || isNaN(p.x) || isNaN(p.y)) return; ctx.save(); ctx.translate(p.x, p.y); 
    
    let pts = window.drawBaseLimbFPS(p); 
    let { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR } = pts;

    // --- ĐỌC CẤU HÌNH TỪ FILE CHARACTER ---
    let bType = p.bodyType || 'muscular'; // lean, muscular, heavy
    let pType = p.pantsType || 'boxing';  // boxing, muaythai, long
    let aura = p.auraType || 'none';      // none, fire, god, lightning
    
    let wArm = bType === 'heavy' ? 18 : (bType === 'lean' ? 10 : 14);
    let wLeg = bType === 'heavy' ? 20 : (bType === 'lean' ? 12 : 16);
    let torsoW = bType === 'heavy' ? 30 : (bType === 'lean' ? 18 : 22);

    let sColor = p.skinColor || "#f1c27d", jColor = p.jerseyColor || p.color || "#0984e3"; 
    let pColor = p.pantsColor || "#1e272e", sockC = p.socksColor || "#fff", shoeC = p.shoesColor || "#f1c40f";

    // 1. VẼ HÀO QUANG (AURA TỐI THƯỢNG) NẾU CÓ
    if (aura !== 'none' && !isTrail && p.hp > 0) {
        let aColor = aura === 'fire' ? "#ff4757" : (aura === 'god' ? "#f1c40f" : "#00f3ff");
        let aSize = Math.sin(Date.now() / 100) * 10 + 60;
        ctx.shadowBlur = 40; ctx.shadowColor = aColor; ctx.fillStyle = aColor;
        ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.ellipse(0, -60, aSize, aSize * 1.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
    }

    if (!isTrail && p.hp > 0 && p.state !== 'ko_falling') { ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; ctx.beginPath(); ctx.ellipse(0, 5, 55, 15, 0, 0, Math.PI*2); ctx.fill(); }

    // 🌟 HÀM RENDER CƠ BẮP CÓ ĐỔ BÓNG RIM LIGHT
    const draw3DLimb = (start, end, width, color, isTattoo = false) => {
        let dx = end.x - start.x; let dy = end.y - start.y;
        let len = Math.sqrt(dx*dx + dy*dy); let angle = Math.atan2(dy, dx);
        ctx.save(); ctx.translate(start.x, start.y); ctx.rotate(angle);
        
        let grad = ctx.createLinearGradient(0, -width/2, 0, width/2);
        grad.addColorStop(0, "rgba(0,0,0,0.7)"); grad.addColorStop(0.3, color);
        grad.addColorStop(0.7, color); grad.addColorStop(1, "rgba(0,0,0,0.7)");

        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.lineWidth = width + 5; ctx.strokeStyle = "#000"; // Viền đen ngoài
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
        
        ctx.lineWidth = width; ctx.strokeStyle = grad; // Lõi cơ bắp
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();

        // Vẽ hình xăm Yakuza/Tribal nếu được kích hoạt
        if (isTattoo) {
            ctx.lineWidth = 2; ctx.strokeStyle = "rgba(0,0,0,0.6)";
            for(let t=10; t<len-10; t+=15) {
                ctx.beginPath(); ctx.moveTo(t, -width/3); ctx.quadraticCurveTo(t+10, 0, t, width/3); ctx.stroke();
            }
        }
        
        // Rim light ảo diệu tạo khối
        ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.moveTo(0, -width/3); ctx.lineTo(len, -width/3); ctx.stroke();
        ctx.restore();
    };

    // 2. VẼ CHÂN VÀ TAY
    let isLongPants = pType === 'long';
    draw3DLimb(pelvis, kneeL, wLeg, isLongPants ? pColor : sColor); 
    draw3DLimb(kneeL, footL, wLeg - 2, isLongPants ? pColor : sockC); 
    draw3DLimb(pelvis, kneeR, wLeg, isLongPants ? pColor : sColor); 
    draw3DLimb(kneeR, footR, wLeg - 2, isLongPants ? pColor : sockC); 

    let hasTattoo = p.hasTattoos === true;
    draw3DLimb(shoulderL, elbowL, wArm, sColor, hasTattoo); draw3DLimb(elbowL, handL, wArm - 2, sColor);
    draw3DLimb(shoulderR, elbowR, wArm, sColor, hasTattoo); draw3DLimb(elbowR, handR, wArm - 2, sColor);

    // 3. VẼ QUẦN ĐÙI (Dựa trên loại quần)
    if (!isLongPants) {
        ctx.fillStyle = pColor; ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.lineJoin = "round";
        ctx.beginPath();
        let shortLen = pType === 'muaythai' ? -10 : -15; // Muay Thái quần ngắn và ống loe hơn
        let flare = pType === 'muaythai' ? 18 : 12;
        
        ctx.moveTo(pelvis.x - 24, pelvis.y - 8); ctx.lineTo(pelvis.x + 24, pelvis.y - 8);
        ctx.lineTo(kneeR.x + flare, kneeR.y + shortLen); ctx.lineTo(pelvis.x, pelvis.y + 18); ctx.lineTo(kneeL.x - flare, kneeL.y + shortLen);
        ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    // Đai lưng vô địch (Championship Belt)
    ctx.lineWidth = 4; ctx.fillStyle = p.hasChampBelt ? "#f1c40f" : "#111";
    ctx.beginPath(); ctx.roundRect(pelvis.x - 25, pelvis.y - 8, 50, 10, 4); ctx.fill(); ctx.stroke();
    if (p.beltText) {
        ctx.fillStyle = p.hasChampBelt ? "#000" : "#fff"; ctx.font = "bold 8px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(p.beltText, pelvis.x, pelvis.y - 3);
    }

    // 4. VẼ THÂN TRÊN (Áo đấu hoặc cởi trần sáu múi)
    let chestGrad = ctx.createLinearGradient(shoulderL.x, 0, shoulderR.x, 0);
    let tColor = p.isShirtless ? sColor : jColor;
    chestGrad.addColorStop(0, "rgba(0,0,0,0.5)"); chestGrad.addColorStop(0.5, tColor); chestGrad.addColorStop(1, "rgba(0,0,0,0.5)");
    
    ctx.fillStyle = chestGrad; ctx.lineWidth = 5; ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(shoulderL.x - 8, shoulderL.y - 5); 
    ctx.quadraticCurveTo(0, neck.y + 15, shoulderR.x + 8, shoulderR.y - 5); 
    ctx.lineTo(pelvis.x + torsoW, pelvis.y - 8); 
    ctx.lineTo(pelvis.x - torsoW, pelvis.y - 8); 
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Chi tiết sáu múi và cơ ngực nếu cởi trần
    if (p.isShirtless && (bType === 'muscular' || bType === 'lean')) {
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(0,0,0,0.4)";
        // Cơ ngực
        ctx.beginPath(); ctx.moveTo(0, shoulderL.y + 15); ctx.lineTo(shoulderL.x + 10, shoulderL.y + 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, shoulderR.y + 15); ctx.lineTo(shoulderR.x - 10, shoulderR.y + 10); ctx.stroke();
        // Sáu múi
        ctx.beginPath(); ctx.moveTo(0, shoulderL.y + 15); ctx.lineTo(0, pelvis.y - 8); ctx.stroke(); // Rãnh bụng
        for(let a=0; a<3; a++) {
            let abY = shoulderL.y + 30 + (a * 12);
            ctx.beginPath(); ctx.moveTo(-10, abY); ctx.lineTo(10, abY); ctx.stroke();
        }
    } else if (!p.isShirtless && p.jerseyNumber) {
        ctx.fillStyle = (p.id === "messi" || p.classId === "messi") ? "#111" : "#fff"; 
        ctx.font = "900 28px 'Teko', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(p.jerseyNumber, 0, (shoulderL.y + pelvis.y) / 2 - 5);
    }

    // 5. GIÀY THỂ THAO
    const drawShoe = (footPt, angleMod) => {
        ctx.save(); ctx.translate(footPt.x, footPt.y); ctx.rotate(angleMod);
        ctx.fillStyle = "#ecf0f1"; ctx.lineWidth = 3; ctx.strokeStyle = "#000";
        ctx.beginPath(); ctx.roundRect(-16, 2, 32, 12, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = shoeC;
        ctx.beginPath(); ctx.moveTo(-12, 6); ctx.quadraticCurveTo(0, -12, 16, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
    };
    drawShoe(footL, -0.1); drawShoe(footR, 0.1);

    // 6. KHUÔN MẶT VÀ MẮT PHÁT SÁNG
    let faceSize = bType === 'heavy' ? 95 : 85; 
    ctx.shadowBlur = 20; ctx.shadowColor = jColor; ctx.fillStyle = jColor;
    ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2 + 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); 
        ctx.drawImage(window.enemyFaceImg, head.x - faceSize/2, head.y - faceSize/2, faceSize, faceSize); ctx.restore();
        ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.stroke();
        
        // Mắt phát sáng (Terminator / God mode)
        if (p.glowingEyes) {
            ctx.shadowBlur = 15; ctx.shadowColor = p.glowingEyes; ctx.fillStyle = p.glowingEyes;
            ctx.beginPath(); ctx.ellipse(head.x - 12, head.y - 5, 8, 3, Math.PI/8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(head.x + 12, head.y - 5, 8, 3, -Math.PI/8, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    } else { 
        ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); 
    }

    // 7. GĂNG TAY ĐẤM BỐC 3D (Z-Depth Scaling)
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
