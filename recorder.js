// ==========================================
// RECORDER.JS - FIRST-PERSON BRAWLER EDITION
// TÍCH HỢP RENDER GĂNG TAY 3D VÀ HUD FPS TRỰC TIẾP LÊN VIDEO
// ==========================================

window.mediaRecorderH = null; window.recordedChunksH = []; window.recordCanvasH = null; window.recordCtxH = null;
window.mediaRecorderV = null; window.recordedChunksV = []; window.recordCanvasV = null; window.recordCtxV = null;

window.isRecording = false; 
window.recordAudioDestination = null; 
window.currentVideoExt = "webm"; 
window.savedVideos = [];
window.bgmSourceNode = null;

window.initRecorder = function() {
    if (!document.getElementById("hiddenRecordCanvasH")) {
        window.recordCanvasH = document.createElement("canvas"); window.recordCanvasH.id = "hiddenRecordCanvasH"; window.recordCanvasH.width = 1920; window.recordCanvasH.height = 1080;
        window.recordCanvasH.style.cssText = "position: absolute; top: 0; left: 0; width: 1px; height: 1px; opacity: 0.01; pointer-events: none; z-index: -9999;";
        document.body.appendChild(window.recordCanvasH); window.recordCtxH = window.recordCanvasH.getContext("2d");
    }
    if (!document.getElementById("hiddenRecordCanvasV")) {
        window.recordCanvasV = document.createElement("canvas"); window.recordCanvasV.id = "hiddenRecordCanvasV"; window.recordCanvasV.width = 1080; window.recordCanvasV.height = 1920;
        window.recordCanvasV.style.cssText = "position: absolute; top: 0; left: 0; width: 1px; height: 1px; opacity: 0.01; pointer-events: none; z-index: -9999;";
        document.body.appendChild(window.recordCanvasV); window.recordCtxV = window.recordCanvasV.getContext("2d");
    }

    window.recordCtxH.fillStyle = "#050505"; window.recordCtxH.fillRect(0, 0, 1920, 1080);
    window.recordCtxV.fillStyle = "#050505"; window.recordCtxV.fillRect(0, 0, 1080, 1920);
    setTimeout(() => { if (typeof window.updateVideoListUI === 'function') window.updateVideoListUI(); }, 1000);
};

window.startRecording = function() {
    if (window.isRecording) return; if (!window.recordCanvasH || !window.recordCanvasV) window.initRecorder();
    if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
    
    try { window.recordAudioDestination = window.audioCtx.createMediaStreamDestination(); } catch (e) { }
    
    if (window.bgmBase && window.recordAudioDestination) {
        try {
            if (!window.bgmSourceNode) window.bgmSourceNode = window.audioCtx.createMediaElementSource(window.bgmBase);
            window.bgmSourceNode.connect(window.recordAudioDestination);
            window.bgmSourceNode.connect(window.audioCtx.destination);
        } catch (e) { console.log("Lỗi kết nối BGM vào recorder:", e); }
    }

    try {
        if (window.silenceOsc) window.silenceOsc.stop();
        window.silenceOsc = window.audioCtx.createOscillator();
        let silenceGain = window.audioCtx.createGain(); silenceGain.gain.value = 0; 
        window.silenceOsc.connect(silenceGain); silenceGain.connect(window.recordAudioDestination);
        window.silenceOsc.start();
    } catch(e) {}
    
    window.recordedChunksH = []; window.recordedChunksV = [];
    
    let videoStreamH = window.recordCanvasH.captureStream(); 
    let videoStreamV = window.recordCanvasV.captureStream(); 
    let audioTracks = (window.recordAudioDestination && window.recordAudioDestination.stream) ? window.recordAudioDestination.stream.getAudioTracks() : [];
    
    let combinedStreamH = new MediaStream(); let combinedStreamV = new MediaStream();
    
    videoStreamH.getVideoTracks().forEach(track => combinedStreamH.addTrack(track));
    videoStreamV.getVideoTracks().forEach(track => combinedStreamV.addTrack(track));
    audioTracks.forEach(track => { combinedStreamH.addTrack(track); combinedStreamV.addTrack(track); });
    
    let options = { videoBitsPerSecond: 8000000 }; window.currentVideoExt = "webm";
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) { options = { mimeType: 'video/mp4;codecs=avc1,mp4a.40.2', videoBitsPerSecond: 8000000 }; window.currentVideoExt = "mp4"; } 
    else if (MediaRecorder.isTypeSupported('video/mp4')) { options = { mimeType: 'video/mp4', videoBitsPerSecond: 8000000 }; window.currentVideoExt = "mp4"; } 
    else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) { options = { mimeType: 'video/webm;codecs=vp8,opus', videoBitsPerSecond: 8000000 }; window.currentVideoExt = "webm"; }
    
    try { 
        window.mediaRecorderH = new MediaRecorder(combinedStreamH, options); 
        window.mediaRecorderV = new MediaRecorder(combinedStreamV, options); 
    } catch (e) { 
        window.mediaRecorderH = new MediaRecorder(combinedStreamH); 
        window.mediaRecorderV = new MediaRecorder(combinedStreamV); 
    }

    window.mediaRecorderH.ondataavailable = (e) => { if (e.data && e.data.size > 0) window.recordedChunksH.push(e.data); };
    window.mediaRecorderV.ondataavailable = (e) => { if (e.data && e.data.size > 0) window.recordedChunksV.push(e.data); };

    let charName = "ĐỐI THỦ"; let charAvatar = "https://i.imgur.com/q3813rX.png";
    if (window.enemies && window.enemies[0]) {
        charName = window.enemies[0].className || "Đối thủ";
        if(window.classStats && window.classStats[window.enemies[0].classId]) {
            charAvatar = window.classStats[window.enemies[0].classId].avatarUrl || charAvatar;
        }
    }

    let stoppedCount = 0;
    const finalizeRecordings = () => {
        stoppedCount++;
        if (stoppedCount === 2) {
            setTimeout(() => {
                if (window.recordedChunksH.length === 0 || window.recordedChunksV.length === 0) return;
                let mimeType = window.currentVideoExt === "mp4" ? "video/mp4" : "video/webm";
                
                let blobH = new Blob(window.recordedChunksH, { type: mimeType }); let videoUrlH = URL.createObjectURL(blobH);
                let blobV = new Blob(window.recordedChunksV, { type: mimeType }); let videoUrlV = URL.createObjectURL(blobV);

                window.savedVideos.push({ 
                    id: Date.now(), urlH: videoUrlH, urlV: videoUrlV, ext: window.currentVideoExt, 
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    heroName: charName, heroAvatar: charAvatar
                });
                window.updateVideoListUI();
            }, 200);
        }
    };

    window.mediaRecorderH.onstop = finalizeRecordings; window.mediaRecorderV.onstop = finalizeRecordings;
    window.mediaRecorderH.start(); window.mediaRecorderV.start(); window.isRecording = true;
};

window.stopRecording = function() { 
    if (!window.isRecording) return; 
    try { window.mediaRecorderH.requestData(); window.mediaRecorderV.requestData(); } catch(e){} 
    window.mediaRecorderH.stop(); window.mediaRecorderV.stop(); 
    window.isRecording = false; 
    if (window.silenceOsc) { window.silenceOsc.stop(); window.silenceOsc = null; }
    if (window.bgmSourceNode) { window.bgmSourceNode.disconnect(); window.bgmSourceNode = null; }
};

// ==========================================
// RENDER MÀN HÌNH CHÍNH & VẼ GĂNG TAY FPS LÊN VIDEO
// ==========================================
window.captureFrames = function() {
    if (!window.isRecording || !window.recordCtxH || !window.recordCtxV || !window.canvas) return;
    
    let ctxH = window.recordCtxH; let ctxV = window.recordCtxV;
    
    // === 1. VẼ BẢN NGANG (1920x1080) ===
    ctxH.fillStyle = "#050505"; ctxH.fillRect(0, 0, 1920, 1080); ctxH.imageSmoothingEnabled = false; 
    ctxH.drawImage(window.canvas, 0, 0, window.canvas.width, window.canvas.height, 0, 60, 1920, 960);
    
    // === 2. VẼ BẢN DỌC TIKTOK (1080x1920) ===
    ctxV.fillStyle = "#111"; ctxV.fillRect(0, 0, 1080, 1920); ctxV.imageSmoothingEnabled = false;
    ctxV.drawImage(window.canvas, 0, 0, window.canvas.width, window.canvas.height, -420, 420, 1920, 1080);

    // Xử lý hiệu ứng nứt kính màn hình
    let crackEl = document.getElementById("screen-crack");
    let crackOp = crackEl ? parseFloat(crackEl.style.opacity || 0) : 0;
    if (crackOp > 0) {
        ctxH.fillStyle = `rgba(255, 255, 255, ${crackOp * 0.5})`; ctxH.fillRect(0, 60, 1920, 960);
        ctxV.fillStyle = `rgba(255, 255, 255, ${crackOp * 0.5})`; ctxV.fillRect(0, 420, 1080, 1080);
        // Có thể load ảnh nứt kính thật để drawImage nếu muốn, ở đây dùng chớp sáng mô phỏng sát thương
    }

    // Viền đen điện ảnh
    let vignetteH = ctxH.createRadialGradient(960, 540, 500, 960, 540, 1200); vignetteH.addColorStop(0, 'rgba(0,0,0,0)'); vignetteH.addColorStop(1, 'rgba(0,0,0,0.7)'); 
    ctxH.fillStyle = vignetteH; ctxH.fillRect(0, 60, 1920, 960);
    let vignetteV = ctxV.createRadialGradient(540, 960, 400, 540, 960, 1000); vignetteV.addColorStop(0, 'rgba(0,0,0,0)'); vignetteV.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctxV.fillStyle = vignetteV; ctxV.fillRect(0, 420, 1080, 1080);

    // BỘ TẢI ẢNH (Dùng cho Avatar Địch)
    if (!window.hudImages) window.hudImages = {};
    const getHudImg = (url) => {
        if (!url) return null;
        if (window.hudImages[url] && window.hudImages[url].complete && window.hudImages[url].naturalWidth > 0) return window.hudImages[url];
        if (!window.hudImages[url]) { let img = new Image(); img.crossOrigin = "Anonymous"; img.src = url; window.hudImages[url] = img; }
        return null;
    };

    // === 3. VẼ GĂNG TAY FPS (ĐỌC TỪ HTML DOM) LÊN VIDEO ===
    let leftGlove = document.getElementById("left-glove");
    let rightGlove = document.getElementById("right-glove");
    
    let isPunchL = leftGlove && leftGlove.classList.contains("glove-punch-left");
    let isBlockL = leftGlove && leftGlove.classList.contains("glove-block-left");
    let isPunchR = rightGlove && rightGlove.classList.contains("glove-punch-right");
    let isBlockR = rightGlove && rightGlove.classList.contains("glove-block-right");

    const drawGlove = (ctx, isH, isLeft, state) => {
        ctx.save();
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        
        // Tọa độ cấu hình sẵn cho bản Ngang (H) và Dọc (V)
        let x, y, rot, size, scaleX = 1;
        
        if (isH) {
            size = 350; // Kích thước găng ngang
            if (isLeft) {
                if (state === 'punch') { x = 700; y = 550; size = 250; rot = 0; }
                else if (state === 'block') { x = 600; y = 750; rot = 45; ctx.shadowBlur = 40; ctx.shadowColor = "#00f3ff"; }
                else { x = 300; y = 1100; rot = 15; }
            } else {
                scaleX = -1; // Lật ngược găng tay phải
                if (state === 'punch') { x = 1220; y = 550; size = 250; rot = 0; }
                else if (state === 'block') { x = 1320; y = 750; rot = 45; ctx.shadowBlur = 40; ctx.shadowColor = "#00f3ff"; }
                else { x = 1620; y = 1100; rot = 15; }
            }
        } else {
            size = 280; // Kích thước găng dọc
            if (isLeft) {
                if (state === 'punch') { x = 400; y = 1100; size = 180; rot = 0; }
                else if (state === 'block') { x = 300; y = 1250; rot = 45; ctx.shadowBlur = 30; ctx.shadowColor = "#00f3ff"; }
                else { x = 150; y = 1600; rot = 15; }
            } else {
                scaleX = -1;
                if (state === 'punch') { x = 680; y = 1100; size = 180; rot = 0; }
                else if (state === 'block') { x = 780; y = 1250; rot = 45; ctx.shadowBlur = 30; ctx.shadowColor = "#00f3ff"; }
                else { x = 930; y = 1600; rot = 15; }
            }
        }

        ctx.translate(x, y);
        ctx.scale(scaleX, 1);
        ctx.rotate(rot * Math.PI / 180);
        ctx.font = `${size}px Arial`;
        if (state !== 'block') { ctx.shadowBlur = 25; ctx.shadowColor = "rgba(0,0,0,0.8)"; } // Đổ bóng
        ctx.fillText("🥊", 0, 0);
        ctx.restore();
    };

    // Vẽ 2 găng tay cho bản ngang
    drawGlove(ctxH, true, true, isPunchL ? 'punch' : (isBlockL ? 'block' : 'idle'));
    drawGlove(ctxH, true, false, isPunchR ? 'punch' : (isBlockR ? 'block' : 'idle'));

    // Vẽ 2 găng tay cho bản dọc
    drawGlove(ctxV, false, true, isPunchL ? 'punch' : (isBlockL ? 'block' : 'idle'));
    drawGlove(ctxV, false, false, isPunchR ? 'punch' : (isBlockR ? 'block' : 'idle'));

    // === 4. VẼ HUD (MÁU & THÔNG TIN FPS) ===
    if (window.playerFPS && window.enemies && window.enemies[0] && !window.gameOver) {
        const drawSkewedPath = (ctx, x, y, w, h, isLeft) => { ctx.beginPath(); if (isLeft) { ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 25, y + h); ctx.lineTo(x - 25, y + h); } else { ctx.moveTo(x + 25, y); ctx.lineTo(x + w + 25, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); } ctx.closePath(); };
        
        let p1Hp = Math.max(0, window.playerFPS.hp / 1000); 
        let e0 = window.enemies[0];
        let p2Hp = Math.max(0, e0.hp / (e0.maxHp || 1)); 
        
        let p1Name = "YOU (FPS)";
        let eName = (e0.className || "ENEMY").toUpperCase();
        let p2Url = window.classStats && window.classStats[e0.classId] ? window.classStats[e0.classId].avatarUrl : "https://i.imgur.com/q3813rX.png";
        let img2 = getHudImg(p2Url);

        // --- HUD BẢN NGANG ---
        ctxH.lineJoin = "round"; ctxH.lineWidth = 8; ctxH.strokeStyle = "#000"; ctxH.font = "900 48px Arial"; ctxH.textAlign = "left";
        ctxH.strokeText(p1Name, 80, 72); ctxH.fillStyle = "#00f3ff"; ctxH.fillText(p1Name, 80, 72);
        
        drawSkewedPath(ctxH, 80, 90, 750, 45, true); ctxH.fillStyle = "rgba(0,0,0,0.7)"; ctxH.fill(); ctxH.lineWidth = 5; ctxH.strokeStyle = "rgba(255,255,255,0.9)"; ctxH.stroke();
        if (p1Hp > 0) { let hpGrad = ctxH.createLinearGradient(80, 0, 830, 0); hpGrad.addColorStop(0, "#00f3ff"); hpGrad.addColorStop(1, "#3498db"); drawSkewedPath(ctxH, 80, 90, 750 * p1Hp, 45, true); ctxH.fillStyle = hpGrad; ctxH.fill(); }

        ctxH.textAlign = "right"; ctxH.lineWidth = 8; ctxH.strokeStyle = "#000"; 
        if (img2) {
            ctxH.save();
            ctxH.beginPath(); if (ctxH.roundRect) ctxH.roundRect(1795, 25, 55, 55, 6); else ctxH.rect(1795, 25, 55, 55); ctxH.clip();
            ctxH.drawImage(img2, 1795, 25, 55, 55); ctxH.restore();
            ctxH.lineWidth = 4; ctxH.strokeStyle = "#ff003c"; ctxH.strokeRect(1795, 25, 55, 55);
        }
        ctxH.lineWidth = 8; ctxH.strokeStyle = "#000"; ctxH.strokeText(eName, 1780, 72); ctxH.fillStyle = "#ff003c"; ctxH.fillText(eName, 1780, 72);
        
        drawSkewedPath(ctxH, 1090, 90, 750, 45, false); ctxH.fillStyle = "rgba(0,0,0,0.7)"; ctxH.fill(); ctxH.lineWidth = 5; ctxH.strokeStyle = "rgba(255,255,255,0.9)"; ctxH.stroke();
        if (p2Hp > 0) { let hpGrad2 = ctxH.createLinearGradient(1090, 0, 1840, 0); hpGrad2.addColorStop(0, "#ff4757"); hpGrad2.addColorStop(1, "#ff7f50"); drawSkewedPath(ctxH, 1090 + (750 - 750 * p2Hp), 90, 750 * p2Hp, 45, false); ctxH.fillStyle = hpGrad2; ctxH.fill(); }

        // --- HUD BẢN DỌC ---
        ctxV.lineJoin = "round"; ctxV.lineWidth = 8; ctxV.strokeStyle = "#000"; ctxV.font = "900 55px Arial"; ctxV.textAlign = "left";
        ctxV.strokeText(p1Name, 50, 140); ctxV.fillStyle = "#00f3ff"; ctxV.fillText(p1Name, 50, 140);
        
        drawSkewedPath(ctxV, 50, 160, 930, 55, true); ctxV.fillStyle = "rgba(0,0,0,0.7)"; ctxV.fill(); ctxV.lineWidth = 6; ctxV.strokeStyle = "rgba(255,255,255,0.9)"; ctxV.stroke();
        if (p1Hp > 0) { let hpGradV = ctxV.createLinearGradient(50, 0, 980, 0); hpGradV.addColorStop(0, "#00f3ff"); hpGradV.addColorStop(1, "#3498db"); drawSkewedPath(ctxV, 50, 160, 930 * p1Hp, 55, true); ctxV.fillStyle = hpGradV; ctxV.fill(); }

        ctxV.textAlign = "right"; ctxV.lineWidth = 8; ctxV.strokeStyle = "#000"; 
        if (img2) {
            ctxV.save();
            ctxV.beginPath(); if (ctxV.roundRect) ctxV.roundRect(965, 1585, 65, 65, 8); else ctxV.rect(965, 1585, 65, 65); ctxV.clip();
            ctxV.drawImage(img2, 965, 1585, 65, 65); ctxV.restore();
            ctxV.lineWidth = 5; ctxV.strokeStyle = "#ff003c"; ctxV.strokeRect(965, 1585, 65, 65);
        }
        ctxV.lineWidth = 8; ctxV.strokeStyle = "#000"; ctxV.strokeText(eName, 945, 1640); ctxV.fillStyle = "#ff003c"; ctxV.fillText(eName, 945, 1640);
        
        drawSkewedPath(ctxV, 100, 1660, 930, 55, false); ctxV.fillStyle = "rgba(0,0,0,0.7)"; ctxV.fill(); ctxV.lineWidth = 6; ctxV.strokeStyle = "rgba(255,255,255,0.9)"; ctxV.stroke();
        if (p2Hp > 0) { let hpGradV2 = ctxV.createLinearGradient(100, 0, 1030, 0); hpGradV2.addColorStop(0, "#ff4757"); hpGradV2.addColorStop(1, "#ff7f50"); drawSkewedPath(ctxV, 100 + (930 - 930 * p2Hp), 1660, 930 * p2Hp, 55, false); ctxV.fillStyle = hpGradV2; ctxV.fill(); }
    }
};

window.captureFrameTo1080p = window.captureFrames;

window.updateVideoListUI = function() {
    let container = document.getElementById("video-list-container");
    if (!container) { container = document.createElement("div"); container.id = "video-list-container"; container.style.cssText = "margin-top: 35px; padding: 20px; background: #0a0d14; border-radius: 12px; border: 1px solid #1e293b; max-width: 850px; margin-left: auto; margin-right: auto; color: #fff; font-family: 'Rajdhani', Arial, sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.5);"; let gameContainer = document.getElementById("game-container"); if (gameContainer) gameContainer.appendChild(container); else document.body.appendChild(container); }
    if (window.savedVideos.length === 0) { container.innerHTML = `<h3 style="margin: 0 0 10px 0; color: #00f3ff; text-align: center; font-family: 'Teko', sans-serif; letter-spacing: 2px; font-size: 28px;">📹 KHO LƯU TRỮ TRẬN ĐẤU</h3><p style="text-align: center; color: #64748b; margin: 0; font-size: 16px;">Chưa có dữ liệu. Bấm "Thoát" sau khi đánh để hệ thống xử lý video!</p>`; return; }
    
    let html = `<h3 style="margin: 0 0 15px 0; color: #00f3ff; text-align: center; font-family: 'Teko', sans-serif; letter-spacing: 2px; font-size: 28px;">📹 KHO LƯU TRỮ TRẬN ĐẤU (${window.savedVideos.length})</h3><div style="display: flex; flex-direction: column; gap: 12px; max-height: 350px; overflow-y: auto; padding-right: 5px;">`;
    
    window.savedVideos.forEach((vid, index) => { 
        html += `<div style="display: flex; justify-content: space-between; align-items: center; background: #141a27; padding: 12px 18px; border-radius: 8px; border: 1px solid #334155; box-shadow: inset 0 0 5px rgba(0,0,0,0.3);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${vid.heroAvatar}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid #ff003c; box-shadow: 0 0 8px rgba(255, 0, 60, 0.3);">
                        <div style="text-align: left; display: flex; flex-direction: column;">
                            <span style="font-weight: 700; color: #f8fafc; font-family: 'Teko', sans-serif; font-size: 22px; letter-spacing: 1px;">VS ${vid.heroName}</span>
                            <span style="font-size: 13px; color: #94a3b8; font-weight: 600;">🕒 Thời gian: ${vid.timestamp}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <a href="${vid.urlH}" download="FPS_vs_${vid.heroName}_Ngang_1080p.${vid.ext}" style="background: #ff003c; color: #fff; text-decoration: none; padding: 8px 15px; border-radius: 4px; font-family: 'Teko', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 1px; box-shadow: 0 2px 5px rgba(255,0,60,0.3); transition: 0.2s;">📥 NGANG</a>
                        <a href="${vid.urlV}" download="FPS_vs_${vid.heroName}_TikTok.${vid.ext}" style="background: #00f3ff; color: #0a0d14; text-decoration: none; padding: 8px 15px; border-radius: 4px; font-family: 'Teko', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 1px; box-shadow: 0 2px 5px rgba(0,243,255,0.3); transition: 0.2s;">📱 DỌC (Tiktok)</a>
                        <button onclick="window.deleteVideo(${vid.id})" style="background: transparent; color: #94a3b8; border: 1px solid #475569; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s;">❌</button>
                    </div>
                </div>`; 
    });
    html += `</div>`; container.innerHTML = html;
};

window.deleteVideo = function(id) { 
    let index = window.savedVideos.findIndex(v => v.id === id); 
    if (index !== -1) { 
        URL.revokeObjectURL(window.savedVideos[index].urlH); 
        URL.revokeObjectURL(window.savedVideos[index].urlV); 
        window.savedVideos.splice(index, 1); 
        window.updateVideoListUI(); 
    } 
};
