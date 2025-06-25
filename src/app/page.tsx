'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, ShieldCheck, Cog, Users, ClipboardList } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-primary" />,
      title: 'QR Kod ile Güvenli Giriş',
      description: 'Fiziksel kart veya anahtarlara ihtiyaç duymadan, QR kod okutarak hızlı ve güvenli erişim sağlayın.',
    },
    {
      icon: <Cog className="w-10 h-10 text-primary" />,
      title: 'Erişim Noktası Yönetimi',
      description: 'Erişim noktalarınızı kolayca ekleyin, düzenleyin ve hangi kullanıcının nereye erişebileceğini yönetin.',
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: 'Kullanıcı ve Alt Mağaza Yönetimi',
      description: 'Kullanıcı hesaplarını ve alt mağazalar için özel erişim izinlerini esnek ve ölçeklenebilir araçlarla yönetin.',
    },
    {
      icon: <ClipboardList className="w-10 h-10 text-primary" />,
      title: 'Detaylı Erişim Kayıtları',
      description: 'Tüm erişim aktivitelerini detaylı olarak takip edin. Kimin, ne zaman ve nereye eriştiğini anlık olarak görün.',
    },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    QR Kod ile Sorunsuz ve Güvenli Erişim
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    QRezy Access ile erişim noktalarınızı kolayca yönetin. İşletmeniz için modern, hızlı ve güvenilir bir çözüm.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/auth/login">Hemen Başla</Link>
                  </Button>
                </div>
              </div>
               <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="access control security"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="qr-scan" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center">
             <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Erişim için QR Kodu Tara</h2>
             <p className="max-w-[700px] text-muted-foreground md:text-xl mb-8">
                Giriş yapmak istediğiniz noktadaki QR kodu okutmak için aşağıdaki butona tıklayın.
             </p>
            <Button asChild variant="default" size="lg" className="h-20 w-20 rounded-full p-0">
                <Link href="/qr-scan">
                    <QrCode className="h-10 w-10 text-secondary-foreground" />
                    <span className="sr-only">QR Kodu Tara</span>
                </Link>
            </Button>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Neden QRezy Access?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Platformumuz, işletmenizin erişim kontrol ihtiyaçları için kapsamlı ve kullanıcı dostu çözümler sunar.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="h-full">
                  <CardHeader className="flex flex-col items-center text-center">
                    {feature.icon}
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 QRezy Access. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
