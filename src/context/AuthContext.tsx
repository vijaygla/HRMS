import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate it
    const initializeAuth = async () => {
      const token = localStorage.getItem('hrms_token');
      
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
            toast.success('Welcome back!', { duration: 2000 });
          } else {
            localStorage.removeItem('hrms_token');
            localStorage.removeItem('hrms_user');
            toast.error('Session expired. Please login again.');
          }
        } catch (error: any) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('hrms_token');
          localStorage.removeItem('hrms_user');
          
          if (error?.message && !error.message.includes('Network Error')) {
            toast.error('Session expired. Please login again.');
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { user: userData, token } = response.data;
        setUser(userData);
        localStorage.setItem('hrms_token', token);
        localStorage.setItem('hrms_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        const { user: newUser, token } = response.data;
        setUser(newUser);
        localStorage.setItem('hrms_token', token);
        localStorage.setItem('hrms_user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('hrms_user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};