import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, MapPin, Clock, Package, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { DeliveryRequest } from '@/types';
import DeliveryCard from '@/components/DeliveryCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const [recentDeliveries, setRecentDeliveries] = useState<DeliveryRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const deliveries = await apiService.getDeliveryRequests(user?.id);
      setRecentDeliveries(deliveries.slice(0, 3)); // Últimas 3

      // Calcular estadísticas
      const total = deliveries.length;
      const pending = deliveries.filter(d => d.status === 'pending').length;
      const completed = deliveries.filter(d => d.status === 'delivered').length;
      const inProgress = deliveries.filter(d => 
        ['accepted', 'picked_up', 'in_transit'].includes(d.status)
      ).length;

      setStats({ total, pending, completed, inProgress });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'admin':
        return {
          title: 'Panel de Control',
          subtitle: 'Gestiona toda la plataforma',
          actionText: 'Ver Estadísticas',
          onAction: () => router.push('/(tabs)/map'),
        };
      case 'delivery':
        return {
          title: 'Entregas Disponibles',
          subtitle: 'Encuentra trabajos cerca de ti',
          actionText: 'Ver Mapa',
          onAction: () => router.push('/(tabs)/map'),
        };
      default:
        return {
          title: 'Enviar Paquete',
          subtitle: 'Envía de forma rápida y segura',
          actionText: 'Nuevo Envío',
          onAction: () => router.push('/create-delivery'),
        };
    }
  };

  const roleContent = getRoleSpecificContent();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name?.split(' ')[0]}!
            </Text>
            <Text style={styles.subtitle}>{roleContent.subtitle}</Text>
          </View>
        </View>

        {/* Quick Action Card */}
        <TouchableOpacity style={styles.actionCard} onPress={roleContent.onAction}>
          <View style={styles.actionContent}>
            <Plus size={24} color="#FFFFFF" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{roleContent.title}</Text>
              <Text style={styles.actionSubtitle}>{roleContent.actionText}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Package size={20} color="#3B82F6" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <MapPin size={20} color="#8B5CF6" />
            <Text style={styles.statNumber}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>En Curso</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>

        {/* Recent Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/deliveries')}>
              <Text style={styles.seeAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {recentDeliveries.length > 0 ? (
            <View style={styles.deliveriesList}>
              {recentDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onPress={() => router.push(`/delivery/${delivery.id}`)}
                  userRole={user?.role}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Sin actividad reciente</Text>
              <Text style={styles.emptySubtitle}>
                {user?.role === 'delivery' 
                  ? 'Busca entregas disponibles en el mapa'
                  : 'Crea tu primer envío para comenzar'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionCard: {
    margin: 20,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    margin: '1.5%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  deliveriesList: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
});