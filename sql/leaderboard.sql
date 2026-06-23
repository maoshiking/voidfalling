-- ==========================================
-- 虚空坠落 - 排行榜数据库表（总榜版）
-- 无难度区分，每个玩家只保留一条最高分
-- 在 Supabase SQL Editor 执行
-- ==========================================

-- 1. 删旧表重建（旧数据不要了）
DROP TABLE IF EXISTS leaderboard;

CREATE TABLE leaderboard (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    player_name TEXT NOT NULL UNIQUE,
    rank_points INT NOT NULL CHECK (rank_points >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 索引：按点数降序查询快
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard (rank_points DESC);

-- 3. 开启行级安全
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略
DROP POLICY IF EXISTS "任何人都能查排行榜" ON leaderboard;
DROP POLICY IF EXISTS "任何人都能提交分数" ON leaderboard;
DROP POLICY IF EXISTS "任何人都能更新分数" ON leaderboard;

CREATE POLICY "任何人都能查排行榜"
    ON leaderboard FOR SELECT
    USING (true);

CREATE POLICY "任何人都能提交分数"
    ON leaderboard FOR INSERT
    WITH CHECK (true);

CREATE POLICY "任何人都能更新分数"
    ON leaderboard FOR UPDATE
    USING (true)
    WITH CHECK (true);
