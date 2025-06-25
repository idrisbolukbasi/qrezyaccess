import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin SDK (Service Account ile)
// getApps().length === 0 check is to prevent re-initializing in development hot reloading
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    console.log('Gelen eWeLink verisi:', data);

    const { deviceid, params } = data;

    if (!deviceid || !params) {
      return NextResponse.json({ error: 'Eksik deviceid veya params' }, { status: 400 });
    }

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
    return NextResponse.json({ error: 'Firestore hatası', details: error.message }, { status: 500 });
  }
}