import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'CStore — открытый каталог приложений',
    template: '%s · CStore',
  },
  description:
    'CremnityStore (CStore) — открытый каталог Android-приложений: свободные лицензии, прозрачные сборки и быстрые загрузки прямо из репозитория.',
  applicationName: 'CStore',
  keywords: ['CStore', 'CremnityStore', 'каталог приложений', 'Android', 'APK', 'open source'],
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'CStore — открытый каталог приложений',
    description: 'Приложения с открытым исходным кодом, собранные сообществом Cremnity.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#050408',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-[family-name:var(--font-body)] min-h-screen antialiased">
        <div className="aurora" aria-hidden />
        <div className="grid-lines" aria-hidden />
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
