'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { supabaseService } from '@/lib/supabase';
import { UserRegistrationForm, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DocumentType } from '@/types';

export default function StoreRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserRegistrationForm>({
    name: '',
    gender: undefined,
    age: undefined,
    phone: '',
    email: '',
    user_type: 'store',
    genre: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);

  const documentTypes: { type: DocumentType; label: string; required: boolean }[] = [
    { type: 'business_license', label: '営業許可証', required: true },
    { type: 'vehicle_inspection', label: '車検証', required: true },
    { type: 'inspection_record', label: '自動車検査証記録事項', required: true },
    { type: 'pl_insurance', label: 'PL保険', required: true },
    { type: 'fire_layout', label: '火気類配置図', required: true },
  ];

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

  const handleDocumentUpload = (type: DocumentType, file: File) => {
    setDocuments(prev => {
      const filtered = prev.filter(doc => doc.name !== file.name);
      return [...filtered, file];
    });
  };

  const validateStep1 = () => {
    const required = ['name', 'phone', 'email', 'genre'];
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

  const validateStep2 = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const uploadedDocs = documents.map(doc => doc.name);
    
    const missing = requiredDocs.filter(doc => 
      !uploadedDocs.some(uploaded => uploaded.includes(doc.type))
    );

    if (missing.length > 0) {
      setError('必須書類をすべてアップロードしてください');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setError(null);
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

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
      });

      if (!updatedUser) {
        throw new Error('ユーザー情報の更新に失敗しました');
      }

      // 店舗ユーザー情報を作成または更新
      let storeUser = await supabaseService.getStoreUserByUserId(user.id);
      if (!storeUser) {
        storeUser = await supabaseService.createStoreUser({
          user_id: user.id,
          genre: formData.genre,
        });
      }

      if (!storeUser) {
        throw new Error('店舗情報の作成に失敗しました');
      }

      // 書類をアップロード
      setUploadingDocuments(true);
      for (const file of documents) {
        const documentType = documentTypes.find(doc => 
          file.name.includes(doc.type)
        )?.type;

        if (documentType) {
          // 実際のファイルアップロード処理
          // ここでは簡略化
          console.log(`Uploading ${documentType}: ${file.name}`);
        }
      }

      // 登録完了
      router.push('/?registered=true');

    } catch (error) {
      console.error('登録エラー:', error);
      setError(error instanceof Error ? error.message : '登録に失敗しました');
    } finally {
      setIsSubmitting(false);
      setUploadingDocuments(false);
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
            <h1 className="text-lg font-bold text-gray-900">店舗登録</h1>
            <div className="w-8" />
          </div>
        </div>
      </header>

      {/* ステップインジケーター */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="step-indicator">
            <div className={`step-item ${step >= 1 ? 'active' : 'pending'}`}>1</div>
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`step-item ${step >= 2 ? 'active' : 'pending'}`}>2</div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {step === 1 && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">基本情報入力</h2>
            
            <div className="space-y-4">
              <Input
                label="名前"
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
                placeholder="example@email.com"
                required
              />

              <Input
                label="ジャンル"
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                placeholder="例: フードトラック、雑貨、アクセサリー"
                required
                help="あなたのお店のジャンルを入力してください"
              />
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">書類アップロード</h2>
            
            <div className="space-y-4">
              {documentTypes.map((doc) => (
                <div key={doc.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{doc.label}</h3>
                    {doc.required && <span className="text-red-500 text-sm">必須</span>}
                  </div>
                  
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleDocumentUpload(doc.type, file);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  
                  <p className="text-xs text-gray-500 mt-1">
                    PDF、JPG、PNG形式に対応（最大5MB）
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ボタンエリア */}
        <div className="mt-6 space-y-3">
          <Button
            onClick={handleNext}
            loading={isSubmitting || uploadingDocuments}
            className="w-full"
            variant="primary"
          >
            {step === 1 ? '次へ' : '登録完了'}
          </Button>
          
          {step === 2 && (
            <Button
              onClick={() => setStep(1)}
              className="w-full"
              variant="secondary"
            >
              戻る
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
