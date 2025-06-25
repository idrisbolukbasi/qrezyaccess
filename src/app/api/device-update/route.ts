import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin SDK'sını App Hosting ortamı için doğru şekilde başlat
// getApps().length === 0 kontrolü, geliştirme sırasında yeniden yüklemelerde tekrar başlatmayı önler
if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault() // App Hosting'de otomatik kimlik bilgileri için bu kullanılır
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    // Önce isteğin bir gövdesi olup olmadığını kontrol et
    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json({ error: 'İstek gövdesi boş' }, { status: 400 });
    }
    
    const data = JSON.parse(rawBody);

    console.log('Gelen eWeLink verisi:', data);

    const { deviceid, params } = data;

    if (!deviceid || !params) {
      return NextResponse.json({ error: 'Eksik deviceid veya params' }, { status: 400 });
    }

    // `devices` koleksiyonu yerine `device_updates` gibi daha anlamlı bir isim kullanalım
    // veya orijinal haliyle bırakalım. Şimdilik orijinaliyle devam ediyorum.
    await db.collection('devices').doc(deviceid).set(
      {
        updatedAt: new Date(),
        params: params,
      },
      { merge: true } // mevcutsa üzerine yazar
    );

    return NextResponse.json({ message: 'Firestore kaydı başarılı' });
  } catch (error: any) {
    console.error('Firestore hata:', error);
    // JSON parse hatası olup olmadığını kontrol et
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Geçersiz JSON formatı', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Firestore hatası', details: error.message }, { status: 500 });
  }
}
