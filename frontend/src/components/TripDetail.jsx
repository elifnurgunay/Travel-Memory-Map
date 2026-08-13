import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import {
    MapContainer,
    TileLayer,
    Marker
} from 'react-leaflet';

import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';


// =========================================================
// LEAFLET MARKER AYARI
// =========================================================

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


// =========================================================
// TRIP DETAIL
// =========================================================

const TripDetail = () => {

    const { id } = useParams();

    const { user } = useAuth();

    const [trip, setTrip] = useState(null);

    // =====================================================
    // YORUM STATE
    // =====================================================

    const [newComment, setNewComment] = useState('');

    // =====================================================
    // FOTOĞRAF STATE
    // =====================================================

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const [photoUploading, setPhotoUploading] = useState(false);

    // Büyük fotoğraf
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);

    // Dosya inputunu temizlemek için
    const fileInputRef = useRef(null);


    // =====================================================
    // JWT'DEN USERNAME AL
    // =====================================================

    const getUsernameFromToken = () => {

        try {

            const token = localStorage.getItem('token');

            if (!token) {
                return null;
            }

            const parts = token.split('.');

            if (parts.length !== 3) {
                return null;
            }

            const payload = JSON.parse(
                atob(parts[1])
            );

            return payload.sub || null;

        } catch (error) {

            console.error(
                'Token okunamadı:',
                error
            );

            return null;
        }
    };


    // =====================================================
    // TRIP DETAYLARINI GETİR
    // =====================================================

    const fetchTripDetails = async () => {

        try {

            const response = await api.get(
                `/api/trips/${id}`
            );

            console.log(
                'Trip detayları:',
                response.data
            );

            setTrip(response.data);

        } catch (error) {

            console.error(
                'Detaylar çekilirken hata:',
                error
            );

        }
    };


    // =====================================================
    // SAYFA AÇILDIĞINDA TRIP GETİR
    // =====================================================

    useEffect(() => {

        fetchTripDetails();

    }, [id]);


    // =====================================================
    // YORUM EKLE
    // =====================================================

    const handleAddComment = async (e) => {

        e.preventDefault();

        if (!newComment.trim()) {
            return;
        }

        try {

            await api.post(
                `/api/trips/${id}/comments`,
                {
                    content: newComment.trim()
                }
            );

            setNewComment('');

            await fetchTripDetails();

        } catch (error) {

            console.error(
                'Yorum eklenemedi:',
                error
            );

            alert(
                'Yorum eklenirken bir hata oluştu.'
            );
        }
    };


    // =====================================================
    // YORUM SİL
    // =====================================================

    const handleDeleteComment = async (commentId) => {

        const confirmed = window.confirm(
            'Bu yorumu silmek istediğinize emin misiniz?'
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/api/comments/${commentId}`
            );

            await fetchTripDetails();

        } catch (error) {

            console.error(
                'Yorum silinemedi:',
                error
            );

            alert(
                'Yorum silinemedi.'
            );
        }
    };


    // =====================================================
    // FOTOĞRAF SEÇ
    // =====================================================

    const handlePhotoSelect = (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedPhoto(file);
    };


    // =====================================================
    // FOTOĞRAF EKLE
    // =====================================================

    const handleAddPhoto = async (e) => {

        e.preventDefault();

        if (!selectedPhoto) {

            alert(
                'Lütfen bir fotoğraf seçin!'
            );

            return;
        }

        try {

            setPhotoUploading(true);

            const formData = new FormData();

            formData.append(
                'file',
                selectedPhoto
            );

            console.log(
                'Fotoğraf gönderiliyor:',
                { tripId: id, file: selectedPhoto.name }
            );

            await api.post(
                `/api/trips/${id}/photos`,
                formData
            );

            alert('Fotoğraf başarıyla yüklendi! 📸');

            // State temizle
            setSelectedPhoto(null);


            // Input temizle
            if (fileInputRef.current) {

                fileInputRef.current.value = '';

            }


            // Backend'deki gerçek listeyi tekrar getir
            await fetchTripDetails();

        } catch (error) {

            console.error(
                'Fotoğraf yüklenemedi:',
                error
            );


            console.error(
                'Backend response:',
                error.response?.data
            );


            if (error.response?.status === 403) {

                alert(
                    'Bu seyahate fotoğraf ekleme yetkiniz yok.'
                );

            } else if (error.response?.status === 413) {

                alert(
                    'Fotoğraf dosyası çok büyük.'
                );

            } else if (error.response?.status === 415) {

                alert(
                    'Desteklenmeyen fotoğraf formatı.'
                );

            } else if (error.response?.status === 401) {

                alert(
                    'Oturumunuz geçerli değil. Lütfen tekrar giriş yapın.'
                );

            } else {

                alert(
                    'Fotoğraf yüklenirken bir hata oluştu.'
                );
            }

        } finally {

            setPhotoUploading(false);

        }
    };


    // =====================================================
    // FOTOĞRAF SİL
    // =====================================================

    const handleDeletePhoto = async (photoId) => {

        // Modal açıksa ÖNCE kapat, sonra confirm sor
        setSelectedPhotoUrl(null);

        const confirmed = window.confirm(
            'Bu fotoğrafı silmek istediğinize emin misiniz?'
        );

        if (!confirmed) {
            return;
        }

        try {

            console.log('Fotoğraf siliniyor:', photoId);

            await api.delete(`/api/photos/${photoId}`);

            // Backend'den güncel listeyi çek
            await fetchTripDetails();

        } catch (error) {

            console.error('Fotoğraf silinemedi:', error);
            console.error('Backend response:', error.response?.data);

            if (error.response?.status === 403) {
                alert('Bu fotoğrafı silme yetkiniz yok.');
            } else if (error.response?.status === 404) {
                alert('Fotoğraf bulunamadı.');
            } else if (error.response?.status === 401) {
                alert('Oturumunuz geçerli değil. Lütfen tekrar giriş yapın.');
            } else {
                alert('Fotoğraf silinirken bir hata oluştu.');
            }
        }
    };


    // =====================================================
    // YÜKLENİYOR
    // =====================================================

    if (!trip) {
        return (
            <div
                style={{
                    color: 'var(--text-color)',
                    padding: '20px'
                }}
            >
                Yükleniyor...
            </div>
        );
    }


    // =====================================================
    // HARİTA KONUMU
    // =====================================================

    const position = [
        parseFloat(trip.latitude),
        parseFloat(trip.longitude)
    ];


    // =====================================================
    // KULLANICI
    // =====================================================

    const loggedInUsername =
        getUsernameFromToken();


    const tripOwnerUsername =
        trip?.user?.username;


    // =====================================================
    // SEYAHAT SAHİBİ Mİ?
    // =====================================================

    const isTripOwner =
        Boolean(
            loggedInUsername &&
            tripOwnerUsername &&
            String(loggedInUsername)
                .trim()
                .toLowerCase() ===
            String(tripOwnerUsername)
                .trim()
                .toLowerCase()
        );





    // =====================================================
    // FOTOĞRAF URL
    // =====================================================

    const getPhotoUrl = (photo) => {

        if (!photo?.photoUrl) {
            return '';
        }

        if (
            photo.photoUrl.startsWith('http://') ||
            photo.photoUrl.startsWith('https://')
        ) {
            return photo.photoUrl;
        }

        return `http://localhost:8080${photo.photoUrl}`;
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
            style={{
                padding: '20px',
                maxWidth: '800px',
                margin: '0 auto',
                fontFamily: 'sans-serif',
                color: 'var(--text-color)'
            }}
        >

            {/* ================================================= */}
            {/* GERİ DÖN */}
            {/* ================================================= */}

            <Link
                to="/"
                style={{
                    color: 'var(--btn-primary)',
                    textDecoration: 'none',
                    marginBottom: '20px',
                    display: 'inline-block'
                }}
            >
                ⬅️ Günlüğe Dön
            </Link>


            {/* ================================================= */}
            {/* SEYAHAT BİLGİLERİ */}
            {/* ================================================= */}

            <div
                style={{
                    backgroundColor: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '20px'
                }}
            >

                <h2
                    style={{
                        marginTop: 0,
                        color: 'var(--accent-color)'
                    }}
                >
                    {trip.placeName ? `${trip.placeName} (${trip.city}, ${trip.country})` : `${trip.city}, ${trip.country}`}
                </h2>


                <p>
                    <strong>📅 Tarih:</strong>{' '}
                    {trip.visitDate}
                </p>


                <p>
                    <strong>⭐ Puan:</strong>{' '}
                    {trip.rating}/5
                </p>


                <p
                    style={{
                        fontStyle: 'italic',
                        borderLeft: '3px solid var(--accent-color)',
                        paddingLeft: '10px',
                        margin: '20px 0'
                    }}
                >
                    "{trip.note}"
                </p>


                {/* ================================================= */}
                {/* KONUM */}
                {/* ================================================= */}

                <h3
                    style={{
                        marginTop: '30px',
                        color: 'var(--accent-color)'
                    }}
                >
                    📍 Konum
                </h3>


                <div
                    style={{
                        height: '300px',
                        width: '100%',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)'
                    }}
                >

                    <MapContainer
                        center={position}
                        zoom={13}
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                    >

                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker
                            position={position}
                        />

                    </MapContainer>

                </div>

            </div>


            {/* ================================================= */}
            {/* FOTOĞRAF GALERİSİ */}
            {/* ================================================= */}

            <div
                style={{
                    backgroundColor: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '20px'
                }}
            >

                <h3
                    style={{
                        marginTop: 0,
                        color: 'var(--accent-color)'
                    }}
                >
                    📸 Fotoğraf Galerisi
                </h3>





                {/* ================================================= */}
                {/* FOTOĞRAF YÜKLEME */}
                {/* ================================================= */}

                {isTripOwner && (

                    <form
                        onSubmit={handleAddPhoto}
                        style={{
                            marginBottom: '25px',
                            padding: '15px',
                            backgroundColor: 'var(--btn-secondary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                        }}
                    >

                        <h4
                            style={{
                                marginTop: 0,
                                marginBottom: '15px'
                            }}
                        >
                            📤 Yeni Fotoğraf Ekle
                        </h4>


                        {/* DOSYA SEÇ */}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            style={{
                                display: 'block',
                                marginBottom: '15px',
                                color: 'var(--text-color)'
                            }}
                        />


                        {/* SEÇİLEN DOSYA */}

                        {selectedPhoto && (

                            <p
                                style={{
                                    color: 'var(--text-secondary)',
                                    marginTop: 0
                                }}
                            >
                                Seçilen dosya:{' '}
                                {selectedPhoto.name}
                            </p>

                        )}





                        {/* YÜKLE */}

                        <button
                            type="submit"
                            disabled={
                                photoUploading ||
                                !selectedPhoto
                            }
                            style={{
                                padding: '10px 20px',
                                backgroundColor:
                                    photoUploading ||
                                    !selectedPhoto
                                        ? 'var(--btn-secondary)'
                                        : 'var(--btn-primary)',
                                color: 'var(--button-text)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '5px',
                                cursor:
                                    photoUploading ||
                                    !selectedPhoto
                                        ? 'not-allowed'
                                        : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >

                            {photoUploading
                                ? '⏳ Yükleniyor...'
                                : '📤 Fotoğraf Yükle'}

                        </button>

                    </form>

                )}


                {/* ================================================= */}
                {/* FOTOĞRAFLAR */}
                {/* ================================================= */}

                {trip.photos &&
                trip.photos.length > 0 ? (

                    <div
                        style={{
                            display: 'flex',
                            gap: '15px',
                            flexWrap: 'wrap'
                        }}
                    >

                        {trip.photos.map(photo => (

                            <div
                                key={photo.id}
                                style={{
                                    position: 'relative',
                                    width: '200px',
                                    height: '150px'
                                }}
                            >

                                {/* FOTOĞRAF */}

                                <img
                                    src={getPhotoUrl(photo)}
                                    alt="Seyahat Anısı"
                                    onClick={() =>
                                        setSelectedPhotoUrl(
                                            getPhotoUrl(photo)
                                        )
                                    }
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        display: 'block'
                                    }}
                                />


                                {/* SİL BUTONU */}

                                {isTripOwner && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePhoto(photo.id);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            backgroundColor: 'var(--btn-danger)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}

                            </div>

                        ))}

                    </div>

                ) : (

                    <p
                        style={{
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Henüz fotoğraf eklenmemiş.
                    </p>

                )}

            </div>


            {/* ================================================= */}
            {/* YORUMLAR */}
            {/* ================================================= */}

            <div
                style={{
                    backgroundColor: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)'
                }}
            >

                <h3
                    style={{
                        marginTop: 0,
                        color: 'var(--accent-color)'
                    }}
                >
                    💬 Yorumlar
                </h3>


                {/* YORUM FORMU */}

                <form
                    onSubmit={handleAddComment}
                    style={{
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '10px'
                    }}
                >

                    <input
                        type="text"
                        placeholder="Bir yorum yazın..."
                        value={newComment}
                        onChange={(e) =>
                            setNewComment(
                                e.target.value
                            )
                        }
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--card-bg)',
                            color: 'var(--text-color)'
                        }}
                    />


                    <button
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'var(--btn-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Gönder
                    </button>

                </form>


                {/* YORUM LİSTESİ */}

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >

                    {trip.comments &&
                    trip.comments.length > 0 ? (

                        trip.comments.map(comment => (

                            <div
                                key={comment.id}
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >

                                <div>

                                    <strong
                                        style={{
                                            color: 'var(--accent-color)'
                                        }}
                                    >
                                        {
                                            comment.user
                                                ?.username
                                        }
                                    </strong>


                                    <span
                                        style={{
                                            margin: '0 8px',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        |
                                    </span>


                                    <span>
                                        {
                                            comment.content
                                        }
                                    </span>

                                </div>


                                {loggedInUsername &&
                                comment.user?.username &&
                                loggedInUsername
                                    .trim()
                                    .toLowerCase() ===
                                comment.user.username
                                    .trim()
                                    .toLowerCase() && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteComment(
                                                comment.id
                                            )
                                        }
                                        style={{
                                            color: 'var(--btn-danger)',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            textDecoration:
                                                'underline'
                                        }}
                                    >
                                        Sil
                                    </button>

                                )}

                            </div>

                        ))

                    ) : (

                        <p
                            style={{
                                color: 'var(--text-secondary)'
                            }}
                        >
                            İlk yorumu sen yaz!
                        </p>

                    )}

                </div>

            </div>


            {/* ================================================= */}
            {/* BÜYÜK FOTOĞRAF MODALI */}
            {/* ================================================= */}

            {selectedPhotoUrl && (

                <div
                    onClick={() =>
                        setSelectedPhotoUrl(null)
                    }
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor:
                            'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        cursor: 'pointer',
                        padding: '20px',
                        boxSizing: 'border-box'
                    }}
                >

                    <img
                        src={selectedPhotoUrl}
                        alt="Büyük seyahat fotoğrafı"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            borderRadius: '10px',
                            boxShadow:
                                '0 0 30px rgba(0,0,0,0.7)'
                        }}
                    />


                    <button
                        type="button"
                        onClick={() =>
                            setSelectedPhotoUrl(null)
                        }
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '25px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>

                </div>

            )}

        </div>
    );
};


export default TripDetail;