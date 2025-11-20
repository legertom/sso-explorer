import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/me');
            setUser(response.data);
            setError(null);
        } catch (err) {
            // 401 is expected if not logged in
            if (err.response && err.response.status === 401) {
                setUser(null);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        window.location.href = '/auth/clever';
    };

    const logout = () => {
        window.location.href = '/auth/logout';
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
