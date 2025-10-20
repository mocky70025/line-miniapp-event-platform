// ユーザー関連の型定義
export interface User {
  id: string;
  line_user_id: string;
  user_type: 'store' | 'organizer';
  name: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreUser {
  id: string;
  user_id: string;
  genre?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizerUser {
  id: string;
  user_id: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

// 書類関連の型定義
export type DocumentType = 
  | 'business_license'     // 営業許可証
  | 'vehicle_inspection'   // 車検証
  | 'inspection_record'    // 自動車検査証記録事項
  | 'pl_insurance'         // PL保険
  | 'fire_layout';         // 火気類配置図

export interface Document {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  ai_processed: boolean;
  ai_extracted_data?: DocumentAIData;
  created_at: string;
  updated_at: string;
}

export interface DocumentAIData {
  extracted_text?: string;
  validity?: {
    is_valid: boolean;
    expiration_date?: string;
    issues?: string[];
  };
  confidence_score?: number;
  metadata?: Record<string, any>;
}

// イベント関連の型定義
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description?: string;
  main_image_url?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  max_stores?: number;
  application_deadline?: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface EventApplication {
  id: string;
  event_id: string;
  store_user_id: string;
  status: ApplicationStatus;
  application_data?: EventApplicationData;
  created_at: string;
  updated_at: string;
}

export interface EventApplicationData {
  booth_size?: string;
  special_requirements?: string;
  equipment_needed?: string[];
  additional_info?: string;
}

// フォーム関連の型定義
export interface UserRegistrationForm {
  name: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  phone: string;
  email: string;
  user_type: 'store' | 'organizer';
  // 店舗側の場合
  genre?: string;
  // 主催側の場合
  company_name?: string;
}

export interface DocumentUploadForm {
  document_type: DocumentType;
  file: File;
}

export interface EventCreationForm {
  title: string;
  description: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  max_stores?: number;
  application_deadline?: string;
  main_image?: File;
}

// API関連の型定義
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// LIFF関連の型定義
export interface LiffUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// 認証関連の型定義
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  liffUser: LiffUser | null;
  isLoading: boolean;
}

// ナビゲーション関連の型定義
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  userTypes?: ('store' | 'organizer')[];
}

// エラー関連の型定義
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// 通知関連の型定義
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 設定関連の型定義
export interface AppSettings {
  version: string;
  terms_version: string;
  privacy_version: string;
  maintenance_mode: boolean;
  features: {
    ai_document_processing: boolean;
    event_application_auto_approval: boolean;
    push_notifications: boolean;
  };
}
