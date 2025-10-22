import liff from '@line/liff';

export interface LiffUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

class LiffManager {
  private isInitialized = false;
  private user: LiffUser | null = null;
  private userType: 'store' | 'organizer' | null = null;

  async init(userType: 'store' | 'organizer' = 'store'): Promise<boolean> {
    // 異なるuserTypeの場合は再初期化する
    if (this.isInitialized && this.userType !== userType) {
      this.isInitialized = false;
      this.userType = null;
      this.user = null;
    }
    
    if (this.isInitialized && this.userType === userType) return true;

    try {
      const liffId = userType === 'store' 
        ? process.env.NEXT_PUBLIC_LIFF_ID_STORE
        : process.env.NEXT_PUBLIC_LIFF_ID_ORGANIZER;
      
      console.log('LIFF ID:', liffId);
      console.log('User Type:', userType);
      
      if (!liffId || liffId === 'your_store_liff_id_here' || liffId === 'your_organizer_liff_id_here') {
        console.warn('LIFF ID is not properly configured for user type:', userType);
        console.warn('Please set the environment variables:');
        console.warn('- NEXT_PUBLIC_LIFF_ID_STORE');
        console.warn('- NEXT_PUBLIC_LIFF_ID_ORGANIZER');
        return false;
      }
      
      await liff.init({ liffId });
      this.isInitialized = true;
      this.userType = userType;

      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        this.user = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
        };
      }

      return true;
    } catch (error) {
      console.error('LIFF initialization failed:', error);
      return false;
    }
  }

  async login(userType: 'store' | 'organizer' = 'store'): Promise<void> {
    if (!this.isInitialized || this.userType !== userType) {
      await this.init(userType);
    }

    if (!liff.isLoggedIn()) {
      liff.login();
    }
  }

  async logout(): Promise<void> {
    if (liff.isLoggedIn()) {
      liff.logout();
      this.user = null;
    }
  }

  isLoggedIn(): boolean {
    return this.isInitialized && liff.isLoggedIn();
  }

  getUser(): LiffUser | null {
    return this.user;
  }

  getUserProfile(): Promise<LiffUser> {
    return liff.getProfile().then(profile => ({
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    }));
  }

  getAccessToken(): string | null {
    return liff.getAccessToken();
  }

  isInClient(): boolean {
    return liff.isInClient();
  }

  getOS(): string {
    return liff.getOS() || 'unknown';
  }

  getVersion(): string {
    return liff.getVersion() || 'unknown';
  }

  // LINEトークンを使った認証
  async getIDToken(): Promise<string | null> {
    try {
      return await liff.getIDToken();
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  }

  // 外部ブラウザで開く
  openWindow(url: string): void {
    liff.openWindow({
      url,
      external: true,
    });
  }

  // メッセージ送信
  async sendMessages(messages: any[]): Promise<void> {
    if (!liff.isInClient()) {
      throw new Error('sendMessages can only be called in LINE client');
    }
    
    await liff.sendMessages(messages);
  }

  // プロフィール情報の取得（フレンド情報含む）
  async getFriendship(): Promise<{ friendFlag: boolean }> {
    return liff.getFriendship();
  }

  // スキャンコード
  async scanCode(): Promise<string> {
    if (!liff.isInClient()) {
      throw new Error('scanCode can only be called in LINE client');
    }
    // scanCodeメソッドが利用可能かチェック
    if (typeof liff.scanCode === 'function') {
      const result = await liff.scanCode();
      return result.value || '';
    }
    throw new Error('scanCode is not available');
  }

  // プロフィールをLINEで共有
  async shareTargetPicker(messages: any[]): Promise<void> {
    if (!liff.isInClient()) {
      throw new Error('shareTargetPicker can only be called in LINE client');
    }
    await liff.shareTargetPicker(messages);
  }
}

export const liffManager = new LiffManager();
export default liffManager;
