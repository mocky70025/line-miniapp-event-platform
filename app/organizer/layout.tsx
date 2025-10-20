import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LINE Mini App - 主催者向け',
  description: 'イベント主催者向けのLINE Mini App',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00C300',
};

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-600 text-white p-4 text-center">
        <h1 className="text-lg font-bold">主催者向け</h1>
      </div>
      {children}
    </div>
  );
}
