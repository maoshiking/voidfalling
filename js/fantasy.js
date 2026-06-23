// ==================== 虚空坠落 - 特殊怪物/Boss系统 ====================

// ---- 浪人 (Ronin) 精英怪 ----
var ronins = [];
var roninBullets = [];
var roninPending = []; // 1秒预警
var roninSpawnTimer = 0;

// ---- 公牛 (Bull) 精英怪 ----
var bulls = [];
var bullBullets = [];
var bullPending = [];
var bullSpawnTimer = 0;

// ---- 魁首 (Kui) 精英怪 ----
var kuis = [];
var kuiMinions = [];
var kuiMinionBullets = [];
var kuiPending = [];
var kuiSpawnTimer = 0;
var kuiBombs = []; // 分裂炸弹

// ---- 魁音效 ----
var sfxKuiExplode = new Audio('./audio/kui-explode_min.mp3');
sfxKuiExplode.volume = VOL.kuiExplode;
var sfxKuiMinionSpawn = new Audio('./audio/kui-minion_min.mp3');
sfxKuiMinionSpawn.volume = VOL.kuiMinionSpawn;

// ---- 蘑菇云爆炸特效 ----
var mushroomClouds = [];

function fantasySpawn(dt, t) {
    var spawnInterval, maxRonins;
    if (difficulty === 'easy')      { spawnInterval = 60; maxRonins = 2; }
    else if (difficulty === 'hard') { spawnInterval = 20; maxRonins = 8; }
    else                            { spawnInterval = 40; maxRonins = 3; }

    roninSpawnTimer += dt;
    if (roninSpawnTimer >= spawnInterval && ronins.length + roninPending.length < maxRonins) {
        roninSpawnTimer = 0;
        var cw = gameCanvas.width, ch = gameCanvas.height, margin = 80;
        roninPending.push({
            x: margin + Math.random() * (cw - margin * 2),
            y: margin + Math.random() * (ch - margin * 2),
            timer: 1
        });
    }

    // 预警倒计时
    for (var pi = roninPending.length - 1; pi >= 0; pi--) {
        roninPending[pi].timer -= dt;
        if (roninPending[pi].timer <= 0) {
            var pp = roninPending[pi];
            roninPending.splice(pi, 1);
            spawnRoninAt(pp.x, pp.y);
        }
    }

    // ---- 公牛生成 ----
    var bullSpawnInterval, maxBulls;
    if (difficulty === 'easy')      { bullSpawnInterval = 180; maxBulls = 2; }
    else if (difficulty === 'hard') { bullSpawnInterval = 25; maxBulls = 5; }
    else                            { bullSpawnInterval = 120; maxBulls = 4; }

    bullSpawnTimer += dt;
    if (bullSpawnTimer >= bullSpawnInterval && bulls.length + bullPending.length < maxBulls) {
        bullSpawnTimer = 0;
        var cw2 = gameCanvas.width, ch2 = gameCanvas.height, margin2 = 80;
        bullPending.push({
            x: margin2 + Math.random() * (cw2 - margin2 * 2),
            y: margin2 + Math.random() * (ch2 - margin2 * 2),
            timer: 1
        });
    }

    for (var pj = bullPending.length - 1; pj >= 0; pj--) {
        bullPending[pj].timer -= dt;
        if (bullPending[pj].timer <= 0) {
            var bp = bullPending[pj];
            bullPending.splice(pj, 1);
            spawnBullAt(bp.x, bp.y);
        }
    }

    // ---- 魁首生成 ----
    var kuiSpawnInterval, maxKuis;
    if (difficulty === 'easy')      { kuiSpawnInterval = 210; maxKuis = 2; }
    else if (difficulty === 'hard') { kuiSpawnInterval = 40; maxKuis = 4; }
    else                            { kuiSpawnInterval = 140; maxKuis = 3; }

    kuiSpawnTimer += dt;
    if (kuiSpawnTimer >= kuiSpawnInterval && kuis.length + kuiPending.length < maxKuis) {
        kuiSpawnTimer = 0;
        var cw3 = gameCanvas.width, ch3 = gameCanvas.height, margin3 = 80;
        kuiPending.push({
            x: margin3 + Math.random() * (cw3 - margin3 * 2),
            y: margin3 + Math.random() * (ch3 - margin3 * 2),
            timer: 1
        });
    }

    for (var pk = kuiPending.length - 1; pk >= 0; pk--) {
        kuiPending[pk].timer -= dt;
        if (kuiPending[pk].timer <= 0) {
            var kp = kuiPending[pk];
            kuiPending.splice(pk, 1);
            spawnKuiAt(kp.x, kp.y);
        }
    }
}

function spawnRoninAt(x, y) {
    var r = unitSize * 8;
    var newRonin = {
        x: x, y: y, r: r,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        attackTimer: 0,
        colorPhase: 0
    };
    if (typeof frostSlowGlobal !== 'undefined' && frostSlowGlobal > 0) { newRonin.frostSlow = frostSlowGlobal; newRonin.frostSlowAmt = 0.5; }
    ronins.push(newRonin);
}

function spawnRonin() {} // 兼容旧调用

function spawnBullAt(x, y) {
    var r = unitSize * 11;
    var newBull = {
        x: x, y: y, r: r,
        state: 'chasing',
        stateTimer: 0,
        lockX: 0, lockY: 0,
        chargeVx: 0, chargeVy: 0,
        chargeStartX: 0, chargeStartY: 0,
        fireTimer: 0
    };
    if (typeof frostSlowGlobal !== 'undefined' && frostSlowGlobal > 0) { newBull.frostSlow = frostSlowGlobal; newBull.frostSlowAmt = 0.5; }
    bulls.push(newBull);
}

function spawnKuiAt(x, y) {
    var r = unitSize * 12;
    var newKui = {
        x: x, y: y, r: r,
        state: 'alive',
        deathTimer: 0,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40
    };
    // 魁免疫减速
    kuis.push(newKui);
}

function triggerKuiDeath(kuiIndex, source) {
    var kui = kuis[kuiIndex];
    if (!kui || kui.state !== 'alive') return;
    kui.state = 'dying';
    kui.deathTimer = 3;
    kui.vx = 0;
    kui.vy = 0;
    kui.killedBy = source || 'bomb';
}

function spawnMushroomCloud(x, y) {
    mushroomClouds.push({
        x: x, y: y,
        timer: 0,
        maxTimer: 1.8,
        pillarHeight: 0,
        cloudRadius: 0,
        alpha: 1
    });
}

function fireBullBullets(bull) {
    var bulletSpeed = unitSize * 40;
    var bulletR = player.r * 2.1;
    var baseAngle = Math.atan2(bull.chargeVy, bull.chargeVx);
    var spread = Math.PI / 12;
    for (var i = 0; i < 4; i++) {
        var angle = baseAngle + (i - 1.5) * spread;
        bullBullets.push({
            x: bull.x, y: bull.y, r: bulletR,
            vx: Math.cos(angle) * bulletSpeed,
            vy: Math.sin(angle) * bulletSpeed
        });
    }
}

function fantasyUpdate(dt, t) {
    var cw = gameCanvas.width;
    var ch = gameCanvas.height;

    for (var i = 0; i < ronins.length; i++) {
        var rn = ronins[i];

        rn.vx += (Math.random() - 0.5) * 30 * dt;
        rn.vy += (Math.random() - 0.5) * 30 * dt;
        var spd = Math.sqrt(rn.vx * rn.vx + rn.vy * rn.vy);
        if (spd > 480) { rn.vx = rn.vx / spd * 480; rn.vy = rn.vy / spd * 480; }
        var rnSlow = (rn.frostSlow > 0) ? (rn.frostSlowAmt || 0.2) : 1;
        rn.x += rn.vx * rnSlow * dt;
        rn.y += rn.vy * rnSlow * dt;

        if (rn.x < rn.r) { rn.x = rn.r; rn.vx *= -1; }
        if (rn.x > cw - rn.r) { rn.x = cw - rn.r; rn.vx *= -1; }
        if (rn.y < rn.r) { rn.y = rn.r; rn.vy *= -1; }
        if (rn.y > ch - rn.r) { rn.y = ch - rn.r; rn.vy *= -1; }

        // 与普通怪推开
        for (var j = 0; j < holes.length; j++) {
            var h = holes[j];
            var dx = rn.x - h.x, dy = rn.y - h.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var minDist = rn.r + h.r + 4;
            if (dist < minDist && dist > 0.01) {
                var f = (minDist - dist) / minDist * 60;
                rn.x += dx / dist * f * dt;
                rn.y += dy / dist * f * dt;
                h.x -= dx / dist * f * dt * 0.5;
                h.y -= dy / dist * f * dt * 0.5;
            }
        }

        // 5秒攻击循环：绿(0~1.7s)→黄(1.7~3.3s)→红(3.3~5s)→发射
        rn.attackTimer += dt;
        if (rn.attackTimer >= 5) {
            rn.attackTimer = 0;
            rn.colorPhase = 2;
            fireRoninBullets(rn);
        } else if (rn.attackTimer >= 3.3) { rn.colorPhase = 2; }
        else if (rn.attackTimer >= 1.7) { rn.colorPhase = 1; }
        else { rn.colorPhase = 0; }
    }

    // 子弹移动
    for (var bi = roninBullets.length - 1; bi >= 0; bi--) {
        var b = roninBullets[bi];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 0 || b.x > cw || b.y < 0 || b.y > ch) {
            roninBullets.splice(bi, 1);
        }
    }

    // ---- 公牛更新 ----
    for (var k = 0; k < bulls.length; k++) {
        var bull = bulls[k];

        // 与普通怪推开
        for (var j = 0; j < holes.length; j++) {
            var h = holes[j];
            var bdx = bull.x - h.x, bdy = bull.y - h.y;
            var bdist = Math.sqrt(bdx * bdx + bdy * bdy);
            var bminDist = bull.r + h.r + 4;
            if (bdist < bminDist && bdist > 0.01) {
                var bf = (bminDist - bdist) / bminDist * 60;
                bull.x += bdx / bdist * bf * dt;
                bull.y += bdy / bdist * bf * dt;
                h.x -= bdx / bdist * bf * dt * 0.5;
                h.y -= bdy / bdist * bf * dt * 0.5;
            }
        }

        if (bull.state === 'chasing') {
            var pdx = player.x - bull.x;
            var pdy = player.y - bull.y;
            var bSlow = (bull.frostSlow > 0) ? (bull.frostSlowAmt || 0.2) : 1;
            var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist > 0.01) {
                bull.x += pdx / pdist * 120 * bSlow * dt;
                bull.y += pdy / pdist * 120 * bSlow * dt;
            }
            if (pdist < 150) {
                bull.state = 'locking';
                bull.stateTimer = 0;
                bull.lockX = player.x;
                bull.lockY = player.y;
            }
        } else if (bull.state === 'locking') {
            bull.stateTimer += dt;
            if (bull.stateTimer >= 0.8) {
                bull.state = 'charging';
                bull.stateTimer = 0;
                bull.fireTimer = 0;
                bull.chargeStartX = bull.x;
                bull.chargeStartY = bull.y;
                var cdx = bull.lockX - bull.x;
                var cdy = bull.lockY - bull.y;
                var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                if (cdist > 0.01) {
                    bull.chargeVx = cdx / cdist * 240;
                    bull.chargeVy = cdy / cdist * 240;
                } else {
                    bull.chargeVx = 0;
                    bull.chargeVy = -240;
                }
            }
        } else if (bull.state === 'charging') {
            var bSlow2 = (bull.frostSlow > 0) ? (bull.frostSlowAmt || 0.2) : 1;
            bull.x += bull.chargeVx * bSlow2 * dt;
            bull.y += bull.chargeVy * bSlow2 * dt;

            bull.fireTimer += dt;
            if (bull.fireTimer >= 0.4) {
                bull.fireTimer -= 0.4;
                fireBullBullets(bull);
            }

            // 撞墙才停
            if (bull.x < bull.r) { bull.x = bull.r; bull.state = 'stunned'; bull.stateTimer = 0; }
            else if (bull.x > cw - bull.r) { bull.x = cw - bull.r; bull.state = 'stunned'; bull.stateTimer = 0; }
            else if (bull.y < bull.r) { bull.y = bull.r; bull.state = 'stunned'; bull.stateTimer = 0; }
            else if (bull.y > ch - bull.r) { bull.y = ch - bull.r; bull.state = 'stunned'; bull.stateTimer = 0; }
        } else if (bull.state === 'stunned') {
            bull.stateTimer += dt;
            if (bull.stateTimer >= 5) {
                bull.state = 'chasing';
                bull.stateTimer = 0;
            }
        }

        // 边界钳制
        if (bull.x < bull.r) bull.x = bull.r;
        if (bull.x > cw - bull.r) bull.x = cw - bull.r;
        if (bull.y < bull.r) bull.y = bull.r;
        if (bull.y > ch - bull.r) bull.y = ch - bull.r;
    }

    // 公牛子弹移动
    for (var bi2 = bullBullets.length - 1; bi2 >= 0; bi2--) {
        var bb = bullBullets[bi2];
        bb.x += bb.vx * dt;
        bb.y += bb.vy * dt;
        if (bb.x < 0 || bb.x > cw || bb.y < 0 || bb.y > ch) {
            bullBullets.splice(bi2, 1);
        }
    }

    // ---- 魁首更新 ----
    for (var ki = kuis.length - 1; ki >= 0; ki--) {
        var kui = kuis[ki];

        // 与普通怪推开
        for (var j = 0; j < holes.length; j++) {
            var h = holes[j];
            var kdx = kui.x - h.x, kdy = kui.y - h.y;
            var kdist = Math.sqrt(kdx * kdx + kdy * kdy);
            var kminDist = kui.r + h.r + 4;
            if (kdist < kminDist && kdist > 0.01) {
                var kf = (kminDist - kdist) / kminDist * 60;
                kui.x += kdx / kdist * kf * dt;
                kui.y += kdy / kdist * kf * dt;
                h.x -= kdx / kdist * kf * dt * 0.5;
                h.y -= kdy / kdist * kf * dt * 0.5;
            }
        }

        if (kui.state === 'alive') {
            // 慢速追踪玩家
            var pdx = player.x - kui.x;
            var pdy = player.y - kui.y;
            var kSlow = 1; // 魁免疫减速
            var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist > 0.01) {
                kui.x += pdx / pdist * 60 * kSlow * dt;
                kui.y += pdy / pdist * 60 * kSlow * dt;
            }
        } else if (kui.state === 'dying') {
            // 静止倒计时
            kui.deathTimer -= dt;
            if (kui.deathTimer <= 0) {
                // 爆炸检测玩家是否在范围内
                var expRadius = kui.r * 4;
                var edx = player.x - kui.x;
                var edy = player.y - kui.y;
                var edist = Math.sqrt(edx * edx + edy * edy);
                if (edist < expRadius + player.r) {
                    if (!player.invincible && typeof lastHitSource !== 'undefined') { lastHitSource = 'kui_explosion'; takeDamage(); }
                }
                // 绿色粒子爆炸特效（参考玩家死亡）
                if (typeof spawnDeathParticles !== 'undefined') spawnDeathParticles(kui.x, kui.y, '34,197,94', 24);
                // 爆炸音效
                sfxKuiExplode.currentTime = 0; sfxKuiExplode.play().catch(function(){});
                // 蘑菇云爆炸特效
                spawnMushroomCloud(kui.x, kui.y);

                // 向上下左右发射4个红色分裂炸弹
                var bombSpeed = unitSize * 80;
                var bombDirs = [{ vx: 0, vy: -1 }, { vx: 0, vy: 1 }, { vx: -1, vy: 0 }, { vx: 1, vy: 0 }];
                for (var bd = 0; bd < bombDirs.length; bd++) {
                    kuiBombs.push({
                        x: kui.x, y: kui.y,
                        vx: bombDirs[bd].vx * bombSpeed,
                        vy: bombDirs[bd].vy * bombSpeed,
                        r: unitSize * 2,
                        active: true
                    });
                }
                // 记录魁首击杀
                if (typeof killStats !== 'undefined') {
                    var kbSrc = kui.killedBy || 'bomb';
                    if (killStats[kbSrc]) killStats[kbSrc].kui++;
                }
                if (typeof addKillPoints !== 'undefined') addKillPoints(true);
                // 击杀弹出"击杀魁!"
                if (typeof killPopups !== 'undefined' && typeof killPopupAngleOffset !== 'undefined') {
                    var angK = killPopupAngleOffset * 0.9;
                    killPopups.push({
                        baseX: kui.x, baseY: kui.y,
                        x: kui.x + Math.cos(angK) * (player.r * 3.5),
                        y: kui.y + Math.sin(angK) * (player.r * 3.5) - player.r * 0.5,
                        life: 2.5, maxLife: 2.5, elapsed: 0,
                        type: 'elite', text: '击杀魁!'
                    });
                    killPopupAngleOffset += 1.3;
                }
                kuis.splice(ki, 1);
            }
        }
    }

    // 魁首小怪更新
    for (var mi = 0; mi < kuiMinions.length; mi++) {
        var mn = kuiMinions[mi];
        var mnSpeed = getCurrentChaseSpeed();
        var mnSlow = 1; // 分裂魁免疫减速
        var mdx = player.x - mn.x;
        var mdy = player.y - mn.y;
        var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist > 0.01) {
            mn.x += mdx / mdist * mnSpeed * mnSlow * dt;
            mn.y += mdy / mdist * mnSpeed * mnSlow * dt;
        }

        // 边界钳制
        if (mn.x < mn.r) mn.x = mn.r;
        if (mn.x > cw - mn.r) mn.x = cw - mn.r;
        if (mn.y < mn.r) mn.y = mn.r;
        if (mn.y > ch - mn.r) mn.y = ch - mn.r;

        // 残影拖尾记录
        mn.trail.push({ x: mn.x, y: mn.y });
        if (mn.trail.length > 8) mn.trail.shift();

        // 小怪之间碰撞推开
        for (var oj = mi + 1; oj < kuiMinions.length; oj++) {
            var other = kuiMinions[oj];
            var odx = other.x - mn.x;
            var ody = other.y - mn.y;
            var odist = Math.sqrt(odx * odx + ody * ody);
            var minDist = mn.r + other.r;
            if (odist < minDist && odist > 0.01) {
                var push = (minDist - odist) / 2;
                var nx = odx / odist;
                var ny = ody / odist;
                mn.x -= nx * push;
                mn.y -= ny * push;
                other.x += nx * push;
                other.y += ny * push;
            }
        }

        // 每6秒四方向射击
        mn.attackTimer += dt;
        if (mn.attackTimer >= 6) {
            mn.attackTimer = 0;
            fireKuiMinionBullet(mn);
        }
    }

    // 小怪子弹移动
    for (var kbi = kuiMinionBullets.length - 1; kbi >= 0; kbi--) {
        var kb = kuiMinionBullets[kbi];
        kb.x += kb.vx * dt;
        kb.y += kb.vy * dt;
        if (kb.x < 0 || kb.x > cw || kb.y < 0 || kb.y > ch) {
            // 子弹爆炸粒子
            var sx = Math.max(0, Math.min(cw, kb.x));
            var sy = Math.max(0, Math.min(ch, kb.y));
            if (typeof spawnDeathParticles !== 'undefined') spawnDeathParticles(sx, sy, '244,114,182', 12);
            // 10%概率在边缘生成新的分裂魁
            if (Math.random() < 0.10) {
                sfxKuiMinionSpawn.currentTime = 0; sfxKuiMinionSpawn.play().catch(function(){});
                kuiMinions.push({
                    x: sx, y: sy,
                    r: unitSize * 4,
                    attackTimer: Math.random() * 5,
                    trail: []
                });
                if (typeof kuiMinionsSpawnedThisGame !== 'undefined') kuiMinionsSpawnedThisGame++;
            }
            kuiMinionBullets.splice(kbi, 1);
        }
    }

    // 分裂炸弹更新
    for (var kbi4 = kuiBombs.length - 1; kbi4 >= 0; kbi4--) {
        var kbomb = kuiBombs[kbi4];
        kbomb.x += kbomb.vx * dt;
        kbomb.y += kbomb.vy * dt;
        // 碰到屏幕边缘 → 爆炸 → 生成小怪
        if (kbomb.x < 0 || kbomb.x > cw || kbomb.y < 0 || kbomb.y > ch) {
            var ex = Math.max(0, Math.min(cw, kbomb.x));
            var ey = Math.max(0, Math.min(ch, kbomb.y));
            // 炸弹爆炸伤害
            var bombExpR = unitSize * 25;
            var bedx = player.x - ex;
            var bedy = player.y - ey;
            var bedist = Math.sqrt(bedx * bedx + bedy * bedy);
            if (bedist < bombExpR + player.r) {
                if (!player.invincible && typeof lastHitSource !== 'undefined') { lastHitSource = 'kui_bomb_shot'; takeDamage(); }
            }
            // 爆炸粒子
            if (typeof spawnDeathParticles !== 'undefined') spawnDeathParticles(ex, ey, '239,68,68', 16);
            // 生成小怪音效
            sfxKuiMinionSpawn.currentTime = 0; sfxKuiMinionSpawn.play().catch(function(){});
            kuiMinions.push({
                x: ex, y: ey,
                r: unitSize * 4,
                attackTimer: Math.random() * 5,
                trail: []
            });
            if (typeof kuiMinionsSpawnedThisGame !== 'undefined') kuiMinionsSpawnedThisGame++;
            kuiBombs.splice(kbi4, 1);
        }
    }

    // 蘑菇云爆炸特效更新
    for (var mci = mushroomClouds.length - 1; mci >= 0; mci--) {
        var mc = mushroomClouds[mci];
        mc.timer += dt;
        if (mc.timer >= mc.maxTimer) {
            mushroomClouds.splice(mci, 1);
            continue;
        }
        var progress = mc.timer / mc.maxTimer;
        mc.pillarHeight = unitSize * 80 * Math.min(progress * 1.5, 1);
        mc.cloudRadius = unitSize * 30 * Math.min(progress * 2, 1);
        mc.alpha = 1 - progress * progress;
        mc.y -= unitSize * 20 * dt;
    }
}

function fireRoninBullets(rn) {
    var bulletSpeed = unitSize * 40;
    var bulletR = player.r * 2.1;
    var dirs = [{ vx: 0, vy: -1 }, { vx: 0, vy: 1 }, { vx: -1, vy: 0 }, { vx: 1, vy: 0 }];
    for (var d = 0; d < dirs.length; d++) {
        roninBullets.push({
            x: rn.x, y: rn.y, r: bulletR,
            vx: dirs[d].vx * bulletSpeed,
            vy: dirs[d].vy * bulletSpeed
        });
    }
}

function fireKuiMinionBullet(minion) {
    var bulletSpeed = unitSize * 40;
    var bulletR = player.r * 2.1;
    var dirs = [{ vx: 0, vy: -1 }, { vx: 0, vy: 1 }, { vx: -1, vy: 0 }, { vx: 1, vy: 0 }];
    for (var d = 0; d < dirs.length; d++) {
        kuiMinionBullets.push({
            x: minion.x, y: minion.y, r: bulletR,
            vx: dirs[d].vx * bulletSpeed,
            vy: dirs[d].vy * bulletSpeed
        });
    }
}

function getCurrentChaseSpeed() {
    var init = difficulty === 'easy' ? 16 : (difficulty === 'hard' ? 30 : 20);
    var cap  = difficulty === 'easy' ? 40 : (difficulty === 'hard' ? 100 : 60);
    var tier = typeof gameTime !== 'undefined' ? Math.floor(gameTime / 15) : 0;
    var spd = unitSize * init * Math.pow(1.10, tier);
    return Math.min(spd, unitSize * cap);
}

function fantasyCollision() {
    if (player.invincible || debugInvincible) return;

    // 浪人本体
    for (var i = 0; i < ronins.length; i++) {
        var rn = ronins[i];
        var dx = player.x - rn.x;
        var dy = player.y - rn.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.r + rn.r) {
            lastHitSource = 'ronin_body';
            takeDamage();
            if (dist > 0.01) {
                player.x += dx / dist * (player.r + rn.r - dist);
                player.y += dy / dist * (player.r + rn.r - dist);
            }
            break;
        }
    }

    // 子弹
    for (var bi = roninBullets.length - 1; bi >= 0; bi--) {
        var b = roninBullets[bi];
        var bdx = player.x - b.x;
        var bdy = player.y - b.y;
        var bdist = Math.sqrt(bdx * bdx + bdy * bdy);
        if (bdist < player.r * 0.65 + b.r) {
            lastHitSource = 'ronin_bullet';
            takeDamage();
            roninBullets.splice(bi, 1);
            break;
        }
    }

    // 公牛本体
    for (var j = 0; j < bulls.length; j++) {
        var bull = bulls[j];
        var dbx = player.x - bull.x;
        var dby = player.y - bull.y;
        var dbdist = Math.sqrt(dbx * dbx + dby * dby);
        if (dbdist < player.r + bull.r) {
            lastHitSource = 'bull_body';
            takeDamage();
            if (dbdist > 0.01) {
                player.x += dbx / dbdist * (player.r + bull.r - dbdist);
                player.y += dby / dbdist * (player.r + bull.r - dbdist);
            }
            break;
        }
    }

    // 公牛子弹
    for (var bj = bullBullets.length - 1; bj >= 0; bj--) {
        var bb = bullBullets[bj];
        var bbdx = player.x - bb.x;
        var bbdy = player.y - bb.y;
        var bbdist = Math.sqrt(bbdx * bbdx + bbdy * bbdy);
        if (bbdist < player.r * 0.65 + bb.r) {
            lastHitSource = 'bull_bullet';
            takeDamage();
            bullBullets.splice(bj, 1);
            break;
        }
    }

    // 魁首本体（玩家碰到扣血，魁首无事）
    for (var ki2 = 0; ki2 < kuis.length; ki2++) {
        var kui = kuis[ki2];
        var kdx2 = player.x - kui.x;
        var kdy2 = player.y - kui.y;
        var kdist2 = Math.sqrt(kdx2 * kdx2 + kdy2 * kdy2);
        if (kdist2 < player.r + kui.r) {
            lastHitSource = 'kui_body';
            takeDamage();
            if (kdist2 > 0.01) {
                player.x += kdx2 / kdist2 * (player.r + kui.r - kdist2);
                player.y += kdy2 / kdist2 * (player.r + kui.r - kdist2);
            }
            break;
        }
    }

    // 魁首小怪
    for (var mi2 = 0; mi2 < kuiMinions.length; mi2++) {
        var mn = kuiMinions[mi2];
        var mdx2 = player.x - mn.x;
        var mdy2 = player.y - mn.y;
        var mdist2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2);
        if (mdist2 < player.r + mn.r) {
            lastHitSource = 'kui_minion';
            takeDamage();
            if (mdist2 > 0.01) {
                player.x += mdx2 / mdist2 * (player.r + mn.r - mdist2);
                player.y += mdy2 / mdist2 * (player.r + mn.r - mdist2);
            }
            break;
        }
    }

    // 分裂炸弹碰撞
    for (var kbi5 = 0; kbi5 < kuiBombs.length; kbi5++) {
        var kbomb2 = kuiBombs[kbi5];
        var kbdx2 = player.x - kbomb2.x;
        var kbdy2 = player.y - kbomb2.y;
        var kbdist2 = Math.sqrt(kbdx2 * kbdx2 + kbdy2 * kbdy2);
        if (kbdist2 < player.r + kbomb2.r) {
            if (!player.invincible && typeof lastHitSource !== 'undefined') { lastHitSource = 'kui_bomb_shot'; takeDamage(); }
            break;
        }
    }

    // 小怪子弹
    for (var kbi2 = kuiMinionBullets.length - 1; kbi2 >= 0; kbi2--) {
        var kb = kuiMinionBullets[kbi2];
        var kbdx = player.x - kb.x;
        var kbdy = player.y - kb.y;
        var kbdist = Math.sqrt(kbdx * kbdx + kbdy * kbdy);
        if (kbdist < player.r * 0.65 + kb.r) {
            lastHitSource = 'kui_bullet';
            takeDamage();
            kuiMinionBullets.splice(kbi2, 1);
            break;
        }
    }
}

function drawRonin(rn) {
    var color;
    if (rn.colorPhase === 0) {
        color = lerpColor('#34d399', '#fbbf24', rn.attackTimer / 1.7);
    } else if (rn.colorPhase === 1) {
        color = lerpColor('#fbbf24', '#ef4444', (rn.attackTimer - 1.7) / 1.6);
    } else {
        color = '#ef4444';
    }

    // 电流光晕（3px 闪电感）
    var flicker = 0.4 + Math.random() * 0.6;
    var auraGlow = ctx.createRadialGradient(rn.x, rn.y, rn.r * 0.8, rn.x, rn.y, rn.r * 1.15);
    auraGlow.addColorStop(0, 'rgba(255,255,100,' + (0.3 * flicker) + ')');
    auraGlow.addColorStop(0.5, 'rgba(255,200,50,' + (0.15 * flicker) + ')');
    auraGlow.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = auraGlow;
    ctx.beginPath();
    ctx.arc(rn.x, rn.y, rn.r * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    var s = rn.r * 0.7;
    ctx.beginPath();
    ctx.moveTo(rn.x, rn.y - s);
    ctx.lineTo(rn.x + s, rn.y);
    ctx.lineTo(rn.x, rn.y + s);
    ctx.lineTo(rn.x - s, rn.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000';
    ctx.font = 'bold ' + (rn.r * 0.6) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('浪', rn.x, rn.y);
}

function drawRoninBullet(b) {
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBull(bull) {
    var color;
    if (bull.state === 'chasing') {
        color = '#f97316';
    } else if (bull.state === 'locking') {
        color = lerpColor('#f97316', '#ef4444', Math.min(bull.stateTimer / 0.8, 1));
    } else if (bull.state === 'charging') {
        color = '#ef4444';
    } else {
        color = '#22c55e';
    }

    var flicker = 0.4 + Math.random() * 0.6;
    var auraGlow = ctx.createRadialGradient(bull.x, bull.y, bull.r * 0.8, bull.x, bull.y, bull.r * 1.15);
    auraGlow.addColorStop(0, 'rgba(255,160,50,' + (0.3 * flicker) + ')');
    auraGlow.addColorStop(0.5, 'rgba(255,120,30,' + (0.15 * flicker) + ')');
    auraGlow.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = auraGlow;
    ctx.beginPath();
    ctx.arc(bull.x, bull.y, bull.r * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    var s = bull.r * 0.7;
    ctx.beginPath();
    ctx.moveTo(bull.x, bull.y - s);
    ctx.lineTo(bull.x + s * 0.87, bull.y + s * 0.5);
    ctx.lineTo(bull.x - s * 0.87, bull.y + s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    if (bull.state === 'charging') {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bull.x - bull.chargeVx / 240 * 20, bull.y - bull.chargeVy / 240 * 20);
        ctx.lineTo(bull.x - bull.chargeVx / 240 * 50, bull.y - bull.chargeVy / 240 * 50);
        ctx.stroke();
    }

    ctx.fillStyle = '#000';
    ctx.font = 'bold ' + (bull.r * 0.6) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('牛', bull.x, bull.y);
}

function drawBullBullet(b) {
    var glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    glow.addColorStop(0, 'rgba(255,255,255,0.9)');
    glow.addColorStop(0.3, 'rgba(96,165,250,0.8)');
    glow.addColorStop(0.7, 'rgba(59,130,246,0.4)');
    glow.addColorStop(1, 'rgba(30,64,175,0)');
    ctx.fillStyle = glow;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawKui(kui) {
    // 岩浆力场
    var flicker = 0.4 + Math.random() * 0.6;
    var auraGlow = ctx.createRadialGradient(kui.x, kui.y, kui.r * 0.8, kui.x, kui.y, kui.r * 1.25);
    auraGlow.addColorStop(0, 'rgba(255,100,0,' + (0.35 * flicker) + ')');
    auraGlow.addColorStop(0.4, 'rgba(255,50,0,' + (0.2 * flicker) + ')');
    auraGlow.addColorStop(0.7, 'rgba(200,30,0,' + (0.1 * flicker) + ')');
    auraGlow.addColorStop(1, 'rgba(200,30,0,0)');
    ctx.fillStyle = auraGlow;
    ctx.beginPath();
    ctx.arc(kui.x, kui.y, kui.r * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // 大红色棱形
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(kui.x, kui.y - kui.r);
    ctx.lineTo(kui.x + kui.r, kui.y);
    ctx.lineTo(kui.x, kui.y + kui.r);
    ctx.lineTo(kui.x - kui.r, kui.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // dying状态：红色警示圈（随计时扩大+闪烁）+ 收缩靶心环
    if (kui.state === 'dying') {
        var pulse = 3 + (3 - kui.deathTimer) / 3 * 1;
        var alpha = 0.3 + Math.sin(kui.deathTimer * 12) * 0.25;
        ctx.strokeStyle = 'rgba(239,68,68,' + alpha + ')';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(kui.x, kui.y, kui.r * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // 收缩靶心环：从外向内3层半透明环，间距随计时缩小
        var progress = 1 - kui.deathTimer / 3;
        var ringCount = 4;
        for (var ri = 1; ri <= ringCount; ri++) {
            var ringRatio = ri / (ringCount + 1);
            var shrink = 1 - progress * ringRatio * 0.6;
            var ringR = kui.r * pulse * shrink;
            var ringAlpha = (0.15 + 0.1 * ri) * (1 - progress * 0.3);
            ctx.strokeStyle = 'rgba(239,68,68,' + ringAlpha + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(kui.x, kui.y, ringR, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // "魁"字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + (kui.r * 0.7) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('魁', kui.x, kui.y);
}

function drawMushroomCloud(mc) {
    if (mc.alpha <= 0.01) return;
    var cx = mc.x, cy = mc.y;
    var ph = mc.pillarHeight, cr = mc.cloudRadius, a = mc.alpha;
    var pw = Math.max(unitSize * 15, unitSize * 30 * (1 - mc.timer / mc.maxTimer));

    // 火焰柱 - 底部到顶部渐变
    var grad = ctx.createLinearGradient(cx, cy + ph * 0.2, cx, cy - ph * 0.8);
    grad.addColorStop(0, 'rgba(255,200,50,' + (a * 0.9) + ')');
    grad.addColorStop(0.3, 'rgba(255,120,20,' + (a * 0.8) + ')');
    grad.addColorStop(0.6, 'rgba(200,60,20,' + (a * 0.6) + ')');
    grad.addColorStop(1, 'rgba(150,30,10,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ph * 0.4, pw * 0.5, ph * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 蘑菇云顶 - 主球体
    var cloudGrad = ctx.createRadialGradient(cx, cy - ph, cr * 0.3, cx, cy - ph, cr);
    cloudGrad.addColorStop(0, 'rgba(255,220,100,' + (a * 0.9) + ')');
    cloudGrad.addColorStop(0.3, 'rgba(255,150,40,' + (a * 0.7) + ')');
    cloudGrad.addColorStop(0.6, 'rgba(200,80,30,' + (a * 0.5) + ')');
    cloudGrad.addColorStop(0.8, 'rgba(150,50,20,' + (a * 0.3) + ')');
    cloudGrad.addColorStop(1, 'rgba(100,30,10,0)');
    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - ph, cr, 0, Math.PI * 2);
    ctx.fill();

    // 蘑菇云顶 - 扩散烟雾（半透明外层）
    var smokeGrad = ctx.createRadialGradient(cx, cy - ph, cr * 0.5, cx, cy - ph, cr * 1.6);
    smokeGrad.addColorStop(0, 'rgba(180,80,40,' + (a * 0.25) + ')');
    smokeGrad.addColorStop(0.5, 'rgba(120,50,30,' + (a * 0.15) + ')');
    smokeGrad.addColorStop(1, 'rgba(80,30,15,0)');
    ctx.fillStyle = smokeGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - ph, cr * 1.6, 0, Math.PI * 2);
    ctx.fill();
}

function drawKuiBomb(b) {
    // 红色发光炸弹
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.2, '#fca5a5');
    grad.addColorStop(0.6, '#ef4444');
    grad.addColorStop(1, '#991b1b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawKuiMinion(m) {
    // 岩浆力场（范围大）
    var flicker = 0.4 + Math.random() * 0.6;
    var auraGlow = ctx.createRadialGradient(m.x, m.y, m.r * 0.6, m.x, m.y, m.r * 2.2);
    auraGlow.addColorStop(0, 'rgba(255,100,0,' + (0.7 * flicker) + ')');
    auraGlow.addColorStop(0.4, 'rgba(255,50,0,' + (0.45 * flicker) + ')');
    auraGlow.addColorStop(0.7, 'rgba(200,30,0,' + (0.25 * flicker) + ')');
    auraGlow.addColorStop(1, 'rgba(200,30,0,0)');
    ctx.fillStyle = auraGlow;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 残影拖尾
    for (var ti = 0; ti < m.trail.length; ti++) {
        var t = m.trail[ti];
        var tAlpha = (ti + 1) / m.trail.length * 0.25;
        var tRadius = m.r * (0.5 + (ti / m.trail.length) * 0.5);
        ctx.fillStyle = 'rgba(156,163,175,' + tAlpha + ')';
        ctx.beginPath();
        ctx.arc(t.x, t.y, tRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 红色棱形主体（魁的形态）
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y - m.r);
    ctx.lineTo(m.x + m.r, m.y);
    ctx.lineTo(m.x, m.y + m.r);
    ctx.lineTo(m.x - m.r, m.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // "魁"字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + (m.r * 0.7) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('魁', m.x, m.y);
}

function drawKuiMinionBullet(b) {
    ctx.fillStyle = '#f472b6';
    ctx.shadowColor = '#f472b6';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function fantasyRender() {
    // 浪人预警
    for (var pi = 0; pi < roninPending.length; pi++) {
        var pp = roninPending[pi];
        var bounce = Math.abs(Math.sin(gameTime * 6 + pi)) * 4;
        ctx.fillStyle = 'rgba(168,85,247,' + (0.5 + pp.timer * 0.5) + ')';
        ctx.font = 'bold ' + (40 + bounce) + 'px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(168,85,247,0.8)'; ctx.shadowBlur = 12;
        ctx.fillText('!', pp.x, pp.y - bounce);
        ctx.shadowBlur = 0;
    }
    for (var i = 0; i < ronins.length; i++) { drawRonin(ronins[i]); }
    for (var j = 0; j < roninBullets.length; j++) { drawRoninBullet(roninBullets[j]); }

    // 公牛预警
    for (var qi = 0; qi < bullPending.length; qi++) {
        var bp = bullPending[qi];
        var bounce2 = Math.abs(Math.sin(gameTime * 6 + qi + 100)) * 4;
        ctx.fillStyle = 'rgba(249,115,22,' + (0.5 + bp.timer * 0.5) + ')';
        ctx.font = 'bold ' + (40 + bounce2) + 'px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(249,115,22,0.8)'; ctx.shadowBlur = 12;
        ctx.fillText('▲', bp.x, bp.y - bounce2);
        ctx.shadowBlur = 0;
    }
    for (var k = 0; k < bulls.length; k++) { drawBull(bulls[k]); }
    for (var m = 0; m < bullBullets.length; m++) { drawBullBullet(bullBullets[m]); }

    // 魁首预警
    for (var pk2 = 0; pk2 < kuiPending.length; pk2++) {
        var kp = kuiPending[pk2];
        var bounce3 = Math.abs(Math.sin(gameTime * 6 + pk2 + 200)) * 4;
        ctx.fillStyle = 'rgba(239,68,68,' + (0.5 + kp.timer * 0.5) + ')';
        ctx.font = 'bold ' + (44 + bounce3) + 'px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(239,68,68,0.8)'; ctx.shadowBlur = 14;
        ctx.fillText('魁', kp.x, kp.y - bounce3);
        ctx.shadowBlur = 0;
    }
    for (var ki3 = 0; ki3 < kuis.length; ki3++) { drawKui(kuis[ki3]); }
    for (var kbi6 = 0; kbi6 < kuiBombs.length; kbi6++) { drawKuiBomb(kuiBombs[kbi6]); }
    for (var mi3 = 0; mi3 < kuiMinions.length; mi3++) { drawKuiMinion(kuiMinions[mi3]); }
    for (var kbi3 = 0; kbi3 < kuiMinionBullets.length; kbi3++) { drawKuiMinionBullet(kuiMinionBullets[kbi3]); }
    // 蘑菇云爆炸特效渲染
    for (var mci2 = 0; mci2 < mushroomClouds.length; mci2++) { drawMushroomCloud(mushroomClouds[mci2]); }
}

function fantasyReset() {
    ronins = [];
    roninBullets = [];
    roninPending = [];
    roninSpawnTimer = 0;
    bulls = [];
    bullBullets = [];
    bullPending = [];
    bullSpawnTimer = 0;
    kuis = [];
    kuiBombs = [];
    kuiMinions = [];
    kuiMinionBullets = [];
    kuiPending = [];
    kuiSpawnTimer = 0;
    mushroomClouds = [];
}

function lerpColor(c1, c2, t) {
    t = Math.max(0, Math.min(1, t));
    var r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
    var r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
    return 'rgb(' + Math.round(r1+(r2-r1)*t) + ',' + Math.round(g1+(g2-g1)*t) + ',' + Math.round(b1+(b2-b1)*t) + ')';
}
