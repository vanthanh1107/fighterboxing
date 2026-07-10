// ==========================================
// GRAPHICS_V3.JS - ULTIMATE CHIBI CARTOON EDITION
// [NÂNG CẤP: ĐỔI NGƯỜI QUE THÀNH CƠ BẮP COMIC, QUẦN ÁO ĐẤU, SỐ ÁO VÀ GĂNG TAY THẬT]
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
    // 2. VẼ KHÁN GIẢ VECTOR STICKMAN ĐÔNG NGHỊT
    // ===============================================
    ctx.save();
    let time = Date.now() / 250; 
    
    for (let row = 4; row >= 0; row--) {
        let rowY = vanishY - 5 - (row * 28); 
        let numPeople = 45 + row * 10; 
        let rowScale = 1 - (row * 0.12); 
        
        for (let i = 0; i < numPeople; i++) {
            let x = -300 + (i * ((canvasWidth + 600) / numPeople));
            let randOffset = Math.sin(i * 123.45) * 20; 
            x += randOffset;

            let bounce = Math.sin(time + x * 0.02) * 5 * rowScale;
            let finalY = rowY + bounce;

            let isBright = (i % 5 === 0);
            ctx.fillStyle = isBright ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.55)";
            
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
// VẼ KHUNG XƯƠNG GÓC NHÌN FPS (HỆ TỌA ĐỘ PHÙ HỢP)
// ==========================================
window.drawBaseLimbFPS = function(p) {
    let bounce = (p.state === 'walk' || p.state === 'dash') ? Math.sin(Date.now() / 120) * 6 : Math.sin(Date.now() / 250) * 3; 
    let head = { x: 0, y: -135 + bounce, z: 1 }; let neck = { x: 0, y: -95 + bounce, z: 1 }; let pelvis = { x: 0, y: -20 + bounce, z: 1 };
    let shoulderL = { x: -38, y: -95 + bounce }; let shoulderR = { x: 38, y: -95 + bounce };
    let footL = { x: -40, y: 0, z: 1 }; let kneeL = { x: -45, y: -10 + bounce, z: 1 }; 
    let footR = { x: 40, y: 0, z: 1 }; let kneeR = { x: 45, y: -10 + bounce, z: 1 };
    let handL = { x: -30, y: -105 + bounce, z: 1 }; let elbowL = { x: -55, y: -60 + bounce, z: 1 }; 
    let handR = { x: 30, y: -105 + bounce, z: 1 }; let elbowR = { x: 55, y: -60 + bounce, z: 1 };

    let maxT = p.maxT || 22; let progress = (p.attackTimer > 0) ? 1 - (p.attackTimer / maxT) : 0;
    let ext = 0; if (progress > 0) { if (progress < 0.4) ext = Math.sin((progress / 0.4) * (Math.PI / 2)); else ext = 1 - Math.pow((progress - 0.4) / 0.6, 2); }

    if (p.state === 'punch' || p.state === 'cross' || p.state === 'jab') { handR.x -= 35 * ext; handR.y += 45 * ext; handR.z = 1 + (ext * 4.8); shoulderR.x += 12 * ext; head.x = -15 * ext; } 
    else if (p.state === 'hook' || p.state === 'uppercut') { handL.x += 65 * ext; handL.y -= 25 * ext; handL.z = 1 + (ext * 3.8); shoulderL.x -= 12 * ext; head.x = 20 * ext; }
    else if (p.state === 'hurt') { head.y -= 15; head.x = (Math.random() - 0.5) * 15; handL.y = -30; handL.x = -60; handR.y = -30; handR.x = 60; }
    else if (p.state === 'ko_falling' || p.state === 'dead') { head.y = -20; head.x = 35; handL.y = 10; handR.y = 10; kneeL.y = 5; kneeR.y = 5; }

    return { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR };
};

// ==========================================
// 🌟 HÀM RENDER NHÂN VẬT CARTOON ĐỈNH CAO CHUNG
// ==========================================
window.drawStickman = function(ctx, p, isTrail = false) {
    if(!p || isNaN(p.x) || isNaN(p.y)) return; 
    ctx.save(); ctx.translate(p.x, p.y); 
    
    let pts = window.drawBaseLimbFPS(p); 
    let { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR } = pts;

    // Đọc thông số động từ nhân vật (Nếu không có sẽ dùng cấu hình mặc định)
    let skinColor = p.skinColor || "#f1c27d"; // Màu da người Cartoon
    let jerseyColor = p.jerseyColor || p.color || "#0984e3"; // Màu áo đấu
    let shortsColor = p.shortsColor || "#1e272e"; // Màu quần đùi
    let socksColor = p.socksColor || "#ffffff"; // Màu tất
    let shoesColor = p.shoesColor || "#f1c40f"; // Màu giày đấu
    let jerseyNumber = p.jerseyNumber || "10"; // Số áo đấu

    // 1. Bóng đổ dưới chân
    if (!isTrail && p.hp > 0 && p.state !== 'ko_falling') { 
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; ctx.beginPath(); ctx.ellipse(0, 0, 50, 12, 0, 0, Math.PI*2); ctx.fill(); 
    }

    // 🌟 HÀM VẼ CƠ BẮP DA THỊT CÓ VIỀN COMIC ĐẬM ĐÀ
    const drawFleshyLimb = (start, end, width, color) => {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        // Bước A: Vẽ nét viền đen dày bên ngoài
        ctx.lineWidth = width + 5; ctx.strokeStyle = "#111";
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
        // Bước B: Vẽ màu da thịt đè lên bên trong
        ctx.lineWidth = width; ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    };

    // 2. VẼ ĐÙI VÀ TẤT CHÂN
    drawFleshyLimb(pelvis, kneeL, 14, skinColor); 
    drawFleshyLimb(kneeL, footL, 11, socksColor); // Tất chân trái
    drawFleshyLimb(pelvis, kneeR, 14, skinColor); 
    drawFleshyLimb(kneeR, footR, 11, socksColor); // Tất chân phải

    // 3. VẼ QUẦN ĐÙI THỂ THAO CHIBI
    ctx.fillStyle = shortsColor; ctx.lineWidth = 4; ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(pelvis.x - 22, pelvis.y - 6); ctx.lineTo(pelvis.x + 22, pelvis.y - 6);
    ctx.lineTo(kneeR.x + 10, kneeR.y - 12); ctx.lineTo(pelvis.x, pelvis.y + 16); ctx.lineTo(kneeL.x - 10, kneeL.y - 12);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // 4. VẼ CÁNH TAY CƠ BẮP (Áo ba lỗ)
    drawFleshyLimb(shoulderL, elbowL, 12, skinColor); drawFleshyLimb(elbowL, handL, 10, skinColor);
    drawFleshyLimb(shoulderR, elbowR, 12, skinColor); drawFleshyLimb(elbowR, handR, 10, skinColor);

    // 5. VẼ THÂN ÁO ĐẤU 
    ctx.fillStyle = jerseyColor; ctx.lineWidth = 4; ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(shoulderL.x - 6, shoulderL.y - 4); ctx.lineTo(shoulderR.x + 6, shoulderR.y - 4);
    ctx.lineTo(pelvis.x + 20, pelvis.y - 2); ctx.lineTo(pelvis.x - 20, pelvis.y - 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Nếu là áo sọc của Argentina (Messi) thì vẽ thêm sọc trắng dọc
    if (p.id === "messi" || p.classId === "messi") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(shoulderL.x + 12, shoulderL.y - 2, 8, 30);
        ctx.fillRect(shoulderR.x - 20, shoulderR.y - 2, 8, 30);
    }

    // 6. IN SỐ ÁO ĐẤU ĐIỆN ẢNH LÊN NGỰC
    let chestX = (shoulderL.x + shoulderR.x) / 2;
    let chestY = (shoulderL.y + pelvis.y) / 2 - 4;
    ctx.fillStyle = (p.id === "messi" || p.classId === "messi") ? "#111" : "#fff"; 
    ctx.font = "900 24px 'Teko', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(jerseyNumber, chestX, chestY);

    // 7. VẼ ĐÔI GIÀY ĐẤM BỐC (SNEAKERS)
    ctx.fillStyle = shoesColor; ctx.strokeStyle = "#111"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(footL.x - 5, footL.y + 4, 15, 8, -0.05, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(footR.x + 5, footR.y + 4, 15, 8, 0.05, 0, Math.PI*2); ctx.fill(); ctx.stroke();

    // 8. KHUÔN MẶT CẮT CLIPPING TRÒN
    let faceSize = 78; 
    if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); 
        ctx.drawImage(window.enemyFaceImg, head.x - faceSize/2, head.y - faceSize/2, faceSize, faceSize); ctx.restore();
        
        ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.lineWidth = 3.5; 
        ctx.strokeStyle = p.hp > 0 ? "#111" : "#555"; ctx.stroke();
    } else { 
        ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); 
    }

    // 🌟 9. ĐỈNH CAO: VẼ ẢNH GĂNG TAY THẬT TRÊN MÀN HÌNH CANVASS ĐỐI THỦ
    const drawRealImageGlove = (handPt, isRight) => {
        ctx.save(); ctx.translate(handPt.x, handPt.y); 
        ctx.scale(handPt.z, handPt.z); // Phóng to găng tay theo trục chiều sâu Z
        
        if (window.enemyGloveImg && window.enemyGloveImg.complete && window.enemyGloveImg.naturalWidth > 0) {
            let gSize = 58; // Tỷ lệ găng tay Chibi bự lực
            if (isRight) ctx.scale(-1, 1); // Lật ngược găng tay bên phải cho đối xứng cấu trúc ảnh
            ctx.drawImage(window.enemyGloveImg, -gSize/2, -gSize/2, gSize, gSize);
        } else {
            // Hệ thống dự phòng hình tròn neon nếu ảnh bị lỗi mạng
            ctx.shadowBlur = 15; ctx.shadowColor = jerseyColor; ctx.fillStyle = jerseyColor;
            ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    };

    if (!isTrail) { 
        drawRealImageGlove(handL, false); 
        drawRealImageGlove(handR, true); 
    }
    
    ctx.restore();
};

window.assignDrawMethods = function(statsObj) { };
