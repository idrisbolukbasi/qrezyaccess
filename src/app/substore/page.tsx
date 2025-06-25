// src/app/substore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../authMiddleware';
import { doc, collection, addDoc, getDocs, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase.config'; // 'auth' objesini de import edin
import { query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // signOut fonksiyonunu import edin
import { useRouter } from 'next/navigation'; // useRouter'ı import edin

// Kullanıcı Verisi Tipi
interface UserData {
    email: string;
    role: 'user' | 'substore' | 'admin';
    display_name?: string;
    balance?: number;
    commission_rate?: number;
}

// Ewelink Hesabı Tipi
interface EwelinkAccount {
    id: string; // Firestore belge ID'si
    ewelink_email: string;
    ewelink_password: string;
    ewelink_region: string;
    ewelink_area_code: string;
    created_at?: Timestamp | null;
    devices: Device[]; // Bu hesaba bağlı cihazlar
}

// Cihaz Tipi
interface Device {
    id?: string; // Firestore belge ID'si
    device_id: string; // Ewelink'ten gelen ID
    location: string;
    price_per_minute: number;
    owner_tag: string;
    created_at?: Timestamp | null;
}

export default function SubstorePanel() {
    const { user, role, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [ewelinkAccounts, setEwelinkAccounts] = useState<EwelinkAccount[]>([]);
    const [currentEwelinkAccountForm, setCurrentEwelinkAccountForm] = useState<Omit<EwelinkAccount, 'id' | 'devices' | 'created_at'>>({
        ewelink_email: '',
        ewelink_password: '',
        ewelink_region: 'as',
        ewelink_area_code: '+90',
    });
    const [newDeviceForms, setNewDeviceForms] = useState<Device[]>([{
        device_id: '',
        location: '',
        price_per_minute: 0,
        owner_tag: '',
    }]);

    const [loadingData, setLoadingData] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedEwelinkAccountId, setSelectedEwelinkAccountId] = useState<string | null>(null);
    const [globalEwelinkConfig, setGlobalEwelinkConfig] = useState<{ appid: string; secret: string } | null>(null);

    const router = useRouter(); // useRouter hook'unu burada başlatın

    useEffect(() => {
        console.log('useEffect başladı. authLoading:', authLoading, 'user:', user, 'role:', role);

        const fetchSubstoreData = async () => {
            console.log('fetchSubstoreData çağrıldı. Mevcut durum: authLoading=', authLoading, 'user=', user, 'role=', role);
            if (!authLoading && user && role === 'substore') {
                console.log('Koşul sağlandı: Kimlik doğrulama tamamlandı, kullanıcı ve rol "substore". Veri çekiliyor...');
                setLoadingData(true);
                setFormError(null);

                try {
                    // Kullanıcının kendi belgesini çek (display_name için)
                    const userDocRef = doc(db, 'users', user.uid);
                    console.log('Kullanıcı belgesi çekiliyor:', userDocRef.path);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setUserData(userDocSnap.data() as UserData);
                        console.log('Kullanıcı verileri başarıyla çekildi:', userDocSnap.data());
                    } else {
                        console.warn('Kullanıcı belgesi Firestore\'da bulunamadı:', user.uid);
                    }


                    // 1. Global Ewelink Config bilgilerini çek
                    const globalConfigDocRef = doc(db, 'app_settings', 'ewelink_global_config');
                    console.log('Global Ewelink config belgesi çekiliyor:', globalConfigDocRef.path);
                    const globalConfigSnap = await getDoc(globalConfigDocRef);

                    if (globalConfigSnap.exists()) {
                        const configData = globalConfigSnap.data();
                        console.log('Global Ewelink config verisi Firestore\'dan alındı:', configData);
                        if (configData && configData.global_ewelink_appid && configData.global_ewelink_secret) {
                            setGlobalEwelinkConfig({
                                appid: configData.global_ewelink_appid,
                                secret: configData.global_ewelink_secret,
                            });
                            console.log('Global Ewelink config state\'e başarıyla ayarlandı.');
                        } else {
                            const missingFields = [];
                            if (!configData) missingFields.push('configData is null/undefined');
                            if (!configData.global_ewelink_appid) missingFields.push('global_ewelink_appid');
                            if (!configData.global_ewelink_secret) missingFields.push('global_ewelink_secret');
                            console.error('Global Ewelink config belgesinde eksik alanlar var:', missingFields.join(', '));
                            setFormError('Global Ewelink API yapılandırması eksik veya hatalı. Lütfen yöneticinizle iletişime geçin.');
                        }
                    } else {
                        console.error('Global Ewelink config belgesi Firestore\'da bulunamadı:', globalConfigDocRef.path);
                        setFormError('Global Ewelink API yapılandırması bulunamadı. Lütfen yöneticinizle iletişime geçin.');
                        setLoadingData(false);
                        return; // Hata durumunda diğer işlemleri durdur
                    }

                    // 2. Substorun kendi Ewelink hesaplarını ve cihazlarını çek
                    const ewelinkAccountsRef = collection(db, 'users', user.uid, 'ewelink_accounts');
                    console.log('Kullanıcının Ewelink hesapları çekiliyor:', ewelinkAccountsRef.path);
                    const ewelinkAccountsSnapshot = await getDocs(ewelinkAccountsRef);
                    const fetchedAccounts: EwelinkAccount[] = [];

                    for (const docSnap of ewelinkAccountsSnapshot.docs) {
                        const accountData = docSnap.data() as Omit<EwelinkAccount, 'id' | 'devices'>;
                        const devicesRef = collection(db, 'users', user.uid, 'ewelink_accounts', docSnap.id, 'devices');
                        const devicesSnapshot = await getDocs(devicesRef);
                        const fetchedDevices: Device[] = devicesSnapshot.docs.map(deviceDoc => {
                            const deviceData = deviceDoc.data();
                            return {
                                id: deviceDoc.id,
                                ...deviceData as Omit<Device, 'id' | 'created_at'>,
                                created_at: deviceData.created_at instanceof Timestamp ? deviceData.created_at : null,
                            };
                        });

                        fetchedAccounts.push({
                            id: docSnap.id,
                            ...accountData,
                            created_at: accountData.created_at instanceof Timestamp ? accountData.created_at : null,
                            devices: fetchedDevices,
                        });
                    }
                    setEwelinkAccounts(fetchedAccounts);
                    if (fetchedAccounts.length > 0) {
                        setSelectedEwelinkAccountId(fetchedAccounts[0].id);
                        console.log('Ewelink hesapları ve cihazları yüklendi. İlk hesap ID:', fetchedAccounts[0].id);
                    } else {
                        console.log('Hiç Ewelink hesabı bulunamadı.');
                    }
                } catch (err: unknown) {
                    console.error("Alt mağaza verileri veya global yapılandırma çekilirken hata oluştu (catch bloğu):", err);
                    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
                    setFormError(`Veriler çekilemedi: ${errorMessage}`);
                } finally {
                    setLoadingData(false);
                    console.log('Veri yükleme işlemi tamamlandı.');
                }
            } else if (!authLoading && (!user || role !== 'substore')) {
                console.log('Koşul sağlanmadı: Kimlik doğrulama tamam, ancak kullanıcı mevcut değil veya rol "substore" değil. Yükleme tamamlandı.');
                setLoadingData(false);
            }
        };

        fetchSubstoreData();
    }, [user, role, authLoading]);


    console.log('Render: authLoading:', authLoading, 'loadingData:', loadingData, 'globalEwelinkConfig (current):', globalEwelinkConfig, 'user (current):', user, 'role (current):', role, 'formError (current):', formError);


    if (authLoading || loadingData) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em', color: '#e0e0e0' }}>
                Yükleniyor...
            </div>
        );
    }

    // Bu blok, globalEwelinkConfig hala null ise tetiklenir
    if (!globalEwelinkConfig) {
        console.warn('Global Ewelink Config hala null, "Yapılandırma Hatası" ekranı gösteriliyor. Detaylı formError:', formError);
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
                <h1 style={{ color: '#f0f0f0' }}>Yapılandırma Hatası</h1>
                <p>Uygulama için gerekli Ewelink API yapılandırması bulunamadı veya yüklenemedi. Lütfen yöneticinizle iletişime geçin.</p>
                {formError && <p style={{color: '#dc3545', marginTop: '15px'}}>{formError}</p>}
            </div>
        );
    }

    if (!user || role !== 'substore') {
        console.warn('Kullanıcı veya rol uygun değil, "Yetkisiz Erişim" ekranı gösteriliyor.');
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#e0e0e0' }}>
                <h1 style={{ color: '#f0f0f0' }}>Yetkisiz Erişim</h1>
                <p>Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen bir alt mağaza hesabı ile giriş yapın.</p>
            </div>
        );
    }

    // Çıkış Yapma Fonksiyonu
    const handleLogout = async () => {
        try {
            await signOut(auth); // Firebase oturumunu kapat
            router.push('/'); // Ana sayfaya yönlendir
            console.log('Kullanıcı başarıyla çıkış yaptı.');
        } catch (error: unknown) {
            console.error('Çıkış yaparken hata oluştu:', error);
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
            alert(`Çıkış yaparken bir sorun oluştu: ${errorMessage}`);
        }
    };


    const handleEwelinkAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentEwelinkAccountForm({ ...currentEwelinkAccountForm, [e.target.name]: e.target.value });
    };

    const handleAddEwelinkAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormSuccess(null);
        setFormError(null);
        try {
            if (user) {
                const accountsRef = collection(db, 'users', user.uid, 'ewelink_accounts');
                const q = query(accountsRef, where('ewelink_email', '==', currentEwelinkAccountForm.ewelink_email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setFormError(`Bu Ewelink e-posta adresi (${currentEwelinkAccountForm.ewelink_email}) zaten bu mağazaya eklenmiş.`);
                    setFormLoading(false);
                    return;
                }

                const newAccountRef = await addDoc(accountsRef, {
                    ...currentEwelinkAccountForm,
                    created_at: serverTimestamp(),
                });
                
                const newAccount: EwelinkAccount = {
                    id: newAccountRef.id,
                    ...currentEwelinkAccountForm,
                    created_at: Timestamp.now(),
                    devices: []
                };
                setEwelinkAccounts([...ewelinkAccounts, newAccount]);
                setSelectedEwelinkAccountId(newAccount.id);
                setFormSuccess('Yeni Ewelink hesabı başarıyla eklendi!');
                setCurrentEwelinkAccountForm({
                    ewelink_email: '',
                    ewelink_password: '',
                    ewelink_region: 'as',
                    ewelink_area_code: '+90',
                });
            }
        } catch (err: unknown) {
            console.error('Ewelink hesabı eklenirken hata oluştu:', err);
            const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
            setFormError(`Ewelink hesabı eklenemedi: ${errorMessage}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeviceFormChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedDeviceForms = [...newDeviceForms];
        const { name, value } = e.target;
        updatedDeviceForms[index] = {
            ...updatedDeviceForms[index],
            [name]: name === 'price_per_minute' ? Number(value) : value,
        };
        setNewDeviceForms(updatedDeviceForms);
    };

    const addNewDeviceForm = () => {
        setNewDeviceForms([...newDeviceForms, { device_id: '', location: '', price_per_minute: 0, owner_tag: '' }]);
    };

    const handleAddDevicesToAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEwelinkAccountId) {
            setFormError('Lütfen bir Ewelink hesabı seçin veya yeni bir tane ekleyin.');
            return;
        }
        if (!globalEwelinkConfig) {
            setFormError('Global Ewelink API yapılandırması yüklenmedi. Cihaz eklenemez.');
            return;
        }

        setFormLoading(true);
        setFormSuccess(null);
        setFormError(null);

        try {
            if (user && selectedEwelinkAccountId) {
                const devicesCollectionRef = collection(db, 'users', user.uid, 'ewelink_accounts', selectedEwelinkAccountId, 'devices');
                const batchPromises = newDeviceForms.map(async (deviceForm) => {
                    const ownerTag = `substore:${user.uid}:${selectedEwelinkAccountId}`;
                    await addDoc(devicesCollectionRef, {
                        ...deviceForm,
                        owner_tag: ownerTag,
                        created_at: serverTimestamp(),
                    });
                });
                await Promise.all(batchPromises);

                setFormSuccess('Cihaz(lar) başarıyla eklendi!');
                setNewDeviceForms([{ device_id: '', location: '', price_per_minute: 0, owner_tag: '' }]);
                // Ewelink hesaplarını ve cihazlarını yeniden çek
                const updatedEwelinkAccountsRef = collection(db, 'users', user.uid, 'ewelink_accounts');
                const updatedEwelinkAccountsSnapshot = await getDocs(updatedEwelinkAccountsRef);
                const updatedFetchedAccounts: EwelinkAccount[] = [];

                for (const docSnap of updatedEwelinkAccountsSnapshot.docs) {
                    const accountData = docSnap.data() as Omit<EwelinkAccount, 'id' | 'devices'>;
                    const devicesRef = collection(db, 'users', user.uid, 'ewelink_accounts', docSnap.id, 'devices');
                    const devicesSnapshot = await getDocs(devicesRef);
                    const fetchedDevices: Device[] = devicesSnapshot.docs.map(deviceDoc => {
                        const deviceData = deviceDoc.data();
                        return {
                            id: deviceDoc.id,
                            ...deviceData as Omit<Device, 'id' | 'created_at'>,
                            created_at: deviceData.created_at instanceof Timestamp ? deviceData.created_at : null,
                        };
                    });

                    updatedFetchedAccounts.push({
                        id: docSnap.id,
                        ...accountData,
                        created_at: accountData.created_at instanceof Timestamp ? accountData.created_at : null,
                        devices: fetchedDevices,
                    });
                }
                setEwelinkAccounts(updatedFetchedAccounts);


            }
        } catch (err: unknown) {
            console.error('Cihaz eklenirken hata oluştu:', err);
            const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
            setFormError(`Cihaz eklenemedi: ${errorMessage}`);
        } finally {
            setFormLoading(false);
        }
    };
    
    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#f0f0f0', marginBottom: '30px', textAlign: 'center' }}>Alt Mağaza Paneli</h1>

            <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.1em', color: '#e0e0e0' }}>
                Merhaba <strong style={{color: '#fff'}}>{userData?.display_name || user?.email}</strong>! Ewelink hesaplarını ve bağlı cihazlarını buradan yönetebilirsin.
            </p>

            {/* Çıkış Yap Butonu */}
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc3545', // Kırmızı renk
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1em',
                        transition: 'background-color 0.2s ease-in-out',
                    }}
                >
                    Çıkış Yap
                </button>
            </div>

            {/* Mesaj Bölümü */}
            <div style={{ color: '#ffc107', backgroundColor: '#fff3cd1a', padding: '10px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ffc107' }}>
                Device control is temporarily disabled due to a system issue.
            </div>
            {formSuccess && <div style={{ color: '#28a745', backgroundColor: '#e6ffe61a', padding: '10px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #28a745' }}>{formSuccess}</div>}
            {formError && <div style={{ color: '#dc3545', backgroundColor: '#ffe6e61a', padding: '10px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #dc3545' }}>{formError}</div>}
            
            {/* Mevcut Ewelink Hesaplarını Listeleme ve Seçme */}
            <div style={{
                backgroundColor: '#2a2a2a',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                marginBottom: '40px'
            }}>
                <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>Mevcut Ewelink Hesapların</h2>
                {ewelinkAccounts.length === 0 ? (
                    <p style={{color: '#b0b0b0'}}>Henüz kayıtlı bir Ewelink hesabın yok. Lütfen yeni bir hesap ekle.</p>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        {ewelinkAccounts.map(account => (
                            <button
                                key={account.id}
                                onClick={() => setSelectedEwelinkAccountId(account.id)}
                                style={{
                                    padding: '10px 20px',
                                    border: `2px solid ${selectedEwelinkAccountId === account.id ? '#61dafb' : '#555'}`,
                                    borderRadius: '5px',
                                    backgroundColor: selectedEwelinkAccountId === account.id ? '#61dafb33' : '#3a3a3a',
                                    color: selectedEwelinkAccountId === account.id ? '#61dafb' : '#e0e0e0',
                                    cursor: 'pointer',
                                    fontWeight: selectedEwelinkAccountId === account.id ? 'bold' : 'normal',
                                    transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
                                }}
                            >
                                {account.ewelink_email} ({account.ewelink_region})
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Yeni Ewelink Hesabı Ekleme Formu */}
            <div style={{
                backgroundColor: '#2a2a2a',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                marginBottom: '40px'
            }}>
                <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>Yeni Ewelink Hesabı Ekle</h2>
                <form onSubmit={handleAddEwelinkAccount} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={labelStyle}>Ewelink E-posta:</label>
                        <input type="email" name="ewelink_email" value={currentEwelinkAccountForm.ewelink_email} onChange={handleEwelinkAccountChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Ewelink Şifre:</label>
                        <input type="password" name="ewelink_password" value={currentEwelinkAccountForm.ewelink_password} onChange={handleEwelinkAccountChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Ewelink Bölge (Region):</label>
                        <input type="text" name="ewelink_region" value={currentEwelinkAccountForm.ewelink_region} onChange={handleEwelinkAccountChange} required style={inputStyle} placeholder="örn: as, eu, us" />
                    </div>
                    <div>
                        <label style={labelStyle}>Ewelink Alan Kodu (Area Code):</label>
                        <input type="text" name="ewelink_area_code" value={currentEwelinkAccountForm.ewelink_area_code} onChange={handleEwelinkAccountChange} required style={inputStyle} placeholder="örn: +90" />
                    </div>
                    <button type="submit" disabled={formLoading} style={{ ...buttonStyle, backgroundColor: '#28a745', gridColumn: '1 / span 2' }}>
                        {formLoading ? 'Ekleniyor...' : 'Ewelink Hesabı Ekle'}
                    </button>
                </form>
            </div>

            {/* Cihaz Ekleme Formları */}
            {selectedEwelinkAccountId && (
                <div style={{
                    backgroundColor: '#2a2a2a',
                    padding: '30px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                    marginBottom: '40px'
                }}>
                    <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>
                        Cihaz Ekle (Hesap: <strong style={{color: '#61dafb'}}>{ewelinkAccounts.find(acc => acc.id === selectedEwelinkAccountId)?.ewelink_email}</strong>)
                    </h2>
                    {newDeviceForms.map((device, index) => (
                        <div key={index} style={{ border: '1px solid #555', padding: '20px', borderRadius: '5px', marginBottom: '15px', backgroundColor: '#333' }}>
                            <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#f0f0f0' }}>Cihaz #{index + 1}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={labelStyle}>Cihaz ID (Ewelink):</label>
                                    <input type="text" name="device_id" value={device.device_id} onChange={(e) => handleDeviceFormChange(index, e)} required style={inputStyle} placeholder="örn: 10010be521" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Konum (Masa 1, Oda 3):</label>
                                    <input type="text" name="location" value={device.location} onChange={(e) => handleDeviceFormChange(index, e)} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Dakikalık Fiyat (TL):</label>
                                    <input type="number" name="price_per_minute" value={device.price_per_minute} onChange={(e) => handleDeviceFormChange(index, e)} required min="0" step="0.01" style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button type="button" onClick={addNewDeviceForm} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
                            + Yeni Cihaz Ekleme Alanı
                        </button>
                        <button type="submit" onClick={handleAddDevicesToAccount} disabled={formLoading} style={{ ...buttonStyle, backgroundColor: '#007bff' }}>
                            {formLoading ? 'Cihazlar Ekleniyor...' : 'Cihazları Kaydet'}
                        </button>
                    </div>
                </div>
            )}

            {/* Mevcut Cihazları Listeleme */}
            {selectedEwelinkAccountId && (
                <div style={{
                    backgroundColor: '#2a2a2a',
                    padding: '30px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                }}>
                    <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>
                        Seçili Hesabın Cihazları
                    </h2>
                    {ewelinkAccounts.find(acc => acc.id === selectedEwelinkAccountId)?.devices.length === 0 ? (
                        <p style={{color: '#b0b0b0'}}>Bu hesaba henüz bir cihaz eklenmemiş.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#3a3a3a' }}>
                                    <th style={tableHeaderStyle}>Cihaz ID</th><th style={tableHeaderStyle}>Konum</th><th style={tableHeaderStyle}>Dk. Fiyat</th><th style={tableHeaderStyle}>Sahip Etiketi</th><th style={tableHeaderStyle}>Oluşturulma</th><th style={tableHeaderStyle}>Kontrol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ewelinkAccounts.find(acc => acc.id === selectedEwelinkAccountId)?.devices.map((device, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #444' }}>
                                        <td style={tableCellStyle}>{device.device_id}</td>
                                        <td style={tableCellStyle}>{device.location}</td>
                                        <td style={tableCellStyle}>{device.price_per_minute.toFixed(2)} TL</td>
                                        <td style={tableCellStyle}><code style={{backgroundColor: '#444', padding: '3px 6px', borderRadius: '3px', fontSize: '0.9em'}}>{device.owner_tag}</code></td>
                                        <td style={tableCellStyle}>{device.created_at ? device.created_at.toDate().toLocaleString() : 'N/A'}</td>
                                        <td style={tableCellStyle}>
                                            <button
                                                disabled={true}
                                                style={{ ...buttonStyle, backgroundColor: '#28a745', marginRight: '5px', padding: '8px 12px' }}
                                                title="Device control is temporarily unavailable"
                                            >
                                                Aç
                                            </button>
                                            <button
                                                disabled={true}
                                                style={{ ...buttonStyle, backgroundColor: '#dc3545', padding: '8px 12px' }}
                                                title="Device control is temporarily unavailable"
                                            >
                                                Kapat
                                            </button>
                                        </td>
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

// Ortak stil objeleri (Değişiklik yok)
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
    borderRadius: '4px',
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
