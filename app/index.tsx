import { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    console.log('IndexScreen - Estado:', { user: !!user, loading });
    
    if (loading) {
      console.log('Cargando...');
      return;
    }

    if (user) {
      console.log('Usuario encontrado, navegando a tabs');
      setShouldRedirect(true);
      // Usar setTimeout para asegurar que la navegación ocurra en el próximo tick
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } else {
      console.log('Usuario no encontrado, navegando a login');
      setShouldRedirect(true);
      // Usar setTimeout para asegurar que la navegación ocurra en el próximo tick
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    }
  }, [user, loading]);

  // Si estamos cargando, mostrar pantalla de carga
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Si ya determinamos que hay que redirigir, mostrar pantalla de carga
  if (shouldRedirect) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>
          {user ? 'Accediendo...' : 'Redirigiendo al login...'}
        </Text>
      </View>
    );
  }

  // Fallback - no debería llegar aquí
  return (
    <View style={[styles.container, styles.centered]}>
      <Text style={styles.loadingText}>Iniciando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});