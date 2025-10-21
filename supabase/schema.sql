-- ユーザー基本情報テーブル（店舗側・主催側共通）
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('store', 'organizer')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 店舗側ユーザー詳細情報
CREATE TABLE store_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  business_type VARCHAR(100),
  description TEXT,
  website VARCHAR(500),
  instagram VARCHAR(100),
  twitter VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 主催側ユーザー詳細情報
CREATE TABLE organizer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organizer_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  organization_type VARCHAR(50),
  description TEXT,
  website VARCHAR(500),
  instagram VARCHAR(100),
  twitter VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 書類管理テーブル（店舗側）
CREATE TABLE store_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_profile_id UUID REFERENCES store_profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'business_license', 'tax_certificate', 'insurance_certificate', 'product_photos'
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 申込書類管理テーブル
CREATE TABLE application_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES event_applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'business_license', 'product_photos', 'other'
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- イベントテーブル
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

-- イベント申し込みテーブル
CREATE TABLE event_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  store_profile_id UUID REFERENCES store_profiles(id) ON DELETE CASCADE,
  store_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  product_description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, store_profile_id)
);

-- 申込書類テーブル
CREATE TABLE application_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES event_applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'business_license', 'product_photos'
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX idx_store_profiles_user_id ON store_profiles(user_id);
CREATE INDEX idx_organizer_profiles_user_id ON organizer_profiles(user_id);
CREATE INDEX idx_store_documents_profile_id ON store_documents(store_profile_id);
CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX idx_events_organizer ON events(organizer_profile_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_public ON events(is_public);
CREATE INDEX idx_applications_event ON event_applications(event_id);
CREATE INDEX idx_applications_store ON event_applications(store_profile_id);
CREATE INDEX idx_application_documents_app ON application_documents(application_id);

-- Row Level Security (RLS) 設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_agreements ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー
-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = line_user_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = line_user_id);

-- 店舗プロフィール
CREATE POLICY "Store profiles can view own data" ON store_profiles
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE line_user_id = auth.uid()::text)
  );

CREATE POLICY "Store profiles can update own data" ON store_profiles
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE line_user_id = auth.uid()::text)
  );

-- 主催者プロフィール
CREATE POLICY "Organizer profiles can view own data" ON organizer_profiles
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE line_user_id = auth.uid()::text)
  );

CREATE POLICY "Organizer profiles can update own data" ON organizer_profiles
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE line_user_id = auth.uid()::text)
  );

-- 店舗書類
CREATE POLICY "Store documents can view own data" ON store_documents
  FOR SELECT USING (
    store_profile_id IN (
      SELECT id FROM store_profiles 
      WHERE user_id IN (
        SELECT id FROM users WHERE line_user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Store documents can manage own data" ON store_documents
  FOR ALL USING (
    store_profile_id IN (
      SELECT id FROM store_profiles 
      WHERE user_id IN (
        SELECT id FROM users WHERE line_user_id = auth.uid()::text
      )
    )
  );

-- 申込書類
CREATE POLICY "Application documents can view own data" ON application_documents
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM event_applications 
      WHERE store_profile_id IN (
        SELECT id FROM store_profiles 
        WHERE user_id IN (
          SELECT id FROM users WHERE line_user_id = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Application documents can manage own data" ON application_documents
  FOR ALL USING (
    application_id IN (
      SELECT id FROM event_applications 
      WHERE store_profile_id IN (
        SELECT id FROM store_profiles 
        WHERE user_id IN (
          SELECT id FROM users WHERE line_user_id = auth.uid()::text
        )
      )
    )
  );

-- イベントは公開されているものは誰でも閲覧可能
CREATE POLICY "Events are viewable when published" ON events
  FOR SELECT USING (status = 'published' AND is_public = true);

-- 主催者は自分のイベントを管理可能
CREATE POLICY "Organizers can manage own events" ON events
  FOR ALL USING (
    organizer_profile_id IN (
      SELECT id FROM organizer_profiles 
      WHERE user_id IN (
        SELECT id FROM users WHERE line_user_id = auth.uid()::text
      )
    )
  );

-- 申込は関連するユーザーが閲覧可能
CREATE POLICY "Applications are viewable by related users" ON event_applications
  FOR SELECT USING (
    store_profile_id IN (
      SELECT id FROM store_profiles 
      WHERE user_id IN (
        SELECT id FROM users WHERE line_user_id = auth.uid()::text
      )
    ) OR
    event_id IN (
      SELECT id FROM events 
      WHERE organizer_profile_id IN (
        SELECT id FROM organizer_profiles 
        WHERE user_id IN (
          SELECT id FROM users WHERE line_user_id = auth.uid()::text
        )
      )
    )
  );

-- 申込の作成・更新
CREATE POLICY "Store users can create applications" ON event_applications
  FOR INSERT WITH CHECK (
    store_profile_id IN (
      SELECT id FROM store_profiles 
      WHERE user_id IN (
        SELECT id FROM users WHERE line_user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Organizers can update applications" ON event_applications
  FOR UPDATE USING (
    event_id IN (
      SELECT id FROM events 
      WHERE organizer_profile_id IN (
        SELECT id FROM organizer_profiles 
        WHERE user_id IN (
          SELECT id FROM users WHERE line_user_id = auth.uid()::text
        )
      )
    )
  );