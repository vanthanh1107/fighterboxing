// ==========================================
// MAIN.JS - FIRST-PERSON BRAWLER EDITION
// [TÍCH HỢP: KHÔNG GIAN 3D TRỤC Z & DÁN MẶT NHÂN VẬT THẬT]
// ==========================================

window.BGM_BASE_POOL = [
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/A_Slipping_Glimpse_-_Nihilore.mp3",
    "https://upload.wikimedia.org/wikipedia/commons/c/c2/The_Descent_-_Kevin_MacLeod.mp3"
];

window.loadedCharacters = {}; 
window.enemyZ = 100; // Trục Z: 100 là xa, 0 là sát mặt
window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, isDodging: false, isBlocking: false, attackCooldown: 0 };
window.enemyFaceImg = new Image(); // Biến lưu trữ khuôn mặt đối thủ

// ==========================================
// 1. CHỌN TƯỚNG VÀ LOAD MẶT NHÂN VẬT (FACE PRELOAD)
// ==========================================
window.loadCharacterDynamic = function(charId) {
    return new Promise((resolve) => {
        if (window.classStats && window.classStats[charId]) {
            window.loadedCharacters[charId] = window.classStats[charId];
            return resolve(window.classStats[charId]);
        }
        console.warn("⚠️ Lỗi: Không tìm thấy dữ liệu của " + charId);
        resolve(null);
    });
};

window.initGame = async function() {
    if (!window.classStats) window.classStats = {};
    for (let id in window.classStats) {
        if (!window.classStats[id].hp) window.classStats[id].hp = 1000;
        if (!window.classStats[id].speed) window.classStats[id].speed = 5;
    }
    window.renderCharacterGrid(); 
}

window.renderCharacterGrid = function() {
    const carousel = document.getElementById("character-carousel"); if(!carousel) return; carousel.innerHTML = ""; let firstCardId = null;
    
    for (let id in window.classStats) {
        let item = window.classStats[id]; let card = document.createElement("div"); card.className = "char-card"; 
        card.innerHTML = `<div class="char-avatar"><img src="${item.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/png?seed=error'}"></div><div class="char-name">${item.className || 'Unknown'}</div>`;
        
        card.onclick = async () => { 
            window.selectedRedClass = id; document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected')); card.classList.add('selected'); 
            let desc = document.getElementById("desc-red");
            await window.loadCharacterDynamic(id);
            let activeItem = window.classStats[id];
            
            // Tải trước mặt nhân vật để lúc vào game dán lên cổ Stickman
            window.enemyFaceImg.crossOrigin = "Anonymous";
            window.enemyFaceImg.src = activeItem.avatarUrl;

            if(desc) desc.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px; text-align: left;">
                    <span style="font-size:24px; color:#f1c40f; font-weight:900; text-transform: uppercase;">${activeItem.className}</span>
                    <span style="color:#fff;">❤️ Máu: <strong style="color:#ff4757;">${activeItem.hp || 1000}</strong></span>
                    <span style="color:#fff;">💨 Tốc độ rê: <strong style="color:#3498db;">${activeItem.speed || 5}</strong></span>
                    <span style="color:#fff;">⚠️ Cảnh báo: Sẽ áp sát đấm bạn!</span>
                </div>`; 
            
            // Preview tạm thời ngoài menu
            window.startPreviewLoop(activeItem);
        };
        carousel.appendChild(card); if (!firstCardId) { firstCardId = id; }
    }
    if(!window.selectedRedClass && firstCardId) { let firstCard = carousel.querySelector(`.char-card`); if(firstCard) firstCard.click(); }
}

window.backToMenu = function() { 
    if (typeof window.stopRecording === 'function') window.stopRecording();
    let game = document.getElementById("game-screen"); if(game) game.style.display = "none"; 
    let sel = document.getElementById("selection-screen"); if(sel) sel.style.display = "block"; 
    window.gameOver = true; window.isLoopRunning = false; 
    if(window.selectedRedClass && window.classStats) window.startPreviewLoop(window.classStats[window.selectedRedClass]);
}

window.startGame = async function() { 
    if(!window.selectedRedClass) return;
    window.isPreviewRunning = false; 
    if (window.previewAnimId) cancelAnimationFrame(window.previewAnimId);
    
    let sel = document.getElementById("selection-screen"); if(sel) sel.style.display = "none"; 
    let game = document.getElementById("game-screen"); if(game) game.style.display = "block"; 
    
    // Phát nhạc
    if (window.bgmBase) { window.bgmBase.pause(); }
    window.bgmBase = new Audio(window.BGM_BASE_POOL[Math.floor(Math.random() * window.BGM_BASE_POOL.length)]);
    window.bgmBase.loop = true; window.bgmBase.volume = 0.3; window.bgmBase.play().catch(e=>{});

    await window.matchStartFPS(); 
    if (!window.isLoopRunning) { window.isLoopRunning = true; requestAnimationFrame(window.gameLoopFPS); } 
}

// ==========================================
// 2. KHỞI TẠO TRẬN CHIẾN FPS VÀ AI ĐỐI THỦ
// ==========================================
window.matchStartFPS = async function() {
    window.gameOver = false;
    window.matchResolved = false;
    window.enemyZ = 120; // Bắt đầu ở xa
    window.playerFPS = { hp: 1000, maxHp: 1000, stamina: 100, isDodging: false, isBlocking: false, attackCooldown: 0 };
    
    let s2 = window.classStats[window.selectedRedClass];
    let eHp = s2.hp || 1000;
    
    // Khởi tạo Kẻ địch ở chính giữa màn hình
    window.enemies = [{ 
        id: "enemy_fps", classId: window.selectedRedClass, isPlayer: false, 
        x: 400, y: window.GROUND_Y, // Cố định X ở giữa, chỉ đổi Z
        vx: 0, vy: 0, speed: s2.speed || 5, 
        color: s2.color || "#ff003c", hp: eHp, maxHp: eHp, dmgMod: s2.dmgMod || 1, scale: s2.scale || 1, 
        onGround: true, isFacingRight: false, state: 'idle', attackTimer: 0, hitStun: 0, 
        className: s2.className, avatarUrl: s2.avatarUrl,
        drawMethod: s2.drawMethod
    }];
    
    // Cập nhật tên lên HUD
    let nb = document.getElementById("name-display-blue");
    if(nb) nb.innerText = "🤖 " + s2.className;
    
    if (typeof window.startRecording === 'function') window.startRecording();
}

// ==========================================
// 3. ĐIỀU KHIỂN CỦA NGƯỜI CHƠI (BẠN)
// ==========================================
window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0 || window.gameOver || window.playerFPS.isDodging || window.playerFPS.isBlocking) return;
    window.playerFPS.attackCooldown = 15;
    window.playerFPS.stamina -= 10;
    
    // Kích hoạt CSS Animation cho găng tay
    let glove = document.getElementById(hand + "-glove");
    if(glove) {
        glove.classList.add(`glove-punch-${hand}`);
        setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150);
    }
    
    if(typeof window.playSound === 'function') window.playSound(350, 'sine', 0.1, 0.3);

    let e = window.enemies[0];
    // Kiểm tra trúng đòn: Kẻ địch phải ở đủ gần (Z < 50) và đang không né
    if (e && e.hp > 0 && window.enemyZ < 55) {
        let isCrit = Math.random() < 0.2;
        let dmg = 45 * (isCrit ? 2 : 1);
        
        e.hp -= dmg;
        e.state = 'hurt';
        e.hitStun = 20;
        e.attackTimer = 0; // Ngắt đòn đánh của địch
        window.enemyZ += 20; // Bị đấm văng ra xa một chút
        
        // Hiệu ứng máu & Rung màn hình
        if(typeof window.shakeScreen === 'function') window.shakeScreen(isCrit ? 15 : 8, isCrit ? 10 : 5);
        if(typeof window.spawnParticles === 'function') window.spawnParticles(e.x, e.y - 60, "#ff003c", isCrit);
        
        window.floatingTexts.push({ x: e.x + (Math.random()*40-20), y: e.y - 120, text: isCrit ? `💥 -${dmg}` : `-${dmg}`, color: isCrit ? "#ff4757" : "#fff", alpha: 1, vx: 0, vy: -3, font: "900 35px Arial", life: 40 });
        
        if (e.hp <= 0) {
            e.hp = 0; e.state = 'ko_falling'; e.koTimer = 100; e.vy = -10;
            window.matchResolved = true; window.gameOver = true;
            window.floatingTexts.push({ x: 400, y: 200, text: "K.O! BẠN ĐÃ THẮNG!", color: "#f1c40f", alpha: 1, vx: 0, vy: -1, font: "900 60px Arial", life: 180 });
        }
    }
};

window.blockFPS = function() {
    if (window.playerFPS.stamina < 15 || window.gameOver) return;
    window.playerFPS.isBlocking = true;
    document.getElementById("left-glove").classList.add("glove-block-left");
    document.getElementById("right-glove").classList.add("glove-block-right");
    
    // Gắn sự kiện nhả chuột/thả tay để hạ khiên
    const releaseBlock = () => {
        window.playerFPS.isBlocking = false;
        document.getElementById("left-glove").classList.remove("glove-block-left");
        document.getElementById("right-glove").classList.remove("glove-block-right");
        document.removeEventListener('mouseup', releaseBlock);
        document.removeEventListener('touchend', releaseBlock);
    };
    document.addEventListener('mouseup', releaseBlock);
    document.addEventListener('touchend', releaseBlock);
};

window.dodgeFPS = function() {
    if (window.playerFPS.stamina < 20 || window.playerFPS.isDodging || window.gameOver) return;
    window.playerFPS.isDodging = true;
    window.playerFPS.stamina -= 20;
    
    let dir = Math.random() > 0.5 ? "left" : "right";
    let canvasWrap = document.querySelector(".canvas-wrapper");
    if(canvasWrap) canvasWrap.classList.add(`camera-dodge-${dir}`);
    
    if(typeof window.playSound === 'function') window.playSound(200, 'sine', 0.2, 0.4);

    setTimeout(() => {
        window.playerFPS.isDodging = false;
        if(canvasWrap) canvasWrap.classList.remove(`camera-dodge-${dir}`);
    }, 350);
};

// ==========================================
// 4. VÒNG LẶP FPS TRUNG TÂM (AI Địch & Render 3D)
// ==========================================
window.gameLoopFPS = function(timestamp) { 
    if (!window.isLoopRunning) return; requestAnimationFrame(window.gameLoopFPS); 
    
    let e = window.enemies[0];
    if (!e) return;

    // Phục hồi chỉ số người chơi
    if (window.playerFPS.attackCooldown > 0) window.playerFPS.attackCooldown--;
    if (window.playerFPS.stamina < 100 && !window.playerFPS.isBlocking) window.playerFPS.stamina += 0.5;

    // --- LOGIC AI CỦA KẺ ĐỊCH (LAO VÀO ĐẤM MÌNH) ---
    if (!window.gameOver && e.hp > 0 && e.hitStun <= 0) {
        if (e.attackTimer > 0) {
            e.attackTimer--;
            // Đỉnh điểm của cú đấm (Hit Frame)
            if (e.attackTimer === 10) {
                // Kiểm tra xem bạn có Né hoặc Đỡ không
                if (window.playerFPS.isDodging) {
                    window.floatingTexts.push({ x: e.x, y: e.y - 150, text: "MISS!", color: "#bdc3c7", alpha: 1, vx: 0, vy: -2, font: "900 40px Arial", life: 40 });
                } else if (window.playerFPS.isBlocking) {
                    window.playSound(600, 'triangle', 0.2, 0.5, true);
                    window.shakeScreen(5, 3);
                    window.playerFPS.stamina -= 15;
                    window.floatingTexts.push({ x: 400, y: 350, text: "🛡️ BLOCKED", color: "#00f3ff", alpha: 1, vx: 0, vy: -2, font: "900 30px Arial", life: 30 });
                } else {
                    // BẠN BỊ ĐẤM TRÚNG MẶT!
                    window.playerFPS.hp -= (25 * e.dmgMod);
                    window.shakeScreen(20, 15);
                    window.playSound(150, 'square', 0.3, 0.8, true);
                    
                    // Hiện hiệu ứng nứt kính
                    let crack = document.getElementById("screen-crack");
                    if(crack) { crack.style.opacity = 1; setTimeout(() => crack.style.opacity = 0, 300); }
                    
                    if (window.playerFPS.hp <= 0) {
                        window.playerFPS.hp = 0; window.gameOver = true; window.matchResolved = true;
                        window.floatingTexts.push({ x: 400, y: 200, text: "BẠN ĐÃ BỊ HẠ GỤC!", color: "#ff4757", alpha: 1, vx: 0, vy: -1, font: "900 60px Arial", life: 180 });
                    }
                }
            }
        } else {
            // Kẻ địch tiếp cận
            if (window.enemyZ > 20) {
                window.enemyZ -= e.speed * 0.4;
                e.state = 'walk';
                // Đôi khi lách sang 2 bên
                e.x = 400 + Math.sin(Date.now()/300) * (50 + (100 - window.enemyZ)); 
            } else {
                // Đủ gần -> Tung đòn!
                e.state = ['punch', 'kick', 'high_kick', 'uppercut'][Math.floor(Math.random()*4)];
                e.attackTimer = 25; // 15 frame vung tay, 10 frame hit
                window.enemyZ += 5; // Giật lùi nhẹ tạo đà
            }
        }
    }

    if (e.hitStun > 0) e.hitStun--;

    // Rơi tự do nếu bị K.O
    if (e.hp <= 0) {
        if(e.koTimer > 0) e.koTimer--;
        e.vy += 0.8; e.y += e.vy; window.enemyZ += 2; // Rơi xuống và bay xa ra
        if (e.y > window.GROUND_Y) { e.y = window.GROUND_Y; e.vy = 0; e.state = 'dead'; }
    }

    // Cập nhật HUD
    let h1 = document.getElementById("hp-red"), h2 = document.getElementById("hp-blue"), s1 = document.getElementById("stamina-red");
    if(h1) h1.style.width = (window.playerFPS.hp / window.playerFPS.maxHp * 100) + "%";
    if(h2) h2.style.width = (e.hp / e.maxHp * 100) + "%";
    if(s1) s1.style.width = window.playerFPS.stamina + "%";

    // --- RENDER ĐỒ HỌA TRỰC TIẾP ---
    if (window.ctx && window.canvas) {
        window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
        window.ctx.save();

        // Nền võ đài
        window.ctx.fillStyle = "#1a1a2e"; window.ctx.fillRect(0, 0, 800, 500);
        window.ctx.fillStyle = "#0f0f1a"; window.ctx.fillRect(0, window.GROUND_Y, 800, 200);

        // Hiệu ứng rung camera
        if (window.shakeTime > 0) {
            window.ctx.translate((Math.random() - 0.5) * window.shakeMag, (Math.random() - 0.5) * window.shakeMag);
            window.shakeTime--;
        }

        // TÍNH TOÁN 3D Z-SCALE (Tỷ lệ phối cảnh)
        let perspectiveScale = 300 / (200 + window.enemyZ); 
        let renderY = window.GROUND_Y + (100 - window.enemyZ) * 0.5; // Kéo thấp xuống khi lại gần

        window.ctx.translate(e.x, renderY);
        window.ctx.scale(perspectiveScale, perspectiveScale);
        
        let cloneE = Object.assign({}, e, {x: 0, y: 0});
        
        // Vẽ Body Stickman (Giữ nguyên kỹ năng đặc trưng)
        if(cloneE.drawMethod && typeof cloneE.drawMethod === 'function') {
            cloneE.drawMethod(window.ctx, cloneE, 0, 0, 0, false);
        } else if (typeof window.drawStickman === 'function') {
            window.drawStickman(window.ctx, cloneE);
        }

        // 🌟 TÍNH NĂNG "FACE MASK": Dán ảnh thật đè lên đầu Stickman 🌟
        if (window.enemyFaceImg && window.enemyFaceImg.complete && window.enemyFaceImg.naturalWidth > 0) {
            let faceSize = 65; // Kích thước khuôn mặt
            
            // Tính toán vị trí đầu bị lắc lư khi trúng đòn hoặc né
            let headOffsetX = 0; let headOffsetY = -135; 
            if (e.state === 'hurt') { headOffsetX = -20; headOffsetY = -120; }
            else if (e.state === 'dash' || e.state === 'dash_back') { headOffsetX = 20; }
            else if (e.state === 'ko_falling' || e.state === 'dead') { headOffsetY = -20; } // Ngã gục
            
            window.ctx.save();
            // Viền bo tròn cho ảnh avatar
            window.ctx.beginPath();
            window.ctx.arc(headOffsetX, headOffsetY, faceSize/2, 0, Math.PI * 2);
            window.ctx.closePath();
            window.ctx.clip(); // Cắt ảnh thành hình tròn
            
            window.ctx.drawImage(window.enemyFaceImg, headOffsetX - faceSize/2, headOffsetY - faceSize/2, faceSize, faceSize);
            window.ctx.restore();
            
            // Vẽ thêm cái viền ngầu ngầu quanh mặt
            window.ctx.beginPath();
            window.ctx.arc(headOffsetX, headOffsetY, faceSize/2, 0, Math.PI * 2);
            window.ctx.lineWidth = 3;
            window.ctx.strokeStyle = e.hp > 0 ? "#ff003c" : "#7f8c8d";
            window.ctx.stroke();
        }

        window.ctx.restore();

        // Vẽ Floating Texts (Damage, Miss, Block)
        for (let i = window.floatingTexts.length - 1; i >= 0; i--) { 
            let t = window.floatingTexts[i]; 
            t.y += t.vy; t.alpha -= 0.02; 
            window.ctx.globalAlpha = Math.max(0, t.alpha);
            window.ctx.font = t.font || "900 30px Arial"; window.ctx.fillStyle = t.color; window.ctx.textAlign = "center";
            window.ctx.fillText(t.text, t.x, t.y);
            window.ctx.globalAlpha = 1.0;
            if (t.alpha <= 0) window.floatingTexts.splice(i, 1); 
        }
    }
    
    // Ghi hình Video nếu đang bật
    if (typeof window.captureFrameTo1080p === 'function') window.captureFrameTo1080p();
}

// Bật Live Preview ở Menu bằng cách dùng chung hàm draw
window.previewAnimId = null;
window.startPreviewLoop = function(charStats) {
    if (window.previewAnimId) cancelAnimationFrame(window.previewAnimId);
    window.isPreviewRunning = true;
    
    let pTime = 0;
    const loop = () => {
        if (!window.isPreviewRunning) return;
        let pCanvas = document.getElementById("preview-canvas");
        if(pCanvas) {
            let pCtx = pCanvas.getContext("2d");
            pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
            pCtx.save();
            pCtx.translate(pCanvas.width/2, pCanvas.height - 40);
            pCtx.scale(1.5, 1.5);
            
            let fakeChar = { x: 0, y: 0, state: 'idle', isFacingRight: false, color: charStats.color };
            if(Math.floor(pTime/60)%2 === 0) fakeChar.state = 'punch'; // Cứ 1 giây đấm 1 cái
            
            if(charStats.drawMethod) charStats.drawMethod(pCtx, fakeChar, 0, 0, 0, false);
            else if(typeof window.drawStickman === 'function') window.drawStickman(pCtx, fakeChar);
            
            // Dán mặt vào preview
            if (window.enemyFaceImg && window.enemyFaceImg.complete) {
                pCtx.save(); pCtx.beginPath(); pCtx.arc(0, -135, 30, 0, Math.PI*2); pCtx.clip();
                pCtx.drawImage(window.enemyFaceImg, -30, -165, 60, 60); pCtx.restore();
            }
            pCtx.restore();
        }
        pTime++;
        window.previewAnimId = requestAnimationFrame(loop);
    };
    loop();
}
