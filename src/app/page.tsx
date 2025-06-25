'use client';

import Image from 'next/image';
import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import { useRouter } from 'next/navigation';

// Sistem fontlarını veya tercih edilen bir web fontunu kullanın
const bodyFontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'; // Inter fontu ekledim
const headingFontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';


// Ana Sayfa bileşeni
export default function Home() {
  const router = useRouter();

  const handleStoreLoginClick = () => {
    router.push('/auth/login');
  };

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundImage: 'url(/images/QRezy_Access_Homepage_Image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#F5F5F5', // Metin rengini ayarla
          textAlign: 'center',
          padding: { xs: '40px 20px', md: '60px 40px' }, // Responsive padding
          fontFamily: bodyFontFamily,
        }}
      >
        <Container>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              textAlign: 'left',
              fontFamily: headingFontFamily,
              fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4.5rem' }, // Daha büyük ve responsive başlık
              lineHeight: 1.1,
              color: '#F5F5F5', // Başlık metin rengi
              textShadow: '2px 2px 5px rgba(0,0,0,0.7)', // Okunabilirliği artırmak için gölge
            }}
          >
            QR Kod ile Sorunsuz ve Güvenli Erişim
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              textAlign: 'left',
              maxWidth: '650px',
              fontFamily: bodyFontFamily,
              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' }, // Daha büyük ve responsive metin
              lineHeight: 1.4,
              opacity: 0.9,
              color: '#E0E0E0', // Metin rengi
            }}
          >
            QRezy Access ile Erişim Noktalarınızı Kolayca Yönetin
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleStoreLoginClick}
            sx={{
              mt: 4, // Üstten boşluk artırıldı
              alignSelf: 'flex-start',
              fontFamily: bodyFontFamily,
              bgcolor: '#4ECDC4', // Turkuaz rengi
              color: '#1A1A1A', // Koyu metin
              padding: '15px 35px', // Buton boyutu
              borderRadius: '10px', // Daha yuvarlak köşeler
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(78, 205, 196, 0.4)', // Turkuaz gölge
              '&:hover': {
                bgcolor: '#3DB0A6', // Hover'da biraz daha koyu turkuaz
                boxShadow: '0 8px 20px rgba(78, 205, 196, 0.6)',
                transform: 'translateY(-2px)', // Hafif yukarı hareket
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Daha Fazla Bilgi Edinin
          </Button>
        </Container>
      </Box>

      {/* About Section */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#282828', fontFamily: bodyFontFamily, color: '#E0E0E0' }}>
        <Container>
          <Typography
            variant="h4"
            component="h2"
            align="left"
            gutterBottom
            sx={{
              fontFamily: headingFontFamily,
              fontSize: { xs: '2.2rem', md: '3rem' },
              lineHeight: 1.2,
              color: '#F5F5F5', // Başlık metin rengi
              marginBottom: '30px',
            }}
          >
            QRezy Access Hakkında
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: { xs: 4, md: 8 },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'left',
                  fontFamily: bodyFontFamily,
                  fontSize: { xs: '1.05rem', md: '1.15rem' },
                  lineHeight: 1.7,
                  color: '#E0E0E0', // Metin rengi
                }}
              >
                QRezy Access, QR kod teknolojisini kullanarak modern ve güvenli erişim çözümleri sunan bir platformdur. Misyonumuz, işletmelerin ve kullanıcıların erişim yönetimi süreçlerini basitleştirmek, güvenliği artırmak ve verimliliği maksimize etmektir. Yenilikçi yaklaşımımızla, geleneksel erişim yöntemlerinin zorluklarını aşmayı hedefliyoruz.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '50%' } }}>
              <Image
                src="/images/qr_scan_icon.png"
                alt="About QRezy Access"
                width={600} // Daha büyük boyut
                height={350} // Oranı koruyarak yükseklik
                layout="responsive"
                style={{ borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} // Görsel iyileştirmeler
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#1A1A1A', fontFamily: bodyFontFamily, color: '#E0E0E0' }}>
        <Container>
          <Typography
            variant="h4"
            component="h2"
            align="left"
            gutterBottom
            sx={{
              fontFamily: headingFontFamily,
              fontSize: { xs: '2.2rem', md: '3rem' },
              lineHeight: 1.2,
              color: '#F5F5F5', // Başlık metin rengi
              marginBottom: '30px',
            }}
          >
            Hizmetlerimiz
          </Typography>
          {/* Flexbox container for Services cards */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}
          >
            {/* Her Kart için Tekrarlayan Stil */}
            {[
              {
                title: 'QR Kod ile Güvenli Giriş',
                description: 'Kullanıcılarınızın QR kodlarını tarayarak hızlı ve güvenli bir şekilde erişim sağlamasını sağlayın. Fiziksel kartlara veya anahtarlara olan ihtiyacı ortadan kaldırın.'
              },
              {
                title: 'Erişim Noktası Yönetimi',
                description: 'Erişim noktalarınızı kolayca ekleyin, düzenleyin ve yönetin. Hangi kullanıcının hangi noktalara erişebileceğini belirleyin.'
              },
              {
                title: 'Kullanıcı ve Alt Mağaza Yönetimi',
                description: 'Kullanıcı hesaplarını yönetin ve alt mağazalar için özel erişim izinleri tanımlayın. Esnek ve ölçeklenebilir yönetim araçları.'
              },
              {
                title: 'Erişim Kayıtlarını İzleme',
                description: 'Tüm erişim aktivitelerini detaylı olarak takip edin. Kimin ne zaman ve nereye eriştiğini görün.'
              },
              {
                title: 'Cihaz Entegrasyonu',
                description: 'QR kod okuyucu cihazlarınızla kolayca entegre olun. Mevcut altyapınıza uyum sağlayın.'
              },
              {
                title: 'Özelleştirilebilir Çözümler',
                description: 'İşletmenizin özel ihtiyaçlarına uygun erişim çözümleri için bizimle iletişime geçin.'
              },
            ].map((service, index) => (
              <Box key={index} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' }, maxWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' }, display: 'flex' }}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  backgroundColor: '#282828', // Kart arka planı
                  borderRadius: '10px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)', // Hover'da kartın hafifçe yükselmesi
                    boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, padding: '25px' }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontFamily: headingFontFamily,
                        fontSize: { xs: '1.25rem', md: '1.4rem' },
                        lineHeight: 1.3,
                        color: '#4ECDC4', // Turkuaz başlık
                        marginBottom: '15px',
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: bodyFontFamily,
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        lineHeight: 1.6,
                        color: '#E0E0E0', // Metin rengi
                      }}
                    >
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#282828', textAlign: 'center', fontFamily: bodyFontFamily, color: '#E0E0E0' }}>
        <Container>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontFamily: headingFontFamily,
              fontSize: { xs: '2.2rem', md: '3rem' },
              lineHeight: 1.2,
              color: '#F5F5F5', // Başlık metin rengi
              marginBottom: '30px',
            }}
          >
            Bizimle İletişime Geçin
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: bodyFontFamily,
              fontSize: { xs: '1.05rem', md: '1.15rem' },
              lineHeight: 1.6,
              mb: 4, // Buton ile arasına boşluk artırıldı
              color: '#E0E0E0', // Metin rengi
            }}
          >
            QRezy Access hakkında daha fazla bilgi almak veya bir demo talep etmek için bizimle iletişime geçin.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 2, // Üstten boşluk
              fontFamily: bodyFontFamily,
              bgcolor: '#FF6B6B', // Turuncu rengi
              color: '#1A1A1A', // Koyu metin
              padding: '15px 35px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(255, 107, 107, 0.4)', // Turuncu gölge
              '&:hover': {
                bgcolor: '#E05D5D', // Hover'da biraz daha koyu turuncu
                boxShadow: '0 8px 20px rgba(255, 107, 107, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            İletişim Formu
          </Button>
        </Container>
      </Box>
    </>
  );
}
