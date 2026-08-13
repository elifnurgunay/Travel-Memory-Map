import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        if (error) setError('');
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        if (error) setError('');
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const result = await login(username, password);
        if (result.success) {
            navigate('/'); // Başarılı olursa ana sayfaya yönlendir
        } else {
            setError(result.message || 'Kullanıcı adı veya şifre hatalı.');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        borderRadius: '5px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-color)',
        boxSizing: 'border-box'
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderRadius: '8px' }}>
            <h2 style={{ color: 'var(--accent-color)' }}>Giriş Yap</h2>
            
            {error && (
                <div style={{
                    padding: '10px 12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--btn-danger)',
                    color: 'var(--btn-danger)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    lineHeight: '1.4'
                }}>
                    <span>⚠️</span>
                    <span>{typeof error === 'string' ? error : 'Kullanıcı adı veya şifre hatalı.'}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ color: 'var(--text-color)' }}>Kullanıcı Adı:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={handleUsernameChange} 
                        required 
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={{ color: 'var(--text-color)' }}>Şifre:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={handlePasswordChange} 
                        required 
                        style={inputStyle}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Giriş Yap
                </button>
            </form>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '14px' }}>
                <Link to="/forgot-password" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                    🔑 Şifremi Unuttum?
                </Link>
                <span style={{ color: 'var(--text-secondary)' }}>
                    Hesabın yok mu? <Link to="/register" style={{ color: 'var(--btn-primary)', fontWeight: 'bold' }}>Kayıt Ol</Link>
                </span>
            </div>
        </div>
    );
}
