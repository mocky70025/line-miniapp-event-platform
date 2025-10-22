'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';
import { apiService } from '@/lib/api';
import { StoreProfile } from '@/lib/supabase';

export default function StoreProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ローカル状態
  const [localProfile, setLocalProfile] = useState({
    storeName: '',
    contactName: '',
    phone: '',
    email: '',
    postalCode: '',
    address: '',
    businessType: '',
    description: '',
    website: '',
    instagram: '',
    twitter: '',
    documents: {
      businessLicense: null as File | null,
      taxCertificate: null as File | null,
      insuranceCertificate: null as File | null,
      productPhotos: null as File | null
    }
  });

  useEffect(() => {
    const initLiff = async () => {
      try {
        const success = await liffManager.init('store');
        if (success && liffManager.isLoggedIn()) {
          const liffUser = await liffManager.getUserProfile();
          setUser(liffUser);
          setIsLoggedIn(true);
          
          // LIFF初期化が成功したらプロフィールを読み込む
          await loadProfile();
        } else if (success) {
          // LIFF初期化は成功したがログインしていない
          console.log('LIFF initialized but not logged in');
          setLoading(false);
        } else {
          // LIFF初期化に失敗
          console.error('LIFF initialization failed');
          setError('LIFF初期化に失敗しました');
          setLoading(false);
        }
      } catch (error) {
        console.error('LIFF初期化エラー:', error);
        setError('LIFF初期化エラーが発生しました');
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const liffUser = await liffManager.getUserProfile();
      
      // まずユーザーを取得または作成
      let user: any;
      try {
        user = await apiService.getUserByLineId(liffUser.userId);
      } catch (err) {
        // ユーザーが存在しない場合は作成
        user = await apiService.createUser({
          line_user_id: liffUser.userId,
          user_type: 'store',
          name: liffUser.displayName,
        });
      }

      // 店舗プロフィールを取得
      try {
        const storeProfile = await apiService.getStoreProfile(user.id) as StoreProfile;
        setProfile(storeProfile);
      } catch (err) {
        // プロフィールが存在しない場合は空の状態
        setProfile(null);
      }
    } catch (err) {
      console.error('Error loading store profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // プロフィールデータをローカル状態に反映
  useEffect(() => {
    if (profile) {
      setLocalProfile(prev => ({
        ...prev,
        storeName: profile.store_name || '',
        contactName: profile.contact_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        postalCode: profile.postal_code || '',
        address: profile.address || '',
        businessType: profile.business_type || '',
        description: profile.description || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        twitter: profile.twitter || '',
      }));
    }
  }, [profile]);

  const saveProfile = async (profileData: Partial<StoreProfile>) => {
    try {
      setError(null);

      const liffUser = await liffManager.getUserProfile();
      const user: any = await apiService.getUserByLineId(liffUser.userId);

      let savedProfile: StoreProfile;
      if (profile?.id) {
        // 既存のプロフィールを更新
        savedProfile = await apiService.updateStoreProfile(profile.id, profileData) as StoreProfile;
      } else {
        // 新しいプロフィールを作成
        savedProfile = await apiService.createStoreProfile({
          user_id: user.id,
          ...profileData,
        }) as StoreProfile;
      }

      setProfile(savedProfile);
      return savedProfile;
    } catch (err) {
      console.error('Error saving store profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // 郵便番号から住所を取得する関数
  const handlePostalCodeChange = async () => {
    const postalCode = localProfile.postalCode?.replace(/[^\d]/g, '');
    if (postalCode && postalCode.length === 7) {
      try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
        const data = await response.json();
        
        if (data.status === 200 && data.results && data.results.length > 0) {
          const result = data.results[0];
          const address = `${result.address1}${result.address2}${result.address3}`;
          setLocalProfile(prev => ({
            ...prev,
            address: address
          }));
        }
      } catch (error) {
        console.error('郵便番号検索エラー:', error);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await saveProfile({
        store_name: localProfile.storeName,
        contact_name: localProfile.contactName,
        phone: localProfile.phone,
        email: localProfile.email,
        postal_code: localProfile.postalCode,
        address: localProfile.address,
        business_type: localProfile.businessType,
        description: localProfile.description,
        website: localProfile.website,
        instagram: localProfile.instagram,
        twitter: localProfile.twitter,
      });
      
      alert('プロフィールを保存しました！');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentUpload = (documentType: keyof typeof localProfile.documents) => {
    return (file: File | null) => {
      setLocalProfile(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));
    };
  };

  const handleSubmitForVerification = async () => {
    // 必須書類のチェック
    const requiredDocs = ['businessLicense', 'taxCertificate'];
    const missingDocs = requiredDocs.filter(doc => !localProfile.documents[doc as keyof typeof localProfile.documents]);
    
    if (missingDocs.length > 0) {
      alert('必須書類が不足しています。営業許可証と納税証明書をアップロードしてください。');
      return;
    }

    try {
      setIsSaving(true);
      await saveProfile({
        verification_status: 'pending'
      });
      
      alert('認証申請を送信しました。審査結果は数営業日以内にお知らせします。');
    } catch (error) {
      console.error('認証申請エラー:', error);
      alert('認証申請に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const getVerificationStatusText = () => {
    if (!profile) return { text: '不明', color: 'text-gray-600', bg: 'bg-gray-100' };
    
    switch (profile.verification_status) {
      case 'not_submitted':
        return { text: '未申請', color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'pending':
        return { text: '審査中', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'approved':
        return { text: '認証済み', color: 'text-green-600', bg: 'bg-green-100' };
      case 'rejected':
        return { text: '認証拒否', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { text: '不明', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <p className="text-gray-600 mb-6">
            プロフィール設定を行うには、LINEアカウントでログインしてください。
          </p>
          <p className="text-sm text-gray-500 mb-4">
            環境変数が設定されていない場合は、設定画面で設定してください。
          </p>
          <Button onClick={() => liffManager.login('store')} className="w-full">
            LINEでログイン
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            戻る
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">プロフィール設定</h1>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSave(e);
      }} className="space-y-6">
        {/* 基本情報 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">店舗名 *</label>
              <Input
                value={localProfile.storeName}
                onChange={(e) => setLocalProfile({...localProfile, storeName: e.target.value})}
                placeholder="店舗名を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">担当者名 *</label>
              <Input
                value={localProfile.contactName}
                onChange={(e) => setLocalProfile({...localProfile, contactName: e.target.value})}
                placeholder="担当者名を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">電話番号 *</label>
              <Input
                value={localProfile.phone}
                onChange={(e) => setLocalProfile({...localProfile, phone: e.target.value})}
                placeholder="090-1234-5678"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">メールアドレス *</label>
              <Input
                type="email"
                value={localProfile.email}
                onChange={(e) => setLocalProfile({...localProfile, email: e.target.value})}
                placeholder="example@email.com"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">郵便番号</label>
              <Input
                value={localProfile.postalCode || ''}
                onChange={(e) => setLocalProfile({...localProfile, postalCode: e.target.value})}
                placeholder="123-4567"
                className="placeholder:text-gray-400"
                maxLength={8}
                onBlur={handlePostalCodeChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">住所 *</label>
              <Input
                value={localProfile.address}
                onChange={(e) => setLocalProfile({...localProfile, address: e.target.value})}
                placeholder="東京都渋谷区道玄坂1-2-3"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">業種 *</label>
              <Input
                value={localProfile.businessType}
                onChange={(e) => setLocalProfile({...localProfile, businessType: e.target.value})}
                placeholder="例: ハンドメイドアクセサリー、食品販売"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">店舗説明 *</label>
              <textarea
                value={localProfile.description}
                onChange={(e) => setLocalProfile({...localProfile, description: e.target.value})}
                placeholder="店舗や商品について詳しく説明してください"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none placeholder:text-gray-400"
                required
              />
            </div>
          </div>
        </Card>

        {/* SNS・ウェブサイト */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">SNS・ウェブサイト</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ウェブサイト</label>
              <Input
                value={localProfile.website}
                onChange={(e) => setLocalProfile({...localProfile, website: e.target.value})}
                placeholder="https://example.com"
                className="placeholder:text-gray-400"
                type="url"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <Input
                value={localProfile.instagram}
                onChange={(e) => setLocalProfile({...localProfile, instagram: e.target.value})}
                placeholder="@username"
                className="placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">X (旧Twitter)</label>
              <Input
                value={localProfile.twitter}
                onChange={(e) => setLocalProfile({...localProfile, twitter: e.target.value})}
                placeholder="@username"
                className="placeholder:text-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* 書類アップロード */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">必要書類</h2>
          <div className="space-y-4">
            <DocumentUpload
              title="営業許可証"
              description="営業許可証のコピーをアップロードしてください"
              required={true}
              onUpload={handleDocumentUpload('businessLicense')}
              uploadedFile={localProfile.documents.businessLicense}
              isUploading={isSaving}
            />
            
            <DocumentUpload
              title="納税証明書"
              description="最新の納税証明書をアップロードしてください"
              required={true}
              onUpload={handleDocumentUpload('taxCertificate')}
              uploadedFile={localProfile.documents.taxCertificate}
              isUploading={isSaving}
            />
            
            <DocumentUpload
              title="保険加入証明書"
              description="商品賠償責任保険などの加入証明書（任意）"
              required={false}
              onUpload={handleDocumentUpload('insuranceCertificate')}
              uploadedFile={localProfile.documents.insuranceCertificate}
              isUploading={isSaving}
            />
            
            <DocumentUpload
              title="商品写真"
              description="販売予定の商品写真（3枚以上、任意）"
              required={false}
              acceptedTypes={['image/*']}
              onUpload={handleDocumentUpload('productPhotos')}
              uploadedFile={localProfile.documents.productPhotos}
              isUploading={isSaving}
            />
          </div>
        </Card>

        {/* 認証状況 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">認証状況</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${profile?.is_verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="font-medium">認証ステータス</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusText().bg} ${getVerificationStatusText().color}`}>
                {getVerificationStatusText().text}
              </span>
            </div>
            
            {profile?.verification_status === 'not_submitted' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  認証を受けることで、より多くのイベントに参加できるようになります。
                </p>
                <Button
                  onClick={handleSubmitForVerification}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? '申請中...' : '認証申請を送信'}
                </Button>
              </div>
            )}
            
            {profile?.verification_status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  認証申請を審査中です。結果は数営業日以内にお知らせします。
                </p>
              </div>
            )}
            
            {profile?.verification_status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  認証が完了しました！すべてのイベントに参加できます。
                </p>
              </div>
            )}
            
            {profile?.verification_status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-3">
                  認証が拒否されました。書類を確認して再度申請してください。
                </p>
                <Button
                  onClick={handleSubmitForVerification}
                  disabled={isSaving}
                  variant="secondary"
                  className="w-full"
                >
                  {isSaving ? '申請中...' : '再申請'}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* 保存ボタン */}
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/store')}
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button type="submit" className="flex-grow" disabled={isSaving}>
            {isSaving ? '保存中...' : 'プロフィールを保存'}
          </Button>
        </div>
      </form>
    </div>
  );
}