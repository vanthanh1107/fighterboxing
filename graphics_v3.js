// ==========================================
// GRAPHICS_V3.JS - CINEMATIC EDITION
// [CẬP NHẬT: KHÁN ĐÀI ĐÔNG NGHỊT VỚI KHÁN GIẢ VECTOR NHẤP NHÔ]
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

    // 1. NỀN KHÁN GIẢ (Background Color)
    ctx.fillStyle = cAudience; 
    ctx.fillRect(-canvasWidth, -canvasHeight, canvasWidth * 3, canvasHeight * 3);
    
    // Ánh đèn Spotlight chiếu xuống giữa sàn
    let spotLight = ctx.createRadialGradient(canvasWidth/2, 50, 0, canvasWidth/2, canvasHeight - 100, 600);
    spotLight.addColorStop(0, cSpotlight); spotLight.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spotLight; ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // ===============================================
    // 🌟 2. VẼ KHÁN GIẢ VECTOR STICKMAN ĐÔNG NGHỊT
    // ===============================================
    ctx.save();
    let time = Date.now() / 250; // Biến thời gian để khán giả nhấp nhô
    
    // Vẽ 5 hàng khán giả từ xa đến gần
    for (let row = 4; row >= 0; row--) {
        let rowY = vanishY - 5 - (row * 28); // Hàng sau cao hơn hàng trước
        let numPeople = 45 + row * 10; // Hàng xa càng đông người
        let rowScale = 1 - (row * 0.12); // Hàng xa thì người nhỏ lại
        
        for (let i = 0; i < numPeople; i++) {
            // Rải người tràn ra 2 bên mép màn hình (để khi camera nghiêng không bị hở)
            let x = -300 + (i * ((canvasWidth + 600) / numPeople));
            
            // Xếp so le ngẫu nhiên để trông không bị cứng nhắc
            let randOffset = Math.sin(i * 123.45) * 20; 
            x += randOffset;

            // Hiệu ứng "Làn sóng người" (Mexican Wave) kết hợp nhấp nhô cổ vũ
            let bounce = Math.sin(time + x * 0.02) * 5 * rowScale;
            let finalY = rowY + bounce;

            // Khán giả là các bóng mờ (Silhouette) hòa quyện vào màu nền Map
            // 20% khán giả sẽ mặc áo sáng màu, còn lại mặc áo tối màu
            let isBright = (i % 5 === 0);
            ctx.fillStyle = isBright ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.55)";
            
            // Vẽ Đầu (Head)
            ctx.beginPath(); 
            ctx.arc(x, finalY, 9 * rowScale, 0, Math.PI * 2); 
            ctx.fill();
            
            // Vẽ Thân (Shoulders) - Nửa vòng tròn úp xuống
            ctx.beginPath(); 
            ctx.arc(x, finalY + 20 * rowScale, 15 * rowScale, Math.PI, 0); 
            ctx.fill();
            
            // Vẽ 2 tay giơ lên cổ vũ (Chỉ áp dụng cho những người đang ở đỉnh sóng)
            if (Math.sin(time * 1.5 + i) > 0.7) {
                ctx.strokeStyle = ctx.fillStyle;
                ctx.lineWidth = 2.5 * rowScale;
                ctx.lineCap = "round";
                // Tay trái
                ctx.beginPath(); ctx.moveTo(x - 12 * rowScale, finalY + 12 * rowScale); ctx.lineTo(x - 18 * rowScale, finalY - 8 * rowScale); ctx.stroke();
                // Tay phải
                ctx.beginPath(); ctx.moveTo(x + 12 * rowScale, finalY + 12 * rowScale); ctx.lineTo(x + 18 * rowScale, finalY - 8 * rowScale); ctx.stroke();
            }
        }
    }
    ctx.restore();
    // ===============================================

    // 3. FLASH MÁY ẢNH TỪ KHÁN ĐÀI
    ctx.save();
    for (let i = 0; i < 60; i++) {
        let flashX = Math.random() * canvasWidth; let flashY = Math.random() * (canvasHeight / 2 - 50);
        let alpha = Math.random() > 0.98 ? Math.random() : 0.02; 
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath(); ctx.arc(flashX, flashY, Math.random() * 3 + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // 4. MẶT SÀN VÕ ĐÀI (Mat)
    ctx.fillStyle = cMat; ctx.beginPath();
    ctx.moveTo(-200, canvasHeight); ctx.lineTo(canvasWidth + 200, canvasHeight); 
    ctx.lineTo(canvasWidth - 150, vanishY); ctx.lineTo(150, vanishY); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.8)"; ctx.lineWidth = 10; ctx.stroke();

    // 5. LOGO GIỮA SÀN
    ctx.save(); ctx.translate(canvasWidth/2, groundY + 20); ctx.scale(1, 0.3); ctx.globalAlpha = 0.15;
    ctx.font = "900 110px Impact"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff";
    ctx.fillText(cLogo, 0, 0); ctx.restore();

    // 6. CỘT GÓC VÀ DÂY ĐÀI THỪNG (Ropes)
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
// VẼ KHUNG XƯƠNG GÓC NHÌN FPS (ĐỊCH TRƯỚC MẶT)
// ==========================================
window.drawBaseLimbFPS = function(p) {
    let bounce = (p.state === 'walk') ? Math.sin(Date.now() / 150) * 5 : Math.sin(Date.now() / 300) * 3; 
    let head = { x: 0, y: -130 + bounce, z: 1 }; let neck = { x: 0, y: -90 + bounce, z: 1 }; let pelvis = { x: 0, y: -20 + bounce, z: 1 };
    let shoulderL = { x: -35, y: -90 + bounce }; let shoulderR = { x: 35, y: -90 + bounce };
    let footL = { x: -40, y: 0, z: 1 }; let kneeL = { x: -45, y: -10 + bounce, z: 1 }; 
    let footR = { x: 40, y: 0, z: 1 }; let kneeR = { x: 45, y: -10 + bounce, z: 1 };
    let handL = { x: -25, y: -110 + bounce, z: 1 }; let elbowL = { x: -45, y: -60 + bounce, z: 1 }; 
    let handR = { x: 25, y: -110 + bounce, z: 1 }; let elbowR = { x: 45, y: -60 + bounce, z: 1 };

    let maxT = p.maxT || 25; let progress = (p.attackTimer > 0) ? 1 - (p.attackTimer / maxT) : 0;
    let ext = 0; if (progress > 0) { if (progress < 0.4) ext = Math.sin((progress / 0.4) * (Math.PI / 2)); else ext = 1 - Math.pow((progress - 0.4) / 0.6, 2); }

    if (p.state === 'punch' || p.state === 'jab' || p.state === 'cross') { handR.x -= 25 * ext; handR.y += 40 * ext; handR.z = 1 + (ext * 4.5); shoulderR.x += 10 * ext; head.x = -15 * ext; pelvis.x = -5 * ext; } 
    else if (p.state === 'hook' || p.state === 'high_kick' || p.state === 'uppercut') { handL.x += 60 * ext; handL.y -= 20 * ext; handL.z = 1 + (ext * 3.5); shoulderL.x -= 10 * ext; head.x = 20 * ext; }
    else if (p.state === 'hurt') { head.y -= 20; head.x = (Math.random() - 0.5) * 10; neck.y -= 10; handL.y = -40; handL.x = -50; handR.y = -40; handR.x = 50; }
    else if (p.state === 'dash' || p.state === 'dash_back') { let lean = p.state === 'dash' ? 40 : -40; head.x = lean; neck.x = lean * 0.8; pelvis.x = lean * 0.4; handL.x += lean; handR.x += lean; }
    else if (p.state === 'ko_falling' || p.state === 'dead') { head.y = -20; head.x = 30; neck.y = -15; pelvis.y = -5; handL.y = 0; handL.x = -60; handR.y = 0; handR.x = 60; kneeL.y = 0; kneeR.y = 0; }

    return { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR };
};

// ==========================================
// HÀM VẼ STICKMAN DỰ PHÒNG CHUNG
// ==========================================
window.drawStickman = function(ctx, p, isTrail = false) {
    if(!p || isNaN(p.x) || isNaN(p.y)) return; ctx.save(); ctx.translate(p.x, p.y); 
    let pts = window.drawBaseLimbFPS(p); let { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR } = pts;

    // Bóng dưới chân
    if (!isTrail && p.hp > 0 && p.state !== 'ko_falling') { ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; ctx.beginPath(); ctx.ellipse(0, 0, 45, 10, 0, 0, Math.PI*2); ctx.fill(); }

    ctx.strokeStyle = "#fff"; ctx.shadowBlur = p.iFrames > 0 ? 20 : 10; ctx.shadowColor = p.iFrames > 0 ? "#fff" : (p.color || "#ff003c"); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const drawLine = (start, end, width) => { ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke(); };

    // Thân
    ctx.fillStyle = "#1a1a2e"; ctx.beginPath(); ctx.moveTo(shoulderL.x, shoulderL.y); ctx.lineTo(shoulderR.x, shoulderR.y); ctx.lineTo(pelvis.x + 15, pelvis.y); ctx.lineTo(pelvis.x - 15, pelvis.y); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); 
    // Chân & Tay
    drawLine(pelvis, kneeL, 7); drawLine(kneeL, footL, 5); drawLine(pelvis, kneeR, 7); drawLine(kneeR, footR, 5);
    drawLine(shoulderL, elbowL, 6); drawLine(elbowL, handL, 5 * handL.z); drawLine(shoulderR, elbowR, 6); drawLine(elbowR, handR, 5 * handR.z); 

    // Khuôn mặt
    let faceSize = 75; 
    if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); 
        ctx.drawImage(window.enemyFaceImg, head.x - faceSize/2, head.y - faceSize/2, faceSize, faceSize); ctx.restore();
        ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = p.hp > 0 ? (p.color || "#ff003c") : "#555"; ctx.stroke();
    } else { ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }

    // Găng tay (Fallback nếu nhân vật không có hàm drawMethod riêng)
    const drawBoxingGlove = (handPt, color) => { ctx.save(); ctx.translate(handPt.x, handPt.y); ctx.scale(handPt.z, handPt.z); ctx.shadowBlur = 15; ctx.shadowColor = color; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill(); ctx.restore(); };
    if (!isTrail) { drawBoxingGlove(handL, p.color || "#ff4757"); drawBoxingGlove(handR, p.color || "#ff4757"); }
    
    ctx.restore();
};

window.assignDrawMethods = function(statsObj) { };
