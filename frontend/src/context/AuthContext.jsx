import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

// JWT token içinden kullanıcı adını alır
const getUsernameFromToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
    } catch (error) {
        console.error("Token okunamadı:", error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sayfa yenilense bile oturum açık kalsın
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const username = getUsernameFromToken(token);

            if (username) {
                setUser({
                    token,
                    username
                });
            } else {
                localStorage.removeItem('token');
            }
        }

        setLoading(false);
    }, []);

    // GİRİŞ YAPMA
    const login = async (username, password) => {
        try {
            const response = await api.post('/api/auth/login', {
                username,
                password
            });

            const token = response.data;

            localStorage.setItem('token', token);

            const loggedInUsername = getUsernameFromToken(token);

            setUser({
                token,
                username: loggedInUsername
            });

            return { success: true };

        } catch (error) {
            console.error("Giriş hatası:", error);

            let errorMessage = "Kullanıcı adı veya şifre hatalı.";

            if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                errorMessage = "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.";
            } else if (error.response.status === 401 || error.response.status === 403) {
                errorMessage = "Kullanıcı adı veya şifre hatalı.";
            } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    // KAYIT OLMA
    const register = async (username, email, password) => {
        try {
            const response = await api.post('/api/auth/register', {
                username,
                email,
                password
            });

            const token = response.data;

            localStorage.setItem('token', token);

            const registeredUsername = getUsernameFromToken(token);

            setUser({
                token,
                username: registeredUsername
            });

            return { success: true };

        } catch (error) {
            console.error("Kayıt hatası:", error);

            let errorMessage = "Kayıt olunamadı. Lütfen tekrar deneyin.";

            if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                errorMessage = "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.";
            } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    // ÇIKIŞ YAPMA
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                loading
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);