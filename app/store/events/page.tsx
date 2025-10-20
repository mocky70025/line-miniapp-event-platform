'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'open' | 'closed' | 'full';
}

export default function StoreEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ダミーデータ（実際はAPIから取得）
    const dummyEvents: Event[] = [
      {
        id: '1',
        title: 'フリーマーケット 2024春',
        description: '春のフリーマーケットです。出店者募集中！',
        date: '2024-04-15',
        location: '東京都渋谷区',
        status: 'open'
      },
      {
        id: '2',
        title: '手作り市',
        description: '手作りの作品を販売するイベントです。',
        date: '2024-04-20',
        location: '東京都新宿区',
        status: 'open'
      }
    ];

    setTimeout(() => {
      setEvents(dummyEvents);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">イベント一覧</h1>
        <Button 
          onClick={() => router.back()}
          variant="secondary"
        >
          戻る
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-600">現在募集中のイベントはありません</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{event.description}</p>
              <div className="text-sm text-gray-500 mb-3">
                <p>📅 {event.date}</p>
                <p>📍 {event.location}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${
                  event.status === 'open' ? 'bg-green-100 text-green-800' :
                  event.status === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {event.status === 'open' ? '募集中' :
                   event.status === 'closed' ? '募集終了' : '満員'}
                </span>
                <Button 
                  onClick={() => router.push(`/store/events/${event.id}`)}
                  disabled={event.status !== 'open'}
                  size="sm"
                >
                  詳細を見る
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
