-- 直接イベント挿入をテストするSQLスクリプト

-- 1. まず、既存のデータを確認
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'organizer_profiles' as table_name, COUNT(*) as count FROM organizer_profiles
UNION ALL
SELECT 'events' as table_name, COUNT(*) as count FROM events;

-- 2. organizer_profilesテーブルにテストデータを作成（存在しない場合）
INSERT INTO organizer_profiles (id, user_id, organizer_name, contact_name, is_verified, verification_status)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM users LIMIT 1),
  'テスト主催者',
  'テスト連絡先',
  false,
  'not_submitted'
) ON CONFLICT DO NOTHING;

-- 3. eventsテーブルに直接テストデータを挿入
INSERT INTO events (
  organizer_profile_id,
  title,
  description,
  date,
  start_time,
  end_time,
  location,
  address,
  max_stores,
  fee,
  category,
  contact,
  is_public,
  status
) VALUES (
  (SELECT id FROM organizer_profiles LIMIT 1),
  'テストイベント',
  'テスト説明',
  '2024-12-31',
  '10:00:00',
  '18:00:00',
  'テスト会場',
  'テスト住所',
  10,
  1000,
  'テストカテゴリ',
  'テスト連絡先',
  true,
  'draft'
);

-- 4. 挿入結果を確認
SELECT COUNT(*) as event_count_after_insert FROM events;

-- 5. 挿入されたイベントの詳細を確認
SELECT id, title, organizer_profile_id, status, created_at FROM events ORDER BY created_at DESC LIMIT 1;
