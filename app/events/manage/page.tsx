'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { supabaseService } from '@/lib/supabase';
import { Event, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function EventManagePage() {
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
      if (!userData || userData.user_type !== 'organizer') {
        router.push('/');
        return;
      }

      setUser(userData);

      // 主催ユーザー情報を取得
      const organizerUser = await supabaseService.getOrganizerUserByUserId(userData.id);
      if (!organizerUser) {
        setError('主催者情報が見つかりません');
        return;
      }

      // 主催者のイベント一覧を取得（簡略化）
      // 実際の実装では、organizer_idでフィルタリングしたクエリが必要
      const eventsData = await supabaseService.getPublishedEvents();
      setEvents(eventsData.filter(event => event.organizer_id === organizerUser.id));

    } catch (error) {
      console.error('初期化エラー:', error);
      setError('イベント管理画面の初期化に失敗しました');
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
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
      published: { label: '公開中', color: 'bg-green-100 text-green-800' },
      cancelled: { label: '中止', color: 'bg-red-100 text-red-800' },
      completed: { label: '完了', color: 'bg-blue-100 text-blue-800' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const handleEventStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const updatedEvent = await supabaseService.updateEvent(eventId, {
        status: newStatus as any,
      });

      if (updatedEvent) {
        setEvents(prev => prev.map(event => 
          event.id === eventId ? { ...event, status: newStatus as any } : event
        ));
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      setError('ステータスの更新に失敗しました');
    }
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
            <h1 className="text-lg font-bold text-gray-900">イベント管理</h1>
            <div className="w-8" />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* 新規作成ボタン */}
          <Card>
            <Button
              onClick={() => router.push('/events/create')}
              className="w-full"
              variant="primary"
            >
              ➕ 新しいイベントを作成
            </Button>
          </Card>

          {/* イベント一覧 */}
          {events.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📅</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  作成したイベントはありません
                </h2>
                <p className="text-gray-600 mb-6">
                  最初のイベントを作成してみましょう
                </p>
                <Button
                  onClick={() => router.push('/events/create')}
                  variant="primary"
                >
                  イベントを作成
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                あなたのイベント ({events.length}件)
              </h2>
              
              {events.map((event) => {
                const statusInfo = getStatusLabel(event.status);
                
                return (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                        {event.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color} ml-2`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="w-5">📅</span>
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      
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
                      <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                        {event.description}
                      </p>
                    )}
                    
                    {/* アクションボタン */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => router.push(`/events/${event.id}/applications`)}
                          variant="secondary"
                          size="sm"
                        >
                          申し込み確認
                        </Button>
                        
                        <Button
                          onClick={() => router.push(`/events/${event.id}/edit`)}
                          variant="secondary"
                          size="sm"
                        >
                          編集
                        </Button>
                      </div>
                      
                      <div className="flex space-x-1">
                        {event.status === 'draft' && (
                          <Button
                            onClick={() => handleEventStatusChange(event.id, 'published')}
                            variant="primary"
                            size="sm"
                          >
                            公開
                          </Button>
                        )}
                        
                        {event.status === 'published' && (
                          <Button
                            onClick={() => handleEventStatusChange(event.id, 'cancelled')}
                            variant="danger"
                            size="sm"
                          >
                            中止
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
