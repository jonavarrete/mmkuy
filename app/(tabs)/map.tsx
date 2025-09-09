import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { DeliveryRequest, DeliveryPerson } from '@/types';
import OSMMapView from '@/components/OSMMapView';
import { Plus, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback } from 'react';

export default function MapScreen() {
  const { user } = useAuth();
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 23.1319,
    longitude: -82.3841,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [loading, setLoading] = useState(true);

  // Usar useFocusEffect para recargar datos cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      loadMapData();
      getCurrentLocation();
      
      // Si es repartidor, actualizar ubicación periódicamente
      let locationInterval: NodeJS.Timeout;
      if (user?.role === 'delivery') {
        locationInterval = setInterval(() => {
          getCurrentLocation();
        }, 30000); // Cada 30 segundos
      }
      
      return () => {
        if (locationInterval) {
          clearInterval(locationInterval);
        }
      };
    }, [user?.role])
  );

  useEffect(() => {
    loadMapData();
    getCurrentLocation();
    
    // Si es repartidor, actualizar ubicación periódicamente
    let locationInterval: NodeJS.Timeout;
    if (user?.role === 'delivery') {
      locationInterval = setInterval(() => {
        getCurrentLocation();
      }, 30000); // Cada 30 segundos
    }
    
    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [user?.role]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      
      // Si es repartidor, actualizar su ubicación en el servidor
      if (user?.role === 'delivery') {
        try {
          await apiService.updateDeliveryPersonLocation(
            user.id, 
            location.coords.latitude, 
            location.coords.longitude
          );
        } catch (error) {
          console.error('Error updating delivery person location:', error);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Ubicación no disponible',
        'No se pudo obtener tu ubicación actual. Asegúrate de que los servicios de ubicación estén activados en tu dispositivo.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const loadMapData = async () => {
    try {
      console.log('Cargando datos del mapa...');
      const requests = await apiService.getDeliveryRequests();
      const persons = await apiService.getAvailableDeliveryPersons();
      
      // Filtrar según el rol del usuario
      if (user?.role === 'user') {
        // Los usuarios solo ven sus propias solicitudes
        setDeliveryRequests(requests.filter(r => r.user_id === user.id));
        setDeliveryPersons([]); // No ven repartidores disponibles
      } else if (user?.role === 'delivery') {
        // Los repartidores ven:
        // 1. Entregas pendientes (solo punto de recogida)
        // 2. Sus entregas asignadas (punto de recogida y entrega)
        const availableRequests = requests.filter(r => r.status === 'pending' && !r.delivery_person_id);
        const assignedRequests = requests.filter(r => 
          r.delivery_person_id === user.id && r.status !== 'delivered' && r.status !== 'cancelled'
        );
        
        const filteredRequests = [...availableRequests, ...assignedRequests];
        
        console.log('Entregas filtradas para repartidor:', {
          available: availableRequests.length,
          assigned: assignedRequests.length,
          total: filteredRequests.length
        });
        
        setDeliveryRequests(filteredRequests);
        // No mostrar otros repartidores para evitar confusión
        setDeliveryPersons([]);
      } else {
        // Los admin ven todo
        setDeliveryRequests(requests);
        setDeliveryPersons(persons);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (id: string, type: 'request' | 'delivery_person') => {
    if (type === 'request') {
      router.push(`/delivery/${id}`);
    } else {
      // Mostrar información del repartidor
      Alert.alert('Repartidor', 'Ver perfil del repartidor');
    }
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    if (user?.role !== 'delivery') return;

    try {
      await apiService.acceptDeliveryRequest(deliveryId, user.id);
      // Recargar los datos del mapa para mostrar los cambios
      await loadMapData();
      Alert.alert('¡Entrega aceptada!', 'La entrega ha sido asignada a ti');
    } catch (error) {
      console.error('Error accepting delivery:', error);
      Alert.alert('Error', 'No se pudo aceptar la entrega');
    }
  };

  const handleCreateDelivery = () => {
    router.push('/create-delivery');
  };

  const getFloatingButtonConfig = () => {
    switch (user?.role) {
      case 'delivery':
        return {
          show: false,
        };
      case 'admin':
        return {
          show: false,
        };
      default: // user
        return {
          show: true,
          onPress: handleCreateDelivery,
          icon: Plus,
          text: 'Nuevo Envío',
        };
    }
  };

  const floatingButton = getFloatingButtonConfig();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mapa</Text>
          <Text style={styles.subtitle}>
            {user?.role === 'delivery' 
              ? 'Entregas disponibles y activas'
              : user?.role === 'admin'
              ? 'Vista general del sistema'
              : 'Tus envíos y seguimiento'
            }
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <OSMMapView
          region={mapRegion}
          deliveryRequests={deliveryRequests}
          deliveryPersons={deliveryPersons}
          onMarkerPress={handleMarkerPress}
          onAcceptDelivery={handleAcceptDelivery}
          showUserLocation={true}
          currentUser={user ? { id: user.id, role: user.role } : undefined}
          userLocation={userLocation ? {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude
          } : undefined}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Recogida</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Entrega</Text>
        </View>
        {user?.role === 'admin' && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Repartidor</Text>
          </View>
        )}
        {user?.role === 'delivery' && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
            <Text style={styles.legendText}>Tu ubicación</Text>
          </View>
        )}
      </View>

      {/* Floating Action Button */}
      {floatingButton.show && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={floatingButton.onPress}
        >
          <floatingButton.icon size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  mapContainer: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});