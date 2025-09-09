import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { AuthContextType, User } from '@/types';
import { apiService } from '@/services/api';

const AuthContext = createContext<AuthContextType | null>(null);

// Hook para proteger rutas
function useProtectedRoute(user: User | null, loading: boolean) {
  const segments = useSegments();
  
  useEffect(() => {
    if (loading) return; // No hacer nada mientras carga
    
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isRootIndex = segments.length === 0;
    
    console.log('useProtectedRoute - Estado:', { 
      user: !!user, 
      loading, 
      segments: segments.join('/'),
      inAuthGroup,
      inTabsGroup,
      isRootIndex
    });
    
    if (!user) {
      // Usuario no autenticado
      if (!inAuthGroup && !isRootIndex) {
        console.log('Usuario no autenticado, redirigiendo a login');
        router.replace('/(auth)/login');
      }
    } else {
      // Usuario autenticado
      if (inAuthGroup) {
        console.log('Usuario autenticado en auth, redirigiendo a tabs');
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, segments]);
}

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
  
  // Usar el hook de protección de rutas
  useProtectedRoute(user, loading);

  useEffect(() => {
    loadStoredUser();
    
    // Verificar el estado del usuario periódicamente
    const interval = setInterval(() => {
      checkUserSession();
    }, 30000); // Cada 30 segundos
    
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
        // El usuario fue eliminado del storage pero aún está en el estado
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
      // Forzar redirección inmediata al login
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