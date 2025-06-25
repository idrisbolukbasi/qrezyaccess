'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QrScanPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="absolute top-4 left-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-4">QR Kod Okuyucu</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Cihazınızın kamerasını kullanarak QR kodu taratın.
      </p>
      <div className="w-full max-w-md aspect-square bg-secondary rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Kamera alanı</p>
      </div>
    </div>
  );
}
