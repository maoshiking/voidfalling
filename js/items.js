// ==================== 虚空坠落 - 道具系统 ====================

// ---- 音效 ----
var sfxHealPickup  = new Audio('./audio/heal-pickup_min.mp3');
sfxHealPickup.volume = VOL.healPickup;
var sfxBombPickup  = new Audio('./audio/bomb-pickup_min.mp3');
var sfxBombExplode = new Audio('./audio/bomb-explode_min.mp3');
var sfxLaserPickup = new Audio('./audio/laser-pickup_min.mp3');
sfxLaserPickup._trimEnd = 3.0;
var sfxLaserFire   = new Audio('./audio/laser-fire_min.mp3');
var sfxItemSpawn  = new Audio('./audio/item-spawn_min.mp3');
var sfxRoninDie   = new Audio('./audio/ronin-die_min.mp3');
sfxRoninDie.volume = VOL.roninDie;
var sfxBullDie    = new Audio('./audio/bull-die_min.mp3');
var sfxNormalDie  = new Audio('./audio/normal-die_min.mp3');
var sfxFrostExplode = new Audio('./audio/frost-explode_min.mp3');
var sfxPepperPickup  = new Audio('./audio/pepper-pickup_min.mp3');
var sfxPepperExplode = new Audio('./audio/pepper-explode_min.mp3');
var sfxPepperFire    = new Audio('./audio/pepper-burn_min.mp3');
[sfxBombPickup, sfxBombExplode, sfxLaserPickup, sfxLaserFire, sfxBullDie, sfxNormalDie].forEach(function(s) { s.volume = VOL.bombPickup; });
sfxFrostExplode.volume = VOL.frostExplode;
sfxHealPickup.volume = VOL.healPickup;
sfxItemSpawn.volume = VOL.itemSpawn;
sfxPepperPickup.volume = VOL.pepperPickup;
sfxPepperExplode.volume = VOL.pepperExplode;
sfxPepperFire.loop = true;
sfxPepperFire.volume = VOL.pepperFire;

var lastSfxClone = null;
function playSfx(snd) {
    if (!snd) return;
    var clone = new Audio(snd.src);
    clone.volume = snd.volume || 0.8;
    clone.play().catch(function(){});
    if (snd._trimEnd) {
        var dur = clone.duration;
        if (isNaN(dur)) { clone.onloadedmetadata = function() { var t = Math.max(0, clone.duration - snd._trimEnd); setTimeout(function(){ clone.pause(); }, t * 1000); }; }
        else { var t = Math.max(0, dur - snd._trimEnd); setTimeout(function(){ clone.pause(); }, t * 1000); }
    }
    clone.onended = function() { clone.src = ''; if (lastSfxClone === clone) lastSfxClone = null; };
    lastSfxClone = clone;
}
function stopAllSfx() {
    if (lastSfxClone) { lastSfxClone.pause(); lastSfxClone.src = ''; lastSfxClone = null; }
}

var items = [];
var itemPending = [];
var ITEM_LIFETIME = 40;

// 三线程刷新系统
var healSpawnTimer = 0;
var weaponSpawnTimer = 0;
var frostSpawnTimer = 0;
var HEAL_SPAWN_INTERVAL = 25;
var WEAPON_SPAWN_INTERVAL = 10;
var FROST_SPAWN_INTERVAL = 20;
var initialSpawnsDone = false;

// 多道具并行
var activeEffects = []; // [{ type, timer, duration, barEl }]
var nextEffectId = 0;

// 冰霜冲击
var frostFreeze = false;
var frostFreezeTimer = 0;
var frostExplodeParticles = [];
var frostSlowTimer = 0;
var frostSlowGlobal = 0;

// 火爆辣椒火焰圈
var pepperFires = [];
var pepperFireParticles = [];

// 击杀弹出提示
var killPopups = [];

// 道具水波特效
var ripples = [];
function spawnRipple(x, y) {
    ripples.push({ x: x, y: y, timer: 0, maxLife: 16 });
}
function updateRipples(dt) {
    for (var i = ripples.length - 1; i >= 0; i--) {
        ripples[i].timer += dt;
        if (ripples[i].timer >= ripples[i].maxLife) ripples.splice(i, 1);
    }
}
function drawRipples() {
    var mapDiag = Math.sqrt(gameCanvas.width * gameCanvas.width + gameCanvas.height * gameCanvas.height);
    for (var i = 0; i < ripples.length; i++) {
        var rp = ripples[i];
        var life = 1 - rp.timer / rp.maxLife;
        // 主扩散圈：每 2 秒一个新波
        var wavePhase = (rp.timer % 2) / 2; // 0→1 扩散
        var maxR = mapDiag * 0.55;
        var r = maxR * wavePhase;
        var alpha = (1 - wavePhase) * 0.56 * life;
        if (alpha > 0.005) {
            // 主圈
            ctx.strokeStyle = 'rgba(34,197,94,' + alpha + ')';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'rgba(34,197,94,' + (alpha * 0.5) + ')';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(rp.x, rp.y, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // 第二个稍小的圈（跟随，延迟 0.4s）
        var phase2 = ((rp.timer + 0.4) % 2) / 2;
        var r2 = maxR * phase2;
        var alpha2 = (1 - phase2) * 0.36 * life;
        if (alpha2 > 0.005) {
            ctx.strokeStyle = 'rgba(34,197,94,' + alpha2 + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(rp.x, rp.y, r2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// 成就追踪标记
var itemAchFlags = {
    usedHeal: false,
    healOverflow: false,
    bombKilledRonin: false,
    bombKilledBull: false,
    laserKilledRonin: false,
    laserKilledBull: false,
    bombOneShot100: false,
    usedFrost: false,
    frostKillN30: false,
    frostKillNCount: 0,
    frostKillR: false,
    frostKillB: false,
    frost3Bulls: false,
    usedPepper: false,
    frostDuringPepper: false,
    pepperDouble: false,
    pepperTriple: false,
    pepperFrostKill: false,
    pepperBombActive: false,
    pickedTypes: {}
};

// 道具筛选（调试面板）
var enabledItemIds = null;
(function() {
    try {
        var saved = localStorage.getItem('voidItemFilter');
        if (saved) enabledItemIds = JSON.parse(saved);
    } catch(e) { enabledItemIds = null; }
})();

function saveItemFilter() {
    if (enabledItemIds === null) localStorage.removeItem('voidItemFilter');
    else localStorage.setItem('voidItemFilter', JSON.stringify(enabledItemIds));
}
function getEnabledDefs() {
    if (enabledItemIds === null) return itemDefs;
    if (enabledItemIds.length === 0) return [];
    return itemDefs.filter(function(d) { return enabledItemIds.indexOf(d.id) !== -1; });
}

// 炸弹范围加成
var bombRangePercent = 100; // 简单100%, 普通从50%起, 困难从30%起
var bombPickupCount = 0;

var invincibleLeadTime = 0.3;
(function() {
    try {
        var saved = localStorage.getItem('voidInvincibleLead');
        if (saved !== null) invincibleLeadTime = parseFloat(saved);
    } catch(e) {}
})();

var pepperFireRadiusMult = 1.5;
(function() {
    try {
        var saved = localStorage.getItem('voidPepperFireRadius');
        if (saved !== null) pepperFireRadiusMult = parseFloat(saved);
    } catch(e) {}
})();

function getBombBaseRadius() { return player.r * 56; }
function getBombRadius() { return getBombBaseRadius() * bombRangePercent / 100; }

function initBombRange() {
    if (difficulty === 'easy')      { bombRangePercent = 100; }
    else if (difficulty === 'hard') { bombRangePercent = 20; }
    else                            { bombRangePercent = 40; }
    bombPickupCount = 0;
    updateBombRangeUI();
}

function onBombPickup() {
    if (difficulty === 'easy') return;
    var inc = 10;
    bombRangePercent = Math.min(100, bombRangePercent + inc);
    bombPickupCount++;
    updateBombRangeUI();
    if (typeof showNotify === 'function') {
        showNotify('炸弹范围加成 +' + inc + '%！(' + bombRangePercent + '%)', 'gold');
    }
}

function updateBombRangeUI() {
    var el = document.getElementById('bomb-range-bonus');
    if (!el) return;
    if (difficulty === 'easy') { el.style.display = 'none'; }
    else {
        el.style.display = 'block';
        el.textContent = '炸弹爆炸范围加成: ' + bombRangePercent + '%';
    }
}

// 道具定义
var itemImages = {};
(function() {
    var imgPaths = { heal: './img/items/heart.png', bomb: './img/items/bomb.png', laser: './img/items/laser.png', frost: './img/items/frost.png', pepper: './img/items/pepper.png' };
    for (var key in imgPaths) { var img = new Image(); img.src = imgPaths[key]; itemImages[key] = img; }
})();

var itemDefs = [
    {
        id: 'heal', name: '生命回复', color: '#ef4444', img: 'heal',
        desc: '生命回复一颗！', type: 'instant', weight: 4,
        onPickup: function() {
            playSfx(sfxHealPickup);
            player.invincible = true;
            setTimeout(function() { player.invincible = false; }, 1500);
            itemAchFlags.usedHeal = true;
            itemAchFlags.pickedTypes['heal'] = true;
            if (lives < maxLives) { lives++; updateHearts(); showItemPickup('生命回复一颗！'); }
            else { maxLives++; lives++; rebuildHearts(); showItemPickup('生命上限 +1！'); itemAchFlags.healOverflow = true; }
        }
    },
    {
        id: 'bomb', name: '炸弹', color: '#f59e0b', img: 'bomb',
        desc: '炸弹已激活！', type: 'timed', duration: 3, weight: 4,
        onPickup: function() {
            playSfx(sfxBombPickup);
            itemAchFlags.pickedTypes['bomb'] = true;
            onBombPickup();
            addEffect('bomb', 3);
        }
    },
    {
        id: 'laser', name: '激光枪', color: '#a855f7', img: 'laser',
        desc: '激光枪已激活！', type: 'timed', duration: 3, weight: 4,
        onPickup: function() {
            playSfx(sfxLaserPickup);
            itemAchFlags.pickedTypes['laser'] = true;
            addEffect('laser', 3);
        }
    },
    {
        id: 'frost', name: '冰霜冲击', color: '#60a5fa', img: 'frost',
        desc: '冰霜冲击已激活！', type: 'timed', duration: 0, weight: 2,
        onPickup: function() {
            itemAchFlags.pickedTypes['frost'] = true;
            triggerFrost();
        }
    },
    {
        id: 'pepper', name: '火爆辣椒', color: '#ef4444', img: 'pepper',
        desc: '火爆辣椒已激活！', type: 'timed', duration: 3, weight: 2,
        onPickup: function() {
            itemAchFlags.pickedTypes['pepper'] = true;
            itemAchFlags.usedPepper = true;
            addEffect('pepper', 3);
            playSfx(sfxPepperPickup);
        }
    }
];

// ---- 多道具效果管理 ----
function addEffect(type, duration) {
    var id = ++nextEffectId;
    activeEffects.push({ id: id, type: type, timer: duration, duration: duration, _invincibleTriggered: false });
    rebuildEffectBars();
}

function removeEffect(id) {
    for (var i = 0; i < activeEffects.length; i++) {
        if (activeEffects[i].id === id) { activeEffects.splice(i, 1); break; }
    }
    rebuildEffectBars();
}

function rebuildEffectBars() {
    var container = document.getElementById('effect-bars');
    if (!container) return;
    container.innerHTML = '';
    if (activeEffects.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    for (var i = 0; i < activeEffects.length; i++) {
        var ef = activeEffects[i];
        var barWrap = document.createElement('div');
        barWrap.style.cssText = 'width:180px;height:10px;background:#374151;border-radius:5px;overflow:hidden;';
        var barFill = document.createElement('div');
        barFill.style.cssText = 'height:100%;border-radius:5px;transition:width 0.1s linear;';
        barFill.style.background = ef.type === 'bomb' ? '#3b82f6' : (ef.type === 'pepper' || ef.type === 'pepperFire' ? '#ef4444' : (ef.type === 'frost' || ef.type === 'frostSlow' ? '#93c5fd' : '#a855f7'));
        barFill.style.width = (ef.timer / ef.duration * 100) + '%';
        barWrap.appendChild(barFill);

        var textEl = document.createElement('span');
        var tColor = ef.type === 'bomb' ? '#f59e0b' : (ef.type === 'pepper' || ef.type === 'pepperFire' ? '#ef4444' : (ef.type === 'frost' || ef.type === 'frostSlow' ? '#93c5fd' : '#a855f7'));
        textEl.style.cssText = 'color:' + tColor + ';font-size:12px;font-weight:bold;text-shadow:0 0 6px rgba(0,0,0,0.5);';

        container.appendChild(textEl);
        container.appendChild(barWrap);
        ef._textEl = textEl;
        ef._barFill = barFill;
        updateEffectBarText(ef);
    }
}

function updateEffectBarText(ef) {
    if (!ef._textEl) return;
    var name = ef.type === 'bomb' ? '炸弹' : (ef.type === 'pepper' ? '火爆辣椒' : (ef.type === 'pepperFire' ? '火焰圈' : (ef.type === 'frost' ? '冰霜冲击' : (ef.type === 'frostSlow' ? '冰霜减速' : '激光枪'))));
    var suffix = ef.type === 'bomb' || ef.type === 'pepper' ? '秒后爆炸' : (ef.type === 'pepperFire' ? '秒后消失' : (ef.type === 'frost' ? '秒后释放' : (ef.type === 'frostSlow' ? '秒' : '秒后发射')));
    var timeStr = (ef.type === 'bomb' || ef.type === 'laser' || ef.type === 'pepper' || ef.type === 'pepperFire') ? ef.timer.toFixed(1) : Math.ceil(ef.timer);
    ef._textEl.textContent = name + ' ' + timeStr + suffix;
}

// ---- 三线程生成系统 ----
function isItemEnabled(id) {
    if (enabledItemIds === null) return true;
    return enabledItemIds.indexOf(id) !== -1;
}

function getWeaponDefs() {
    var list = [];
    for (var i = 0; i < itemDefs.length; i++) {
        if ((itemDefs[i].id === 'bomb' || itemDefs[i].id === 'laser' || itemDefs[i].id === 'pepper') && isItemEnabled(itemDefs[i].id)) {
            list.push(itemDefs[i]);
        }
    }
    return list;
}

function spawnPending(def) {
    if (!def) return;
    var cw = gameCanvas.width, ch = gameCanvas.height, margin = 60;
    itemPending.push({ x: margin + Math.random() * (cw - margin * 2), y: margin + Math.random() * (ch - margin * 2), timer: 1, def: def });
}

function spawnHeal() {
    if (!isItemEnabled('heal')) return;
    var d = null;
    for (var i = 0; i < itemDefs.length; i++) { if (itemDefs[i].id === 'heal') { d = itemDefs[i]; break; } }
    spawnPending(d);
}

function spawnWeapon(count) {
    var weapons = getWeaponDefs();
    if (weapons.length === 0) return;
    for (var c = 0; c < count; c++) {
        var totalW = 0;
        for (var w = 0; w < weapons.length; w++) totalW += (weapons[w].weight || 1);
        var roll = Math.random() * totalW;
        var def = weapons[weapons.length - 1];
        for (var w2 = 0; w2 < weapons.length; w2++) { roll -= (weapons[w2].weight || 1); if (roll <= 0) { def = weapons[w2]; break; } }
        spawnPending(def);
    }
}

function spawnFrost() {
    if (!isItemEnabled('frost')) return;
    var d = null;
    for (var i = 0; i < itemDefs.length; i++) { if (itemDefs[i].id === 'frost') { d = itemDefs[i]; break; } }
    spawnPending(d);
}

function getWeaponCount() {
    var roll = Math.random();
    return roll < 0.25 ? 1 : (roll < 0.75 ? 2 : 3);
}

function getHealChance() {
    return 1.0;
}

function getFrostChance() {
    return 1.0;
}

function doInitialSpawns() {
    if (Math.random() < 0.8)   spawnHeal();
    if (Math.random() < 1.0)   spawnWeapon(1);
    if (Math.random() < 0.7)   spawnFrost();
    // 开局精英生成（由设置控制）
    var cw = gameCanvas.width, ch = gameCanvas.height, m = 80;
    if (settings.spawnRonin) spawnRoninAt(m + Math.random() * (cw - m * 2), m + Math.random() * (ch - m * 2));
    if (settings.spawnBull)  spawnBullAt(m + Math.random() * (cw - m * 2), m + Math.random() * (ch - m * 2));
    if (settings.spawnKui)   spawnKuiAt(m + Math.random() * (cw - m * 2), m + Math.random() * (ch - m * 2));
}

function itemInitialSpawn() {
    // 开局刷新由 itemSpawn 首帧处理
}

function itemSpawn(dt, t) {
    if (!initialSpawnsDone) {
        initialSpawnsDone = true;
        doInitialSpawns();
    }
    // 爱心线程
    healSpawnTimer += dt;
    if (healSpawnTimer >= HEAL_SPAWN_INTERVAL) {
        healSpawnTimer -= HEAL_SPAWN_INTERVAL;
        if (Math.random() < getHealChance()) spawnHeal();
    }
    // 武器线程
    weaponSpawnTimer += dt;
    if (weaponSpawnTimer >= WEAPON_SPAWN_INTERVAL) {
        weaponSpawnTimer -= WEAPON_SPAWN_INTERVAL;
        spawnWeapon(getWeaponCount());
    }
    // 寒冰线程
    frostSpawnTimer += dt;
    if (frostSpawnTimer >= FROST_SPAWN_INTERVAL) {
        frostSpawnTimer -= FROST_SPAWN_INTERVAL;
        if (Math.random() < getFrostChance()) spawnFrost();
    }
    // pending → 正式生成
    for (var i = itemPending.length - 1; i >= 0; i--) {
        itemPending[i].timer -= dt;
        if (itemPending[i].timer <= 0) {
            var p = itemPending[i]; itemPending.splice(i, 1);
            items.push({ x: p.x, y: p.y, r: player.r * 5, def: p.def, timer: 0 });
            spawnRipple(p.x, p.y);
            showItemSpawnNotify();
            playSfx(sfxItemSpawn);
        }
    }
}

// ---- 更新 ----
function itemUpdate(dt, t) {
    for (var i = items.length - 1; i >= 0; i--) {
        items[i].timer += dt;
        if (items[i].timer >= ITEM_LIFETIME) items.splice(i, 1);
    }
    // 多道具倒计时（冰冻期间只更新 frost 计时，其他暂停）
    for (var j = activeEffects.length - 1; j >= 0; j--) {
        var ef = activeEffects[j];
        if (frostFreeze && ef.type !== 'frost') continue;
        ef.timer -= dt;
        if (invincibleLeadTime > 0 && (ef.type === 'bomb' || ef.type === 'laser' || ef.type === 'pepper') && !ef._invincibleTriggered && ef.timer <= invincibleLeadTime) {
            ef._invincibleTriggered = true;
            player.invincible = true;
            setTimeout(function(){ player.invincible = false; }, 1500);
        }
        if (ef.timer <= 0) {
            ef.timer = 0;
            if (ef.type === 'bomb') triggerBomb();
            else if (ef.type === 'laser') triggerLaser();
            else if (ef.type === 'pepper') triggerPepper();
            else if (ef.type === 'frost') triggerFrostExplode();
            else if (ef.type === 'frostSlow') { /* 减速结束 */ }
            else if (ef.type === 'pepperFire') {
                var fid = ef._fireId;
                for (var _pf = pepperFires.length - 1; _pf >= 0; _pf--) { if (pepperFires[_pf].id === fid) { pepperFires.splice(_pf, 1); break; } }
            }
            removeEffect(ef.id);
        } else {
            updateEffectBarText(ef);
            if (ef._barFill) ef._barFill.style.width = (ef.timer / ef.duration * 100) + '%';
        }
    }
    if (bombFlash > 0) { bombFlash -= dt; if (bombFlash < 0) bombFlash = 0; }
    if (laserFlash > 0) { laserFlash -= dt; if (laserFlash < 0) laserFlash = 0; }
    for (var k = deathParticles.length - 1; k >= 0; k--) {
        var dp = deathParticles[k]; dp.x += dp.vx * dt; dp.y += dp.vy * dt; dp.life -= dt;
        if (dp.life <= 0) deathParticles.splice(k, 1);
    }
    // 击杀弹出更新
    for (var p = killPopups.length - 1; p >= 0; p--) {
        var kp = killPopups[p];
        kp.life -= dt;
        if (kp.life <= 0) { killPopups.splice(p, 1); continue; }
        if (kp.type === 'counter') {
            var prevC = kp.count;
            kp.elapsed += dt;
            var progress = Math.min(1, kp.elapsed / kp.animDuration);
            kp.count = Math.min(kp.targetCount, Math.floor(1 + progress * kp.targetCount));
            if (kp.count > prevC) playSfx(sfxNormalDie);
            if (progress >= 1 && kp.elapsed > kp.animDuration + 0.5) kp.life = Math.min(kp.life, 1.5); // fade out after done
        } else {
            kp.elapsed += dt;
            kp.y -= 18 * dt;
        }
    }
    updateRipples(dt);
    updateFrostFreeze(dt);
    updatePepperFire();
    updatePepperFireParticles(dt);
}

// ---- 击杀统计 & 粒子 ----
var deathParticles = [];
var killStats = { bomb: { normal: 0, ronin: 0, bull: 0, kui: 0 }, laser: { normal: 0, ronin: 0, bull: 0, kui: 0 }, pepper: { normal: 0, ronin: 0, bull: 0, kui: 0 } };
var killPoints = 0;

function addKillPoints(isElite, multiplier) {
    var pt = 0;
    if (difficulty === 'easy')      pt = isElite ? 10 : 1;
    else if (difficulty === 'hard') pt = isElite ? 30 : 5;
    else                            pt = isElite ? 15 : 2;
    pt = Math.round(pt * (multiplier || 1));
    killPoints += pt;
    if (typeof rankPoints !== 'undefined') rankPoints += pt;
    var rpEl = document.getElementById('rank-points-display');
    if (rpEl) {
        rpEl.textContent = '点数 +' + rankPoints;
        rpEl.classList.remove('kill-shake');
        void rpEl.offsetWidth;
        rpEl.classList.add('kill-shake');
    }
    // 冰霜成就追踪
    if (frostSlowTimer > 0) {
        if (!isElite) {
            itemAchFlags.frostKillNCount++;
            if (itemAchFlags.frostKillNCount >= 30) itemAchFlags.frostKillN30 = true;
        }
        if (isElite) {
            // Check if ronin or bull was killed — we don't know which here,
            // but the flags are set separately in kill functions below
        }
    }
}

function spawnDeathParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2, speed = 40 + Math.random() * 130;
        deathParticles.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 2 + Math.random() * 5, life: 0.4 + Math.random() * 0.6, color: color });
    }
}
function hitInRect(x, y, r, bx, by, bw, bh) { return x + r > bx && x - r < bx + bw && y + r > by && y - r < by + bh; }

// ---- 击杀弹出 ----
var killPopupAngleOffset = 0;

function createKillPopup(normalCount, roninCount, bullCount, source) {
    var px = player.x, py = player.y;
    // 火爆辣椒的击杀提示放在火焰圈旁边
    if (source === 'pepper' && pepperFires.length > 0) { var _pf2 = pepperFires[pepperFires.length - 1]; px = _pf2.x; py = _pf2.y; }
    var popupDist = player.r * 3.5;
    // 累加：如果已有同源 counter popup，叠加目标数量
    if (normalCount > 0 && source === 'pepper') {
        var existing = null;
        for (var e = killPopups.length - 1; e >= 0; e--) {
            if (killPopups[e].type === 'counter' && killPopups[e].source === 'pepper') { existing = killPopups[e]; break; }
        }
        if (existing) {
            existing.targetCount += normalCount;
            existing.maxLife = 4.8 - existing.elapsed + 1.5;
            if (existing.maxLife < 2) existing.maxLife = 2;
            existing.life = existing.maxLife;
            return;
        }
    }
    // 普通怪计数 — 占一个角度槽位
    if (normalCount > 0) {
        var ang = killPopupAngleOffset * 0.9;
        killPopups.push({
            baseX: px, baseY: py,
            x: px + Math.cos(ang) * popupDist, y: py + Math.sin(ang) * popupDist - player.r,
            life: 4.8, maxLife: 4.8,
            count: 0, targetCount: normalCount, elapsed: 0, animDuration: 2.8,
            type: 'counter', bouncing: true, source: source || ''
        });
        killPopupAngleOffset += 1.3;
    }
    // 精英怪 — 各占一个角度槽位
    for (var i = 0; i < roninCount; i++) {
        var ang2 = killPopupAngleOffset * 0.9;
        killPopups.push({
            baseX: px, baseY: py,
            x: px + Math.cos(ang2) * popupDist, y: py + Math.sin(ang2) * popupDist - player.r * 0.5,
            life: 2.5, maxLife: 2.5, elapsed: 0, type: 'elite', text: '击杀浪人!'
        });
        killPopupAngleOffset += 1.3;
    }
    for (var i = 0; i < bullCount; i++) {
        var ang3 = killPopupAngleOffset * 0.9;
        killPopups.push({
            baseX: px, baseY: py,
            x: px + Math.cos(ang3) * popupDist, y: py + Math.sin(ang3) * popupDist - player.r * 0.5,
            life: 2.5, maxLife: 2.5, elapsed: 0, type: 'elite', text: '击杀公牛!'
        });
        killPopupAngleOffset += 1.3;
    }
}

// ---- 炸弹爆炸 ----
function triggerBomb() {
    var radius = getBombRadius(), px = player.x, py = player.y;
    var prev = { normal: killStats.bomb.normal, ronin: killStats.bomb.ronin, bull: killStats.bomb.bull };
    if (typeof holes !== 'undefined') {
        for (var i = holes.length - 1; i >= 0; i--) {
            var dx = holes[i].x - px, dy = holes[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + holes[i].r) { spawnDeathParticles(holes[i].x, holes[i].y, '168,85,247', 10); killStats.bomb.normal++; addKillPoints(false); holes.splice(i, 1); }
        }
    }
    if (typeof ronins !== 'undefined') {
        for (var i = ronins.length - 1; i >= 0; i--) {
            var dx = ronins[i].x - px, dy = ronins[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + ronins[i].r) { spawnDeathParticles(ronins[i].x, ronins[i].y, '250,204,21', 14); killStats.bomb.ronin++; addKillPoints(true); if (frostSlowTimer>0) itemAchFlags.frostKillR=true; playSfx(sfxRoninDie); ronins.splice(i,1); }
        }
        for (var i = roninBullets.length - 1; i >= 0; i--) {
            var dx = roninBullets[i].x - px, dy = roninBullets[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + roninBullets[i].r) roninBullets.splice(i, 1);
        }
    }
    if (typeof bulls !== 'undefined') {
        for (var i = bulls.length - 1; i >= 0; i--) {
            var dx = bulls[i].x - px, dy = bulls[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + bulls[i].r) { spawnDeathParticles(bulls[i].x, bulls[i].y, '250,204,21', 14); killStats.bomb.bull++; addKillPoints(true); if (frostSlowTimer>0) itemAchFlags.frostKillB=true; playSfx(sfxBullDie); bulls.splice(i,1); }
        }
        for (var i = bullBullets.length - 1; i >= 0; i--) {
            var dx = bullBullets[i].x - px, dy = bullBullets[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + bullBullets[i].r) bullBullets.splice(i, 1);
        }
    }
    if (typeof kuis !== 'undefined') {
        for (var i = kuis.length - 1; i >= 0; i--) {
            var dx = kuis[i].x - px, dy = kuis[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + kuis[i].r) { triggerKuiDeath(i, 'bomb'); }
        }
        for (var i = kuiMinions.length - 1; i >= 0; i--) {
            var dx = kuiMinions[i].x - px, dy = kuiMinions[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + kuiMinions[i].r) {
                spawnDeathParticles(kuiMinions[i].x, kuiMinions[i].y, '156,163,175', 8);
                killStats.bomb.kui++; addKillPoints(true, 0.5);
                kuiMinions.splice(i, 1);
            }
        }
        for (var i = kuiMinionBullets.length - 1; i >= 0; i--) {
            var dx = kuiMinionBullets[i].x - px, dy = kuiMinionBullets[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + kuiMinionBullets[i].r) kuiMinionBullets.splice(i, 1);
        }
        for (var i = kuiBombs.length - 1; i >= 0; i--) {
            var dx = kuiBombs[i].x - px, dy = kuiBombs[i].y - py;
            if (Math.sqrt(dx * dx + dy * dy) < radius + kuiBombs[i].r) kuiBombs.splice(i, 1);
        }
    }
    var dN = killStats.bomb.normal - prev.normal;
    var dR = killStats.bomb.ronin - prev.ronin;
    var dB = killStats.bomb.bull - prev.bull;
    if (dR > 0) itemAchFlags.bombKilledRonin = true;
    if (dB > 0) itemAchFlags.bombKilledBull = true;
    if (dN >= 100) itemAchFlags.bombOneShot100 = true;
    if (dN + dR + dB > 0) createKillPopup(dN, dR, dB);
    playSfx(sfxBombExplode);
    bombFlash = BOMB_FLASH_DURATION;
    if (invincibleLeadTime <= 0) { player.invincible = true; setTimeout(function(){ player.invincible = false; }, 1500); }
}

// ---- 火爆辣椒 ----
function triggerPepper() {
    var radius = getBombBaseRadius() * 0.2 * pepperFireRadiusMult;
    var pf = { id: nextEffectId, x: player.x, y: player.y, radius: radius };
    pepperFires.push(pf);
    addEffect('pepperFire', 5);
    // 将 effect 与 fire 关联
    if (activeEffects.length > 0) activeEffects[activeEffects.length - 1]._fireId = pf.id;
    player.invincible = true; setTimeout(function(){ player.invincible = false; }, 1500);
    // 音效
    playSfx(sfxPepperExplode);
    sfxPepperFire.currentTime = 0;
    sfxPepperFire.play().catch(function(){});
}

function updatePepperFire() {
    for (var fi = pepperFires.length - 1; fi >= 0; fi--) {
        var pf = pepperFires[fi];
    var prev = { normal: killStats.pepper.normal, ronin: killStats.pepper.ronin, bull: killStats.pepper.bull };
    if (typeof holes !== 'undefined') {
        for (var i = holes.length - 1; i >= 0; i--) {
            var dx = holes[i].x - pf.x, dy = holes[i].y - pf.y;
            if (Math.sqrt(dx * dx + dy * dy) < pf.radius + holes[i].r) {
                spawnDeathParticles(holes[i].x, holes[i].y, '239,68,68', 10);
                killStats.pepper.normal++; addKillPoints(false);
                holes.splice(i, 1);
            }
        }
    }
    if (typeof ronins !== 'undefined') {
        for (var i = ronins.length - 1; i >= 0; i--) {
            var dx = ronins[i].x - pf.x, dy = ronins[i].y - pf.y;
            if (Math.sqrt(dx * dx + dy * dy) < pf.radius + ronins[i].r) {
                spawnDeathParticles(ronins[i].x, ronins[i].y, '250,204,21', 14);
                killStats.pepper.ronin++; addKillPoints(true);
                if (frostSlowTimer>0) itemAchFlags.frostKillR=true;
                playSfx(sfxRoninDie); ronins.splice(i, 1);
            }
        }
    }
    if (typeof bulls !== 'undefined') {
        for (var i = bulls.length - 1; i >= 0; i--) {
            var dx = bulls[i].x - pf.x, dy = bulls[i].y - pf.y;
            if (Math.sqrt(dx * dx + dy * dy) < pf.radius + bulls[i].r) {
                spawnDeathParticles(bulls[i].x, bulls[i].y, '250,204,21', 14);
                killStats.pepper.bull++; addKillPoints(true);
                if (frostSlowTimer>0) itemAchFlags.frostKillB=true;
                playSfx(sfxBullDie); bulls.splice(i, 1);
            }
        }
    }
    if (typeof kuis !== 'undefined') {
        for (var i = kuis.length - 1; i >= 0; i--) {
            var dx = kuis[i].x - pf.x, dy = kuis[i].y - pf.y;
            if (Math.sqrt(dx * dx + dy * dy) < pf.radius + kuis[i].r) {
                triggerKuiDeath(i, 'pepper');
            }
        }
        for (var i = kuiMinions.length - 1; i >= 0; i--) {
            var dx = kuiMinions[i].x - pf.x, dy = kuiMinions[i].y - pf.y;
            if (Math.sqrt(dx * dx + dy * dy) < pf.radius + kuiMinions[i].r) {
                spawnDeathParticles(kuiMinions[i].x, kuiMinions[i].y, '156,163,175', 8);
                killStats.pepper.kui++; addKillPoints(true, 0.5);
                kuiMinions.splice(i, 1);
            }
        }
    }
    var dN = killStats.pepper.normal - prev.normal;
    var dR = killStats.pepper.ronin - prev.ronin;
    var dB = killStats.pepper.bull - prev.bull;
    if (dN + dR + dB > 0) createKillPopup(dN, dR, dB, 'pepper');
    // 辣椒成就追踪
    if (pepperFires.length >= 2) itemAchFlags.pepperDouble = true;
    if (pepperFires.length >= 3) itemAchFlags.pepperTriple = true;
    if ((dR > 0 || dB > 0 || dN > 0) && frostSlowTimer > 0) itemAchFlags.pepperFrostKill = true;
    // 检测炸弹和辣椒同时存在
    for (var _be = 0; _be < activeEffects.length; _be++) {
        if (activeEffects[_be].type === 'bomb') { itemAchFlags.pepperBombActive = true; break; }
    }
    // 玩家受到伤害
    var pdx = player.x - pf.x, pdy = player.y - pf.y;
        if (Math.sqrt(pdx * pdx + pdy * pdy) < pf.radius + player.r) {
            if (!player.invincible) { lastHitSource = 'pepper_fire'; takeDamage(); }
        }
    }
}

function updatePepperFireParticles(dt) {
    if (pepperFires.length === 0) { pepperFireParticles = []; sfxPepperFire.pause(); sfxPepperFire.currentTime = 0; return; }
    // 粒子基于所有火焰圈生成
    for (var _pf3 = 0; _pf3 < pepperFires.length; _pf3++) {
        var pf = pepperFires[_pf3];
    // 每帧生成粒子
    var spawnCount = 4;
    for (var i = 0; i < spawnCount; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.random() * pf.radius * 0.85;
        pepperFireParticles.push({
            x: pf.x + Math.cos(angle) * dist,
            y: pf.y + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 40,
            vy: -30 - Math.random() * 80,
            life: 1.2 + Math.random() * 2.5,
            maxLife: 1.2 + Math.random() * 2.5,
            size: 2 + Math.random() * 6
        });
    }
    // 更新粒子
    for (var i = pepperFireParticles.length - 1; i >= 0; i--) {
        var p = pepperFireParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) { pepperFireParticles.splice(i, 1); continue; }
        // 粒子超出火焰圈范围则衰减更快
        var pdx2 = p.x - pf.x, pdy2 = p.y - pf.y;
        if (Math.sqrt(pdx2 * pdx2 + pdy2 * pdy2) > pf.radius) p.life -= dt * 2;
    }
    }
}

function drawPepperFireParticles() {
    for (var i = 0; i < pepperFireParticles.length; i++) {
        var p = pepperFireParticles[i];
        var alpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = 'rgba(255,140,30,' + (alpha * 0.7) + ')';
        ctx.shadowColor = 'rgba(255,80,20,' + (alpha * 0.6) + ')';
        ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
}

// ---- 激光发射 ----
var LASER_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#6366f1','#a855f7'];
var bombFlash = 0, BOMB_FLASH_DURATION = 0.4;
var laserFlash = 0, LASER_FLASH_DURATION = 0.35, laserColor = '', laserSecondWave = false;

function triggerLaser() {
    var px = player.x, py = player.y, bw = unitSize * 10, cw = gameCanvas.width, ch = gameCanvas.height;
    var prev = { normal: killStats.laser.normal, ronin: killStats.laser.ronin, bull: killStats.laser.bull, kui: killStats.laser.kui || 0 };
    laserColor = LASER_COLORS[Math.floor(Math.random() * LASER_COLORS.length)];
    laserFlash = LASER_FLASH_DURATION;
    // 第一波：十字方向（东南西北）
    killInBeam(px - bw/2, 0, bw, py);
    killInBeam(px - bw/2, py, bw, ch - py);
    killInBeamH(0, py - bw/2, px, bw);
    killInBeamH(px, py - bw/2, cw - px, bw);
    playSfx(sfxLaserFire);
    if (invincibleLeadTime <= 0) { player.invincible = true; setTimeout(function(){ player.invincible = false; }, 1500); }
    // 第二波：0.1秒后对角方向（四角），形成米字形
    setTimeout(function() {
        if (typeof paused !== 'undefined' && paused) return;
        killInBeamD(px, py, bw, 1);  // NE-SW
        killInBeamD(px, py, bw, -1); // NW-SE
        playSfx(sfxLaserFire);
        laserSecondWave = true;
        laserFlash = LASER_FLASH_DURATION;
        // 统计两波总击杀
        var dN = killStats.laser.normal - prev.normal;
        var dR = killStats.laser.ronin - prev.ronin;
        var dB = killStats.laser.bull - prev.bull;
        var dK = (killStats.laser.kui || 0) - prev.kui;
        if (dR > 0) itemAchFlags.laserKilledRonin = true;
        if (dB > 0) itemAchFlags.laserKilledBull = true;
        if (dN >= 100) itemAchFlags.bombOneShot100 = true;
        if (dN + dR + dB + dK > 0) createKillPopup(dN, dR, dB);
        // 闪光持续结束后隐藏对角渲染
        setTimeout(function() { laserSecondWave = false; }, LASER_FLASH_DURATION * 1000);
    }, 300);
}

function killInBeam(bx, by, bw, bh) {
    if (typeof holes !== 'undefined') for (var i = holes.length - 1; i >= 0; i--) { if (hitInRect(holes[i].x, holes[i].y, holes[i].r, bx, by, bw, bh)) { spawnDeathParticles(holes[i].x, holes[i].y, '168,85,247', 10); killStats.laser.normal++; addKillPoints(false); holes.splice(i, 1); } }
    if (typeof ronins !== 'undefined') {
        for (var i = ronins.length - 1; i >= 0; i--) { if (hitInRect(ronins[i].x, ronins[i].y, ronins[i].r, bx, by, bw, bh)) { spawnDeathParticles(ronins[i].x, ronins[i].y, '250,204,21', 14); killStats.laser.ronin++; addKillPoints(true); if (frostSlowTimer>0) itemAchFlags.frostKillR=true; playSfx(sfxRoninDie); ronins.splice(i,1); } }
        for (var i = roninBullets.length - 1; i >= 0; i--) { if (hitInRect(roninBullets[i].x, roninBullets[i].y, roninBullets[i].r, bx, by, bw, bh)) roninBullets.splice(i, 1); }
    }
    if (typeof bulls !== 'undefined') {
        for (var i = bulls.length - 1; i >= 0; i--) { if (hitInRect(bulls[i].x, bulls[i].y, bulls[i].r, bx, by, bw, bh)) { spawnDeathParticles(bulls[i].x, bulls[i].y, '250,204,21', 14); killStats.laser.bull++; addKillPoints(true); if (frostSlowTimer>0) itemAchFlags.frostKillB=true; playSfx(sfxBullDie); bulls.splice(i,1); } }
        for (var i = bullBullets.length - 1; i >= 0; i--) { if (hitInRect(bullBullets[i].x, bullBullets[i].y, bullBullets[i].r, bx, by, bw, bh)) bullBullets.splice(i, 1); }
    }
    if (typeof kuis !== 'undefined') {
        for (var i = kuis.length - 1; i >= 0; i--) { if (hitInRect(kuis[i].x, kuis[i].y, kuis[i].r, bx, by, bw, bh)) { triggerKuiDeath(i, 'laser'); } }
        for (var i = kuiMinions.length - 1; i >= 0; i--) { if (hitInRect(kuiMinions[i].x, kuiMinions[i].y, kuiMinions[i].r, bx, by, bw, bh)) { spawnDeathParticles(kuiMinions[i].x, kuiMinions[i].y, '156,163,175', 8); killStats.laser.kui++; addKillPoints(true, 0.5); kuiMinions.splice(i, 1); } }
        for (var i = kuiMinionBullets.length - 1; i >= 0; i--) { if (hitInRect(kuiMinionBullets[i].x, kuiMinionBullets[i].y, kuiMinionBullets[i].r, bx, by, bw, bh)) kuiMinionBullets.splice(i, 1); }
    }
}
function killInBeamH(bx, by, bw, bh) {
    if (typeof holes !== 'undefined') for (var i = holes.length - 1; i >= 0; i--) { if (hitInRect(holes[i].x, holes[i].y, holes[i].r, bx, by, bw, bh)) { spawnDeathParticles(holes[i].x, holes[i].y, '168,85,247', 10); killStats.laser.normal++; addKillPoints(false); holes.splice(i, 1); } }
    if (typeof ronins !== 'undefined') {
        for (var i = ronins.length - 1; i >= 0; i--) { if (hitInRect(ronins[i].x, ronins[i].y, ronins[i].r, bx, by, bw, bh)) { spawnDeathParticles(ronins[i].x, ronins[i].y, '250,204,21', 14); killStats.laser.ronin++; addKillPoints(true); if (frostSlowTimer>0) itemAchFlags.frostKillR=true; playSfx(sfxRoninDie); ronins.splice(i,1); } }
        for (var i = roninBullets.length - 1; i >= 0; i--) { if (hitInRect(roninBullets[i].x, roninBullets[i].y, roninBullets[i].r, bx, by, bw, bh)) roninBullets.splice(i, 1); }
    }
    if (typeof bulls !== 'undefined') {
        for (var i = bulls.length - 1; i >= 0; i--) { if (hitInRect(bulls[i].x, bulls[i].y, bulls[i].r, bx, by, bw, bh)) { spawnDeathParticles(bulls[i].x, bulls[i].y, '250,204,21', 14); killStats.laser.bull++; addKillPoints(true); if (frostSlowTimer>0) itemAchFlags.frostKillB=true; playSfx(sfxBullDie); bulls.splice(i,1); } }
        for (var i = bullBullets.length - 1; i >= 0; i--) { if (hitInRect(bullBullets[i].x, bullBullets[i].y, bullBullets[i].r, bx, by, bw, bh)) bullBullets.splice(i, 1); }
    }
    if (typeof kuis !== 'undefined') {
        for (var i = kuis.length - 1; i >= 0; i--) { if (hitInRect(kuis[i].x, kuis[i].y, kuis[i].r, bx, by, bw, bh)) { triggerKuiDeath(i, 'laser'); } }
        for (var i = kuiMinions.length - 1; i >= 0; i--) { if (hitInRect(kuiMinions[i].x, kuiMinions[i].y, kuiMinions[i].r, bx, by, bw, bh)) { spawnDeathParticles(kuiMinions[i].x, kuiMinions[i].y, '156,163,175', 8); killStats.laser.kui++; addKillPoints(true, 0.5); kuiMinions.splice(i, 1); } }
        for (var i = kuiMinionBullets.length - 1; i >= 0; i--) { if (hitInRect(kuiMinionBullets[i].x, kuiMinionBullets[i].y, kuiMinionBullets[i].r, bx, by, bw, bh)) kuiMinionBullets.splice(i, 1); }
    }
}

function killInBeamD(px, py, bw, dir) {
    // dir: 1 = NE-SW (x+y=const), -1 = NW-SE (x-y=const)
    var halfBw = bw * 0.5;
    function inBeam(ex, ey, r) {
        var d = dir === 1 ? Math.abs(ex + ey - (px + py)) : Math.abs(ex - ey - (px - py));
        return d / Math.SQRT2 < halfBw + (r || 0);
    }
    if (typeof holes !== 'undefined') for (var i = holes.length - 1; i >= 0; i--) { if (inBeam(holes[i].x, holes[i].y, holes[i].r)) { spawnDeathParticles(holes[i].x, holes[i].y, '168,85,247', 10); killStats.laser.normal++; addKillPoints(false); holes.splice(i, 1); } }
    if (typeof ronins !== 'undefined') {
        for (var i = ronins.length - 1; i >= 0; i--) { if (inBeam(ronins[i].x, ronins[i].y, ronins[i].r)) { spawnDeathParticles(ronins[i].x, ronins[i].y, '250,204,21', 14); killStats.laser.ronin++; addKillPoints(true); if (frostSlowTimer>0) itemAchFlags.frostKillR=true; playSfx(sfxRoninDie); ronins.splice(i,1); } }
        for (var i = roninBullets.length - 1; i >= 0; i--) { if (inBeam(roninBullets[i].x, roninBullets[i].y, roninBullets[i].r)) roninBullets.splice(i, 1); }
    }
    if (typeof bulls !== 'undefined') {
        for (var i = bulls.length - 1; i >= 0; i--) { if (inBeam(bulls[i].x, bulls[i].y, bulls[i].r)) { spawnDeathParticles(bulls[i].x, bulls[i].y, '250,204,21', 14); killStats.laser.bull++; addKillPoints(true); if (frostSlowTimer>0) itemAchFlags.frostKillB=true; playSfx(sfxBullDie); bulls.splice(i,1); } }
        for (var i = bullBullets.length - 1; i >= 0; i--) { if (inBeam(bullBullets[i].x, bullBullets[i].y, bullBullets[i].r)) bullBullets.splice(i, 1); }
    }
    if (typeof kuis !== 'undefined') {
        for (var i = kuis.length - 1; i >= 0; i--) { if (inBeam(kuis[i].x, kuis[i].y, kuis[i].r)) { triggerKuiDeath(i, 'laser'); } }
        for (var i = kuiMinions.length - 1; i >= 0; i--) { if (inBeam(kuiMinions[i].x, kuiMinions[i].y, kuiMinions[i].r)) { spawnDeathParticles(kuiMinions[i].x, kuiMinions[i].y, '156,163,175', 8); killStats.laser.kui++; addKillPoints(true, 0.5); kuiMinions.splice(i, 1); } }
        for (var i = kuiMinionBullets.length - 1; i >= 0; i--) { if (inBeam(kuiMinionBullets[i].x, kuiMinionBullets[i].y, kuiMinionBullets[i].r)) kuiMinionBullets.splice(i, 1); }
    }
}

// ---- 拾取 ----
function removeRippleNear(x, y) {
    for (var i = ripples.length - 1; i >= 0; i--) {
        var dx = ripples[i].x - x, dy = ripples[i].y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) { ripples.splice(i, 1); return; }
    }
}

// ---- 冰霜冲击 ----
function triggerFrost() {
    if (pepperFires.length > 0) itemAchFlags.frostDuringPepper = true;
    frostFreeze = true;
    frostExplodeParticles = [];
    frostSlowTimer = 0;
    addEffect('frost', 1.5);  // 用 effect 系统管理倒计时
    // 停止所有声音
    stopAllSfx();
    if (typeof currentGameTrack !== 'undefined' && currentGameTrack) { currentGameTrack.pause(); currentGameTrack.currentTime = 0; }
    // 移除道具刷新提示
    var spawnNotify = document.getElementById('item-spawn-notify');
    if (spawnNotify) { spawnNotify.style.display = 'none'; clearTimeout(spawnNotify._hideTimeout); }
    // 强制暂停按钮
    var pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) { pauseBtn.textContent = '冰霜冻结中'; pauseBtn.classList.add('show'); }
}

function triggerFrostExplode() {
    frostFreeze = false;
    playSfx(sfxFrostExplode);
    // 蓝色爆炸粒子
    var cx = gameCanvas.width / 2, cy = gameCanvas.height / 2;
    for (var i = 0; i < 30; i++) {
        var angle = Math.random() * Math.PI * 2, speed = 60 + Math.random() * 200;
        frostExplodeParticles.push({
            x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 8, life: 0.6 + Math.random() * 1.2
        });
    }
    // 标记减速
    frostSlowTimer = 15;
    frostSlowGlobal = 7.5;
    if (typeof holes !== 'undefined') for (var h = 0; h < holes.length; h++) { holes[h].frostSlow = 15; holes[h].frostSlowAmt = 0.2; }
    if (typeof ronins !== 'undefined') for (var r = 0; r < ronins.length; r++) { ronins[r].frostSlow = 15; ronins[r].frostSlowAmt = 0.2; }
    if (typeof bulls !== 'undefined') {
        var frozenBullCount = 0;
        for (var b = 0; b < bulls.length; b++) { bulls[b].frostSlow = 15; bulls[b].frostSlowAmt = 0.2; frozenBullCount++; }
        if (frozenBullCount >= 3) itemAchFlags.frost3Bulls = true;
    }
    // 恢复UI
    var pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) { pauseBtn.textContent = '空格以暂停'; pauseBtn.classList.remove('show'); }
    if (typeof clearPersistNotify === 'function') clearPersistNotify();
    // 减速能量条
    addEffect('frostSlow', 15);
    // 恢复音乐
    if (typeof currentGameTrack !== 'undefined' && currentGameTrack) currentGameTrack.play().catch(function(){});
    itemAchFlags.usedFrost = true;
}

function updateFrostFreeze(dt) {
    // 更新粒子
    for (var i = frostExplodeParticles.length - 1; i >= 0; i--) {
        var fp = frostExplodeParticles[i];
        fp.x += fp.vx * dt; fp.y += fp.vy * dt; fp.life -= dt;
        if (fp.life <= 0) frostExplodeParticles.splice(i, 1);
    }
    // 减速计时
    if (frostSlowTimer > 0) {
        frostSlowTimer -= dt;
        frostSlowGlobal = Math.max(0, frostSlowGlobal - dt);
        if (frostSlowTimer <= 0) {
            frostSlowTimer = 0;
            frostSlowGlobal = 0;
            if (typeof holes !== 'undefined') for (var h = 0; h < holes.length; h++) { holes[h].frostSlow = 0; holes[h].frostSlowAmt = 0; }
            if (typeof ronins !== 'undefined') for (var r = 0; r < ronins.length; r++) { ronins[r].frostSlow = 0; ronins[r].frostSlowAmt = 0; }
            if (typeof bulls !== 'undefined') for (var b = 0; b < bulls.length; b++) { bulls[b].frostSlow = 0; bulls[b].frostSlowAmt = 0; }
        }
    }
}

function renderFrostMushroom() {
    if (!frostFreeze) return;
    var cx = gameCanvas.width / 2, cy = gameCanvas.height / 2;
    var bounce = Math.abs(Math.sin(gameTime * 4)) * 20;
    var size = Math.min(gameCanvas.width, gameCanvas.height) * 0.45;
    // 冰蓝光晕
    var glow = ctx.createRadialGradient(cx, cy, size * 0.3, cx, cy, size);
    glow.addColorStop(0, 'rgba(147,197,253,0.25)');
    glow.addColorStop(0.6, 'rgba(96,165,250,0.1)');
    glow.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy + bounce, size, 0, Math.PI * 2); ctx.fill();
    // 蘑菇图片
    var img = itemImages['frost'];
    if (img && img.complete && img.naturalWidth > 0) {
        var halfS = size * 1.2;
        ctx.save();
        ctx.shadowColor = 'rgba(147,197,253,0.6)'; ctx.shadowBlur = 20;
        ctx.drawImage(img, cx - halfS, cy + bounce - halfS, halfS * 2, halfS * 2);
        ctx.restore();
    } else {
        ctx.fillStyle = '#60a5fa';
        ctx.shadowColor = '#93c5fd'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(cx, cy + bounce, size * 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    }
    // 倒计时文字（从 effect 读取剩余时间）
    var frostTimeLeft = 0;
    for (var e2 = 0; e2 < activeEffects.length; e2++) {
        if (activeEffects[e2].type === 'frost') { frostTimeLeft = activeEffects[e2].timer; break; }
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(59,130,246,0.8)'; ctx.shadowBlur = 12;
    ctx.fillText(Math.ceil(frostTimeLeft) + '', cx, cy + bounce);
    ctx.shadowBlur = 0;
}

function renderFrostParticles() {
    for (var i = 0; i < frostExplodeParticles.length; i++) {
        var fp = frostExplodeParticles[i], fade = Math.max(0, fp.life / 1.8);
        ctx.fillStyle = 'rgba(147,197,253,' + fade + ')';
        ctx.beginPath(); ctx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2); ctx.fill();
    }
}

function renderSnowflakeTrails() {
    if (frostSlowTimer <= 0) return;
    var allMonsters = [];
    if (typeof holes !== 'undefined') for (var h = 0; h < holes.length; h++) if (holes[h].frostSlow > 0) allMonsters.push(holes[h]);
    if (typeof ronins !== 'undefined') for (var r = 0; r < ronins.length; r++) if (ronins[r].frostSlow > 0) allMonsters.push(ronins[r]);
    if (typeof bulls !== 'undefined') for (var b = 0; b < bulls.length; b++) if (bulls[b].frostSlow > 0) allMonsters.push(bulls[b]);
    for (var m = 0; m < allMonsters.length; m++) {
        var mon = allMonsters[m];
        var seed = m * 17;
        for (var s = 0; s < 3; s++) {
            var offset = (gameTime * 3 + seed + s * 1.2) % 1;
            var sx = mon.x + Math.cos(seed + s) * offset * 18;
            var sy = mon.y + Math.sin(seed * 1.3 + s) * offset * 18;
            var alpha = (1 - offset) * 0.6;
            ctx.fillStyle = 'rgba(200,230,255,' + alpha + ')';
            ctx.font = (8 + (1 - offset) * 8) + 'px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('❄', sx, sy);
        }
    }
}

function drawFrostShape(x, y, r) {
    ctx.fillStyle = '#1e3a5f'; ctx.shadowColor = '#60a5fa'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold ' + (r * 0.35) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('❄', x, y);
}

function drawPepperShape(x, y, r) {
    ctx.fillStyle = '#7f1d1d'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(x, y - r * 0.5, r * 0.08, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#f97316'; ctx.font = 'bold ' + (r * 0.35) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🌶', x, y);
}

function itemCollision() {
    for (var i = items.length - 1; i >= 0; i--) {
        var it = items[i], dx = player.x - it.x, dy = player.y - it.y;
        if (Math.sqrt(dx * dx + dy * dy) < player.r + it.r) { removeRippleNear(it.x, it.y); it.def.onPickup(); items.splice(i, 1); }
    }
}

// ---- 渲染 ----
function itemRender() {
    drawRipples();
    for (var i = 0; i < itemPending.length; i++) {
        var p = itemPending[i], bounce = Math.abs(Math.sin(gameTime * 6 + i)) * 4;
        ctx.fillStyle = 'rgba(239,68,68,' + (0.5 + p.timer * 0.5) + ')';
        ctx.font = 'bold ' + (40 + bounce) + 'px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(239,68,68,0.8)'; ctx.shadowBlur = 12;
        ctx.fillText('?', p.x, p.y - bounce); ctx.shadowBlur = 0;
    }
    for (var j = 0; j < items.length; j++) {
        var it = items[j], bounce = Math.sin(gameTime * 5 + j * 1.7) * 8;
        drawItem(it, it.x, it.y + bounce);
    }
    // 力场 / 轨道（支持多个同时存在）
    var hasBomb = false, hasLaser = false, hasPepper = false;
    for (var e = 0; e < activeEffects.length; e++) {
        if (activeEffects[e].type === 'bomb' && activeEffects[e].timer > 0) hasBomb = true;
        if (activeEffects[e].type === 'laser' && activeEffects[e].timer > 0) hasLaser = true;
        if (activeEffects[e].type === 'pepper' && activeEffects[e].timer > 0) hasPepper = true;
    }
    if (hasBomb || hasLaser || hasPepper) drawWeaponCountdown();
    if (hasBomb) drawBombField();
    if (hasLaser) drawLaserOrbits();
    if (hasPepper) drawPepperField();
    if (bombFlash > 0) drawBombFlash();
    if (laserFlash > 0) drawLaserBeams();
    if (pepperFires.length > 0) drawPepperFire();
    renderFrostMushroom();
    renderFrostParticles();
    renderSnowflakeTrails();
    // 击杀弹出
    for (var p = 0; p < killPopups.length; p++) {
        var kp = killPopups[p];
        var fade = Math.max(0, Math.min(1, kp.life / kp.maxLife));
        var bounceY = 0;
        if (kp.type === 'counter') {
            var isDone = kp.elapsed >= kp.animDuration;
            if (!isDone) bounceY = Math.sin(kp.elapsed * 18) * 10;
            var r, g, b;
            if (kp.source === 'pepper') {
                if (kp.count >= 40)        { r = 255; g = 50;  b = 50; }
                else if (kp.count >= 20)   { r = 255; g = 200; b = 0; }
                else                       { r = 50;  g = 255; b = 80; }
            } else {
                if (kp.count >= 31)        { r = 255; g = 50;  b = 50; }
                else if (kp.count >= 16)   { r = 255; g = 200; b = 0; }
                else                       { r = 50;  g = 255; b = 80; }
            }
            ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + fade + ')';
            ctx.shadowColor = 'rgba(' + r + ',' + g + ',' + b + ',0.9)';
            ctx.shadowBlur = 14;
            ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('x' + kp.count, kp.x, kp.y + bounceY);
            ctx.shadowBlur = 0;
        } else {
            bounceY = Math.sin(kp.elapsed || gameTime * 8) * 4;
            ctx.fillStyle = 'rgba(255,220,50,' + fade + ')';
            ctx.shadowColor = 'rgba(255,200,30,0.9)';
            ctx.shadowBlur = 10;
            ctx.font = 'bold 22px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(kp.text, kp.x, kp.y + bounceY);
            ctx.shadowBlur = 0;
        }
    }
    for (var k = 0; k < deathParticles.length; k++) {
        var dp = deathParticles[k], fade = Math.max(0, dp.life / 0.6);
        ctx.fillStyle = 'rgba(' + dp.color + ',' + fade + ')';
        ctx.beginPath(); ctx.arc(dp.x, dp.y, dp.size, 0, Math.PI * 2); ctx.fill();
    }
}

function drawWeaponCountdown() {
    var minTimer = 999;
    for (var e = 0; e < activeEffects.length; e++) {
        var ef = activeEffects[e];
        if ((ef.type === 'bomb' || ef.type === 'laser' || ef.type === 'pepper') && ef.timer < minTimer) minTimer = ef.timer;
    }
    if (minTimer >= 999) return;
    var text = minTimer.toFixed(1) + 's';
    var x = player.x;
    var y = player.y - player.r * 3.5;
    var shakeX = 0;
    var color1, color2;
    if (minTimer > 2) {
        color1 = '#22c55e'; color2 = '#4ade80';
    } else if (minTimer > 1) {
        color1 = '#eab308'; color2 = '#facc15';
    } else {
        color1 = '#ef4444'; color2 = '#dc2626';
        shakeX = Math.sin(gameTime * 40) * player.r * 2.5;
    }
    ctx.font = 'bold ' + (player.r * 5.5) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var grad = ctx.createLinearGradient(x - player.r * 3, y - player.r * 1.5, x + player.r * 3, y + player.r * 1.5);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.shadowColor = color1; ctx.shadowBlur = 12;
    ctx.fillText(text, x + shakeX, y);
    ctx.shadowBlur = 0;
}

function drawBombField() {
    var radius = getBombRadius();
    var progress = 0.5; // default mid-progress if multiple bombs
    // use the bomb with the smallest timer for progress
    var minTimer = 999;
    for (var e = 0; e < activeEffects.length; e++) {
        if (activeEffects[e].type === 'bomb' && activeEffects[e].timer < minTimer) minTimer = activeEffects[e].timer;
    }
    if (minTimer < 999) progress = 1 - minTimer / 3;
    var color;
    if (progress < 0.33) color = lerpColor('#22c55e', '#84cc16', progress / 0.33);
    else if (progress < 0.66) color = lerpColor('#eab308', '#f97316', (progress - 0.33) / 0.33);
    else color = lerpColor('#ef4444', '#dc2626', (progress - 0.66) / 0.34);
    var pulse = Math.sin(gameTime * 10) * 5;
    ctx.globalAlpha = 0.12; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(player.x, player.y, radius + pulse, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.shadowColor = color; ctx.shadowBlur = 18;
    ctx.setLineDash([10, 5]);
    ctx.beginPath(); ctx.arc(player.x, player.y, radius + pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur = 0;
}

function drawBombFlash() {
    var alpha = bombFlash / BOMB_FLASH_DURATION;
    var flashR = getBombRadius() * (1 + (1 - alpha) * 2);
    var flashGlow = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, flashR);
    flashGlow.addColorStop(0, 'rgba(255,255,255,' + (alpha * 0.9) + ')');
    flashGlow.addColorStop(0.4, 'rgba(255,220,100,' + (alpha * 0.5) + ')');
    flashGlow.addColorStop(1, 'rgba(255,100,50,0)');
    ctx.fillStyle = flashGlow;
    ctx.beginPath(); ctx.arc(player.x, player.y, flashR, 0, Math.PI * 2); ctx.fill();
}

function drawPepperField() {
    var radius = getBombRadius();
    var minTimer = 999;
    for (var e = 0; e < activeEffects.length; e++) {
        if (activeEffects[e].type === 'pepper' && activeEffects[e].timer < minTimer) minTimer = activeEffects[e].timer;
    }
    var progress = minTimer < 999 ? 1 - minTimer / 3 : 0.5;
    var pulse = Math.sin(gameTime * 12) * 6 + Math.sin(gameTime * 21) * 3;
    // 外圈火焰光晕
    var outerR = radius + pulse * 3;
    var flameGlow = ctx.createRadialGradient(player.x, player.y, outerR * 0.4, player.x, player.y, outerR);
    flameGlow.addColorStop(0, 'rgba(255,80,20,0.25)');
    flameGlow.addColorStop(0.5, 'rgba(239,68,68,0.12)');
    flameGlow.addColorStop(1, 'rgba(200,30,30,0)');
    ctx.fillStyle = flameGlow;
    ctx.beginPath(); ctx.arc(player.x, player.y, outerR, 0, Math.PI * 2); ctx.fill();
    // 内圈
    ctx.strokeStyle = progress < 0.33 ? '#f97316' : (progress < 0.66 ? '#ef4444' : '#dc2626');
    ctx.lineWidth = 3; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 14;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.arc(player.x, player.y, radius * 0.6 + pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur = 0;
}

function drawPepperFire() {
    for (var _pf4 = 0; _pf4 < pepperFires.length; _pf4++) {
        var pf = pepperFires[_pf4];
    // 火焰圈主体
    var glow = ctx.createRadialGradient(pf.x, pf.y, pf.radius * 0.5, pf.x, pf.y, pf.radius);
    glow.addColorStop(0, 'rgba(255,60,20,0.3)');
    glow.addColorStop(0.7, 'rgba(239,68,68,0.15)');
    glow.addColorStop(1, 'rgba(200,30,30,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(pf.x, pf.y, pf.radius, 0, Math.PI * 2); ctx.fill();
    // 粒子
    drawPepperFireParticles();
    // 倒计时文字
    var timeLeft = 0;
    for (var e = 0; e < activeEffects.length; e++) {
        if (activeEffects[e].type === 'pepperFire') { timeLeft = activeEffects[e].timer; break; }
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + (player.r * 4) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(239,68,68,0.9)'; ctx.shadowBlur = 12;
    ctx.fillText(timeLeft.toFixed(1) + 's', pf.x, pf.y);
    ctx.shadowBlur = 0;
    }
}

function drawLaserOrbits() {
    var minTimer = 999;
    for (var e = 0; e < activeEffects.length; e++) { if (activeEffects[e].type === 'laser' && activeEffects[e].timer < minTimer) minTimer = activeEffects[e].timer; }
    var progress = minTimer < 999 ? 1 - minTimer / 3 : 0.5;
    var orbitR = player.r * 2.5 + progress * player.r;
    var speed = 3 + progress * 8, angle = gameTime * speed;
    var directions = [
        { ax: Math.PI/2,  rgb: '168,85,247' },
        { ax: 0,         rgb: '234,179,8'   },
        { ax: Math.PI,   rgb: '34,197,94'   },
        { ax: -Math.PI/2,rgb: '59,130,246'  }
    ];
    var cx = player.x, cy = player.y;
    ctx.strokeStyle = 'rgba(168,85,247,0.12)'; ctx.lineWidth = 1; ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - orbitR); ctx.lineTo(cx, cy + orbitR);
    ctx.moveTo(cx - orbitR, cy); ctx.lineTo(cx + orbitR, cy);
    ctx.stroke(); ctx.setLineDash([]);
    for (var d = 0; d < directions.length; d++) {
        var dir = directions[d], ox = cx + Math.cos(angle + dir.ax) * orbitR, oy = cy + Math.sin(angle + dir.ax) * orbitR;
        var circleR = player.r * 1.5 + progress * player.r * 1.05, alpha = 0.3 + progress * 0.4;
        var glow = ctx.createRadialGradient(ox, oy, circleR * 0.3, ox, oy, circleR * 2);
        glow.addColorStop(0, 'rgba(' + dir.rgb + ',' + alpha + ')');
        glow.addColorStop(1, 'rgba(' + dir.rgb + ',0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ox, oy, circleR * 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(' + dir.rgb + ',' + (alpha + 0.2) + ')';
        ctx.shadowColor = 'rgba(' + dir.rgb + ',0.6)'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(ox, oy, circleR, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawLaserBeams() {
    var alpha = laserFlash / LASER_FLASH_DURATION, bw = unitSize * 10;
    var px = player.x, py = player.y, cw = gameCanvas.width, ch = gameCanvas.height;
    ctx.globalAlpha = alpha; ctx.fillStyle = laserColor; ctx.shadowColor = laserColor; ctx.shadowBlur = 20;
    // 十字方向
    ctx.fillRect(px - bw/2, 0, bw, py);
    ctx.fillRect(px - bw/2, py, bw, ch - py);
    ctx.fillRect(0, py - bw/2, px, bw);
    ctx.fillRect(px, py - bw/2, cw - px, bw);
    // 对角方向（米字形第二波，仅第二波发射后才渲染）
    if (laserSecondWave) {
        var diagLen = Math.sqrt(cw * cw + ch * ch);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-bw/2, -diagLen, bw, diagLen * 2);
        ctx.restore();
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-Math.PI / 4);
        ctx.fillRect(-bw/2, -diagLen, bw, diagLen * 2);
        ctx.restore();
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
}

// ---- 道具绘制 ----
function drawItem(it, x, y) {
    var def = it.def, r = it.r, img = def.img ? itemImages[def.img] : null;
    var flicker = 0.5 + Math.random() * 0.5, alpha = 0.28, glowR = 1.25, glowRgb = '255,60,60';
    if (def.id === 'bomb') { alpha = 0.3; glowR = 1.3; glowRgb = '245,158,11'; }
    if (def.id === 'laser') { alpha = 0.3; glowR = 1.3; glowRgb = '168,85,247'; }
    if (def.id === 'pepper') { alpha = 0.3; glowR = 1.3; glowRgb = '239,68,68'; }
    if (def.id === 'frost') { alpha = 0.3; glowR = 1.3; glowRgb = '96,165,250'; }
    var auraGlow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * glowR);
    auraGlow.addColorStop(0, 'rgba(' + glowRgb + ',' + (alpha * flicker) + ')');
    auraGlow.addColorStop(1, 'rgba(' + glowRgb + ',0)');
    ctx.fillStyle = auraGlow; ctx.beginPath(); ctx.arc(x, y, r * glowR, 0, Math.PI * 2); ctx.fill();
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.save(); ctx.shadowColor = def.color; ctx.shadowBlur = 8;
        ctx.drawImage(img, x - r, y - r, r * 2, r * 2); ctx.restore();
    } else if (def.id === 'heal') drawHeartShape(x, y, r);
    else if (def.id === 'bomb') drawBombShape(x, y, r);
    else if (def.id === 'laser') drawLaserShape(x, y, r);
    else if (def.id === 'pepper') drawPepperShape(x, y, r);
    else if (def.id === 'frost') drawFrostShape(x, y, r);
    var remaining = ITEM_LIFETIME - it.timer;
    if (remaining < 10 && Math.floor(gameTime * 3) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 10px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.ceil(remaining) + 's', x, y + r + 8);
    }
}

function drawHeartShape(x, y, r) {
    ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 12;
    var s = r * 0.55;
    ctx.beginPath(); ctx.moveTo(x, y + s * 0.25);
    ctx.bezierCurveTo(x, y - s * 0.6, x - s, y - s * 0.25, x - s, y + s * 0.15);
    ctx.bezierCurveTo(x - s, y + s * 0.55, x, y + s * 0.9, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.9, x + s, y + s * 0.55, x + s, y + s * 0.15);
    ctx.bezierCurveTo(x + s, y - s * 0.25, x, y - s * 0.6, x, y + s * 0.25);
    ctx.fill(); ctx.shadowBlur = 0;
}

function drawBombShape(x, y, r) {
    ctx.fillStyle = '#1e1b4b'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(x, y - r * 0.5, r * 0.08, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold ' + (r * 0.4) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💣', x, y);
}

function drawLaserShape(x, y, r) {
    ctx.fillStyle = '#4c1d95'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 10;
    ctx.fillRect(x - r * 0.3, y - r * 0.55, r * 0.6, r * 1.1);
    ctx.fillStyle = '#a855f7'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(x, y - r * 0.55, r * 0.12, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#c084fc'; ctx.font = 'bold ' + (r * 0.35) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⚡', x, y);
}

// ---- 重置 ----
function itemReset() {
    items = []; itemPending = [];
    healSpawnTimer = 0; weaponSpawnTimer = 0; frostSpawnTimer = 0;
    initialSpawnsDone = false;
    activeEffects = [];
    var container = document.getElementById('effect-bars');
    if (container) { container.innerHTML = ''; container.style.display = 'none'; }
    bombFlash = 0; laserFlash = 0; laserColor = ''; laserSecondWave = false;
    deathParticles = [];
    killPopups = [];
    ripples = [];
    killStats = { bomb: { normal: 0, ronin: 0, bull: 0, kui: 0 }, laser: { normal: 0, ronin: 0, bull: 0, kui: 0 }, pepper: { normal: 0, ronin: 0, bull: 0, kui: 0 } };
    killPoints = 0;
    frostFreeze = false; frostExplodeParticles = []; frostSlowTimer = 0; frostSlowGlobal = 0;
    pepperFires = []; pepperFireParticles = []; sfxPepperFire.pause(); sfxPepperFire.currentTime = 0;
    itemAchFlags = { usedHeal: false, healOverflow: false, bombKilledRonin: false, bombKilledBull: false, laserKilledRonin: false, laserKilledBull: false, bombOneShot100: false, usedFrost: false, frostKillN30: false, frostKillNCount: 0, frostKillR: false, frostKillB: false, frost3Bulls: false, usedPepper: false, frostDuringPepper: false, pepperDouble: false, pepperTriple: false, pepperFrostKill: false, pepperBombActive: false, pickedTypes: {} };
    initBombRange();
}

// ---- UI 通知 ----
function showItemSpawnNotify() {
    var el = document.getElementById('item-spawn-notify'); if (!el) return;
    el.style.display = 'block'; clearTimeout(el._hideTimeout);
    el._hideTimeout = setTimeout(function() { el.style.display = 'none'; }, 4000);
}
function showItemPickup(msg) {
    var status = document.getElementById('item-status'), nameEl = document.getElementById('item-status-name'), barWrap = document.getElementById('item-status-bar-wrap');
    if (!status || !nameEl) return;
    status.style.display = 'flex'; nameEl.textContent = msg; barWrap.style.display = 'none';
    clearTimeout(status._hideTimeout);
    status._hideTimeout = setTimeout(function() { status.style.display = 'none'; }, 6000);
}
function hideEffectUI() {
    var container = document.getElementById('effect-bars');
    if (container) { container.innerHTML = ''; container.style.display = 'none'; }
}

// ---- HP UI ----
function rebuildHearts() {
    var hpDiv = document.getElementById('hp-display'); if (!hpDiv) return;
    hpDiv.innerHTML = '';
    for (var hi = 0; hi < maxLives; hi++) { var heart = document.createElement('span'); heart.className = 'heart-icon'; hpDiv.appendChild(heart); }
    updateHearts();
}
