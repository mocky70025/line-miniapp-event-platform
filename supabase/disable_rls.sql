-- RLSを一時的に無効化するスクリプト
-- プロフィール登録を可能にするため

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE terms_agreements DISABLE ROW LEVEL SECURITY;

-- 確認用のクエリ
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'store_profiles', 'organizer_profiles', 'events', 'event_applications');
