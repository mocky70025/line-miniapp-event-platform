'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function StoreHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initLiff = async () => {
      try {
        // 出店者用のLIFF IDで初期化
        const success = await liffManager.init('store');
        if (success && liffManager.isLoggedIn()) {
          const profile = await liffManager.getUserProfile();
          setUser(profile);
          setIsLoggedIn(true);
        } else if (success) {
          // LIFF初期化は成功したがログインしていない
          console.log('LIFF initialized but not logged in');
        } else {
          // LIFF初期化に失敗
          console.error('LIFF initialization failed');
          setError('LIFF初期化に失敗しました。環境変数 NEXT_PUBLIC_LIFF_ID_STORE が設定されているか確認してください。');
        }
      } catch (error) {
        console.error('LIFF initialization failed:', error);
        setError(`LIFF初期化エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            環境変数が正しく設定されているか確認してください。
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              再読み込み
            </Button>
            <Button 
              onClick={() => liffManager.login('store')}
              variant="secondary"
              className="w-full"
            >
              LINEでログイン
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">
            LINEアカウントでログインして、出店者向け機能をご利用ください。
          </p>
          <Button 
            onClick={() => liffManager.login('store')}
            className="w-full"
          >
            LINEでログイン
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <h2 className="text-xl font-bold mb-4">出店者メニュー</h2>
        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/store/events')}
            className="w-full"
          >
            イベント一覧
          </Button>
          <Button 
            onClick={() => router.push('/store/profile')}
            variant="secondary"
            className="w-full"
          >
            プロフィール設定
          </Button>
        </div>
      </Card>

      {user && (
        <Card>
          <h3 className="font-bold mb-2">ユーザー情報</h3>
          <p className="text-sm text-gray-600">
            名前: {user.displayName}
          </p>
          {user.pictureUrl && (
            <img 
              src={user.pictureUrl} 
              alt="プロフィール画像" 
              className="w-16 h-16 rounded-full mt-2"
            />
          )}
        </Card>
      )}
    </div>
  );
}
