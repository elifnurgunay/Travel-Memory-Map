import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import TripDetail from './components/TripDetail';

// Korumalı Rota Bileşeni: Giriş yapılmadıysa otomatik /login sayfasına atar
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user, logout } = useAuth();
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: 'var(--main-bg)', color: 'var(--text-color)' }}>
      <nav style={{ padding: '20px', backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ marginRight: '20px', color: 'var(--btn-primary)', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>
            🌍 Keşfet
          </Link>
          {user && (
            <>
              <Link to="/trip/new" style={{ marginRight: '20px', color: 'var(--btn-primary)', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>
                ➕ Yeni Ekle
              </Link>
              <Link to="/profile" style={{ color: 'var(--btn-primary)', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>
                👤 Profilim
              </Link>
            </>
          )}
        </div>

        {/* Sağ üst kısımda kullanıcı çıkış butonu veya giriş linkleri */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={toggleTheme}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: 0
            }}
            title="Temayı Değiştir"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {user ? (
            <button 
              onClick={logout} 
              style={{ backgroundColor: 'var(--btn-danger)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Çıkış Yap
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/login" style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Giriş Yap</Link>
              <Link to="/register" style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Kayıt Ol</Link>
            </div>
          )}
        </div>
      </nav>

      <Routes>
        {/* Herkese Açık Auth Sayfaları */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Korumalı Seyahat Rotaları */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <TripList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trip/new" 
          element={
            <ProtectedRoute>
              <TripForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trip/:id" 
          element={
            <ProtectedRoute>
              <TripDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-trip/:id" 
          element={
            <ProtectedRoute>
              <TripForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;