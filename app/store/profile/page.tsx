'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';

interface StoreProfile {
  id?: string;
  storeName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  businessType: string;
  description: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  documents: {
    businessLicense?: File | null;
    taxCertificate?: File | null;
    insuranceCertificate?: File | null;
    productPhotos?: File | null;
  };
}

export default function StoreProfilePage() {
  const [profile, setProfile] = useState<StoreProfile>({
    storeName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    businessType: '',
    description: '',
    website: '',
    instagram: '',
    twitter: '',
    isVerified: false,
    verificationStatus: 'not_submitted',
    documents: {
      businessLicense: null,
      taxCertificate: null,
      insuranceCertificate: null,
      productPhotos: null
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // LIFFユーザー情報を取得
        if (liffManager.isLoggedIn()) {
          const liffUser = await liffManager.getUserProfile();
          setUser(liffUser);
          
          // ダミーのプロフィールデータ（実際はAPIから取得）
          const dummyProfile: StoreProfile = {
            id: '1',
            storeName: 'サンプル店舗',
            contactName: liffUser.displayName,
            phone: '090-1234-5678',
            email: 'sample@example.com',
            address: '東京都渋谷区道玄坂1-2-3',
            businessType: 'handmade',
            description: '手作りのアクセサリーと雑貨を販売しています。',
            website: 'https://example.com',
            instagram: '@sample_store',
            twitter: '@sample_store',
            isVerified: false,
            verificationStatus: 'not_submitted',
            documents: {
              businessLicense: null,
              taxCertificate: null,
              insuranceCertificate: null,
              productPhotos: null
            }
          };
          
          setProfile(dummyProfile);
        }
      } catch (error) {
        console.error('プロフィール読み込みエラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 実際のAPI呼び出し
      console.log('保存するプロフィール:', profile);
      
      // 成功時の処理
      alert('プロフィールを保存しました！');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentUpload = (documentType: keyof StoreProfile['documents']) => {
    return (file: File | null) => {
      setProfile(prev => ({
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
    const missingDocs = requiredDocs.filter(doc => !profile.documents[doc as keyof StoreProfile['documents']]);
    
    if (missingDocs.length > 0) {
      alert('必須書類が不足しています。営業許可証と納税証明書をアップロードしてください。');
      return;
    }

    try {
      setIsSaving(true);
      // 認証申請のAPI呼び出し
      console.log('認証申請:', profile);
      
      setProfile(prev => ({
        ...prev,
        verificationStatus: 'pending'
      }));
      
      alert('認証申請を送信しました。審査結果は数営業日以内にお知らせします。');
    } catch (error) {
      console.error('認証申請エラー:', error);
      alert('認証申請に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const getVerificationStatusText = () => {
    switch (profile.verificationStatus) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => router.back()}
          variant="secondary"
        >
          ← 戻る
        </Button>
        <h1 className="text-xl font-bold">プロフィール設定</h1>
        <div></div>
      </div>

      {/* LINEユーザー情報 */}
      {user && (
        <Card className="p-4">
          <h2 className="font-bold mb-3">LINEアカウント情報</h2>
          <div className="flex items-center space-x-3">
            {user.pictureUrl && (
              <img 
                src={user.pictureUrl} 
                alt="プロフィール画像" 
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-sm text-gray-500">ID: {user.userId}</p>
            </div>
          </div>
        </Card>
      )}

      {/* プロフィール設定フォーム */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">店舗基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">店舗名 *</label>
              <Input
                value={profile.storeName}
                onChange={(e) => setProfile({...profile, storeName: e.target.value})}
                placeholder="店舗名を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">担当者名 *</label>
              <Input
                value={profile.contactName}
                onChange={(e) => setProfile({...profile, contactName: e.target.value})}
                placeholder="担当者名を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">電話番号 *</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="090-1234-5678"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">メールアドレス *</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                placeholder="example@email.com"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">住所 *</label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                placeholder="東京都渋谷区道玄坂1-2-3"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">事業種別 *</label>
              <select
                value={profile.businessType}
                onChange={(e) => setProfile({...profile, businessType: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">事業種別を選択してください</option>
                <option value="food">食品・飲料</option>
                <option value="clothing">衣類・ファッション</option>
                <option value="handmade">手作り・クラフト</option>
                <option value="antique">古着・アンティーク</option>
                <option value="general">雑貨・その他</option>
                <option value="service">サービス業</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">店舗説明 *</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({...profile, description: e.target.value})}
                placeholder="店舗や商品について詳しく説明してください"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none placeholder:text-gray-400"
                required
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">SNS・ウェブサイト</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ウェブサイト</label>
              <Input
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                placeholder="https://example.com"
                className="placeholder:text-gray-400"
                type="url"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <Input
                value={profile.instagram}
                onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                placeholder="@username"
                className="placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <Input
                value={profile.twitter}
                onChange={(e) => setProfile({...profile, twitter: e.target.value})}
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
              uploadedFile={profile.documents.businessLicense}
              isUploading={isSaving}
            />
            
            <DocumentUpload
              title="納税証明書"
              description="最新の納税証明書をアップロードしてください"
              required={true}
              onUpload={handleDocumentUpload('taxCertificate')}
              uploadedFile={profile.documents.taxCertificate}
              isUploading={isSaving}
            />
            
            <DocumentUpload
              title="保険加入証明書"
              description="商品賠償責任保険などの加入証明書（任意）"
              required={false}
              onUpload={handleDocumentUpload('insuranceCertificate')}
              uploadedFile={profile.documents.insuranceCertificate}
              isUploading={isSaving}
            />
            
            <DocumentUpload
              title="商品写真"
              description="販売予定の商品写真（3枚以上、任意）"
              required={false}
              acceptedTypes={['image/*']}
              onUpload={handleDocumentUpload('productPhotos')}
              uploadedFile={profile.documents.productPhotos}
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
                <div className={`w-4 h-4 rounded-full ${profile.isVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="font-medium">認証ステータス</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusText().bg} ${getVerificationStatusText().color}`}>
                {getVerificationStatusText().text}
              </span>
            </div>
            
            {profile.verificationStatus === 'not_submitted' && (
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
            
            {profile.verificationStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  認証申請を審査中です。結果は数営業日以内にお知らせします。
                </p>
              </div>
            )}
            
            {profile.verificationStatus === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  認証が完了しました！すべてのイベントに参加できます。
                </p>
              </div>
            )}
            
            {profile.verificationStatus === 'rejected' && (
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
            onClick={() => router.back()}
            variant="secondary"
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  );
}
