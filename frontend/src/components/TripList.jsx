import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; 

const TripList = () => {
    const [trips, setTrips] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);

    useEffect(() => {
        api.get('/api/trips')
            .then(response => {
                // Gelen verinin dizi olduğundan emin oluyoruz
                const data = Array.isArray(response.data) ? response.data : (response.data.content || []);
                setTrips(data); 
            })
            .catch(error => {
                console.error("Veriler çekilirken hata oluştu:", error);
                setTrips([]); // Hata durumunda boş dizi ata ki .map patlamasın
            });
    }, []);

    // Benzersiz ülke ve şehir listelerini dinamik olarak oluştur
    const availableCountries = useMemo(() => {
        const countries = trips.map(t => t.country).filter(Boolean);
        return [...new Set(countries)];
    }, [trips]);

    const availableCities = useMemo(() => {
        const cities = trips.map(t => t.city).filter(Boolean);
        return [...new Set(cities)];
    }, [trips]);

    // Filtreleme Mantığı (Çoklu Seçim & Ülke-Şehir Kesişimi)
    const filteredTrips = useMemo(() => {
        return trips.filter(trip => {
            const matchCountry = selectedCountries.length === 0 || selectedCountries.includes(trip.country);
            const matchCity = selectedCities.length === 0 || selectedCities.includes(trip.city);
            return matchCountry && matchCity;
        });
    }, [trips, selectedCountries, selectedCities]);

    const toggleCountry = (country) => {
        setSelectedCountries(prev => 
            prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
        );
    };

    const toggleCity = (city) => {
        setSelectedCities(prev => 
            prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
        );
    };

    const clearFilters = () => {
        setSelectedCountries([]);
        setSelectedCities([]);
    };

    const isFiltered = selectedCountries.length > 0 || selectedCities.length > 0;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'var(--text-color)' }}>
            <h2 style={{ color: 'var(--accent-color)' }}>🧭 Gezgin Akışı</h2>
            
            {/* FİLTRELEME ALANI */}
            {trips.length > 0 && (
                <div style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '15px 20px',
                    marginTop: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--accent-color)' }}>
                            🔍 Seyahat Filtrele
                        </div>
                        {isFiltered && (
                            <button 
                                onClick={clearFilters}
                                style={{
                                    backgroundColor: 'var(--btn-danger)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Filtreleri Temizle 🗑️
                            </button>
                        )}
                    </div>

                    {/* ÜLKE FİLTRELERİ */}
                    {availableCountries.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '10px', fontWeight: 'bold' }}>
                                🌍 Ülke:
                            </span>
                            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                                {availableCountries.map(country => {
                                    const isSelected = selectedCountries.includes(country);
                                    return (
                                        <button
                                            key={country}
                                            onClick={() => toggleCountry(country)}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '15px',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                border: isSelected ? '1px solid var(--btn-primary)' : '1px solid var(--border-color)',
                                                backgroundColor: isSelected ? 'var(--btn-primary)' : 'var(--btn-secondary)',
                                                color: isSelected ? '#ffffff' : 'var(--button-text)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {country} {isSelected && '✓'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ŞEHİR FİLTRELERİ */}
                    {availableCities.length > 0 && (
                        <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '10px', fontWeight: 'bold' }}>
                                📍 Şehir:
                            </span>
                            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                                {availableCities.map(city => {
                                    const isSelected = selectedCities.includes(city);
                                    return (
                                        <button
                                            key={city}
                                            onClick={() => toggleCity(city)}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '15px',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                border: isSelected ? '1px solid var(--btn-primary)' : '1px solid var(--border-color)',
                                                backgroundColor: isSelected ? 'var(--btn-primary)' : 'var(--btn-secondary)',
                                                color: isSelected ? '#ffffff' : 'var(--button-text)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {city} {isSelected && '✓'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* SEÇİLİ FİLTRE ÖZETİ */}
                    {isFiltered && (
                        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Aktif Filtre: {selectedCountries.length > 0 && `Ülke (${selectedCountries.join(', ')})`} {selectedCountries.length > 0 && selectedCities.length > 0 && ' | '} {selectedCities.length > 0 && `Şehir (${selectedCities.join(', ')})`}
                        </div>
                    )}
                </div>
            )}

            {/* SEYAHAT LİSTESİ / KARTLAR */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                {filteredTrips.map(trip => (
                    <div key={trip.id} style={{ 
                        border: '1px solid var(--border-color)', 
                        padding: '15px', 
                        borderRadius: '10px', 
                        minWidth: '250px',
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--accent-color)' }}>
                            {trip.placeName ? `${trip.placeName} (${trip.city}, ${trip.country})` : `${trip.city}, ${trip.country}`}
                        </h3>
                        <p style={{ margin: '5px 0' }}><strong>📅 Tarih:</strong> {trip.visitDate}</p>
                        <p style={{ margin: '5px 0' }}><strong>⭐ Puan:</strong> {trip.rating}/5</p>
                        <hr style={{ borderColor: 'var(--border-color)' }} />
                        
                        <p style={{ fontStyle: 'italic', margin: '10px 0 0 0', color: 'var(--text-secondary)' }}>"{trip.note}"</p>
                        
                        <div style={{ marginTop: '15px' }}>
                            <Link to={`/trip/${trip.id}`} style={{ backgroundColor: 'var(--btn-secondary)', color: 'var(--button-text)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '5px', textDecoration: 'none', fontSize: '14px', display: 'inline-block' }}>
                                Detayları Gör 👀
                            </Link>
                        </div>
                    </div>
                ))}

                {/* BOŞ DURUM MESAJLARI */}
                {trips.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)' }}>Henüz listelenecek seyahat bulunmuyor.</p>
                )}

                {trips.length > 0 && filteredTrips.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)', padding: '20px 0', fontSize: '15px' }}>
                        Bu filtrelere uygun seyahat bulunamadı. 🔍
                    </p>
                )}
            </div>
        </div>
    );
};

export default TripList;