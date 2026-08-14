import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';  // ← IMPORT ADDED
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Check if user is already logged in
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // ========== LOGIN FUNCTION ==========
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password
            });

            const { token, email: userEmail, fullName, role } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                email: userEmail,
                fullName,
                role
            }));

            setToken(token);
            setUser({ email: userEmail, fullName, role });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            toast.success(`Welcome ${fullName}! 🎉`);
            return { success: true, role, user: { email: userEmail, fullName, role } };

        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // ========== LOGOUT FUNCTION ==========
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
    };

    // ========== CHECK IF USER IS ADMIN ==========
    const isAdmin = () => {
        return user?.role === 'ADMIN';
    };

    // ========== CHECK IF USER IS INTERN ==========
    const isIntern = () => {
        return user?.role === 'INTERN';
    };

    // ========== GET ROLE-BASED REDIRECT PATH ==========
    const getDashboardPath = () => {
        if (user?.role === 'ADMIN') {
            return '/dashboard';
        } else if (user?.role === 'INTERN') {
            return '/intern-dashboard';
        }
        return '/dashboard';
    };

    // ========== UPDATE USER PROFILE ==========
    const updateUser = async (userData) => {
        try {
            const response = await axios.put('/api/auth/profile', userData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedUser = { ...user, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast.success('Profile updated successfully');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // ========== REGISTER NEW USER ==========
    const registerUser = async (userData) => {
        try {
            const response = await axios.post('/api/admin/users', userData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('User created successfully');
            return { success: true, user: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create user';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // ========== GET USER BY ID ==========
    const getUserById = async (userId) => {
        try {
            const response = await axios.get(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: true, user: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to get user';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // ========== DELETE USER ==========
    const deleteUser = async (userId) => {
        try {
            await axios.delete(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User deleted successfully');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete user';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // ========== TOGGLE USER STATUS ==========
    const toggleUserStatus = async (userId) => {
        try {
            await axios.patch(`/api/admin/users/${userId}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User status updated');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update status';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            isAdmin,
            isIntern,
            getDashboardPath,
            updateUser,
            registerUser,
            getUserById,
            deleteUser,
            toggleUserStatus,
            setUser,
            setToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ========== HELPER HOOKS ==========

export const useIsAuthenticated = () => {
    const { user, loading } = useAuth();
    return { isAuthenticated: !!user, loading };
};

export const useUserRole = () => {
    const { user } = useAuth();
    return user?.role || null;
};

export const useRequireAuth = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { state: { from: location } });
        }
    }, [user, loading, navigate, location]);

    return { user, loading };
};

export const useRequireRole = (allowedRoles) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { state: { from: location } });
        } else if (!loading && user && !allowedRoles.includes(user.role)) {
            if (user.role === 'ADMIN') {
                navigate('/dashboard');
            } else if (user.role === 'INTERN') {
                navigate('/intern-dashboard');
            } else {
                navigate('/');
            }
        }
    }, [user, loading, navigate, location, allowedRoles]);

    return { user, loading };
};