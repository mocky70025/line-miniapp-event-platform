import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合はダミーのクライアントを作成
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : createClient('https://dummy.supabase.co', 'dummy-key');

// 型定義
export interface User {
  id: string;
  line_user_id: string;
  user_type: 'store' | 'organizer';
  name: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreProfile {
  id: string;
  user_id: string;
  store_name: string;
  contact_name: string;
  phone?: string;
  email?: string;
  postal_code?: string;
  address?: string;
  business_type?: string;
  description?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  business_license_url?: string;
  tax_certificate_url?: string;
  insurance_certificate_url?: string;
  product_photos_url?: string;
  is_verified: boolean;
  verification_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface OrganizerProfile {
  id: string;
  user_id: string;
  organizer_name: string;
  contact_name: string;
  phone?: string;
  email?: string;
  postal_code?: string;
  address?: string;
  organization_type?: string;
  description?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  is_verified: boolean;
  verification_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface StoreDocument {
  id: string;
  store_profile_id: string;
  document_type: 'business_license' | 'tax_certificate' | 'insurance_certificate' | 'product_photos';
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_profile_id: string;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  max_stores?: number;
  fee: number;
  category?: string;
  requirements?: string[];
  contact?: string;
  is_public: boolean;
  application_deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface EventApplication {
  id: string;
  event_id: string;
  store_profile_id: string;
  store_name: string;
  contact_name: string;
  phone?: string;
  email?: string;
  product_description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: 'business_license' | 'product_photos';
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

// データベース操作のヘルパー関数
export class SupabaseService {
  // ユーザー関連
  async getUserByLineId(lineUserId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('line_user_id', lineUserId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    return data;
  }

  // 店舗プロフィール関連
  async getStoreProfileByUserId(userId: string): Promise<StoreProfile | null> {
    const { data, error } = await supabase
      .from('store_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching store profile:', error);
      return null;
    }
    return data;
  }

  async createStoreProfile(profileData: Partial<StoreProfile>): Promise<StoreProfile | null> {
    const { data, error } = await supabase
      .from('store_profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error('Error creating store profile:', error);
      return null;
    }
    return data;
  }

  async updateStoreProfile(profileId: string, updates: Partial<StoreProfile>): Promise<StoreProfile | null> {
    const { data, error } = await supabase
      .from('store_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('Error updating store profile:', error);
      return null;
    }
    return data;
  }

  // 主催者プロフィール関連
  async getOrganizerProfileByUserId(userId: string): Promise<OrganizerProfile | null> {
    const { data, error } = await supabase
      .from('organizer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching organizer profile:', error);
      return null;
    }
    return data;
  }

  async createOrganizerProfile(profileData: Partial<OrganizerProfile>): Promise<OrganizerProfile | null> {
    const { data, error } = await supabase
      .from('organizer_profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error('Error creating organizer profile:', error);
      return null;
    }
    return data;
  }

  async updateOrganizerProfile(profileId: string, updates: Partial<OrganizerProfile>): Promise<OrganizerProfile | null> {
    const { data, error } = await supabase
      .from('organizer_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('Error updating organizer profile:', error);
      return null;
    }
    return data;
  }

  // 店舗書類関連
  async uploadStoreDocument(documentData: Partial<StoreDocument>): Promise<StoreDocument | null> {
    const { data, error } = await supabase
      .from('store_documents')
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error('Error uploading store document:', error);
      return null;
    }
    return data;
  }

  async getStoreDocuments(storeProfileId: string): Promise<StoreDocument[]> {
    const { data, error } = await supabase
      .from('store_documents')
      .select('*')
      .eq('store_profile_id', storeProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching store documents:', error);
      return [];
    }
    return data || [];
  }

  // イベント関連
  async getPublishedEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .eq('is_public', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    return data || [];
  }

  async getEventsByOrganizer(organizerProfileId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_profile_id', organizerProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizer events:', error);
      return [];
    }
    return data || [];
  }

  async createEvent(eventData: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }
    return data;
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return null;
    }
    return data;
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }
    return data;
  }

  // イベント申し込み関連
  async createEventApplication(applicationData: Partial<EventApplication>): Promise<EventApplication | null> {
    const { data, error } = await supabase
      .from('event_applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating event application:', error);
      return null;
    }
    return data;
  }

  async getEventApplications(eventId: string): Promise<EventApplication[]> {
    const { data, error } = await supabase
      .from('event_applications')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching event applications:', error);
      return [];
    }
    return data || [];
  }

  async updateEventApplication(applicationId: string, updates: Partial<EventApplication>): Promise<EventApplication | null> {
    const { data, error } = await supabase
      .from('event_applications')
      .update(updates)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event application:', error);
      return null;
    }
    return data;
  }

  async getUserEventApplications(storeProfileId: string): Promise<EventApplication[]> {
    const { data, error } = await supabase
      .from('event_applications')
      .select(`
        *,
        events (
          id,
          title,
          date,
          location
        )
      `)
      .eq('store_profile_id', storeProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user event applications:', error);
      return [];
    }
    return data || [];
  }

  // 申込書類関連
  async uploadApplicationDocument(documentData: Partial<ApplicationDocument>): Promise<ApplicationDocument | null> {
    const { data, error } = await supabase
      .from('application_documents')
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error('Error uploading application document:', error);
      return null;
    }
    return data;
  }

  async getApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]> {
    const { data, error } = await supabase
      .from('application_documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching application documents:', error);
      return [];
    }
    return data || [];
  }
}

export const supabaseService = new SupabaseService();