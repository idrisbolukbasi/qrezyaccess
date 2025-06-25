'use client'; // This directive must be at the top of the file.

import { useEffect, useState } from 'react';
import { useAuth } from '../authMiddleware'; // Importing useAuth from the correct location
import { doc, getDoc } from 'firebase/firestore'; // Only used imports are kept
import { db, auth } from '../firebase.config';
import { signOut } from 'firebase/auth';

interface UserData {
  email: string;
  role: 'user' | 'substore' | 'admin';
  display_name?: string;
  balance?: number;
  commission_rate?: number;
}

export default function UserPanel() {
  const { user, loading: authLoading } = useAuth(); // 'role' is removed as it was unused
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authLoading && user) {
        setLoadingData(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserData);
          }
        } catch (err: unknown) {
          console.error("Error fetching user data:", err);
          // Error handling can be added
        } finally {
          setLoadingData(false);
        }
      } else if (!authLoading && !user) {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (authLoading || loadingData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em', color: '#e0e0e0' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#e0e0e0' }}>
        <h1 style={{ color: '#f0f0f0' }}>Unauthorized Access</h1>
        <p>You do not have permission to access this page. Please log in.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#f0f0f0' }}>User Panel</h1>
        <button onClick={handleLogout} style={buttonStyle}>Logout</button>
      </div>

      <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.1em', color: '#e0e0e0' }}>
        Hello <strong style={{color: '#fff'}}>{userData?.display_name || user?.email}</strong>! This is your user panel.
      </p>

      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        marginBottom: '40px'
      }}>
        <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>Account Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', color: '#e0e0e0' }}>
          <p><strong>Email:</strong> {userData?.email || 'N/A'}</p>
          <p><strong>Display Name:</strong> {userData?.display_name || 'N/A'}</p>
          <p><strong>Role:</strong> {userData?.role || 'N/A'}</p> {/* Display role if it's available in userData */}
          <p><strong>Balance:</strong> {userData?.balance !== undefined ? userData.balance.toFixed(2) + ' TL' : 'N/A'}</p>
          <p><strong>Commission Rate:</strong> {userData?.commission_rate !== undefined ? userData.commission_rate.toFixed(2) + '%' : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

// Common style objects
const buttonStyle: React.CSSProperties = {
    padding: '12px 20px',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    opacity: 1,
    transition: 'background-color 0.2s ease-in-out, opacity 0.2s ease-in-out',
    backgroundColor: '#007bff'
};

