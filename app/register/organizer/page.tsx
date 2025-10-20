'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { supabaseService } from '@/lib/supabase';
import { UserRegistrationForm } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function OrganizerRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserRegistrationForm>({
    name: '',
    gender: undefined,
    age: undefined,
    phone: '',
    email: '',
    user_type: 'organizer',
    company_name: '',
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
      if (liffUser) {
        setFormData(prev => ({
          ...prev,
          name: liffUser.displayName,
        }));
      }
    } catch (error) {
      console.error('初期化エラー:', error);
      setError('ページの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserRegistrationForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'email', 'company_name'];
    const missing = required.filter(field => !formData[field as keyof UserRegistrationForm]);
    
    if (missing.length > 0) {
      setError('必須項目を入力してください');
      return false;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }

    // 電話番号の形式チェック
    const phoneRegex = /^[0-9-+()\s]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('有効な電話番号を入力してください');
      return false;
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

      const liffUser = liffManager.getUser();
      if (!liffUser) {
        throw new Error('ユーザー情報が取得できません');
      }

      // ユーザー情報を更新
      const user = await supabaseService.getUserByLineId(liffUser.userId);
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      // 基本情報を更新
      const updatedUser = await supabaseService.updateUser(user.id, {
        name: formData.name,
        gender: formData.gender,
        age: formData.age,
        phone: formData.phone,
        email: formData.email,
        user_type: 'organizer',
      });

      if (!updatedUser) {
        throw new Error('ユーザー情報の更新に失敗しました');
      }

      // 主催ユーザー情報を作成または更新
      let organizerUser = await supabaseService.getOrganizerUserByUserId(user.id);
      if (!organizerUser) {
        organizerUser = await supabaseService.createOrganizerUser({
          user_id: user.id,
          company_name: formData.company_name,
        });
      }

      if (!organizerUser) {
        throw new Error('主催者情報の作成に失敗しました');
      }

      // 登録完了
      router.push('/?registered=true');

    } catch (error) {
      console.error('登録エラー:', error);
      setError(error instanceof Error ? error.message : '登録に失敗しました');
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
            <h1 className="text-lg font-bold text-gray-900">主催者登録</h1>
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">基本情報入力</h2>
          
          <div className="space-y-4">
            <Input
              label="会社名"
              value={formData.company_name || ''}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="株式会社サンプル"
              required
            />

            <Input
              label="担当者名"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />

            <div>
              <label className="form-label">性別</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mr-2"
                  />
                  男性
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mr-2"
                  />
                  女性
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mr-2"
                  />
                  その他
                </label>
              </div>
            </div>

            <Input
              label="年齢"
              type="number"
              value={formData.age || ''}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              min="18"
              max="100"
            />

            <Input
              label="電話番号"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="090-1234-5678"
              required
            />

            <Input
              label="メールアドレス"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@company.com"
              required
            />
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              className="w-full"
              variant="primary"
            >
              登録完了
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
