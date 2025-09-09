import { useEffect } from 'react';
import { useSegments, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function RouteProtector() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  
  useEffect(() => {
    if (loading) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isRootIndex = segments.length === 0;
    
    if (!user) {
      if (!inAuthGroup && !isRootIndex) {
        router.replace('/(auth)/login');
      }
    } else {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, segments]);

  return null;
}