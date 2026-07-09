// ==========================================
// GRAPHICS.JS - FIRST PERSON BOXING EDITION
// [TÍCH HỢP: VÕ ĐÀI 3D, KHÁN GIẢ, VÀ KHUNG XƯƠNG ĐỐI MẶT TRỰC DIỆN]
// ==========================================

// ==========================================
// 1. VẼ KHUNG CẢNH VÕ ĐÀI 3D VÀ KHÁN GIẢ
// ==========================================
window.drawBoxingRing = function(ctx, canvasWidth, canvasHeight) {
    let t = Date.now() / 1000;

    // 1. Nền khán giả (Đen mờ ảo)
    ctx.fillStyle = "#05050a";
    ctx.fillRect(-canvasWidth, -canvasHeight, canvasWidth * 3, canvasHeight * 3);

    // 2. Ánh đèn Spotlight chiếu từ trên cao xuống giữa sàn
    let spotLight = ctx.createRadialGradient(canvasWidth/2, 50, 0, canvasWidth/2, canvasHeight - 100, 600);
    spotLight.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    spotLight.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spotLight;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 3. Khán giả & Flash máy ảnh (Nhấp nháy ngẫu nhiên)
    ctx.save();
    for (let i = 0; i < 60; i++) {
        let flashX = Math.random() * canvasWidth;
        let flashY = Math.random() * (canvasHeight / 2 - 50);
        let alpha = Math.random() > 0.98 ? Math.random() : 0.05; // Lâu lâu lóe sáng 1 cái
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath(); ctx.arc(flashX, flashY, Math.random() * 3 + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // 4. Sàn đấu Boxing 3D (Điểm tụ ở giữa màn hình)
    let groundY = window.GROUND_Y || 320;
    let vanishY = groundY - 80; // Điểm tụ chân trời
    
    // Mặt sàn võ đài
    ctx.fillStyle = "#1e272e"; // Màu xám xanh của bạt boxing
    ctx.beginPath();
    ctx.moveTo(-200, canvasHeight); // Góc trái dưới
    ctx.lineTo(canvasWidth + 200, canvasHeight); // Góc phải dưới
    ctx.lineTo(canvasWidth - 150, vanishY); // Góc phải trên
    ctx.lineTo(150, vanishY); // Góc trái trên
    ctx.fill();

    // Logo giữa sàn (Mờ ảo)
    ctx.save();
    ctx.translate(canvasWidth/2, groundY);
    ctx.scale(1, 0.3); // Ép dẹp logo theo góc nhìn 3D
    ctx.globalAlpha = 0.1;
    ctx.font = "900 120px Impact"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText("FIGHTER", 0, 0);
    ctx.restore();

    // 5. Dây đài và Cột góc (Ring Ropes & Corners)
    ctx.lineWidth = 3;
    let ropeColors = ["#ff4757", "#ffffff", "#ff4757"]; // Đỏ - Trắng - Đỏ
    
    // Cột góc trái và phải phía xa
    ctx.fillStyle = "#333";
    ctx.fillRect(140, vanishY - 120, 20, 120);
    ctx.fillRect(canvasWidth - 160, vanishY - 120, 20, 120);

    // Vẽ 3 tầng dây đài
    for (let i = 0; i < 3; i++) {
        let yOffsetFar = vanishY - 30 - (i * 30);
        let yOffsetNear = canvasHeight - 100 - (i * 80);
        
        ctx.strokeStyle = ropeColors[i];
        
        // Dây bên trái
        ctx.beginPath(); ctx.moveTo(-50, yOffsetNear); ctx.lineTo(150, yOffsetFar); ctx.stroke();
        // Dây bên phải
        ctx.beginPath(); ctx.moveTo(canvasWidth + 50, yOffsetNear); ctx.lineTo(canvasWidth - 150, yOffsetFar); ctx.stroke();
        // Dây ngang phía sau lưng đối thủ
        ctx.beginPath(); ctx.moveTo(150, yOffsetFar); ctx.lineTo(canvasWidth - 150, yOffsetFar); ctx.stroke();
    }
};

// ==========================================
// 2. KHUNG XƯƠNG ĐỐI MẶT TRỰC DIỆN (FPS SKELETON)
// ==========================================
window.drawBaseLimbFPS = function(p) {
    let bounce = (p.state === 'walk') ? Math.sin(Date.now() / 150) * 5 : Math.sin(Date.now() / 300) * 3; // Nhún nhảy thủ thế
    
    // Trục trung tâm
    let head = { x: 0, y: -130 + bounce, z: 1 }; 
    let neck = { x: 0, y: -90 + bounce, z: 1 }; 
    let pelvis = { x: 0, y: -20 + bounce, z: 1 };
    
    // Vai bè ra 2 bên (Nhìn trực diện)
    let shoulderL = { x: -35, y: -90 + bounce };
    let shoulderR = { x: 35, y: -90 + bounce };

    // Chân đứng giang rộng
    let footL = { x: -40, y: 0, z: 1 }; 
    let kneeL = { x: -45, y: -10 + bounce, z: 1 }; 
    let footR = { x: 40, y: 0, z: 1 }; 
    let kneeR = { x: 45, y: -10 + bounce, z: 1 };
    
    // Tay thủ thế che mặt (Boxing Guard)
    let handL = { x: -25, y: -110 + bounce, z: 1 }; // z = 1 là kích thước bình thường
    let elbowL = { x: -45, y: -60 + bounce, z: 1 }; 
    let handR = { x: 25, y: -110 + bounce, z: 1 }; 
    let elbowR = { x: 45, y: -60 + bounce, z: 1 };

    // --- TÍNH TOÁN CÚ ĐẤM LAO VÀO MÀN HÌNH (3D PUNCH) ---
    let maxT = p.maxT || 25;
    let progress = (p.attackTimer > 0) ? 1 - (p.attackTimer / maxT) : 0;
    
    // Tạo gia tốc (Easing) để cú đấm giật mạnh
    let ext = 0;
    if (progress > 0) {
        if (progress < 0.4) ext = Math.sin((progress / 0.4) * (Math.PI / 2)); // Tung đòn ra
        else ext = 1 - Math.pow((progress - 0.4) / 0.6, 2); // Rút tay về
    }

    if (p.state === 'punch' || p.state === 'jab' || p.state === 'cross') {
        // Tay phải đấm thẳng vào camera
        handR.x -= 25 * ext; // Đưa tay vào giữa màn hình
        handR.y += 40 * ext; // Hạ trọng tâm tay
        handR.z = 1 + (ext * 4.5); // SCALE KHỔNG LỒ (Gấp 4.5 lần) lao vào mặt người chơi
        
        shoulderR.x += 10 * ext;
        head.x = -15 * ext; // Nghiêng đầu tránh đòn khi đấm
        pelvis.x = -5 * ext;
    } 
    else if (p.state === 'hook' || p.state === 'high_kick' || p.state === 'uppercut') {
        // Tay trái móc ngang
        handL.x += 60 * ext; 
        handL.y -= 20 * ext;
        handL.z = 1 + (ext * 3.5); 
        
        shoulderL.x -= 10 * ext;
        head.x = 20 * ext;
    }
    else if (p.state === 'hurt') {
        // Bị đấm trúng mặt -> Đầu ngửa ra sau, tay buông thõng
        head.y -= 20; head.x = (Math.random() - 0.5) * 10;
        neck.y -= 10;
        handL.y = -40; handL.x = -50;
        handR.y = -40; handR.x = 50;
    }
    else if (p.state === 'dash' || p.state === 'dash_back') {
        // Lách người sang 2 bên
        let lean = p.state === 'dash' ? 40 : -40;
        head.x = lean; neck.x = lean * 0.8; pelvis.x = lean * 0.4;
        handL.x += lean; handR.x += lean;
    }
    else if (p.state === 'ko_falling' || p.state === 'dead') {
        // Gục ngã xuống sàn
        head.y = -20; head.x = 30; neck.y = -15; pelvis.y = -5;
        handL.y = 0; handL.x = -60;
        handR.y = 0; handR.x = 60;
        kneeL.y = 0; kneeR.y = 0;
    }

    return { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR };
};

// ==========================================
// 3. VẼ ĐỐI THỦ CHUẨN FPS (STICKMAN 3D)
// ==========================================
window.drawStickman = function(ctx, p, isTrail = false) {
    if(!p || isNaN(p.x) || isNaN(p.y)) return; 
    ctx.save(); 
    
    // Di chuyển tới vị trí đối thủ
    ctx.translate(p.x, p.y); 

    // Lấy khung xương 3D trực diện
    let pts = window.drawBaseLimbFPS(p);
    let { head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR } = pts;

    // --- BÓNG ĐỔ TRÊN SÀN ---
    if (!isTrail && p.hp > 0 && p.state !== 'ko_falling') {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath(); ctx.ellipse(0, 0, 45, 10, 0, 0, Math.PI*2); ctx.fill();
    }

    // --- CÀI ĐẶT NÉT VẼ ---
    ctx.strokeStyle = "#fff"; 
    ctx.shadowBlur = p.iFrames > 0 ? 20 : 10; 
    ctx.shadowColor = p.iFrames > 0 ? "#fff" : (p.color || "#ff003c"); 
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    const drawLine = (start, end, width) => { 
        ctx.lineWidth = width; 
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke(); 
    };

    // --- VẼ CƠ THỂ BẰNG ĐA GIÁC (TORSO) ĐỂ TẠO KHỐI ---
    ctx.fillStyle = "#1a1a2e"; // Màu áo giáp xám đen
    ctx.beginPath();
    ctx.moveTo(shoulderL.x, shoulderL.y); 
    ctx.lineTo(shoulderR.x, shoulderR.y); 
    ctx.lineTo(pelvis.x + 15, pelvis.y); 
    ctx.lineTo(pelvis.x - 15, pelvis.y);
    ctx.closePath();
    ctx.fill(); 
    ctx.lineWidth = 4; ctx.stroke(); 

    // --- VẼ CHÂN ---
    drawLine(pelvis, kneeL, 7); drawLine(kneeL, footL, 5);
    drawLine(pelvis, kneeR, 7); drawLine(kneeR, footR, 5);

    // --- VẼ TAY TRƯỚC (CÓ CHIỀU SÂU Z) ---
    // Vai -> Cùi chỏ -> Găng tay
    drawLine(shoulderL, elbowL, 6); 
    drawLine(elbowL, handL, 5 * handL.z); // Tay to dần nếu phóng tới

    drawLine(shoulderR, elbowR, 6); 
    drawLine(elbowR, handR, 5 * handR.z); 

    // --- VẼ KHUÔN MẶT THẬT (FACE MASK) ---
    let faceSize = 75; // Đầu to hơn bản cũ để nhìn rõ mặt
    if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip(); // Cắt thành hình tròn
        
        ctx.drawImage(window.enemyFaceImg, head.x - faceSize/2, head.y - faceSize/2, faceSize, faceSize);
        ctx.restore();
        
        // Viền đỏ/xám bo quanh mặt
        ctx.beginPath();
        ctx.arc(head.x, head.y, faceSize/2, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = p.hp > 0 ? (p.color || "#ff003c") : "#555";
        ctx.stroke();
    } else {
        // Fallback nếu ảnh lỗi: Vẽ đầu tròn neon
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(head.x, head.y
