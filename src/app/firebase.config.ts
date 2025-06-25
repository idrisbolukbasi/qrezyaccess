// src/firebase.config.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Bu satırı ekle!

const firebaseConfig = {
    apiKey: "AIzaSyAnab2ypuQ5Yu3XPfL27tS2Hl6EmNvZW38",
    authDomain: "qrezy-access.firebaseapp.com",
    projectId: "qrezy-access",
    storageBucket: "qrezy-access.firebasestorage.app",
    messagingSenderId: "598863812556",
    appId: "1:598863812556:web:9f12165cbbcd9d22b96f69"
  };

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app); // Bu satırı ekle!

