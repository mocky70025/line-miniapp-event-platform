-- ユーザー基本情報テーブル（店舗側・主催側共通）
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('store', 'organizer')),
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(10),
  age INTEGER,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 店舗側ユーザー詳細情報
CREATE TABLE store_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  genre VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 主催側ユーザー詳細情報
CREATE TABLE organizer_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 書類管理テーブル（店舗側）
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'business_license', 'vehicle_inspection', 'inspection_record', 'pl_insurance', 'fire_layout'
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- イベントテーブル
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES organizer_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  main_image_url VARCHAR(500),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  address TEXT,
  max_stores INTEGER,
  application_deadline DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- イベント申し込みテーブル
CREATE TABLE event_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  application_data JSONB, -- 申し込み時の追加情報
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, store_user_id)
);

-- 利用規約同意履歴
CREATE TABLE terms_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  terms_version VARCHAR(20) NOT NULL,
  agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- インデックス作成
CREATE INDEX idx_users_line_user_id ON users(line_user_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_applications_event ON event_applications(event_id);
CREATE INDEX idx_applications_store ON event_applications(store_user_id);

-- Row Level Security (RLS) 設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_agreements ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー例（基本的な設定）
-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = line_user_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = line_user_id);

-- イベントは公開されているものは誰でも閲覧可能
CREATE POLICY "Events are viewable when published" ON events
  FOR SELECT USING (status = 'published');

-- 主催者は自分のイベントを管理可能
CREATE POLICY "Organizers can manage own events" ON events
  FOR ALL USING (
    organizer_id IN (
      SELECT id FROM organizer_users 
      WHERE user_id IN (
        SELECT id FROM users WHERE line_user_id = auth.uid()::text
      )
    )
  );
