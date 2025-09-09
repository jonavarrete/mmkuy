import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isProtectedRoute = inTabsGroup || segments.includes('create-delivery') || segments.includes('delivery');

    console.log('useAuthRedirect:', {
      user: !!user,
      segments: segments.join('/'),
      inAuthGroup,
      isProtectedRoute
    });

    if (!user && isProtectedRoute) {
      // Usuario no autenticado intentando acceder a ruta protegida
      console.log('Redirigiendo a login - ruta protegida sin autenticación');
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Usuario autenticado en páginas de auth
      console.log('Redirigiendo a tabs - usuario autenticado en auth');
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);
}