document.addEventListener("DOMContentLoaded", () => {
    let authSection = document.getElementById("auth-section");
    if(authSection) {
        authSection.innerHTML = `
            <div style="background: var(--panel-bg, #0d111a); padding: 12px 20px; border-radius: 4px; display: inline-block; border: 1px solid var(--border-color, #1e293b); box-shadow: 0 0 20px rgba(0, 243, 255, 0.05); margin-top: 10px;">
                <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: var(--neon-cyan, #00f3ff); font-family: 'Rajdhani', sans-serif; letter-spacing: 2px; text-transform: uppercase;">LƯU KỶ LỤC CỦA BẠN:</p>
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <button id="btn-phone-login" class="game-btn" style="font-size: 18px; padding: 6px 20px; border-color: #00f3ff; color: #00f3ff; background: rgba(0, 243, 255, 0.05);">📱 SĐT</button>
                    <button id="btn-apple-login" class="game-btn" style="font-size: 18px; padding: 6px 20px; border-color: #fff; color: #fff; background: rgba(255, 255, 255, 0.05);">🍎 APPLE</button>
                </div>
            </div>
        `;
        document.getElementById("btn-phone-login").onclick = function() { alert("Đang gọi Firebase Phone Auth..."); };
        document.getElementById("btn-apple-login").onclick = function() { alert("Đang gọi Firebase Apple Auth..."); };
    }
});
