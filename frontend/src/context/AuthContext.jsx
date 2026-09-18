import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, updateRollNumberApi, logoutApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMe();
      setUser({
        name: data.name,
        email: data.email,
        rollNumber: data.rollNumber || null,
        picture: data.picture || null,
      });
      setRole(data.role);
      setAuthenticated(true);
    } catch {
      setUser(null);
      setRole(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRollNumber = useCallback(async (rollNumber) => {
    const res = await updateRollNumberApi(rollNumber);
    await checkAuth();
    return res;
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setRole(null);
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        authenticated,
        loading,
        refreshUser: checkAuth,
        updateRollNumber,
        logout,
      }}
    >
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
