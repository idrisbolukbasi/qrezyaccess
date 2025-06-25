// src/app/layout.tsx
// Bu dosya, uygulamanın kök layout'unu tanımlar ve kimlik doğrulama sağlayıcısını içerir.

import './globals.css'; // Global CSS'i dahil et
import { Inter } from 'next/font/google'; // Inter fontunu import et
import { AuthProvider } from './authMiddleware'; // AuthProvider'ı doğru şekilde import et (named import)
import AppBar from '@/components/AppBar'; // AppBar bileşenini import et

const inter = Inter({ subsets: ['latin'] }); // Inter fontunu başlat

// Metadata tanımları
export const metadata = {
  title: 'QRezy Access',
  description: 'Ewelink Cihaz Yönetim Paneli',
};

// Kök layout bileşeni
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* AuthProvider ile tüm uygulamayı sarmala */}
        <AuthProvider>
          <AppBar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
