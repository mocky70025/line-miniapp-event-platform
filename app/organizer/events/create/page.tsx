'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { liffManager } from '@/lib/liff';
import { apiService } from '@/lib/api';

interface EventForm {
  // 基本情報（新しいフィールド名）
  genre: string;
  eventName: string;
  eventNameKana: string;
  startDate: string;
  endDate: string;
  displayPeriod: string;
  periodNote: string;
  time: string;
  applicationStartDate: string;
  applicationEndDate: string;
  displayApplicationPeriod: string;
  applicationNote: string;
  leadText: string;
  description: string;
  
  // 会場・連絡先
  venueName: string;
  postalCode: string;
  address: string;
  city: string;
  town: string;
  street: string;
  latitude: string;
  longitude: string;
  homepageUrl: string;
  relatedUrl: string;
  contactName: string;
  phone: string;
  email: string;
  parking: string;
  fee: string;
  organizer: string;
  
  // 画像・その他
  supplementText: string;
  mainImage: File | null;
  mainImageCaption: string;
  additionalImages: (File | null)[];
  additionalImageCaptions: string[];
  
  // 古いフィールド名（互換性のため）
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  maxStores: number;
  contact: string;
  category: string;
  isPublic: boolean;
  applicationDeadline: string;
}

export default function CreateEventPage() {
  const [form, setForm] = useState<EventForm>({
    // 基本情報
    genre: '',
    eventName: '',
    eventNameKana: '',
    startDate: '',
    endDate: '',
    displayPeriod: '',
    periodNote: '',
    time: '',
    applicationStartDate: '',
    applicationEndDate: '',
    displayApplicationPeriod: '',
    applicationNote: '',
    leadText: '',
    description: '',
    
    // 会場・連絡先
    venueName: '',
    postalCode: '',
    address: '',
    city: '',
    town: '',
    street: '',
    latitude: '',
    longitude: '',
    homepageUrl: '',
    relatedUrl: '',
    contactName: '',
    phone: '',
    email: '',
    parking: '',
    fee: '',
    organizer: '',
    
    // 画像・その他
    supplementText: '',
    mainImage: null,
    mainImageCaption: '',
    additionalImages: [null, null, null],
    additionalImageCaptions: ['', '', ''],
    
    // 古いフィールド名（互換性のため）
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    maxStores: 10,
    contact: '',
    category: '',
    isPublic: true,
    applicationDeadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const initLiff = async () => {
      try {
        const success = await liffManager.init('organizer');
        if (success && liffManager.isLoggedIn()) {
          const liffUser = await liffManager.getUserProfile();
          setUser(liffUser);
        } else {
          await liffManager.login('organizer');
        }
      } catch (error) {
        console.error('LIFF初期化エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('イベント作成開始:', form);
      
      // 必須項目のチェック
      if (!form.eventName || !form.startDate || !form.venueName || !form.address) {
        console.error('必須項目が不足:', { eventName: form.eventName, startDate: form.startDate, venueName: form.venueName, address: form.address });
        alert('必須項目を入力してください。');
        return;
      }

      console.log('LIFFユーザー取得中...');
      const liffUser = await liffManager.getUserProfile();
      console.log('LIFFユーザー:', liffUser);
      
      console.log('ユーザー情報取得中...');
      const user: any = await apiService.getUserByLineId(liffUser.userId);
      console.log('ユーザー情報:', user);
      
      // イベントデータをSupabaseに保存
      const eventData = {
        organizer_profile_id: user.id,
        title: form.eventName,
        description: form.description,
        date: form.startDate,
        start_time: form.time,
        end_time: form.time,
        location: form.venueName,
        address: form.address,
        max_stores: 10, // デフォルト値
        fee: parseFloat(form.fee) || 0,
        category: form.genre,
        requirements: [],
        contact: form.contactName,
        is_public: true,
        application_deadline: form.applicationEndDate,
        status: 'draft' as const,
        
        // 基本情報の拡張
        event_name_kana: form.eventNameKana,
        end_date: form.endDate,
        display_period: form.displayPeriod,
        period_note: form.periodNote,
        time: form.time,
        application_start_date: form.applicationStartDate,
        application_end_date: form.applicationEndDate,
        display_application_period: form.displayApplicationPeriod,
        application_note: form.applicationNote,
        lead_text: form.leadText,
        
        // 会場・連絡先情報
        venue_name: form.venueName,
        postal_code: form.postalCode,
        city: form.city,
        town: form.town,
        street: form.street,
        latitude: parseFloat(form.latitude) || null,
        longitude: parseFloat(form.longitude) || null,
        homepage_url: form.homepageUrl,
        related_url: form.relatedUrl,
        contact_name: form.contactName,
        phone: form.phone,
        email: form.email,
        parking: form.parking,
        fee_text: form.fee,
        organizer: form.organizer,
        
        // 画像・その他
        supplement_text: form.supplementText,
        main_image_caption: form.mainImageCaption,
        additional_image_captions: form.additionalImageCaptions
      };

      console.log('イベントデータ送信中:', eventData);
      const result = await apiService.createEvent(eventData);
      console.log('イベント作成結果:', result);
      
      alert('イベントを作成しました！');
      router.push('/organizer/events/manage');
    } catch (error) {
      console.error('イベント作成エラー:', error);
      console.error('エラーの詳細:', error);
      alert(`イベントの作成に失敗しました。エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (imageType: 'mainImage' | 'additionalImages', index?: number) => {
    return (file: File | null) => {
      if (imageType === 'mainImage') {
        setForm(prev => ({
          ...prev,
          mainImage: file
        }));
      } else if (imageType === 'additionalImages' && index !== undefined) {
        setForm(prev => ({
          ...prev,
          additionalImages: prev.additionalImages.map((img, i) => i === index ? file : img)
        }));
      }
    };
  };

  const handleImageCaptionChange = (imageType: 'mainImage' | 'additionalImages', index?: number) => {
    return (caption: string) => {
      if (imageType === 'mainImage') {
        setForm(prev => ({
          ...prev,
          mainImageCaption: caption
        }));
      } else if (imageType === 'additionalImages' && index !== undefined) {
        setForm(prev => ({
          ...prev,
          additionalImageCaptions: prev.additionalImageCaptions.map((cap, i) => i === index ? caption : cap)
        }));
      }
    };
  };

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
        <h1 className="text-xl font-bold">イベント作成</h1>
        <div></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">イベント名 *</label>
              <Input
                value={form.eventName}
                onChange={(e) => setForm({...form, eventName: e.target.value})}
                placeholder="イベント名を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">説明 *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="イベントの詳細説明を入力してください"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none placeholder:text-gray-400"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">開催日 *</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({...form, startDate: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">カテゴリ *</label>
                <select
                  value={form.genre}
                  onChange={(e) => setForm({...form, genre: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">カテゴリを選択してください</option>
                  <option value="flea_market">フリーマーケット</option>
                  <option value="handmade">手作り市</option>
                  <option value="food">フードフェス</option>
                  <option value="cultural">文化祭</option>
                  <option value="sports">スポーツイベント</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">開始時間</label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({...form, startTime: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">終了時間</label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({...form, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 会場情報 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">会場情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">会場名 *</label>
              <Input
                value={form.venueName}
                onChange={(e) => setForm({...form, venueName: e.target.value})}
                placeholder="会場名を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">住所 *</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
                placeholder="住所を入力してください"
                className="placeholder:text-gray-400"
                required
              />
            </div>
          </div>
        </Card>

        {/* 出店者募集設定 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">出店者募集設定</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">最大出店者数</label>
                <Input
                  type="number"
                  value={10}
                  onChange={(e) => setForm({...form, maxStores: parseInt(e.target.value) || 0})}
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">出店料 (円)</label>
                <Input
                  type="number"
                  value={form.fee}
                  onChange={(e) => setForm({...form, fee: e.target.value})}
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">申込締切</label>
              <Input
                type="datetime-local"
                value={form.applicationEndDate}
                onChange={(e) => setForm({...form, applicationEndDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">問い合わせ先</label>
              <Input
                value={form.contactName}
                onChange={(e) => setForm({...form, contactName: e.target.value})}
                placeholder="電話番号またはメールアドレス"
                className="placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={true}
                onChange={(e) => setForm({...form, isPublic: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium">
                公開する（出店者に表示される）
              </label>
            </div>
          </div>
        </Card>

        {/* 必要書類 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">出店者に求める必要書類</h2>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value=""
                onChange={() => {}}
                placeholder="必要書類を入力してください"
                className="placeholder:text-gray-400"
                disabled
              />
              <Button
                type="button"
                variant="secondary"
                disabled
              >
                追加
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">必要書類の詳細は後で実装します</p>
          </div>
        </Card>

        {/* 主催者書類 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">主催者書類</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">主催者書類のアップロード機能は後で実装します</p>
          </div>
        </Card>

        {/* 送信ボタン */}
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
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '作成中...' : 'イベントを作成'}
          </Button>
        </div>
      </form>
    </div>
  );
}
