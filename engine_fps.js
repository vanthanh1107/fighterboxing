// Trạng thái người chơi (Bạn)
window.playerFPS = { hp: 1000, state: 'idle', isDodging: false, isBlocking: false, attackCooldown: 0 };
window.enemyZ = 100; // Khoảng cách của đối phương (100 = Xa, 0 = Ngay sát mặt)

// KẺ ĐỊCH TIẾN LÙI ĐỂ ĐÁNH MÌNH (Cập nhật trong gameLoop)
window.updateFPS = function() {
    let e = window.enemies[0]; // Kẻ địch (Messi/CR7)
    if (!e || e.hp <= 0) return;

    // AI tiến lại gần để đấm
    if (e.attackTimer <= 0) {
        if (window.enemyZ > 20) {
            window.enemyZ -= e.speed * 0.5; // Kẻ địch tiến lại gần (Z giảm dần)
            e.state = 'walk';
        } else {
            // Khi đủ gần (Z <= 20), kẻ địch tung đòn vào mặt bạn!
            e.state = 'punch'; e.attackTimer = 30;
            
            // Nếu bạn KHÔNG đỡ hoặc KHÔNG né -> Mất máu + Rung màn hình
            setTimeout(() => {
                if (!window.playerFPS.isDodging && !window.playerFPS.isBlocking) {
                    window.playerFPS.hp -= 20;
                    window.shakeScreen(15, 20);
                    document.getElementById("screen-crack").style.opacity = 1;
                    setTimeout(() => document.getElementById("screen-crack").style.opacity = 0, 300);
                    window.playSound(200, 'sawtooth', 0.3, 0.8, true);
                } else if (window.playerFPS.isBlocking) {
                    window.playSound(600, 'triangle', 0.2, 0.5, true); // Âm thanh đỡ đòn
                }
                window.enemyZ = 80; // Đánh xong thì lùi lại
            }, 250); // Độ trễ vung tay của quái
        }
    } else {
        e.attackTimer--;
    }
};

// VẼ GÓC NHÌN THỨ NHẤT
window.drawFPS = function() {
    window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
    let e = window.enemies[0];
    
    // Scale kẻ địch dựa trên trục Z (Càng gần Z càng nhỏ -> Scale càng to)
    let perspectiveScale = 1 + (100 - window.enemyZ) / 30; 
    
    window.ctx.save();
    window.ctx.translate(window.canvas.width / 2, window.canvas.height / 2 + (100 - window.enemyZ)); // Đối thủ to lên và thấp xuống
    window.ctx.scale(perspectiveScale, perspectiveScale);
    
    // Tạm thời dùng hàm vẽ có sẵn, nhưng nó sẽ được phóng to nằm chính giữa
    if(typeof window.drawStickman === 'function') {
        let eClone = Object.assign({}, e, {x: 0, y: 0}); 
        window.drawStickman(window.ctx, eClone);
    }
    window.ctx.restore();
};

// HỆ THỐNG BẠN RA ĐÒN (ĐẤM)
window.punch = function(hand) {
    if (window.playerFPS.attackCooldown > 0) return;
    window.playerFPS.attackCooldown = 15;
    
    let glove = document.getElementById(hand + "-glove");
    glove.classList.add(`glove-punch-${hand}`);
    window.playSound(350, 'sine', 0.1, 0.2);

    // Kiểm tra xem đối phương có ở trong tầm tay không (Z < 50)
    if (window.enemyZ < 50) {
        let e = window.enemies[0];
        window.takeDamage(e, 15, "#fff", Math.random() < 0.2, false);
        window.spawnParticles(window.canvas.width/2, window.canvas.height/2, "#fff");
        window.enemyZ += 15; // Đấm trúng thì đối phương bị đẩy lùi nhẹ ra sau
    }

    setTimeout(() => glove.classList.remove(`glove-punch-${hand}`), 150);
};

// HỆ THỐNG ĐỠ VÀ NÉ
window.blockFPS = function() {
    window.playerFPS.isBlocking = true;
    document.getElementById("left-glove").classList.add("glove-block-left");
    document.getElementById("right-glove").classList.add("glove-block-right");
    setTimeout(() => {
        window.playerFPS.isBlocking = false;
        document.getElementById("left-glove").classList.remove("glove-block-left");
        document.getElementById("right-glove").classList.remove("glove-block-right");
    }, 400);
};

window.dodgeFPS = function() {
    window.playerFPS.isDodging = true;
    let dir = Math.random() > 0.5 ? "left" : "right";
    document.querySelector(".canvas-wrapper").classList.add(`camera-dodge-${dir}`);
    setTimeout(() => {
        window.playerFPS.isDodging = false;
        document.querySelector(".canvas-wrapper").classList.remove(`camera-dodge-${dir}`);
    }, 300);
};
