'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { liffManager } from '@/lib/liff';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  maxStores: number;
  currentApplications: number;
  fee: number;
  status: 'draft' | 'published' | 'closed' | 'completed';
  applicationDeadline: string;
  createdAt: string;
}

interface Application {
  id: string;
  eventId: string;
  storeName: string;
  contactName: string;
  phone: string;
  email: string;
  productDescription: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  documents: {
    businessLicense?: boolean;
    productPhotos?: boolean;
  };
}

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const success = await liffManager.init('organizer');
        if (!success || !liffManager.isLoggedIn()) {
          await liffManager.login('organizer');
          return;
        }
        const liffUser = await liffManager.getUserProfile();
        setUser(liffUser);

        // ダミーデータ
        const dummyEvents: Event[] = [
          {
            id: '1',
            title: '第1回 ハンドメイドフェス',
            date: '2025-12-24',
            location: '渋谷ヒカリエホール',
            maxStores: 20,
            currentApplications: 15,
            fee: 5000,
            status: 'published',
            applicationDeadline: '2025-11-30',
            createdAt: '2025-11-01'
          },
          {
            id: '2',
            title: 'フリーマーケット in 代々木',
            date: '2025-12-15',
            location: '代々木公園',
            maxStores: 50,
            currentApplications: 8,
            fee: 3000,
            status: 'published',
            applicationDeadline: '2025-12-01',
            createdAt: '2025-11-15'
          },
          {
            id: '3',
            title: 'クリスマスフードフェス',
            date: '2025-12-20',
            location: '新宿中央公園',
            maxStores: 30,
            currentApplications: 25,
            fee: 8000,
            status: 'closed',
            applicationDeadline: '2025-11-25',
            createdAt: '2025-10-20'
          }
        ];
        setEvents(dummyEvents);
      } catch (error) {
        console.error('データ読み込みエラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const loadApplications = async (eventId: string) => {
    setIsLoadingApplications(true);
    try {
      // ダミーの申込データ
      const dummyApplications: Application[] = [
        {
          id: 'app-1',
          eventId: eventId,
          storeName: 'アクセサリー工房 花',
          contactName: '田中花子',
          phone: '090-1111-2222',
          email: 'hanako@example.com',
          productDescription: '手作りのアクセサリーと雑貨を販売します。',
          status: 'pending',
          appliedAt: '2025-11-20',
          documents: {
            businessLicense: true,
            productPhotos: true
          }
        },
        {
          id: 'app-2',
          eventId: eventId,
          storeName: '焼き菓子の店 スイーツ',
          contactName: '佐藤太郎',
          phone: '090-3333-4444',
          email: 'taro@example.com',
          productDescription: '手作りクッキーとケーキを販売します。',
          status: 'approved',
          appliedAt: '2025-11-18',
          documents: {
            businessLicense: true,
            productPhotos: true
          }
        },
        {
          id: 'app-3',
          eventId: eventId,
          storeName: '古着屋 ヴィンテージ',
          contactName: '山田次郎',
          phone: '090-5555-6666',
          email: 'jiro@example.com',
          productDescription: 'ヴィンテージ古着とアクセサリーを販売します。',
          status: 'rejected',
          appliedAt: '2025-11-15',
          documents: {
            businessLicense: false,
            productPhotos: true
          }
        }
      ];
      setApplications(dummyApplications);
    } catch (error) {
      console.error('申込データ読み込みエラー:', error);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    loadApplications(event.id);
  };

  const handleApplicationStatusChange = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // 実際のAPI呼び出し
      console.log('申込ステータス変更:', { applicationId, newStatus });
      
      // ローカル状態を更新
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      alert(`申込を${newStatus === 'approved' ? '承認' : '却下'}しました。`);
    } catch (error) {
      console.error('ステータス変更エラー:', error);
      alert('ステータス変更に失敗しました。');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '下書き';
      case 'published': return '公開中';
      case 'closed': return '締切';
      case 'completed': return '完了';
      case 'pending': return '審査中';
      case 'approved': return '承認済み';
      case 'rejected': return '却下';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">イベント管理</h1>
        <Button onClick={() => router.push('/organizer/events/create')}>
          新しいイベントを作成
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* イベント一覧 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">作成したイベント</h2>
          {events.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">まだイベントがありません。</p>
              <Button 
                onClick={() => router.push('/organizer/events/create')}
                className="mt-4"
              >
                最初のイベントを作成
              </Button>
            </Card>
          ) : (
            events.map((event) => (
              <Card 
                key={event.id} 
                className={`p-4 cursor-pointer transition-colors ${
                  selectedEvent?.id === event.id ? 'ring-2 ring-primary-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleEventSelect(event)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {event.currentApplications} / {event.maxStores} 店舗
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {event.fee.toLocaleString()}円
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 申込一覧 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {selectedEvent ? `${selectedEvent.title} の申込` : 'イベントを選択してください'}
          </h2>
          
          {!selectedEvent ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">左側のイベントを選択して申込を確認してください。</p>
            </Card>
          ) : isLoadingApplications ? (
            <Card className="p-6 text-center">
              <LoadingSpinner />
            </Card>
          ) : applications.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">まだ申込がありません。</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{app.storeName}</h3>
                      <p className="text-sm text-gray-600">{app.contactName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {getStatusText(app.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">連絡先:</span> {app.phone}</p>
                    <p><span className="font-medium">メール:</span> {app.email}</p>
                    <p><span className="font-medium">商品説明:</span> {app.productDescription}</p>
                    <p><span className="font-medium">申込日:</span> {new Date(app.appliedAt).toLocaleDateString('ja-JP')}</p>
                    
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center">
                        {app.documents.businessLicense ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className="text-xs">営業許可証</span>
                      </div>
                      <div className="flex items-center">
                        {app.documents.productPhotos ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className="text-xs">商品写真</span>
                      </div>
                    </div>
                  </div>
                  
                  {app.status === 'pending' && (
                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={() => handleApplicationStatusChange(app.id, 'approved')}
                        size="sm"
                        className="flex-1"
                      >
                        承認
                      </Button>
                      <Button
                        onClick={() => handleApplicationStatusChange(app.id, 'rejected')}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        却下
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
