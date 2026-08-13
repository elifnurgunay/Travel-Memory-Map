import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [isCover, setIsCover] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await register(username, email, password);
        if (result.success) {
            navigate('/'); // Başarılı olursa ana sayfaya yönlendir
        } else {
            setError(result.message);
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
            <h2 style={{ color: 'var(--accent-color)' }}>Kayıt Ol</h2>
            {error && <p style={{ color: 'var(--btn-danger)' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ color: 'var(--text-color)' }}>Kullanıcı Adı:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={{ color: 'var(--text-color)' }}>E-posta:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={{ color: 'var(--text-color)' }}>Şifre:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={inputStyle}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Kayıt Ol
                </button>
            </form>
            <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>
                Zaten hesabın var mı? <Link to="/login" style={{ color: 'var(--btn-primary)' }}>Giriş Yap</Link>
            </p>
        </div>
    );
}
