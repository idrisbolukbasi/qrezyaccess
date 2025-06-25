'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react'; // Hover state'leri için eklendi

export default function AppBar() {
  const pathname = usePathname();

  // Link hover durumları için state'ler
  const [isStoreLoginHovered, setIsStoreLoginHovered] = useState(false);
  const [isUserLoginHovered, setIsUserLoginHovered] = useState(false);


  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 30px', // Biraz daha dikey boşluk
      backgroundColor: '#1A1A1A', // Daha koyu arka plan
      color: '#F5F5F5', // Başlık metin rengi
      boxShadow: '0 3px 8px rgba(0,0,0,0.5)', // Daha belirgin ve keskin gölge
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Logo */}
        <Image
          src="/images/Logo.png"
          alt="QRezy Access Logo" // Alt metin daha açıklayıcı
          width={160} // Biraz daha büyük logo
          height={55} // Oranı koruyarak yükseklik
          style={{ cursor: 'pointer', borderRadius: '5px' }} // Hafif yuvarlak köşeler
          onClick={() => window.location.href = '/'} // Logoya tıklayınca anasayfaya git
        />
      </div>

      <nav style={{ display: 'flex', gap: '25px' }}> {/* Butonlar arası boşluk arttırıldı */}
        {pathname === '/' && (
          <>
            <Link
              href="/auth/login"
              style={{
                ...navLinkStyle,
                backgroundColor: isStoreLoginHovered ? '#FF6B6B' : 'transparent', // Turuncu vurgu
                color: isStoreLoginHovered ? '#1A1A1A' : '#E0E0E0', // Hover'da metin rengi
                border: isStoreLoginHovered ? '1px solid #FF6B6B' : '1px solid #777777', // Hover'da border
                boxShadow: isStoreLoginHovered ? '0 0 10px rgba(255, 107, 107, 0.4)' : 'none', // Parlama efekti
                fontWeight: isStoreLoginHovered ? 'bold' : 'normal',
              }}
              onMouseEnter={() => setIsStoreLoginHovered(true)}
              onMouseLeave={() => setIsStoreLoginHovered(false)}
            >
                Mağaza Girişi
            </Link>
            <Link
              href="/auth/register"
              style={{
                ...navLinkStyle,
                backgroundColor: isUserLoginHovered ? '#4ECDC4' : 'transparent', // Turkuaz vurgu
                color: isUserLoginHovered ? '#1A1A1A' : '#E0E0E0', // Hover'da metin rengi
                border: isUserLoginHovered ? '1px solid #4ECDC4' : '1px solid #777777', // Hover'da border
                boxShadow: isUserLoginHovered ? '0 0 10px rgba(78, 205, 196, 0.4)' : 'none', // Parlama efekti
                fontWeight: isUserLoginHovered ? 'bold' : 'normal',
              }}
              onMouseEnter={() => setIsUserLoginHovered(true)}
              onMouseLeave={() => setIsUserLoginHovered(false)}
            >
                Kullanıcı Girişi
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

// Linkler için temel stil
const navLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '10px 20px', // Biraz daha büyük butonlar
  borderRadius: '8px', // Daha yuvarlak köşeler
  transition: 'all 0.3s ease-in-out', // Tüm geçişler için daha pürüzsüz
  cursor: 'pointer',
  whiteSpace: 'nowrap', // Metnin tek satırda kalmasını sağlar
};
