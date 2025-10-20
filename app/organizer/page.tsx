'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function OrganizerHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const initLiff = async () => {
      try {
        // 主催者用のLIFF IDで初期化
        const success = await liffManager.init('organizer');
        if (success && liffManager.isLoggedIn()) {
          const profile = await liffManager.getUserProfile();
          setUser(profile);
          setIsLoggedIn(true);
        } else {
          // ログインが必要
          await liffManager.login('organizer');
        }
      } catch (error) {
        console.error('LIFF initialization failed:', error);
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

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">
            LINEアカウントでログインして、主催者向け機能をご利用ください。
          </p>
          <Button 
            onClick={() => liffManager.login('organizer')}
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
        <h2 className="text-xl font-bold mb-4">主催者メニュー</h2>
        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/organizer/events/create')}
            className="w-full"
          >
            イベント作成
          </Button>
          <Button 
            onClick={() => router.push('/organizer/events/manage')}
            variant="secondary"
            className="w-full"
          >
            イベント管理
          </Button>
          <Button 
            onClick={() => router.push('/organizer/profile')}
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
