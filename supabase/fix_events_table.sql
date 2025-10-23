-- eventsテーブルの問題を修正するSQLスクリプト

-- 1. 既存のeventsテーブルを削除
DROP TABLE IF EXISTS events CASCADE;

-- 2. 基本的なeventsテーブルを作成（RLS無効）
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
  requirements TEXT[],
  contact VARCHAR(255),
  is_public BOOLEAN DEFAULT TRUE,
  application_deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. インデックスを追加
CREATE INDEX idx_events_organizer ON events(organizer_profile_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);

-- 4. RLSを無効にする（テスト用）
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 5. 既存のポリシーを削除
DROP POLICY IF EXISTS "Organizers can manage their own events" ON events;
DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;

-- 6. organizer_profilesテーブルも確認・作成
CREATE TABLE IF NOT EXISTS organizer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organizer_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  postal_code VARCHAR(10),
  address TEXT,
  organization_type VARCHAR(100),
  description TEXT,
  website VARCHAR(255),
  instagram VARCHAR(255),
  twitter VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. organizer_profilesのRLSも無効にする
ALTER TABLE organizer_profiles DISABLE ROW LEVEL SECURITY;

-- 8. usersテーブルも確認・作成
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('store', 'organizer')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. usersテーブルのRLSも無効にする
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
