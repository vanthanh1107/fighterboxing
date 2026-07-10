// ==========================================
// GRAPHICS_V3.JS - AAA CEL-SHADING EDITION
// [ĐỈNH CAO THIẾT KẾ: ĐỔ BÓNG 3D CƠ BẮP, NẾP GẤP QUẦN ÁO, THỂ HÌNH CHỮ V]
// ==========================================

window.drawBoxingRing = function(ctx, canvasWidth, canvasHeight) {
    let cmap = window.currentMap || {};
    let cAudience = cmap.audience || "#050608"; 
    let cMat = cmap.mat || "#1e272e";
    let cSpotlight = cmap.spotlight || "rgba(0, 243, 255, 0.15)"; 
    let cRopes = cmap.ropes || ["#ff4757", "#ffffff", "#ff4757"];
    let cLogo = cmap.logo || "FIGHTER";

    let groundY = window.GROUND_Y || 320; 
    let vanishY = groundY - 80; 

    // 1. NỀN KHÁN GIẢ
    ctx.fillStyle = cAudience; 
    ctx.fillRect(-canvasWidth, -canvasHeight, canvasWidth * 3, canvasHeight * 3);
    
    let spotLight = ctx.createRadialGradient(canvasWidth/2, 50, 0, canvasWidth/2, canvasHeight - 100, 600);
    spotLight.addColorStop(0, cSpotlight); spotLight.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spotLight; ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. VẼ KHÁN GIẢ VECTOR NHẤP NHÔ
    ctx.save();
    let time = Date.now() / 250; 
    for (let row = 4; row >= 0; row--) {
        let rowY = vanishY - 5 - (row * 28); 
        let numPeople = 45 + row * 10; 
        let rowScale = 1 - (row * 0.12); 
        
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

    // 3. FLASH MÁY ẢNH
    ctx.save();
    for (let i = 0; i < 60; i++) {
        let flashX = Math.random() * canvasWidth; let flashY = Math.random() * (canvasHeight / 2 - 50);
        let alpha = Math.random() > 0.98 ? Math.random() : 0.02; 
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath(); ctx.arc(flashX, flashY, Math.random() * 3 + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // 4. MẶT SÀN VÀ LOGO
    ctx.fillStyle = cMat; ctx.beginPath();
    ctx.moveTo(-200, canvasHeight); ctx.lineTo(canvasWidth + 200, canvasHeight); 
    ctx.lineTo(canvasWidth - 150, vanishY); ctx.lineTo(150, vanishY); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.8)"; ctx.lineWidth = 10; ctx.stroke();

    ctx.save(); ctx.translate(canvasWidth/2, groundY + 20); ctx.scale(1, 0.3); ctx.globalAlpha = 0.15;
    ctx.font = "900 110px Impact"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff";
    ctx.fillText(cLogo, 0, 0); ctx.restore();

    // 5. CỘT GÓC VÀ DÂY ĐÀI
    ctx.lineWidth = 4;
    ctx.fillStyle = "#111"; ctx.fillRect(140, vanishY - 120, 25, 120); ctx.fillRect(canvasWidth - 165, vanishY - 120, 25, 120);
    ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(145, vanishY - 120, 5, 120); ctx.fillRect(canvasWidth - 160, vanishY - 120, 5, 120);

    for (let i = 0; i < 3; i++) {
        let yOffsetFar = vanishY - 30 - (i * 30); let yOffsetNear = canvasHeight - 50 - (i * 100); 
        ctx.strokeStyle = cRopes[i] || "#fff";
        ctx.beginPath(); ctx.moveTo(-100, yOffsetNear); ctx.lineTo(150, yOffsetFar); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(canvasWidth + 100, yOffsetNear); ctx.lineTo(canvasWidth - 150, yOffsetFar); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(150, yOffsetFar); ctx.lineTo(canvasWidth - 150, yOffsetFar); ctx.stroke();
    }
};

// ==========================================
// VẼ KHUNG XƯƠNG GÓC NHÌN FPS
// ==========================================
window.drawBaseLimbFPS = function(p) {
    let bounce = (p.state === 'walk' || p.state === 'dash') ? Math.sin(Date.now() / 120) * 6 : Math.sin(Date.now() / 250) * 3; 
    let head = { x: 0, y: -145 + bounce, z: 1 }; let neck = { x: 0, y: -100 + bounce, z: 1 }; let pelvis = { x: 0, y: -20 + bounce, z: 1 };
    let shoulderL = { x: -40, y: -100 + bounce }; let shoulderR = { x: 40, y: -100 + bounce };
    let footL = { x: -45, y: 0, z: 1 }; let kneeL = { x: -50, y: -15 + bounce, z: 1 }; 
    let footR = { x: 45, y: 0, z: 1 }; let kneeR = { x: 50, y: -15 + bounce, z: 1 };
    let handL = { x: -35, y: -110 + bounce, z: 1 }; let elbowL = { x: -60, y: -65 + bounce, z: 1 }; 
    let handR = { x: 35, y: -110 + bounce, z: 1 }; let elbowR = { x: 60, y: -65 + bounce, z: 1 };

    let maxT = p.maxT || 22; let progress = (p.attackTimer > 0) ? 1 - (p.attackTimer / maxT) : 0;
    let ext = 0; if (progress > 0) { if (progress < 0.4) ext = Math.sin((progress / 0.4) * (Math.PI / 2)); else ext = 1 - Math.pow((progress - 0.4) / 0.6, 2); }

    if (p.state === 'punch' || p.state === 'cross' || p.state === 'jab') { handR.x -= 38 * ext; handR.y += 50 * ext; handR.z = 1 + (ext * 5.5); shoulderR.x += 15 * ext; head.x = -15 * ext; } 
    else if (p.state === 'hook' || p.state === 'uppercut') { handL.x += 70 * ext; handL.y -= 30 * ext; handL.z = 1 + (ext * 4.5); shoulderL.x -= 15 * ext; head.x = 25 * ext; }
    else if (p.state === 'hurt') { head.y -= 15; head.x = (Math.random() - 0.5) * 20; handL.y = -30; handL.x = -65; handR.y = -30; handR.x = 65; }
    else if (p.state === 'ko_falling' || p.state === 'dead') { head.y = -20; head.x = 40; handL.y = 15; handR.y = 15; kneeL.y = 5; kneeR.y = 5; }

    return { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR };
};

// ==========================================
// 🌟 HÀM RENDER ĐỈNH CAO: KHỐI 3D & CEL-SHADING
// ==========================================
window.drawStickman = function(ctx, p, isTrail = false) {
    if(!p || isNaN(p.x) || isNaN(p.y)) return; 
    ctx.save(); ctx.translate(p.x, p.y); 
    
    let pts = window.drawBaseLimbFPS(p); 
    let { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR } = pts;

    // Đọc thông số đồ họa nhân vật
    let skinColor = p.skinColor || "#f1c27d"; 
    let jerseyColor = p.jerseyColor || p.color || "#0984e3"; 
    let shortsColor = p.shortsColor || "#1e272e"; 
    let socksColor = p.socksColor || "#ffffff"; 
    let shoesColor = p.shoesColor || "#f1c40f"; 
    let jerseyNumber = p.jerseyNumber || "10"; 

    // 1. Bóng đổ dưới chân cực gắt
    if (!isTrail && p.hp > 0 && p.state !== 'ko_falling') { 
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; 
        ctx.beginPath(); ctx.ellipse(0, 5, 55, 15, 0, 0, Math.PI*2); ctx.fill(); 
    }

    // 🌟 THUẬT TOÁN ĐỔ BÓNG KHỐI TRÒN (VOLUMETRIC SHADING TAY CHÂN)
    const draw3DLimb = (start, end, width, color) => {
        let dx = end.x - start.x; let dy = end.y - start.y;
        let len = Math.sqrt(dx*dx + dy*dy); let angle = Math.atan2(dy, dx);
        
        ctx.save(); ctx.translate(start.x, start.y); ctx.rotate(angle);
        
        // Tạo dải màu cong 3D (Sáng ở giữa, tối ở 2 mép biên)
        let grad = ctx.createLinearGradient(0, -width/2, 0, width/2);
        grad.addColorStop(0, "rgba(0,0,0,0.6)"); // Bóng tối viền trên
        grad.addColorStop(0.2, color);
        grad.addColorStop(0.8, color);
        grad.addColorStop(1, "rgba(0,0,0,0.6)"); // Bóng tối viền dưới

        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        // Nét viền đen đậm chất Comic
        ctx.lineWidth = width + 6; ctx.strokeStyle = "#000";
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
        // Lõi màu cơ bắp 3D
        ctx.lineWidth = width; ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
        ctx.restore();
    };

    // 2. VẼ TAY & CHÂN BẰNG HÀM 3D MỚI
    draw3DLimb(pelvis, kneeL, 16, skinColor); draw3DLimb(kneeL, footL, 12, socksColor); 
    draw3DLimb(pelvis, kneeR, 16, skinColor); draw3DLimb(kneeR, footR, 12, socksColor); 
    draw3DLimb(shoulderL, elbowL, 14, skinColor); draw3DLimb(elbowL, handL, 12, skinColor);
    draw3DLimb(shoulderR, elbowR, 14, skinColor); draw3DLimb(elbowR, handR, 12, skinColor);

    // 3. VẼ QUẦN ĐÙI (Có nếp gấp và viền thắt lưng)
    ctx.fillStyle = shortsColor; ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pelvis.x - 24, pelvis.y - 8); ctx.lineTo(pelvis.x + 24, pelvis.y - 8);
    ctx.lineTo(kneeR.x + 12, kneeR.y - 15); ctx.lineTo(pelvis.x, pelvis.y + 18); ctx.lineTo(kneeL.x - 12, kneeL.y - 15);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    
    // Viền thắt lưng quần đùi
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(pelvis.x - 24, pelvis.y - 2); ctx.lineTo(pelvis.x + 24, pelvis.y - 2); ctx.stroke();

    // 4. VẼ THÂN ÁO ĐẤU (Thể hình chữ V - Athletic Build)
    let chestGrad = ctx.createLinearGradient(shoulderL.x, 0, shoulderR.x, 0);
    chestGrad.addColorStop(0, "rgba(0,0,0,0.5)"); chestGrad.addColorStop(0.5, jerseyColor); chestGrad.addColorStop(1, "rgba(0,0,0,0.5)");
    
    ctx.fillStyle = chestGrad; ctx.lineWidth = 5; ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(shoulderL.x - 8, shoulderL.y - 5); 
    ctx.quadraticCurveTo(0, neck.y + 15, shoulderR.x + 8, shoulderR.y - 5); // Cổ áo cong
    ctx.lineTo(pelvis.x + 22, pelvis.y - 8); // Eo thon
    ctx.lineTo(pelvis.x - 22, pelvis.y - 8); // Eo thon
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Các nếp gấp áo (Wrinkles)
    ctx.lineWidth = 2; ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.moveTo(shoulderL.x + 5, shoulderL.y + 10); ctx.lineTo(pelvis.x - 10, pelvis.y - 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(shoulderR.x - 5, shoulderR.y + 10); ctx.lineTo(pelvis.x + 10, pelvis.y - 15); ctx.stroke();

    // 5. IN SỐ ÁO
    let chestX = (shoulderL.x + shoulderR.x) / 2;
    let chestY = (shoulderL.y + pelvis.y) / 2 - 5;
    ctx.fillStyle = (p.id === "messi" || p.classId === "messi") ? "#111" : "#fff"; 
    ctx.font = "900 28px 'Teko', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(jerseyNumber, chestX, chestY);

    // 6. VẼ GIÀY SNEAKERS ĐỈNH CAO (Có mũi giày và bộ đế giày)
    const drawShoe = (footPt, angleMod) => {
        ctx.save(); ctx.translate(footPt.x, footPt.y); ctx.rotate(angleMod);
        // Đế giày (Sole)
        ctx.fillStyle = "#ecf0f1"; ctx.lineWidth = 3; ctx.strokeStyle = "#000";
        ctx.beginPath(); ctx.roundRect(-16, 2, 32, 12, 6); ctx.fill(); ctx.stroke();
        // Thân giày
        ctx.fillStyle = shoesColor;
        ctx.beginPath(); ctx.moveTo(-12, 6); ctx.quadraticCurveTo(0, -12, 16, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
    };
    drawShoe(footL, -0.1); drawShoe(footR, 0.1);

    // 7. KHUÔN MẶT CẮT TRÒN CÓ AURA SÁNG
    let faceSize = 85; 
    
    // Aura phát sáng phía sau đầu
    ctx.shadowBlur = 25; ctx.shadowColor = jerseyColor; ctx.fillStyle = jerseyColor;
    ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2 + 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); 
        ctx.drawImage(window.enemyFaceImg, head.x - faceSize/2, head.y - faceSize/2, faceSize, faceSize); ctx.restore();
        // Viền đen dày mạnh mẽ bo khuôn mặt
        ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = "#000"; ctx.stroke();
        // Ánh viền sáng bên trong (Inner highlight)
        ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2 - 2, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.stroke();
    } else { 
        ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); 
    }

    // 🌟 8. VẼ ẢNH GĂNG TAY THẬT 3D CÓ ĐỔ BÓNG GẮT
    const drawRealImageGlove = (handPt, isRight) => {
        ctx.save(); ctx.translate(handPt.x, handPt.y); 
        ctx.scale(handPt.z, handPt.z); 
        
        ctx.shadowBlur = 20; ctx.shadowColor = "rgba(0,0,0,0.8)"; // Bóng đổ của đôi găng
        
        if (window.enemyGloveImg && window.enemyGloveImg.complete && window.enemyGloveImg.naturalWidth > 0) {
            let gSize = 65; // Găng tay lực điền siêu bự
            if (isRight) ctx.scale(-1, 1); 
            ctx.drawImage(window.enemyGloveImg, -gSize/2, -gSize/2, gSize, gSize);
        } else {
            ctx.fillStyle = jerseyColor; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    };

    if (!isTrail) { drawRealImageGlove(handL, false); drawRealImageGlove(handR, true); }
    ctx.restore();
};

window.assignDrawMethods = function(statsObj) { };
