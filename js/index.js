// ==================== 音量配置（集中管理） ====================
// 所有音量的基础系数，统一修改处
// 音乐类实际音量 = settings.musicVol × VOL.xxx
// 音效类实际音量 = settings.sfxVol   × VOL.xxx
var VOL = {
    // ========== 音乐 (× settings.musicVol) ==========
    menuMusic: 1.0,           // 主菜单循环背景乐 ./audio/1_min.mp3
    travelAudio: 1.0,         // 欢迎页背景乐 ./audio/travel_min.mp3（点击进入后播放）
    cycleTrack: 1.0,          // 战斗进行曲 ./audio/3/4/5_min.mp3（三首随机循环）
    musicHall: 1.0,           // 音乐厅歌曲播放音量

    // ========== 界面音效 (× settings.sfxVol) ==========
    hurt: 1.0,                // 受伤音效 ./audio/hurt_min.mp3
    death: 1.0,               // 死亡音效 ./audio/die-sfx_min.mp3
    click: 1.0,               // 通用点击音效 ./audio/break1_min.mp3
    clickStart: 1.0,          // 开始/返回/重新开始按钮 ./audio/click-start_min.mp3
    clickShop: 1.0,           // 商城加入购物车 ./audio/click-shop_min.mp3
    clickCheckin: 1.0,        // 签到面板打开 ./audio/click-checkin_min.mp3
    clickCheckinOk: 1.0,      // 签到成功 ./audio/click-checkin-ok_min.mp3
    clickBuyOk: 1.0,          // 购买皮肤成功 ./audio/click-buy-ok_min.mp3
    clickBuyFail: 1.0,        // 积分不足购买失败 ./audio/click-buy-fail_min.mp3
    clickVer: 1.0,            // 版本号公示/点击爱心 ./audio/click-heart_min.mp3
    clickEquip: 1.0,          // 装备皮肤 ./audio/click-equip_min.mp3
    settingsEnter: 1.0,       // 进入设置页 ./audio/click-settings_min.mp3
    musicHallEnter: 1.0,      // 进入音乐厅 ./audio/click-music-hall_min.mp3
    diffHover: 1.0,           // 难度选择鼠标悬停（简单/普通/困难）
    diffEnter: 1.0,           // 难度选择确定进入

    // ========== 道具音效 (× settings.sfxVol) ==========
    itemSpawn: 0.2,           // 道具刷新落地提示音 ./audio/item-spawn_min.mp3
    healPickup: 0.5,          // 爱心拾取初始音量（实际受 healPickupBoost 影响）
    healPickupBoost: 0.6,     // 爱心拾取特殊增益：min(1, sfxVol × 6.0)，低音量下也明显
    bombPickup: 0.8,          // 炸弹拾取 ./audio/bomb-pickup_min.mp3
    bombExplode: 0.8,         // 炸弹爆炸 ./audio/bomb-explode_min.mp3
    laserPickup: 0.8,         // 激光枪拾取 ./audio/laser-pickup_min.mp3
    laserFire: 0.8,           // 激光发射 ./audio/laser-fire_min.mp3
    frostExplode: 0.9,        // 寒冰蘑菇爆炸 ./audio/frost-explode_min.mp3
    pepperPickup: 0.8,        // 辣椒拾取 ./audio/pepper-pickup_min.mp3
    pepperExplode: 0.8,       // 辣椒爆炸 ./audio/pepper-explode_min.mp3
    pepperFire: 0.5,          // 辣椒火焰持续燃烧 ./audio/pepper-burn_min.mp3

    // ========== 怪物音效 (× settings.sfxVol) ==========
    normalDie: 0.8,           // 普通怪死亡 ./audio/normal-die_min.mp3
    roninDie: 1.0,            // 浪人死亡初始音量（实际受 roninDieBoost 影响）
    roninDieBoost: 2.0,       // 浪人死亡特殊增益：min(1, sfxVol × 2.0)
    bullDie: 0.8,             // 公牛死亡 ./audio/bull-die_min.mp3
    kuiExplode: 0.8,          // 魁爆炸 ./audio/kui-explode_min.mp3
    kuiMinionSpawn: 0.8,      // 小魁产生 ./audio/kui-minion_min.mp3
};

// ==================== 欢迎遮罩 ====================
var travelAudio = new Audio('./audio/travel_min.mp3');
travelAudio.volume = VOL.travelAudio;

function onWelcomeClick() {
    document.getElementById('welcome-overlay').style.display = 'none';
    // 先播 travel_min.mp3，播完后自动播 1_min.mp3
    travelAudio.currentTime = 0;
    travelAudio.play().catch(function() {});
    travelAudio.onended = function() {
        // 只有在用户没操作音乐厅时才自动播1_min.mp3
        if (!musicHallAudio && typeof menuMusic !== 'undefined') {
            menuMusic.play().catch(function() {});
        }
    };
    // 弹窗等 travel 开始后再显示
    setTimeout(function() {
        if (typeof content !== 'undefined' && typeof modalData !== 'undefined') {
            content.innerHTML = '<h3>游戏规则</h3>' + modalData.rules.html;
        }
        if (typeof overlay !== 'undefined') overlay.classList.add('active');
    }, 100);
}

// ==================== 弹窗逻辑 ====================
var overlay = document.getElementById('modalOverlay');
var content = document.getElementById('modalContent');
var closeBtn = document.getElementById('modalClose');
var modalBox = document.querySelector('.modal-box');

var modalData = {
    archive: {
        title: '档案',
        html: '<div style="display:flex;gap:12px;justify-content:center;margin:20px 0;">' +
              '<button onclick="openArchive(\'monster\')" style="flex:1;padding:16px;background:rgba(124,58,237,0.12);border:2px solid #7c3aed;border-radius:10px;color:#c4b5fd;font-size:16px;font-weight:bold;cursor:pointer;transition:all 0.2s;">怪物档案</button>' +
              '<button onclick="openArchive(\'item\')" style="flex:1;padding:16px;background:rgba(59,130,246,0.08);border:2px solid #3b82f6;border-radius:10px;color:#93c5fd;font-size:16px;font-weight:bold;cursor:pointer;transition:all 0.2s;">道具档案</button>' +
              '</div>'
    },
    monster_archive: {
        title: '怪物档案',
        html: '<p style="color:#c084fc;font-size:16px;font-weight:bold;text-align:center;margin-bottom:14px;">怪物图鉴</p>' +
              // 普通怪
              '<div style="border:2px solid #a855f7;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
              '<canvas id="preview-normal" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
              '<p style="color:#a855f7;font-weight:bold;margin:0;">虚空（普通小怪）</p>' +
              '<p style="color:#c4b5fd;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
              '形象：<span style="color:#e879f9;">紫色</span>/<span style="color:#22d3ee;">青色</span>/<span style="color:#f472b6;">粉色</span>/<span style="color:#fbbf24;">金色</span>实心圆点，白色细边。<br>' +
              '体积：小|它们无处不在，无时无刻不在追逐你。<br>每45秒加速10%，越到后期越快！<br>' +
              '简单:移动较慢 | 普通:还能接受 | 困难:你得知道即将面对什么<br>' +
              '存在20秒后自动消失哦！</p>' +
              '<p style="color:#a78bfa;font-size:11px;font-style:italic;margin:4px 0 0;">"我们谁不是普通人呢？在虚空中挣扎，被命运所驱赶，到点之后就默默消失。"</p></div>' +
              // 浪人
              '<div style="border:2px solid #7c3aed;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
              '<canvas id="preview-ronin" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
              '<p style="color:#fbbf24;font-weight:bold;margin:0;">浪人 <span style="color:#a78bfa;font-size:11px;">精英怪</span></p>' +
              '<p style="color:#a78bfa;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
              '形象：<span style="color:#fbbf24;">金色菱形</span>，中心带"<b>浪</b>"字，周身金色闪电光晕。<br>' +
              '体积:<b>正常</b> | 游走:<b>移速较慢</b> 且无意识移动<br>' +
              '攻击:每<b>5秒</b>四方向射红色子弹（移动较慢）<br>' +
              '简单:生成缓慢，不要担心 | 普通:还能接受，不用慌 | 困难：嘿嘿</p>' +
              '<p style="color:#a78bfa;font-size:11px;font-style:italic;margin:4px 0 0;">"原本是江湖上行侠仗义的英雄，因虚空坠落事件黑化，沦为没有意识的游走怪物。"</p></div>' +
              // 公牛
              '<div style="border:2px solid #f97316;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
              '<canvas id="preview-bull" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
              '<p style="color:#f97316;font-weight:bold;margin:0;">公牛 <span style="color:#fb923c;font-size:11px;">精英怪</span></p>' +
              '<p style="color:#fb923c;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
              '形象：<span style="color:#f97316;">橙色三角形</span>，中心带"牛"，体积大，周身橙色火焰光晕。<br>锁定变红，眩晕变绿。<br>' +
              '体积:大 | 追踪:<b>移速较快 </b><br>' +
              '距离<b>玩家一定单位</b>锁定→蓄力<b>较短时间</b>→突刺<b>迅速！</b>撞墙停止且会眩晕5秒，趁机消灭它！<br>' +
              '突刺中每<b>一定时间</b>发射4发蓝色火焰子弹<br>' +
              '简单：放心，这种怪物我会尽量不让它出来的| 普通：我相信你能接受的 | 困难：马上你就知道何为公牛</p>' +
              '<p style="color:#a78bfa;font-size:11px;font-style:italic;margin:4px 0 0;">"原本是一位力大无穷的斗牛士，因虚空坠落事件，彻底沦落为没有意识的空壳。"</p></div>' +
              // 魁
              '<div style="border:2px solid #ef4444;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
              '<canvas id="preview-kui" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
              '<p style="color:#ef4444;font-weight:bold;margin:0;">魁 <span style="color:#ef4444;font-size:11px;">精英怪</span></p>' +
              '<p style="color:#f87171;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
              '形象：<span style="color:#ef4444;">红色钻石</span>，中心带"<b>魁</b>"字，周身青色煞气光晕。<br>' +
              '特性:<b>免疫</b>寒冰蘑菇的冰冻与减速<br>' +
              '大魁死亡时原地爆炸，爆炸触碰玩家将受到伤害！<br>' +
              '爆炸后，大魁会发射炸弹，炸弹碰到屏幕边缘<b>100%</b>生成一只分裂魁（小魁）<br>' +
              '小魁每<b>6秒</b>四方向射击子弹，子弹碰边缘有<b>20%</b>概率再生成新小魁<br>' +
              '简单：%￥#@* | 普通：&*%￥#@ | 困难：快跑。</p>' +
              '<p style="color:#a78bfa;font-size:11px;font-style:italic;margin:4px 0 0;">"虚空深处最凶险的存在，据说是远古神明陨落后的怨念凝聚而成。遇见它，祈祷吧。"</p></div>' +
              '<p style="margin-top:12px;color:#a78bfa;font-size:11px;text-align:center;">坚持越久，挑战越大，祝你好运。</p>'
    },
    item_archive: {
        title: '道具档案',
        html: '<p style="color:#c084fc;font-size:16px;font-weight:bold;text-align:center;margin-bottom:14px;">道具图鉴</p>' +
              '<div style="border:2px solid #ef4444;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
              '<canvas id="preview-item-heal" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
              '<p style="color:#ef4444;font-weight:bold;margin:0;">猫狮的祝福</p>' +
              '<p style="color:#f87171;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
              '拾取即用，恢复<b>1颗爱心</b>+<b>1.5秒无敌帧</b>。满血时<b>提升生命上限</b>。<br>' +
              '</p><br>"来自猫狮的祝福，拾取她之后你更加充满决心"</div>' +
              '<div style="border:2px solid #f59e0b;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
              '<canvas id="preview-item-bomb" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
              '<p style="color:#f59e0b;font-weight:bold;margin:0;">强力炸弹</p>' +
              '<p style="color:#fbbf24;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
              '拾取<b>3秒后</b>引爆，大范围击杀。爆炸前<b>0.3秒</b>获得无敌帧，趁机冲进敌群消灭它们!<br>' +
              '普通&困难炸弹初始爆炸范围较小，需多次拾取升级来提升爆炸范围<br>' +
              '</p><br>"不要小看这颗平平无奇的炸弹"</div>' +
              '<div style="border:2px solid #a855f7;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
              '<canvas id="preview-item-laser" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
              '<p style="color:#a855f7;font-weight:bold;margin:0;">迷你激光枪</p>' +
              '<p style="color:#c4b5fd;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
              '拾取<b>3秒后</b>八方向发射激光，直穿屏幕边界，<b>发射前0.3秒获得无敌帧</b>。<br></p><br>"激光枪蹦蹦蹦!"</br></div>'  
              +'<div style="border:2px solid #60a5fa;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
              '<canvas id="preview-item-frost" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
              '<p style="color:#60a5fa;font-weight:bold;margin:0;">冰霜冲击</p>' +
              '<p style="color:#93c5fd;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
              '拾取后<b>1.5秒</b>，屏幕中央巨大蘑菇，吓死在场的所有敌人<br>' +
              '爆炸后现有敌人<b>减速80%</b>持续15秒。新进场敌人(效果在8秒以上)<b>仅减速50%<br></b>。<br>' +
              '冻结期间时间静止，无法进行任何操作</p><br>"是不是很眼熟?"</div>' +
	              '<div style="border:2px solid #ef4444;border-radius:8px;padding:12px;margin-bottom:8px;position:relative;">' +
	              '<canvas id="preview-item-pepper" width="56" height="56" style="position:absolute;top:8px;right:8px;border-radius:6px;background:rgba(0,0,0,0.2);pointer-events:none;"></canvas>' +
		              '<p style="color:#ef4444;font-weight:bold;margin:0;">火爆辣椒</p>' +
	              '<p style="color:#f87171;font-size:12px;line-height:1.7;margin:6px 0 0;">' +
	              '拾取<b>3秒后</b>原地爆炸，生成持续<b>5秒</b>的火焰圈。爆炸前0.3秒获得无敌帧<br>' +
	              '玩家踏入火焰圈也会受伤，请远离！<br>' +
	              '</p><br>"整个虚空都燃起来了！"</div>' 
         
    },
    rules: {
        title: '游戏规则',
        html: '<p style="font-size:26px;font-weight:bold;color:#c084fc;letter-spacing:4px;text-align:center;margin-bottom:18px;">守中进攻，游刃有余!</p>' +
              '<p style="color:#fbbf24;">拖动 <span class="highlight">鼠标</span> 移动控制 <span style="color:#ef4444;font-weight:bold;">坠落者</span>，按 <span class="highlight">空格键</span> 可暂停或继续游戏。</p>' +
              '<p style="color:#fbbf24;">躲避屏幕上随机出现的 <span style="color:#a855f7;font-weight:bold;">各种敌人</span>！</p>' +
              '<p style="color:#fbbf24;">难度有 <span style="color:#34d399;font-weight:bold;">简单</span>、<span style="color:#fbbf24;font-weight:bold;">普通</span>、<span style="color:#ef4444;font-weight:bold;">困难</span>，不同难度有着不同机制，点击开始坠落可查看详情。<br>合理利用各种道具来增加自己生存的容错性!</p>' +
              '<p style="color:#fbbf24;"><span style="color:#f59e0b;font-weight:bold;">普通怪物</span>的移动速度会随时间而变化。</p>' +
              '<p style="color:#fbbf24;">生命耗尽，<span style="color:#ef4444;font-weight:bold;">游戏结束</span>。</p>' +
              '<p style="margin-top:16px;color:#a78bfa;text-align:center;">坚持越久，挑战越大，祝你好运。</p>'
    },
    contact: {
        title: '联系站主',
        html: '<p style="text-align:center;color:#a78bfa;">扫描下方二维码联系站主<br>或者发送邮件到1491113597@qq.com,感谢支持!</p>' +
              '<img src="./img/contact-qr.png" alt="站主联系方式">'
    },
    shop: {
        title: '皮肤商城',
        html: '' // 动态生成，避免初始化顺序问题
    }
};

var debugUnlocked = sessionStorage.getItem('voidDebug') === '1';

// ==================== 成就系统 ====================
function totalDeathByCause(label) {
    var total = 0;
    ['easy','normal','hard'].forEach(function(k) {
        total += gameLog[k].deaths[label] || 0;
    });
    return total;
}

function totalItemKillNormal() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) {
        var ek = gameLog[k].kills;
        if (ek) t += ek.bomb.normal + ek.laser.normal;
    });
    return t;
}
function totalItemKillElite() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) {
        var ek = gameLog[k].kills;
        if (ek) t += ek.bomb.ronin + ek.laser.ronin;
    });
    return t;
}
function totalItemKillBull() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) {
        var ek = gameLog[k].kills;
        if (ek) t += ek.bomb.bull + ek.laser.bull;
    });
    return t;
}
function totalBombNormal() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek) t += ek.bomb.normal; });
    return t;
}
function totalBombRonin() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek) t += ek.bomb.ronin; });
    return t;
}
function totalBombBull() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek) t += ek.bomb.bull; });
    return t;
}
function totalLaserNormal() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek) t += ek.laser.normal; });
    return t;
}
function totalLaserRonin() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek) t += ek.laser.ronin; });
    return t;
}
function totalLaserBull() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek) t += ek.laser.bull; });
    return t;
}
function totalPepperNormal() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek && ek.pepper) t += ek.pepper.normal; });
    return t;
}
function totalPepperRonin() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek && ek.pepper) t += ek.pepper.ronin; });
    return t;
}
function totalPepperBull() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek && ek.pepper) t += ek.pepper.bull; });
    return t;
}
function totalBombKui() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek) t += (ek.bomb.kui||0); });
    return t;
}
function totalLaserKui() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek) t += (ek.laser.kui||0); });
    return t;
}
function totalPepperKui() {
    var t = 0;
    ['easy','normal','hard'].forEach(function(k) { var ek = gameLog[k].kills; if (ek && ek.pepper) t += (ek.pepper.kui||0); });
    return t;
}
function totalKuiKills() { return totalBombKui() + totalLaserKui() + totalPepperKui(); }

var achievements = [
    { id: 'skin_1',  name: '初具规模', desc: '购买3个皮肤',        check: function() { var cats = 0; for (var i=0;i<playerData.ownedSkins.length;i++) { if (playerData.ownedSkins[i]!=='heart') cats++; } return cats >= 3; } },
    { id: 'skin_6',  name: '小有成就', desc: '购买18个皮肤',       check: function() { var cats = 0; for (var i=0;i<playerData.ownedSkins.length;i++) { if (playerData.ownedSkins[i]!=='heart') cats++; } return cats >= 18; } },
    { id: 'skin_12', name: '老玩家',   desc: '购买36个皮肤',       check: function() { var cats = 0; for (var i=0;i<playerData.ownedSkins.length;i++) { if (playerData.ownedSkins[i]!=='heart') cats++; } return cats >= 36; } },
    { id: 'skin_all',name: '皮肤大亨', desc: '收集全部皮肤',       check: function() { return playerData.ownedSkins.length >= getTotalSkinCount(); } },
    { id: 'skin_collection',name: '合集收藏家', desc: '完整解锁一个合集的所有皮肤', check: function() { return hasCompleteCollection(); } },
    { id: 'pts_100', name: '初入茅庐',   desc: '累计获得点数突破500',  check: function(p) { return p >= 100*5; } },
    { id: 'pts_200', name: '逐渐佳境',   desc: '累计获得点数突破1000',  check: function(p) { return p >= 200*5; } },
    { id: 'pts_400', name: '超越大众',   desc: '累计获得点数突破2000',  check: function(p) { return p >= 400*5; } },
    { id: 'pts_600', name: '小有名气',   desc: '累计获得点数突破3000',  check: function(p) { return p >= 600*5; } },
    { id: 'pts_1000',name: '无人形态',   desc: '累计获得点数突破5000', check: function(p) { return p >= 1000*5; } },
    { id: 'pts_1600',name:'天下无敌',   desc: '累计获得点数突破12800', check: function(p) { return p >= 1600*8; } },
    { id: 'pts_2000',name:'神明在世',   desc: '累计获得点数突破20000', check: function(p) { return p >= 2000*10; } },
    { id: 'music_1', name: '音乐人生',   desc: '在音乐厅播放一首音乐', check: function() { return false; } },
    { id: 'game_1',  name: '第一次的坠落', desc: '完成第一局游戏',     check: function() { return false; } },
    { id: 'checkin_7',   name: '周度玩家', desc: '累计签到7天',   check: function() { return playerData.totalCheckins >= 7; } },
    { id: 'checkin_30',  name: '月度玩家', desc: '累计签到30天',  check: function() { return playerData.totalCheckins >= 30; } },
    { id: 'checkin_90',  name: '季度玩家', desc: '累计签到90天',  check: function() { return playerData.totalCheckins >= 90; } },
    { id: 'checkin_365', name: '年度玩家', desc: '累计签到365天', check: function() { return playerData.totalCheckins >= 365; } },
    { id: 'plays_10',  name: '经常坠落',   desc: '总场次达到10场',  check: function() { return gameLog.easy.plays+gameLog.normal.plays+gameLog.hard.plays >= 10; } },
    { id: 'plays_30',  name: '坠落习惯了', desc: '总场次达到30场',  check: function() { return gameLog.easy.plays+gameLog.normal.plays+gameLog.hard.plays >= 30; } },
    { id: 'plays_50',  name: '还在坠落？', desc: '总场次达到50场',  check: function() { return gameLog.easy.plays+gameLog.normal.plays+gameLog.hard.plays >= 50; } },
    { id: 'plays_100', name: '虚空坠落',   desc: '总场次达到100场', check: function() { return gameLog.easy.plays+gameLog.normal.plays+gameLog.hard.plays >= 100; } },
    { id: 'rank_1',  name: '榜上有名',     desc: '首次进入排行榜',   check: function() { return false; } },
    { id: 'rank_5',  name: '高手！',       desc: '排名进入前五名',   check: function() { return false; } },
    { id: 'rank_3',  name: '高手中的高手！', desc: '排名进入前三名',  check: function() { return false; } },
    { id: 'rank_1st',name: '比猫狮还强大的人！', desc: '排名获得第一名', check: function() { return false; } },
    { id: 'debug_unlock', name: '我现在是站主！', desc: '成功解锁调试面板', check: function() { return false; } },
    { id: 'd_rb_1',   name: '这有伤害啊？',   desc: '累计死于浪人的子弹1次',  check: function() { return totalDeathByCause('浪人的子弹') >= 1; } },
    { id: 'd_rb_10',  name: '又快又准',       desc: '累计死于浪人的子弹10次', check: function() { return totalDeathByCause('浪人的子弹') >= 10; } },
    { id: 'd_rb_20',  name: '太痛了',         desc: '累计死于浪人的子弹20次', check: function() { return totalDeathByCause('浪人的子弹') >= 20; } },
    { id: 'd_rb_50',  name: '根本停不下来',   desc: '累计死于浪人的子弹50次', check: function() { return totalDeathByCause('浪人的子弹') >= 50; } },
    { id: 'd_rb_100', name: '浪人本尊',       desc: '累计死于浪人的子弹100次',check: function() { return totalDeathByCause('浪人的子弹') >= 100; } },
    { id: 'd_lava_1',  name: '试图在岩浆里游泳', desc: '累计死于岩浆1次',   check: function() { return totalDeathByCause('岩浆的洗礼') >= 1; } },
    { id: 'd_lava_10', name: '烫死了',         desc: '累计死于岩浆10次',  check: function() { return totalDeathByCause('岩浆的洗礼') >= 10; } },
    { id: 'd_lava_20', name: '是谁在烤肉',           desc: '累计死于岩浆20次',  check: function() { return totalDeathByCause('岩浆的洗礼') >= 20; } },
    { id: 'd_lava_30', name: '烈焰人在世',     desc: '累计死于岩浆30次',  check: function() { return totalDeathByCause('岩浆的洗礼') >= 30; } },
    { id: 'd_lava_50', name: '岩浆的洗礼',     desc: '累计死于岩浆50次',  check: function() { return totalDeathByCause('岩浆的洗礼') >= 50; } },
    { id: 'easy_lava_die', name: '啊，还可以这样死吗？', desc: '在简单模式下死于岩浆', check: function() { return (gameLog.easy.deaths['岩浆的洗礼'] || 0) >= 1; } },
    // 战斗技巧
    { id: 'nohit_240',  name: '毫发无伤',   desc: '单局内连续240秒未受伤害', check: function() { return false; } },
    { id: 'lastlife',   name: '绝境求生',   desc: '剩1条命存活120秒',       check: function() { return false; } },
    { id: 'edges',      name: '四面楚歌',   desc: '一局内触碰过四个边缘',   check: function() { return false; } },
    { id: 'still',      name: '静止大师',   desc: '开局10秒内不移动鼠标',   check: function() { return false; } },
    // 难度
    { id: 'easy_done',  name: '简单人生',   desc: '首次完成简单难度',       check: function() { return gameLog.easy.plays >= 1; } },
    { id: 'hard_done',  name: '拥抱困难',   desc: '首次完成困难难度',       check: function() { return gameLog.hard.plays >= 1; } },
    { id: 'all_done',   name: '全模式制霸', desc: '三个难度各完成一局',     check: function() { return gameLog.easy.plays>=1 && gameLog.normal.plays>=1 && gameLog.hard.plays>=1; } },
    // 浪人
    { id: 'see_ronin',  name: '浪人初见',   desc: '第一次见到浪人',         check: function() { return false; } },
    { id: 'bullet20',   name: '弹幕地狱',   desc: '同时存在20颗浪人子弹',   check: function() { return false; } },
    { id: 'ronin_hug',  name: '浪人之拥',   desc: '死于浪人本体',           check: function() { return totalDeathByCause('浪人的拥抱') >= 1; } },
    // 公牛
    { id: 'see_bull',    name: '公牛初见',     desc: '第一次见到公牛',         check: function() { return false; } },
    { id: 'bull_bullet20', name: '蓝色火焰',    desc: '同时存在20颗公牛子弹',   check: function() { return false; } },
    { id: 'bull_hug',    name: '牛角冲撞',     desc: '死于公牛本体',           check: function() { return totalDeathByCause('公牛的冲撞') >= 1; } },
    { id: 'd_bb_1',   name: '被牛角顶了',     desc: '累计死于公牛的子弹1次',  check: function() { return totalDeathByCause('公牛的子弹') >= 1; } },
    { id: 'd_bb_10',  name: '斗牛士',         desc: '累计死于公牛的子弹10次', check: function() { return totalDeathByCause('公牛的子弹') >= 10; } },
    { id: 'd_bb_20',  name: '弹幕牛',         desc: '累计死于公牛的子弹20次', check: function() { return totalDeathByCause('公牛的子弹') >= 20; } },
    { id: 'd_bb_50',  name: '公牛本尊',       desc: '累计死于公牛的子弹50次', check: function() { return totalDeathByCause('公牛的子弹') >= 50; } },
    // 魁首
    { id: 'see_kui',     name: '初见即深渊',     desc: '第一次见到魁',           check: function() { return false; } },
    { id: 'kui_die_explosion', name: '离远点看烟花', desc: '死于魁的爆炸',        check: function() { return totalDeathByCause('魁的爆炸') >= 1; } },
    { id: 'kui_die_bomb_shot', name: '人体接弹实验', desc: '死于魁的弹射',       check: function() { return totalDeathByCause('魁的弹射') >= 1; } },
    { id: 'kui_die_minion',    name: '另一个我',    desc: '死于魁的残影',          check: function() { return totalDeathByCause('魁的残影') >= 1; } },
    { id: 'kui_die_bullet',    name: '你也有今天',  desc: '死于魁的子弹',          check: function() { return totalDeathByCause('魁的子弹') >= 1; } },
    { id: 'kui_all_deaths',    name: '死得其所',    desc: '体验过魁的全部四种死法',  check: function() { return totalDeathByCause('魁的爆炸')>=1 && totalDeathByCause('魁的弹射')>=1 && totalDeathByCause('魁的残影')>=1 && totalDeathByCause('魁的子弹')>=1; } },
    { id: 'kui_kill_1',   name: '魁力不足',       desc: '累计击杀150只魁',          check: function() { return totalKuiKills() >= 150; } },
    { id: 'kui_kill_10',  name: '魁计多端',       desc: '累计击杀1500只魁',         check: function() { return totalKuiKills() >= 1500; } },
    { id: 'kui_kill_50',  name: '魁哭狼嚎',       desc: '累计击杀7500只魁',        check: function() { return totalKuiKills() >= 7500; } },
    { id: 'kui_bomb_10',  name: '定向拆迁办',     desc: '累计用炸弹击杀1500只魁',   check: function() { return totalBombKui() >= 1500; } },
    { id: 'kui_laser_10', name: '光速超度',       desc: '累计用激光击杀1500只魁',   check: function() { return totalLaserKui() >= 1500; } },
    { id: 'kui_pepper_10',name: '铁板魁首',       desc: '累计用辣椒击杀1500只魁',   check: function() { return totalPepperKui() >= 1500; } },
    { id: 'kui_minion_50_once', name: '裂变反应', desc: '单局内生成50只分裂魁',    check: function() { return kuiMinionsSpawnedThisGame >= 50; } },
    // 道具
    { id: 'first_heal',   name: '猫狮的祝福！',     desc: '第一次使用爱心回复生命',       check: function() { return false; } },
    { id: 'heal_overflow',name: '贪得无厌',       desc: '满血状态下使用爱心（提升上限）', check: function() { return false; } },
    { id: 'bomb_kill_r',  name: '精准爆破',       desc: '第一次用炸弹炸死浪人',         check: function() { return false; } },
    { id: 'bomb_kill_b',  name: '空壳粉碎者',     desc: '第一次用炸弹炸死公牛',         check: function() { return false; } },
    { id: 'laser_kill_r', name: '激光处决',       desc: '第一次用激光射死浪人',         check: function() { return false; } },
    { id: 'laser_kill_b', name: '红色光剑',       desc: '第一次用激光射死公牛',         check: function() { return false; } },
    { id: 'bomb_100shot', name: '核弹来了',       desc: '一次炸弹爆炸击杀100只以上普通怪', check: function() { return false; } },
    { id: 'pick_3types',  name: '收藏家',         desc: '一局内拾取三种不同道具',       check: function() { return false; } },
    { id: 'frost_first',  name: '冰河时代',       desc: '第一次使用冰霜冲击',           check: function() { return false; } },
    { id: 'frost_kill_n30',name:'冻豆腐',         desc: '冰冻后5秒内击杀30只普通怪',    check: function() { return false; } },
    { id: 'frost_kill_r', name: '速冻浪人',       desc: '冰冻后5秒内击杀浪人',         check: function() { return false; } },
    { id: 'frost_kill_b', name: '冷冻牛肉',       desc: '冰冻后5秒内击杀公牛',         check: function() { return false; } },
    { id: 'frost_3bulls', name: '愤怒的公牛',     desc: '同时冰冻3只公牛',             check: function() { return false; } },
    { id: 'pepper_first',   name: '火爆脾气',     desc: '第一次使用火爆辣椒',         check: function() { return false; } },
    { id: 'die_pepper',     name: '当心火焰！',   desc: '死于辣椒的火焰',             check: function() { return totalDeathByCause('辣椒的火焰') >= 1; } },
    { id: 'frost_pepper',   name: '冰火两重天',   desc: '辣椒火焰存在时使用寒冰蘑菇', check: function() { return false; } },
    { id: 'pepper_n400',    name: '烤焦了',       desc: '辣椒累计击杀400只普通怪',    check: function() { return totalPepperNormal() >= 400; } },
    { id: 'pepper_n1000',   name: '火烧连营',     desc: '辣椒累计击杀1000只普通怪',   check: function() { return totalPepperNormal() >= 1000; } },
    { id: 'pepper_n2000',   name: '炼狱',         desc: '辣椒累计击杀2000只普通怪',   check: function() { return totalPepperNormal() >= 2000; } },
    { id: 'pepper_n5000',   name: '焚天灭地',     desc: '辣椒累计击杀5000只普通怪',   check: function() { return totalPepperNormal() >= 5000; } },
    { id: 'pepper_r10',     name: '碳烤浪人',     desc: '辣椒累计击杀10只浪人',       check: function() { return totalPepperRonin() >= 10; } },
    { id: 'pepper_r30',     name: '全熟武士',     desc: '辣椒累计击杀30只浪人',       check: function() { return totalPepperRonin() >= 30; } },
    { id: 'pepper_r50',     name: '浪人烧烤摊',   desc: '辣椒累计击杀50只浪人',       check: function() { return totalPepperRonin() >= 50; } },
    { id: 'pepper_r100',    name: '浪人灭绝者',   desc: '辣椒累计击杀100只浪人',      check: function() { return totalPepperRonin() >= 100; } },
    { id: 'pepper_b10',     name: '烤牛排',       desc: '辣椒累计击杀10只公牛',       check: function() { return totalPepperBull() >= 10; } },
    { id: 'pepper_b30',     name: '全熟斗牛',     desc: '辣椒累计击杀30只公牛',       check: function() { return totalPepperBull() >= 30; } },
    { id: 'pepper_b50',     name: '公牛烧烤摊',   desc: '辣椒累计击杀50只公牛',       check: function() { return totalPepperBull() >= 50; } },
    { id: 'pepper_b100',    name: '斗牛场大火',   desc: '辣椒累计击杀100只公牛',      check: function() { return totalPepperBull() >= 100; } },
    { id: 'item_kill_50', name: '清洁工',         desc: '累计使用道具击杀200只普通怪',   check: function() { return totalItemKillNormal() >= 50*4; } },
    { id: 'item_kill_200',name: '大扫除',         desc: '累计使用道具击杀800只普通怪',  check: function() { return totalItemKillNormal() >= 200*4; } },
    { id: 'item_kill_500',name: '清道夫',         desc: '累计使用道具击杀2000只普通怪',  check: function() { return totalItemKillNormal() >= 500*4; } },
    { id: 'item_kill_r10',name: '浪人猎手',       desc: '累计使用道具击杀10只浪人',     check: function() { return totalItemKillElite() >= 10; } },
    { id: 'item_kill_r50',name: '不再是英雄',     desc: '累计使用道具击杀50只浪人',     check: function() { return totalItemKillElite() >= 50; } },
    { id: 'item_kill_b10',name: '斗牛表演',       desc: '累计使用道具击杀10只公牛',     check: function() { return totalItemKillBull() >= 10; } },
    { id: 'item_kill_b50',name: '角斗场',         desc: '累计使用道具击杀50只公牛',     check: function() { return totalItemKillBull() >= 50; } },
    // 炸弹击杀
    { id: 'bomb_n250',   name: '爆破工',         desc: '炸弹累计击杀500只普通怪',      check: function() { return totalBombNormal() >= 250*2; } },
    { id: 'bomb_n1000',  name: '爆破专家',       desc: '炸弹累计击杀2000只普通怪',     check: function() { return totalBombNormal() >= 1000*2; } },
    { id: 'bomb_r50',    name: '炸浪人',         desc: '炸弹累计击杀50只浪人',         check: function() { return totalBombRonin() >= 50; } },
    { id: 'bomb_b50',    name: '炸牛',           desc: '炸弹累计击杀50只公牛',         check: function() { return totalBombBull() >= 50; } },
    // 激光击杀
    { id: 'laser_n100',  name: '光棱',           desc: '激光累计击杀200只普通怪',      check: function() { return totalLaserNormal() >= 100*2; } },
    { id: 'laser_n400',  name: '光棱塔',         desc: '激光累计击杀800只普通怪',      check: function() { return totalLaserNormal() >= 400*2; } },
    { id: 'laser_r20',   name: '灭浪之光',       desc: '激光累计击杀20只浪人',         check: function() { return totalLaserRonin() >= 20; } },
    { id: 'laser_b20',   name: '光之斗牛',       desc: '激光累计击杀20只公牛',         check: function() { return totalLaserBull() >= 20; } },
    // 积累
    { id: 'rich_10k',   name: '万元户',     desc: '累计获得10000积分',      check: function() { return playerData.points >= 10000; } },
    { id: 'save_500',   name: '守财奴',     desc: '持有500积分不消费',      check: function() { return playerData.points >= 500; } },
    { id: 'shop_300',   name: '购物狂',     desc: '单次商城消费300积分以上', check: function() { return false; } },
    { id: 'plays_200',  name: '百场老将',   desc: '总场次达到200场',        check: function() { return gameLog.easy.plays+gameLog.normal.plays+gameLog.hard.plays >= 200; } },
    // 音乐
    { id: 'listen_30m', name: '聆听者',     desc: '累计播放音乐30分钟',     check: function() { return musicHallTotalTime >= 1800; } },
    { id: 'all_tracks', name: '全曲制霸',   desc: '播放过全部10首曲目',     check: function() { return musicHallTracksPlayed.length >= 10; } },
    { id: 'silence',    name: '静音模式',   desc: '音乐和音效均调至0%',     check: function() { return settings.musicVol === 0 && settings.sfxVol === 0; } },
    // 趣味
    { id: 'exact_60',   name: '强迫症', desc: '存活时间恰好60秒',       check: function() { return false; } },
    { id: 'pause_5',    name: '你有事情嘛', desc: '单局暂停超过5次',        check: function() { return false; } },
    { id: 'pause_wave', name: '踩点达人',   desc: '怪物潮来临时暂停游戏',   check: function() { return false; } },
    { id: 'hole_160',   name: '满屏怪',     desc: '同时存在160个普通怪',    check: function() { return false; } },
    { id: 'catlion_name', name: '猫狮大王来也', desc: '将某个存档的玩家名命名为"猫狮"', check: function() { return false; } },
    { id: 'max_lives_11', name: '无限生命', desc: '单局生命上限突破10爱心', check: function() { return false; } },
    // 自定义皮肤
    { id: 'custom_first_upload', name: '初次创作', desc: '第一次上传自定义皮肤', check: function() { return false; } },
    { id: 'custom_all_unlock', name: '虚空收藏家', desc: '解锁全部10个自定义槽位', check: function() { var s=loadCustomSkinSlots(); for(var i=0;i<s.length;i++){if(!s[i].unlocked)return false;} return true; } }
];

var unlockedAchievements = [];
var newAchievements = []; // 本次会话新解锁但未查看的成就
try {
    var savedAch = JSON.parse(localStorage.getItem('voidAchievements'));
    if (savedAch) unlockedAchievements = savedAch;
} catch(e) {}
// 自定义皮肤成就是全局的（跨存档），合并到当前存档成就列表
var globalAchIds = ['custom_first_upload', 'custom_all_unlock'];
for (var gai = 0; gai < globalAchIds.length; gai++) {
    if (localStorage.getItem('voidAch_' + globalAchIds[gai]) === '1') {
        if (unlockedAchievements.indexOf(globalAchIds[gai]) === -1) {
            unlockedAchievements.push(globalAchIds[gai]);
        }
    }
}

function unlockAchievement(id) {
    if (unlockedAchievements.indexOf(id) !== -1) return;
    unlockedAchievements.push(id);
    newAchievements.push(id);
    localStorage.setItem('voidAchievements', JSON.stringify(unlockedAchievements));
    autoSave();
    // 自定义皮肤成就同步到全局标记（跨存档）
    if (id.indexOf('custom_') === 0) {
        localStorage.setItem('voidAch_' + id, '1');
    }
    var ach = null;
    for (var a = 0; a < achievements.length; a++) {
        if (achievements[a].id === id) { ach = achievements[a]; break; }
    }
    if (ach) showAchievementToast(ach.name, ach.desc);
    // 成就角标
    document.getElementById('ach-badge').classList.add('show');
    updateStatsCategoryNotify();
}

function showAchievementToast(name, desc) {
    var toast = document.createElement('div');
    toast.className = 'ach-toast';
    toast.innerHTML = '<span>成就解锁: ' + name + '</span>';
    toast.style.cursor = 'pointer';
    toast.addEventListener('click', function() {
        if (gameStarted && !paused) { paused = true; document.getElementById('pause-btn').textContent = '继续'; }
        overlay.style.zIndex = '3000';
        document.getElementById('ach-badge').classList.remove('show');
        updateStatsCategoryNotify();
        content.innerHTML = '<h3>成就系统</h3>' + getAchievementHTML();
        newAchievements = [];
        setupAchievementToggle();
        overlay.classList.add('active');
        if (toast.parentNode) toast.remove();
    });
    document.body.appendChild(toast);
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 3100);
}

function checkAchievements() {
    var pts = playerData.totalRankPts || 0;
    for (var a = 0; a < achievements.length; a++) {
        var ach = achievements[a];
        if (ach.check.length === 0) {
            // 无参数 check（皮肤类）
            if (ach.check()) unlockAchievement(ach.id);
        } else {
            // 带参数 check（点数类）
            if (ach.check(pts)) unlockAchievement(ach.id);
        }
    }
}

// ==================== 游戏日志 ====================
var deathLabels = {
    normal: '普通怪的接触',
    ronin_bullet: '浪人的子弹',
    ronin_body: '浪人的拥抱',
    bull_bullet: '公牛的子弹',
    bull_body: '公牛的冲撞',
    edge_lava: '岩浆的洗礼',
    pepper_fire: '辣椒的火焰',
    kui_explosion: '魁的爆炸',
    kui_bomb_shot: '魁的弹射',
    kui_minion: '魁的残影',
    kui_bullet: '魁的子弹'
};

function loadGameLog() {
    try {
        var raw = localStorage.getItem('voidGameLog');
        if (raw) {
            var parsed = JSON.parse(raw);
            // 修复空对象或缺少难度键的旧数据
            if (!parsed.easy || typeof parsed.easy.plays !== 'number') {
                parsed.easy = { plays:0, bestTime:0, pts:0, score:0, bestPts:0, bestScore:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}} };
            }
            if (!parsed.normal || typeof parsed.normal.plays !== 'number') {
                parsed.normal = { plays:0, bestTime:0, pts:0, score:0, bestPts:0, bestScore:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}} };
            }
            if (!parsed.hard || typeof parsed.hard.plays !== 'number') {
                parsed.hard = { plays:0, bestTime:0, pts:0, score:0, bestPts:0, bestScore:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}} };
            }
            return parsed;
        }
        return { easy: { plays:0, bestTime:0, pts:0, score:0, bestPts:0, bestScore:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}} }, normal: { plays:0, bestTime:0, pts:0, score:0, bestPts:0, bestScore:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}} }, hard: { plays:0, bestTime:0, pts:0, score:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}}} };
    } catch(e) {
        return { easy: { plays:0, bestTime:0, pts:0, score:0, bestPts:0, bestScore:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}} }, normal: { plays:0, bestTime:0, pts:0, score:0, bestPts:0, bestScore:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}} }, hard: { plays:0, bestTime:0, pts:0, score:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}}} };
    }
}
function saveGameLog(log) { localStorage.setItem('voidGameLog', JSON.stringify(log)); }
var gameLog = loadGameLog();

function recordGame(diff, survived, cause) {
    var key = diff || 'normal';
    var entry = gameLog[key];
    if (typeof entry.pts !== 'number') entry.pts = 0;
    if (typeof entry.score !== 'number') entry.score = 0;
    entry.plays++;
    if (survived > entry.bestTime) entry.bestTime = Math.floor(survived);
    entry.pts += rankPoints;
    entry.score += gamePoints;
    if (rankPoints > (entry.bestPts||0)) entry.bestPts = rankPoints;
    if (gamePoints > (entry.bestScore||0)) entry.bestScore = gamePoints;
    if (cause) {
        var label = deathLabels[cause] || cause;
        entry.deaths[label] = (entry.deaths[label] || 0) + 1;
    }
    // 击杀统计
    if (typeof killStats !== 'undefined') {
        if (!entry.kills) entry.kills = { bomb: { normal: 0, ronin: 0, bull: 0, kui: 0 }, laser: { normal: 0, ronin: 0, bull: 0, kui: 0 }, pepper: { normal: 0, ronin: 0, bull: 0, kui: 0 } };
        if (!entry.kills.bomb.kui) entry.kills.bomb.kui = 0;
        if (!entry.kills.laser.kui) entry.kills.laser.kui = 0;
        if (!entry.kills.pepper) entry.kills.pepper = { normal: 0, ronin: 0, bull: 0, kui: 0 };
        entry.kills.bomb.normal += killStats.bomb.normal;
        entry.kills.bomb.ronin += killStats.bomb.ronin;
        entry.kills.bomb.bull += killStats.bomb.bull;
        entry.kills.bomb.kui += killStats.bomb.kui;
        entry.kills.laser.normal += killStats.laser.normal;
        entry.kills.laser.ronin += killStats.laser.ronin;
        entry.kills.laser.bull += killStats.laser.bull;
        entry.kills.laser.kui += killStats.laser.kui;
        if (!entry.kills.pepper) entry.kills.pepper = { normal: 0, ronin: 0, bull: 0, kui: 0 };
        entry.kills.pepper.normal += killStats.pepper.normal;
        entry.kills.pepper.ronin += killStats.pepper.ronin;
        entry.kills.pepper.bull += killStats.pepper.bull;
        entry.kills.pepper.kui += killStats.pepper.kui;
    }
    saveGameLog(gameLog);
}

function fmtSurvived(sec) {
    var m = Math.floor(sec / 60); var s = Math.floor(sec % 60);
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function buildLogSection(key, title, borderColor, titleColor) {
    var e = gameLog[key];
    var h = '<div style="border:2px solid ' + borderColor + ';border-radius:6px;padding:10px;margin-bottom:8px;">';
    h += '<p style="color:' + titleColor + ';font-weight:bold;margin:0 0 6px;">' + title + '</p>';
    h += '<p style="color:#a78bfa;font-size:12px;margin:2px 0;">游戏场数: <b>' + e.plays + '</b></p>';
    h += '<p style="color:#a78bfa;font-size:12px;margin:2px 0;">最佳记录: <b>' + fmtSurvived(e.bestTime) + '</b></p>';
    h += '<p style="color:#a78bfa;font-size:12px;margin:2px 0;">总共点数: <b>' + (e.pts||0) + '</b> · 积分: <b>' + (e.score||0) + '</b></p>';
    h += '<p style="color:#fbbf24;font-size:12px;margin:2px 0;">单局最高点数: <b>' + (e.bestPts||0) + '</b> · 单局最高积分: <b>' + (e.bestScore||0) + '</b></p>';
    var deathKeys = Object.keys(e.deaths);
    if (deathKeys.length > 0) {
        h += '<p style="color:#ef4444;font-size:11px;margin:4px 0 0;">死亡原因统计:</p>';
        for (var d = 0; d < deathKeys.length; d++) {
            h += '<p style="color:#f87171;font-size:11px;margin:1px 0 0 12px;">' + deathKeys[d] + ': ' + e.deaths[deathKeys[d]] + '次</p>';
        }
    } else {
        h += '<p style="color:#4b5563;font-size:11px;">暂无死亡记录</p>';
    }
    // 击杀统计
    if (e.kills) {
        var kb = e.kills.bomb, kl = e.kills.laser, kp = e.kills.pepper || { normal: 0, ronin: 0, bull: 0, kui: 0 };
        var bombTotal = kb.normal + kb.ronin + kb.bull + (kb.kui||0);
        var laserTotal = kl.normal + kl.ronin + kl.bull + (kl.kui||0);
        var pepperTotal = kp.normal + kp.ronin + kp.bull + (kp.kui||0);
        if (bombTotal + laserTotal + pepperTotal > 0) {
            h += '<p style="color:#22c55e;font-size:11px;margin:4px 0 0;">道具击杀:</p>';
            if (bombTotal > 0) h += '<p style="color:#f59e0b;font-size:11px;margin:1px 0 0 12px;">炸弹: 普通' + kb.normal + ' 浪人' + kb.ronin + ' 公牛' + kb.bull + ' 魁' + (kb.kui||0) + '</p>';
            if (laserTotal > 0) h += '<p style="color:#a855f7;font-size:11px;margin:1px 0 0 12px;">激光: 普通' + kl.normal + ' 浪人' + kl.ronin + ' 公牛' + kl.bull + ' 魁' + (kl.kui||0) + '</p>';
            if (pepperTotal > 0) h += '<p style="color:#ef4444;font-size:11px;margin:1px 0 0 12px;">辣椒: 普通' + kp.normal + ' 浪人' + kp.ronin + ' 公牛' + kp.bull + ' 魁' + (kp.kui||0) + '</p>';
        }
    }
    h += '</div>';
    return h;
}

function getGameLogHTML() {
    // 总和统计
    var totalPlays = gameLog.easy.plays + gameLog.normal.plays + gameLog.hard.plays;
    var totalPts = (gameLog.easy.pts||0) + (gameLog.normal.pts||0) + (gameLog.hard.pts||0);
    var totalScore = (gameLog.easy.score||0) + (gameLog.normal.score||0) + (gameLog.hard.score||0);
    var totalDeaths = {};
    ['easy','normal','hard'].forEach(function(k) {
        var dk = Object.keys(gameLog[k].deaths);
        for (var d = 0; d < dk.length; d++) {
            totalDeaths[dk[d]] = (totalDeaths[dk[d]] || 0) + gameLog[k].deaths[dk[d]];
        }
    });
    var bestOverall = Math.max(gameLog.easy.bestTime, gameLog.normal.bestTime, gameLog.hard.bestTime);
    var bestPtsOverall = Math.max(gameLog.easy.bestPts||0, gameLog.normal.bestPts||0, gameLog.hard.bestPts||0);
    var bestScoreOverall = Math.max(gameLog.easy.bestScore||0, gameLog.normal.bestScore||0, gameLog.hard.bestScore||0);

    var html = '<div style="max-height:55vh;overflow-y:auto;">';
    // 总和
    html += '<div style="border:2px solid #fbbf24;border-radius:6px;padding:10px;margin-bottom:10px;">';
    html += '<p style="color:#fbbf24;font-weight:bold;margin:0 0 6px;">总记</p>';
    html += '<p style="color:#a78bfa;font-size:12px;margin:2px 0;">总场次: <b>' + totalPlays + '</b></p>';
    html += '<p style="color:#a78bfa;font-size:12px;margin:2px 0;">全难度最佳: <b>' + fmtSurvived(bestOverall) + '</b></p>';
    html += '<p style="color:#a78bfa;font-size:12px;margin:2px 0;">总点数: <b>' + totalPts + '</b> · 总积分: <b>' + totalScore + '</b></p>';
    html += '<p style="color:#fbbf24;font-size:12px;margin:2px 0;">全场最佳点数: <b>' + bestPtsOverall + '</b> · 全场最佳积分: <b>' + bestScoreOverall + '</b></p>';
    html += '<p style="color:pink;">死亡记录</p>';
    var tdKeys = Object.keys(totalDeaths);
    if (tdKeys.length > 0) {
        for (var td = 0; td < tdKeys.length; td++) {
            html += '<p style="color:#f87171;font-size:11px;margin:1px 0 0 8px;">' + tdKeys[td] + ': ' + totalDeaths[tdKeys[td]] + '次</p>';
        }
    }
    // 总击杀
    var totKills = { bomb: { normal: 0, ronin: 0, bull: 0, kui: 0 }, laser: { normal: 0, ronin: 0, bull: 0, kui: 0 }, pepper: { normal: 0, ronin: 0, bull: 0, kui: 0 } };
    ['easy','normal','hard'].forEach(function(k) {
        var ek = gameLog[k].kills;
        if (ek) {
            totKills.bomb.normal += ek.bomb.normal;
            totKills.bomb.ronin += ek.bomb.ronin;
            totKills.bomb.bull += ek.bomb.bull;
            totKills.bomb.kui += (ek.bomb.kui||0);
            totKills.laser.normal += ek.laser.normal;
            totKills.laser.ronin += ek.laser.ronin;
            totKills.laser.bull += ek.laser.bull;
            totKills.laser.kui += (ek.laser.kui||0);
            if (ek.pepper) {
                totKills.pepper.normal += ek.pepper.normal;
                totKills.pepper.ronin += ek.pepper.ronin;
                totKills.pepper.bull += ek.pepper.bull;
                totKills.pepper.kui += (ek.pepper.kui||0);
            }
        }
    });
    var totBomb = totKills.bomb.normal + totKills.bomb.ronin + totKills.bomb.bull + totKills.bomb.kui;
    var totLaser = totKills.laser.normal + totKills.laser.ronin + totKills.laser.bull + totKills.laser.kui;
    var totPepper = totKills.pepper.normal + totKills.pepper.ronin + totKills.pepper.bull + totKills.pepper.kui;
    if (totBomb + totLaser + totPepper > 0) {
        html += '<p style="color:#22c55e;font-size:11px;margin:4px 0 0;">道具总击杀记录:</p>';
        if (totBomb > 0) html += '<p style="color:#f59e0b;font-size:11px;margin:1px 0 0 8px;">炸弹: 普通' + totKills.bomb.normal + ' 浪人' + totKills.bomb.ronin + ' 公牛' + totKills.bomb.bull + ' 魁' + totKills.bomb.kui + '</p>';
        if (totLaser > 0) html += '<p style="color:#a855f7;font-size:11px;margin:1px 0 0 8px;">激光: 普通' + totKills.laser.normal + ' 浪人' + totKills.laser.ronin + ' 公牛' + totKills.laser.bull + ' 魁' + totKills.laser.kui + '</p>';
        if (totPepper > 0) html += '<p style="color:#ef4444;font-size:11px;margin:1px 0 0 8px;">辣椒: 普通' + totKills.pepper.normal + ' 浪人' + totKills.pepper.ronin + ' 公牛' + totKills.pepper.bull + ' 魁' + totKills.pepper.kui + '</p>';
    }
    html += '</div>';
    // 三个难度
    html += buildLogSection('easy', '简单', '#34d399', '#34d399');
    html += buildLogSection('normal', '普通', '#f59e0b', '#f59e0b');
    html += buildLogSection('hard', '困难', '#ef4444', '#ef4444');
    html += '</div>';
    return html;
}

var showHiddenAchievements = false;

function setupAchievementToggle() {
    setTimeout(function() {
        var btn = document.getElementById('toggleHiddenAch');
        if (btn) {
            btn.addEventListener('click', function() {
                playClick();
                showHiddenAchievements = !showHiddenAchievements;
                content.innerHTML = '<h3>成就系统</h3>' + getAchievementHTML();
                setupAchievementToggle();
            });
        }
    }, 50);
}

function getAchProgress(id) {
    if (id === 'skin_1')  { var n=0; for (var i=0;i<playerData.ownedSkins.length;i++) { if (playerData.ownedSkins[i]!=='heart') n++; } return n+'/3'; }
    if (id === 'skin_6')  { var n=0; for (var i=0;i<playerData.ownedSkins.length;i++) { if (playerData.ownedSkins[i]!=='heart') n++; } return n+'/18'; }
    if (id === 'skin_12') { var n=0; for (var i=0;i<playerData.ownedSkins.length;i++) { if (playerData.ownedSkins[i]!=='heart') n++; } return n+'/36'; }
    if (id === 'skin_all'){ var n=0; for (var i=0;i<playerData.ownedSkins.length;i++) { if (playerData.ownedSkins[i]!=='heart') n++; } return n+'/'+(getTotalSkinCount()-1); }
    if (id === 'skin_collection') { var best=0; for (var ci=0;ci<skinCollections.length;ci++) { var m=0; for (var si=0;si<skinCollections[ci].skins.length;si++) { if (isSkinOwned(skinCollections[ci].skins[si].id)) m++; } if (m>best) best=m; } return best+'/16'; }
    if (id.indexOf('pts_')===0) { var ptMap={100:500,200:1000,400:2000,600:3000,1000:5000,1600:12800,2000:20000}; var k=parseInt(id.split('_')[1]); var t=ptMap[k]||k; var rp=playerData.totalRankPts||0; return Math.min(rp,t)+'/'+t; }
    if (id.indexOf('checkin_')===0) { var t=parseInt(id.split('_')[1]); return Math.min(playerData.totalCheckins||0,t)+'/'+t; }
    if (id.indexOf('plays_')===0) { var t=parseInt(id.split('_')[1]); var p=gameLog.easy.plays+gameLog.normal.plays+gameLog.hard.plays; return Math.min(p,t)+'/'+t; }
    if (id.indexOf('d_rb_')===0) { var t=parseInt(id.split('_')[2]); var p=totalDeathByCause('浪人的子弹'); return Math.min(p,t)+'/'+t; }
    if (id.indexOf('d_lava_')===0) { var t=parseInt(id.split('_')[2]); var p=totalDeathByCause('岩浆的洗礼'); return Math.min(p,t)+'/'+t; }
    if (id.indexOf('d_bb_')===0) { var t=parseInt(id.split('_')[2]); var p=totalDeathByCause('公牛的子弹'); return Math.min(p,t)+'/'+t; }
    if (id==='bullet20') { var b=typeof roninBullets!=='undefined'?roninBullets.length:0; return Math.min(b,20)+'/20'; }
    if (id==='bull_bullet20') { var bb=typeof bullBullets!=='undefined'?bullBullets.length:0; return Math.min(bb,20)+'/20'; }
    if (id==='dodge10') { return Math.min(bulletsDodgedThisGame,10)+'/10'; }
    if (id==='shop_300') { return Math.min(shopSpentThisVisit,300)+'/300'; }
    if (id==='hole_160') { return Math.min(holes.length,160)+'/160'; }
    if (id==='item_kill_50')  { var t=totalItemKillNormal(); return Math.min(t,200)+'/200'; }
    if (id==='item_kill_200') { var t=totalItemKillNormal(); return Math.min(t,800)+'/800'; }
    if (id==='item_kill_500') { var t=totalItemKillNormal(); return Math.min(t,2000)+'/2000'; }
    if (id==='item_kill_r10')  { var t=totalItemKillElite(); return Math.min(t,10)+'/10'; }
    if (id==='item_kill_r50')  { var t=totalItemKillElite(); return Math.min(t,50)+'/50'; }
    if (id==='item_kill_b10')  { var t=totalItemKillBull(); return Math.min(t,10)+'/10'; }
    if (id==='item_kill_b50')  { var t=totalItemKillBull(); return Math.min(t,50)+'/50'; }
    if (id==='bomb_n250')  { var t=totalBombNormal(); return Math.min(t,500)+'/500'; }
    if (id==='bomb_n1000') { var t=totalBombNormal(); return Math.min(t,2000)+'/2000'; }
    if (id==='bomb_r50')   { var t=totalBombRonin(); return Math.min(t,50)+'/50'; }
    if (id==='bomb_b50')   { var t=totalBombBull(); return Math.min(t,50)+'/50'; }
    if (id==='laser_n100') { var t=totalLaserNormal(); return Math.min(t,200)+'/200'; }
    if (id==='laser_n400') { var t=totalLaserNormal(); return Math.min(t,800)+'/800'; }
    if (id==='laser_r20')  { var t=totalLaserRonin(); return Math.min(t,20)+'/20'; }
    if (id==='laser_b20')  { var t=totalLaserBull(); return Math.min(t,20)+'/20'; }
    if (id==='pepper_n400') { var t=totalPepperNormal(); return Math.min(t,400)+'/400'; }
    if (id==='pepper_n1000'){ var t=totalPepperNormal(); return Math.min(t,1000)+'/1000'; }
    if (id==='pepper_n2000'){ var t=totalPepperNormal(); return Math.min(t,2000)+'/2000'; }
    if (id==='pepper_n5000'){ var t=totalPepperNormal(); return Math.min(t,5000)+'/5000'; }
    if (id==='pepper_r10')  { var t=totalPepperRonin(); return Math.min(t,10)+'/10'; }
    if (id==='pepper_r30')  { var t=totalPepperRonin(); return Math.min(t,30)+'/30'; }
    if (id==='pepper_r50')  { var t=totalPepperRonin(); return Math.min(t,50)+'/50'; }
    if (id==='pepper_r100') { var t=totalPepperRonin(); return Math.min(t,100)+'/100'; }
    if (id==='pepper_b10')  { var t=totalPepperBull(); return Math.min(t,10)+'/10'; }
    if (id==='pepper_b30')  { var t=totalPepperBull(); return Math.min(t,30)+'/30'; }
    if (id==='pepper_b50')  { var t=totalPepperBull(); return Math.min(t,50)+'/50'; }
    if (id==='pepper_b100') { var t=totalPepperBull(); return Math.min(t,100)+'/100'; }
    if (id==='listen_30m') { var m=Math.floor(musicHallTotalTime/60); return Math.min(m,30)+'/30分'; }
    if (id==='all_tracks') { return Math.min(musicHallTracksPlayed.length,10)+'/10'; }
    return '';
}

function getAchievementHTML() {
    // 按解锁顺序排序：已解锁按解锁先后，未解锁保持原顺序
    var sorted = achievements.slice().sort(function(a, b) {
        var ai = unlockedAchievements.indexOf(a.id);
        var bi = unlockedAchievements.indexOf(b.id);
        if (ai !== -1 && bi !== -1) return bi - ai; // 最近解锁在上
        if (ai !== -1) return -1; // 已解锁排前面
        if (bi !== -1) return 1;
        return 0; // 都未解锁保持原序
    });

    var unlockedCount = unlockedAchievements.length;
    var totalCount = achievements.length;
    var html = '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<span style="color:#a78bfa;font-size:13px;">成就列表</span>';
    html += '<span style="color:#fbbf24;font-size:13px;font-weight:bold;">' + unlockedCount + '/' + totalCount + '</span>';
    html += '</div>';
    html += '<div class="ach-list" style="max-height:50vh;overflow-y:auto;">';
    for (var i = 0; i < sorted.length; i++) {
        var a = sorted[i];
        var unlocked = unlockedAchievements.indexOf(a.id) !== -1;
        var prog = showHiddenAchievements ? getAchProgress(a.id) : '';
        var desc = a.desc + (prog ? ' <span style="color:#fbbf24;">(' + prog + ')</span>' : '');
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(55,65,81,0.3);">';
        if (unlocked || showHiddenAchievements) {
            var isNew = unlocked && newAchievements.indexOf(a.id) !== -1;
            var prefix = unlocked ? '🏆 ' : '';
            var suffix = isNew ? ' <span style="color:#ef4444;font-size:10px;animation:badgeBounce 0.45s ease-in-out infinite alternate;">新!</span>' : '';
            html += '<span class="' + (unlocked ? 'ach-new' : '') + '" style="color:' + (unlocked ? '#fbbf24' : '#64748b') + ';font-size:14px;">' + prefix + a.name + suffix + '</span>';
            html += '<span style="color:#a78bfa;font-size:12px;text-align:right;">' + desc + '</span>';
        } else {
            html += '<span style="color:#4b5563;font-size:14px;">???</span>';
            html += '<span style="color:#374151;font-size:12px;">隐藏成就</span>';
        }
        html += '</div>';
    }
    html += '</div>';
    html += '<button id="toggleHiddenAch" style="display:block;margin:10px auto 0;padding:6px 20px;background:transparent;border:1px solid #7c3aed;border-radius:6px;color:#a78bfa;cursor:pointer;font-size:12px;">' + (showHiddenAchievements ? '隐藏未解锁' : '显示全部成就') + '</button>';
    return html;
}

// ==================== 本地数据系统 ====================
function loadPlayerData() {
    try {
        var raw = localStorage.getItem('voidFallData');
        return raw ? JSON.parse(raw) : { points: 0, lastCheckin: '', totalCheckins: 0, totalRankPts: 0, ownedSkins: ['heart'] };
    } catch (e) {
        return { points: 0, lastCheckin: '', totalCheckins: 0, totalRankPts: 0, ownedSkins: ['heart'] };
    }
}
function savePlayerData(d) {
    localStorage.setItem('voidFallData', JSON.stringify(d));
}
var playerData = loadPlayerData();
// 确保默认字段
if (!playerData.equippedSkin) playerData.equippedSkin = 'heart';
if (!playerData.ownedSkins || playerData.ownedSkins.indexOf('heart') === -1) playerData.ownedSkins = ['heart'];
if (typeof playerData.totalCheckins === 'undefined') playerData.totalCheckins = 0;
if (typeof playerData.totalRankPts === 'undefined') playerData.totalRankPts = 0;
savePlayerData(playerData);

function updatePointsDisplay() {
    var el = document.getElementById('points-display');
    if (el) el.textContent = '当前积分: ' + playerData.points;
    var cd = document.getElementById('checkin-days-display');
    if (cd) cd.textContent = '累积登录: ' + (playerData.totalCheckins || 0) + '天';
}
function syncBestPointsFromActiveSlot() {
    var idx = getActiveSlot();
    var slots = loadSaveSlots();
    if (slots && slots[idx]) {
        var bp = slots[idx].data && slots[idx].data.bestPoints;
        localStorage.setItem('voidFallBestPoints', bp || 0);
    } else {
        localStorage.setItem('voidFallBestPoints', 0);
    }
}
function ensureDefaultSaveSlot() {
    var slots = loadSaveSlots();
    var allEmpty = true;
    for (var i = 0; i < slots.length; i++) { if (slots[i] !== null) { allEmpty = false; break; } }
    if (allEmpty) {
        var now = new Date();
        var timeStr = now.getFullYear() + '-' + pad2(now.getMonth()+1) + '-' + pad2(now.getDate()) + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
        slots[0] = {
            name: '默认存档',
            playerName: '',
            time: timeStr,
            data: {
                playerData: JSON.parse(JSON.stringify(playerData)),
                gameLog: JSON.parse(JSON.stringify(gameLog)),
                achievements: [],
                bestTime: 0,
                bestPoints: 0,
                musicTime: 0,
                musicTracks: [],
                settings: { musicVol: 0.6, sfxVol: 0.6, hideCursor: false, musicRate: 1.0 },
                debugUnlocked: false
            }
        };
        saveSaveSlots(slots);
        setActiveSlot(0);
    }
}
ensureDefaultSaveSlot();
syncBestPointsFromActiveSlot();
updatePointsDisplay();

function updateCheckinReminder() {
    var el = document.querySelector('.menu-nav-list > .menu-nav-item');
    if (!el) return;
    if (playerData.lastCheckin !== todayStr()) {
        el.classList.add('need-checkin');
    } else {
        el.classList.remove('need-checkin');
    }
}
updateCheckinReminder();

function updateStatsCategoryNotify() {
    var el = document.getElementById('stats-cat-notify');
    if (!el) return;
    var hasNew = document.getElementById('rank-badge').classList.contains('show') ||
                 document.getElementById('ach-badge').classList.contains('show');
    el.classList.toggle('show', hasNew);
}
updateStatsCategoryNotify();

// ==================== 存档系统 ====================
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function loadSaveSlots() {
    try {
        var raw = localStorage.getItem('voidSaveSlots');
        return raw ? JSON.parse(raw) : [null, null, null];
    } catch(e) {
        return [null, null, null];
    }
}
function saveSaveSlots(slots) {
    localStorage.setItem('voidSaveSlots', JSON.stringify(slots));
}

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function buildSaveSlotHTML() {
    var slots = loadSaveSlots();
    var h = '<div style="display:flex;flex-direction:column;gap:12px;padding:4px 0;">';
    for (var i = 0; i < 3; i++) {
        var slot = slots[i];
        var hasData = slot !== null;
        h += '<div style="border:1px solid ' + (hasData ? '#7c3aed' : '#374151') + ';border-radius:8px;padding:12px;background:rgba(15,16,37,0.6);">';
        var activeIdx = getActiveSlot();
        h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
        h += '<span style="color:#c084fc;font-weight:bold;font-size:14px;letter-spacing:1px;">存档位 ' + (i+1) + '</span>';
        if (activeIdx === i) {
            h += '<span style="color:#ef4444;font-weight:bold;font-size:11px;animation:badgeBounce 0.5s ease-in-out infinite alternate;border:1px solid #ef4444;border-radius:4px;padding:1px 6px;letter-spacing:1px;">当前使用</span>';
        }
        if (hasData) {
            h += '<span style="color:#94a3b8;font-size:11px;font-variant-numeric:tabular-nums;">' + slot.time + '</span>';
        } else {
            h += '<span style="color:#6b7280;font-size:11px;">— 空 —</span>';
        }
        h += '</div>';

        // 存档名
        h += '<div style="display:flex;gap:6px;margin-bottom:4px;align-items:center;">';
        h += '<span style="color:#94a3b8;font-size:12px;white-space:nowrap;">存档名</span>';
        h += '<input id="slot-name-' + i + '" type="text" value="' + escHtml(hasData ? slot.name : '存档' + (i+1)) + '" style="flex:1;padding:4px 8px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:4px;color:#c4b5fd;font-size:12px;outline:none;">';
        h += '</div>';

        // 玩家名
        h += '<div style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">';
        h += '<span style="color:#94a3b8;font-size:12px;white-space:nowrap;">玩家名</span>';
        h += '<input id="slot-player-' + i + '" type="text" value="' + escHtml(hasData ? slot.playerName : '') + '" style="flex:1;padding:4px 8px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:4px;color:#c4b5fd;font-size:12px;outline:none;">';
        h += '<button onclick="saveSlotInfo(' + i + ')" title="保存存档名和玩家名" style="padding:4px 8px;background:rgba(52,211,153,0.1);border:1px solid #34d399;border-radius:4px;color:#34d399;font-size:11px;cursor:pointer;white-space:nowrap;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(52,211,153,0.25)\'" onmouseout="this.style.background=\'rgba(52,211,153,0.1)\'">保存</button>';
        h += '</div>';

        // 按钮行
        h += '<div style="display:flex;gap:8px;">';
        h += '<button onclick="saveToSlot(' + i + ')" style="flex:1;padding:7px 0;background:rgba(124,58,237,0.15);border:1px solid #7c3aed;border-radius:6px;color:#c4b5fd;font-size:12px;cursor:pointer;letter-spacing:1px;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(124,58,237,0.3)\'" onmouseout="this.style.background=\'rgba(124,58,237,0.15)\'">覆盖保存</button>';
        if (hasData) {
            h += '<button onclick="deleteSlot(' + i + ')" style="flex:1;padding:7px 0;background:rgba(239,68,68,0.1);border:1px solid #ef4444;border-radius:6px;color:#f87171;font-size:12px;cursor:pointer;letter-spacing:1px;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(239,68,68,0.25)\'" onmouseout="this.style.background=\'rgba(239,68,68,0.1)\'">删除存档</button>';
        }
        h += '<button onclick="useSlot(' + i + ')" style="flex:1;padding:7px 0;background:rgba(52,211,153,0.1);border:1px solid #34d399;border-radius:6px;color:#34d399;font-size:12px;cursor:pointer;letter-spacing:1px;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(52,211,153,0.25)\'" onmouseout="this.style.background=\'rgba(52,211,153,0.1)\'">' + (hasData ? '加载使用' : '新建开档') + '</button>';
        h += '</div>';

        h += '</div>';
    }
    h += '</div>';
    return h;
}

function saveToSlot(index) {
    if (!confirm('确定要覆盖保存到' + '存档位 ' + (index+1) + ' 吗？\n当前所有游戏数据将保存到该存档。')) return;
    var slots = loadSaveSlots();
    var nameInput = document.getElementById('slot-name-' + index);
    var playerInput = document.getElementById('slot-player-' + index);
    var name = nameInput ? nameInput.value.trim() : ('存档' + (index+1));
    var playerName = playerInput ? playerInput.value.trim() : '';
    if (!name) name = '存档' + (index+1);
    var now = new Date();
    var timeStr = now.getFullYear() + '-' + pad2(now.getMonth()+1) + '-' + pad2(now.getDate()) + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
    slots[index] = {
        name: name,
        playerName: playerName,
        time: timeStr,
        data: {
            playerData: JSON.parse(JSON.stringify(playerData)),
            gameLog: JSON.parse(JSON.stringify(gameLog)),
            achievements: JSON.parse(JSON.stringify(unlockedAchievements)),
            bestTime: parseFloat(localStorage.getItem('voidFallBest')) || 0,
            bestPoints: parseFloat(localStorage.getItem('voidFallBestPoints')) || 0,
            musicTime: parseInt(localStorage.getItem('voidMusicTime')) || 0,
            musicTracks: JSON.parse(localStorage.getItem('voidMusicTracks') || '[]'),
            settings: JSON.parse(JSON.stringify(settings)),
            debugUnlocked: !!debugUnlocked
        }
    };
    saveSaveSlots(slots);
    setActiveSlot(index);
    content.innerHTML = '<h3>存档管理</h3>' + buildSaveSlotHTML();
}

function deleteSlot(index) {
    if (!confirm('确定要删除存档位 ' + (index+1) + ' 的数据吗？\n此操作不可恢复！')) return;
    var slots = loadSaveSlots();
    slots[index] = null;
    saveSaveSlots(slots);
    content.innerHTML = '<h3>存档管理</h3>' + buildSaveSlotHTML();
}

function useSlot(index) {
    var slots = loadSaveSlots();
    var slot = slots[index];
    if (!slot) {
        if (!confirm('确定使用空存档位 ' + (index+1) + ' 开启新档吗？\n当前游戏数据将被清除，浏览器将刷新。')) return;
        // 清空所有游戏数据，开启新档
        playerData = { points: 0, lastCheckin: '', totalCheckins: 0, totalRankPts: 0, ownedSkins: ['heart'], equippedSkin: 'heart' };
        savePlayerData(playerData);
        gameLog = { easy: {plays:0, bestTime:0, pts:0, score:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}}}, normal: {plays:0, bestTime:0, pts:0, score:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}}}, hard: {plays:0, bestTime:0, pts:0, score:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}}} };
        saveGameLog(gameLog);
        unlockedAchievements = [];
        localStorage.setItem('voidAchievements', '[]');
        localStorage.removeItem('voidFallBest');
        localStorage.removeItem('voidFallBestPoints');
        localStorage.removeItem('voidMusicTime');
        localStorage.removeItem('voidMusicTracks');
        localStorage.removeItem('voidSettings');
        // 将新档数据写入存档位
        var now = new Date();
        var timeStr = now.getFullYear() + '-' + pad2(now.getMonth()+1) + '-' + pad2(now.getDate()) + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
        slots[index] = {
            name: '存档' + (index+1),
            playerName: '',
            time: timeStr,
            data: {
                playerData: JSON.parse(JSON.stringify(playerData)),
                gameLog: { easy: {plays:0, bestTime:0, pts:0, score:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}}}, normal: {plays:0, bestTime:0, pts:0, score:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}}}, hard: {plays:0, bestTime:0, pts:0, score:0, deaths:{}, kills:{bomb:{normal:0,ronin:0,bull:0,kui:0},laser:{normal:0,ronin:0,bull:0,kui:0},pepper:{normal:0,ronin:0,bull:0,kui:0}}} },
                achievements: [],
                bestTime: 0,
                bestPoints: 0,
                musicTime: 0,
                musicTracks: [],
                settings: JSON.parse(JSON.stringify(settings)),
                debugUnlocked: false
            }
        };
        saveSaveSlots(slots);
        setActiveSlot(index);
        location.reload();
        return;
    }
    if (!confirm('确定要加载存档位 ' + (index+1) + ' 的数据吗？\n当前游戏数据将被覆盖，浏览器将刷新。')) return;
    // 将存档数据写入本地存储
    var sd = slot.data;
    playerData = sd.playerData;
    savePlayerData(playerData);
    gameLog = sd.gameLog;
    saveGameLog(gameLog);
    unlockedAchievements = sd.achievements || [];
    localStorage.setItem('voidAchievements', JSON.stringify(unlockedAchievements));
    localStorage.setItem('voidFallBest', sd.bestTime || 0);
    localStorage.setItem('voidFallBestPoints', sd.bestPoints || 0);
    if (sd.musicTime) localStorage.setItem('voidMusicTime', sd.musicTime);
    if (sd.musicTracks) localStorage.setItem('voidMusicTracks', JSON.stringify(sd.musicTracks));
    // 恢复该存档的设置
    if (sd.settings) {
        settings = sd.settings;
        localStorage.setItem('voidSettings', JSON.stringify(settings));
    }
    if (typeof sd.debugUnlocked !== 'undefined') {
        debugUnlocked = sd.debugUnlocked;
        sessionStorage.setItem('voidDebug', debugUnlocked ? '1' : '0');
    }
    setActiveSlot(index);
    location.reload();
}

function saveSlotInfo(index) {
    var slots = loadSaveSlots();
    if (!slots[index]) { alert('该存档位为空，请先覆盖保存。'); return; }
    var nameInput = document.getElementById('slot-name-' + index);
    var playerInput = document.getElementById('slot-player-' + index);
    if (!nameInput || !playerInput) return;
    var name = nameInput.value.trim();
    if (!name) name = '存档' + (index+1);
    slots[index].name = name;
    slots[index].playerName = playerInput.value.trim();
    // 刷新时间戳
    var now = new Date();
    slots[index].time = now.getFullYear() + '-' + pad2(now.getMonth()+1) + '-' + pad2(now.getDate()) + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
    saveSaveSlots(slots);
    // 检查猫狮成就
    if (slots[index].playerName === '猫狮') {
        unlockAchievement('catlion_name');
    }
    nameInput.value = name;
    var content = document.getElementById('modalContent');
    if (content) content.innerHTML = '<h3>存档管理</h3>' + buildSaveSlotHTML();
}

// ==================== 活动存档与自动保存 ====================
function getActiveSlot() {
    try {
        var raw = localStorage.getItem('voidActiveSlot');
        return raw !== null ? parseInt(raw) : 0; // 默认存档一
    } catch(e) { return 0; }
}
function setActiveSlot(idx) {
    if (idx === null || idx === undefined) {
        localStorage.removeItem('voidActiveSlot');
    } else {
        localStorage.setItem('voidActiveSlot', idx);
    }
}
function autoSave() {
    var idx = getActiveSlot();
    var slots = loadSaveSlots();
    if (!slots[idx]) return; // 该存档位为空，不保存
    var now = new Date();
    slots[idx].time = now.getFullYear() + '-' + pad2(now.getMonth()+1) + '-' + pad2(now.getDate()) + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
    slots[idx].data = {
        playerData: JSON.parse(JSON.stringify(playerData)),
        gameLog: JSON.parse(JSON.stringify(gameLog)),
        achievements: JSON.parse(JSON.stringify(unlockedAchievements)),
        bestTime: parseFloat(localStorage.getItem('voidFallBest')) || 0,
        bestPoints: parseFloat(localStorage.getItem('voidFallBestPoints')) || 0,
        musicTime: parseInt(localStorage.getItem('voidMusicTime')) || 0,
        musicTracks: JSON.parse(localStorage.getItem('voidMusicTracks') || '[]'),
        settings: JSON.parse(JSON.stringify(settings)),
        debugUnlocked: !!debugUnlocked
    };
    saveSaveSlots(slots);
    showSaveToast();
}

function showSaveToast() {
    var el = document.getElementById('save-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'save-toast';
        el.style.cssText = 'position:fixed;bottom:12px;left:12px;color:#34d399;font-size:24px;font-weight:bold;z-index:9999;text-shadow:0 0 6px rgba(52,211,153,0.4);transition:opacity 0.4s;pointer-events:none;';
        document.body.appendChild(el);
    }
    el.textContent = '保存中...';
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(function() { el.style.opacity = '0'; }, 3000);
}

// ==================== 皮肤系统 ====================
// ==================== 皮肤合集系统 ====================
var skinCollections = [
    {
        id: 'c1',
        name: '合集一',
        src: './img/skins/cat-white.png',
        img: new Image(),
        loaded: false,
        cellW: 960, cellH: 960,
        cropX: 120, cropY: 120,
        cols: 4,
        skins: [
            { id: 'cat1',  name: '我晕啦~',  cost: 100 },
            { id: 'cat2',  name: '什么！？',  cost: 100 },
            { id: 'cat3',  name: '爱你哟~',  cost: 100 },
            { id: 'cat4',  name: '呜呜呜~',  cost: 100 },
            { id: 'cat5',  name: '期待~',     cost: 100 },
            { id: 'cat6',  name: '哇喔~',     cost: 100 },
            { id: 'cat7',  name: '不要啊!~',  cost: 100 },
            { id: 'cat8',  name: '切~',       cost: 100 },
            { id: 'cat9',  name: '生气中~',  cost: 100 },
            { id: 'cat10', name: '无语了~',   cost: 100 },
            { id: 'cat11', name: '酷~',       cost: 100 },
            { id: 'cat12', name: '无所谓啊~', cost: 100 },
            { id: 'cat13', name: '睡会儿...', cost: 100 },
            { id: 'cat14', name: '震惊!',     cost: 100 },
            { id: 'cat15', name: '享受嗷~',   cost: 100 },
            { id: 'cat16', name: '嗯?',       cost: 100 }
        ]
    },
    {
        id: 'c2', name: '合集二',
        src: './img/skins/collection-2.png',
        img: new Image(), loaded: false,
        cellW: 949/4, cellH: 256,
        cropX: 0, cropY: 0, cols: 4,
        skins: [
            { id: 'c2_1',  name: '爱心一~',  cost: 100 },
            { id: 'c2_2',  name: '撒娇中',  cost: 100 },
            { id: 'c2_3',  name: '棒棒糖',  cost: 100 },
            { id: 'c2_4',  name: '可怜可怜我吧',  cost: 100 },
            { id: 'c2_5',  name: '库~',  cost: 100 },
            { id: 'c2_6',  name: '大亨',  cost: 100 },
            { id: 'c2_7',  name: '超级侦探',  cost: 100 },
            { id: 'c2_8',  name: '酷!',  cost: 100 },
            { id: 'c2_9',  name: '猎杀时刻',  cost: 100 },
            { id: 'c2_10', name: '佳豪?', cost: 100 },
            { id: 'c2_11', name: '魔兽降世', cost: 100 },
            { id: 'c2_12', name: '电玩模式', cost: 100 },
            { id: 'c2_13', name: '艺术家', cost: 100 },
            { id: 'c2_14', name: '仙女下凡', cost: 100 },
            { id: 'c2_15', name: '包公是我', cost: 100 },
            { id: 'c2_16', name: '公主', cost: 100 }
        ]
    },
    {
        id: 'c3', name: '合集三',
        src: './img/skins/collection-3.png',
        img: new Image(), loaded: false,
        cellW: 256, cellH: 256,
        cropX: 0, cropY: 0, cropLeft: 8, cropRight: 2, cropTop: 15, cropBottom: 4, cols: 4,
        skins: [
            { id: 'c3_1',  name: '可爱二',  cost: 100 },
            { id: 'c3_2',  name: '开心',  cost: 100 },
            { id: 'c3_3',  name: '祈求',  cost: 100 },
            { id: 'c3_4',  name: '比( •̀ ω •́ )y',  cost: 100 },
            { id: 'c3_5',  name: '自恋',  cost: 100 },
            { id: 'c3_6',  name: '我酷吗',  cost: 100 },
            { id: 'c3_7',  name: '超酷',  cost: 100 },
            { id: 'c3_8',  name: '嗯哼',  cost: 100 },
            { id: 'c3_9',  name: '燃起来',  cost: 100 },
            { id: 'c3_10', name: '不屑一顾', cost: 100 },
            { id: 'c3_11', name: '超人形态', cost: 100 },
            { id: 'c3_12', name: '闪电侠', cost: 100 },
            { id: 'c3_13', name: '高兴', cost: 100 },
            { id: 'c3_14', name: '潮流少年', cost: 100 },
            { id: 'c3_15', name: '大亨二', cost: 100 },
            { id: 'c3_16', name: '', cost: 100 }
        ]
    },
    {
        id: 'c4', name: '合集四',
        src: './img/skins/collection-4.png',
        img: new Image(), loaded: false,
        cellW: 256, cellH: 256,
        cropX: 0, cropY: 0, cropLeft: 38, cols: 4,
        skins: [
            { id: 'c4_1',  name: '可爱三',  cost: 100 },
            { id: 'c4_2',  name: '求求了',  cost: 100 },
            { id: 'c4_3',  name: '比心',  cost: 100 },
            { id: 'c4_4',  name: '期待',  cost: 100 },
            { id: 'c4_5',  name: '自信',  cost: 100 },
            { id: 'c4_6',  name: '知识渊博',  cost: 100 },
            { id: 'c4_7',  name: '绅士',  cost: 100 },
            { id: 'c4_8',  name: '大侦探',  cost: 100 },
            { id: 'c4_9',  name: '小恶魔',  cost: 100 },
            { id: 'c4_10', name: '墨镜', cost: 100 },
            { id: 'c4_11', name: '认真起来', cost: 100 },
            { id: 'c4_12', name: '洋洋得意', cost: 100 },
            { id: 'c4_13', name: '惬意生活', cost: 100 },
            { id: 'c4_14', name: '呱~呱', cost: 100 },
            { id: 'c4_15', name: '老侦探', cost: 100 },
            { id: 'c4_16', name: '得意门生', cost: 100 }
        ]
    },
    {
        id: 'c5', name: '自定义',
        src: '', img: new Image(), loaded: false,
        cellW: 0, cellH: 0, cropX: 0, cropY: 0, cols: 4,
        skins: []
    }
];

// 加载所有雪碧图（跳过 c5 自定义合集）
for (var ci = 0; ci < skinCollections.length; ci++) {
    var coll = skinCollections[ci];
    if (coll.id === 'c5') continue;
    (function(c) {
        c.img.onload = function() { c.loaded = true; };
        c.img.src = c.src;
    })(coll);
}
// 初始化自定义皮肤
var CUSTOM_SLOT_COUNT = 10;
refreshC5Collection();

var currentCollectionId = 'c1';

function getCollection(id) {
    for (var ci = 0; ci < skinCollections.length; ci++) {
        if (skinCollections[ci].id === id) return skinCollections[ci];
    }
    return null;
}

function findSkinById(id) {
    if (id === 'heart') return null;
    for (var ci = 0; ci < skinCollections.length; ci++) {
        var coll = skinCollections[ci];
        for (var si = 0; si < coll.skins.length; si++) {
            if (coll.skins[si].id === id) return { collection: coll, index: si, skin: coll.skins[si] };
        }
    }
    return null;
}

function isSkinOwned(id) {
    if (id === 'heart') return true;
    if (id.indexOf('custom_slot_') === 0) {
        var idx = parseInt(id.replace('custom_slot_', ''));
        var slots = loadCustomSkinSlots();
        return slots[idx] && slots[idx].unlocked && !!slots[idx].image;
    }
    return playerData.ownedSkins.indexOf(id) !== -1;
}
function getEquippedSkin() { return playerData.equippedSkin || 'heart'; }

function getTotalSkinCount() {
    var count = 1;
    for (var ci = 0; ci < skinCollections.length; ci++) {
        count += skinCollections[ci].skins.length;
    }
    return count;
}

function hasCompleteCollection() {
    for (var ci = 0; ci < skinCollections.length; ci++) {
        if (skinCollections[ci].id === 'c5') continue; // 跳过自定义合集
        var allOwned = true;
        for (var si = 0; si < skinCollections[ci].skins.length; si++) {
            if (!isSkinOwned(skinCollections[ci].skins[si].id)) { allOwned = false; break; }
        }
        if (allOwned) return true;
    }
    return false;
}

function buySkin(id) {
    var info = findSkinById(id);
    if (!info || isSkinOwned(id)) return false;
    if (playerData.points < info.skin.cost) return false;
    playerData.points -= info.skin.cost;
    playerData.ownedSkins.push(id);
    savePlayerData(playerData);
    autoSave();
    updatePointsDisplay();
    shopSpentThisVisit += info.skin.cost;
    if (shopSpentThisVisit >= 300) unlockAchievement('shop_300');
    checkAchievements();
    return true;
}

function equipSkin(id) {
    if (!isSkinOwned(id)) return;
    playerData.equippedSkin = id;
    savePlayerData(playerData);
    autoSave();
}

// ==================== 自定义皮肤槽位系统 ====================
var _pendingUploadSlot = -1; // 当前上传操作的目标槽位索引

function initCustomSkinSlots() {
    var slots = [];
    for (var i = 0; i < CUSTOM_SLOT_COUNT; i++) {
        slots.push({ unlocked: false, image: null, name: '' });
    }
    return slots;
}
function loadCustomSkinSlots() {
    try {
        var data = JSON.parse(localStorage.getItem('voidCustomSkinSlots'));
        if (data && data.length === CUSTOM_SLOT_COUNT) return data;
    } catch(e) {}
    var slots = initCustomSkinSlots();
    // 兼容旧数据：迁移 voidCustomSkins
    try {
        var old = JSON.parse(localStorage.getItem('voidCustomSkins'));
        if (old && old.length > 0) {
            for (var i = 0; i < old.length && i < CUSTOM_SLOT_COUNT; i++) {
                slots[i].unlocked = true;
                slots[i].image = old[i].data;
                slots[i].name = old[i].name;
            }
        }
    } catch(e) {}
    saveCustomSkinSlots(slots);
    return slots;
}
function saveCustomSkinSlots(slots) {
    localStorage.setItem('voidCustomSkinSlots', JSON.stringify(slots));
}

function buyCustomSkinSlot(index) {
    var slots = loadCustomSkinSlots();
    if (index < 0 || index >= slots.length) return false;
    if (slots[index].unlocked) return false;
    if (playerData.points < 500) return false;
    playerData.points -= 500;
    slots[index].unlocked = true;
    saveCustomSkinSlots(slots);
    savePlayerData(playerData);
    autoSave();
    updatePointsDisplay();
    refreshC5Collection();
    checkAchievements();
    return true;
}

function uploadToSlot(index, file) {
    if (!file || !file.type.startsWith('image/')) return;
    var slots = loadCustomSkinSlots();
    if (index < 0 || index >= slots.length || !slots[index].unlocked) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        // 压缩图片到 200×200 以内，避免 dataURL 过大撑爆 localStorage
        var img = new Image();
        img.onload = function() {
            var MAX = 200;
            var w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
                if (w > h) { h = h * MAX / w; w = MAX; }
                else { w = w * MAX / h; h = MAX; }
            }
            var c = document.createElement('canvas');
            c.width = w; c.height = h;
            var cx = c.getContext('2d');
            cx.imageSmoothingEnabled = true;
            cx.drawImage(img, 0, 0, w, h);
            slots[index].image = c.toDataURL('image/png');
            slots[index].name = file.name.replace(/\.[^.]+$/, '');
            saveCustomSkinSlots(slots);
            unlockAchievement('custom_first_upload');
            checkAchievements();
            refreshC5Collection();
            openShopModal();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function clearCustomSkinSlot(index) {
    var slots = loadCustomSkinSlots();
    if (index < 0 || index >= slots.length) return;
    slots[index].image = null;
    slots[index].name = '';
    saveCustomSkinSlots(slots);
    var id = 'custom_slot_' + index;
    if (getEquippedSkin() === id) {
        playerData.equippedSkin = 'heart';
        savePlayerData(playerData);
        autoSave();
    }
    refreshC5Collection();
}

function refreshC5Collection() {
    var c5 = null;
    for (var ci = 0; ci < skinCollections.length; ci++) {
        if (skinCollections[ci].id === 'c5') { c5 = skinCollections[ci]; break; }
    }
    if (!c5) return;
    var slots = loadCustomSkinSlots();
    c5.skins = [];
    for (var i = 0; i < slots.length; i++) {
        if (!slots[i].image) continue; // 只有有图片的才加入 skins
        (function(slot, idx) {
            var img = new Image();
            img.onload = function() {
                var info = findSkinById('custom_slot_' + idx);
                if (info) info.skin._loaded = true;
            };
            img.src = slot.image;
            c5.skins.push({
                id: 'custom_slot_' + idx,
                name: slot.name || '自定义' + (idx + 1),
                cost: 0,
                _slotIndex: idx,
                _img: img,
                _loaded: false
            });
        })(slots[i], i);
    }
}

// 绘制玩家模型（皮肤或默认爱心）
function drawPlayerModel(x, y, size, alpha) {
    var skinId = getEquippedSkin();
    // 自定义皮肤图片丢失时回退到爱心
    if (skinId.indexOf('custom_slot_') === 0 && !isSkinOwned(skinId)) {
        skinId = 'heart';
    }
    if (skinId === 'heart') {
        // 默认爱心
        ctx.save();
        ctx.globalAlpha = alpha || 1;
        var s = size / 18;
        ctx.beginPath();
        ctx.moveTo(x, y - 6 * s);
        ctx.bezierCurveTo(x, y - 14 * s, x - 14 * s, y - 14 * s, x - 14 * s, y - 6 * s);
        ctx.bezierCurveTo(x - 14 * s, y + 4 * s, x, y + 12 * s, x, y + 16 * s);
        ctx.bezierCurveTo(x, y + 12 * s, x + 14 * s, y + 4 * s, x + 14 * s, y - 6 * s);
        ctx.bezierCurveTo(x + 14 * s, y - 14 * s, x, y - 14 * s, x, y - 6 * s);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    } else {
        var info = findSkinById(skinId);
        if (info && info.collection) {
            if (info.collection.id === 'c5' && info.skin._img && info.skin._loaded) {
                // 自定义皮肤（单图，非雪碧图）— 居中裁剪 cover 模式 + 放大
                ctx.save();
                ctx.globalAlpha = alpha || 1;
                ctx.imageSmoothingEnabled = true;
                var img = info.skin._img;
                var cropSize = Math.min(img.width, img.height);
                var sx2 = (img.width - cropSize) / 2;
                var sy2 = (img.height - cropSize) / 2;
                var sz = unitSize * 5.75;
                ctx.drawImage(img, sx2, sy2, cropSize, cropSize, x - sz/2, y - sz/2, sz, sz);
                ctx.restore();
            } else if (info.collection.loaded) {
                var coll = info.collection;
            var row = Math.floor(info.index / coll.cols);
            var col = info.index % coll.cols;
            ctx.save();
            ctx.globalAlpha = alpha || 1;
            ctx.imageSmoothingEnabled = false;
            var sz = unitSize * 4;
            var cropL = coll.cropLeft || coll.cropX || 0;
            var cropR = coll.cropRight || coll.cropX || 0;
            var cropT = coll.cropTop || coll.cropY || 0;
            var cropB = coll.cropBottom || coll.cropY || 0;
            var sx = col * coll.cellW + cropL;
            var sy = row * coll.cellH + cropT;
            var sw = coll.cellW - cropL - cropR;
            var sh = coll.cellH - cropT - cropB;
            ctx.drawImage(coll.img, sx, sy, sw, sh, x - sz/2, y - sz/2, sz, sz);
            ctx.restore();
            }
        } else {
            // fallback: 小爱心
            ctx.save();
            ctx.globalAlpha = (alpha || 1) * 0.5;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y, unitSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
function timeToPoints(sec) {
    var total = 0;
    for (var t = 1; t <= Math.floor(sec / 20); t++) {
        total += Math.min(50, 15 + (t - 1) * 5);
    }
    return total;
}

var npcRankings = [
    { name: '猫狮大王', points: timeToPoints(1071) },
    { name: '喵小呜',   points: timeToPoints(1028) },
    { name: '我要困告咯',   points: timeToPoints(1008) },
    { name: '零',       points: timeToPoints(892) },
    { name: '克莱曼婷', points: timeToPoints(700) },
    { name: '李',       points: timeToPoints(684) },
    { name: '梦梦喵~',  points: timeToPoints(413) },
    { name: '蓝色眼泪', points: timeToPoints(400) },
    { name: 'tutorial', points: timeToPoints(100) }
];

function getRankingHTML() {
    var bestPts = parseFloat(localStorage.getItem('voidFallBestPoints')) || 0;
    var showPts = Math.max(rankPoints, bestPts);
    var list = [];
    var playerInserted = false;
    for (var i = 0; i < npcRankings.length; i++) {
        if (!playerInserted && showPts >= npcRankings[i].points) {
            list.push({ name: '【你】', points: showPts, isPlayer: true });
            playerInserted = true;
        }
        list.push(npcRankings[i]);
    }
    if (!playerInserted && showPts > 0) {
        list.push({ name: '【你】', points: showPts, isPlayer: true });
    }

    var html = '<div class="rank-table">';
    html += '<div class="rank-header"><span>排名</span><span>玩家</span><span>点数</span></div>';
    for (var i = 0; i < list.length; i++) {
        var cls = list[i].isPlayer ? 'rank-row player' : 'rank-row';
        var rank = i + 1;
        var medal = '';
        if (rank === 1) medal = ' 🥇';
        else if (rank === 2) medal = ' 🥈';
        else if (rank === 3) medal = ' 🥉';
        html += '<div class="' + cls + '">';
        html += '<span class="rank-num">' + rank + medal + '</span>';
        html += '<span class="rank-name">' + list[i].name + '</span>';
        html += '<span class="rank-time">' + list[i].points + ' 点</span>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function buildCheckinHTML() {
    var today = todayStr();
    var checked = (playerData.lastCheckin === today);
    var h = '<div style="text-align:center;">';
    h += '<p style="color:#fbbf24;font-size:16px;margin-bottom:10px;">当前积分: ' + playerData.points + '</p>';
    if (checked) {
        h += '<p style="color:#34d399;font-size:18px;">今日已签到 ✓</p>';
        h += '<p style="color:#94a3b8;font-size:13px;margin-top:6px;">明天再来领取 100 积分吧</p>';
    } else {
        h += '<button id="checkinBtn" style="padding:14px 40px;font-size:18px;background:linear-gradient(135deg,#7c3aed,#2563eb);border:none;border-radius:10px;color:#fff;cursor:pointer;letter-spacing:3px;">签到领 100 积分</button>';
    }
    h += '</div>';
    return h;
}

document.querySelectorAll('.menu-nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
        playClick();
        var key = this.getAttribute('data-modal');
        if (!key) return;
        if (key === 'pai') {
            content.innerHTML = '<h3>个人排名</h3>' + getRankingHTML();
            document.getElementById('rank-badge').classList.remove('show');
            updateStatsCategoryNotify();
        } else if (key === 'checkin') {
            content.innerHTML = '<h3>每日签到</h3>' + buildCheckinHTML();
            setTimeout(function() {
                var btn = document.getElementById('checkinBtn');
                if (btn) {
                    btn.addEventListener('click', function() {
                        playClick(clickCheckinOkSound);
                        playerData.points += 100;
                        playerData.totalCheckins++;
                        playerData.lastCheckin = todayStr();
                        savePlayerData(playerData);
                        autoSave();
                        updatePointsDisplay();
                        updateCheckinReminder();
                        checkAchievements();
                        content.innerHTML = '<h3>每日签到</h3>' + buildCheckinHTML();
                    });
                }
            }, 50);
        } else if (key === 'gamelog') {
            content.innerHTML = '<h3>游戏日志</h3>' + getGameLogHTML();
        } else if (key === 'achievement') {
            content.innerHTML = '<h3>成就系统</h3>' + getAchievementHTML();
            document.getElementById('ach-badge').classList.remove('show');
            updateStatsCategoryNotify();
            newAchievements = [];
            setupAchievementToggle();
        } else if (key === 'shop') {
            openShopModal();
            return;
        } else if (key === 'saveslot') {
            content.innerHTML = '<h3>存档管理</h3>' + buildSaveSlotHTML();
        } else {
            var data = modalData[key];
            content.innerHTML = '<h3>' + data.title + '</h3>' + data.html;
        }
        modalBox.classList.toggle('disclaimer', key === 'monster_archive');
        overlay.classList.add('active');
    });
});

closeBtn.addEventListener('click', function() {
    overlay.classList.remove('active');
    overlay.style.zIndex = '1000';
});

overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
        overlay.classList.remove('active');
        overlay.style.zIndex = '1000';
    }
});

// ==================== 分类导航折叠 ====================
function toggleCategory(el) {
    playClick();
    var sub = el.nextElementSibling;
    if (!sub || !sub.classList.contains('category-sub')) return;
    var isOpen = sub.classList.contains('open');
    // 收起其他展开的分类
    var allSubs = document.querySelectorAll('.category-sub.open');
    var allCats = document.querySelectorAll('.menu-nav-category.open');
    for (var i = 0; i < allSubs.length; i++) {
        if (allSubs[i] !== sub) allSubs[i].classList.remove('open');
    }
    for (var i = 0; i < allCats.length; i++) {
        if (allCats[i] !== el) allCats[i].classList.remove('open');
    }
    // 切换当前
    if (!isOpen) {
        sub.classList.add('open');
        el.classList.add('open');
    } else {
        sub.classList.remove('open');
        el.classList.remove('open');
    }
}

// ==================== 调试面板 ====================
var debugParams;

function buildDebugPanel() {
    var html = '';
    var keys = Object.keys(debugParams);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var p = debugParams[k];
        html += '<div class="debug-row">';
        html += '<span class="debug-label">' + p.label + '</span>';
        html += '<input type="range" class="debug-slider" data-key="' + k + '" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + p.val + '" oninput="onDebugSlider(this)">';
        html += '<span class="debug-val" id="dv_' + k + '">' + p.val.toFixed(2) + '</span>';
        html += '</div>';
    }
    html += '<div class="debug-row" style="justify-content:center;">';
    html += '<label style="color:#94a3b8;font-size:13px;cursor:pointer;">';
    html += '<input type="checkbox" id="debugInvincibleCb" onchange="onToggleInvincible(this)" style="accent-color:#7c3aed;margin-right:6px;">无敌模式';
    html += '</label>';
    html += '</div>';
    // 道具筛选
    html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #374151;">';
    html += '<p style="color:#a78bfa;font-size:12px;margin:0 0 6px;text-align:center;">道具刷新筛选<span id="itemFilterHint" style="color:#ef4444;font-size:10px;"></span></p>';
    html += '<div id="itemFilterChecks" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;"></div>';
    html += '</div>';
    // 开局精英生成（仅调试用）
    html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #374151;">';
    html += '<p style="color:#fbbf24;font-size:12px;margin:0 0 6px;text-align-center;">开局精英生成</p>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">';
    html += '<label style="color:#cbd5e1;font-size:12px;cursor:pointer;"><input type="checkbox" id="setSpawnRonin" onchange="updateSpawnElite(\'ronin\',this.checked)" style="accent-color:#f59e0b;margin-right:2px;"' + (settings.spawnRonin ? ' checked' : '') + '>浪人</label>';
    html += '<label style="color:#cbd5e1;font-size:12px;cursor:pointer;"><input type="checkbox" id="setSpawnBull" onchange="updateSpawnElite(\'bull\',this.checked)" style="accent-color:#ef4444;margin-right:2px;"' + (settings.spawnBull ? ' checked' : '') + '>公牛</label>';
    html += '<label style="color:#cbd5e1;font-size:12px;cursor:pointer;"><input type="checkbox" id="setSpawnKui" onchange="updateSpawnElite(\'kui\',this.checked)" style="accent-color:#22c55e;margin-right:2px;"' + (settings.spawnKui ? ' checked' : '') + '>魁首</label>';
    html += '</div></div>';
    html += '<button class="debug-reset" onclick="onDebugAddPoints()" style="margin-bottom:6px;margin-top:8px;">+1000积分</button>';
    html += '<button class="debug-reset" onclick="onDebugReset()">恢复默认</button>';
    return html;
}

function refreshDebugPanel() {
    var panel = document.getElementById('debugPanel');
    if (!panel) return;
    if (typeof invincibleLeadTime !== 'undefined') {
        debugParams.invincibleLead.val = invincibleLeadTime;
    }
    if (typeof pepperFireRadiusMult !== 'undefined') {
        debugParams.pepperFireRadius.val = pepperFireRadiusMult;
    }
    panel.innerHTML = buildDebugPanel();
    // 恢复无敌复选框状态
    var cb = document.getElementById('debugInvincibleCb');
    if (cb) cb.checked = debugInvincible;
    // 道具筛选复选框
    var checksDiv = document.getElementById('itemFilterChecks');
    if (checksDiv && typeof itemDefs !== 'undefined') {
        for (var d = 0; d < itemDefs.length; d++) {
            var def = itemDefs[d];
            var checked = true;
            if (typeof enabledItemIds !== 'undefined' && enabledItemIds !== null) {
                checked = enabledItemIds.indexOf(def.id) !== -1;
            }
            checksDiv.innerHTML += '<label style="color:#d1d5db;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px;">' +
                '<input type="checkbox" data-item="' + def.id + '" onchange="onToggleItemFilter(this)" style="accent-color:' + def.color + ';"' + (checked ? ' checked' : '') + '>' +
                def.name + '</label>';
        }
        // 空选提示
        var hint = document.getElementById('itemFilterHint');
        if (hint && typeof enabledItemIds !== 'undefined' && enabledItemIds !== null && enabledItemIds.length === 0) {
            hint.textContent = '(已选择不刷新道具)';
        }
    }
}

// 全局函数：道具筛选切换
function onToggleItemFilter(cb) {
    var id = cb.getAttribute('data-item');
    if (typeof enabledItemIds === 'undefined') return;
    if (enabledItemIds === null) {
        // 首次操作：初始化为全选
        enabledItemIds = [];
        for (var i = 0; i < itemDefs.length; i++) enabledItemIds.push(itemDefs[i].id);
    }
    if (cb.checked) {
        if (enabledItemIds.indexOf(id) === -1) enabledItemIds.push(id);
    } else {
        var idx = enabledItemIds.indexOf(id);
        if (idx !== -1) enabledItemIds.splice(idx, 1);
    }
    // 如果全选了就恢复为 null
    if (enabledItemIds.length === itemDefs.length) {
        enabledItemIds = null;
    }
    if (typeof saveItemFilter === 'function') saveItemFilter();
    var hint = document.getElementById('itemFilterHint');
    if (hint) {
        hint.textContent = (enabledItemIds !== null && enabledItemIds.length === 0) ? '(已选择不刷新道具)' : '';
    }
}


// ==================== 游戏逻辑 ====================
var gameScreen = document.getElementById('game-screen');
var gameInner = document.getElementById('game-inner');
var countdownEl = document.getElementById('countdown');
var countdownTipTextEl = document.getElementById('countdown-tip-text');
var countdownPreviewCanvas = document.getElementById('countdown-preview');
var countdownPreviewCtx = countdownPreviewCanvas.getContext('2d');
var countdownBarFill = document.getElementById('countdown-bar-fill');
var gameHud = document.getElementById('game-hud');
var hpDisplay = document.getElementById('hp-display');
var timerDisplay = document.getElementById('timer-display');
var gameCanvas = document.getElementById('game-canvas');
var ctx = gameCanvas.getContext('2d');
var gameOverScreen = document.getElementById('game-over-screen');
var finalTimeEl = document.getElementById('final-time');
var restartBtn = document.getElementById('restart-btn');
var startBtn = document.getElementById('add-two');
var fpsDisplayEl = document.getElementById('fps-display');
var fpsFrames = 0;
var fpsLastTime = 0;

var canvasW, canvasH;
var player = { x: 0, y: 0, r: 18, vx: 0, vy: 0 };
var holes = [];
var pendingSpawns = []; // 即将生成的怪（1秒预警）
var lives = 3;
var maxLives = 3;
var difficulty = 'normal'; // 'easy' | 'normal' | 'hard'
var gameTime = 0;
var gamePoints = 0;
var lastPointsCheck = 0;
var rankPoints = 0;
var lastRankMinute = 0;
var lastHardMinute = 0;
var rankPointsCapHit = false;
var gameRunning = false;
var gameStarted = false;
// 分层生成系统（各层独立并行）
var layer1Timer = 0;
var layer10Timer = 0;
var layer30Timer = 0;
var layer60Timer = 0;
var beginnerLeft = true;
var maxHoles = 160;
var lastSpeedTier = 0;
var paused = false;
var debugInvincible = false;
// 成就追踪（本局）
var lastDamageTime = 0; // 上次受伤时间，用于无伤窗口检测
var edgeTouched = { top: false, bottom: false, left: false, right: false };
var mouseMovedFirst10s = false;
var sawRoninThisGame = false;
var sawBullThisGame = false;
var sawKuiThisGame = false;
var kuiMinionsSpawnedThisGame = 0;
var bulletsDodgedThisGame = 0;
var pauseCountThisGame = 0;
var wavePausedThisGame = false;
var reached1LifeTime = 0; // 剩1条命的时间点
var shopSpentThisVisit = 0;
var musicHallTotalTime = parseInt(localStorage.getItem('voidMusicTime')) || 0;
var musicHallTracksPlayed = [];
try { var mtp = JSON.parse(localStorage.getItem('voidMusicTracks')); if (mtp) musicHallTracksPlayed = mtp; } catch(e) {}
function saveMusicData() {
    localStorage.setItem('voidMusicTime', musicHallTotalTime);
    localStorage.setItem('voidMusicTracks', JSON.stringify(musicHallTracksPlayed));
}
// 定时保存
setInterval(saveMusicData, 5000);
var cursorX = 0, cursorY = 0;
var rawScreenX = 0, rawScreenY = 0;  // 原始屏幕坐标，缩放变更时用于重算
var animId = null;
var lastTime = 0;
var gameScale = 1.0;
var zoomWarnTimer = null;

// 屏幕坐标 → 画布坐标（固定映射，不依赖玩家位置）
function toCanvasX(sx) { return sx / gameScale; }
function toCanvasY(sy) { return sy / gameScale; }

// 设备检测
var isPC = !('ontouchstart' in window) && navigator.maxTouchPoints === 0;
var mobileScale = 0.35;

debugParams = {
    modelScale: { val: 0.35, min: 0.05, max: 3.0, step: 0.05, label: '模型缩放' },
    invincibleLead: { val: 0.3, min: 0, max: 0.5, step: 0.1, label: '无敌帧提前(s)' },
    pepperFireRadius: { val: 1.5, min: 1, max: 3, step: 0.1, label: '辣椒火焰半径(x)' }
};

function resizeCanvas() {
    canvasW = window.innerWidth;
    canvasH = window.innerHeight;
    gameCanvas.width  = Math.ceil(canvasW / gameScale);
    gameCanvas.height = Math.ceil(canvasH / gameScale);
}

// ---- 爱心绘制 ----
function drawHeart(x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha || 1;
    var s = size / 18;
    ctx.beginPath();
    ctx.moveTo(x, y - 6 * s);
    ctx.bezierCurveTo(x, y - 14 * s, x - 14 * s, y - 14 * s, x - 14 * s, y - 6 * s);
    ctx.bezierCurveTo(x - 14 * s, y + 4 * s, x, y + 12 * s, x, y + 16 * s);
    ctx.bezierCurveTo(x, y + 12 * s, x + 14 * s, y + 4 * s, x + 14 * s, y - 6 * s);
    ctx.bezierCurveTo(x + 14 * s, y - 14 * s, x, y - 14 * s, x, y - 6 * s);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}

// ---- 单位制 & 颜色 ----
var unitSize = 9 * mobileScale;  // 1单位 = 玩家半径

var holeColors = [
    '#c084fc', '#a855f7', '#e879f9',  // 紫
    '#22d3ee', '#38bdf8', '#06b6d4',  // 青
    '#f472b6', '#fb7185',              // 粉（去除红）
    '#fbbf24', '#f59e0b', '#fb923c',  // 金/橙
];

// ---- 黑洞绘制 ----
function drawHole(x, y, r, color) {
    // 实心圆
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // 细边，提升辨识度
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

// ---- 碰撞检测 ----
function checkCollision(px, py, pr, hx, hy, hr) {
    var dx = px - hx;
    var dy = py - hy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist < pr + hr;
}

// ---- 受伤 ----
var deathCause = '';
var lastHitSource = 'normal'; // normal / ronin_bullet / ronin_body / bull_bullet / bull_body / edge_lava / pepper_fire
var dying = false;
var deathTime = 0;
var shatterFrags = [];
var deathSoundPlayed = false;

function takeDamage() {
    lastDamageTime = gameTime;
    if (lives === 2) reached1LifeTime = gameTime; // 记录只剩1条命的时间点
    lives--;
    updateHearts();
    hurtSound.currentTime = 0;
    hurtSound.play().catch(function() {});
    player.invincible = true;
    setTimeout(function() { player.invincible = false; }, 1500);
    if (lives <= 0) {
        deathCause = lastHitSource;
        dying = true;
        deathTime = performance.now();
        player.invincible = true;
    }
}

// ---- 更新 HP ----
function updateHearts() {
    var hearts = hpDisplay.querySelectorAll('.heart-icon');
    hearts.forEach(function(h, i) {
        if (i >= lives) { h.classList.add('lost'); }
        else { h.classList.remove('lost'); }
        // 无敌时金色爱心
        if (player.invincible) { h.style.background = '#fbbf24'; h.style.boxShadow = '0 0 10px rgba(251,191,36,0.8)'; }
        else { h.style.background = ''; h.style.boxShadow = ''; }
    });
}

// ---- 更新计时器 ----
function updateTimer() {
    var sec = Math.floor(gameTime);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    timerDisplay.textContent =
        (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

// ---- HUD 提示 ----
var notifyTimer = null;
var notifyPersistEl = null;

// type: 'red'|'green'|'gold'|'purple', persist: true=持续显示
function showNotify(msg, type, persist) {
    var el = document.getElementById('hud-notify');
    if (!el) return;

    // 清除之前的普通提示定时器
    if (notifyTimer) { clearTimeout(notifyTimer); notifyTimer = null; }
    // 清除之前的持续提示
    if (notifyPersistEl) { notifyPersistEl.remove(); notifyPersistEl = null; }

    var span = document.createElement('span');
    span.className = 'notify-msg notify-' + (type || 'red');
    if (persist) {
        span.classList.add('persist');
        notifyPersistEl = span;
    }
    span.textContent = msg;
    el.appendChild(span);

    if (!persist) {
        notifyTimer = setTimeout(function() {
            if (span.parentNode) span.remove();
            notifyTimer = null;
        }, 4400);
    }
}

// 清除持续提示
function showLbStatus(msg, color) {
    var el = document.getElementById('lb-status');
    if (!el) {
        el = document.createElement('div');
        el.id = 'lb-status';
        el.style.cssText = 'text-align:center;font-size:12px;margin-top:8px;transition:opacity 0.3s;';
        var container = document.getElementById('gameOverScreen') || document.body;
        container.appendChild(el);
    }
    el.textContent = '📊 ' + msg;
    el.style.color = color;
    clearTimeout(el._hide);
    el._hide = setTimeout(function() { el.style.opacity = '0'; }, 5000);
}

function clearPersistNotify() {
    if (notifyPersistEl) { notifyPersistEl.remove(); notifyPersistEl = null; }
}

// ---- 生成黑洞 ----
function spawnHole() {
    var cw = gameCanvas.width;
    var ch = gameCanvas.height;
    var margin = 60;
    var r = 2 * unitSize;            // 2 个单位
    var safeDist = 10 * unitSize;
    var x, y, dist;
    var maxTries = 30;
    do {
        var side = Math.floor(Math.random() * 4);
        if (side === 0)      { x = margin;                  y = Math.random() * ch; }
        else if (side === 1) { x = cw - margin;             y = Math.random() * ch; }
        else if (side === 2) { x = Math.random() * cw;      y = margin; }
        else                 { x = Math.random() * cw;       y = ch - margin; }
        var dx = x - player.x;
        var dy = y - player.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        maxTries--;
    } while (dist < safeDist && maxTries > 0);

    var color = holeColors[Math.floor(Math.random() * holeColors.length)];
    pendingSpawns.push({ x: x, y: y, r: r, color: color, timer: 1 });
}

// 怪物潮生成（均匀分散在四边）
function spawnWaveHole(index, total) {
    var cw = gameCanvas.width;
    var ch = gameCanvas.height;
    var margin = 30;
    var r = 2 * unitSize;
    var perSide = Math.ceil(total / 4);
    var side = Math.floor(index / perSide);
    var posInSide = (index % perSide) / perSide;

    var x, y;
    if (side === 0)      { x = margin;              y = margin + posInSide * (ch - margin * 2); }
    else if (side === 1) { x = cw - margin;         y = margin + posInSide * (ch - margin * 2); }
    else if (side === 2) { x = margin + posInSide * (cw - margin * 2); y = margin; }
    else                 { x = margin + posInSide * (cw - margin * 2); y = ch - margin; }

    var color = holeColors[Math.floor(Math.random() * holeColors.length)];
    pendingSpawns.push({ x: x, y: y, r: r, color: color, timer: 1 });
}

// ---- 倒计时提示数据 ----
var countdownImg = {};
(function() {
    var paths = { bomb: './img/items/bomb.png', laser: './img/items/laser.png', pepper: './img/items/pepper.png', frost: './img/items/frost.png', heart: './img/items/heart.png' };
    for (var k in paths) { var img = new Image(); img.src = paths[k]; countdownImg[k] = img; }
})();

var countdownTips = [
   { text: '强力炸弹：普通&困难多次拾取来升级爆炸范围|爆炸前0.3秒有无敌帧，合理走位冲进怪物群以达到最大输出效果', icon: 'bomb' },
    { text: '迷你激光枪：米字形八方向发射激光，发射前0.3秒获得无敌帧，全屏效果,适合远程精准打击目标', icon: 'laser' },
    { text: '火爆辣椒：原地爆炸生成5秒火焰圈，爆炸前0.3秒获得无敌帧,勾引敌人主动进入以提高输出效率。小心烫伤自己!', icon: 'pepper' },
    { text: '寒冰蘑菇：减速战场上的所有敌人。公牛最喜欢的道具，狠狠克制它!', icon: 'frost' },
    { text: '猫狮的祝福：看到我记得快点拾取哦，祝你永远不死!拾取立即获得无敌帧', icon: 'heart' },
    { text: '浪人：定时四方向发射弹幕攻击且干扰你的走位，但它不会追踪你', icon: 'ronin' },
    { text: '公牛：锁定玩家位置短暂蓄力后高速突刺，最喜欢吃寒冰蘑菇，小心了!', icon: 'bull' },
    { text: '魁：死后爆炸分裂小魁，免疫冰冻减速?小魁会一直发射概率复制自己的子弹，及时消灭他们!', icon: 'kui' },
    { text: '道具刷新时有粉色"?"预警提示，怪物即将刷新红色"！"提示，提前规划走位', icon: 'item' },
    { text: '猫狮:屏幕边缘有岩浆流淌，千万不要触碰，不然就成"熟人"啦!', icon: 'heart' },
    { text: '猫狮:调试一个较高的鼠标灵敏度来体验闪电侠同款的速度吧!', icon: 'heart' },
    { text: '猫狮:强力炸弹爆炸效果可以清理一切障碍!', icon: 'heart' },
    { text: '猫狮:尝试多多存道具在怪物多的时候“大扫除”!', icon: 'heart' },
    { text: '猫狮:你可以试试设置里的调试面板密码20061121记住只有你知道哦~', icon: 'heart' },
];

function drawCountdownPreview(type) {
    var c = countdownPreviewCtx;
    var w = countdownPreviewCanvas.width, h = countdownPreviewCanvas.height;
    c.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2, s = 80;
    c.shadowBlur = 20; c.shadowColor = 'rgba(192,132,252,0.4)';
    switch (type) {
        case 'bomb': case 'laser': case 'pepper': case 'frost': case 'heart':
            c.shadowBlur = 0;
            var img = countdownImg[type];
            if (img && img.complete && img.naturalWidth > 0) {
                c.drawImage(img, cx - s * 0.45, cy - s * 0.45, s * 0.9, s * 0.9);
            } else {
                // fallback 简单形状
                c.fillStyle = type === 'bomb' ? '#1e1b4b' : type === 'laser' ? '#4c1d95' : type === 'pepper' ? '#7f1d1d' : type === 'frost' ? '#1e3a5f' : '#ef4444';
                c.beginPath(); c.arc(cx, cy, s * 0.45, 0, Math.PI * 2); c.fill();
                c.fillStyle = '#fff'; c.font = 'bold 28px sans-serif';
                c.textAlign = 'center'; c.textBaseline = 'middle';
                var ch = type === 'bomb' ? '💣' : type === 'laser' ? '⚡' : type === 'pepper' ? '🌶' : type === 'frost' ? '❄' : '♥';
                c.fillText(ch, cx, cy);
            }
            break;
        case 'monster':
            c.fillStyle = '#a855f7'; c.shadowColor = '#c084fc';
            c.beginPath(); c.arc(cx, cy, s * 0.4, 0, Math.PI * 2); c.fill();
            c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 2;
            c.beginPath(); c.arc(cx, cy, s * 0.4, 0, Math.PI * 2); c.stroke();
            c.shadowBlur = 0;
            break;
        case 'ronin':
            c.shadowColor = '#fbbf24';
            c.save(); c.translate(cx, cy); c.rotate(Math.PI / 4);
            c.fillStyle = '#fbbf24'; c.fillRect(-s * 0.35, -s * 0.35, s * 0.7, s * 0.7);
            c.restore(); c.shadowBlur = 0;
            c.fillStyle = '#1a1a2e'; c.font = 'bold ' + (s * 0.3) + 'px "Ma Shan Zheng",cursive,sans-serif';
            c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('浪', cx, cy);
            break;
        case 'bull':
            c.shadowColor = '#f97316'; c.fillStyle = '#f97316';
            c.beginPath(); c.moveTo(cx, cy - s * 0.45);
            c.lineTo(cx + s * 0.4, cy + s * 0.35); c.lineTo(cx - s * 0.4, cy + s * 0.35);
            c.closePath(); c.fill(); c.shadowBlur = 0;
            c.fillStyle = '#1a1a2e'; c.font = 'bold ' + (s * 0.3) + 'px "Ma Shan Zheng",cursive,sans-serif';
            c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('牛', cx, cy + s * 0.05);
            break;
        case 'kui':
            c.shadowColor = '#22d3ee';
            c.save(); c.translate(cx, cy); c.rotate(Math.PI / 4);
            c.fillStyle = '#ef4444'; c.fillRect(-s * 0.38, -s * 0.38, s * 0.76, s * 0.76);
            c.restore(); c.shadowBlur = 0;
            c.fillStyle = '#fca5a5'; c.font = 'bold ' + (s * 0.32) + 'px "Ma Shan Zheng",cursive,sans-serif';
            c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('魁', cx, cy);
            break;
        case 'item':
            c.shadowColor = '#ef4444'; c.fillStyle = 'rgba(239,68,68,0.6)';
            c.font = 'bold ' + (s * 0.7) + 'px sans-serif';
            c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', cx, cy);
            c.shadowBlur = 0;
            break;
        case 'points':
            c.shadowColor = '#fbbf24'; c.fillStyle = '#fbbf24';
            var pts = 5; c.beginPath();
            for (var pi = 0; pi < pts * 2; pi++) {
                var a = pi / pts * Math.PI - Math.PI / 2;
                var r = pi % 2 === 0 ? s * 0.42 : s * 0.18;
                c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            }
            c.closePath(); c.fill(); c.shadowBlur = 0;
            break;
    }
}

// ---- 开始游戏流程 ----
function startGameFlow() {
    resizeCanvas();
    player.x = canvasW / 2;
    player.y = canvasH / 2;
    player.vx = 0;
    player.vy = 0;
    player.dirX = 0;
    player.dirY = -1;
    player.r = Math.round(9 * mobileScale);
    player.invincible = false;
    holes = [];
    pendingSpawns = [];
    // 难度参数
    if (difficulty === 'easy') {
        lives = 6; maxLives = 6;
        beginnerLeft = false;
    } else if (difficulty === 'hard') {
        lives = 3; maxLives = 3;
        beginnerLeft = false;
    } else {
        lives = 4; maxLives = 4;
        beginnerLeft = true;
    }
    var diffEl = document.getElementById('diff-indicator');
    diffEl.textContent = difficulty === 'easy' ? '简单' : (difficulty === 'hard' ? '困难' : '普通');
    diffEl.className = difficulty;
    // 动态生成爱心
    var hpDiv = document.getElementById('hp-display');
    hpDiv.innerHTML = '';
    for (var hi = 0; hi < maxLives; hi++) {
        var heart = document.createElement('span');
        heart.className = 'heart-icon';
        hpDiv.appendChild(heart);
    }
    gameTime = 0;
    gamePoints = 0;
    rankPoints = 0;
    lastRankMinute = 0;
    lastHardMinute = 0;
    rankPointsCapHit = false;
    lastPointsCheck = 0;
    document.getElementById('game-points-display').textContent = '积分 +0';
    document.getElementById('rank-points-display').textContent = '点数 +0';
    document.getElementById('rank-points-display').style.color = '#34d399';
    layer1Timer = 0;
    layer10Timer = 0;
    layer30Timer = 0;
    layer60Timer = 0;
    maxHoles = 160;
    gameRunning = false;
    gameStarted = false;
    dying = false;
    shatterFrags = [];
    deathSoundPlayed = false;
    deathCause = '';
    lastHitSource = 'normal';
    lastDamageTime = 0;
    edgeTouched = { top: false, bottom: false, left: false, right: false };
    mouseMovedFirst10s = false;
    sawRoninThisGame = false;
    sawBullThisGame = false;
    sawKuiThisGame = false;
    kuiMinionsSpawnedThisGame = 0;
    pauseCountThisGame = 0;
    wavePausedThisGame = false;
    reached1LifeTime = 0;
    shopSpentThisVisit = 0;
    recordBroken = false;
    lastSpeedTier = 0;
    // 清除所有旧通知
    if (notifyTimer) { clearTimeout(notifyTimer); notifyTimer = null; }
    if (notifyPersistEl) { notifyPersistEl.remove(); notifyPersistEl = null; }
    var hudNotify = document.getElementById('hud-notify');
    if (hudNotify) hudNotify.innerHTML = '';
    timerDisplay.classList.remove('record');
    document.getElementById('record-indicator').classList.remove('show');
    if (typeof fantasyReset === 'function') fantasyReset();
    if (typeof itemReset === 'function') itemReset();
    gameCanvas.width  = Math.ceil(canvasW / gameScale);
    gameCanvas.height = Math.ceil(canvasH / gameScale);
    gameInner.style.transform = 'scale(1)';
    rawScreenX = canvasW / 2;
    rawScreenY = canvasH / 2;
    cursorX = toCanvasX(rawScreenX);
    cursorY = toCanvasY(rawScreenY);

    gameScreen.classList.add('active');
    gameCanvas.style.display = 'block';
    gameHud.classList.remove('active');
    gameOverScreen.classList.remove('active');
    countdownEl.classList.add('active');
    // 随机选一条提示并绘制预览
    var tip = countdownTips[Math.floor(Math.random() * countdownTips.length)];
    countdownTipTextEl.textContent = tip.text;
    drawCountdownPreview(tip.icon);
    // 进度条归零后开始5秒动画
    countdownBarFill.style.transition = 'none';
    countdownBarFill.style.width = '0%';
    void countdownBarFill.offsetWidth;
    countdownBarFill.style.transition = 'width 5s linear';
    countdownBarFill.style.width = '100%';
    updateHearts();
    updateTimer();

    setTimeout(function() {
        countdownEl.classList.remove('active');
        beginPlay();
    }, 5000);
}

// 倒计时已改用进度条 + setTimeout（见 startGameFlow 顶部）

// ---- 正式开始 ----
function beginPlay() {
    gameRunning = true;
    gameStarted = true;
    gameHud.classList.add('active');
    document.getElementById('pause-btn').classList.add('show');
    if (settings.hideCursor !== false) {
        document.body.style.cursor = 'none';
        if (gameCanvas) gameCanvas.style.cursor = 'none';
    }
    lastTime = performance.now();
    startGameMusic();
    if (typeof itemInitialSpawn === 'function') itemInitialSpawn();
    animId = requestAnimationFrame(gameLoop);
}

// ---- 结束游戏 ----
function endGame() {
    // 清理道具 UI（修复死后能量条残留 bug）
    if (typeof hideEffectUI === 'function') hideEffectUI();
    if (typeof activeEffects !== 'undefined') activeEffects = [];
    if (typeof frostFreeze !== 'undefined') { frostFreeze = false; frostSlowTimer = 0; frostSlowGlobal = 0; }
    gameRunning = false;
    gameStarted = false;
    cancelAnimationFrame(animId);
    document.body.style.cursor = '';
    if (gameCanvas) gameCanvas.style.cursor = '';
    resumeMenuMusic();
    paused = false;
    document.getElementById('pause-btn').classList.remove('show');
    document.getElementById('pause-btn').textContent = '暂停';
    gameCanvas.style.display = 'none';
    gameHud.classList.remove('active');
    gameOverScreen.classList.add('active');
    var sec = Math.floor(gameTime);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    finalTimeEl.textContent =
        (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    // 点数获得提示
    var diffLabel = difficulty === 'easy' ? '简单' : (difficulty === 'hard' ? '困难' : '普通');
    var ptsEl2 = document.createElement('div');
    ptsEl2.style.cssText = 'font-size:16px;color:#34d399;letter-spacing:2px;margin-top:4px;';
    ptsEl2.textContent = diffLabel + '模式 · 获得点数: ' + rankPoints;
    gameOverScreen.insertBefore(ptsEl2, document.getElementById('best-time'));
    setTimeout(function() { if (ptsEl2.parentNode) ptsEl2.remove(); }, 5000);
    // 点数来源明细
    if (killPts > 0) {
        var ptsDetail = document.createElement('div');
        ptsDetail.style.cssText = 'font-size:12px;color:#a78bfa;letter-spacing:1px;margin-top:2px;';
        ptsDetail.textContent = '时长点数: ' + timeRankPoints + ' + 击杀点数: ' + killPts;
        gameOverScreen.insertBefore(ptsDetail, document.getElementById('best-time'));
        setTimeout(function() { if (ptsDetail.parentNode) ptsDetail.remove(); }, 5000);
    }

    // 更新最佳点数记录（单次获得最高）
    var bestPts = parseFloat(localStorage.getItem('voidFallBestPoints')) || 0;
    var isNewRecord = rankPoints >= bestPts && rankPoints > 0;
    if (isNewRecord) {
        localStorage.setItem('voidFallBestPoints', rankPoints);
        document.getElementById('new-record').classList.add('show');
        // 排名角标
        document.getElementById('rank-badge').classList.add('show');
        updateStatsCategoryNotify();
    } else {
        document.getElementById('new-record').classList.remove('show');
    }
    var showBestPts = Math.max(rankPoints, bestPts);
    document.getElementById('best-time').textContent = '最佳: ' + showBestPts + ' 点';

    // 检查成就
    // 记录游戏日志 & 排名成就
    var killPts = (typeof killPoints !== 'undefined') ? killPoints : 0;
    var timeRankPoints = rankPoints - killPts;
    recordGame(difficulty, gameTime, deathCause);
    var playerRank = 1;
    var bestPtsRank = parseFloat(localStorage.getItem('voidFallBestPoints')) || rankPoints;
    var showPtsRank = Math.max(rankPoints, bestPtsRank);
    for (var ri = 0; ri < npcRankings.length; ri++) {
        if (showPtsRank < npcRankings[ri].points) playerRank++;
    }
    if (playerRank <= npcRankings.length) unlockAchievement('rank_1');
    if (playerRank <= 5) unlockAchievement('rank_5');
    if (playerRank <= 3) unlockAchievement('rank_3');
    if (playerRank === 1) unlockAchievement('rank_1st');

    // 场景成就
    if (Math.abs(gameTime - 60) <= 1) unlockAchievement('exact_60');
    if (edgeTouched.top && edgeTouched.bottom && edgeTouched.left && edgeTouched.right) unlockAchievement('edges');
    if (!mouseMovedFirst10s && gameTime >= 10) unlockAchievement('still');
    if (sawRoninThisGame) unlockAchievement('see_ronin');
    if (sawBullThisGame) unlockAchievement('see_bull');
    if (sawKuiThisGame) unlockAchievement('see_kui');
    if (kuiMinionsSpawnedThisGame >= 50) unlockAchievement('kui_minion_50_once');
    // 道具相关成就
    if (typeof itemAchFlags !== 'undefined') {
        if (itemAchFlags.usedHeal) unlockAchievement('first_heal');
        if (itemAchFlags.healOverflow) unlockAchievement('heal_overflow');
        if (itemAchFlags.bombKilledRonin) unlockAchievement('bomb_kill_r');
        if (itemAchFlags.bombKilledBull) unlockAchievement('bomb_kill_b');
        if (itemAchFlags.laserKilledRonin) unlockAchievement('laser_kill_r');
        if (itemAchFlags.laserKilledBull) unlockAchievement('laser_kill_b');
        if (itemAchFlags.bombOneShot100) unlockAchievement('bomb_100shot');
        if (Object.keys(itemAchFlags.pickedTypes).length >= 3) unlockAchievement('pick_3types');
        if (itemAchFlags.usedFrost) unlockAchievement('frost_first');
        if (itemAchFlags.frostKillN30) unlockAchievement('frost_kill_n30');
        if (itemAchFlags.frostKillR) unlockAchievement('frost_kill_r');
        if (itemAchFlags.frostKillB) unlockAchievement('frost_kill_b');
        if (itemAchFlags.frost3Bulls) unlockAchievement('frost_3bulls');
        if (itemAchFlags.usedPepper) unlockAchievement('pepper_first');
        if (itemAchFlags.frostDuringPepper) unlockAchievement('frost_pepper');
    }
    if (pauseCountThisGame >= 5) unlockAchievement('pause_5');
    if (wavePausedThisGame) unlockAchievement('pause_wave');
    // 绝境求生：剩1条命时开始计时，存活超过120秒
    if (reached1LifeTime > 0 && gameTime - reached1LifeTime >= 120) unlockAchievement('lastlife');
    if (maxLives >= 11) unlockAchievement('max_lives_11');

    // 首局成就
    unlockAchievement('game_1');

    // 结算积分和点数（累计）
    playerData.points += gamePoints;
    playerData.totalRankPts += rankPoints;
    savePlayerData(playerData);
    autoSave();
    // 上传最佳成绩到排行榜（仅新纪录 + 分数 ≥ 500 才有资格上榜）
    try {
        var _lbName = localStorage.getItem('voidLbName');
        if (!_lbName) {
            var _counter = parseInt(localStorage.getItem('voidLbCounter')) || 10000;
            _lbName = '坠落者' + _counter;
            localStorage.setItem('voidLbCounter', _counter + 1);
            localStorage.setItem('voidLbName', _lbName);
        }
        if (isNewRecord && showBestPts >= 500) {
            console.log('[LbUpload] 条件满足，开始上传', _lbName, showBestPts);
            (function _submitWithRetry(attempts) {
                submitScore(_lbName, showBestPts).then(function() {
                    console.log('[LbUpload] 上传成功');
                    localStorage.setItem('voidLbMaxUploaded', showBestPts);
                    showLbStatus('排行榜已更新', '#22c55e');
                }).catch(function() {
                    console.log('[LbUpload] 上传失败，剩余重试次数', attempts - 1);
                    if (attempts > 1) {
                        setTimeout(function() { _submitWithRetry(attempts - 1); }, 1500);
                    } else {
                        showLbStatus('排行榜上传失败', '#ef4444');
                    }
                });
            })(3);
        }
    } catch(e) { /* Supabase 不可用时不阻塞游戏 */ }
    // 结算后检查成就（totalRankPts 已更新）
    checkAchievements();
    updatePointsDisplay();
    // 在 Game Over 中显示获得积分
    var ptsEl = document.createElement('div');
    ptsEl.className = 'game-over-points';
    ptsEl.textContent = '获得积分: +' + gamePoints;
    ptsEl.style.cssText = 'font-size:20px;color:#fbbf24;letter-spacing:3px;margin-top:4px;font-weight:bold;';
    gameOverScreen.appendChild(ptsEl);
    setTimeout(function() { if (ptsEl.parentNode) ptsEl.parentNode.removeChild(ptsEl); }, 4000);

    // 击杀统计
    if (typeof killStats !== 'undefined') {
        var kb = killStats.bomb, kl = killStats.laser, kp = killStats.pepper || { normal: 0, ronin: 0, bull: 0, kui: 0 };
        var bombTotal = kb.normal + kb.ronin + kb.bull + (kb.kui||0);
        var laserTotal = kl.normal + kl.ronin + kl.bull + (kl.kui||0);
        var pepperTotal = kp.normal + kp.ronin + kp.bull + (kp.kui||0);
        if (bombTotal + laserTotal + pepperTotal > 0) {
            var killEl = document.createElement('div');
            killEl.style.cssText = 'font-size:13px;color:#22c55e;letter-spacing:1px;margin-top:10px;line-height:1.8;';
            var khtml = '击杀统计';
            if (bombTotal > 0) khtml += '<br><span style="color:#f59e0b;">💣炸弹:</span> 普通' + kb.normal + ' 浪人' + kb.ronin + ' 公牛' + kb.bull + ' 魁' + (kb.kui||0);
            if (laserTotal > 0) khtml += '<br><span style="color:#a855f7;">⚡激光:</span> 普通' + kl.normal + ' 浪人' + kl.ronin + ' 公牛' + kl.bull + ' 魁' + (kl.kui||0);
            if (pepperTotal > 0) khtml += '<br><span style="color:#ef4444;">🌶辣椒:</span> 普通' + kp.normal + ' 浪人' + kp.ronin + ' 公牛' + kp.bull + ' 魁' + (kp.kui||0);
            killEl.innerHTML = khtml;
            var restartBtn = document.getElementById('restart-btn');
            gameOverScreen.insertBefore(killEl, restartBtn);
            // 5秒后移除
            (function(el) { setTimeout(function() { if (el.parentNode) el.remove(); }, 5000); })(killEl);
        }
    }

    // 破纪录后自动弹出排名
    if (isNewRecord) {
        document.getElementById('rank-badge').classList.add('show');
        updateStatsCategoryNotify();
        setTimeout(function() {
            content.innerHTML = '<h3>个人排名</h3>' + getRankingHTML();
            overlay.classList.add('active');
            document.getElementById('rank-badge').classList.remove('show');
            updateStatsCategoryNotify();
        }, 800);
    }
}

// ---- 死亡动画 ----

// ---- 死亡动画 ----
function runDeathAnimation(elapsed) {
    var px = player.x;
    var py = player.y;
    var pr = player.r;

    // 死亡音效（0.8s 触发一次）
    if (!deathSoundPlayed && elapsed >= 0.8) {
        deathSoundPlayed = true;
        deathSound.currentTime = 0;
        deathSound.play().catch(function() {});
    }

    // 生成碎片（仅一次）
    if (shatterFrags.length === 0 && elapsed >= 2) {
        var fragCount = 16;
        for (var i = 0; i < fragCount; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = 40 + Math.random() * 140;
            shatterFrags.push({
                x: px, y: py,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 6,
                life: 0.5 + Math.random() * 0.7
            });
        }
    }

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // 阶段0 (0-2s): 冻结画面
    // 阶段1 (2-3s): 碎片飞散
    var phaseTime = elapsed - 2;

    for (var i = 0; i < holes.length; i++) {
        drawHole(holes[i].x, holes[i].y, holes[i].r, holes[i].color);
    }

    if (elapsed < 2) {
        // 冻结，爱心还在
        drawPlayerModel(px, py, pr * 2, 1);
    } else if (elapsed < 3) {
        // 碎片飞散
        for (var i = 0; i < shatterFrags.length; i++) {
            var f = shatterFrags[i];
            f.x += f.vx * 0.016;
            f.y += f.vy * 0.016;
            var fade = Math.max(0, 1 - phaseTime / f.life);
            ctx.fillStyle = 'rgba(239, 68, 68, ' + fade + ')';
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size * fade, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (elapsed < 4.5) {
        // 阶段2: 浮现文字 "请保持你的决心!"
        var textAlpha = Math.min(1, (elapsed - 3) / 1.0);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + textAlpha + ')';
        ctx.font = 'bold 52px "Ma Shan Zheng", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(200, 200, 255, 0.5)';
        ctx.shadowBlur = 20;
        // 幽灵般的轻微浮动
        var floatY = Math.sin(elapsed * 1.8) * 6;
        ctx.fillText('保持你的决心!', gameCanvas.width / 2, gameCanvas.height / 2 + floatY);
        ctx.shadowBlur = 0;
    } else {
        // 结束
        endGame();
    }
}

// ---- 游戏主循环 ----
function gameLoop(now) {
    if (!gameRunning) return;

    // 死亡动画中（不被暂停打断）
    if (dying) {
        var elapsed = (now - deathTime) / 1000;
        runDeathAnimation(elapsed);
        if (elapsed < 4.5) {
            animId = requestAnimationFrame(gameLoop);
        }
        return;
    }

    if (paused) {
        animId = requestAnimationFrame(gameLoop);
        return;
    }

    var dt = (now - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = now;
    gameTime += dt;

    // 冰霜冻结：跳过游戏逻辑，只更新计时和渲染
    var frostActive = false;
    if (typeof frostFreeze !== 'undefined' && frostFreeze) {
        // 安全阀：如果冰冻效果不存在于 activeEffects 中，强制解冻
        var hasFrost = false;
        if (typeof activeEffects !== 'undefined') { for (var _e = 0; _e < activeEffects.length; _e++) { if (activeEffects[_e].type === 'frost') hasFrost = true; } }
        if (!hasFrost) { frostFreeze = false; frostSlowTimer = 0; frostSlowGlobal = 0; }
        else frostActive = true;
    }
    var chaseSpeed = 16 * unitSize;
    if (!frostActive) {
// 破纪录检测（单次点数最高）
    var bestPtsCheck = parseFloat(localStorage.getItem('voidFallBestPoints')) || 0;
    var lastEarned = (typeof rankPoints !== 'undefined') ? rankPoints : 0;
    if (lastEarned > bestPtsCheck && !recordBroken) {
        recordBroken = true;
        // anvilSound 已移除，保留空行
        timerDisplay.classList.add('record');
        document.getElementById('record-indicator').classList.add('show');
    }

    var t = gameTime;
    maxHoles = 160;

    // 跟随光标
    var dx = cursorX - player.x;
    var dy = cursorY - player.y;
    var followSpeed = 14;
    player.x += dx * followSpeed * dt;
    player.y += dy * followSpeed * dt;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        var mag = Math.sqrt(dx * dx + dy * dy);
        player.dirX = dx / mag;
        player.dirY = dy / mag;
    }

    // 边界 = 画布尺寸
    var cw = gameCanvas.width;
    var ch = gameCanvas.height;
    player.x = Math.max(player.r, Math.min(cw - player.r, player.x));
    player.y = Math.max(player.r, Math.min(ch - player.r, player.y));

    // 处理预警队列：倒计时结束的怪正式出场
    for (var pi = pendingSpawns.length - 1; pi >= 0; pi--) {
        pendingSpawns[pi].timer -= dt;
        if (pendingSpawns[pi].timer <= 0) {
            var ps = pendingSpawns[pi];
            var newHole = { x: ps.x, y: ps.y, r: ps.r, color: ps.color, spawnTime: gameTime };
            if (typeof frostSlowGlobal !== 'undefined' && frostSlowGlobal > 0) { newHole.frostSlow = frostSlowGlobal; newHole.frostSlowAmt = 0.5; }
            holes.push(newHole);
            pendingSpawns.splice(pi, 1);
        }
    }

    // 生成系统（按难度区分）
    if (holes.length + pendingSpawns.length < maxHoles) {
        if (difficulty === 'easy') {
            // 简单：固定每秒3个
            layer1Timer += dt;
            while (layer1Timer >= 1 && holes.length + pendingSpawns.length < maxHoles) {
                layer1Timer -= 1;
                for (var ns = 0; ns < 3 && holes.length + pendingSpawns.length < maxHoles; ns++) { spawnHole(); }
            }
        } else if (difficulty === 'hard') {
            // 困难：无新手保护，直接阶梯型
            layer1Timer += dt;
            while (layer1Timer >= 1.5 && holes.length + pendingSpawns.length < maxHoles) {
                layer1Timer -= 1.5;
                for (var nh = 0; nh < (3 + Math.floor(Math.random() * 3)) && holes.length + pendingSpawns.length < maxHoles; nh++) { spawnHole(); }
            }
            layer10Timer += dt;
            if (layer10Timer >= 8) { layer10Timer -= 8; for (var n10 = 0; n10 < (8 + Math.floor(t / 20)) && holes.length + pendingSpawns.length < maxHoles; n10++) { spawnHole(); } }
            layer30Timer += dt;
            if (layer30Timer >= 30) { layer30Timer -= 30; for (var n30 = 0; n30 < 20 && holes.length + pendingSpawns.length < maxHoles; n30++) { spawnHole(); } }
            layer60Timer += dt;
            if (layer60Timer >= 60) { layer60Timer -= 60; showNotify('怪物潮来临!', 'red'); for (var n60 = 0; n60 < 40 && holes.length + pendingSpawns.length < maxHoles; n60++) { spawnHole(); } }
        } else {
            // 普通：原有阶梯型（含新手保护）
            if (t >= 60 && beginnerLeft) {
                beginnerLeft = false; layer1Timer = 0; layer10Timer = 0; layer30Timer = 0; layer60Timer = 0;
                showNotify('游戏适应期结束!', 'gold');
            }
            if (t < 60) {
                layer1Timer += dt;
                while (layer1Timer >= 1 && holes.length + pendingSpawns.length < maxHoles) { layer1Timer -= 1; for (var nn = 0; nn < 3 && holes.length + pendingSpawns.length < maxHoles; nn++) { spawnHole(); } }
            } else {
                layer1Timer += dt;
                while (layer1Timer >= 1.5 && holes.length + pendingSpawns.length < maxHoles) { layer1Timer -= 1.5; for (var nn2 = 0; nn2 < (3 + Math.floor(Math.random() * 3)) && holes.length + pendingSpawns.length < maxHoles; nn2++) { spawnHole(); } }
                layer10Timer += dt; if (layer10Timer >= 8) { layer10Timer -= 8; for (var nn10 = 0; nn10 < (8 + Math.floor(t / 20)) && holes.length + pendingSpawns.length < maxHoles; nn10++) { spawnHole(); } }
                layer30Timer += dt; if (layer30Timer >= 30) { layer30Timer -= 30; for (var nn30 = 0; nn30 < 20 && holes.length + pendingSpawns.length < maxHoles; nn30++) { spawnHole(); } }
                layer60Timer += dt; if (layer60Timer >= 60) { layer60Timer -= 60; showNotify('怪物潮来临!', 'red'); for (var nn60 = 0; nn60 < 40 && holes.length + pendingSpawns.length < maxHoles; nn60++) { spawnHole(); } }
            }
        }
    }

    if (typeof fantasySpawn === 'function') fantasySpawn(dt, t);
    if (typeof itemSpawn === 'function') itemSpawn(dt, t);

    // 黑洞追击 & 消失（按难度）
    var speedTier = Math.floor(t / 45);
    var chaseInit = difficulty === 'easy' ? 16 : (difficulty === 'hard' ? 30 : 20);
    var chaseCap  = difficulty === 'easy' ? 30 : (difficulty === 'hard' ? 50 : 40);
    chaseSpeed = unitSize * chaseInit * Math.pow(1.10, speedTier);
    chaseSpeed = Math.min(chaseSpeed, unitSize * chaseCap);

    if (speedTier > lastSpeedTier) {
        lastSpeedTier = speedTier;
        if (chaseSpeed < unitSize * chaseCap) {
            showNotify('黑洞加速! ' + (chaseSpeed / unitSize).toFixed(1) + ' u/s', 'red');
        } else {
            showNotify('黑洞已达极速!', 'red');
        }
    }
    var fiveMin = 300;

    for (var i = holes.length - 1; i >= 0; i--) {
        var h = holes[i];

        // 存在时间到期自动消失
        if (t - h.spawnTime >= 20) {
            holes.splice(i, 1);
            continue;
        }

        var tx, ty;
        if (t < fiveMin) {
            // 前5分钟：只尾随
            tx = player.x;
            ty = player.y;
        } else {
            // 5分钟后：30% 撞头，70% 尾随
            if (!h._modeSet) {
                h._intercept = Math.random() < 0.3;
                h._modeSet = true;
            }
            if (h._intercept) {
                var predictDist = 10 * unitSize;
                tx = player.x + player.dirX * predictDist;
                ty = player.y + player.dirY * predictDist;
            } else {
                tx = player.x;
                ty = player.y;
            }
        }

        var hdx = tx - h.x;
        var hdy = ty - h.y;
        var dist = Math.sqrt(hdx * hdx + hdy * hdy);
        var speedMul = (h.frostSlow > 0) ? (h.frostSlowAmt || 0.2) : 1;
        if (dist > 0.5) {
            h.x += (hdx / dist) * chaseSpeed * speedMul * dt;
            h.y += (hdy / dist) * chaseSpeed * speedMul * dt;
        }
    }

    // 黑洞间排斥
    for (var i = 0; i < holes.length; i++) {
        for (var j = i + 1; j < holes.length; j++) {
            var a = holes[i];
            var b = holes[j];
            var sdx = a.x - b.x;
            var sdy = a.y - b.y;
            var sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            var minDist = (a.r + b.r) * 1.5;
            if (sdist < minDist && sdist > 0.01) {
                var force = (minDist - sdist) / minDist * 180;
                var fx = (sdx / sdist) * force;
                var fy = (sdy / sdist) * force;
                a.x += fx * dt;
                a.y += fy * dt;
                b.x -= fx * dt;
                b.y -= fy * dt;
            }
        }
    }

    // 实体碰撞：玩家与黑洞互相推开
    for (var i = 0; i < holes.length; i++) {
        var h = holes[i];
        var cdx = player.x - h.x;
        var cdy = player.y - h.y;
        var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        var minDist = player.r + h.r; // 实体半径之和

        if (cdist < minDist && cdist > 0.01) {
            // 推开玩家
            var overlap = minDist - cdist;
            var pushX = (cdx / cdist) * overlap * 0.5;
            var pushY = (cdy / cdist) * overlap * 0.5;
            player.x += pushX;
            player.y += pushY;

            // 推开黑洞（对等反作用力）
            h.x -= pushX;
            h.y -= pushY;

            // 伤害判定
            if (!player.invincible && !debugInvincible) {
                lastHitSource = 'normal';
                takeDamage();
            }
        }
    }

    // 重新边界限制（推开后可能越界）
    player.x = Math.max(player.r, Math.min(cw - player.r, player.x));
    player.y = Math.max(player.r, Math.min(ch - player.r, player.y));

    // 边缘触碰追踪
    if (player.x - player.r <= 6) edgeTouched.left = true;
    if (player.x + player.r >= cw - 6) edgeTouched.right = true;
    if (player.y - player.r <= 6) edgeTouched.top = true;
    if (player.y + player.r >= ch - 6) edgeTouched.bottom = true;

    if (typeof fantasyUpdate === 'function') fantasyUpdate(dt, t);
    if (typeof fantasyCollision === 'function') fantasyCollision();
    if (typeof itemCollision === 'function') itemCollision();

    // 边缘岩浆（按难度）
    var edgeMargin = 4;
    var onEdge = player.x <= player.r + edgeMargin || player.x >= cw - player.r - edgeMargin ||
                 player.y <= player.r + edgeMargin || player.y >= ch - player.r - edgeMargin;
    // 简单：绿色，每60s变红1s
    var lavaColor = '#ef4444';
    if (difficulty === 'easy') {
        lavaColor = (Math.floor(t) % 60 === 59) ? '#ef4444' : '#34d399';
    } else if (difficulty === 'hard') {
        lavaColor = '#a855f7';
    }
    if (onEdge && !player.invincible && !debugInvincible) {
        if (difficulty === 'easy') {
            if (lavaColor === '#ef4444') { lastHitSource = 'edge_lava'; takeDamage(); }
        } else if (difficulty === 'hard') {
            lastHitSource = 'edge_lava'; takeDamage(); takeDamage();
        } else {
            lastHitSource = 'edge_lava'; takeDamage();
        }
    }

    } // end if (!frostActive)

    // itemUpdate 始终运行（冰冻期间需要倒数计时器）
    if (typeof itemUpdate === 'function') itemUpdate(dt, gameTime);

    // 渲染
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    // 边缘岩浆特效
    ctx.strokeStyle = lavaColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = lavaColor;
    ctx.shadowBlur = 10;
    ctx.strokeRect(2, 2, gameCanvas.width - 4, gameCanvas.height - 4);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    // 预警感叹号（即将生成的怪的位置）
    for (var pi = 0; pi < pendingSpawns.length; pi++) {
        var ps = pendingSpawns[pi];
        var bounce = Math.abs(Math.sin(gameTime * 6 + pi)) * 4;
        ctx.fillStyle = 'rgba(239, 68, 68, ' + (0.5 + ps.timer * 0.5) + ')';
        ctx.font = 'bold ' + (18 + bounce) + 'px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', ps.x, ps.y - bounce);
        // 微光
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
        ctx.shadowBlur = 8;
        ctx.fillText('!', ps.x, ps.y - bounce);
        ctx.shadowBlur = 0;
    }
    for (var i = 0; i < holes.length; i++) {
        drawHole(holes[i].x, holes[i].y, holes[i].r, holes[i].color);
    }
    var alpha = 1;
    if (player.invincible) {
        alpha = 0.3 + 0.35 * Math.sin(gameTime * 20);
    }
    if (typeof fantasyRender === 'function') fantasyRender();
    if (typeof itemRender === 'function') itemRender();
    // 无敌金光（玩家模型下面）
    if (player.invincible) {
        var flicker = 0.5 + Math.random() * 0.5;
        var glow = ctx.createRadialGradient(player.x, player.y, player.r * 0.4, player.x, player.y, player.r * 2.2);
        glow.addColorStop(0, 'rgba(255,215,0,' + (0.3 * flicker) + ')');
        glow.addColorStop(0.5, 'rgba(255,200,0,' + (0.12 * flicker) + ')');
        glow.addColorStop(1, 'rgba(255,180,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.r * 2.2, 0, Math.PI * 2); ctx.fill();
    }
    drawPlayerModel(player.x, player.y, player.r * 2, alpha);
    updateTimer();
    updateHearts();
    // 积分获取（按难度）- 无敌模式不获取
    var ptsInterval = difficulty === 'hard' ? 10 : (difficulty === 'easy' ? 15 : 15);
    var ptsAmount   = difficulty === 'hard' ? 18 : (difficulty === 'easy' ? 5 : 10);
    var ptsTier = Math.floor(gameTime / ptsInterval);
    if (ptsTier > lastPointsCheck) {
        lastPointsCheck = ptsTier;
        if (debugInvincible) {
            document.getElementById('game-points-display').textContent = '无敌模式';
        } else {
            gamePoints += ptsAmount;
            var ptsEl = document.getElementById('game-points-display');
            ptsEl.textContent = '+' + gamePoints;
            ptsEl.classList.add('pop');
            setTimeout(function() { ptsEl.classList.remove('pop'); }, 250);
            showNotify('+' + ptsAmount + ' 积分!', 'gold');
        }
    }
    if (!debugInvincible) {
        document.getElementById('game-points-display').textContent = '积分 +' + gamePoints;
    }
    // 排名点数（每20秒结算）- 无敌模式不获取
    var currentTick = Math.floor(gameTime / 20);
    if (currentTick > lastRankMinute) {
        lastRankMinute = currentTick;
        if (debugInvincible) {
            showNotify('无敌模式，不获取任何奖励', 'purple');
        } else {
            var rpBase, rpInc, rpCap;
            if (difficulty === 'easy')     { rpBase = 10; rpInc = 5;  rpCap = 40; }
            else if (difficulty === 'hard') { rpBase = 25; rpInc = 10; rpCap = 140; }
            else                           { rpBase = 15; rpInc = 8;  rpCap = 60; }
            var earned = Math.min(rpCap, rpBase + (currentTick - 1) * rpInc);
            rankPoints += earned;
            // 困难模式每分钟保底 +100
            if (difficulty === 'hard') {
                var hardMinute = Math.floor(gameTime / 60);
                if (hardMinute > (lastHardMinute || 0)) {
                    lastHardMinute = hardMinute;
                    rankPoints += 100;
                    showNotify('困难保底 +100 点数!', 'gold');
                }
            }
            checkAchievements();
            var rpEl = document.getElementById('rank-points-display');
            rpEl.textContent = '点数 +' + rankPoints;
            rpEl.classList.add('pop');
            setTimeout(function() { rpEl.classList.remove('pop'); }, 300);
            if (earned >= rpCap) {
                showNotify('点数已达封顶 +' + earned + '!', 'gold');
                rankPointsCapHit = true;
            } else {
                showNotify('点数 +' + earned, 'green');
            }
        }
    }
    // 封顶时炫彩
    if (rankPointsCapHit) {
        var rpEl2 = document.getElementById('rank-points-display');
        if (rpEl2) rpEl2.style.color = rainbowColor(gameTime);
    }
    // 弹幕地狱 & 满屏怪 & 浪人初见 & 公牛初见
    if (typeof roninBullets !== 'undefined' && roninBullets.length >= 20) unlockAchievement('bullet20');
    if (typeof bullBullets !== 'undefined' && bullBullets.length >= 20) unlockAchievement('bull_bullet20');
    if (holes.length >= 160) unlockAchievement('hole_160');
    if (gameTime - lastDamageTime >= 240) unlockAchievement('nohit_240');
    if (typeof ronins !== 'undefined' && ronins.length > 0) sawRoninThisGame = true;
    if (typeof bulls !== 'undefined' && bulls.length > 0) sawBullThisGame = true;
    if (typeof kuis !== 'undefined' && kuis.length > 0) sawKuiThisGame = true;

    var roninCount = (typeof ronins !== 'undefined') ? ronins.length : 0;
    var bullCount = (typeof bulls !== 'undefined') ? bulls.length : 0;
    var kuiCount = (typeof kuis !== 'undefined' ? kuis.length : 0) + (typeof kuiMinions !== 'undefined' ? kuiMinions.length : 0);
    document.getElementById('monster-count').textContent = '普通怪: ' + holes.length;
    document.getElementById('special-count').textContent = '浪人: ' + roninCount + ' 公牛: ' + bullCount + ' 魁首: ' + kuiCount;
    document.getElementById('monster-speed').textContent = '普通怪移速: ' + (chaseSpeed / unitSize).toFixed(1) + ' u/s';

    // FPS
    fpsFrames++;
    var fpsNow = performance.now();
    if (fpsNow - fpsLastTime >= 100) {
        if (fpsDisplayEl) fpsDisplayEl.textContent = Math.round(fpsFrames / (fpsNow - fpsLastTime) * 1000) + ' FPS';
        fpsFrames = 0;
        fpsLastTime = fpsNow;
    }

    animId = requestAnimationFrame(gameLoop);
}

function rainbowColor(t) {
    var r = Math.sin(t * 2 + 0) * 127 + 128;
    var g = Math.sin(t * 2 + 2) * 127 + 128;
    var b = Math.sin(t * 2 + 4) * 127 + 128;
    return 'rgb(' + Math.floor(r) + ',' + Math.floor(g) + ',' + Math.floor(b) + ')';
}

// ==================== 事件监听 ====================

// 开始按钮
function showDifficultySelect(fromRestart) {
    playClick(clickStartSound);
    overlay.style.zIndex = '3000';
    var html = '<h3>选择难度</h3><div style="display:flex;flex-direction:column;gap:10px;">';

    // 简单
    html += '<div class="diff-card" data-diff="easy" onclick="selectDifficulty(\'easy\',' + fromRestart + ')" style="border:2px solid #a78bfa;border-radius:10px;padding:14px;cursor:pointer;overflow:hidden;transition:all 0.3s;">';
    html += '<p class="diff-title" style="color:#a78bfa;font-size:20px;font-weight:bold;margin:0;transition:font-size 0.2s;">简单</p>';
    html += '<p style="color:#c4b5fd;font-size:12px;margin:4px 0 0;">适合熟悉游戏规则，长久生存下去！</p>';
    html += '<div class="diff-detail" style="max-height:0;overflow:hidden;transition:max-height 0.35s;">';
    html += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed #a78bfa;">';
    html += '<p style="color:red;font-size:12px;line-height:1.8;margin:0;">♥ 6格生命 </p>';
    html += '<p style="color:#c4b5fd;font-size:12px;line-height:1.8;margin:0;">固定每秒生成3个普通怪 · 普通怪移动速度较慢</p>';
	    html += '<p style="color:#c4b5fd;font-size:12px;line-height:1.8;margin:0;">精英怪生成数量较少，生成间隔长。</p>';
    html += '<p style="color:#c4b5fd;font-size:12px;line-height:1.8;margin:0;">奖励:积分+5/15s · 点数10起+5/次(封顶30)</p>';
    html += '</div></div></div>';

    // 普通
    html += '<div class="diff-card" data-diff="normal" onclick="selectDifficulty(\'normal\',' + fromRestart + ')" style="border:2px solid #f59e0b;border-radius:10px;padding:14px;cursor:pointer;overflow:hidden;transition:all 0.3s;">';
    html += '<p class="diff-title" style="color:#f59e0b;font-size:20px;font-weight:bold;margin:0;transition:font-size 0.2s;">普通</p>';
    html += '<p style="color:#fbbf24;font-size:12px;margin:4px 0 0;">多数玩家的选择，合理利用道具应对变化多端的局势！</p>';
    html += '<div class="diff-detail" style="max-height:0;overflow:hidden;transition:max-height 0.35s;">';
    html += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed #f59e0b;">';
    html += '<p style="color:red;font-size:12px;line-height:1.8;margin:0;">♥ 4格生命 </p>';
    html += '<p style="color:#fbbf24;font-size:12px;line-height:1.8;margin:0;">1分钟过渡保护期 · 普通怪移动速度正常</p>';
	    html += '<p style="color:#fbbf24;font-size:12px;line-height:1.8;margin:0;">精英怪会正常的刷新，数量不会太庞大</p>';
    html += '<p style="color:#fbbf24;font-size:12px;line-height:1.8;margin:0;">奖励:积分+10/15s · 点数15起+8/次(封顶40)</p>';
   
    html += '</div></div></div>';

    // 困难
    html += '<div class="diff-card" data-diff="hard" onclick="selectDifficulty(\'hard\',' + fromRestart + ')" style="border:2px solid #dc2626;border-radius:10px;padding:14px;cursor:pointer;overflow:hidden;transition:all 0.3s;">';
    html += '<p class="diff-title" style="color:#dc2626;font-size:20px;font-weight:bold;margin:0;transition:font-size 0.2s;">困难</p>';
    html += '<p style="color:#b91c1c;font-size:12px;margin:4px 0 0;">牢玩家专属，高风险高回报！</p>';
    html += '<div class="diff-detail" style="max-height:0;overflow:hidden;transition:max-height 0.35s;">';
    html += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed #dc2626;">';
    html += '<p style="color:red;font-size:12px;line-height:1.8;margin:0;">♥3条命</p>';
    html += '<p style="color:#b91c1c;font-size:12px;line-height:1.8;margin:0;">无过渡保护期! 会有一堆疯子无脑的追踪你</p>';
	    html += '<p style="color:#b91c1c;font-size:12px;line-height:1.8;margin:0;">精英怪出现频率高，数量恐怖</p>';
    html += '<p style="color:#b91c1c;font-size:12px;line-height:1.8;margin:0;">奖励机制：积分+18/10s · 点数25起+10/次(封顶50) · 每分钟+100点数保底</p>';
  
    html +='<p style="color:#dc2626;font-size:7px;line-height:1.8;margin:0;">猫狮:没人敢回想那天究竟发生了什么...</p>';
    html += '</div></div></div>';

    html += '</div>';
    content.innerHTML = html;
    overlay.classList.add('active');

    // hover 展开效果 + 音效
    setTimeout(function() {
        var cards = document.querySelectorAll('.diff-card');
        cards.forEach(function(card) {
            var diffType = card.getAttribute('data-diff');
            card.addEventListener('mouseenter', function() {
                var detail = this.querySelector('.diff-detail');
                var title = this.querySelector('.diff-title');
                if (detail) detail.style.maxHeight = '160px';
                if (title) title.style.fontSize = '24px';
                this.style.paddingBottom = '18px';
                // 悬浮音效
                var snd = diffSounds[diffType] && diffSounds[diffType].hover;
                if (snd) { snd.currentTime = 0; snd.play().catch(function(){}); diffHoverSound = snd; }
            });
            card.addEventListener('mouseleave', function() {
                var detail = this.querySelector('.diff-detail');
                var title = this.querySelector('.diff-title');
                if (detail) detail.style.maxHeight = '0';
                if (title) title.style.fontSize = '20px';
                this.style.paddingBottom = '14px';
                // 立即停止悬浮音效
                if (diffHoverSound) { diffHoverSound.pause(); diffHoverSound.currentTime = 0; diffHoverSound = null; }
            });
        });
    }, 50);
}

function selectDifficulty(diff, fromRestart) {
    difficulty = diff;
    // 停止悬浮音效，播进入音效
    if (diffHoverSound) { diffHoverSound.pause(); diffHoverSound.currentTime = 0; diffHoverSound = null; }
    var enterSnd = diffSounds[diff] && diffSounds[diff].enter;
    if (enterSnd) { enterSnd.currentTime = 0; enterSnd.play().catch(function(){}); }
    overlay.classList.remove('active');
    overlay.style.zIndex = '1000';
    if (fromRestart) {
        gameOverScreen.classList.remove('active');
    }
    startGameFlow();
}

startBtn.addEventListener('click', function() { showDifficultySelect(false); });

restartBtn.addEventListener('click', function() {
    showDifficultySelect(true);
});

// 返回主页
document.getElementById('home-btn').addEventListener('click', function() {
    playClick(clickStartSound);
    gameScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    gameHud.classList.remove('active');
    countdownEl.classList.remove('active');
    document.body.style.cursor = '';
    if (gameCanvas) gameCanvas.style.cursor = '';
});

// 暂停（空格键 + 按钮）
function togglePause() {
    if (!gameStarted || dying) return;
    if (typeof frostFreeze !== 'undefined' && frostFreeze) return;
    paused = !paused;
    if (paused) {
        pauseCountThisGame++;
        if (holes.length >= 40) wavePausedThisGame = true;
    }
    document.getElementById('pause-btn').textContent = paused ? '继续' : '暂停';
    if (paused) {
        showNotify('游戏已暂停', 'gold', true);
        if (currentGameTrack) currentGameTrack.pause();
    } else {
        clearPersistNotify();
        if (currentGameTrack) currentGameTrack.play().catch(function(){});
    }
}

document.getElementById('pause-btn').addEventListener('click', togglePause);

window.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePause();
    }
});
window.addEventListener('mousemove', function(e) {
    if (gameStarted && gameTime < 10) mouseMovedFirst10s = true;
    if (paused) return;
    rawScreenX = e.clientX;
    rawScreenY = e.clientY;
    cursorX = toCanvasX(e.clientX);
    cursorY = toCanvasY(e.clientY);
});

// 触屏手势（手机）
gameCanvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    rawScreenX = e.touches[0].clientX;
    rawScreenY = e.touches[0].clientY;
    cursorX = toCanvasX(rawScreenX);
    cursorY = toCanvasY(rawScreenY);
}, { passive: false });
gameCanvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    rawScreenX = e.touches[0].clientX;
    rawScreenY = e.touches[0].clientY;
    cursorX = toCanvasX(rawScreenX);
    cursorY = toCanvasY(rawScreenY);
}, { passive: false });

// ---- 防用户手动缩放 ----
function showZoomWarn() {
    var warn = document.getElementById('zoom-warn');
    if (zoomWarnTimer) { clearTimeout(zoomWarnTimer); }
    warn.classList.add('show');
    zoomWarnTimer = setTimeout(function() { warn.classList.remove('show'); }, 1800);
}

// 拦截 Ctrl+Plus/Minus/Wheel (PC 浏览器缩放)
window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
        showZoomWarn();
    }
});
window.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        showZoomWarn();
    }
}, { passive: false });

// 拦截手势缩放 (visualViewport)
if (window.visualViewport) {
    var initScale = window.visualViewport.scale || 1;
    window.visualViewport.addEventListener('resize', function() {
        var vs = window.visualViewport.scale;
        if (vs && Math.abs(vs - 1) > 0.02) {
            showZoomWarn();
        }
    });
}

// 窗口大小变化
window.addEventListener('resize', function() {
    if (gameStarted) { resizeCanvas(); }
});

// 初始调整
resizeCanvas();
rawScreenX = canvasW / 2;
rawScreenY = canvasH / 2;
cursorX = toCanvasX(rawScreenX);
cursorY = toCanvasY(rawScreenY);

// 初始化最佳记录显示
(function() {
    var bm = Math.floor(bestTime / 60);
    var bs = Math.floor(bestTime % 60);
    document.getElementById('best-time').textContent =
        '最佳: ' + (bm < 10 ? '0' + bm : bm) + ':' + (bs < 10 ? '0' + bs : bs);
})();

// PC 用户加载完成后弹出提示
if (isPC) {
    window.addEventListener('load', function() {
        var toast = document.getElementById('pc-toast');
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2600);
    });
}

// ==================== 菜单装饰黑洞 ====================
var decoCanvas = document.getElementById('deco-canvas');
var decoCtx = decoCanvas.getContext('2d');
var decoHoles = [];
var decoRonins = [];
var decoBulls = [];
var decoHeart = { x: 0, y: 0, vx: 0, vy: 0 };

function initDecoHoles() {
    decoCanvas.width  = decoCanvas.offsetWidth;
    decoCanvas.height = decoCanvas.offsetHeight;
    decoHeart.x = decoCanvas.width / 2;
    decoHeart.y = decoCanvas.height / 2;
    decoHeart.vx = 0;
    decoHeart.vy = 0;
    decoHoles = [];
    var holeR = 2 * unitSize;
    for (var i = 0; i < 38; i++) {
        decoHoles.push({
            x: Math.random() * decoCanvas.width,
            y: Math.random() * decoCanvas.height,
            r: holeR,
            vx: (Math.random() - 0.5) * 60,
            vy: (Math.random() - 0.5) * 60,
            color: holeColors[Math.floor(Math.random() * holeColors.length)]
        });
    }
    decoRonins = [];
    decoBulls = [];
}

function drawDecoHeart(x, y) {
    var s = 10 / 18;
    decoCtx.fillStyle = '#ef4444';
    decoCtx.beginPath();
    decoCtx.moveTo(x, y - 6 * s);
    decoCtx.bezierCurveTo(x, y - 14 * s, x - 14 * s, y - 14 * s, x - 14 * s, y - 6 * s);
    decoCtx.bezierCurveTo(x - 14 * s, y + 4 * s, x, y + 12 * s, x, y + 16 * s);
    decoCtx.bezierCurveTo(x, y + 12 * s, x + 14 * s, y + 4 * s, x + 14 * s, y - 6 * s);
    decoCtx.bezierCurveTo(x + 14 * s, y - 14 * s, x, y - 14 * s, x, y - 6 * s);
    decoCtx.closePath();
    decoCtx.fill();
}

function drawDecoHole(x, y, r, color) {
    decoCtx.fillStyle = color;
    decoCtx.beginPath();
    decoCtx.arc(x, y, r, 0, Math.PI * 2);
    decoCtx.fill();
    decoCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    decoCtx.lineWidth = 1;
    decoCtx.stroke();
}

function animateDeco() {
    if (gameStarted) { requestAnimationFrame(animateDeco); return; }

    var dt = 0.016;
    var w = decoCanvas.width;
    var h = decoCanvas.height;

    decoCtx.clearRect(0, 0, w, h);

    // 爱心随机乱蹦（和黑洞一样到处跑，以假乱真）
    decoHeart.vx += (Math.random() - 0.5) * 80 * dt;
    decoHeart.vy += (Math.random() - 0.5) * 80 * dt;
    var hspd = Math.sqrt(decoHeart.vx * decoHeart.vx + decoHeart.vy * decoHeart.vy);
    if (hspd > 200) { decoHeart.vx = decoHeart.vx / hspd * 200; decoHeart.vy = decoHeart.vy / hspd * 200; }
    decoHeart.x += decoHeart.vx * dt;
    decoHeart.y += decoHeart.vy * dt;

    // 爱心边界
    if (decoHeart.x < 10) { decoHeart.x = 10; decoHeart.vx *= -0.5; }
    if (decoHeart.x > w - 10) { decoHeart.x = w - 10; decoHeart.vx *= -0.5; }
    if (decoHeart.y < 10) { decoHeart.y = 10; decoHeart.vy *= -0.5; }
    if (decoHeart.y > h - 10) { decoHeart.y = h - 10; decoHeart.vy *= -0.5; }

    // 黑洞追击爱心
    for (var i = 0; i < decoHoles.length; i++) {
        var dh = decoHoles[i];
        var cdx = decoHeart.x - dh.x;
        var cdy = decoHeart.y - dh.y;
        var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist > 0.5) {
            dh.vx += (cdx / cdist) * 15 * dt;
            dh.vy += (cdy / cdist) * 15 * dt;
        }
        dh.x += dh.vx * dt;
        dh.y += dh.vy * dt;

        // 碰壁反弹
        if (dh.x < dh.r) { dh.x = dh.r; dh.vx *= -1; }
        if (dh.x > w - dh.r) { dh.x = w - dh.r; dh.vx *= -1; }
        if (dh.y < dh.r) { dh.y = dh.r; dh.vy *= -1; }
        if (dh.y > h - dh.r) { dh.y = h - dh.r; dh.vy *= -1; }

        // 速度上限
        var spd = Math.sqrt(dh.vx * dh.vx + dh.vy * dh.vy);
        if (spd > 160) { dh.vx = dh.vx / spd * 160; dh.vy = dh.vy / spd * 160; }

        drawDecoHole(dh.x, dh.y, dh.r, dh.color);
    }

    // 黑洞间排斥
    for (var i = 0; i < decoHoles.length; i++) {
        for (var j = i + 1; j < decoHoles.length; j++) {
            var a = decoHoles[i], b = decoHoles[j];
            var sdx = a.x - b.x, sdy = a.y - b.y;
            var sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            var minDist = a.r + b.r + 20;
            if (sdist < minDist && sdist > 0.01) {
                var f = (minDist - sdist) / minDist * 40;
                a.x += sdx / sdist * f * dt;
                a.y += sdy / sdist * f * dt;
                b.x -= sdx / sdist * f * dt;
                b.y -= sdy / sdist * f * dt;
            }
        }
    }

    drawDecoHeart(decoHeart.x, decoHeart.y);

    requestAnimationFrame(animateDeco);
}

initDecoHoles();
animateDeco();

window.addEventListener('resize', function() {
    if (!gameStarted) {
        initDecoHoles();
    }
});

// ==================== 音乐系统 ====================
var menuMusic = new Audio('./audio/1_min.mp3');
menuMusic.loop = true;
menuMusic.volume = VOL.menuMusic;

var hurtSound = new Audio('./audio/hurt_min.mp3');
hurtSound.volume = VOL.hurt;

var deathSound = new Audio('./audio/die-sfx_min.mp3');
deathSound.volume = VOL.death;

// 点击音效
var clickSound = new Audio('./audio/break1_min.mp3');
clickSound.volume = VOL.click;
var clickStartSound = new Audio('./audio/click-start_min.mp3');
clickStartSound.volume = VOL.clickStart;
var clickShopSound = new Audio('./audio/click-shop_min.mp3');
clickShopSound.volume = VOL.clickShop;
var clickCheckinSound = new Audio('./audio/click-checkin_min.mp3');
clickCheckinSound.volume = VOL.clickCheckin;
var clickCheckinOkSound = new Audio('./audio/click-checkin-ok_min.mp3');
clickCheckinOkSound.volume = VOL.clickCheckinOk;
var clickBuyOkSound = new Audio('./audio/click-buy-ok_min.mp3');
clickBuyOkSound.volume = VOL.clickBuyOk;
var clickBuyFailSound = new Audio('./audio/click-buy-fail_min.mp3');
clickBuyFailSound.volume = VOL.clickBuyFail;
var clickVerSound = new Audio('./audio/click-heart_min.mp3');
clickVerSound.volume = VOL.clickVer;
var clickEquipSound = new Audio('./audio/click-equip_min.mp3');
clickEquipSound.volume = VOL.clickEquip;
var settingsEnterSound = new Audio('./audio/click-settings_min.mp3');
settingsEnterSound.volume = VOL.settingsEnter;

// 难度选择音效
var diffHoverSound = null;
var diffSounds = {
    easy:   { hover: new Audio('./audio/easy-hover_min.mp3'), enter: new Audio('./audio/easy-enter_min.mp3') },
    normal: { hover: new Audio('./audio/normal-hover_min.mp3'), enter: new Audio('./audio/normal-enter_min.mp3') },
    hard:   { hover: new Audio('./audio/hard-hover_min.mp3'), enter: new Audio('./audio/hard-enter_min.mp3') }
};
for (var dk in diffSounds) {
    diffSounds[dk].hover.volume = VOL.diffHover;
    diffSounds[dk].enter.volume = VOL.diffEnter;
}

function playClick(snd) {
    if (!snd) snd = clickSound;
    snd.currentTime = 0;
    snd.play().catch(function() {});
}

// 本地最佳记录
var bestTime = parseFloat(localStorage.getItem('voidFallBest')) || 0;
var recordBroken = false;

var cycleTracks = [
    new Audio('./audio/3_min.mp3'),
    new Audio('./audio/4_min.mp3'),
    new Audio('./audio/5_min.mp3')
];
cycleTracks.forEach(function(t) { t.volume = VOL.cycleTrack; });

var currentGameTrack = null;

function playRandomBattle() {
    var idx = Math.floor(Math.random() * cycleTracks.length);
    var track = cycleTracks[idx];
    track.currentTime = 0;
    track.playbackRate = settings.musicRate || 1.0;
    track.play().catch(function() {});
    currentGameTrack = track;
    track.onended = function() {
        playRandomBattle();
    };
}

function startGameMusic() {
    stopMusicHall();
    menuMusic.pause();
    menuMusic.currentTime = 0;
    travelAudio.pause();
    travelAudio.currentTime = 0;
    travelAudio.onended = null;
    playRandomBattle();
}

function resumeMenuMusic() {
    // 停掉所有游戏音乐
    cycleTracks.forEach(function(t) {
        t.pause();
        t.currentTime = 0;
        t.onended = null;
    });
    // 恢复菜单音乐
    menuMusic.currentTime = 0;
    menuMusic.play().catch(function() {});
}


// 调试按钮 & 浮动面板（全局函数 + 事件委托）
if (debugUnlocked) {
    document.getElementById('debug-btn').classList.add('show');
}

function openDebugPanel() {
    document.getElementById('debug-backdrop').classList.add('show');
    document.getElementById('debug-float').classList.add('show');
    refreshDebugPanel();
}

function closeDebugPanel() {
    document.getElementById('debug-backdrop').classList.remove('show');
    document.getElementById('debug-float').classList.remove('show');
}

// 调试面板交互（全局函数，内联调用）
function onDebugSlider(el) {
    var key = el.getAttribute('data-key');
    var val = parseFloat(el.value);
    debugParams[key].val = val;
    var dv = document.getElementById('dv_' + key);
    if (dv) dv.textContent = val.toFixed((key === 'invincibleLead' || key === 'pepperFireRadius') ? 1 : 2);
    if (key === 'modelScale') {
        mobileScale = val;
        unitSize = 9 * mobileScale;
        if (!gameStarted) player.r = Math.round(unitSize);
    }
    if (key === 'invincibleLead') {
        if (typeof invincibleLeadTime !== 'undefined') {
            invincibleLeadTime = val;
            localStorage.setItem('voidInvincibleLead', val);
        }
    }
    if (key === 'pepperFireRadius') {
        if (typeof pepperFireRadiusMult !== 'undefined') {
            pepperFireRadiusMult = val;
            localStorage.setItem('voidPepperFireRadius', val);
        }
    }
}

function onToggleInvincible(cb) {
    debugInvincible = cb.checked;
}

function showVersionLog() {
    playClick(clickVerSound);
    // 临时放大弹窗以容纳滚动内容
    modalBox.style.height = 'auto';
    modalBox.style.maxHeight = '75vh';
    content.innerHTML =
        '<h3>更新日志</h3>' +

        // v1.90
        '<div style="border:2px solid #3b82f6;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.90 — 2026年6月21日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '<span style="color:#22d3ee;font-weight:bold;">Supabase 数据库接入完成，在线排名即将到来！</span><br>' +
        '排行榜后端已准备就绪，玩家分数将上传至云端，与所有玩家一较高下！<br>' +
        '同时在统计内容中加入在线排行榜入口，实时查看排名数据<br>' +
        '虽然目前还在测试阶段，但离完整在线体验又近了一步！<br>' +
        '版本号从1.85跳跃到1.90，为接下来的大更新铺路<br><br>' +
        '修复了因drawPlayerModel函数缺失闭合花括号导致页面完全崩溃的严重bug<br>' +
        '音量调节加入上下限钳制，防止非法值溢出<br>' +
        '持续优化开发流程，保持项目稳健<br><br>' +
        '最近主要在准备数据库相关的接入工作，原计划的道具和精英怪更新会稍微延后。<br>' +
        '在线排名的上线意味着这个游戏将迈入新的阶段——从单机走向联网！<br>' +
        '感谢一直以来的支持，我还在努力！</p>' +
        '<hr style="border-color:#3b82f6;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        'Supabase 数据库接入（PostgreSQL + REST API）<br>' +
        '排行榜表设计（leaderboard: player_name, rank_points, difficulty）<br>' +
        '新增 supabase.js 直连客户端（提交/查询/分页/排名）<br>' +
        '统计内容新增「在线排行榜」入口<br>' +
        '修复 drawPlayerModel 语法错误导致脚本完全中断（Bug 22）<br>' +
        '音量上限钳制（Math.min/max 防止非法值）<br>' +
        '更新日志更新至 V1.90<br>' +
        '准备上线 Netlify 托管<br>皮肤自定义上传加入</p>' +
        '</div>' +

        // v1.85
        '<div style="border:2px solid #ef4444;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.85 — 2026年6月16日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '全新精英怪 <span style="color:#ef4444;font-weight:bold;">魁</span> 降临虚空！<br>' +
        '红色钻石形态，青色煞气光晕，虚空深处最凶险的存在！<br>' +
        '大魁死亡时原地爆炸，爆炸触碰玩家将受到伤害，死后发射的炸弹碰到屏幕边缘必定生成分裂魁（小魁）<br>' +
        '小魁每6秒四方向射击，子弹碰边缘有20%概率再生成新小魁，越打越多！<br>' +
        '魁免疫冰冻减速，小心应对！<br>' +
        '同时激光枪获得史诗级增强 — <span style="color:#22d3ee;font-weight:bold;">米字形</span>，先十字后对角，两波覆盖全屏！<br>' +
        '新增大量魁相关音效，沉浸感拉满！<br><br>最近更新的速度明显下降，受各方面影响。学习,生活等，我会继续保持更新的!虽然嘛，这个开发过程会遇到不少麻烦，有时甚至可以搞一下午，哈哈。如果哪一天我放弃更新了，然后你看到了今天的这个感想，我想说，keep moving,do not be afraid!</p>' +
        '<hr style="border-color:#ef4444;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '加入全新精英怪「魁」（红色钻石+煞气光晕+分裂机制）<br>' +
        '激光枪增强为米字形：先十字后对角，两波伤害合一<br>' +
        '加入大魁爆炸音效、小魁产生音效<br>' +
        '新增14个魁相关成就<br>' +
        '修复激光第二波渲染时序bug<br>' +
        '魁免疫冰冻减速<br>' +
        '数值平衡：小魁发射6秒/次，子弹分裂概率20%<br>加载页面加入tips<br>道具档案加入图片来提示<br>优化了激光枪的音效<br>激光枪再次增强，攻击范围大幅增强!<br>优化了道具刷新时间机制<br>优化了普通怪的刷新机制<br>强力炸弹增强<br>全面重整道具刷新几率，各难度统一。仅在怪物上拉开难度差距!<br>添加玩家实时帧率显示<br>优化了部分物品的音效<br>全面优化音效，已实现全部音效无版权化(AI辅助生成)<br>皮肤商城翻新!加入了3套新皮肤<br>美术馆加入，包含所有音效，各种图片等<br>优化了音量调节功能</p>' +
        '</div>' +

        // v1.8
        '<div style="border:2px solid #22c55e;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.8 — 2026年6月11日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '存档系统终于完善了！现在可以同时管理3个存档位，每个存档独立保存游戏进度。<br>' +
        '存档名字和玩家名用一个按钮同时保存，方便快捷。<br>' +
        '当前正在使用的存档位会有"当前使用"标识，一目了然。<br>' +
        '新增成就"猫狮大王来也"，将玩家名命名为"猫狮"即可解锁！<br>' +
        '游戏日志现在记录各难度单局最高点数和最高积分，方便追踪个人最好成绩。<br>' +
        '修复了大量存档相关的bug<br>' +
        '感谢各位玩家的反馈与支持！<br><br><br>以上内容均deepseekV4flash生成，感觉怎么样？<br>我已经替换了原来的PRO，使用flash来辅助创作，从功能实现上来看并没有太大的差距，反而我的钱包是鼓起来了！继续加油<br>鸣谢名单已加入，感谢一路走来各位伙伴的支持，没有你们，我走不到现在的地步!</p>' +
        '<hr style="border-color:#22c55e;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '存档系统加入<br>' +
        '设置中清除本地数据只清除当前存档，不影响其他存档位<br>' +
        '自动保存：每当数据改变自动存入当前使用的存档<br>' +
        '统计内容新增"新内容"跳动提示<br>' +
        '游戏日志各难度增加单局最高点数/积分记录<br>' +
        '大量bug修复<br>鸣谢名单加入!</p>' +
        '</div>' +

       
        // v1.7
         '<div style="border:2px solid #c084fc;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.7 — 2026年6月8日后几天</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '游戏大致方向已经定好了，合理利用道具在躲避敌人追踪的同时进行反击！<br>' +
        '后期会陆陆续续加入新的精英和道具来丰富游戏玩法！<br>' +
        '如果现在的你能够加入游戏的测试，那我就非常的感激不尽！</p>' +
        '<hr style="border-color:#c084fc;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '新的道具：火爆辣椒<br>优化部分道具的机制<br>修复大量bug<br>成就系统的生态丰富<br>音效的更新</p>' +
        '</div>' +

        '<hr style="border-color:#ef4444;border-width:2px;margin:16px 0;">' +

        // v1.6
        '<div style="border:2px solid #a855f7;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.6 — 2026年6月6日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '<span style="color:#34d399;font-weight:bold;">道具系统,全新主页布局</span>正式上线！三种道具各具特色，策略性大幅提升。全新的视觉效果带来更沉浸的体验<br>已经两天没有更新了，本来是打算日更，看来还是会受到生活中的各种困扰而推迟 ，不过：<br>大的更新终于来了！道具系统的加入，意味着这个游戏终于迈入了该有的水准，无限进步吧！<br>6月7号，今天我倒是学会了一件事，遇到bug后，优先在浏览器按f12看浏览器的报错原因是什么？这远远比你自己描述的一些表观的现象详细的多，这样做可以省下多少的时间以及多少的token，我真的服了，血的教训！</p>' +
        '<hr style="border-color:#a855f7;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '加入道具系统：爱心回复、炸弹、激光枪<br>' +
        '炸弹有范围成长机制（普通/困难模式）<br>' +
        '激光枪四方向穿透全屏<br>' +
        '多道具并行运行，UI冒泡堆叠<br>' +
        '新增击杀弹跳数字提示（颜色随数量渐变）<br>' +
        '新增怪物死亡粒子特效（普通紫/精英黄）<br>' +
        '新增道具刷新粉色预警<br>' +
        '调试面板道具筛选多选框<br>' +
        '游戏暂停时音乐同步暂停<br>' +
        '新增道具相关成就 24 个<br>' +
        '新增全套道具音效（拾取/爆炸/激光/死亡）<br>' +
        '"网页声明"改为"怪物档案"（含背景故事）<br>' +
        '设置页面整合调试解锁+清空数据<br>' +
        '击杀统计显示在结算界面和游戏日志<br>' +
        '大量数值平衡调整<br>战斗时移除鼠标指针以提升沉浸感<br>修复了大量bug<br>优化道具位置提示更明显<br>加入击杀怪物获得点数机制<br>优化玩家自定义决定战斗时是否隐藏鼠标<br>优化了道具刷新机制<br>添加玩家无敌帧时的特效提示<br>修复了冰冻道具的bug<br>增强了激光枪<br>增加玩家使用道具后的无敌帧</p>' +
        '</div>' +

        // v1.5
        '<div style="border:2px solid #f97316;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.5 — 2026年6月3日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '全新精英怪 <span style="color:#f97316;font-weight:bold;">公牛</span> 登场！<br>三角形的追踪猎手，会锁定你的位置然后高速突刺。<br>最近都在实训，基本没有完全投入到开发中。主要是在思考一个问题，我开发这个游戏的目的是什么?好吧，停止思考...<br><p style="color:red ">最近正在准备加入道具系统，敬请期待!</p></p>' +
        '<hr style="border-color:#f97316;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '加入全新精英怪「公牛」（追踪+突刺+蓝色火焰子弹）<br>新增公牛相关死亡记录（公牛的冲撞、公牛的子弹）<br>新增7个公牛相关成就<br>更新游戏规则中的怪物图鉴<br>特殊怪计数现在分别显示浪人和公牛数量<br>修复了部分bug<br>平衡了游戏的难度系数</p>' +
        '</div>' +

        // v1.4
        '<div style="border:2px solid #fbbf24;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.4 — 2026年6月1日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '今天很特殊，学校组织去外实训，没有太多的时间来打磨游戏，<br>不过还是很快乐的，更新一点是一点，以小见多。<br>感谢各位玩家的支持！</p>' +
        '<hr style="border-color:#fbbf24;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '加入成就系统和游戏日志系统，提升玩家获得感<br>优化了部分UI展示<br>更新了大量有趣的成就<br>修复部分bug</p>' +
        '</div>' +

        '<hr style="border-color:#ef4444;border-width:2px;margin:16px 0;">' +

        // v1.3
        '<div style="border:2px solid #c084fc;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.3 — 2026年5月31日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '开发一款游戏最重要的地方在于对游戏难度的平衡、对游戏故事的安排。<br>' +
        '后期会考虑加入故事模式，用心讲好一个故事！<br>' +
        '非常需要大量的玩家来帮我测试一下游戏的难度平衡，期待你的加入，我们一起进步！</p>' +
        '<hr style="border-color:#c084fc;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '加入变异怪「浪人」<br>优化游戏内UI<br>平衡了游戏的难度梯度<br>修复了感叹号预警定位与怪物不同步(原先怪在感叹号下面)的问题<br>修复了部分设备文字显示不清楚的问题<br>修复部分bug</p>' +
        '</div>' +

        '<hr style="border-color:#ef4444;border-width:2px;margin:16px 0;">' +

        // v1.2
        '<div style="border:2px solid #4def44;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.2 — 2026年5月30日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '不得不承认在音效和游戏音乐的寻找上很让人抓狂，不过人生何尝不是这样的呢...<br>'+'音乐是艺术品，游戏也是<br>' +
        '非常感谢一些玩家的金言良语，对我的开发很有帮助！<br>特别鸣谢Huiuioo的意见和建议!<br>今天的工程量看似很少，实则是最忙碌的一天。js突破2000行,Token量达8000万!</p>' +
        '<hr style="border-color:#ef4444;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '大量的游戏互动音效，提高沉浸感<br>加入音乐厅系统<br>加入玩家选择难度梯度<br>重新定义排行榜内容<br>加入设置系统可自定义修改音量<br>修复大量bug</p>' +
        '</div>' +
   '<hr style="border-color:#ef4444;border-width:2px;margin:16px 0;">' +
        // v1.1
        '<div style="border:2px solid #ef4444;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.1 — 2026年5月29日</p>' +
        '<p style="color:#fbbf24;font-size:13px;line-height:2.2;">' +
        '上午:今天的API出问题了!白花费了一小时，感觉很难受，不过不影响我正常更新！<br>'+'下午:好累啊，为了搞一个皮肤系统，从提高画质到定位皮肤再到模型调试，整整2个小时。加油!<br>' +
        '感谢各位内测玩家的大力支持，你们很伟大！</p>' +
        '<hr style="border-color:#ef4444;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '每日签到系统<br>积分系统<br>皮肤商城系统<br>时长换取积分系统<br>边缘岩浆系统<br>优化音乐系统<br>添加怪出现提前预知<br>修复已知bug</p>' +
        '</div>' +

        // 红色分割线
        '<hr style="border-color:#ef4444;border-width:2px;margin:16px 0;">' +

        // v1.0
        '<div style="border:2px solid #7c3aed;border-radius:8px;padding:16px;margin-bottom:14px;">' +
        '<p style="color:#c084fc;font-size:18px;font-weight:bold;">v1.0 — 2026年5月28日</p>' +
        '<p style="color:#fbbf24;font-size:15px;line-height:2;">' +
        '猫狮大王终于开始写游戏啦！<br>当然不是第一次了，<br>但这一次不同的是，<br><span style="font-size:17px;color:#c084fc;">游戏性大大的提升！！</span><br>' +
        '<span style="color:#a78bfa;">历史时刻，值得铭记</span></p>' +
        '<hr style="border-color:#374151;margin:10px 0;">' +
        '<p style="color:#9333ea;font-size:13px;line-height:2.2;">' +
        '怪物智能刷新机制<br>新手保护期（1分钟）<br>游戏暂停（空格键）<br>' +
        '排名系统<br>游戏音乐（多阶段迭代）<br>受击 & 死亡音效彩蛋</p>' +
        '</div>';
    overlay.classList.add('active');
}

function switchCollection(id) {
    currentCollectionId = id;
    openShopModal();
}

function openShopModal() {
    playClick(clickShopSound);
    var equipped = getEquippedSkin();
    var coll = getCollection(currentCollectionId);
    if (!coll) { currentCollectionId = skinCollections[0].id; coll = skinCollections[0]; }

    var html = '<h3>皮肤商城</h3>';
    html += '<p style="color:#fbbf24;text-align:center;margin-bottom:10px;">当前积分: ' + playerData.points + '</p>';

    // 合集切换标签
    html += '<div style="display:flex;gap:4px;justify-content:center;margin-bottom:12px;flex-wrap:wrap;">';
    for (var ci = 0; ci < skinCollections.length; ci++) {
        var c = skinCollections[ci];
        var active = (c.id === currentCollectionId);
        html += '<button class="coll-tab' + (active ? ' coll-tab-active' : '') + '" onclick="switchCollection(\'' + c.id + '\')">' + c.name + '</button>';
    }
    html += '</div>';

    // 自定义合集：10 槽位网格
    if (currentCollectionId === 'c5') {
        html += '<input type="file" id="custom-skin-upload" accept="image/*" style="display:none;">';
        html += '<p style="color:#22c55e;font-size:12px;text-align:center;margin:4px 0 8px 0;">💡 温馨提示：上传 PNG 格式体验更佳，支持透明背景！</p>';
        html += '<div class="skin-grid" style="grid-template-columns:repeat(3,1fr);">';
        var slots = loadCustomSkinSlots();
        for (var si = 0; si < slots.length; si++) {
            var slot = slots[si];
            var cls2 = 'skin-slot';
            var slotId = 'custom_slot_' + si;
            var eq2 = (equipped === slotId);
            if (eq2) cls2 += ' equipped';

            html += '<div class="' + cls2 + '" style="flex-direction:column;align-items:center;justify-content:center;min-height:140px;">';

            if (!slot.unlocked) {
                // 锁定状态
                html += '<span style="font-size:28px;color:#4b5563;">🔒</span>';
                html += '<small style="color:#6b7280;margin:4px 0;">槽位' + (si + 1) + '</small>';
                html += '<button class="skin-action" data-action="buy_slot" data-id="' + si + '" style="font-size:10px;padding:3px 10px;margin-top:4px;background:linear-gradient(135deg,#f59e0b,#fbbf24);border:none;border-radius:4px;color:#0a0a14;cursor:pointer;">解锁500</button>';
            } else if (!slot.image) {
                // 解锁未上传
                html += '<span style="font-size:28px;color:#4b5563;">➕</span>';
                html += '<small style="color:#6b7280;margin:4px 0;">槽位' + (si + 1) + '</small>';
                html += '<button class="skin-action" data-action="upload_slot" data-id="' + si + '" style="font-size:10px;padding:3px 10px;margin-top:4px;background:#7c3aed;border:none;border-radius:4px;color:#fff;cursor:pointer;">上传图片</button>';
            } else {
                // 已上传
                html += '<canvas class="skin-thumb" data-idx="' + si + '" data-coll="c5" width="60" height="60"></canvas>';
                html += '<small>' + escHtml(slot.name || '自定义' + (si + 1)) + '</small>';
                if (eq2) {
                    html += '<span style="font-size:10px;color:#fbbf24;">使用中</span>';
                } else {
                    html += '<div style="display:flex;gap:4px;margin-top:2px;">';
                    html += '<button class="skin-action" data-action="equip" data-id="' + slotId + '" style="font-size:10px;padding:2px 8px;background:#7c3aed;border:none;border-radius:4px;color:#fff;cursor:pointer;">使用</button>';
                    html += '<button class="skin-action" data-action="clear_slot" data-id="' + si + '" style="font-size:10px;padding:2px 8px;background:#ef4444;border:none;border-radius:4px;color:#fff;cursor:pointer;">清除</button>';
                    html += '<button class="skin-action" data-action="upload_slot" data-id="' + si + '" style="font-size:10px;padding:2px 8px;background:#f59e0b;border:none;border-radius:4px;color:#fff;cursor:pointer;">重传</button>';
                    html += '</div>';
                }
            }

            html += '</div>';
        }
        html += '</div>';
    } else {
        // 非自定义合集：原有皮肤列表
        html += '<div class="skin-grid">';
        for (var si = 0; si < coll.skins.length; si++) {
            var s = coll.skins[si];
            var owned = isSkinOwned(s.id);
            var eq2 = (equipped === s.id);
            var cls2 = 'skin-slot';
            if (eq2) cls2 += ' equipped';
            else if (owned) cls2 += ' owned';

            var spinAnim = Math.random() < 0.5 ? 'skinSpin' : 'skinSpinRev';
            html += '<div class="' + cls2 + '" style="cursor:pointer;animation-name:' + spinAnim + ';animation-duration:0.4s;animation-timing-function:ease-out;animation-play-state:paused;" onmouseenter="this.style.animationPlayState=\'running\'" onanimationend="this.style.animationPlayState=\'paused\'">';
            if (coll.loaded) {
                html += '<canvas class="skin-thumb" data-idx="' + si + '" data-coll="' + coll.id + '" width="60" height="60"></canvas>';
            } else {
                html += '<span style="font-size:22px;color:#64748b;">🐱</span>';
            }
            html += '<small>' + escHtml(s.name) + '</small>';

            if (eq2) {
                html += '<span style="font-size:10px;color:#fbbf24;">使用中</span>';
            } else if (owned) {
                html += '<button class="skin-action" data-action="equip" data-id="' + s.id + '" style="font-size:10px;padding:2px 8px;margin-top:2px;background:#7c3aed;border:none;border-radius:4px;color:#fff;cursor:pointer;">使用</button>';
            } else {
                html += '<button class="skin-action" data-action="buy" data-id="' + s.id + '" style="font-size:10px;padding:2px 8px;margin-top:2px;background:linear-gradient(135deg,#f59e0b,#fbbf24);border:none;border-radius:4px;color:#0a0a14;cursor:pointer;">' + s.cost + '积分</button>';
            }
            html += '</div>';
        }
        html += '</div>';
    }
    content.innerHTML = html;
    overlay.classList.add('active');

    // 绘制缩略图
    setTimeout(function() {
        var thumbs = document.querySelectorAll('.skin-thumb');
        for (var t = 0; t < thumbs.length; t++) {
            var cv = thumbs[t];
            var ctx2 = cv.getContext('2d');
            var collId = cv.getAttribute('data-coll');
            ctx2.imageSmoothingEnabled = (collId !== 'c5');
            var idx = parseInt(cv.getAttribute('data-idx'));
            var col2 = getCollection(collId);
            if (col2) {
                if (collId === 'c5') {
                    // c5 缩略图：按槽位索引查找
                    for (var si = 0; si < col2.skins.length; si++) {
                        if (col2.skins[si]._slotIndex === idx && col2.skins[si]._img && col2.skins[si]._loaded) {
                            ctx2.drawImage(col2.skins[si]._img, 0, 0, 60, 60);
                            break;
                        }
                    }
                } else if (col2.loaded) {
                    var row2 = Math.floor(idx / col2.cols);
                    var colIdx = idx % col2.cols;
                    var tsx = colIdx * col2.cellW + (col2.cropLeft || col2.cropX || 0);
                    var tsy = row2 * col2.cellH + (col2.cropTop || col2.cropY || 0);
                    var tsw = col2.cellW - (col2.cropLeft || col2.cropX || 0) - (col2.cropRight || col2.cropX || 0);
                    var tsh = col2.cellH - (col2.cropTop || col2.cropY || 0) - (col2.cropBottom || col2.cropY || 0);
                    ctx2.drawImage(col2.img, tsx, tsy, tsw, tsh, 0, 0, 60, 60);
                }
            }
        }
    }, 100);

    // 皮肤点击事件
    setTimeout(function() {
        var btns = document.querySelectorAll('.skin-action');
        for (var b = 0; b < btns.length; b++) {
            btns[b].addEventListener('click', function(e) {
                e.stopPropagation();
                var action = this.getAttribute('data-action');
                var id = this.getAttribute('data-id');
                if (action === 'buy') {
                    if (buySkin(id)) {
                        playClick(clickBuyOkSound);
                        openShopModal();
                    } else {
                        playClick(clickBuyFailSound);
                        this.textContent = '积分不足';
                        this.style.background = '#ef4444';
                        this.style.color = '#fff';
                    }
                } else if (action === 'equip') {
                    playClick(clickEquipSound);
                    equipSkin(id);
                    openShopModal();
                } else if (action === 'buy_slot') {
                    var si = parseInt(id);
                    if (buyCustomSkinSlot(si)) {
                        playClick(clickBuyOkSound);
                        openShopModal();
                    } else {
                        playClick(clickBuyFailSound);
                        this.textContent = '积分不足';
                        this.style.background = '#ef4444';
                        this.style.color = '#fff';
                    }
                } else if (action === 'upload_slot') {
                    var si = parseInt(id);
                    _pendingUploadSlot = si;
                    var inp2 = document.getElementById('custom-skin-upload');
                    if (inp2) { inp2.value = ''; inp2.click(); }
                } else if (action === 'clear_slot') {
                    var si = parseInt(id);
                    if (confirm('确认清除槽位' + (si + 1) + '的皮肤？')) {
                        clearCustomSkinSlot(si);
                        openShopModal();
                    }
                }
            });
        }
    }, 150);

    // 自定义皮肤上传事件（按槽位）
    var uploadInput = document.getElementById('custom-skin-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', function() {
            if (_pendingUploadSlot >= 0 && this.files && this.files.length > 0) {
                uploadToSlot(_pendingUploadSlot, this.files[0]);
            }
        });
    }
}

// 音乐厅
var musicHallTracks = [
    { id: 'm1',  name: '虚空坠落',   src: './audio/1_min.mp3', barSpeed: '1.2s', barColor: '#c084fc' },
    { id: 'm2',  name: '最美结局',   src: './audio/2_min.mp3', barSpeed: '0.7s', barColor: '#3b82f6' },
    { id: 'm3',  name: 'Home',       src: './audio/ost/Home_min.mp3', barSpeed: '1.2s', barColor: '#f472b6' },
    { id: 'm4',  name: 'His Theme',  src: './audio/ost/His Theme_min.mp3', barSpeed: '0.7s', barColor: '#ef4444' },
    { id: 'm5',  name: 'Born a Stranger', src: './audio/ost/Born a Stranger_min.mp3', barSpeed: '1.2s', barColor: '#60a5fa' },
    { id: 'm6',  name: 'Moongazer',  src: './audio/ost/Moongazer_min.mp3', barSpeed: '0.5s', barColor: '#a78bfa' },
    { id: 'm7',  name: 'V',         src: './audio/ost/V_min.mp3', barSpeed: '0.35s', barColor: '#ef4444' },
    { id: 'm8',  name: 'undertale',  src: './audio/ost/undertale_min.mp3', barSpeed: '0.7s', barColor: '#ef4444' },
    { id: 'm9',  name: 'For River',  src: './audio/ost/For River_min.mp3', barSpeed: '0.7s', barColor: '#fbbf24' },
    { id: 'm10', name: 'To the Moon', src: './audio/ost/To the Moon_min.mp3', barSpeed: '0.7s', barColor: '#fde68a' }
];
var musicHallEnterSound = new Audio('./audio/click-music-hall_min.mp3');
musicHallEnterSound.volume = VOL.musicHallEnter;
var musicHallAudio = null;
var musicHallPlayingId = null;
var musicHallPaused = false;
var noteInterval = null;
var noteSymbols = ['♪', '♫', '♬', '♩'];

function spawnMusicNote() {
    var btn = document.getElementById('music-hall-btn');
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var note = document.createElement('span');
    note.className = 'note-particle';
    note.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
    note.style.left = (rect.left + Math.random() * rect.width) + 'px';
    note.style.top = (rect.top - 5) + 'px';
    document.body.appendChild(note);
    setTimeout(function() { if (note.parentNode) note.remove(); }, 1000);
}

function startNoteSpawn() {
    stopNoteSpawn();
    noteInterval = setInterval(function() {
        if (musicHallAudio && !musicHallPaused) {
            var count = 2 + Math.floor(Math.random() * 2); // 2~3个每秒
            for (var n = 0; n < count; n++) {
                setTimeout(spawnMusicNote, Math.random() * 400);
            }
        }
    }, 1000);
}

function stopNoteSpawn() {
    if (noteInterval) { clearInterval(noteInterval); noteInterval = null; }
}

function stopMusicHall() {
    if (musicHallAudio) { musicHallAudio.pause(); musicHallAudio = null; }
    musicHallPlayingId = null;
    musicHallPaused = false;
    stopNoteSpawn();
    var _mhBtn=document.getElementById('music-hall-btn'); if(_mhBtn) _mhBtn.classList.remove('spinning');
    document.body.classList.remove('music-playing');
}

function toggleMusicHallTrack(id, src) {
    if (musicHallPlayingId === id && musicHallAudio && !musicHallPaused) {
        // 正在播放 → 暂停
        musicHallAudio.pause();
        musicHallPaused = true;
        stopNoteSpawn();
        var _mhBtn=document.getElementById('music-hall-btn'); if(_mhBtn) _mhBtn.classList.remove('spinning');
        document.body.classList.remove('music-playing');
        refreshMusicHallButtons();
        return;
    }
    if (musicHallPlayingId === id && musicHallPaused) {
        // 暂停中 → 继续
        musicHallAudio.play().catch(function() {});
        musicHallPaused = false;
        startNoteSpawn();
        var _mhBtn2=document.getElementById('music-hall-btn'); if(_mhBtn2) _mhBtn2.classList.add('spinning');
        document.body.classList.add('music-playing');
        refreshMusicHallButtons();
        return;
    }
    // 新曲目
    stopMusicHall();
    menuMusic.pause();
    menuMusic.currentTime = 0;
    musicHallAudio = new Audio(src);
    musicHallAudio.volume = VOL.musicHall;
    musicHallAudio.play().catch(function() {});
    musicHallPlayingId = id;
    musicHallPaused = false;
    // 音乐厅追踪
    if (musicHallTracksPlayed.indexOf(id) === -1) { musicHallTracksPlayed.push(id); saveMusicData(); }
    var _mhBtn2=document.getElementById('music-hall-btn'); if(_mhBtn2) _mhBtn2.classList.add('spinning');
    document.body.classList.add('music-playing');
    startNoteSpawn();
    // 播放计时
    var startTime = Date.now();
    var trackTimer = setInterval(function() {
        if (!musicHallAudio || musicHallAudio.paused) { clearInterval(trackTimer); return; }
        musicHallTotalTime++;
        if (musicHallTotalTime >= 1800) unlockAchievement('listen_30m');
    }, 1000);
    var oldEnded = musicHallAudio.onended;
    musicHallAudio.onended = function() { clearInterval(trackTimer); if (oldEnded) oldEnded(); };
    unlockAchievement('music_1');
    musicHallAudio.onended = function() {
        stopMusicHall();
        refreshMusicHallButtons();
    };
    refreshMusicHallButtons();
}

function refreshMusicHallButtons() {
    var btns = document.querySelectorAll('.mh-btn');
    for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var bid = b.getAttribute('data-id');
        var isThis = (bid === musicHallPlayingId && !musicHallPaused);
        b.textContent = isThis ? '暂停' : (bid === musicHallPlayingId ? '继续' : '播放');
        b.style.background = isThis ? '#f59e0b' : (bid === musicHallPlayingId ? '#2563eb' : '#7c3aed');
    }
    // 音律柱状图
    var bars = document.querySelectorAll('.mh-bars');
    for (var j = 0; j < bars.length; j++) {
        bars[j].style.display = (bars[j].getAttribute('data-id') === musicHallPlayingId && !musicHallPaused) ? 'inline-flex' : 'none';
    }
}

function openMusicHall() {
    playClick(musicHallEnterSound);
    var html = '<h3>音乐厅</h3><div style="padding:6px 12px;margin-bottom:8px;background:rgba(255,255,0,0.08);border:1px solid rgba(255,255,0,0.2);border-radius:6px;font-size:11px;color:#fbbf24;text-align:center;">纯音乐分享，无版权盗用</div><div style="max-height:50vh;overflow-y:auto;">';
    for (var i = 0; i < musicHallTracks.length; i++) {
        var t = musicHallTracks[i];
        var isPlaying = (musicHallPlayingId === t.id && !musicHallPaused);
        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid rgba(55,65,81,0.3);">';
        html += '<span class="mh-name" data-id="' + t.id + '" style="color:' + t.barColor + ';font-size:14px;transition:color 0.2s,font-size 0.2s;cursor:default;">' + (i + 1) + '. ' + t.name + '</span>';
        html += '<span class="mh-bars" data-id="' + t.id + '" style="display:' + (isPlaying ? 'inline-flex' : 'none') + ';gap:2px;align-items:flex-end;margin-right:8px;height:20px;">';
        for (var bi = 0; bi < 6; bi++) {
            html += '<span style="display:inline-block;width:3px;background:' + t.barColor + ';border-radius:1px;animation:barDance ' + t.barSpeed + ' ease-in-out infinite;animation-delay:' + (bi * 0.12) + 's;height:' + (5 + Math.random() * 15) + 'px;"></span>';
        }
        html += '</span>';
        html += '<button class="mh-btn" data-id="' + t.id + '" onclick="toggleMusicHallTrack(\'' + t.id + '\',\'' + t.src + '\')" style="padding:5px 14px;background:#7c3aed;border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;">播放</button>';
        html += '</div>';
    }
    html += '</div>';
    content.innerHTML = html;
    overlay.classList.add('active');
    // 刷新按钮状态（处理重进情况）
    setTimeout(function() { refreshMusicHallButtons(); }, 60);
}

// 设置系统
var settings = { musicVol: 0.6, sfxVol: 0.6, hideCursor: false, musicRate: 1.0, spawnRonin: false, spawnBull: false, spawnKui: false };
try {
    var saved = JSON.parse(localStorage.getItem('voidSettings'));
    if (saved) settings = saved;
} catch(e) {}

function applySettings() {
    // 音乐音量
    menuMusic.volume = settings.musicVol * VOL.menuMusic;
    travelAudio.volume = settings.musicVol * VOL.travelAudio;
    cycleTracks.forEach(function(t) { t.volume = settings.musicVol * VOL.cycleTrack; t.playbackRate = settings.musicRate || 1.0; });
    if (musicHallAudio) musicHallAudio.volume = settings.musicVol * VOL.musicHall;
    // 音效音量
    var allSfx = [hurtSound, deathSound, clickSound, clickStartSound, clickShopSound,
                  clickCheckinSound, clickCheckinOkSound, clickBuyOkSound, clickBuyFailSound,
                  clickVerSound, clickEquipSound, musicHallEnterSound, settingsEnterSound];
    // 道具音效（定义在 items.js）
    [typeof sfxHealPickup!=='undefined'&&sfxHealPickup, typeof sfxBombPickup!=='undefined'&&sfxBombPickup, typeof sfxBombExplode!=='undefined'&&sfxBombExplode, typeof sfxLaserPickup!=='undefined'&&sfxLaserPickup, typeof sfxLaserFire!=='undefined'&&sfxLaserFire, typeof sfxRoninDie!=='undefined'&&sfxRoninDie, typeof sfxBullDie!=='undefined'&&sfxBullDie, typeof sfxNormalDie!=='undefined'&&sfxNormalDie, typeof sfxItemSpawn!=='undefined'&&sfxItemSpawn, typeof sfxFrostExplode!=='undefined'&&sfxFrostExplode, typeof sfxPepperPickup!=='undefined'&&sfxPepperPickup, typeof sfxPepperExplode!=='undefined'&&sfxPepperExplode, typeof sfxPepperFire!=='undefined'&&sfxPepperFire].forEach(function(s) { if (s) allSfx.push(s); });
    // 怪物音效（定义在 fantasy.js）
    [typeof sfxKuiExplode!=='undefined'&&sfxKuiExplode, typeof sfxKuiMinionSpawn!=='undefined'&&sfxKuiMinionSpawn].forEach(function(s) { if (s) allSfx.push(s); });
    allSfx.forEach(function(s) { if (s) s.volume = settings.sfxVol; });
    // 特殊倍数音效（boost 确保在低音量设置下仍可听清）
    try { if (typeof sfxHealPickup !== 'undefined' && sfxHealPickup) sfxHealPickup.volume = Math.min(1, settings.sfxVol * VOL.healPickupBoost); } catch(e) {}
    try { if (typeof sfxRoninDie !== 'undefined' && sfxRoninDie) sfxRoninDie.volume = Math.min(1, settings.sfxVol * VOL.roninDieBoost); } catch(e) {}
    // 难度音效（已包含在 allSfx 中，单独再设一次确保覆盖）
    for (var dk in diffSounds) {
        if (diffSounds[dk].hover) diffSounds[dk].hover.volume = settings.sfxVol * VOL.diffHover;
        if (diffSounds[dk].enter) diffSounds[dk].enter.volume = settings.sfxVol * VOL.diffEnter;
    }
    localStorage.setItem('voidSettings', JSON.stringify(settings));
    if (settings.musicVol === 0 && settings.sfxVol === 0) unlockAchievement('silence');
    // 设置变动时自动保存到当前存档（防抖）
    clearTimeout(settings._saveTimer);
    settings._saveTimer = setTimeout(function() { autoSave(); }, 600);
}

function openSettings() {
    playClick(settingsEnterSound);
    var html = '<h3>设置</h3>';
    html += '<div style="display:flex;flex-direction:column;gap:16px;">';
    html += '<div><p style="color:#cbd5e1;font-size:14px;margin:0 0 6px;">游戏音乐音量</p>';
    html += '<input type="range" id="setMusicVol" min="0" max="1" step="0.05" value="' + settings.musicVol + '" oninput="updateMusicVol(this.value)" style="width:100%;accent-color:#7c3aed;">';
    html += '<span style="color:#fbbf24;font-size:13px;" id="setMusicVal">' + Math.round(settings.musicVol * 100) + '%</span></div>';
    html += '<div><p style="color:#cbd5e1;font-size:14px;margin:0 0 6px;">点击音效音量</p>';
    html += '<input type="range" id="setSfxVol" min="0" max="1" step="0.05" value="' + settings.sfxVol + '" oninput="updateSfxVol(this.value)" style="width:100%;accent-color:#7c3aed;">';
    html += '<span style="color:#fbbf24;font-size:13px;" id="setSfxVal">' + Math.round(settings.sfxVol * 100) + '%</span></div>';
    html += '<div><p style="color:#cbd5e1;font-size:14px;margin:0 0 6px;">战斗音乐播放速率</p>';
    html += '<input type="range" id="setMusicRate" min="0.5" max="2" step="0.05" value="' + (settings.musicRate || 1.0) + '" oninput="updateMusicRate(this.value)" style="width:100%;accent-color:#7c3aed;">';
    html += '<span style="color:#fbbf24;font-size:13px;" id="setMusicRateVal">' + (settings.musicRate || 1.0).toFixed(2) + 'x</span></div>';
    // 鼠标隐藏开关
    html += '<div style="display:flex;align-items:center;justify-content:space-between;">';
    html += '<span style="color:#cbd5e1;font-size:14px;">战斗中隐藏鼠标指针</span>';
    html += '<label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">';
    html += '<input type="checkbox" id="setHideCursor" onchange="updateHideCursor(this.checked)" style="opacity:0;width:0;height:0;"' + (settings.hideCursor !== false ? ' checked' : '') + '>';
    html += '<span style="position:absolute;top:0;left:0;right:0;bottom:0;background:' + (settings.hideCursor !== false ? '#7c3aed' : '#374151') + ';border-radius:12px;transition:0.3s;"></span>';
    html += '<span style="position:absolute;top:2px;left:' + (settings.hideCursor !== false ? '22px' : '2px') + ';width:20px;height:20px;background:#fff;border-radius:50%;transition:0.3s;"></span>';
    html += '</label></div>';
    // 恢复默认
    html += '<hr style="border-color:#374151;margin:8px 0;">';
    html += '<button id="resetSettingsBtn" style="display:block;margin:0 auto;padding:8px 24px;background:transparent;border:1px solid #7c3aed;border-radius:6px;color:#a78bfa;cursor:pointer;font-size:13px;letter-spacing:1px;">恢复默认设置</button>';
    html += '<p id="resetSettingsMsg" style="font-size:12px;text-align:center;margin-top:6px;min-height:18px;"></p>';
    // 调试面板解锁
    html += '<hr style="border-color:#374151;margin:8px 0;">';
    html += '<p style="color:#a78bfa;font-size:13px;text-align:center;margin:0;">解锁调试面板</p>';
    html += '<div style="display:flex;gap:8px;margin-top:8px;">';
    html += '<input type="password" id="debugPwd" placeholder="输入密码" style="flex:1;padding:6px 10px;background:#0a0a14;border:1px solid #374151;border-radius:6px;color:#cbd5e1;font-size:14px;">';
    html += '<button id="debugUnlockBtn" style="padding:6px 16px;background:#7c3aed;border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px;">解锁</button>';
    html += '</div><p id="debugPwdMsg" style="font-size:12px;text-align:center;margin-top:4px;min-height:18px;"></p>';
    html += '<button id="debugOpenBtn" onclick="closeSettingsOpenDebug()" style="display:' + (debugUnlocked ? 'block' : 'none') + ';margin:6px auto 0;padding:8px 20px;background:#7c3aed;border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px;">打开调试面板</button>';
    // 清空数据
    html += '<hr style="border-color:#374151;margin:8px 0;">';
    html += '<button id="clearDataBtn" style="display:block;margin:0 auto;padding:8px 24px;background:transparent;border:1px solid #ef4444;border-radius:6px;color:#ef4444;cursor:pointer;font-size:13px;letter-spacing:2px;">一键清空本地数据</button>';
    html += '<p id="clearDataMsg" style="font-size:12px;text-align:center;margin-top:6px;min-height:18px;"></p>';
    html += '</div>';
    content.innerHTML = html;
    overlay.classList.add('active');
    // 注入事件
    setTimeout(function() {
        // 调试解锁
        var msg2 = document.getElementById('debugPwdMsg');
        if (debugUnlocked && msg2) { msg2.textContent = '已解锁'; msg2.style.color = '#34d399'; }
        var btn2 = document.getElementById('debugUnlockBtn');
        if (btn2) {
            btn2.addEventListener('click', function() {
                var pwd = document.getElementById('debugPwd').value;
                var m = document.getElementById('debugPwdMsg');
                if (pwd === '20061121') {
                    debugUnlocked = true;
                    sessionStorage.setItem('voidDebug', '1');
                    unlockAchievement('debug_unlock');
                    m.textContent = '解锁成功!'; m.style.color = '#34d399';
                    var dbgBtn = document.getElementById('debugOpenBtn');
                    if (dbgBtn) dbgBtn.style.display = 'block';
                } else { m.textContent = '密码错误'; m.style.color = '#ef4444'; }
            });
        }
        // 恢复默认
        var resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('确定要恢复默认设置吗？\n\n音量、鼠标指针等将恢复为初始值。')) {
                    settings = { musicVol: 0.6, sfxVol: 0.6, hideCursor: false, musicRate: 1.0, spawnRonin: false, spawnBull: false, spawnKui: false };
                    applySettings();
                    openSettings();
                    var msg = document.getElementById('resetSettingsMsg');
                    if (msg) { msg.textContent = '已恢复默认'; msg.style.color = '#34d399'; }
                }
            });
        }
        // 清空数据
        var btn3 = document.getElementById('clearDataBtn');
        if (btn3) {
            btn3.addEventListener('click', function() {
                if (confirm('确定要清空所有本地数据吗？\n\n游戏数据将全部消失\n此操作不可恢复！')) {
                    localStorage.removeItem('voidFallData');
                    localStorage.removeItem('voidFallBest');
                    localStorage.removeItem('voidFallBestPoints');
                    localStorage.removeItem('voidSettings');
                    localStorage.removeItem('voidAchievements');
                    localStorage.removeItem('voidGameLog');
                    localStorage.removeItem('voidItemFilter');
                    localStorage.removeItem('voidAch_custom_first_upload');
                    localStorage.removeItem('voidAch_custom_all_unlock');
                    // 保留存档位，不清除
                    gameLog = { easy:{plays:0,bestTime:0,pts:0,score:0,bestPts:0,bestScore:0,deaths:{}}, normal:{plays:0,bestTime:0,pts:0,score:0,bestPts:0,bestScore:0,deaths:{}}, hard:{plays:0,bestTime:0,pts:0,score:0,bestPts:0,bestScore:0,deaths:{}} };
                    musicHallTotalTime = 0; musicHallTracksPlayed = [];
                    localStorage.removeItem('voidMusicTime'); localStorage.removeItem('voidMusicTracks');
                    sessionStorage.removeItem('voidDebug');
                    playerData = { points:0, lastCheckin:'', totalCheckins:0, totalRankPts:0, ownedSkins:['heart'], equippedSkin:'heart' };
                    savePlayerData(playerData);
                    setActiveSlot(null);
                    unlockedAchievements = [];
                    localStorage.setItem('voidAchievements', '[]');
                    setTimeout(function(){ document.getElementById('ach-badge').classList.remove('show'); updateStatsCategoryNotify(); }, 100);
                    updatePointsDisplay();
                    bestTime = 0; recordBroken = false;
                    debugUnlocked = false;
                    document.getElementById('debug-btn').classList.remove('show');
                    if (typeof enabledItemIds !== 'undefined') { enabledItemIds = null; saveItemFilter(); }
                    var msg3 = document.getElementById('clearDataMsg');
                    if (msg3) { msg3.textContent = '数据已清空'; msg3.style.color = '#34d399'; }
                }
            });
        }
    }, 50);
}

function updateMusicVol(v) {
    settings.musicVol = Math.min(1, Math.max(0, parseFloat(v)));
    document.getElementById('setMusicVal').textContent = Math.round(settings.musicVol * 100) + '%';
    applySettings();
}
function updateSfxVol(v) {
    settings.sfxVol = Math.min(1, Math.max(0, parseFloat(v)));
    document.getElementById('setSfxVal').textContent = Math.round(settings.sfxVol * 100) + '%';
    applySettings();
}
function updateMusicRate(v) {
    settings.musicRate = parseFloat(v);
    document.getElementById('setMusicRateVal').textContent = settings.musicRate.toFixed(2) + 'x';
    applySettings();
}
// ==================== 美术馆 ====================
var _galleryAudio = null;
var _galleryPreviewSrc = null;
var _galleryCurrentTab = 'sfx';

var gallerySfxList = [
    { cat: '界面音效', items: [
        { n: '点击音效', s: './audio/break1_min.mp3' },
        { n: '旅行音乐(菜单主题)', s: './audio/travel_min.mp3' },
        { n: '点击开始/返回/重新开始', s: './audio/click-start_min.mp3' },
        { n: '商店打开', s: './audio/click-shop_min.mp3' },
        { n: '皮肤购买成功', s: './audio/click-buy-ok_min.mp3' },
        { n: '购买失败(钱不够)', s: './audio/click-buy-fail_min.mp3' },
        { n: '签到打开', s: './audio/click-checkin_min.mp3' },
        { n: '签到成功', s: './audio/click-checkin-ok_min.mp3' },
        { n: '版本号点击', s: './audio/click-heart_min.mp3' },
        { n: '使用皮肤', s: './audio/click-equip_min.mp3' },
        { n: '设置打开', s: './audio/click-settings_min.mp3' },
        { n: '音乐厅进入', s: './audio/click-music-hall_min.mp3' },
        { n: '受伤音效', s: './audio/hurt_min.mp3' },
        { n: '死亡音效', s: './audio/die-sfx_min.mp3' },
    ]},
    { cat: '道具音效', items: [
        { n: '生命回复拾取', s: './audio/heal-pickup_min.mp3' },
        { n: '炸弹拾取', s: './audio/bomb-pickup_min.mp3' },
        { n: '炸弹爆炸', s: './audio/bomb-explode_min.mp3' },
        { n: '激光枪拾取', s: './audio/laser-pickup_min.mp3' },
        { n: '激光枪发射', s: './audio/laser-fire_min.mp3' },
        { n: '寒冰蘑菇爆炸', s: './audio/frost-explode_min.mp3' },
        { n: '辣椒拾取', s: './audio/pepper-pickup_min.mp3' },
        { n: '辣椒爆炸', s: './audio/pepper-explode_min.mp3' },
        { n: '辣椒持续燃烧', s: './audio/pepper-burn_min.mp3' },
        { n: '道具刷新', s: './audio/item-spawn_min.mp3' },
    ]},
    { cat: '怪物音效', items: [
        { n: '普通怪死亡', s: './audio/normal-die_min.mp3' },
        { n: '浪人死亡', s: './audio/ronin-die_min.mp3' },
        { n: '公牛死亡', s: './audio/bull-die_min.mp3' },
        { n: '魁爆炸', s: './audio/kui-explode_min.mp3' },
        { n: '小魁产生', s: './audio/kui-minion_min.mp3' },
    ]},
    { cat: '难度音效', items: [
        { n: '简单难度 悬浮', s: './audio/easy-hover_min.mp3' },
        { n: '简单难度 进入', s: './audio/easy-enter_min.mp3' },
        { n: '普通难度 悬浮', s: './audio/normal-hover_min.mp3' },
        { n: '普通难度 进入', s: './audio/normal-enter_min.mp3' },
        { n: '困难难度 悬浮', s: './audio/hard-hover_min.mp3' },
        { n: '困难难度 进入', s: './audio/hard-enter_min.mp3' },
    ]},
];

var galleryMusicTracks = musicHallTracks.concat([
    { id: 'gb1', name: '坠落进行曲一', src: './audio/3_min.mp3', barSpeed: '1.0s', barColor: '#f97316' },
    { id: 'gb2', name: '坠落进行曲二', src: './audio/4_min.mp3', barSpeed: '1.0s', barColor: '#f97316' },
    { id: 'gb3', name: '坠落进行曲三', src: './audio/5_min.mp3', barSpeed: '1.0s', barColor: '#f97316' },
]);

function _fn(path) { return path.split('/').pop(); }

function downloadResource(src, name) {
    var fileName = name || _fn(src);
    // 尝试 XHR 获取 Blob（Firefox file:// 可用，某些 Chrome 配置也可用）
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', src, true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if ((xhr.status === 0 || xhr.status === 200) && xhr.response) {
                var url = URL.createObjectURL(xhr.response);
                var a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function(){URL.revokeObjectURL(url);}, 10000);
                return;
            }
            _openDownloadTab(src);
        };
        xhr.onerror = function() { _openDownloadTab(src); };
        xhr.send();
    } catch(e) {
        _openDownloadTab(src);
    }
}
function _openDownloadTab(src) {
    // 浏览器安全限制无法自动下载，新标签页打开（用户可手动保存），避免丢失游戏页面
    var a = document.createElement('a');
    a.href = src;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function _stopGalleryAudio() {
    if (_galleryAudio) { _galleryAudio.pause(); _galleryAudio = null; }
    _galleryPreviewSrc = null;
}

function playGallerySfx(src) {
    // 清除所有按钮的 playing 状态
    var allBtns = document.querySelectorAll('.gal-sfx-btn');
    for (var bi = 0; bi < allBtns.length; bi++) allBtns[bi].classList.remove('playing');
    _stopGalleryAudio();
    _galleryAudio = new Audio(src);
    _galleryAudio.volume = (typeof settings !== 'undefined' && settings.sfxVol) ? settings.sfxVol : 0.6;
    _galleryAudio.play().catch(function(){});
    // 标记当前播放的按钮
    for (var bj = 0; bj < allBtns.length; bj++) {
        if (allBtns[bj].getAttribute('onclick').indexOf(src) !== -1) {
            allBtns[bj].classList.add('playing');
            break;
        }
    }
}

function refreshGalleryMusicBtns() {
    var btns = document.querySelectorAll('.gm-btn');
    for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var bs = b.getAttribute('data-src');
        if (bs === _galleryPreviewSrc && _galleryAudio && !_galleryAudio.paused) {
            b.textContent = '暂停'; b.style.background = '#f59e0b';
        } else if (bs === _galleryPreviewSrc) {
            b.textContent = '继续'; b.style.background = '#2563eb';
        } else {
            b.textContent = '播放'; b.style.background = '#7c3aed';
        }
    }
}

function playGalleryMusic(_, src) {
    if (_galleryPreviewSrc === src && _galleryAudio) {
        if (!_galleryAudio.paused) { _galleryAudio.pause(); }
        else { _galleryAudio.play().catch(function(){}); }
        refreshGalleryMusicBtns();
        return;
    }
    _stopGalleryAudio();
    _galleryAudio = new Audio(src);
    _galleryAudio.volume = (typeof settings !== 'undefined') ? settings.musicVol * VOL.musicHall : 0.6;
    _galleryAudio.play().catch(function(){});
    _galleryPreviewSrc = src;
    refreshGalleryMusicBtns();
}

function switchGalleryTab(tab) {
    _galleryCurrentTab = tab;
    openGallery();
}

function openGallery() {
    playClick();
    var html = '<h3>美术馆</h3>';
    var tabs = [
        { id: 'sfx', name: '音效' },
        { id: 'music', name: '音乐' },
        { id: 'skin', name: '皮肤' },
        { id: 'item', name: '道具' },
    ];
    html += '<div style="display:flex;gap:4px;justify-content:center;margin-bottom:12px;flex-wrap:wrap;">';
    for (var ti = 0; ti < tabs.length; ti++) {
        var tab = tabs[ti];
        html += '<button class="coll-tab' + (tab.id === _galleryCurrentTab ? ' coll-tab-active' : '') + '" onclick="switchGalleryTab(\'' + tab.id + '\')">' + tab.name + '</button>';
    }
    html += '</div><div style="max-height:55vh;overflow-y:auto;">';

    if (_galleryCurrentTab === 'sfx') {
        for (var ci = 0; ci < gallerySfxList.length; ci++) {
            var cat = gallerySfxList[ci];
            html += '<div style="margin-bottom:10px;">';
            html += '<div class="gal-cat-title">' + cat.cat + '</div>';
            for (var si = 0; si < cat.items.length; si++) {
                var s_item = cat.items[si];
                html += '<span class="gal-sfx-wrap">';
                html += '<button class="gal-sfx-btn" onclick="playGallerySfx(\'' + s_item.s + '\')">▶</button>';
                html += '<span class="gal-sfx-name">' + s_item.n + '</span>';
                html += '<button class="gal-dl-btn" onclick="downloadResource(\'' + s_item.s + '\')" title="下载">⬇</button>';
                html += '</span>';
            }
            html += '</div>';
        }
    } else if (_galleryCurrentTab === 'music') {
        for (var mi = 0; mi < galleryMusicTracks.length; mi++) {
            var tr = galleryMusicTracks[mi];
            var isThis = (_galleryPreviewSrc === tr.src && _galleryAudio && !_galleryAudio.paused);
            html += '<div class="gal-music-row">';
            html += '<span style="color:' + tr.barColor + ';font-size:14px;">' + (mi+1) + '. ' + tr.name + '</span>';
            html += '<span class="gal-music-actions">';
            html += '<button class="gm-btn" data-src="' + tr.src + '" onclick="playGalleryMusic(\'' + tr.id + '\',\'' + tr.src + '\')">' + (isThis ? '暂停' : '播放') + '</button>';
            html += '<button class="gal-dl-btn" onclick="downloadResource(\'' + tr.src + '\')" title="下载">⬇</button>';
            html += '</span>';
            html += '</div>';
        }
    } else if (_galleryCurrentTab === 'skin') {
        for (var sci = 0; sci < skinCollections.length; sci++) {
            var sc = skinCollections[sci];
            html += '<div style="margin-bottom:12px;">';
            html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">';
            html += '<div class="gal-col-title" style="margin:0;">' + sc.name + '</div>';
            if (sc.id !== 'c5') {
                html += '<button class="gal-dl-btn" onclick="downloadResource(\'' + sc.src + '\',\'' + sc.name + '皮肤合集.png\')" title="下载合集">⬇ 下载合集</button>';
            }
            html += '</div>';
            html += '<div class="skin-grid" style="grid-template-columns:repeat(4,1fr);gap:4px;">';
            for (var ssi = 0; ssi < sc.skins.length; ssi++) {
                var sk = sc.skins[ssi];
                html += '<div class="gal-skin-cell">';
                if (sc.loaded || (sc.id === 'c5' && sk._loaded)) {
                    html += '<canvas class="gal-skin-thumb" data-coll="' + sc.id + '" data-idx="' + ssi + '" width="60" height="60"></canvas>';
                } else {
                    html += '<span style="font-size:22px;color:#64748b;">🐱</span>';
                }
                html += '<div style="color:#94a3b8;font-size:10px;margin-top:2px;">' + sk.name + '</div>';
                html += '</div>';
            }
            html += '</div></div>';
        }
    } else if (_galleryCurrentTab === 'item') {
        var itemDefs_local = [
            { n: '生命回复', s: './img/items/heart.png' },
            { n: '炸弹', s: './img/items/bomb.png' },
            { n: '激光枪', s: './img/items/laser.png' },
            { n: '冰霜冲击', s: './img/items/frost.png' },
            { n: '火爆辣椒', s: './img/items/pepper.png' },
        ];
        html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:8px;">';
        for (var ii = 0; ii < itemDefs_local.length; ii++) {
            html += '<div class="gal-item-cell">';
            html += '<img src="' + itemDefs_local[ii].s + '" style="width:64px;height:64px;object-fit:contain;">';
            html += '<div style="color:#e2e8f0;font-size:13px;margin-top:6px;">' + itemDefs_local[ii].n + '</div>';
            html += '<button class="gal-dl-btn" onclick="downloadResource(\'' + itemDefs_local[ii].s + '\')" style="margin-top:6px;" title="下载">⬇ 下载</button>';
            html += '</div>';
        }
        html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;
    overlay.classList.add('active');

    // 绘制皮肤缩略图
    setTimeout(function() {
        var thumbs = document.querySelectorAll('.gal-skin-thumb');
        for (var t = 0; t < thumbs.length; t++) {
            var cv = thumbs[t];
            var ctx2 = cv.getContext('2d');
            var collId = cv.getAttribute('data-coll');
            ctx2.imageSmoothingEnabled = (collId !== 'c5');
            var idx = parseInt(cv.getAttribute('data-idx'));
            var col2 = getCollection(collId);
            if (col2) {
                if (collId === 'c5' && col2.skins[idx] && col2.skins[idx]._img && col2.skins[idx]._loaded) {
                    ctx2.drawImage(col2.skins[idx]._img, 0, 0, 60, 60);
                } else if (col2.loaded) {
                    var row2 = Math.floor(idx / col2.cols);
                    var colIdx = idx % col2.cols;
                    var tsx = colIdx * col2.cellW + (col2.cropLeft || col2.cropX || 0);
                    var tsy = row2 * col2.cellH + (col2.cropTop || col2.cropY || 0);
                    var tsw = col2.cellW - (col2.cropLeft || col2.cropX || 0) - (col2.cropRight || col2.cropX || 0);
                    var tsh = col2.cellH - (col2.cropTop || col2.cropY || 0) - (col2.cropBottom || col2.cropY || 0);
                    ctx2.drawImage(col2.img, tsx, tsy, tsw, tsh, 0, 0, 60, 60);
                }
            }
        }
    }, 100);
}

function drawMonsterPreviews() {
    // 普通怪预览
    var normalCanvas = document.getElementById('preview-normal');
    if (normalCanvas) {
        var nc = normalCanvas.getContext('2d');
        var cx = 28, cy = 28, r = 14;
        nc.clearRect(0, 0, 56, 56);
        nc.fillStyle = '#a855f7';
        nc.beginPath(); nc.arc(cx, cy, r, 0, Math.PI * 2); nc.fill();
        nc.strokeStyle = 'rgba(255,255,255,0.4)';
        nc.lineWidth = 1.5; nc.stroke();
    }
    // 浪人预览
    var roninCanvas = document.getElementById('preview-ronin');
    if (roninCanvas) {
        var rc = roninCanvas.getContext('2d');
        var cx = 28, cy = 28, s = 16;
        rc.clearRect(0, 0, 56, 56);
        // 光晕
        rc.shadowColor = '#fbbf24'; rc.shadowBlur = 12;
        rc.fillStyle = '#fbbf24';
        rc.beginPath();
        rc.moveTo(cx, cy - s);
        rc.lineTo(cx + s, cy);
        rc.lineTo(cx, cy + s);
        rc.lineTo(cx - s, cy);
        rc.closePath(); rc.fill();
        rc.shadowBlur = 0;
        // 浪字
        rc.fillStyle = '#000';
        rc.font = 'bold 14px "Microsoft YaHei", sans-serif';
        rc.textAlign = 'center'; rc.textBaseline = 'middle';
        rc.fillText('浪', cx, cy);
    }
    // 公牛预览
    var bullCanvas = document.getElementById('preview-bull');
    if (bullCanvas) {
        var bc = bullCanvas.getContext('2d');
        var cx = 28, cy = 28, s = 18;
        bc.clearRect(0, 0, 56, 56);
        // 光晕
        bc.shadowColor = '#f97316'; bc.shadowBlur = 12;
        bc.fillStyle = '#f97316';
        bc.beginPath();
        bc.moveTo(cx, cy - s);
        bc.lineTo(cx + s * 0.87, cy + s * 0.5);
        bc.lineTo(cx - s * 0.87, cy + s * 0.5);
        bc.closePath(); bc.fill();
        bc.shadowBlur = 0;
        // 牛字
        bc.fillStyle = '#000';
        bc.font = 'bold 14px "Microsoft YaHei", sans-serif';
        bc.textAlign = 'center'; bc.textBaseline = 'middle';
        bc.fillText('牛', cx, cy);
    }
    // 魁预览
    var kuiCanvas = document.getElementById('preview-kui');
    if (kuiCanvas) {
        var kc = kuiCanvas.getContext('2d');
        var cx = 28, cy = 28, s = 18;
        kc.clearRect(0, 0, 56, 56);
        // 青色煞气光晕
        kc.shadowColor = '#06b6d4';
        kc.shadowBlur = 20;
        kc.fillStyle = '#ef4444';
        kc.beginPath();
        kc.moveTo(cx, cy - s);
        kc.lineTo(cx + s, cy);
        kc.lineTo(cx, cy + s);
        kc.lineTo(cx - s, cy);
        kc.closePath(); kc.fill();
        kc.shadowBlur = 0;
        // 魁字
        kc.fillStyle = '#fff';
        kc.font = 'bold 14px "Microsoft YaHei", sans-serif';
        kc.textAlign = 'center'; kc.textBaseline = 'middle';
        kc.fillText('魁', cx, cy);
    }
}
function drawItemPreviews() {
    var items = [
        { id: 'heal', canvasId: 'preview-item-heal' },
        { id: 'bomb', canvasId: 'preview-item-bomb' },
        { id: 'laser', canvasId: 'preview-item-laser' },
        { id: 'frost', canvasId: 'preview-item-frost' },
        { id: 'pepper', canvasId: 'preview-item-pepper' }
    ];
    for (var di = 0; di < items.length; di++) {
        var canvas = document.getElementById(items[di].canvasId);
        if (!canvas) continue;
        var c = canvas.getContext('2d');
        c.clearRect(0, 0, 56, 56);
        var img = countdownImg[items[di].id];
        if (img && img.complete && img.naturalWidth > 0) {
            c.drawImage(img, 4, 4, 48, 48);
        } else {
            c.fillStyle = '#374151';
            c.beginPath(); c.arc(28, 28, 20, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#fff'; c.font = 'bold 20px sans-serif';
            c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 28, 28);
        }
    }
}
function openArchive(type) {
    playClick();
    var key = type === 'monster' ? 'monster_archive' : 'item_archive';
    var data = modalData[key];
    if (data) {
        content.innerHTML = '<h3>' + data.title + '</h3>' + data.html;
        modalBox.classList.add('disclaimer');
        if (type === 'monster') drawMonsterPreviews();
        if (type === 'item') drawItemPreviews();
    }
}
function closeSettingsOpenDebug() {
    overlay.classList.remove('active');
    overlay.style.zIndex = '1000';
    openDebugPanel();
}
function openCredits() {
    playClick();
    var html = '<h3>鸣谢名单</h3>';
    html += '<div class="credits-carousel">';
    html += '<div class="credits-track">';
    // Slide 1: 开发者
    html += '<div class="credits-slide">';
    html += '<div class="credits-label">开发者</div>';
    html += '<div class="credits-name highlight">猫狮</div>';
    html += '</div>';
    // Slide 2: 特别鸣谢
    html += '<div class="credits-slide">';
    html += '<div class="credits-label">特别鸣谢</div>';
    html += '<div class="credits-names">';
    var specials = ['喵小呜゛', 'Huiuioo', '陈诗瑶💗', '梦梦喵～'];
    for (var si = 0; si < specials.length; si++) {
        html += '<span class="credits-tag gold">' + specials[si] + '</span>';
    }
    html += '</div></div>';
    // Slide 3: 其他
    html += '<div class="credits-slide">';
    html += '<div class="credits-label">内测玩家</div>';
    html += '<div class="credits-names">';
    var others = ['Showkin','宁静致远','空集','第二落点','pg','白桔梗','Zane','四菜一汤','衍','Zy𣞤','広','Auer','保护小羊洋','16','青空','丢丢¹','和好可以吗'];
    for (var oi = 0; oi < others.length; oi++) {
        html += '<span class="credits-tag">' + others[oi] + '</span>';
    }
    html += '</div></div>';
    html += '</div></div>';
    // 指示器
    html += '<div class="credits-dots"><span class="credits-dot active"></span><span class="credits-dot"></span><span class="credits-dot"></span></div>';
    content.innerHTML = html;
    overlay.classList.add('active');
}
function updateHideCursor(v) {
    settings.hideCursor = v;
    applySettings();
    var cb = document.getElementById('setHideCursor');
    if (cb && cb.parentNode) {
        var spans = cb.parentNode.querySelectorAll('span');
        if (spans[0]) spans[0].style.background = v ? '#7c3aed' : '#374151';
        if (spans[1]) spans[1].style.left = v ? '22px' : '2px';
    }
}

function updateSpawnElite(type, v) {
    if (type === 'ronin') settings.spawnRonin = v;
    else if (type === 'bull') settings.spawnBull = v;
    else if (type === 'kui') settings.spawnKui = v;
    applySettings();
    var id = 'setSpawn' + type.charAt(0).toUpperCase() + type.slice(1);
    var cb = document.getElementById(id);
    if (cb && cb.parentNode) {
        var spans = cb.parentNode.querySelectorAll('span');
        if (spans[0]) spans[0].style.background = v ? '#7c3aed' : '#374151';
        if (spans[1]) spans[1].style.left = v ? '22px' : '2px';
    }
}

applySettings(); // 初始应用

function openCheckinModal() {
    playClick(clickCheckinSound);
    content.innerHTML = '<h3>每日签到</h3>' + buildCheckinHTML();
    setTimeout(function() {
        var btn = document.getElementById('checkinBtn');
        if (btn) {
            btn.addEventListener('click', function() {
                playClick(clickCheckinOkSound);
                playerData.points += 100;
                playerData.totalCheckins++;
                playerData.lastCheckin = todayStr();
                savePlayerData(playerData);
                autoSave();
                updatePointsDisplay();
                updateCheckinReminder();
                checkAchievements();
                content.innerHTML = '<h3>每日签到</h3>' + buildCheckinHTML();
            });
        }
    }, 50);
    overlay.classList.add('active');
}

function onDebugAddPoints() {
    playerData.points += 1000;
    savePlayerData(playerData);
    updatePointsDisplay();
}

function onDebugReset() {
    debugParams.modelScale.val = 0.35;
    mobileScale = 0.35;
    unitSize = 9 * mobileScale;
    debugInvincible = false;
    debugParams.invincibleLead.val = 0.3;
    if (typeof invincibleLeadTime !== 'undefined') {
        invincibleLeadTime = 0.3;
        localStorage.setItem('voidInvincibleLead', 0.3);
    }
    debugParams.pepperFireRadius.val = 1.5;
    if (typeof pepperFireRadiusMult !== 'undefined') {
        pepperFireRadiusMult = 1.5;
        localStorage.setItem('voidPepperFireRadius', 1.5);
    }
    if (typeof enabledItemIds !== 'undefined') { enabledItemIds = null; }
    if (typeof saveItemFilter === 'function') saveItemFilter();
    refreshDebugPanel();
}

// ==================== 排行榜 ====================
var lbState = { offset: 0, total: 0, allRows: [] };
function openLeaderboard() {
    if (!localStorage.getItem('voidLbNameSet')) {
        showLbNamePrompt();
        return;
    }
    showLeaderboardContent();
}

function showLbNamePrompt() {
    var existingName = localStorage.getItem('voidLbName') || '';
    var html = '<h3 style="text-align:center;margin:0 0 10px;">设置排行名称</h3>';
    html += '<p style="text-align:center;color:#a78bfa;font-size:13px;margin-bottom:12px;">输入你的名字，留空则自动分配</p>';
    html += '<div style="text-align:center;">';
    html +=   '<input id="lb-name-input" type="text" maxlength="16" placeholder="输入名字…" value="' + escHtml(existingName) + '" style="width:200px;padding:8px 12px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.3);border-radius:6px;color:#c4b5fd;font-size:14px;outline:none;text-align:center;">';
    html +=   '<br><br>';
    html +=   '<button id="lb-name-confirm" style="background:#8b5cf6;color:#fff;border:none;padding:8px 28px;border-radius:6px;cursor:pointer;font-size:14px;">确认</button>';
    html += '</div>';

    overlay.style.zIndex = '3000';
    content.innerHTML = html;
    overlay.classList.add('active');

    var input = document.getElementById('lb-name-input');
    if (input) setTimeout(function() { input.focus(); }, 100);

    document.getElementById('lb-name-confirm').addEventListener('click', function() {
        var val = document.getElementById('lb-name-input').value.trim();
        if (!val) {
            var counter = parseInt(localStorage.getItem('voidLbCounter')) || 10000;
            val = '坠落者' + counter;
            localStorage.setItem('voidLbCounter', counter + 1);
        }
        localStorage.setItem('voidLbName', val);
        localStorage.setItem('voidLbNameSet', '1');
        overlay.classList.remove('active');
        overlay.style.zIndex = '1000';
        setTimeout(function() { showLeaderboardContent(); }, 200);
    });
}

function showLeaderboardContent() {
    var myName = localStorage.getItem('voidLbName') || '';
    var bestPts = parseFloat(localStorage.getItem('voidFallBestPoints')) || 0;
    var maxUploaded = parseFloat(localStorage.getItem('voidLbMaxUploaded')) || 0;

    var html = '<h3 style="text-align:center;margin:0 0 10px;">🌌 虚空排行榜</h3>';
    html += '<p style="text-align:center;color:#8b5cf6;font-size:12px;margin:0 0 12px;">' + escHtml(myName) + ' <span style="color:#a78bfa;font-size:11px;cursor:pointer;" onclick="showLbRename()">[改名]</span></p>';

    // 上传状态提示（绿色 = 已上榜）
    if (maxUploaded >= 500) {
        html += '<p style="text-align:center;color:#22c55e;font-size:12px;margin:0 0 10px;">✓ 你的最佳记录 ' + maxUploaded + ' 分已上榜</p>';
    } else if (bestPts >= 500) {
        html += '<p style="text-align:center;color:#fbbf24;font-size:12px;margin:0 0 10px;">⏳ 最佳记录 ' + bestPts + ' 分，等待上传...</p>';
    } else {
        html += '<p style="text-align:center;color:#6b7280;font-size:12px;margin:0 0 10px;">达到 500 分即可上榜</p>';
    }

    html += '<div id="lb-count-info" style="text-align:center;color:#a78bfa;font-size:12px;margin-bottom:8px;">加载中...</div>';
    html += '<div id="lb-list" style="max-height:360px;overflow-y:auto;"></div>';
    html += '<div id="lb-myrank" style="margin-top:10px;border-top:1px solid rgba(139,92,246,0.2);padding-top:8px;"></div>';

    overlay.style.zIndex = '3000';
    content.innerHTML = html;
    overlay.classList.add('active');

    // 重置分页状态
    lbState.offset = 0;
    lbState.total = 0;
    lbState.allRows = [];

    renderLeaderboard(true);
}

function showLbRename() {
    var curName = localStorage.getItem('voidLbName') || '';
    var html = '<h3 style="text-align:center;margin:0 0 10px;">修改名称</h3>';
    html += '<div style="text-align:center;">';
    html +=   '<input id="lb-rename-input" type="text" maxlength="16" value="' + escHtml(curName) + '" style="width:200px;padding:8px 12px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.3);border-radius:6px;color:#c4b5fd;font-size:14px;outline:none;text-align:center;">';
    html +=   '<br><br>';
    html +=   '<button id="lb-rename-confirm" style="background:#8b5cf6;color:#fff;border:none;padding:8px 28px;border-radius:6px;cursor:pointer;font-size:14px;">保存</button>';
    html += '</div>';

    overlay.style.zIndex = '3000';
    content.innerHTML = html;
    overlay.classList.add('active');

    var input = document.getElementById('lb-rename-input');
    if (input) setTimeout(function() { input.focus(); input.select(); }, 100);

    document.getElementById('lb-rename-confirm').addEventListener('click', function() {
        var val = document.getElementById('lb-rename-input').value.trim();
        if (val) {
            localStorage.setItem('voidLbName', val);
        }
        overlay.classList.remove('active');
        overlay.style.zIndex = '1000';
        setTimeout(function() { showLeaderboardContent(); }, 200);
    });
}

function formatLbTime(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var h = d.getHours();
    var min = d.getMinutes();
    return (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + (h < 10 ? '0' + h : h) + ':' + (min < 10 ? '0' + min : min);
}

function renderLeaderboard(append) {
    var container = document.getElementById('lb-list');
    var infoEl = document.getElementById('lb-count-info');
    var myRankEl = document.getElementById('lb-myrank');
    if (!container) return;

    var myName = localStorage.getItem('voidLbName') || '';
    var limit = 50;

    var offset = append ? lbState.offset : 0;
    getLeaderboard(limit, offset).then(function(result) {
        var data = result && result.data || [];
        var total = result && result.total || 0;
        lbState.total = total;

        // 更新总数信息
        if (infoEl) {
            infoEl.innerHTML = '共 <b style="color:#c4b5fd;">' + total + '</b> 人';
        }

        // 追加数据
        if (append) {
            lbState.allRows = lbState.allRows.concat(data);
        } else {
            lbState.allRows = data;
        }
        lbState.offset = lbState.allRows.length;

        // 渲染表格
        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
        html += '<thead><tr style="color:#a78bfa;border-bottom:1px solid rgba(167,139,250,0.2);">';
        html += '<th style="padding:4px 6px;text-align:center;">#</th>';
        html += '<th style="padding:4px 6px;text-align:left;">玩家</th>';
        html += '<th style="padding:4px 6px;text-align:right;">点数</th>';
        html += '<th style="padding:4px 6px;text-align:center;font-size:11px;">时间</th>';
        html += '</tr></thead><tbody>';

        for (var i = 0; i < lbState.allRows.length; i++) {
            var row = lbState.allRows[i];
            var isMe = row.player_name === myName;
            var bg = isMe ? 'background:rgba(139,92,246,0.12);' : (i % 2 === 0 ? 'background:rgba(255,255,255,0.02);' : '');
            var medal = '';
            if (i === 0) medal = '<span style="color:#fbbf24;">🥇</span> ';
            else if (i === 1) medal = '<span style="color:#c0c0c0;">🥈</span> ';
            else if (i === 2) medal = '<span style="color:#cd7f32;">🥉</span> ';
            html += '<tr style="' + bg + 'border-bottom:1px solid rgba(255,255,255,0.03);">';
            html += '<td style="padding:4px 6px;text-align:center;">' + medal + (i + 1) + '</td>';
            html += '<td style="padding:4px 6px;text-align:left;' + (isMe ? 'color:#8b5cf6;font-weight:bold;' : '') + '">' + escHtml(row.player_name) + (isMe ? ' <span style="font-size:10px;color:#8b5cf6;">(你)</span>' : '') + '</td>';
            html += '<td style="padding:4px 6px;text-align:right;' + (isMe ? 'color:#8b5cf6;font-weight:bold;' : 'color:#34d399;') + '">' + row.rank_points + '</td>';
            html += '<td style="padding:4px 6px;text-align:center;font-size:11px;color:#6b7280;">' + formatLbTime(row.created_at) + '</td>';
            html += '</tr>';
        }

        // 加载更多按钮
        if (lbState.offset < total) {
            html += '<tr><td colspan="4" style="text-align:center;padding:8px;">';
            html +=   '<button id="lb-load-more" style="background:rgba(139,92,246,0.15);color:#c4b5fd;border:1px solid rgba(139,92,246,0.3);padding:6px 24px;border-radius:4px;cursor:pointer;font-size:13px;">加载更多 (已显示 ' + lbState.offset + ' / ' + total + ')</button>';
            html += '</td></tr>';
        }

        html += '</tbody></table>';
        container.innerHTML = html;

        // 加载更多事件
        var loadMore = document.getElementById('lb-load-more');
        if (loadMore) {
            loadMore.addEventListener('click', function() {
                renderLeaderboard(true);
            });
        }

        // 底部我的排名
        if (myRankEl) {
            renderMyRank(myRankEl, myName, total);
        }
    }).catch(function() {
        if (infoEl) infoEl.innerHTML = '<span style="color:#ef4444;">加载失败</span>';
        container.innerHTML = '<p style="text-align:center;color:#ef4444;font-size:13px;">加载失败，请检查网络</p>';
    });
}

function renderMyRank(el, myName, total) {
    getPlayerRank(myName).then(function(rankInfo) {
        if (!rankInfo || rankInfo.rank === null) {
            el.innerHTML = '<p style="text-align:center;color:#6b7280;font-size:12px;">你还未上榜，快来玩一局吧</p>';
            el.style.display = '';
            return;
        }
        el.innerHTML =
            '<div style="background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.25);border-radius:6px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;">' +
            '<span style="color:#a78bfa;font-size:12px;">我的排名</span>' +
            '<span style="color:#8b5cf6;font-weight:bold;font-size:16px;"># ' + rankInfo.rank + ' / ' + (rankInfo.total || total) + '</span>' +
            '</div>';
        el.style.display = '';
    }).catch(function() {
        el.style.display = 'none';
    });
}

