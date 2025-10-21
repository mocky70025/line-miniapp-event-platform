'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import DocumentUpload from '@/components/DocumentUpload';

interface EventForm {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  maxStores: number;
  fee: number;
  requirements: string[];
  contact: string;
  category: string;
  isPublic: boolean;
  applicationDeadline: string;
  documents: {
    venueContract?: File | null;
    insuranceCertificate?: File | null;
    eventPlan?: File | null;
  };
}

export default function CreateEventPage() {
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    maxStores: 10,
    fee: 0,
    requirements: [],
    contact: '',
    category: '',
    isPublic: true,
    applicationDeadline: '',
    documents: {
      venueContract: null,
      insuranceCertificate: null,
      eventPlan: null
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 必須項目のチェック
      if (!form.title || !form.date || !form.location || !form.address) {
        alert('必須項目を入力してください。');
        return;
      }

      // 実際のAPI呼び出し
      console.log('イベント作成:', form);
      
      // 成功時の処理
      alert('イベントを作成しました！');
      router.push('/organizer/events/manage');
    } catch (error) {
      console.error('イベント作成エラー:', error);
      alert('イベントの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = (documentType: keyof EventForm['documents']) => {
    return (file: File | null) => {
      setForm(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));
    };
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setForm(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
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
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="イベント名を入力してください"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">説明 *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="イベントの詳細説明を入力してください"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">開催日 *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">カテゴリ *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
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
                value={form.location}
                onChange={(e) => setForm({...form, location: e.target.value})}
                placeholder="会場名を入力してください"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">住所 *</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
                placeholder="住所を入力してください"
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
                  value={form.maxStores}
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
                  onChange={(e) => setForm({...form, fee: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">申込締切</label>
              <Input
                type="datetime-local"
                value={form.applicationDeadline}
                onChange={(e) => setForm({...form, applicationDeadline: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">問い合わせ先</label>
              <Input
                value={form.contact}
                onChange={(e) => setForm({...form, contact: e.target.value})}
                placeholder="電話番号またはメールアドレス"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
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
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="必要書類を入力してください"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button
                type="button"
                onClick={addRequirement}
                variant="secondary"
              >
                追加
              </Button>
            </div>
            
            {form.requirements.length > 0 && (
              <div className="space-y-2">
                {form.requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm">{req}</span>
                    <Button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      variant="secondary"
                      size="sm"
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 主催者書類 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">主催者書類</h2>
          <div className="space-y-4">
            <DocumentUpload
              title="会場使用許可証"
              description="会場の使用許可証または契約書"
              required={false}
              onUpload={handleDocumentUpload('venueContract')}
              uploadedFile={form.documents.venueContract}
              isUploading={isSubmitting}
            />
            
            <DocumentUpload
              title="イベント保険証券"
              description="イベント開催時の保険証券"
              required={false}
              onUpload={handleDocumentUpload('insuranceCertificate')}
              uploadedFile={form.documents.insuranceCertificate}
              isUploading={isSubmitting}
            />
            
            <DocumentUpload
              title="イベント企画書"
              description="イベントの詳細企画書"
              required={false}
              onUpload={handleDocumentUpload('eventPlan')}
              uploadedFile={form.documents.eventPlan}
              isUploading={isSubmitting}
            />
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
