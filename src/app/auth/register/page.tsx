'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // setDoc'u import edin
import { auth, db } from '../../firebase.config';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button } from '@mui/material';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // Kullanıcı adı için
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
        display_name: displayName,
        role: 'client', // Varsayılan rol 'client'
        created_at: new Date(),
      });

      console.log('Kayıt başarılı! AuthMiddleware yönlendirecek...');
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
            border: '1px solid #3A3A3A',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: '#FF6B6B', // Turuncu başlık rengi
              marginBottom: '30px',
              fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Yeni Hesap Oluştur
          </Typography>
          <form onSubmit={handleRegister}>
             <TextField
              fullWidth
              label="Görünen Ad (Opsiyonel)"
              variant="outlined"
              margin="normal"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              sx={{
                marginBottom: '20px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#777777' },
                  '&:hover fieldset': { borderColor: '#FF6B6B' }, // Odakta turuncu border
                  '&.Mui-focused fieldset': { borderColor: '#FF6B6B', borderWidth: '2px' },
                  color: '#E0E0E0',
                  backgroundColor: '#1A1A1A',
                  borderRadius: '8px',
                },
                '& .MuiInputLabel-root': { color: '#B0B0B0' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF6B6B' },
              }}
            />
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
                marginBottom: '20px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#777777' },
                  '&:hover fieldset': { borderColor: '#FF6B6B' },
                  '&.Mui-focused fieldset': { borderColor: '#FF6B6B', borderWidth: '2px' },
                  color: '#E0E0E0',
                  backgroundColor: '#1A1A1A',
                  borderRadius: '8px',
                },
                '& .MuiInputLabel-root': { color: '#B0B0B0' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF6B6B' },
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
                  '&:hover fieldset': { borderColor: '#FF6B6B' },
                  '&.Mui-focused fieldset': { borderColor: '#FF6B6B', borderWidth: '2px' },
                  color: '#E0E0E0',
                  backgroundColor: '#1A1A1A',
                  borderRadius: '8px',
                },
                '& .MuiInputLabel-root': { color: '#B0B0B0' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF6B6B' },
              }}
            />
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 2, color: '#FF6B6B' }}>
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
                bgcolor: '#FF6B6B', // Turuncu rengi
                color: '#1A1A1A', // Koyu metin
                padding: '12px 25px',
                borderRadius: '8px',
                fontSize: '1.05rem',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(255, 107, 107, 0.4)',
                '&:hover': {
                  bgcolor: '#E05D5D',
                  boxShadow: '0 8px 20px rgba(255, 107, 107, 0.6)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 3, color: '#B0B0B0' }}>
            Zaten hesabınız var mı? <Button onClick={() => router.push('/auth/login')} sx={{ color: '#4ECDC4', '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' } }}>Giriş Yap</Button>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
