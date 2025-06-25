'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AppBar() {
  const pathname = usePathname();

  // Sadece ana sayfada butonları göster
  const showButtons = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/Logo.png"
            alt="QRezy Access Logo"
            width={130}
            height={45}
            priority
          />
        </Link>

        {showButtons && (
          <nav className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/auth/login">Mağaza Girişi</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Kullanıcı Girişi</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
