import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authService } from '../services/services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    // Check persisted user
    const savedUser = localStorage.getItem('dsa_user');
    const savedToken = localStorage.getItem('dsa_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        localStorage.removeItem('dsa_token');
        localStorage.removeItem('dsa_user');
        setLoading(false);
        return;
      }

      // If we already have a saved user, verify it's still valid
      if (savedToken) {
        try {
          const { data } = await authService.getMe();
          setUser(data.user);
          localStorage.setItem('dsa_user', JSON.stringify(data.user));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('dsa_token');
          localStorage.removeItem('dsa_user');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const { data } = await authService.firebaseLogin(idToken);

      localStorage.setItem('dsa_token', data.token);
      localStorage.setItem('dsa_user', JSON.stringify(data.user));
      setUser(data.user);

      return { user: data.user, isNewUser: data.isNewUser };
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (profileData) => {
    try {
      const { data } = await authService.completeProfile(profileData);
      const updatedUser = { ...user, ...data.user, isProfileComplete: true };
      setUser(updatedUser);
      localStorage.setItem('dsa_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Complete profile error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('dsa_token');
    localStorage.removeItem('dsa_user');
    toast.success('Logged out successfully');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('dsa_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithGoogle,
        completeProfile,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isMentor: user?.role === 'mentor' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
