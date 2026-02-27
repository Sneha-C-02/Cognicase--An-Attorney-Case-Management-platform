import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authData = localStorage.getItem('cognicase_auth');
        if (authData) {
            try {
                const { user: storedUser, token: storedToken } = JSON.parse(authData);
                if (storedUser && storedToken) {
                    setUser(storedUser);
                    setToken(storedToken);
                }
            } catch (err) {
                console.error("Failed to parse auth data from localStorage", err);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('cognicase_auth', JSON.stringify({ user: userData, token: tokenData }));
    };

    const updateOnboardedStatus = (updatedUser) => {
        setUser(updatedUser);
        const authData = JSON.parse(localStorage.getItem('cognicase_auth') || '{}');
        localStorage.setItem('cognicase_auth', JSON.stringify({ ...authData, user: updatedUser }));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('cognicase_auth');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateOnboardedStatus, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
