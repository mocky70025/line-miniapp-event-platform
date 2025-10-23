-- eventsテーブルの構造を確認するクエリ

-- テーブルが存在するかチェック
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'events'
) as table_exists;

-- eventsテーブルのカラム一覧を表示
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- eventsテーブルの制約を表示
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'events' 
AND table_schema = 'public';
