'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { supabaseService } from '@/lib/supabase';
import { Event, User, EventApplicationData } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<EventApplicationData>({
    booth_size: '',
    special_requirements: '',
    equipment_needed: [],
    additional_info: '',
  });

  useEffect(() => {
    initializePage();
  }, [eventId]);

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

      // イベント詳細を取得
      const eventData = await supabaseService.getEventById(eventId);
      if (!eventData || eventData.status !== 'published') {
        setError('イベントが見つからないか、公開されていません');
        return;
      }

      setEvent(eventData);

    } catch (error) {
      console.error('初期化エラー:', error);
      setError('イベント詳細の取得に失敗しました');
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

  const handleApplicationSubmit = async () => {
    try {
      setIsApplying(true);
      setError(null);

      if (!user || !event) {
        throw new Error('ユーザーまたはイベント情報が取得できません');
      }

      // 店舗ユーザー情報を取得
      const storeUser = await supabaseService.getStoreUserByUserId(user.id);
      if (!storeUser) {
        throw new Error('店舗情報が見つかりません');
      }

      // 申し込みを作成
      const application = await supabaseService.createEventApplication({
        event_id: event.id,
        store_user_id: storeUser.id,
        status: 'pending',
        application_data: applicationData,
      });

      if (!application) {
        throw new Error('申し込みの作成に失敗しました');
      }

      // 申し込み完了
      router.push('/applications?applied=true');

    } catch (error) {
      console.error('申し込みエラー:', error);
      setError(error instanceof Error ? error.message : '申し込みに失敗しました');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()} variant="primary">
              戻る
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isDeadlinePassed = isApplicationDeadlinePassed(event.application_deadline);

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
            <h1 className="text-lg font-bold text-gray-900">イベント詳細</h1>
            <div className="w-8" />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* イベント情報 */}
          <Card>
            {event.main_image_url && (
              <div className="aspect-video bg-gray-200 mb-4 rounded-lg overflow-hidden">
                <img
                  src={event.main_image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <div className="space-y-3 text-sm text-gray-600">
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
              
              {event.address && (
                <div className="flex items-center">
                  <span className="w-5">🏠</span>
                  <span>{event.address}</span>
                </div>
              )}
              
              {event.max_stores && (
                <div className="flex items-center">
                  <span className="w-5">🏪</span>
                  <span>最大{event.max_stores}店舗</span>
                </div>
              )}
              
              {event.application_deadline && (
                <div className="flex items-center">
                  <span className="w-5">⏳</span>
                  <span>申込締切: {formatDate(event.application_deadline)}</span>
                </div>
              )}
            </div>
            
            {event.description && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">イベント詳細</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </Card>

          {/* 申し込みフォーム */}
          {!isDeadlinePassed && (
            <>
              {!showApplicationForm ? (
                <Card>
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎪</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      このイベントに出店しませんか？
                    </h2>
                    <p className="text-gray-600 mb-6">
                      イベントに出店して、新しいお客様との出会いを作りましょう
                    </p>
                    <Button
                      onClick={() => setShowApplicationForm(true)}
                      variant="primary"
                      className="w-full"
                    >
                      出店申し込み
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">出店申し込み</h2>
                  
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <Input
                      label="ブースサイズ"
                      value={applicationData.booth_size || ''}
                      onChange={(e) => setApplicationData(prev => ({
                        ...prev,
                        booth_size: e.target.value,
                      }))}
                      placeholder="例: 3m×3m"
                      help="希望するブースサイズを入力してください"
                    />

                    <div>
                      <label className="form-label">必要な設備</label>
                      <div className="space-y-2 mt-2">
                        {['電気', '水道', 'テント', 'テーブル', '椅子'].map((equipment) => (
                          <label key={equipment} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={applicationData.equipment_needed?.includes(equipment) || false}
                              onChange={(e) => {
                                const current = applicationData.equipment_needed || [];
                                const updated = e.target.checked
                                  ? [...current, equipment]
                                  : current.filter(item => item !== equipment);
                                setApplicationData(prev => ({
                                  ...prev,
                                  equipment_needed: updated,
                                }));
                              }}
                              className="mr-2"
                            />
                            {equipment}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">特別な要望</label>
                      <textarea
                        value={applicationData.special_requirements || ''}
                        onChange={(e) => setApplicationData(prev => ({
                          ...prev,
                          special_requirements: e.target.value,
                        }))}
                        placeholder="例: 車両搬入のため早朝セットアップ希望"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="form-label">その他</label>
                      <textarea
                        value={applicationData.additional_info || ''}
                        onChange={(e) => setApplicationData(prev => ({
                          ...prev,
                          additional_info: e.target.value,
                        }))}
                        placeholder="その他ご質問やご要望があればお聞かせください"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={handleApplicationSubmit}
                      loading={isApplying}
                      className="w-full"
                      variant="primary"
                    >
                      申し込み完了
                    </Button>
                    
                    <Button
                      onClick={() => setShowApplicationForm(false)}
                      className="w-full"
                      variant="secondary"
                    >
                      キャンセル
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* 申し込み締切後の表示 */}
          {isDeadlinePassed && (
            <Card>
              <div className="text-center">
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  申し込み締切
                </h2>
                <p className="text-gray-600">
                  このイベントの申し込みは締め切られました
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
