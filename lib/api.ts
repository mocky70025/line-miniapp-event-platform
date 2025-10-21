// API呼び出しのヘルパー関数
export class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-vercel-app.vercel.app' 
      : 'http://localhost:3000';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ユーザー関連
  async getUserByLineId(lineUserId: string) {
    return this.request(`/users?line_user_id=${lineUserId}`);
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, updates: any) {
    return this.request('/users', {
      method: 'PUT',
      body: JSON.stringify({ id: userId, ...updates }),
    });
  }

  // 店舗プロフィール関連
  async getStoreProfile(userId: string) {
    return this.request(`/store-profiles?user_id=${userId}`);
  }

  async createStoreProfile(profileData: any) {
    return this.request('/store-profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateStoreProfile(profileId: string, updates: any) {
    return this.request('/store-profiles', {
      method: 'PUT',
      body: JSON.stringify({ id: profileId, ...updates }),
    });
  }

  // 主催者プロフィール関連
  async getOrganizerProfile(userId: string) {
    return this.request(`/organizer-profiles?user_id=${userId}`);
  }

  async createOrganizerProfile(profileData: any) {
    return this.request('/organizer-profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateOrganizerProfile(profileId: string, updates: any) {
    return this.request('/organizer-profiles', {
      method: 'PUT',
      body: JSON.stringify({ id: profileId, ...updates }),
    });
  }

  // イベント関連
  async getPublishedEvents() {
    return this.request('/events');
  }

  async getEventById(eventId: string) {
    return this.request(`/events?id=${eventId}`);
  }

  async getEventsByOrganizer(organizerProfileId: string) {
    return this.request(`/events?organizer_profile_id=${organizerProfileId}`);
  }

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, updates: any) {
    return this.request('/events', {
      method: 'PUT',
      body: JSON.stringify({ id: eventId, ...updates }),
    });
  }

  // イベント申込関連
  async getEventApplications(eventId: string) {
    return this.request(`/event-applications?event_id=${eventId}`);
  }

  async getUserEventApplications(storeProfileId: string) {
    return this.request(`/event-applications?store_profile_id=${storeProfileId}`);
  }

  async createEventApplication(applicationData: any) {
    return this.request('/event-applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateEventApplication(applicationId: string, updates: any) {
    return this.request('/event-applications', {
      method: 'PUT',
      body: JSON.stringify({ id: applicationId, ...updates }),
    });
  }

  // 書類関連
  async getStoreDocuments(storeProfileId: string) {
    return this.request(`/store-documents?store_profile_id=${storeProfileId}`);
  }

  async uploadStoreDocument(documentData: any) {
    return this.request('/store-documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async getApplicationDocuments(applicationId: string) {
    return this.request(`/application-documents?application_id=${applicationId}`);
  }

  async uploadApplicationDocument(documentData: any) {
    return this.request('/application-documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }
}

export const apiService = new ApiService();
