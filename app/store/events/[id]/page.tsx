'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { useEvent, useUserEventApplications } from '@/hooks/useEvents';
import { useStoreProfile } from '@/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';

interface ApplicationForm {
  storeName: string;
  contactName: string;
  phone: string;
  email: string;
  productDescription: string;
  documents: {
    businessLicense?: File | null;
    productPhotos?: File | null;
  };
}

export default function EventDetailPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({
    storeName: '',
    contactName: '',
    phone: '',
    email: '',
    productDescription: '',
    documents: {
      businessLicense: null,
      productPhotos: null
    }
  });
  
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  // フックを使用してデータを取得
  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { profile: storeProfile, loading: profileLoading } = useStoreProfile();
  const { applications, createApplication } = useUserEventApplications(storeProfile?.id || '');

  // 既存の申込があるかチェック
  const existingApplication = applications.find(app => app.event_id === eventId);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const success = await liffManager.init('store');
        if (success && liffManager.isLoggedIn()) {
          const liffUser = await liffManager.getUserProfile();
          setUser(liffUser);
          setIsLoggedIn(true);
        } else {
          await liffManager.login('store');
        }
      } catch (error) {
        console.error('LIFF初期化エラー:', error);
      }
    };

    initLiff();
  }, []);

  // プロフィール情報をフォームに自動入力
  useEffect(() => {
    if (storeProfile && !showApplicationForm) {
      setApplicationForm(prev => ({
        ...prev,
        storeName: storeProfile.store_name || '',
        contactName: storeProfile.contact_name || '',
        phone: storeProfile.phone || '',
        email: storeProfile.email || '',
      }));
    }
  }, [storeProfile, showApplicationForm]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !storeProfile) return;

    // 必須書類のチェック
    const requiredDocs = event.requirements || [];
    const missingDocs: string[] = [];
    if (requiredDocs.includes('営業許可証') && !applicationForm.documents.businessLicense) {
      missingDocs.push('営業許可証');
    }
    if (requiredDocs.includes('商品写真') && !applicationForm.documents.productPhotos) {
      missingDocs.push('商品写真');
    }

    if (missingDocs.length > 0) {
      alert(`以下の必須書類が不足しています: ${missingDocs.join(', ')}`);
      return;
    }

    setIsApplying(true);

    try {
      await createApplication({
        event_id: event.id,
        store_profile_id: storeProfile.id,
        store_name: applicationForm.storeName,
        contact_name: applicationForm.contactName,
        phone: applicationForm.phone,
        email: applicationForm.email,
        product_description: applicationForm.productDescription,
      });

      alert('申込が完了しました！主催者からの連絡をお待ちください。');
      setShowApplicationForm(false);
      setApplicationForm(prev => ({
        ...prev,
        productDescription: '',
        documents: {
          businessLicense: null,
          productPhotos: null
        }
      }));
    } catch (error) {
      console.error('申込エラー:', error);
      alert('申込に失敗しました。もう一度お試しください。');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDocumentUpload = (documentType: keyof ApplicationForm['documents']) => {
    return (file: File | null) => {
      setApplicationForm(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '募集中';
      case 'closed': return '募集終了';
      case 'completed': return '終了';
      default: return '準備中';
    }
  };

  if (eventLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <h2 className="text-xl font-bold mb-4">イベントが見つかりません</h2>
          <Button onClick={() => router.back()}>
            戻る
          </Button>
        </Card>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <p className="text-gray-600 mb-6">
            イベントの詳細を確認するには、LINEアカウントでログインしてください。
          </p>
          <Button onClick={() => liffManager.login('store')} className="w-full">
            LINEでログイン
          </Button>
        </Card>
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
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
          {getStatusText(event.status)}
        </span>
      </div>

      {/* イベント基本情報 */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
        {event.description && (
          <p className="text-gray-600 mb-6">{event.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">📅 開催日時:</span>
            <p>{new Date(event.date).toLocaleDateString('ja-JP')}</p>
            {event.start_time && event.end_time && (
              <p>{event.start_time} - {event.end_time}</p>
            )}
          </div>
          <div>
            <span className="font-medium">📍 会場:</span>
            <p>{event.location}</p>
            {event.address && (
              <p className="text-gray-500">{event.address}</p>
            )}
          </div>
          <div>
            <span className="font-medium">💰 出店料:</span>
            <p className="text-lg font-bold text-primary-600">¥{event.fee.toLocaleString()}</p>
          </div>
          {event.max_stores && (
            <div>
              <span className="font-medium">📊 募集店舗数:</span>
              <p>{event.max_stores} 店舗</p>
            </div>
          )}
          {event.contact && (
            <div>
              <span className="font-medium">📞 問い合わせ:</span>
              <p>{event.contact}</p>
            </div>
          )}
          {event.application_deadline && (
            <div>
              <span className="font-medium">⏰ 申込締切:</span>
              <p>{new Date(event.application_deadline).toLocaleDateString('ja-JP')}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 必要書類 */}
      {event.requirements && event.requirements.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">必要書類</h2>
          <ul className="space-y-2">
            {event.requirements.map((req, index) => (
              <li key={index} className="flex items-center">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                {req}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 既存の申込状況 */}
      {existingApplication && (
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h2 className="text-xl font-bold mb-4">あなたの申込状況</h2>
          <div className="space-y-2">
            <p><span className="font-medium">申込日時:</span> {new Date(existingApplication.applied_at).toLocaleString('ja-JP')}</p>
            <p><span className="font-medium">ステータス:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                existingApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                existingApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {existingApplication.status === 'pending' ? '審査中' :
                 existingApplication.status === 'approved' ? '承認済み' : '却下'}
              </span>
            </p>
            <p className="mt-4 text-gray-600">申込内容の変更は、主催者にご連絡ください。</p>
          </div>
        </Card>
      )}

      {/* 申込ボタン */}
      {event.status === 'published' && !existingApplication && (
        <div className="text-center">
          <Button 
            onClick={() => setShowApplicationForm(true)}
            className="w-full max-w-md"
            size="lg"
          >
            このイベントに申込む
          </Button>
        </div>
      )}

      {/* 申込フォーム */}
      {showApplicationForm && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">申込フォーム</h2>
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">店舗名 *</label>
              <Input
                value={applicationForm.storeName}
                onChange={(e) => setApplicationForm({...applicationForm, storeName: e.target.value})}
                placeholder="店舗名を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">担当者名 *</label>
              <Input
                value={applicationForm.contactName}
                onChange={(e) => setApplicationForm({...applicationForm, contactName: e.target.value})}
                placeholder="担当者名を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">電話番号 *</label>
              <Input
                value={applicationForm.phone}
                onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                placeholder="090-1234-5678"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">メールアドレス *</label>
              <Input
                type="email"
                value={applicationForm.email}
                onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                placeholder="example@email.com"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">商品・サービス説明 *</label>
              <textarea
                value={applicationForm.productDescription}
                onChange={(e) => setApplicationForm({...applicationForm, productDescription: e.target.value})}
                placeholder="販売予定の商品やサービスについて詳しく説明してください"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none placeholder:text-gray-400"
                required
              />
            </div>

            {/* 書類アップロード */}
            {event.requirements && event.requirements.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-md font-semibold">必要書類のアップロード</h3>
                {event.requirements.includes('営業許可証') && (
                  <DocumentUpload
                    title="営業許可証"
                    description="営業許可証のコピーをアップロードしてください"
                    required={true}
                    onUpload={handleDocumentUpload('businessLicense')}
                    uploadedFile={applicationForm.documents.businessLicense}
                    isUploading={isApplying}
                  />
                )}
                {event.requirements.includes('商品写真') && (
                  <DocumentUpload
                    title="商品写真"
                    description="販売予定の商品写真（3枚以上）をアップロードしてください"
                    required={true}
                    acceptedTypes={['image/*']}
                    onUpload={handleDocumentUpload('productPhotos')}
                    uploadedFile={applicationForm.documents.productPhotos}
                    isUploading={isApplying}
                  />
                )}
              </div>
            )}
            
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                onClick={() => setShowApplicationForm(false)}
                variant="secondary"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isApplying}
                className="flex-1"
              >
                {isApplying ? '申込中...' : '申込む'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}