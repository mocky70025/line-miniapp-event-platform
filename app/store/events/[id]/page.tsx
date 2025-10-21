'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  organizer: string;
  maxStores: number;
  currentStores: number;
  fee: number;
  requirements: string[];
  contact: string;
  status: 'open' | 'closed' | 'full';
}

interface Application {
  storeName: string;
  contactName: string;
  phone: string;
  email: string;
  description: string;
  category: string;
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [application, setApplication] = useState<Application>({
    storeName: '',
    contactName: '',
    phone: '',
    email: '',
    description: '',
    category: ''
  });
  
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  useEffect(() => {
    // ダミーデータ（実際はAPIから取得）
    const dummyEvent: Event = {
      id: eventId,
      title: 'フリーマーケット 2024春',
      description: '春のフリーマーケットです。手作りの作品や古着、雑貨などを販売する出店者を募集しています。家族連れで楽しめるイベントです。',
      date: '2024-04-15',
      time: '10:00 - 16:00',
      location: '渋谷区民文化センター',
      address: '東京都渋谷区道玄坂1-2-3',
      organizer: '渋谷区イベント実行委員会',
      maxStores: 50,
      currentStores: 32,
      fee: 3000,
      requirements: [
        '営業許可証のコピー',
        '商品の写真（3枚以上）',
        '出店者情報シート',
        '保険加入証明書'
      ],
      contact: '03-1234-5678',
      status: 'open'
    };

    setTimeout(() => {
      setEvent(dummyEvent);
      setIsLoading(false);
    }, 1000);
  }, [eventId]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);

    try {
      // 実際のAPI呼び出し
      console.log('申込データ:', application);
      
      // 成功時の処理
      alert('申込が完了しました！主催者からの連絡をお待ちください。');
      setShowApplicationForm(false);
      setApplication({
        storeName: '',
        contactName: '',
        phone: '',
        email: '',
        description: '',
        category: ''
      });
    } catch (error) {
      console.error('申込エラー:', error);
      alert('申込に失敗しました。もう一度お試しください。');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
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
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          event.status === 'open' ? 'bg-green-100 text-green-800' :
          event.status === 'closed' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {event.status === 'open' ? '募集中' :
           event.status === 'closed' ? '募集終了' : '満員'}
        </span>
      </div>

      {/* イベント基本情報 */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
        <p className="text-gray-600 mb-6">{event.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">📅 開催日時:</span>
            <p>{event.date} {event.time}</p>
          </div>
          <div>
            <span className="font-medium">📍 会場:</span>
            <p>{event.location}</p>
            <p className="text-gray-500">{event.address}</p>
          </div>
          <div>
            <span className="font-medium">🏢 主催者:</span>
            <p>{event.organizer}</p>
          </div>
          <div>
            <span className="font-medium">💰 出店料:</span>
            <p className="text-lg font-bold text-primary-600">¥{event.fee.toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium">📊 出店状況:</span>
            <p>{event.currentStores} / {event.maxStores} 店舗</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ width: `${(event.currentStores / event.maxStores) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <span className="font-medium">📞 問い合わせ:</span>
            <p>{event.contact}</p>
          </div>
        </div>
      </Card>

      {/* 必要書類 */}
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

      {/* 申込ボタン */}
      {event.status === 'open' && (
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
                value={application.storeName}
                onChange={(e) => setApplication({...application, storeName: e.target.value})}
                placeholder="店舗名を入力してください"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">担当者名 *</label>
              <Input
                value={application.contactName}
                onChange={(e) => setApplication({...application, contactName: e.target.value})}
                placeholder="担当者名を入力してください"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">電話番号 *</label>
              <Input
                value={application.phone}
                onChange={(e) => setApplication({...application, phone: e.target.value})}
                placeholder="090-1234-5678"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">メールアドレス *</label>
              <Input
                type="email"
                value={application.email}
                onChange={(e) => setApplication({...application, email: e.target.value})}
                placeholder="example@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">商品カテゴリ *</label>
              <select
                value={application.category}
                onChange={(e) => setApplication({...application, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">カテゴリを選択してください</option>
                <option value="food">食品・飲料</option>
                <option value="clothing">衣類・ファッション</option>
                <option value="handmade">手作り・クラフト</option>
                <option value="antique">古着・アンティーク</option>
                <option value="general">雑貨・その他</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">商品・サービス説明 *</label>
              <textarea
                value={application.description}
                onChange={(e) => setApplication({...application, description: e.target.value})}
                placeholder="販売予定の商品やサービスについて詳しく説明してください"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none"
                required
              />
            </div>
            
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
