import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LINE Mini App - 出店者向け',
  description: 'イベント出店者向けのLINE Mini App',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00C300',
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-line-green text-white p-4 text-center">
        <h1 className="text-lg font-bold">出店者向け</h1>
      </div>
      {children}
    </div>
  );
}
