-- データベースのテーブル構造を確認するSQLスクリプト

-- 1. すべてのテーブルを確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. eventsテーブルの構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- 3. organizer_profilesテーブルの構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'organizer_profiles'
ORDER BY ordinal_position;

-- 4. store_profilesテーブルの構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'store_profiles'
ORDER BY ordinal_position;

-- 5. usersテーブルの構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 6. eventsテーブルのRLS状況を確認
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'events';

-- 7. organizer_profilesテーブルのRLS状況を確認
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'organizer_profiles';

-- 8. 既存のデータを確認
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as organizer_profile_count FROM organizer_profiles;
SELECT COUNT(*) as store_profile_count FROM store_profiles;
SELECT COUNT(*) as event_count FROM events;
