import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBonusPopup, setShowBonusPopup] = useState(false);

  useEffect(() => {
    // Check for stored token on initial load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Always start with balance=0 from localStorage — live API will update it immediately
        const userWithoutStaleBalance = { ...parsedUser, balance: 0 };
        setUser(userWithoutStaleBalance);
        
        // Immediately fetch live user profile to keep data fresh
        api.get('/user/profile').then(profileRes => {
          const liveUser = { 
            ...parsedUser, 
            name: profileRes.data.name, 
            email: profileRes.data.email, 
            phone: profileRes.data.phone,
            isVerified: Boolean(profileRes.data.isVerified),
            balance: 0 // Will be updated by wallet call below if applicable
          };
          setUser(liveUser);
          localStorage.setItem('user', JSON.stringify(liveUser));
          
          // Then fetch live wallet balance if customer
          if (parsedUser.role === 'CUSTOMER') {
            api.get('/wallet/me').then(res => {
              const liveBalance = parseFloat(res.data?.availableBalance) || 0;
              const updated = { ...liveUser, balance: liveBalance };
              setUser(updated);
              localStorage.setItem('user', JSON.stringify(updated));
            }).catch(console.error);
          }
        }).catch(() => {
          // If API fails (e.g. token expired), log out
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
      } catch (err) {
        console.error("Failed to parse stored user", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      if (response.data.token) {
        const { token, email: userEmail, role, name, balance, isVerified } = response.data;
        const userData = { name: name || userEmail.split('@')[0], email: userEmail, role, isVerified: Boolean(isVerified), balance: balance || 0 };
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, role: userData.role };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error occurred during login' 
      };
    }
  };

  const updateBalance = (newBalance) => {
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateUser = (userDataWithToken) => {
    const { token, email: userEmail, role, name, balance, phone } = userDataWithToken;
    const userData = { ...user, name: name || userEmail?.split('@')[0], email: userEmail, role, balance: balance || user?.balance || 0, phone };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const refreshBalance = async () => {
    try {
      const res = await api.get('/wallet/me');
      const liveBalance = parseFloat(res.data?.availableBalance) || 0;
      updateBalance(liveBalance);
      return liveBalance;
    } catch { return null; }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      if (response.data.token) {
        // Auto-login upon successful registration
        const { token, email: userEmail, role, balance } = response.data;
        const userData = { name, email: userEmail, role, balance: balance || 100000.0 };
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Show bonus only on first signup
        if (!localStorage.getItem(`bonusClaimed_${userEmail}`)) {
          localStorage.setItem(`bonusClaimed_${userEmail}`, 'true');
          setShowBonusPopup(true);
        }
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: 'Registration failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error occurred during registration' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateBalance,
    updateUser,
    refreshBalance,
    isAuthenticated: !!user,
    showBonusPopup,
    setShowBonusPopup,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
