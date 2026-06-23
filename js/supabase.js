// ==================== Supabase 排行榜客户端 ====================
// 通过 REST API 直连，无需 SDK
var SUPABASE_URL = 'https://lxnqunzyqlgvexvvxxkv.supabase.co';
var SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bnF1bnp5cWxndmV4dnZ4eGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTAyNzgsImV4cCI6MjA5NzU2NjI3OH0.HUW6QoPv_QGOM4bWBuQ-U9BFo0eVDjM_gxMQk4r47iY';

async function supabaseFetch(path, options) {
    var url = SUPABASE_URL + '/rest/v1/' + path;
    var headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    };
    if (options && options.headers) {
        for (var k in options.headers) headers[k] = options.headers[k];
    }
    var res = await fetch(url, {
        method: options && options.method || 'GET',
        headers: headers,
        body: options && options.body
    });
    if (!res.ok) {
        var text = await res.text();
        console.error('[Supabase]', res.status, text);
        throw new Error('Supabase error: ' + res.status);
    }
    var contentType = res.headers.get('content-type') || '';
    if (contentType.indexOf('json') !== -1) {
        var data = await res.json();
        // 从 content-range 头读取总记录数
        var total = null;
        var cr = res.headers.get('content-range');
        if (cr) {
            var m = cr.match(/\/(\d+)$/);
            if (m) total = parseInt(m[1]);
        }
        return { data: data, total: total };
    }
    return { data: null, total: null };
}

// ---- 上传分数（UPSERT：存在则更新更高分，不存在则插入） ----
async function submitScore(playerName, rankPoints) {
    await supabaseFetch(
        'leaderboard?on_conflict=player_name',
        {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({
                player_name: playerName,
                rank_points: rankPoints
            })
        }
    );
}

// ---- 拉取排行榜（分页） ----
async function getLeaderboard(limit, offset) {
    if (!limit) limit = 50;
    if (!offset) offset = 0;
    var result = await supabaseFetch(
        'leaderboard?select=*&order=rank_points.desc&limit=' + limit,
        {
            headers: {
                'Prefer': 'count=exact',
                'Range': offset + '-' + (offset + limit - 1)
            }
        }
    );
    return result; // { data: [...], total: number }
}

// ---- 获取总人数 ----
async function getLeaderboardCount() {
    return await supabaseFetch(
        'leaderboard?select=rank_points&limit=0',
        { headers: { 'Prefer': 'count=exact' } }
    );
}

// ---- 查自己的排名（以及总人数） ----
async function getPlayerRank(playerName) {
    var result = await supabaseFetch(
        'leaderboard?select=player_name,rank_points&order=rank_points.desc&limit=1000',
        { headers: { 'Prefer': 'count=exact' } }
    );
    if (!result || !result.data) return { rank: null, total: result && result.total || 0 };
    for (var i = 0; i < result.data.length; i++) {
        if (result.data[i].player_name === playerName) {
            return { rank: i + 1, total: result.total || result.data.length };
        }
    }
    return { rank: null, total: result.total || result.data.length };
}
