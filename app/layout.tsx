import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n';
import { BottomNav } from '@/components/layout/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saison',
  description: 'Eat with the seasons — track diversity, plan with family, discover seasonal produce.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <I18nProvider>
            <main style={{ maxWidth: 430, margin: '0 auto', position: 'relative', minHeight: '100dvh' }}>
              {children}
              <BottomNav />
            </main>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
