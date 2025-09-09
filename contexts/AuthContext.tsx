import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { AuthContextType, User } from '@/types';
import { apiService } from '@/services/api';

const AuthContext = createContext<AuthContextType | null>(null);

// Elimina el hook useProtectedRoute de aquí y muévelo a donde se use
// o crea un componente wrapper separado

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
    
    const interval = setInterval(() => {
      checkUserSession();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStoredUser = async () => {
    try {
      console.log('Cargando usuario almacenado...');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('Usuario encontrado en storage:', userData.email);
        setUser(userData);
      } else {
        console.log('No hay usuario almacenado');
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser && user) {
        console.log('Sesión expirada, limpiando estado');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Iniciando sesión para:', email);
      const userData = await apiService.login(email, password);
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('Sesión iniciada exitosamente');
      
      // Redirigir después de login exitoso
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (error) {
      console.error('Error en signIn:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string, role: 'user' | 'delivery') => {
    try {
      console.log('Registrando usuario:', email);
      const userData = await apiService.register(email, password, name, phone, role);
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('Registro exitoso');
      
      // Redirigir después de registro exitoso
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (error) {
      console.error('Error en signUp:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Cerrando sesión...');
      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('Sesión cerrada, redirigiendo a login');
      
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};