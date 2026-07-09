// ==========================================
// CHAR_MESSI.JS - FIRST PERSON 3D EDITION
// [ÁO ARGENTINA 3D - BÓNG BAY XUYÊN MÀN HÌNH THEO TRỤC Z]
// ==========================================

// KHỞI TẠO KHO CHỨA BÓNG 3D
if (!window.cr7Balls) window.cr7Balls = [];

// ==========================================
// [HACK ENGINE] TÍCH HỢP QUẢ BÓNG 3D VÀO GAME LOOP
// ==========================================
if (!window.cr7Hooked) {
    let oldUpdate = window.update;
    window.update = function() {
        if (typeof oldUpdate === 'function') oldUpdate();
        
        if (window.matchTimer === 1) window.cr7Balls = [];
        if (window.isCinematicActive || !window.playerFPS) return;

        // VẬT LÝ BÓNG BAY THEO TRỤC Z (LAO VÀO MÀN HÌNH)
        if (window.cr7Balls && window.cr7Balls.length > 0) {
            for (let i = window.cr7Balls.length - 1; i >= 0; i--) {
                let ball = window.cr7Balls[i];
                ball.z -= ball.speed; // Bóng lao về phía Z = 0 (Màn hình người chơi)
                ball.rotation += 0.5;

                // XÉT VA CHẠM: BÓNG BAY ĐẾN MẶT BẠN (Z <= 20)
                if (ball.z <= 20 && !ball.hasHit) {
                    ball.hasHit = true;
                    
                    // Nếu bạn NÉ thành công
                    if (window.playerFPS.isDodging) {
                        window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 - 80, text: "💨 NÉ BÓNG THÀNH CÔNG!", color: "#2ecc71", alpha: 1, vx: 0, vy: -2, font: "900 30px Arial", life: 40 });
                        window.playSound(200, 'sine', 0.2, 0.4);
                    } 
                    // Nếu bị trúng bóng
                    else {
                        let damage = ball.dmg;
                        if (window.playerFPS.isBlocking) {
                            damage = Math.floor(damage * 0.3); // Đỡ đòn giảm 70% sát thương
                            window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 - 80, text: "🛡️ CHẶN BÓNG!", color: "#00f3ff", alpha: 1, vx: 0, vy: -2, font: "900 30px Arial", life: 40 });
                            window.playSound(600, 'triangle', 0.2, 0.5, true);
                        } else {
                            // Vỡ mặt kính
                            let crack = document.getElementById("screen-crack");
                            if(crack) { crack.style.opacity = 1; setTimeout(() => crack.style.opacity = 0, 300); }
                            window.playSound(150, 'square', 0.3, 0.8, true);
                        }

                        window.playerFPS.hp -= damage;
                        window.shakeScreen(20, 15);
                        
                        if (window.playerFPS.hp <= 0) {
                            window.playerFPS.hp = 0; window.gameOver = true; window.matchResolved = true;
                            window.koGlitchTimer = 60;
                            window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2, text: "K.O! BÓNG VÀO MẶT!", color: "#ff4757", alpha: 1, vx: 0, vy: -1, font: "900 50px Arial", life: 180 });
                        }

                        let hpRed = document.getElementById("hp-red");
                        if(hpRed) hpRed.style.width = Math.max(0, (window.playerFPS.hp / window.playerFPS.maxHp * 100)) + "%";
                    }
                }
                
                // Bóng bay qua lưng bạn thì xóa đi
                if (ball.z < -100) {
                    window.cr7Balls.splice(i, 1);
                }
            }
        }
    };

    let oldDraw = window.draw;
    window.draw = function() {
        if (typeof oldDraw === 'function') oldDraw();
        
        // VẼ QUẢ BÓNG 3D
        if (window.cr7Balls && window.cr7Balls.length > 0 && window.ctx && window.canvas) {
            window.ctx.save();
            window.cr7Balls.forEach(ball => {
                if (ball.z < 0 && ball.hasHit) return; // Không vẽ nữa nếu đã đập vào mặt
                
                window.ctx.save();
                // Phối cảnh 3D: Z càng nhỏ (gần) thì quả bóng càng to
                let scale = 300 / (200 + Math.max(0, ball.z));
                let renderY = window.GROUND_Y - 20 + (100 - ball.z) * 0.5;

                window.ctx.translate(window.canvas.width/2 + ball.offsetX * scale, renderY);
                window.ctx.scale(scale, scale);
                window.ctx.rotate(ball.rotation);

                window.ctx.shadowBlur = 15; window.ctx.shadowColor = "#00f3ff";
                window.ctx.fillStyle = "#fff"; 
                window.ctx.beginPath(); window.ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); 
                window.ctx.fill(); window.ctx.lineWidth = 2; window.ctx.strokeStyle = "#111"; window.ctx.stroke();
                
                // Họa tiết quả bóng
                window.ctx.fillStyle = "#111"; window.ctx.shadowBlur = 0;
                window.ctx.beginPath(); window.ctx.arc(0, 0, ball.radius * 0.4, 0, Math.PI * 2); window.ctx.fill();
                window.ctx.fillRect(-ball.radius*0.8, -2, ball.radius*1.6, 4);
                window.ctx.fillRect(-2, -ball.radius*0.8, 4, ball.radius*1.6);
                
                window.ctx.restore();
            });
            window.ctx.restore();
        }
    };
    window.cr7Hooked = true;
}

// ==========================================
// THÔNG SỐ VÀ KỸ NĂNG NHÂN VẬT MESSI
// ==========================================
window.currentLoadedChar = {
    id: "messi",
    className: "Messi",
    hp: 1000, 
    speed: 9.0, // Chạy cực nhanh
    dmgMod: 1.4, 
    color: "#0984e3",
    scale: 0.9, 
    avatarUrl: "https://i.ibb.co/GvCyKPj7/Generated-Image-July-05-2026-9-20-PM.jpg",
    
    // ĐÁNH THƯỜNG (Dành cho góc nhìn ngang cũ, FPS Engine sẽ bỏ qua phần này)
    executeBasicAttack: function(caster, enemies) {},

    // ==========================================
    // TUYỆT CHIÊU 3D CỦA MESSI: LÙI LẠI VÀ SÚT BÓNG THẲNG VÀO MÀN HÌNH!
    // ==========================================
    executeUltimate: function(caster, target, baseDmg) {
        // Bước 1: Lùi tít về phía sau võ đài (Z tăng lên)
        caster.state = 'dash_back'; 
        caster.attackTimer = 60; 
        window.enemyZ = 250; // Kéo giãn khoảng cách ra cực xa
        
        if (typeof window.playSound === 'function') window.playSound(250, 'sawtooth', 0.2, 0.3);
        
        if (typeof window.floatingTexts !== 'undefined') {
            window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 - 120, text: "⚽ ANKARA MESSI!", color: "#0984e3", alpha: 1, vx: 0, vy: -1, font: "900 40px Arial", life: 60 });
        }

        // Bước 2: Chạy đà và Sút bóng
        setTimeout(() => {
            if (window.gameOver || caster.hp <= 0) return;
            
            caster.state = 'kick'; // Vung chân sút
            window.enemyZ -= 30; // Tiến nhẹ lên lúc sút
            
            if (typeof window.playSound === 'function') window.playSound(180, 'square', 0.2, 0.5, true);
            if (typeof window.shakeScreen === 'function') window.shakeScreen(15, 8);

            // TẠO QUẢ BÓNG 3D LAO TỚI MÀN HÌNH NGƯỜI CHƠI
            window.cr7Balls.push({
                z: window.enemyZ, // Xuất phát từ vị trí của Messi
                offsetX: (Math.random() - 0.5) * 50, // Hơi lệch trái phải tạo độ xoáy
                speed: 12, // Tốc độ bóng bay vào camera
                radius: 18, 
                hasHit: false, 
                dmg: baseDmg * 1.5, // Cú sút sát thương cực mạnh
                rotation: 0
            });
        }, 400); 
        
        // Bước 3: Trở về trạng thái thủ thế FPS
        setTimeout(() => {
            if (window.gameOver || caster.hp <= 0) return;
            caster.state = 'idle';
            caster.attackTimer = 0;
            window.enemyZ = 120; // Trở lại khoảng cách giao tranh bình thường
        }, 1000);
    },
    
    // ==========================================
    // VẼ NHÂN VẬT 3D (Áo Sọc Xanh Trắng Đổ Khối)
    // ==========================================
    drawMethod: function(ctx, p, bounce, ext, pext, isTrail) {
        // LẤY KHUNG XƯƠNG ĐỐI MẶT TỪ GRAPHICS_V3
        let pts = typeof window.drawBaseLimbFPS === 'function' ? window.drawBaseLimbFPS(p) : window.drawBaseLimb(ctx, p, bounce, ext, pext, isTrail);
        let {head, neck, pelvis, shoulderL, shoulderR, footL, kneeL, footR, kneeR, handL, elbowL, handR, elbowR} = pts;
        
        const drawLine = (start, end, width) => { ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke(); };

        // 1. VẼ THÂN 3D (ÁO ARGENTINA)
        ctx.fillStyle = "#ffffff"; // Nền áo trắng
        ctx.beginPath();
        ctx.moveTo(shoulderL.x, shoulderL.y); 
        ctx.lineTo(shoulderR.x, shoulderR.y); 
        ctx.lineTo(pelvis.x + 15, pelvis.y); 
        ctx.lineTo(pelvis.x - 15, pelvis.y);
        ctx.closePath();
        ctx.fill(); 
        
        // Vẽ sọc xanh dương cờ Argentina
        ctx.fillStyle = "#74b9ff";
        ctx.beginPath(); ctx.moveTo(shoulderL.x + 15, shoulderL.y); ctx.lineTo(shoulderL.x + 25, shoulderL.y); ctx.lineTo(pelvis.x + 5, pelvis.y); ctx.lineTo(pelvis.x - 5, pelvis.y); ctx.fill();
        ctx.beginPath(); ctx.moveTo(shoulderR.x - 25, shoulderR.y); ctx.lineTo(shoulderR.x - 15, shoulderR.y); ctx.lineTo(pelvis.x + 10, pelvis.y); ctx.lineTo(pelvis.x, pelvis.y); ctx.fill();
        
        // Viền áo giáp
        ctx.lineWidth = 3; ctx.strokeStyle = "#111"; ctx.stroke(); 

        // 2. VẼ CHÂN (QUẦN ĐEN TẤT TRẮNG, GIÀY VÀNG)
        ctx.strokeStyle = "#111"; // Quần đen
        drawLine(pelvis, kneeL, 8); drawLine(pelvis, kneeR, 8); 
        
        ctx.strokeStyle = "#ecf0f1"; // Tất trắng
        drawLine(kneeL, footL, 6); drawLine(kneeR, footR, 6);

        // Giày Vàng
        ctx.fillStyle = "#f1c40f"; ctx.strokeStyle = "#d35400"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(footL.x, footL.y, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(footR.x, footR.y, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();

        // 3. VẼ TAY (HÌNH XĂM & TAY ÁO)
        ctx.strokeStyle = "#74b9ff"; // Tay áo
        drawLine(shoulderL, elbowL, 7); drawLine(shoulderR, elbowR, 7); 
        
        ctx.strokeStyle = "#ffeaa7"; // Da người
        drawLine(elbowL, handL, 5 * (handL.z || 1)); 
        drawLine(elbowR, handR, 5 * (handR.z || 1)); 

        // 4. VẼ GĂNG TAY BOXING FPS (PHÓNG TO KHI ĐẤM MÀN HÌNH)
        const drawGlove = (handPt, color) => {
            ctx.save();
            ctx.translate(handPt.x, handPt.y);
            ctx.scale(handPt.z || 1, handPt.z || 1); // Cực kỳ quan trọng: Phóng to Z
            
            ctx.shadowBlur = 10; ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill(); // Găng
            ctx.fillStyle = "#111"; 
            ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill(); // Lõi găng
            ctx.restore();
        };

        if (!isTrail) {
            drawGlove(handL, "#0984e3"); // Găng tay trái màu xanh
            drawGlove(handR, "#ff4757"); // Găng tay phải màu đỏ
        }
        
        // (Lưu ý: Không vẽ Đầu/Tóc ở đây vì engine main_v3.js sẽ tự động lấy avatarUrl cắt tròn và dán thẳng đè lên tọa độ cổ!)
    }
};

if (!window.classStats) window.classStats = {};
window.classStats["messi"] = window.currentLoadedChar;
