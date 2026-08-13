import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GalleryCard = ({ trip }) => {
    const [isHovered, setIsHovered] = useState(false);

    const firstPhoto = trip.photos && trip.photos.length > 0
        ? trip.photos[0]
        : null;

    let photoSrc = null;
    if (firstPhoto && firstPhoto.photoUrl) {
        if (firstPhoto.photoUrl.startsWith('http://') || firstPhoto.photoUrl.startsWith('https://')) {
            photoSrc = firstPhoto.photoUrl;
        } else {
            photoSrc = `http://localhost:8080${firstPhoto.photoUrl}`;
        }
    }

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                flex: '0 0 160px',
                height: '210px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isHovered 
                    ? '0 8px 16px rgba(0,0,0,0.2)' 
                    : '0 2px 6px rgba(0,0,0,0.08)',
                transform: isHovered ? 'translateY(-4px)' : 'none',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                boxSizing: 'border-box'
            }}
        >
            <div style={{ width: '100%', height: '140px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--main-bg)' }}>
                {photoSrc ? (
                    <img 
                        src={photoSrc} 
                        alt={trip.city} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '24px' }}>
                        📷
                    </div>
                )}
            </div>
            <div style={{ marginTop: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trip.placeName ? trip.placeName : `${trip.city}, ${trip.country}`}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{trip.visitDate || ''}</span>
                    <span>⭐ {trip.rating}/5</span>
                </div>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const { user } = useAuth();
    const [userInfo, setUserInfo] = useState({ username: '', email: '' });
    const [myTrips, setMyTrips] = useState([]);
    const [selectedPin, setSelectedPin] = useState(null);
    const [hoveredCardId, setHoveredCardId] = useState(null);
    const navigate = useNavigate();
    const boardRef = React.useRef(null);
    const [activeDrag, setActiveDrag] = useState(null);
    const [cardPositions, setCardPositions] = useState({});

    const fetchMyTrips = async () => {
        try {
            const response = await api.get('/api/trips/my');
            const data = Array.isArray(response.data) ? response.data : [];
            setMyTrips(data);
        } catch (error) {
            console.error("Seyahatler yuklenirken hata:", error);
            setMyTrips([]);
        }
    };

    useEffect(() => {
        fetchMyTrips();

        // Giriş yapan kullanıcının profil detaylarını al
        api.get('/api/users/me')
            .then(res => {
                if (res.data) {
                    setUserInfo({
                        username: res.data.username || '',
                        email: res.data.email || ''
                    });
                }
            })
            .catch(err => {
                console.error("Kullanıcı profil bilgisi alınamadı:", err);
            });
    }, []);

    const uniqueCountriesCount = useMemo(() => {
        const countries = myTrips.map(t => t.country).filter(c => c && c.trim() !== '');
        return new Set(countries).size;
    }, [myTrips]);

    const uniqueCitiesCount = useMemo(() => {
        const cities = myTrips.map(t => t.city).filter(c => c && c.trim() !== '');
        return new Set(cities).size;
    }, [myTrips]);

    const displayUsername = userInfo.username || user?.username || 'Kullanıcı';
    const displayEmail = userInfo.email || (myTrips[0]?.user?.email) || '';

    const updateLines = React.useCallback(() => {
        if (!boardRef.current) return;
        const boardRect = boardRef.current.getBoundingClientRect();

        myTrips.forEach(trip => {
            const cardEl = document.getElementById(`card-${trip.id}`);
            const pinEl = document.getElementById(`pin-${trip.id}`);
            const lineEl = document.getElementById(`line-${trip.id}`);
            if (cardEl && pinEl && lineEl) {
                const cardRect = cardEl.getBoundingClientRect();
                const pinRect = pinEl.getBoundingClientRect();

                // Çizgi başlangıç noktası: Polaroid kartın alt kenarından 10px yukarıda ve yatay olarak tam ortada (kartın arkasından çıkıyormuş hissi)
                const cardX = cardRect.left - boardRect.left + cardRect.width / 2;
                const cardY = cardRect.top - boardRect.top + cardRect.height - 10;

                // Çizgi bitiş noktası: Pin'in tam merkezi
                const pinX = pinRect.left - boardRect.left + pinRect.width / 2;
                const pinY = pinRect.top - boardRect.top + pinRect.height / 2;

                // React render döngüsünden kaçınmak ve 60FPS akıcılık için DOM'u doğrudan güncelliyoruz
                lineEl.setAttribute('x1', cardX);
                lineEl.setAttribute('y1', cardY);
                lineEl.setAttribute('x2', pinX);
                lineEl.setAttribute('y2', pinY);
            }
        });
    }, [myTrips]);

    // Resize ve layout değişikliklerini izlemek için ResizeObserver
    useEffect(() => {
        if (!boardRef.current) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(updateLines);
        });

        observer.observe(boardRef.current);

        return () => {
            observer.disconnect();
        };
    }, [updateLines]);

    // Hover, tıklama ve sürükleme esnasında çizgileri akıcı şekilde güncellemek için requestAnimationFrame döngüsü
    useEffect(() => {
        let animationFrameId;
        const startTime = performance.now();
        const duration = 400; // Kart transition süresini kapsayacak şekilde

        const animate = (now) => {
            updateLines();
            const elapsed = now - startTime;
            if (activeDrag || elapsed < duration) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [hoveredCardId, selectedPin, activeDrag, cardPositions, updateLines]);

    // Pointer events drag handlers
    const handlePointerDown = (e, tripId) => {
        if (e.button !== 0) return; // Sadece sol tık ile sürükleme
        
        e.preventDefault();
        const cardEl = document.getElementById(`card-${tripId}`);
        if (!cardEl || !boardRef.current) return;

        const pos = cardPositions[tripId] || { x: 0, y: 0 };
        setActiveDrag({
            tripId,
            startX: e.clientX,
            startY: e.clientY,
            initialX: pos.x,
            initialY: pos.y
        });

        cardEl.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!activeDrag || !boardRef.current) return;

        const { tripId } = activeDrag;
        const cardEl = document.getElementById(`card-${tripId}`);
        if (!cardEl) return;

        const pos = cardPositions[tripId] || { x: 0, y: 0 };
        const currentRect = cardEl.getBoundingClientRect();
        const boardRect = boardRef.current.getBoundingClientRect();

        const currentLeftRel = currentRect.left - boardRect.left;
        const currentTopRel = currentRect.top - boardRect.top;

        const naturalLeft = currentLeftRel - pos.x;
        const naturalTop = currentTopRel - pos.y;

        const w = currentRect.width;
        const h = currentRect.height;

        const dx = e.clientX - activeDrag.startX;
        const dy = e.clientY - activeDrag.startY;

        let newX = activeDrag.initialX + dx;
        let newY = activeDrag.initialY + dy;

        // Harita panosu dışına taşmasını engellemek için sınırlandırma (clamping)
        newX = Math.max(-naturalLeft, Math.min(boardRect.width - w - naturalLeft, newX));
        newY = Math.max(-naturalTop, Math.min(boardRect.height - h - naturalTop, newY));

        setCardPositions(prev => ({
            ...prev,
            [tripId]: { x: newX, y: newY }
        }));
    };

    const handlePointerUp = (e) => {
        if (!activeDrag) return;

        const cardEl = document.getElementById(`card-${activeDrag.tripId}`);
        if (cardEl) {
            try {
                cardEl.releasePointerCapture(e.pointerId);
            } catch (err) {
                // Ignore capture release error
            }
        }
        setActiveDrag(null);
    };

    const handleDeleteTrip = async (tripId) => {
        if (!window.confirm("Bu seyahat anisini silmek istediginize emin misiniz?")) return;
        try {
            await api.delete(`/api/trips/${tripId}`);
            
            // Silinen seyahate ait tüm state kalıntılarını güvenli şekilde temizle
            if (selectedPin && selectedPin.id === tripId) setSelectedPin(null);
            if (hoveredCardId === tripId) setHoveredCardId(null);
            if (activeDrag && activeDrag.tripId === tripId) setActiveDrag(null);
            
            setCardPositions(prev => {
                const newPos = { ...prev };
                delete newPos[tripId];
                return newPos;
            });

            fetchMyTrips();
        } catch (error) {
            console.error("Seyahat silinemedi:", error);
        }
    };

    // Lat/Lng -> SVG koordinat dönüşümü (viewBox: 0 0 1000 500)
    // Stylized SVG dünya haritası ile uyumlu kalibre edilmiş formül
    const latLngToSvg = (lat, lng) => {
        const x = 2.6 * parseFloat(lng) + 450;
        const y = 262 - 3.0 * parseFloat(lat);
        return { x, y };
    };

    const handlePinClick = (trip, svgX, svgY) => {
        if (selectedPin && selectedPin.id === trip.id) {
            setSelectedPin(null);
        } else {
            setSelectedPin({
                id: trip.id,
                city: trip.city,
                country: trip.country,
                placeName: trip.placeName,
                visitDate: trip.visitDate,
                svgX,
                svgY
            });
        }
    };

    // Seyahat kartlarını index yerine stabil olan trip.id'ye göre ayırıyoruz.
    // Bu sayede aradan bir seyahat silindiğinde diğer kartlar sütun değiştirip koordinatlarını ve DOM yapılarını kaybetmezler.
    const leftTrips = myTrips.filter((trip) => trip.id % 2 === 0);
    const rightTrips = myTrips.filter((trip) => trip.id % 2 !== 0);

    const renderTripCard = (trip) => {
        const firstPhoto = trip.photos && trip.photos.length > 0
            ? trip.photos[0]
            : null;

        let photoSrc = null;
        if (firstPhoto && firstPhoto.photoUrl) {
            if (firstPhoto.photoUrl.startsWith('http://') || firstPhoto.photoUrl.startsWith('https://')) {
                photoSrc = firstPhoto.photoUrl;
            } else {
                photoSrc = `http://localhost:8080${firstPhoto.photoUrl}`;
            }
        }

        const pos = cardPositions[trip.id] || { x: 0, y: 0 };
        const isHovered = hoveredCardId === trip.id;
        const isDragged = activeDrag && activeDrag.tripId === trip.id;

        return (
            <div
                key={trip.id}
                id={`card-${trip.id}`}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => handlePointerDown(e, trip.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                    backgroundColor: '#f5f0e8',
                    borderRadius: '3px',
                    padding: '4px 4px 6px 4px',
                    width: '70px',
                    boxShadow: isDragged
                        ? '0 10px 24px rgba(0, 0, 0, 0.6), 2px 2px 8px rgba(0, 0, 0, 0.4)'
                        : (isHovered
                            ? '0 6px 16px rgba(0, 0, 0, 0.5), 1px 1px 6px rgba(0, 0, 0, 0.3)'
                            : '0 3px 10px rgba(0, 0, 0, 0.35), 1px 1px 4px rgba(0, 0, 0, 0.2)'),
                    transform: `translate(${pos.x}px, ${pos.y}px) ` + 
                        (isHovered || isDragged
                            ? 'rotate(0deg) scale(1.35)'
                            : `rotate(${(trip.id % 5 - 2) * 1.5}deg)`),
                    transition: isDragged
                        ? 'none'
                        : 'transform 0.25s ease, box-shadow 0.25s ease',
                    cursor: isDragged ? 'grabbing' : 'grab',
                    pointerEvents: 'auto',
                    zIndex: isDragged ? 100 : (isHovered ? 10 : 2),
                    touchAction: 'none'
                }}
                onMouseEnter={() => setHoveredCardId(trip.id)}
                onMouseLeave={() => setHoveredCardId(null)}
            >
                {/* Fotoğraf Alanı */}
                <div style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#ffffff',
                    borderRadius: '1px',
                    overflow: 'hidden',
                    marginBottom: '4px'
                }}>
                    {photoSrc && (
                        <img
                            src={photoSrc}
                            alt={`${trip.city}, ${trip.country}`}
                            onLoad={updateLines}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    )}
                </div>

                {/* Kart Bilgileri */}
                <p style={{
                    margin: '0 0 1px 0',
                    fontSize: '7.5px',
                    fontWeight: '700',
                    color: '#3a2e1e',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {trip.placeName ? `${trip.placeName}` : `${trip.city}, ${trip.country}`}
                </p>
                <p style={{
                    margin: 0,
                    fontSize: '6.5px',
                    color: '#8a7252'
                }}>
                    {trip.visitDate}
                </p>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color)', fontFamily: 'sans-serif' }}>
            <style>{`
                @media (max-width: 992px) {
                    .travel-board-grid {
                        grid-template-columns: 1fr !important;
                        min-height: auto !important;
                    }
                    .travel-board-column {
                        flex-direction: row !important;
                        flex-wrap: wrap !important;
                        justify-content: center !important;
                        gap: 16px !important;
                    }
                }
            `}</style>
            <Link to="/" style={{ color: 'var(--btn-primary)', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
                &larr; Ana Sayfaya Don
            </Link>

            {/* ================================================= */}
            {/* 👤 PROFİL BİLGİ VE İSTATİSTİK KARTI               */}
            {/* ================================================= */}
            <div style={{
                backgroundColor: 'var(--card-bg)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                marginBottom: '30px'
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justify: 'space-between',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    {/* Sol Taraf: Kullanıcı Avatarı, Kullanıcı Adı ve E-posta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div style={{
                            width: '65px',
                            height: '65px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: '#ffffff',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.2)'
                        }}>
                            {(displayUsername[0] || '👤').toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 4px 0', color: 'var(--accent-color)', fontSize: '22px' }}>
                                👤 {displayUsername}
                            </h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                                ✉️ {displayEmail || 'E-posta belirtilmemiş'}
                            </p>
                        </div>
                    </div>

                    {/* Sağ Taraf: İstatistik Rozetleri (Seyahat, Ülke, Şehir) */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '15px',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            backgroundColor: 'var(--main-bg)',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '18px' }}>✈️</span>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                                    {myTrips.length}
                                </span>
                                <span style={{ marginLeft: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Seyahat
                                </span>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'var(--main-bg)',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '18px' }}>🌍</span>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                                    {uniqueCountriesCount}
                                </span>
                                <span style={{ marginLeft: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Ülke
                                </span>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'var(--main-bg)',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '18px' }}>📍</span>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                                    {uniqueCitiesCount}
                                </span>
                                <span style={{ marginLeft: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Şehir
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Seyahatlerim</h3>
                    <button
                        onClick={() => navigate('/trip/new')}
                        style={{ backgroundColor: 'var(--btn-primary)', color: 'var(--button-text)', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Yeni Ekle
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {myTrips.map(trip => (
                        <div key={trip.id} style={{ backgroundColor: 'var(--card-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-color)' }}>{trip.city}, {trip.country}</h4>
                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    Tarih: {trip.visitDate} | Puan: {trip.rating}/5 | {trip.isPublic ? 'Herkese Acik' : 'Gizli'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => navigate(`/trip/${trip.id}`)}
                                    style={{ backgroundColor: 'var(--btn-secondary)', color: 'var(--button-text)', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Detay
                                </button>
                                <button
                                    onClick={() => navigate(`/edit-trip/${trip.id}`)}
                                    style={{ backgroundColor: 'var(--btn-warning)', color: 'black', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Duzenle
                                </button>
                                <button
                                    onClick={() => handleDeleteTrip(trip.id)}
                                    style={{ backgroundColor: 'var(--btn-danger)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))}
                    {myTrips.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', border: '2px dashed var(--empty-border)', borderRadius: '10px' }}>
                            <p style={{ fontSize: '18px' }}>Henuz kayitli seyahatiniz yok.</p>
                            <button
                                onClick={() => navigate('/trip/new')}
                                style={{ marginTop: '10px', backgroundColor: 'var(--btn-primary)', color: 'var(--button-text)', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Ilk Seyahatini Ekle
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* ================================================= */}
            {/* 🌍 SEYAHAT PANOM                                   */}
            {/* ================================================= */}

            <div style={{ marginTop: '40px' }}>

                <h3 style={{
                    margin: '0 0 15px 0',
                    fontSize: '22px',
                    color: 'var(--text-color)'
                }}>
                    🌍 Seyahat Panom
                </h3>

                <div
                    ref={boardRef}
                    onClick={() => setSelectedPin(null)}
                    style={{
                        backgroundColor: 'var(--board-bg)',
                        border: '2px solid var(--board-border)',
                        borderRadius: '14px',
                        padding: '30px',
                        minHeight: '350px',
                        boxShadow: 'var(--board-shadow)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >

                    {/* Dekoratif köşe desenleri */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        width: '30px',
                        height: '30px',
                        borderTop: '2px solid var(--board-border)',
                        borderLeft: '2px solid var(--board-border)',
                        borderRadius: '4px 0 0 0',
                        opacity: 0.6
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '30px',
                        height: '30px',
                        borderTop: '2px solid var(--board-border)',
                        borderRight: '2px solid var(--board-border)',
                        borderRadius: '0 4px 0 0',
                        opacity: 0.6
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        width: '30px',
                        height: '30px',
                        borderBottom: '2px solid var(--board-border)',
                        borderLeft: '2px solid var(--board-border)',
                        borderRadius: '0 0 0 4px',
                        opacity: 0.6
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        width: '30px',
                        height: '30px',
                        borderBottom: '2px solid var(--board-border)',
                        borderRight: '2px solid var(--board-border)',
                        borderRadius: '0 0 4px 0',
                        opacity: 0.6
                    }} />

                    {/* Harita ve Konum Noktaları Katmanı (Seyahat kartlarının pinleri kapatmasını önlemek için hafifçe aşağı kaydırıldı) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '95%',
                            height: '85%',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    >
                        <svg
                            viewBox="0 0 1000 500"
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'block',
                                pointerEvents: 'none'
                            }}
                        >
                            <g style={{ opacity: 0.08, pointerEvents: 'none' }}>
                            {/* Kuzey Amerika */}
                            <path d="M150,120 L170,100 L200,95 L230,90 L260,95 L280,110 L285,130 L275,150 L260,170 L240,190 L220,200 L200,210 L180,220 L160,230 L150,240 L145,250 L155,260 L170,255 L180,240 L195,235 L210,240 L220,250 L215,265 L200,270 L185,275 L175,285 L170,295 L160,300 L140,290 L125,275 L110,260 L105,240 L110,220 L115,200 L120,180 L125,160 L135,140 Z"
                                fill="var(--map-color)" />
                            {/* Güney Amerika */}
                            <path d="M220,310 L240,300 L260,305 L275,320 L280,340 L278,360 L270,380 L260,400 L248,415 L235,425 L225,430 L220,420 L225,400 L230,380 L228,360 L222,340 L215,325 Z"
                                fill="var(--map-color)" />
                            {/* Avrupa */}
                            <path d="M430,100 L450,90 L470,88 L490,92 L500,100 L505,115 L500,130 L490,140 L475,148 L460,152 L445,155 L435,150 L428,140 L425,125 L428,110 Z"
                                fill="var(--map-color)" />
                            {/* İngiltere */}
                            <path d="M415,95 L420,88 L425,92 L422,100 L418,105 L413,100 Z"
                                fill="var(--map-color)" />
                            {/* İskandinavya */}
                            <path d="M460,55 L465,50 L475,48 L480,55 L478,70 L472,82 L465,85 L458,78 L455,68 Z"
                                fill="var(--map-color)" />
                            {/* Afrika */}
                            <path d="M440,180 L460,170 L480,168 L500,172 L515,180 L525,195 L530,215 L528,240 L520,265 L510,285 L500,300 L488,312 L475,318 L462,315 L450,305 L442,290 L438,270 L435,250 L433,230 L435,210 L438,195 Z"
                                fill="var(--map-color)" />
                            {/* Madagaskar */}
                            <path d="M540,280 L545,275 L548,285 L546,298 L540,300 L538,290 Z"
                                fill="var(--map-color)" />
                            {/* Orta Doğu / Türkiye */}
                            <path d="M510,130 L530,125 L545,128 L555,135 L558,145 L555,155 L545,162 L530,165 L520,168 L512,165 L508,155 L505,145 L508,135 Z"
                                fill="var(--map-color)" />
                            {/* Hindistan */}
                            <path d="M600,170 L620,160 L635,165 L640,180 L638,200 L630,220 L618,235 L608,240 L600,235 L595,220 L592,200 L595,185 Z"
                                fill="var(--map-color)" />
                            {/* Rusya / Kuzey Asya */}
                            <path d="M500,70 L530,60 L570,55 L620,50 L670,48 L720,50 L760,55 L790,62 L800,75 L795,90 L780,100 L760,105 L730,108 L700,105 L670,100 L640,95 L610,92 L580,90 L550,88 L520,85 L505,80 Z"
                                fill="var(--map-color)" />
                            {/* Çin / Doğu Asya */}
                            <path d="M660,110 L690,105 L720,110 L740,120 L750,135 L748,155 L738,170 L720,180 L700,185 L680,182 L665,175 L655,160 L650,145 L652,130 L655,118 Z"
                                fill="var(--map-color)" />
                            {/* Japonya */}
                            <path d="M775,120 L780,112 L785,118 L783,130 L778,140 L773,135 L772,125 Z"
                                fill="var(--map-color)" />
                            {/* Güneydoğu Asya */}
                            <path d="M680,195 L700,190 L718,195 L725,210 L720,225 L710,232 L695,230 L685,222 L678,210 Z"
                                fill="var(--map-color)" />
                            {/* Endonezya */}
                            <path d="M690,250 L710,248 L730,250 L748,255 L755,262 L748,268 L730,270 L710,268 L695,265 L688,258 Z"
                                fill="var(--map-color)" />
                            {/* Avustralya */}
                            <path d="M740,310 L770,300 L800,298 L830,305 L850,320 L855,340 L845,360 L825,375 L800,382 L775,378 L755,368 L742,350 L735,335 L738,320 Z"
                                fill="var(--map-color)" />
                            {/* Yeni Zelanda */}
                            <path d="M870,375 L875,368 L880,372 L878,385 L873,390 L868,385 Z"
                                fill="var(--map-color)" />
                            {/* Grönland */}
                            <path d="M280,40 L300,35 L320,38 L330,50 L325,65 L310,72 L295,70 L283,60 L278,50 Z"
                                fill="var(--map-color)" />
                            {/* Enlem çizgileri */}
                            <line x1="50" y1="125" x2="950" y2="125" stroke="var(--map-line)" strokeWidth="0.5" strokeDasharray="8,6" opacity="0.5" />
                            <line x1="50" y1="250" x2="950" y2="250" stroke="var(--map-line)" strokeWidth="0.5" strokeDasharray="8,6" opacity="0.5" />
                            <line x1="50" y1="375" x2="950" y2="375" stroke="var(--map-line)" strokeWidth="0.5" strokeDasharray="8,6" opacity="0.5" />
                            {/* Boylam çizgileri */}
                            <line x1="250" y1="30" x2="250" y2="470" stroke="var(--map-line)" strokeWidth="0.5" strokeDasharray="8,6" opacity="0.5" />
                            <line x1="500" y1="30" x2="500" y2="470" stroke="var(--map-line)" strokeWidth="0.5" strokeDasharray="8,6" opacity="0.5" />
                            <line x1="750" y1="30" x2="750" y2="470" stroke="var(--map-line)" strokeWidth="0.5" strokeDasharray="8,6" opacity="0.5" />
                            </g>
                        </svg>
                    </div>

                    {/* Tıklanabilir Pin ve Tooltip Katmanı (Kartların ve çizgilerin üzerinde olması için zIndex: 3) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '95%',
                            height: '85%',
                            pointerEvents: 'none',
                            zIndex: 3
                        }}
                    >
                        <svg
                            viewBox="0 0 1000 500"
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'block',
                                pointerEvents: 'none'
                            }}
                        >
                            {/* Tıklanabilir Pin Katmanı */}
                            <g style={{ pointerEvents: 'auto' }}>
                                {/* Seyahat Konum Noktaları */}
                                {myTrips.map(trip => {
                                    if (!trip.latitude || !trip.longitude) return null;
                                    const { x, y } = latLngToSvg(trip.latitude, trip.longitude);
                                    const isSelected = selectedPin && selectedPin.id === trip.id;
                                    return (
                                        <g key={`pin-${trip.id}`}
                                            id={`pin-${trip.id}`}
                                            onClick={(e) => { e.stopPropagation(); handlePinClick(trip, x, y); }}
                                            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                                        >
                                            {/* Dış halka */}
                                            <circle cx={x} cy={y} r={isSelected ? 14 : 10}
                                                fill="var(--pin-outer)"
                                                stroke="none" />
                                            {/* İç nokta */}
                                            <circle cx={x} cy={y} r={isSelected ? 6 : 4.5}
                                                fill="var(--pin-inner)"
                                                stroke="var(--pin-stroke)"
                                                strokeWidth="1.5" />
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>

                        {/* Seçili Pin HTML Tooltip (SVG ile mükemmel hizalanmış) */}
                        {selectedPin && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute',
                                    left: `${(selectedPin.svgX / 1000) * 100}%`,
                                    top: `${(selectedPin.svgY / 500) * 100}%`,
                                    transform: 'translate(-50%, -120%)',
                                    backgroundColor: 'var(--tooltip-bg)',
                                    border: '1px solid var(--tooltip-border)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    minWidth: '140px',
                                    textAlign: 'center',
                                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
                                    zIndex: 10,
                                    pointerEvents: 'auto'
                                }}
                            >
                                {/* Ok işareti */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '8px solid transparent',
                                    borderRight: '8px solid transparent',
                                    borderTop: '8px solid var(--tooltip-bg)'
                                }} />
                                {/* Ok sınır çizgisi */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-9px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '8px solid transparent',
                                    borderRight: '8px solid transparent',
                                    borderTop: '8px solid var(--tooltip-border)',
                                    zIndex: -1
                                }} />
                                <p style={{
                                    margin: '0 0 4px 0',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: 'var(--tooltip-text)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {selectedPin.placeName ? `${selectedPin.placeName} (${selectedPin.city})` : `${selectedPin.city}, ${selectedPin.country}`}
                                </p>
                                <p style={{
                                    margin: 0,
                                    fontSize: '11px',
                                    color: 'var(--tooltip-text-sec)'
                                }}>
                                    {selectedPin.visitDate}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bağlantı Çizgileri Katmanı */}
                    <svg
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}
                    >
                        {myTrips.map(trip => (
                            <line
                                key={`line-${trip.id}`}
                                id={`line-${trip.id}`}
                                stroke="var(--line-color)"
                                strokeWidth="2"
                                strokeDasharray="4,4"
                                opacity="0.9"
                                // JavaScript animasyon döngüsüyle çelişmemesi için koordinat transition'ı kaldırıldı
                            />
                        ))}
                    </svg>

                    {/* Seyahat Kartları */}
                    {myTrips.length > 0 ? (
                        <div className="travel-board-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: '70px 1fr 70px',
                            gap: '24px',
                            position: 'relative',
                            zIndex: 2,
                            pointerEvents: 'none',
                            minHeight: '500px',
                            alignItems: 'center'
                        }}>
                            {/* Sol Sütun (Çift İndeksli Kartlar) */}
                            <div className="travel-board-column" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                justifyContent: 'center',
                                pointerEvents: 'none'
                            }}>
                                {leftTrips.map(trip => renderTripCard(trip))}
                            </div>

                            {/* Orta Boş Alan (Haritanın rahatça görünmesi ve kapatılmaması için) */}
                            <div style={{ pointerEvents: 'none', minHeight: '300px' }} />

                            {/* Sağ Sütun (Tek İndeksli Kartlar) */}
                            <div className="travel-board-column" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                justifyContent: 'center',
                                pointerEvents: 'none'
                            }}>
                                {rightTrips.map(trip => renderTripCard(trip))}
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '290px',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{
                                    fontSize: '42px',
                                    margin: '0 0 12px 0',
                                    lineHeight: 1
                                }}>
                                    🌍
                                </p>
                                <p style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: 'var(--map-color)',
                                    margin: '0 0 6px 0',
                                    letterSpacing: '1px'
                                }}>
                                    Seyahat Haritası
                                </p>
                                <p style={{
                                    fontSize: '13px',
                                    color: 'var(--polaroid-text-sec)',
                                    margin: 0,
                                    fontStyle: 'italic'
                                }}>
                                    Henüz seyahat eklenmedi...
                                </p>
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* Seyahat Fotoğraf Galerisi */}
            <div style={{ marginTop: '40px' }}>
                <h3 style={{
                    margin: '0 0 15px 0',
                    color: 'var(--text-color)',
                    fontSize: '18px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📷 Seyahat Fotoğraf Galerisi
                </h3>

                {myTrips.length > 0 ? (
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        overflowX: 'auto',
                        padding: '15px 10px 25px 10px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--board-border) var(--card-bg)'
                    }}>
                        {myTrips.map(trip => (
                            <GalleryCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'var(--card-bg)',
                        padding: '30px',
                        borderRadius: '10px',
                        border: '1px dashed var(--empty-border)',
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>
                            Galeride gösterilecek seyahat bulunmuyor.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ProfilePage;