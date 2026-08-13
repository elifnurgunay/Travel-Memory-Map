import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import axios from 'axios'; 
import MapPicker from './MapPicker'; 
import { useParams, useNavigate } from 'react-router-dom';

const TripForm = () => {
    const { id } = useParams(); // URL'den ID'yi alıyoruz (Düzenleme modu için)
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        city: '',
        placeName: '',
        country: '',
        latitude: '',
        longitude: '',
        visitDate: '',
        note: '',
        rating: 5,
        isPublic: true
    });

    const [position, setPosition] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- EĞER ID VARSA (DÜZENLEME MODU) VERİLERİ ÇEK ---
    useEffect(() => {
        if (id) {
            api.get(`/api/trips/${id}`)
                .then(response => {
                    const trip = response.data;
                    setFormData({
                        city: trip.city || '',
                        placeName: trip.placeName || '',
                        country: trip.country || '',
                        latitude: trip.latitude || '',
                        longitude: trip.longitude || '',
                        visitDate: trip.visitDate || '',
                        note: trip.note || '',
                        rating: trip.rating || 5,
                        isPublic: trip.isPublic ?? true
                    });
                    // Harita pinini de mevcut koordinatlara konumlandırıyoruz
                    if (trip.latitude && trip.longitude) {
                        setPosition([parseFloat(trip.latitude), parseFloat(trip.longitude)]);
                    }
                })
                .catch(error => {
                    console.error("Düzenlenecek seyahat çekilemedi:", error);
                });
        }
    }, [id]);

    useEffect(() => {
        if (position) {
            setFormData(prev => ({
                ...prev,
                latitude: position[0].toFixed(6),
                longitude: position[1].toFixed(6)
            }));
        }
    }, [position]);

    // Koordinatlardan Otomatik Şehir ve Ülke Çekme (Reverse Geocoding Fallback Sıralaması)
    const fetchAddressFromCoords = async (lat, lon) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            if (response.data && response.data.address) {
                const addr = response.data.address;
                // Şehir Fallback Sıralaması: city -> town -> municipality -> village -> county -> state_district -> state
                const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || addr.state_district || addr.state || '';
                const country = addr.country || '';
                
                if (!city && !country) {
                    alert("Seçilen konum için şehir ve ülke bilgisi otomatik belirlenemedi. Lütfen bilinen bir yerleşim noktası seçin.");
                }

                setFormData(prev => ({
                    ...prev,
                    city: city || prev.city,
                    country: country || prev.country
                }));
            }
        } catch (err) {
            console.error("Ters adres araması hatası:", err);
        }
    };

    const handlePositionChange = (newPos) => {
        setPosition(newPos);
        if (newPos && newPos.length === 2) {
            fetchAddressFromCoords(newPos[0], newPos[1]);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;

        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
            
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                const newPos = [parseFloat(lat), parseFloat(lon)];
                handlePositionChange(newPos);
                
                // Mekân adı henüz doldurulmadıysa, aranan konumu varsayılan olarak yaz
                if (!formData.placeName) {
                    setFormData(prev => ({ ...prev, placeName: searchQuery.trim() }));
                }
            } else {
                alert('Maalesef bu konumu bulamadık. Lütfen farklı kelimelerle deneyin.');
            }
        } catch (error) {
            console.error("Arama hatası:", error);
        }
    };

    // --- EKLEME VEYA GÜNCELLEME İŞLEMİ ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!position) {
            alert("Lütfen harita üzerinden bir konum seçin! 📍");
            return;
        }

        const request = id 
            ? api.put(`/api/trips/${id}`, formData)   // Eğer ID varsa GÜNCELLE (PUT)
            : api.post('/api/trips', formData);        // ID yoksa YENİ EKLE (POST)

        request
            .then((response) => {
                if (id) {
                    // Güncelleme → profile git
                    alert('Seyahat başarıyla güncellendi! ✅');
                    navigate('/profile');
                } else {
                    // Yeni ekleme → seyahatin detay sayfasına git (fotoğraf ekleyebilsin)
                    const newTripId = response.data.id;
                    alert('Seyahat başarıyla eklendi! 🎉 Şimdi fotoğraf ekleyebilirsin.');
                    navigate(`/trip/${newTripId}`);
                }
            })
            .catch(error => {
                console.error("Hata:", error);
                alert('Bir hata oluştu, konsolu kontrol et!');
            });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', color: 'var(--text-color)' }}>
            <h2 style={{ color: 'var(--accent-color)' }}>{id ? '✏️ Seyahati Düzenle' : '➕ Yeni Seyahat Ekle'}</h2>
            
            {/* ARAMA ÇUBUĞU BÖLÜMÜ */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Mekan veya Şehir Ara (Örn: Galata Kulesi, Kızkalesi)" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={handleSearch} style={{ padding: '10px 15px', backgroundColor: 'var(--btn-secondary)', color: 'var(--button-text)', border: '1px solid var(--border-color)', borderRadius: '5px', cursor: 'pointer' }}>
                    Ara 🔍
                </button>
            </div>

            <MapPicker position={position} setPosition={handlePositionChange} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                        📍 Yer / Mekân Adı (İsteğe Bağlı)
                    </label>
                    <input 
                        name="placeName" 
                        placeholder="Örn: Galata Kulesi, Kızkalesi, Ayasofya..." 
                        value={formData.placeName} 
                        onChange={handleChange} 
                        style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                            🏙️ Şehir (Otomatik Seçilir)
                        </label>
                        <input 
                            name="city" 
                            placeholder="Haritadan konum seçiniz..." 
                            value={formData.city} 
                            readOnly 
                            required 
                            style={{
                                ...inputStyle,
                                width: '100%',
                                backgroundColor: 'var(--btn-secondary)',
                                color: formData.city ? 'var(--text-color)' : 'var(--text-secondary)',
                                cursor: 'not-allowed',
                                boxSizing: 'border-box'
                            }} 
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                            🌍 Ülke (Otomatik Seçilir)
                        </label>
                        <input 
                            name="country" 
                            placeholder="Haritadan konum seçiniz..." 
                            value={formData.country} 
                            readOnly 
                            required 
                            style={{
                                ...inputStyle,
                                width: '100%',
                                backgroundColor: 'var(--btn-secondary)',
                                color: formData.country ? 'var(--text-color)' : 'var(--text-secondary)',
                                cursor: 'not-allowed',
                                boxSizing: 'border-box'
                            }} 
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                        📅 Ziyaret Tarihi
                    </label>
                    <input type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                        ⭐ Seyahat Puanı
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--card-bg)', padding: '8px 12px', borderRadius: '5px', border: '1px solid var(--border-color)' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '26px',
                                    cursor: 'pointer',
                                    color: star <= formData.rating ? 'var(--btn-warning)' : 'var(--text-secondary)',
                                    padding: '0 2px',
                                    transition: 'transform 0.15s ease'
                                }}
                                title={`${star} Yıldız`}
                            >
                                ★
                            </button>
                        ))}
                        <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--btn-warning)' }}>
                            {formData.rating} / 5 Yıldız
                        </span>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                        📝 Notlarınız & Anılarınız
                    </label>
                    <textarea name="note" placeholder="Seyahatiniz hakkında hatırlamak istediğiniz anılarınızı buraya yazabilirsiniz..." value={formData.note} onChange={handleChange} style={{ ...inputStyle, minHeight: '90px', width: '100%', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginTop: '5px' }}>
                  <label style={{ color: 'var(--text-color)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                    <input
                        type="checkbox"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                isPublic: e.target.checked
                            })
                        }
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    Herkese Açık Olarak Paylaş
                   </label>
               </div>

                <button type="submit" style={{ padding: '12px', backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                    {id ? 'Değişiklikleri Kaydet' : 'Seyahati Kaydet'}
                </button>
            </form>
        </div>
    );
};

const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-color)'
};

export default TripForm;