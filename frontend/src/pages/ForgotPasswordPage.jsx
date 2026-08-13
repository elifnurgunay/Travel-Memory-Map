import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!email || !email.trim()) {
            setError('Lütfen e-posta adresinizi girin.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/api/auth/forgot-password', { email: email.trim() });
            if (response.data && response.data.message) {
                setMessage(response.data.message);
            } else {
                setMessage('E-posta adresi kayıtlıysa şifre sıfırlama bağlantısı gönderilmiştir.');
            }
        } catch (err) {
            console.error("Şifre sıfırlama isteği hatası:", err);
            // Güvenlik gereği spesifik hata yerine genel mesaj gösteriyoruz
            setMessage('E-posta adresi kayıtlıysa şifre sıfırlama bağlantısı gönderilmiştir.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginTop: '6px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-color)',
        boxSizing: 'border-box',
        fontSize: '14px'
    };

    return (
        <div style={{
            maxWidth: '420px',
            margin: '60px auto',
            padding: '24px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow)',
            boxSizing: 'border-box'
        }}>
            <h2 style={{ color: 'var(--accent-color)', marginTop: 0, marginBottom: '10px' }}>
                🔑 Şifremi Unuttum
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
                E-posta adresinizi girin. Şifrenizi yenilemeniz için size bir bağlantı göndereceğiz.
            </p>

            {message && (
                <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid #22c55e',
                    color: '#22c55e',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                }}>
                    ✉️ {message}
                </div>
            )}

            {error && (
                <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--btn-danger)',
                    color: 'var(--btn-danger)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ color: 'var(--text-color)', fontSize: '14px', fontWeight: 'bold' }}>
                        E-posta Adresi:
                    </label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => {
                            setError('');
                            setEmail(e.target.value);
                        }} 
                        placeholder="örnek@domain.com"
                        required 
                        style={inputStyle}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        padding: '12px',
                        backgroundColor: 'var(--btn-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        opacity: loading ? 0.7 : 1,
                        transition: 'background-color 0.2s ease'
                    }}
                >
                    {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                <Link to="/login" style={{ color: 'var(--btn-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                    &larr; Giriş Sayfasına Dön
                </Link>
            </div>
        </div>
    );
}
