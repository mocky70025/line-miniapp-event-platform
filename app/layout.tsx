import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'イベント出店・主催プラットフォーム',
  description: 'LINEミニアプリでイベントの出店申し込みや主催ができるプラットフォーム',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#00C300',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* LIFF SDK */}
        <script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          defer
        />
        {/* メタタグ */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="イベントプラットフォーム" />
      </head>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
        {/* LIFF初期化スクリプト */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                if (typeof liff !== 'undefined') {
                  liff.init({ liffId: '${process.env.NEXT_PUBLIC_LIFF_ID}' })
                    .then(() => {
                      console.log('LIFF initialized successfully');
                    })
                    .catch((error) => {
                      console.error('LIFF initialization failed:', error);
                    });
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
