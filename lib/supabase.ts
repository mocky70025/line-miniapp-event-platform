import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合はダミーのクライアントを作成
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://dummy.supabase.co', 'dummy-key');

// 型定義
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

export interface Document {
  id: string;
  user_id: string;
  document_type: 'business_license' | 'vehicle_inspection' | 'inspection_record' | 'pl_insurance' | 'fire_layout';
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  ai_processed: boolean;
  ai_extracted_data?: any;
  created_at: string;
  updated_at: string;
}

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
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface EventApplication {
  id: string;
  event_id: string;
  store_user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  application_data?: any;
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

  // 店舗ユーザー関連
  async createStoreUser(storeUserData: Partial<StoreUser>): Promise<StoreUser | null> {
    const { data, error } = await supabase
      .from('store_users')
      .insert([storeUserData])
      .select()
      .single();

    if (error) {
      console.error('Error creating store user:', error);
      return null;
    }
    return data;
  }

  async getStoreUserByUserId(userId: string): Promise<StoreUser | null> {
    const { data, error } = await supabase
      .from('store_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching store user:', error);
      return null;
    }
    return data;
  }

  // 主催ユーザー関連
  async createOrganizerUser(organizerUserData: Partial<OrganizerUser>): Promise<OrganizerUser | null> {
    const { data, error } = await supabase
      .from('organizer_users')
      .insert([organizerUserData])
      .select()
      .single();

    if (error) {
      console.error('Error creating organizer user:', error);
      return null;
    }
    return data;
  }

  async getOrganizerUserByUserId(userId: string): Promise<OrganizerUser | null> {
    const { data, error } = await supabase
      .from('organizer_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching organizer user:', error);
      return null;
    }
    return data;
  }

  // 書類関連
  async uploadDocument(documentData: Partial<Document>): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error('Error uploading document:', error);
      return null;
    }
    return data;
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    return data || [];
  }

  async updateDocumentAIProcessing(documentId: string, aiData: any): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ai_processed: true,
        ai_extracted_data: aiData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating document AI processing:', error);
      return null;
    }
    return data;
  }

  // イベント関連
  async getPublishedEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
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

  async getUserEventApplications(storeUserId: string): Promise<EventApplication[]> {
    const { data, error } = await supabase
      .from('event_applications')
      .select(`
        *,
        events (
          id,
          title,
          event_date,
          location
        )
      `)
      .eq('store_user_id', storeUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching event applications:', error);
      return [];
    }
    return data || [];
  }

  async getEventApplications(eventId: string): Promise<EventApplication[]> {
    const { data, error } = await supabase
      .from('event_applications')
      .select(`
        *,
        store_users (
          id,
          user_id,
          users (
            name,
            phone,
            email
          )
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching event applications:', error);
      return [];
    }
    return data || [];
  }

  // 利用規約同意
  async recordTermsAgreement(userId: string, termsVersion: string, ipAddress?: string): Promise<boolean> {
    const { error } = await supabase
      .from('terms_agreements')
      .insert([{
        user_id: userId,
        terms_version: termsVersion,
        ip_address: ipAddress,
      }]);

    if (error) {
      console.error('Error recording terms agreement:', error);
      return false;
    }
    return true;
  }
}

export const supabaseService = new SupabaseService();
