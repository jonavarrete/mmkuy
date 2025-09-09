import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Filter, Package } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { DeliveryRequest } from '@/types';
import DeliveryCard from '@/components/DeliveryCard';

export default function DeliveriesScreen() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'active', label: 'Activos' },
    { key: 'completed', label: 'Completados' },
  ];

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    applyFilter(selectedFilter);
  }, [deliveries, selectedFilter]);

  const loadDeliveries = async () => {
    try {
      let userDeliveries: DeliveryRequest[] = [];
      
      if (user?.role === 'admin') {
        // Admin ve todas las entregas
        userDeliveries = await apiService.getDeliveryRequests();
      } else if (user?.role === 'delivery') {
        // Repartidor ve solo sus entregas asignadas
        const allDeliveries = await apiService.getDeliveryRequests();
        userDeliveries = allDeliveries.filter(d => d.delivery_person_id === user.id);
      } else {
        // Usuario ve solo sus entregas creadas
        userDeliveries = await apiService.getDeliveryRequests(user?.id);
      }

      setDeliveries(userDeliveries);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (filter: string) => {
    let filtered = [...deliveries];

    switch (filter) {
      case 'pending':
        filtered = deliveries.filter(d => d.status === 'pending');
        break;
      case 'active':
        filtered = deliveries.filter(d => 
          ['accepted', 'picked_up', 'in_transit'].includes(d.status)
        );
        break;
      case 'completed':
        filtered = deliveries.filter(d => 
          ['delivered', 'cancelled'].includes(d.status)
        );
        break;
      default:
        // 'all' - no filter
        break;
    }

    setFilteredDeliveries(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDeliveries();
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    if (user?.role !== 'delivery') return;

    try {
      await apiService.acceptDeliveryRequest(deliveryId, user.id);
      loadDeliveries(); // Recargar la lista
    } catch (error) {
      console.error('Error accepting delivery:', error);
    }
  };

  const getHeaderTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Todas las Entregas';
      case 'delivery':
        return 'Mis Entregas';
      default:
        return 'Mis Envíos';
    }
  };

  const getEmptyStateText = () => {
    switch (user?.role) {
      case 'delivery':
        return {
          title: 'Sin entregas asignadas',
          subtitle: 'Busca entregas disponibles en el mapa',
        };
      default:
        return {
          title: 'Sin envíos creados',
          subtitle: 'Crea tu primer envío para comenzar',
        };
    }
  };

  const renderDeliveryCard = ({ item }: { item: DeliveryRequest }) => (
    <DeliveryCard
      delivery={item}
      onPress={() => router.push(`/delivery/${item.id}`)}
      onAccept={() => handleAcceptDelivery(item.id)}
      showActions={user?.role === 'delivery' && item.status === 'pending'}
      userRole={user?.role}
    />
  );

  const emptyState = getEmptyStateText();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{getHeaderTitle()}</Text>
          <Text style={styles.subtitle}>
            {filteredDeliveries.length} {filteredDeliveries.length === 1 ? 'entrega' : 'entregas'}
          </Text>
        </View>
        {user?.role === 'user' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/create-delivery')}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter.key && styles.filterButtonTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredDeliveries}
        renderItem={renderDeliveryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Package size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>{emptyState.title}</Text>
            <Text style={styles.emptySubtitle}>{emptyState.subtitle}</Text>
            {user?.role === 'user' && (
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={() => router.push('/create-delivery')}
              >
                <Text style={styles.emptyActionText}>Crear Envío</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyActionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});