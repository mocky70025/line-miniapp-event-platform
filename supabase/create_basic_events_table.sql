-- 基本的なeventsテーブルを作成するSQLスクリプト

-- 既存のeventsテーブルがある場合は削除（注意：データが失われます）
DROP TABLE IF EXISTS events CASCADE;

-- 基本的なeventsテーブルを作成
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_profile_id UUID REFERENCES organizer_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  address TEXT,
  max_stores INTEGER,
  fee INTEGER DEFAULT 0,
  category VARCHAR(50),
  requirements TEXT[], -- 必要書類の配列
  contact VARCHAR(255),
  is_public BOOLEAN DEFAULT TRUE,
  application_deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを追加
CREATE INDEX idx_events_organizer ON events(organizer_profile_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);

-- RLSポリシーを設定
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 主催者は自分のイベントを全て操作できる
CREATE POLICY "Organizers can manage their own events" ON events
FOR ALL USING (
  organizer_profile_id IN (
    SELECT id FROM organizer_profiles WHERE user_id = auth.uid()
  )
);

-- 公開されたイベントは誰でも閲覧可能
CREATE POLICY "Public events are viewable by everyone" ON events
FOR SELECT USING (is_public = true AND status = 'published');
