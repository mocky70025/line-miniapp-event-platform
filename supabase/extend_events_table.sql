-- イベントテーブルを拡張して詳細な情報を保存できるようにする

-- 基本情報フィールドを追加（既存のカラムをチェックしてから追加）
DO $$ 
BEGIN
    -- 基本情報フィールド
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_name_kana') THEN
        ALTER TABLE events ADD COLUMN event_name_kana VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_date') THEN
        ALTER TABLE events ADD COLUMN end_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'display_period') THEN
        ALTER TABLE events ADD COLUMN display_period VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'period_note') THEN
        ALTER TABLE events ADD COLUMN period_note TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'time') THEN
        ALTER TABLE events ADD COLUMN time VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'application_start_date') THEN
        ALTER TABLE events ADD COLUMN application_start_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'application_end_date') THEN
        ALTER TABLE events ADD COLUMN application_end_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'display_application_period') THEN
        ALTER TABLE events ADD COLUMN display_application_period VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'application_note') THEN
        ALTER TABLE events ADD COLUMN application_note TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'lead_text') THEN
        ALTER TABLE events ADD COLUMN lead_text TEXT;
    END IF;
END $$;

-- 会場・連絡先情報を追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_name') THEN
        ALTER TABLE events ADD COLUMN venue_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'postal_code') THEN
        ALTER TABLE events ADD COLUMN postal_code VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'city') THEN
        ALTER TABLE events ADD COLUMN city VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'town') THEN
        ALTER TABLE events ADD COLUMN town VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'street') THEN
        ALTER TABLE events ADD COLUMN street VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'latitude') THEN
        ALTER TABLE events ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'longitude') THEN
        ALTER TABLE events ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'homepage_url') THEN
        ALTER TABLE events ADD COLUMN homepage_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'related_url') THEN
        ALTER TABLE events ADD COLUMN related_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'contact_name') THEN
        ALTER TABLE events ADD COLUMN contact_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'phone') THEN
        ALTER TABLE events ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'email') THEN
        ALTER TABLE events ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'parking') THEN
        ALTER TABLE events ADD COLUMN parking TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'fee_text') THEN
        ALTER TABLE events ADD COLUMN fee_text TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer') THEN
        ALTER TABLE events ADD COLUMN organizer TEXT;
    END IF;
END $$;

-- 画像・その他情報を追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'supplement_text') THEN
        ALTER TABLE events ADD COLUMN supplement_text TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'main_image_url') THEN
        ALTER TABLE events ADD COLUMN main_image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'main_image_caption') THEN
        ALTER TABLE events ADD COLUMN main_image_caption VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'additional_image_urls') THEN
        ALTER TABLE events ADD COLUMN additional_image_urls TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'additional_image_captions') THEN
        ALTER TABLE events ADD COLUMN additional_image_captions TEXT[];
    END IF;
END $$;

-- 既存のフィールド名を統一（必要に応じて）
-- title -> event_name に変更したい場合は以下をコメントアウト
-- ALTER TABLE events RENAME COLUMN title TO event_name;

-- インデックスを追加（パフォーマンス向上）
-- 既存のインデックスをチェックしてから作成
CREATE INDEX IF NOT EXISTS idx_events_genre ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_profile_id);
