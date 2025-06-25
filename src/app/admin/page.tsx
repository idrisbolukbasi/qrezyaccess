'use client'; // 'use client' directive should be at the top of the file

import { useEffect, useState } from 'react';
import { useAuth } from '../authMiddleware'; // Importing useAuth from the correct location
// All necessary Firestore imports. 'serverTimestamp' is not imported as it is not used in this file.
import { collection, query, getDocs, doc, updateDoc, Timestamp, getDoc as firestoreGetDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.config'; // Corrected import statement: removed the extra '='
import { signOut } from 'firebase/auth';

// User data type definition
interface UserData {
  id: string;
  email: string;
  role: 'user' | 'substore' | 'admin';
  display_name: string;
  balance: number;
  commission_rate: number;
  created_at: Timestamp;
}

// Ewelink account type definition
interface EwelinkAccount {
  id: string;
  ewelink_email: string;
  ewelink_region: string;
  created_at: Timestamp;
}

export default function AdminPanel() {
  const { user, role, loading: authLoading } = useAuth(); // useAuth hook is used
  const [users, setUsers] = useState<UserData[]>([]); // User list state
  const [loadingUsers, setLoadingUsers] = useState(true); // User loading status state
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null); // Selected user state
  const [editRole, setEditRole] = useState<'user' | 'substore' | 'admin'>('user'); // Role to be edited state
  const [editCommissionRate, setEditCommissionRate] = useState<number>(0); // Commission rate to be edited state
  const [editBalance, setEditBalance] = useState<number>(0); // Balance to be edited state
  const [formMessage, setFormMessage] = useState<string | null>(null); // Form success message state
  const [formError, setFormError] = useState<string | null>(null); // Form error message state
  const [showEwelinkAccounts, setShowEwelinkAccounts] = useState<boolean>(false); // State to show Ewelink accounts
  const [userEwelinkAccounts, setUserEwelinkAccounts] = useState<EwelinkAccount[]>([]); // User's Ewelink accounts state
  const [loadingEwelinkAccounts, setLoadingEwelinkAccounts] = useState(false); // Ewelink accounts loading status state
  const [formLoading, setFormLoading] = useState(false); // Form submission/processing loading status state

  // useEffect hook to fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      // If authentication is complete and the user is an admin
      if (!authLoading && user && role === 'admin') {
        setLoadingUsers(true); // Start loading
        try {
          const usersRef = collection(db, 'users'); // Get a reference to the 'users' collection
          const q = query(usersRef); // Create a query to fetch all users
          const querySnapshot = await getDocs(q); // Execute the query
          // Convert fetched user data to UserData type and save to state
          const fetchedUsers: UserData[] = querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data() as Omit<UserData, 'id' | 'created_at'>, // Use data from Firestore document
            created_at: docSnap.data().created_at instanceof Timestamp ? docSnap.data().created_at : Timestamp.now(), // Check Timestamp type
          }));
          setUsers(fetchedUsers); // Update user list
        } catch (err: unknown) { // Error catching
          console.error("Error fetching users:", err);
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setFormError(`Failed to load users: ${errorMessage}`); // Show error message
        } finally {
          setLoadingUsers(false); // End loading
        }
      } else if (!authLoading && (!user || role !== 'admin')) {
        // If user is not admin or not logged in, stop loading
        setLoadingUsers(false);
      }
    };

    fetchUsers(); // Call the function
  }, [user, role, authLoading]); // Dependencies: user, role, and authentication loading status

  // Function to open the user edit form
  const handleEditUser = (userData: UserData) => {
    setSelectedUser(userData); // Select the user to be edited
    setEditRole(userData.role); // Set the role
    setEditCommissionRate(userData.commission_rate || 0); // Set the commission rate
    setEditBalance(userData.balance || 0); // Set the balance
    setFormMessage(null); // Clear messages
    setFormError(null); // Clear errors
    setShowEwelinkAccounts(false); // Hide Ewelink accounts when user editing is opened
    setUserEwelinkAccounts([]); // Clear Ewelink account list
  };

  // Function to save user changes
  const handleSaveUserChanges = async () => {
    if (!selectedUser) return; // Exit if no user is selected

    setFormLoading(true); // Start form loading
    setFormMessage(null); // Clear messages
    setFormError(null); // Clear errors

    try {
      const userDocRef = doc(db, 'users', selectedUser.id); // Get a reference to the user document
      await updateDoc(userDocRef, { // Update the document
        role: editRole,
        commission_rate: editCommissionRate,
        balance: editBalance,
      });

      // Update the user list instantly
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === selectedUser.id ? { ...u, role: editRole, commission_rate: editCommissionRate, balance: editBalance } : u
        )
      );
      setFormMessage('User information updated successfully!'); // Show success message
      setSelectedUser(null); // Close the form
    } catch (err: unknown) { // Error catching
      console.error("Error updating user:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setFormError(`Update failed: ${errorMessage}`); // Show error message
    } finally {
      setFormLoading(false); // End form loading
    }
  };

  // Function to fetch user's Ewelink accounts
  const handleFetchEwelinkAccounts = async (userId: string) => {
    setLoadingEwelinkAccounts(true); // Start loading
    setFormError(null); // Clear errors
    try {
      // Use aliased getDoc when fetching a single document
      const userDocRef = doc(db, 'users', userId); // Reference to the user document
      const userDocSnap = await firestoreGetDoc(userDocRef); // Use aliased getDoc

      if (!userDocSnap.exists()) {
        setFormError('Kullanıcı belgesi bulunamadı.');
        setLoadingEwelinkAccounts(false);
        return;
      }
      const accountsRef = collection(db, 'users', userId, 'ewelink_accounts'); // Get a reference to the Ewelink accounts collection
      const accountsSnapshot = await getDocs(accountsRef); // Fetch accounts
      // Convert fetched account data to EwelinkAccount type
      const fetchedAccounts: EwelinkAccount[] = accountsSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data() as Omit<EwelinkAccount, 'id' | 'created_at'>,
        created_at: docSnap.data().created_at instanceof Timestamp ? docSnap.data().created_at : Timestamp.now(),
      }));
      setUserEwelinkAccounts(fetchedAccounts); // Update Ewelink account list
      setShowEwelinkAccounts(true); // Show Ewelink accounts
    } catch (err: unknown) { // Error catching
      console.error("Error fetching Ewelink accounts:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setFormError(`Failed to load Ewelink accounts: ${errorMessage}`); // Show error message
    } finally {
      setLoadingEwelinkAccounts(false); // End loading
    }
  };

  // Logout function
  const handleLogout = async () => {
    await signOut(auth); // Sign out from Firebase
  };

  // Loading state display
  if (authLoading || loadingUsers) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em', color: '#e0e0e0' }}>
        Loading...
      </div>
    );
  }

  // Unauthorized access display
  if (!user || role !== 'admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#e0e0e0' }}>
        <h1 style={{ color: '#f0f0f0' }}>Unauthorized Access</h1>
        <p>You do not have permission to access this page. Please log in with an administrator account.</p>
      </div>
    );
  }

  // Admin panel interface
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#f0f0f0' }}>Admin Panel</h1>
        <button onClick={handleLogout} style={buttonStyle}>Logout</button>
      </div>

      <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.1em', color: '#e0e0e0' }}>
        Hello <strong style={{color: '#fff'}}>{user.email}</strong>! You can manage application users here.
      </p>

      {/* Message and Error Section */}
      {formMessage && <div style={{ color: '#28a745', backgroundColor: '#e6ffe61a', padding: '10px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #28a745' }}>{formMessage}</div>}
      {formError && <div style={{ color: '#dc3545', backgroundColor: '#ffe6e61a', padding: '10px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #dc3545' }}>{formError}</div>}

      {/* User List Section */}
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        marginBottom: '40px'
      }}>
        <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>User List</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#3a3a3a' }}>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Role</th>
              <th style={tableHeaderStyle}>Display Name</th>
              <th style={tableHeaderStyle}>Balance</th>
              <th style={tableHeaderStyle}>Commission Rate</th>
              <th style={tableHeaderStyle}>Registration Date</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #444' }}>
                <td style={tableCellStyle}>{u.email}</td>
                <td style={tableCellStyle}>{u.role}</td>
                <td style={tableCellStyle}>{u.display_name}</td>
                <td style={tableCellStyle}>{u.balance.toFixed(2)}</td>
                <td style={tableCellStyle}>{u.commission_rate.toFixed(2)}%</td>
                <td style={tableCellStyle}>{u.created_at.toDate().toLocaleString()}</td>
                <td style={tableCellStyle}>
                  <button
                    onClick={() => handleEditUser(u)}
                    style={{ ...buttonStyle, backgroundColor: '#007bff', marginRight: '10px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleFetchEwelinkAccounts(u.id)}
                    style={{ ...buttonStyle, backgroundColor: '#6c757d' }}
                    disabled={loadingEwelinkAccounts}
                  >
                    {loadingEwelinkAccounts ? 'Loading...' : 'Ewelink Accounts'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Edit Form */}
      {selectedUser && (
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          marginBottom: '40px'
        }}>
          <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>Edit User: {selectedUser.email}</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveUserChanges(); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Role:</label>
              <select name="role" value={editRole} onChange={(e) => setEditRole(e.target.value as 'user' | 'substore' | 'admin')} style={inputStyle}>
                <option value="client">Client</option>
                <option value="substore">Substore</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Commission Rate (%):</label>
              <input type="number" name="commission_rate" value={editCommissionRate} onChange={(e) => setEditCommissionRate(Number(e.target.value))} step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Balance (TL):</label>
              <input type="number" name="balance" value={editBalance} onChange={(e) => setEditBalance(Number(e.target.value))} step="0.01" style={inputStyle} />
            </div>
            <button type="submit" disabled={formLoading} style={{ ...buttonStyle, backgroundColor: '#28a745', gridColumn: '1 / span 2' }}>
              {formLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setSelectedUser(null)} style={{ ...buttonStyle, backgroundColor: '#dc3545', gridColumn: '1 / span 2' }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Ewelink Accounts Section */}
      {showEwelinkAccounts && selectedUser && (
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          marginBottom: '40px'
        }}>
          <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>
            {selectedUser.email} Ewelink Accounts
            <button
                onClick={() => setShowEwelinkAccounts(false)}
                style={{ ...buttonStyle, backgroundColor: '#dc3545', marginLeft: '15px', padding: '8px 12px' }}
            >
                Close
            </button>
          </h2>
          {userEwelinkAccounts.length === 0 ? (
            <p style={{color: '#b0b0b0'}}>This user has no registered Ewelink account.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#3a3a3a' }}>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Region</th>
                  <th style={tableHeaderStyle}>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {userEwelinkAccounts.map((account) => (
                  <tr key={account.id} style={{ borderBottom: '1px solid #444' }}>
                    <td style={tableCellStyle}>{account.ewelink_email}</td>
                    <td style={tableCellStyle}>{account.ewelink_region}</td>
                    <td style={tableCellStyle}>{account.created_at.toDate().toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// Common style objects
const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #555',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: '#333',
    color: '#e0e0e0',
};

const buttonStyle: React.CSSProperties = {
    padding: '12px 20px',
    color: '#fff',
    border: 'none',
    borderRadius: '44px',
    fontSize: '16px',
    cursor: 'pointer',
    opacity: 1,
    transition: 'background-color 0.2s ease-in-out, opacity 0.2s ease-in-out',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#f0f0f0'
};

const tableHeaderStyle: React.CSSProperties = {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '2px solid #555',
    color: '#f0f0f0',
    backgroundColor: '#3a3a3a'
};

const tableCellStyle: React.CSSProperties = {
    padding: '10px 15px',
    borderBottom: '1px solid #444',
    color: '#e0e0e0'
};
