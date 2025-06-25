'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Firestore'a kullanıcı belgesini kaydet
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        display_name: displayName || email.split('@')[0], // Görünen ad yoksa e-postanın başını kullan
        role: 'client', // Varsayılan rol 'client'
        balance: 0,
        commission_rate: 0,
        created_at: new Date(),
      });

      // Başarılı kayıttan sonra authMiddleware yönlendirme yapacak
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      let errorMessage = 'Kayıt sırasında bir hata oluştu.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanımda.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Şifre en az 6 karakter olmalıdır.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta formatı.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
          <CardDescription>
            Başlamak için aşağıya bilgilerinizi girin.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Görünen Ad</Label>
              <Input
                id="display-name"
                type="text"
                placeholder="Adınız"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@mail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Zaten hesabınız var mı?{' '}
              <Link href="/auth/login" className="underline">
                Giriş Yap
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
