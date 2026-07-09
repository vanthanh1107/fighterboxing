// ==========================================
// CONFIG.JS - FIRST PERSON ARENA MULTIVERSE
// [62 SÀN ĐẤU BOXING 3D VỚI ÁNH SÁNG & THỜI TIẾT ĐỘC LẬP]
// ==========================================

window.MAPS = [
    // ==========================================
    // 1. CÁC ĐẤU TRƯỜNG THÀNH PHỐ & VÕ ĐƯỜNG (URBAN & DOJOS)
    // ==========================================
    { id: "cyberpunk", name: "NIGHT CITY RING", audience: "#050608", mat: "#111111", ropes: ["#ff4757", "#2f3640", "#ff4757"], spotlight: "rgba(255, 71, 87, 0.15)", weather: "rain", logo: "CYBER-FIGHT" },
    { id: "neon_alley", name: "NEON ALLEY", audience: "#0f0c29", mat: "#050505", ropes: ["#ff00ff", "#00f3ff", "#ff00ff"], spotlight: "rgba(0, 243, 255, 0.15)", weather: "matrix_rain", logo: "NEON CLUB" },
    { id: "golden_dojo", name: "GOLDEN DOJO", audience: "#2c1a05", mat: "#2c3e50", ropes: ["#f1c40f", "#e67e22", "#f1c40f"], spotlight: "rgba(241, 196, 15, 0.15)", weather: "petals", logo: "MASTER DOJO" },
    { id: "shaolin_temple", name: "SHAOLIN TEMPLE", audience: "#1a0b00", mat: "#4a2311", ropes: ["#f1c40f", "#ba4a00", "#f1c40f"], spotlight: "rgba(230, 126, 34, 0.15)", weather: "petals", logo: "SHAOLIN" },
    { id: "ruined_city", name: "RUINED ARENA", audience: "#111518", mat: "#283747", ropes: ["#e67e22", "#5d6d7e", "#e67e22"], spotlight: "rgba(230, 126, 34, 0.1)", weather: "ash", logo: "SURVIVAL" },

    // ==========================================
    // 2. THIÊN NHIÊN: RỪNG, BIỂN & SA MẠC (NATURE & ELEMENTS)
    // ==========================================
    { id: "sahara_desert", name: "SANDSTORM RING", audience: "#2b1400", mat: "#a04000", ropes: ["#f1c40f", "#d35400", "#f1c40f"], spotlight: "rgba(241, 196, 15, 0.15)", weather: "ash", logo: "OASIS" },
    { id: "deep_forest", name: "WILD FOREST", audience: "#041408", mat: "#0a2614", ropes: ["#2ecc71", "#1e8449", "#2ecc71"], spotlight: "rgba(46, 204, 113, 0.15)", weather: "fireflies", logo: "JUNGLE" },
    { id: "autumn_woods", name: "AUTUMN RING", audience: "#1a0900", mat: "#6e2c00", ropes: ["#f39c12", "#d35400", "#f39c12"], spotlight: "rgba(243, 156, 18, 0.15)", weather: "petals", logo: "AUTUMN" },
    { id: "river_styx", name: "STYX ARENA", audience: "#05111a", mat: "#0e2c40", ropes: ["#3498db", "#21618c", "#3498db"], spotlight: "rgba(52, 152, 219, 0.15)", weather: "rain", logo: "STYX" },
    { id: "sunset_beach", name: "BEACH BRAWL", audience: "#1a0800", mat: "#f39c12", ropes: ["#16a085", "#d35400", "#16a085"], spotlight: "rgba(211, 84, 0, 0.15)", weather: "none", logo: "SUMMER" },
    { id: "frozen_peak", name: "FROZEN RING", audience: "#0a1118", mat: "#ecf0f1", ropes: ["#3498db", "#bdc3c7", "#3498db"], spotlight: "rgba(189, 195, 199, 0.2)", weather: "snow", logo: "BLIZZARD" },
    { id: "thunder_peak", name: "THUNDER PEAK", audience: "#080c10", mat: "#17202a", ropes: ["#f1c40f", "#34495e", "#f1c40f"], spotlight: "rgba(241, 196, 15, 0.1)", weather: "rain", logo: "THUNDER" },

    // ==========================================
    // 3. ĐỊA ĐIỂM VIỄN TƯỞNG & KINH DỊ (SCI-FI & HORROR)
    // ==========================================
    { id: "blood_moon", name: "BLOOD MOON", audience: "#0a0000", mat: "#1a0000", ropes: ["#ff0000", "#4a0000", "#ff0000"], spotlight: "rgba(255, 0, 0, 0.15)", weather: "blood_rain", logo: "BLOOD BATH" },
    { id: "zombie_highway", name: "DEAD END", audience: "#080a0c", mat: "#17202a", ropes: ["#ff0000", "#273746", "#ff0000"], spotlight: "rgba(86, 101, 115, 0.15)", weather: "toxic", logo: "QUARANTINE" },
    { id: "toxic_zone", name: "TOXIC SLUMS", audience: "#020802", mat: "#0a120a", ropes: ["#2ecc71", "#1b301b", "#2ecc71"], spotlight: "rgba(46, 204, 113, 0.15)", weather: "toxic", logo: "BIOHAZARD" },
    { id: "haunted_grave", name: "GRAVEYARD", audience: "#040608", mat: "#0a0c10", ropes: ["#8e44ad", "#212f3d", "#8e44ad"], spotlight: "rgba(142, 68, 173, 0.15)", weather: "fireflies", logo: "HAUNTED" },
    { id: "volcanic_core", name: "MAGMA CORE", audience: "#0a0000", mat: "#110000", ropes: ["#e74c3c", "#641e16", "#e74c3c"], spotlight: "rgba(231, 76, 60, 0.15)", weather: "ash", logo: "VOLCANO" },
    { id: "mars_colony", name: "MARS BASE", audience: "#1a0503", mat: "#4a2311", ropes: ["#e67e22", "#7b241c", "#e67e22"], spotlight: "rgba(230, 126, 34, 0.15)", weather: "ash", logo: "COLONY 9" },

    // ==========================================
    // 4. THẦN THOẠI & SỬ THI (MYTHIC & HISTORICAL)
    // ==========================================
    { id: "roman_colosseum", name: "COLOSSEUM", audience: "#1a0d00", mat: "#7e5109", ropes: ["#f1c40f", "#a04000", "#f1c40f"], spotlight: "rgba(241, 196, 15, 0.15)", weather: "ash", logo: "GLADIATOR" },
    { id: "viking_fjord", name: "VALHALLA GATES", audience: "#040d14", mat: "#1b4f72", ropes: ["#aed6f1", "#2e86c1", "#aed6f1"], spotlight: "rgba(174, 214, 241, 0.15)", weather: "snow", logo: "VIKING" },
    { id: "dragon_nest", name: "DRAGON NEST", audience: "#0a0000", mat: "#110000", ropes: ["#ff4500", "#4a0e00", "#ff4500"], spotlight: "rgba(255, 69, 0, 0.15)", weather: "ash", logo: "DRAGON" },
    { id: "underwater_atlantis", name: "ATLANTIS", audience: "#000511", mat: "#001122", ropes: ["#00ffff", "#003366", "#00ffff"], spotlight: "rgba(0, 255, 255, 0.15)", weather: "cosmic_dust", logo: "ABYSS" },
    { id: "sakura_shrine", name: "SAKURA SHRINE", audience: "#1a0011", mat: "#4a235a", ropes: ["#ffffff", "#ff69b4", "#ffffff"], spotlight: "rgba(255, 182, 193, 0.15)", weather: "petals", logo: "RONIN" },

    // ==========================================
    // 5. KHÔNG GIAN SIÊU THỰC & VŨ TRỤ (SURREAL & COSMIC)
    // ==========================================
    { id: "galaxy_void", name: "GALAXY VOID", audience: "#000000", mat: "#050511", ropes: ["#9b59b6", "#1b1464", "#9b59b6"], spotlight: "rgba(155, 89, 182, 0.15)", weather: "shooting_stars", logo: "COSMOS" },
    { id: "alien_world", name: "ALIEN WORLD", audience: "#0a0211", mat: "#154360", ropes: ["#00ff00", "#633974", "#00ff00"], spotlight: "rgba(0, 255, 0, 0.1)", weather: "cosmic_dust", logo: "AREA 51" },
    { id: "cloud_temple", name: "SKY TEMPLE", audience: "#1a2a3a", mat: "#fdfefe", ropes: ["#f1c40f", "#85c1e9", "#f1c40f"], spotlight: "rgba(255, 255, 255, 0.2)", weather: "snow", logo: "HEAVEN" },
    { id: "crystal_cave", name: "CRYSTAL CAVE", audience: "#020a08", mat: "#08362d", ropes: ["#1abc9c", "#0e6655", "#1abc9c"], spotlight: "rgba(26, 188, 156, 0.15)", weather: "cosmic_dust", logo: "GEMSTONE" },
    { id: "matrix_grid", name: "THE GRID", audience: "#000000", mat: "#000500", ropes: ["#00ff00", "#003300", "#00ff00"], spotlight: "rgba(0, 255, 0, 0.15)", weather: "matrix_rain", logo: "SYSTEM.OUT" },
    { id: "mirror_dimension", name: "MIRROR DIMENSION", audience: "#000000", mat: "#050a11", ropes: ["#00ffff", "#1b2631", "#00ffff"], spotlight: "rgba(0, 255, 255, 0.15)", weather: "matrix_rain", logo: "SHATTERED" },

    // ==========================================
    // 6. ĐA VŨ TRỤ HỖN MẠNG & GLITCH (CYBER-NIGHTMARES)
    // ==========================================
    { id: "synthwave_drive", name: "RETRO WAVE", audience: "#05000a", mat: "#110011", ropes: ["#ff00ff", "#8e44ad", "#ff00ff"], spotlight: "rgba(255, 0, 255, 0.15)", weather: "none", logo: "1980s" }, 
    { id: "glitch_dimension", name: "GLITCH CORE", audience: "#000000", mat: "#111111", ropes: ["#ffffff", "#ff00ff", "#00ffff"], spotlight: "rgba(255, 0, 255, 0.1)", weather: "toxic", logo: "ERROR 404" }, 
    { id: "steampunk_slums", name: "GEAR FACTORY", audience: "#0a0300", mat: "#2e150b", ropes: ["#d35400", "#5c4033", "#d35400"], spotlight: "rgba(211, 84, 0, 0.15)", weather: "ash", logo: "STEAMPUNK" }, 
    { id: "cyber_yakuza", name: "YAKUZA TOWER", audience: "#020202", mat: "#050505", ropes: ["#ff003c", "#330000", "#ffffff"], spotlight: "rgba(255, 0, 60, 0.15)", weather: "rain", logo: "SYNDICATE" }, 

    // ==========================================
    // 7. CÕI ÂM & KHÔNG GIAN BẤT ĐỊNH (PURGATORY & LIMBO)
    // ==========================================
    { id: "the_backrooms", name: "LEVEL 0", audience: "#1a1a0f", mat: "#baba7a", ropes: ["#8c8c54", "#d1d193", "#8c8c54"], spotlight: "rgba(227, 227, 181, 0.2)", weather: "none", logo: "NO ESCAPE" }, 
    { id: "blood_ocean", name: "RED SEA", audience: "#0a0000", mat: "#1a0000", ropes: ["#ff3333", "#660000", "#ff3333"], spotlight: "rgba(255, 51, 51, 0.15)", weather: "blood_rain", logo: "CARNAGE" }, 
    { id: "frozen_hell", name: "NINTH CIRCLE", audience: "#000205", mat: "#000a14", ropes: ["#00ffff", "#003366", "#00ffff"], spotlight: "rgba(0, 255, 255, 0.15)", weather: "snow", logo: "TREACHERY" }, 
    { id: "limbo_void", name: "PURGATORY", audience: "#0a0a0a", mat: "#222222", ropes: ["#ffffff", "#555555", "#ffffff"], spotlight: "rgba(255, 255, 255, 0.1)", weather: "ash", logo: "LIMBO" }
];
