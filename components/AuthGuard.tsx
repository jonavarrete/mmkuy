import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return fallback || (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Verificando autenticación...</Text>
      </View>
    );
  }

  if (!user) {
    return fallback || (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acceso no autorizado</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});