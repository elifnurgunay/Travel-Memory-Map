import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!token) {
            setError('Geçersiz sıfırlama bağlantısı. Lütfen e-posta adresinize gelen bağlantıyı kullanın.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Şifreler birbiriyle eşleşmiyor!');
            return;
        }

        if (newPassword.length < 4) {
            setError('Şifre en az 4 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/api/auth/reset-password', {
                token: token.trim(),
                newPassword: newPassword
            });

            if (response.data && response.data.message) {
                setMessage(response.data.message);
            } else {
                setMessage('Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.');
            }
            setIsSuccess(true);
        } catch (err) {
            console.error("Şifre yenileme hatası:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Geçersiz veya süresi dolmuş sıfırlama bağlantısı.');
            }
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
                🔒 Yeni Şifre Oluştur
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
                Lütfen hesabınız için yeni bir şifre belirleyin.
            </p>

            {!token && (
                <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--btn-danger)',
                    color: 'var(--btn-danger)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '20px'
                }}>
                    ⚠️ Bağlantıda sıfırlama anahtarı (token) bulunamadı. Lütfen e-postadaki tam bağlantıya tıklayın.
                </div>
            )}

            {isSuccess ? (
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        padding: '14px',
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid #22c55e',
                        color: '#22c55e',
                        borderRadius: '6px',
                        fontSize: '15px',
                        marginBottom: '20px',
                        fontWeight: 'bold'
                    }}>
                        ✅ {message}
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'var(--btn-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '15px'
                        }}
                    >
                        Giriş Yap Sayfasına Git
                    </button>
                </div>
            ) : (
                <>
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
                                Yeni Şifre:
                            </label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => {
                                    setError('');
                                    setNewPassword(e.target.value);
                                }} 
                                placeholder="En az 4 karakter"
                                required 
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{ color: 'var(--text-color)', fontSize: '14px', fontWeight: 'bold' }}>
                                Yeni Şifre (Tekrar):
                            </label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => {
                                    setError('');
                                    setConfirmPassword(e.target.value);
                                }} 
                                placeholder="Yeni şifrenizi tekrar girin"
                                required 
                                style={inputStyle}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !token}
                            style={{
                                padding: '12px',
                                backgroundColor: 'var(--btn-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: (loading || !token) ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                fontSize: '15px',
                                opacity: (loading || !token) ? 0.7 : 1,
                                transition: 'background-color 0.2s ease'
                            }}
                        >
                            {loading ? 'Şifre Güncelleniyor...' : 'Şifreyi Güncelle'}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                        <Link to="/login" style={{ color: 'var(--btn-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                            &larr; Giriş Sayfasına Dön
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
