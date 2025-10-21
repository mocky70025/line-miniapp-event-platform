'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface OrganizerProfile {
  id?: string;
  organizerName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  organizationType: string;
  description: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  documents: {};
}

export default function OrganizerProfilePage() {
  const [profile, setProfile] = useState<OrganizerProfile>({
    organizerName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    organizationType: '',
    description: '',
    website: '',
    instagram: '',
    twitter: '',
    isVerified: false,
    verificationStatus: 'not_submitted',
    documents: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const success = await liffManager.init('organizer');
        if (!success || !liffManager.isLoggedIn()) {
          await liffManager.login('organizer');
          return;
        }
        const liffUser = await liffManager.getUserProfile();
        setUser(liffUser);
        
        // ダミーのプロフィールデータ（実際はAPIから取得）
        const dummyProfile: OrganizerProfile = {
          id: '1',
          organizerName: 'イベント企画会社 サンプル',
          contactName: liffUser.displayName,
          phone: '03-1234-5678',
          email: 'organizer@example.com',
          address: '東京都渋谷区道玄坂1-2-3',
          organizationType: 'company',
          description: '地域密着型のイベント企画・運営を行っています。',
          website: 'https://organizer-example.com',
          instagram: '@organizer_sample',
          twitter: '@organizer_sample',
          isVerified: false,
          verificationStatus: 'not_submitted',
          documents: {}
        };
        
        setProfile(dummyProfile);
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


  const handleSubmitForVerification = async () => {
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
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">主催者プロフィール設定</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 基本情報 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
              <Input
                id="contactName"
                type="text"
                value={profile.contactName}
                onChange={(e) => setProfile(prev => ({ ...prev, contactName: e.target.value }))}
                placeholder="担当者名"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="03-xxxx-xxxx"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@example.com"
                className="placeholder:text-gray-400"
                required
              />
            </div>
          </div>
        </Card>

        {/* 組織情報 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">組織情報</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="organizerName" className="block text-sm font-medium text-gray-700 mb-1">組織名・会社名</label>
              <Input
                id="organizerName"
                type="text"
                value={profile.organizerName}
                onChange={(e) => setProfile(prev => ({ ...prev, organizerName: e.target.value }))}
                placeholder="組織名または会社名"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-1">組織形態</label>
              <select
                id="organizationType"
                value={profile.organizationType}
                onChange={(e) => setProfile(prev => ({ ...prev, organizationType: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">組織形態を選択してください</option>
                <option value="company">株式会社</option>
                <option value="llc">合同会社</option>
                <option value="npo">NPO法人</option>
                <option value="foundation">財団法人</option>
                <option value="association">社団法人</option>
                <option value="individual">個人事業主</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">住所</label>
              <Input
                id="address"
                type="text"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                placeholder="組織の住所"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">組織説明</label>
              <textarea
                id="description"
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 placeholder:text-gray-400"
                placeholder="組織の活動内容や特徴を記述してください。"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">ウェブサイト (任意)</label>
              <Input
                id="website"
                type="url"
                value={profile.website}
                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://your-organization.com"
                className="placeholder:text-gray-400"
              />
            </div>
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">Instagram (任意)</label>
              <Input
                id="instagram"
                type="text"
                value={profile.instagram}
                onChange={(e) => setProfile(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="@your_instagram"
                className="placeholder:text-gray-400"
              />
            </div>
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">X (旧Twitter) (任意)</label>
              <Input
                id="twitter"
                type="text"
                value={profile.twitter}
                onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
                placeholder="@your_twitter"
                className="placeholder:text-gray-400"
              />
            </div>
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
                  認証を受けることで、より多くの出店者に信頼されるイベント主催者として活動できます。
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
                  認証が完了しました！信頼できるイベント主催者として活動できます。
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
            variant="secondary"
            onClick={() => router.push('/organizer')}
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
