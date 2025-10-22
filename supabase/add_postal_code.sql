-- store_profilesテーブルにpostal_codeカラムを追加
ALTER TABLE store_profiles ADD COLUMN postal_code VARCHAR(10);

-- organizer_profilesテーブルにもpostal_codeカラムを追加
ALTER TABLE organizer_profiles ADD COLUMN postal_code VARCHAR(10);

-- 確認用のクエリ
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'store_profiles' 
AND column_name = 'postal_code';
