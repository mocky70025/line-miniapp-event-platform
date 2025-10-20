'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { supabaseService } from '@/lib/supabase';
import { EventCreationForm, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function EventCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<EventCreationForm>({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    address: '',
    max_stores: undefined,
    application_deadline: '',
    main_image: undefined,
  });

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

    } catch (error) {
      console.error('初期化エラー:', error);
      setError('ページの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventCreationForm, value: string | number | File | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = ['title', 'description', 'event_date'];
    const missing = required.filter(field => !formData[field as keyof EventCreationForm]);
    
    if (missing.length > 0) {
      setError('必須項目を入力してください');
      return false;
    }

    // 日付の妥当性チェック
    if (formData.event_date) {
      const eventDate = new Date(formData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        setError('イベント日は今日以降の日付を選択してください');
        return false;
      }
    }

    // 申し込み締切の妥当性チェック
    if (formData.application_deadline && formData.event_date) {
      const deadlineDate = new Date(formData.application_deadline);
      const eventDate = new Date(formData.event_date);
      
      if (deadlineDate >= eventDate) {
        setError('申し込み締切はイベント日より前の日付を選択してください');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!validateForm()) {
        return;
      }

      if (!user) {
        throw new Error('ユーザー情報が取得できません');
      }

      // 主催ユーザー情報を取得
      const organizerUser = await supabaseService.getOrganizerUserByUserId(user.id);
      if (!organizerUser) {
        throw new Error('主催者情報が見つかりません');
      }

      // イベントを作成
      const event = await supabaseService.createEvent({
        organizer_id: organizerUser.id,
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        location: formData.location || undefined,
        address: formData.address || undefined,
        max_stores: formData.max_stores || undefined,
        application_deadline: formData.application_deadline || undefined,
        status: 'draft', // 最初は下書き状態
        main_image_url: undefined, // 画像アップロードは後で実装
      });

      if (!event) {
        throw new Error('イベントの作成に失敗しました');
      }

      // 作成完了
      router.push(`/events/manage?created=true`);

    } catch (error) {
      console.error('イベント作成エラー:', error);
      setError(error instanceof Error ? error.message : 'イベントの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
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
            <h1 className="text-lg font-bold text-gray-900">イベント掲載</h1>
            <div className="w-8" />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">イベント情報入力</h2>
          
          <div className="space-y-4">
            <Input
              label="イベントタイトル"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="例: 春のフードフェスティバル"
              required
            />

            <div>
              <label className="form-label">イベント説明</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="イベントの詳細や魅力を説明してください"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                rows={4}
                required
              />
            </div>

            <Input
              label="開催日"
              type="date"
              value={formData.event_date}
              onChange={(e) => handleInputChange('event_date', e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="開始時間"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
              <Input
                label="終了時間"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
              />
            </div>

            <Input
              label="開催場所"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="例: 中央公園"
            />

            <Input
              label="住所"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="例: 東京都渋谷区..."
            />

            <Input
              label="最大店舗数"
              type="number"
              value={formData.max_stores || ''}
              onChange={(e) => handleInputChange('max_stores', parseInt(e.target.value) || undefined)}
              min="1"
              placeholder="例: 20"
            />

            <Input
              label="申し込み締切"
              type="date"
              value={formData.application_deadline}
              onChange={(e) => handleInputChange('application_deadline', e.target.value)}
              help="イベント日より前の日付を選択してください"
            />

            <div>
              <label className="form-label">メイン画像</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange('main_image', e.target.files?.[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                JPG、PNG形式に対応（推奨サイズ: 1200×630px）
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              className="w-full"
              variant="primary"
            >
              イベントを作成
            </Button>
            
            <Button
              onClick={() => router.back()}
              className="w-full"
              variant="secondary"
            >
              キャンセル
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
