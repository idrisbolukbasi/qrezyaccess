'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button } from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Giriş başarılı! authMiddleware yönlendirecek...');
    } catch (err: any) {
      console.error('Giriş hatası:', err);
      let errorMessage = 'Giriş sırasında bir hata oluştu.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Geçersiz e-posta veya şifre.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta formatı.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1A1A', // Koyu tema arka planı
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: '#282828', // Kutu arka planı
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            textAlign: 'center',
            border: '1px solid #3A3A3A', // Hafif border
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: '#4ECDC4', // Turkuaz başlık rengi
              marginBottom: '30px',
              fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Mağaza Girişi
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="E-posta"
              variant="outlined"
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                marginBottom: '20px', // TextField'lar arası boşluk
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#777777' }, // Border rengi
                  '&:hover fieldset': { borderColor: '#4ECDC4' }, // Hover'da turkuaz border
                  '&.Mui-focused fieldset': { borderColor: '#4ECDC4', borderWidth: '2px' }, // Odakta daha belirgin turkuaz border
                  color: '#E0E0E0', // Input text color
                  backgroundColor: '#1A1A1A', // Input arka plan rengi
                  borderRadius: '8px', // Yuvarlak köşeler
                },
                '& .MuiInputLabel-root': { color: '#B0B0B0' }, // Label color
                '& .MuiInputLabel-root.Mui-focused': { color: '#4ECDC4' }, // Odakta label rengi
              }}
            />
            <TextField
              fullWidth
              label="Şifre"
              variant="outlined"
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                marginBottom: '20px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#777777' },
                  '&:hover fieldset': { borderColor: '#4ECDC4' },
                  '&.Mui-focused fieldset': { borderColor: '#4ECDC4', borderWidth: '2px' },
                  color: '#E0E0E0',
                  backgroundColor: '#1A1A1A',
                  borderRadius: '8px',
                },
                '& .MuiInputLabel-root': { color: '#B0B0B0' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4ECDC4' },
              }}
            />
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 2, color: '#FF6B6B' }}> {/* Hata rengi */}
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                bgcolor: '#4ECDC4', // Turkuaz rengi
                color: '#1A1A1A', // Koyu metin
                padding: '12px 25px', // Buton boyutu
                borderRadius: '8px', // Yuvarlak köşeler
                fontSize: '1.05rem',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(78, 205, 196, 0.4)',
                '&:hover': {
                  bgcolor: '#3DB0A6',
                  boxShadow: '0 8px 20px rgba(78, 205, 196, 0.6)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 3, color: '#B0B0B0' }}>
            Hesabınız yok mu? <Button onClick={() => router.push('/auth/register')} sx={{ color: '#FF6B6B', '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' } }}>Kayıt Ol</Button>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
