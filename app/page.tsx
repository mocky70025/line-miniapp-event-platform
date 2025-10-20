'use client';

import { useEffect, useState } from 'react';
import { liffManager } from '@/lib/liff';
import { supabaseService } from '@/lib/supabase';
import { User, LiffUser } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [liffUser, setLiffUser] = useState<LiffUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // LIFF初期化
      const liffInitialized = await liffManager.init();
      if (!liffInitialized) {
        throw new Error('LIFF初期化に失敗しました');
      }

      if (liffManager.isLoggedIn()) {
        const liffUserData = liffManager.getUser();
        setLiffUser(liffUserData);

        if (liffUserData) {
          // データベースからユーザー情報を取得
          const userData = await supabaseService.getUserByLineId(liffUserData.userId);
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('アプリ初期化エラー:', error);
      setError(error instanceof Error ? error.message : 'アプリの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await liffManager.login();
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('ログインに失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">初期化中...</p>
        </div>
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
            <Button onClick={initializeApp} variant="primary">
              再試行
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎪</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              イベント出店・主催プラットフォーム
            </h1>
            <p className="text-gray-600 mb-8">
              LINEで簡単にイベントの出店申し込みや主催ができます
            </p>
            <Button onClick={handleLogin} variant="line" className="w-full">
              LINEでログイン
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
            <h1 className="text-lg font-bold text-gray-900">
              イベントプラットフォーム
            </h1>
            <div className="flex items-center space-x-2">
              {liffUser?.pictureUrl && (
                <img
                  src={liffUser.pictureUrl}
                  alt="プロフィール"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">
                {user?.name || liffUser?.displayName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* ユーザータイプ別メニュー */}
          {user?.user_type === 'store' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">店舗メニュー</h2>
              <div className="grid gap-4">
                <Link href="/events" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">📋</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">イベント一覧</h3>
                        <p className="text-sm text-gray-600">出店可能なイベントを確認</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link href="/profile" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">👤</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">登録情報変更</h3>
                        <p className="text-sm text-gray-600">基本情報や書類を更新</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link href="/applications" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">📝</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">申し込み履歴</h3>
                        <p className="text-sm text-gray-600">過去の申し込みを確認</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          )}

          {user?.user_type === 'organizer' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">主催メニュー</h2>
              <div className="grid gap-4">
                <Link href="/events/create" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">➕</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">イベント掲載</h3>
                        <p className="text-sm text-gray-600">新しいイベントを作成</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link href="/events/manage" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">📊</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">イベント管理</h3>
                        <p className="text-sm text-gray-600">掲載中のイベントを管理</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link href="/profile" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">👤</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">登録情報変更</h3>
                        <p className="text-sm text-gray-600">基本情報を更新</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          )}

          {/* 新規登録の場合 */}
          {!user && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">アカウント設定</h2>
              <div className="grid gap-4">
                <Link href="/register/store" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">🏪</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">店舗として登録</h3>
                        <p className="text-sm text-gray-600">イベントに出店したい方</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link href="/register/organizer" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">🎪</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">主催として登録</h3>
                        <p className="text-sm text-gray-600">イベントを開催したい方</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
