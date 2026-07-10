// ==========================================
// CHAR_NEYMAR.JS - CHIBI CARTOON EDITION
// [SỬ DỤNG HỆ THỐNG RENDER TỰ ĐỘNG TỪ GRAPHICS_V3]
// ==========================================

if (!window.cr7Balls) window.cr7Balls = [];

window.currentLoadedChar = {
    id: "neymar", 
    className: "Neymar Jr", 
    hp: 950,           // Máu thấp hơn Messi một chút
    speed: 10.5,       // Nhưng tốc độ di chuyển và lách né cực kỳ nhanh!
    dmgMod: 1.3, 
    color: "#f1c40f",  // Màu chủ đạo: Vàng
    
    // ẢNH ĐẠI DIỆN VÀ GĂNG TAY
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Neymar&hairColor=black", // Bạn có thể tự thay link ảnh thật của Neymar vào đây
    gloveUrl: "https://cdn-icons-png.flaticon.com/512/8145/8145451.png", // 🌟 GĂNG TAY BOXING MÀU TRẮNG BẠC CHUYÊN NGHIỆP

    // ==========================================
    // 🌟 KHAI BÁO THÔNG SỐ NGOẠI HÌNH (ENGINE SẼ TỰ VẼ MÀ KHÔNG CẦN CODE DRAW CŨ)
    // ==========================================
    bodyType: "lean",          // Thể hình: Gầy, săn chắc, lanh lẹ
    isShirtless: false,        // Mặc áo đấu
    skinColor: "#cd6133",      // Da ngăm Nam Mỹ
    hasTattoos: true,          // 🌟 CÓ HÌNH XĂM KÍN CÁNH TAY
    
    // TRANG PHỤC BRAZIL
    jerseyColor: "#f1c40f",    // Áo Vàng
    jerseyNumber: "10",        // Số 10 Brazil
    pantsType: "boxing",       // Quần thể thao ngắn
    shortsColor: "#2980b9",    // Quần Xanh dương lơ
    socksColor: "#ffffff",     // Tất Trắng
    shoesColor: "#27ae60",     // Giày Xanh lá cây
    
    auraType: "lightning",     // 🌟 Hào quang Sấm sét (Tốc độ)

    // ==========================================
    // TUNG TUYỆT CHIÊU: GẮP BÓNG CẦU VỒNG
    // ==========================================
    executeUltimate: function(caster, target, baseDmg) {
        caster.state = 'dash_back'; 
        caster.attackTimer = 60; 
        window.enemyZ = 250; // Lùi ra xa lấy đà
        
        if (typeof window.playSound === 'function') window.playSound(300, 'sawtooth', 0.2, 0.3);
        if (typeof window.floatingTexts !== 'undefined') {
            window.floatingTexts.push({ x: window.canvas.width/2, y: window.canvas.height/2 - 120, text: "🌟 JOGA BONITO!", color: "#f1c40f", alpha: 1, vx: 0, vy: -1, font: "italic 900 45px Arial", life: 60 });
        }

        // Tung bóng chớp nhoáng
        setTimeout(() => {
            if (window.gameOver || caster.hp <= 0) return;
            caster.state = 'high_kick'; // Dùng dáng đá cao
            window.enemyZ -= 40; // Đạp trụ lướt tới
            
            if (typeof window.playSound === 'function') window.playSound(200, 'square', 0.2, 0.5, true);
            if (typeof window.shakeScreen === 'function') window.shakeScreen(15, 8);

            // Bắn bóng màu Vàng Trắng với tốc độ xé gió
            window.cr7Balls.push({ 
                z: window.enemyZ, 
                offsetX: (Math.random() - 0.5) * 60, 
                speed: 15, // Bóng bay nhanh hơn của Messi
                radius: 18, 
                hasHit: false, 
                dmg: baseDmg * 1.4, 
                rotation: 0 
            });
        }, 350); 
        
        // Trở về thế thủ
        setTimeout(() => { 
            if (window.gameOver || caster.hp <= 0) return; 
            caster.state = 'idle'; 
            caster.attackTimer = 0; 
            window.enemyZ = 120; 
        }, 900);
    }
    // 🌟 KHÔNG CẦN HÀM drawMethod NỮA! Quá nhàn!
};

// Đăng ký Neymar vào hệ thống Tướng
if (!window.classStats) window.classStats = {}; 
window.classStats["neymar"] = window.currentLoadedChar;
