-- イベントテーブルを拡張して詳細な情報を保存できるようにする

-- 基本情報フィールドを追加
ALTER TABLE events 
ADD COLUMN event_name_kana VARCHAR(255),
ADD COLUMN end_date DATE,
ADD COLUMN display_period VARCHAR(255),
ADD COLUMN period_note TEXT,
ADD COLUMN time VARCHAR(100),
ADD COLUMN application_start_date DATE,
ADD COLUMN application_end_date DATE,
ADD COLUMN display_application_period VARCHAR(255),
ADD COLUMN application_note TEXT,
ADD COLUMN lead_text TEXT;

-- 会場・連絡先情報を追加
ALTER TABLE events 
ADD COLUMN venue_name VARCHAR(255),
ADD COLUMN postal_code VARCHAR(10),
ADD COLUMN city VARCHAR(100),
ADD COLUMN town VARCHAR(100),
ADD COLUMN street VARCHAR(100),
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN homepage_url TEXT,
ADD COLUMN related_url TEXT,
ADD COLUMN contact_name VARCHAR(255),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN email VARCHAR(255),
ADD COLUMN parking TEXT,
ADD COLUMN fee_text TEXT,
ADD COLUMN organizer TEXT;

-- 画像・その他情報を追加
ALTER TABLE events 
ADD COLUMN supplement_text TEXT,
ADD COLUMN main_image_url TEXT,
ADD COLUMN main_image_caption VARCHAR(255),
ADD COLUMN additional_image_urls TEXT[],
ADD COLUMN additional_image_captions TEXT[];

-- 既存のフィールド名を統一（必要に応じて）
-- title -> event_name に変更したい場合は以下をコメントアウト
-- ALTER TABLE events RENAME COLUMN title TO event_name;

-- インデックスを追加（パフォーマンス向上）
-- 既存のインデックスをチェックしてから作成
CREATE INDEX IF NOT EXISTS idx_events_genre ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_profile_id);
