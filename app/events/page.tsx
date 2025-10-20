'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { supabaseService } from '@/lib/supabase';
import { Event, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function EventsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      const liffInitialized = await liffManager.init();
      if (!liffInitialized || !liffManager.isLoggedIn()) {
        router.push('/');
        return;
      }

      const liffUser = liffManager.getUser();
      if (!liffUser) {
        router.push('/');
        return;
      }

      // ユーザー情報を取得
      const userData = await supabaseService.getUserByLineId(liffUser.userId);
      if (!userData || userData.user_type !== 'store') {
        router.push('/');
        return;
      }

      setUser(userData);

      // イベント一覧を取得
      const eventsData = await supabaseService.getPublishedEvents();
      setEvents(eventsData);

    } catch (error) {
      console.error('初期化エラー:', error);
      setError('イベント一覧の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const isApplicationDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={initializePage} variant="primary">
              再試行
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 戻る
            </button>
            <h1 className="text-lg font-bold text-gray-900">イベント一覧</h1>
            <div className="w-8" />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        {events.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                開催予定のイベントはありません
              </h2>
              <p className="text-gray-600">
                新しいイベントが追加されるまでお待ちください
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              出店可能なイベント ({events.length}件)
            </h2>
            
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                {event.main_image_url && (
                  <div className="aspect-video bg-gray-200 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={event.main_image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-5">📅</span>
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    
                    {event.start_time && (
                      <div className="flex items-center">
                        <span className="w-5">⏰</span>
                        <span>
                          {formatTime(event.start_time)}
                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                        </span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center">
                        <span className="w-5">📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.max_stores && (
                      <div className="flex items-center">
                        <span className="w-5">🏪</span>
                        <span>最大{event.max_stores}店舗</span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    {event.application_deadline && (
                      <div className="text-xs text-gray-500">
                        申込締切: {formatDate(event.application_deadline)}
                      </div>
                    )}
                    
                    <Button
                      onClick={() => router.push(`/events/${event.id}`)}
                      variant="primary"
                      size="sm"
                      disabled={isApplicationDeadlinePassed(event.application_deadline)}
                    >
                      {isApplicationDeadlinePassed(event.application_deadline) 
                        ? '申込締切' 
                        : '詳細を見る'
                      }
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
