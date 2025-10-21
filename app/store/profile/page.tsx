'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
    isVerified: false
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
            isVerified: false
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
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">担当者名 *</label>
              <Input
                value={profile.contactName}
                onChange={(e) => setProfile({...profile, contactName: e.target.value})}
                placeholder="担当者名を入力してください"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">電話番号 *</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="090-1234-5678"
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
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">住所 *</label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                placeholder="東京都渋谷区道玄坂1-2-3"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none"
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
                type="url"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <Input
                value={profile.instagram}
                onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                placeholder="@username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <Input
                value={profile.twitter}
                onChange={(e) => setProfile({...profile, twitter: e.target.value})}
                placeholder="@username"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">認証状況</h2>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${profile.isVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={profile.isVerified ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {profile.isVerified ? '認証済み' : '未認証'}
            </span>
          </div>
          {!profile.isVerified && (
            <p className="text-sm text-gray-500 mt-2">
              認証には営業許可証などの書類提出が必要です。
            </p>
          )}
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
