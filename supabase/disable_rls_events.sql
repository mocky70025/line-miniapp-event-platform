-- eventsテーブルのRLSを無効にする（テスト用）

-- eventsテーブルのRLSを無効にする
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- organizer_profilesテーブルのRLSも無効にする
ALTER TABLE organizer_profiles DISABLE ROW LEVEL SECURITY;

-- usersテーブルのRLSも無効にする
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Organizers can manage their own events" ON events;
DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Users can manage their own organizer profiles" ON organizer_profiles;
DROP POLICY IF EXISTS "Users can manage their own user records" ON users;

-- 確認用クエリ
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('events', 'organizer_profiles', 'users')
ORDER BY tablename;
