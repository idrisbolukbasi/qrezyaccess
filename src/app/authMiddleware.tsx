'use client'; // Bu direktif dosyanın en üstünde olmalıdır.

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.config';
import { useRouter, usePathname } from 'next/navigation';

// AuthContext için tip tanımı
interface AuthContextType {
  user: FirebaseUser | null;
  role: 'admin' | 'substore' | 'client' | null;
  loading: boolean;
}

// AuthContext oluşturulması
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider bileşeni
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<'admin' | 'substore' | 'client' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('AuthMiddleware useEffect başladı. Mevcut pathname:', pathname);
    console.log('Başlangıç yükleme durumu:', loading);

    // Firebase kimlik doğrulama durumu değişikliklerini dinle
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('onAuthStateChanged tetiklendi. FirebaseUser:', firebaseUser ? firebaseUser.uid : 'null');

      if (firebaseUser) {
        setUser(firebaseUser);
        console.log('Kullanıcı tespit edildi:', firebaseUser.uid, 'Rol çekiliyor...');
        try {
          // Kullanıcı belgesini Firestore'dan çek
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('Firestore kullanıcı verisi:', userData);
            setRole(userData.role);
            console.log('Kullanıcı rolü ayarlandı:', userData.role);

            // Kullanıcı rolüne göre yönlendirme mantığı
            // Mevcut sayfa zaten doğru rolün sayfası değilse yönlendir
            if (userData.role === 'admin' && pathname !== '/admin') {
              console.log('Yönetici rolü, /admin sayfasına yönlendiriliyor.');
              router.push('/admin');
            } else if (userData.role === 'substore' && pathname !== '/substore') {
              console.log('Alt mağaza rolü, /substore sayfasına yönlendiriliyor.');
              router.push('/substore');
            } else if (userData.role === 'client' && pathname !== '/user') {
              console.log('Müşteri rolü, /user sayfasına yönlendiriliyor.');
              router.push('/user');
            } else {
              console.log('Kullanıcı doğru rol sayfasında veya özel bir yönlendirme yok.');
            }
          } else {
            // Kullanıcı belgesi yoksa, varsayılan rol 'client' ata
            console.warn('Firestore\'da kullanıcı belgesi bulunamadı. Varsayılan rol "client" olarak ayarlanıyor ve /user sayfasına yönlendiriliyor.');
            setRole('client');
            router.push('/user'); // Varsayılan olarak kullanıcı sayfasına yönlendir
          }
        } catch (error: unknown) {
          console.error("Firestore'dan kullanıcı rolü çekilirken hata (catch bloğu):", error);
          const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
          console.error(`Kullanıcı rolü hatası: ${errorMessage}`);
          setRole(null); // Rolü sıfırla veya varsayılan bir değer ata
          // Hata durumunda da yükleme durumunu kapatmayı unutmayın
          setLoading(false);
        }
      } else {
        // Kullanıcı oturumu kapalıysa
        console.log('Kullanıcı oturumu kapalı.');
        setUser(null);
        setRole(null);
        // Oturum kapalıyken giriş veya kayıt sayfasına yönlendir
        if (pathname !== '/' && pathname !== '/auth/register' && pathname !== '/auth/login') { // /auth/login eklendi
          console.log('Oturum kapalı ve giriş/kayıt sayfasında değil, ana sayfaya yönlendiriliyor.');
          router.push('/');
        } else {
          console.log('Oturum kapalı ancak zaten giriş/kayıt sayfasında.');
        }
      }
      setLoading(false); // Yükleme durumunu kapat
      console.log('AuthMiddleware yükleme durumu güncellendi: ', false);
    });

    // useEffect temizleme fonksiyonu: Aboneliği iptal et
    return () => {
      console.log('AuthMiddleware useEffect temizlendi.');
      unsubscribe();
    };
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth özel hook'u
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth, bir AuthProvider içinde kullanılmalıdır.');
  }
  return context;
};
