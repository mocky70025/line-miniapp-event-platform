'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { usePublishedEvents } from '@/hooks/useEvents';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function StoreEventsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // フックを使用して公開イベントを取得
  const { events, loading, error } = usePublishedEvents();

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

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <p className="text-gray-600 mb-6">
            イベント一覧を確認するには、LINEアカウントでログインしてください。
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">イベント一覧</h1>
        <Button 
          onClick={() => router.back()}
          variant="secondary"
        >
          戻る
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-600">現在募集中のイベントはありません</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
              {event.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
              )}
              <div className="text-sm text-gray-500 mb-3">
                <p>📅 {new Date(event.date).toLocaleDateString('ja-JP')}</p>
                {event.location && <p>📍 {event.location}</p>}
                <p>💰 出店料: ¥{event.fee.toLocaleString()}</p>
                {event.max_stores && <p>📊 募集店舗数: {event.max_stores}店舗</p>}
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                  {getStatusText(event.status)}
                </span>
                <Button 
                  onClick={() => router.push(`/store/events/${event.id}`)}
                  disabled={event.status !== 'published'}
                  size="sm"
                >
                  詳細を見る
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}