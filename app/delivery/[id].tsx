import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { ArrowLeft, MapPin, Package, User, Phone, Clock, CircleCheck as CheckCircle, Circle as XCircle, Truck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { DeliveryRequest } from '@/types';
import OSMMapView from '@/components/OSMMapView';

const STATUS_COLORS = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  picked_up: '#8B5CF6',
  in_transit: '#06B6D4',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  picked_up: 'Recogido',
  in_transit: 'En tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDelivery();
    }
  }, [id]);

  const loadDelivery = async () => {
    try {
      const deliveries = await apiService.getDeliveryRequests();
      const foundDelivery = deliveries.find(d => d.id === id);
      setDelivery(foundDelivery || null);
    } catch (error) {
      console.error('Error loading delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: DeliveryRequest['status']) => {
    if (!delivery) return;

    try {
      await apiService.updateDeliveryRequest(delivery.id, { status: newStatus });
      setDelivery({ ...delivery, status: newStatus });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const handleAcceptDelivery = async () => {
    if (!delivery || user?.role !== 'delivery') return;

    try {
      const updatedDelivery = await apiService.acceptDeliveryRequest(delivery.id, user.id);
      setDelivery(updatedDelivery);
      Alert.alert('¡Entrega aceptada!', 'La entrega ha sido asignada a ti');
    } catch (error) {
      Alert.alert('Error', 'No se pudo aceptar la entrega');
    }
  };

  const getActionButtons = () => {
    if (!delivery) return null;

    const buttons = [];

    if (user?.role === 'delivery') {
      if (delivery.status === 'pending') {
        buttons.push({
          title: 'Aceptar Entrega',
          onPress: handleAcceptDelivery,
          style: styles.acceptButton,
          textStyle: styles.acceptButtonText,
        });
      } else if (delivery.delivery_person_id === user.id) {
        switch (delivery.status) {
          case 'accepted':
            buttons.push({
              title: 'Marcar como Recogido',
              onPress: () => handleStatusUpdate('picked_up'),
              style: styles.actionButton,
              textStyle: styles.actionButtonText,
            });
            break;
          case 'picked_up':
            buttons.push({
              title: 'En Tránsito',
              onPress: () => handleStatusUpdate('in_transit'),
              style: styles.actionButton,
              textStyle: styles.actionButtonText,
            });
            break;
          case 'in_transit':
            buttons.push({
              title: 'Marcar como Entregado',
              onPress: () => handleStatusUpdate('delivered'),
              style: styles.deliveredButton,
              textStyle: styles.deliveredButtonText,
            });
            break;
        }
      }
    }

    return buttons;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Entrega no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[delivery.status];
  const statusLabel = STATUS_LABELS[delivery.status];
  const actionButtons = getActionButtons();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Entrega #${delivery.id.slice(-6)}`,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
          <Text style={styles.price}>€{delivery.price.toFixed(2)}</Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <OSMMapView
            region={{
              latitude: (delivery.pickup_lat + delivery.delivery_lat) / 2,
              longitude: (delivery.pickup_lng + delivery.delivery_lng) / 2,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            deliveryRequests={[delivery]}
            deliveryPersons={[]}
            showUserLocation={false}
          />
        </View>

        {/* Pickup Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Punto de Recogida</Text>
          </View>
          <Text style={styles.address}>{delivery.pickup_address}</Text>
          <View style={styles.contactInfo}>
            <User size={16} color="#6B7280" />
            <Text style={styles.contactText}>{delivery.pickup_contact_name}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Phone size={16} color="#6B7280" />
            <Text style={styles.contactText}>{delivery.pickup_contact_phone}</Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#EF4444" />
            <Text style={styles.sectionTitle}>Punto de Entrega</Text>
          </View>
          <Text style={styles.address}>{delivery.delivery_address}</Text>
          <View style={styles.contactInfo}>
            <User size={16} color="#6B7280" />
            <Text style={styles.contactText}>{delivery.delivery_contact_name}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Phone size={16} color="#6B7280" />
            <Text style={styles.contactText}>{delivery.delivery_contact_phone}</Text>
          </View>
        </View>

        {/* Package Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Información del Paquete</Text>
          </View>
          <Text style={styles.packageDescription}>{delivery.package_description}</Text>
          {delivery.package_value && (
            <Text style={styles.packageValue}>
              Valor declarado: €{delivery.package_value.toFixed(2)}
            </Text>
          )}
          {delivery.special_instructions && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Instrucciones especiales:</Text>
              <Text style={styles.instructionsText}>{delivery.special_instructions}</Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Información Temporal</Text>
          </View>
          <Text style={styles.timeInfo}>
            Creado: {new Date(delivery.created_at).toLocaleString()}
          </Text>
          <Text style={styles.timeInfo}>
            Actualizado: {new Date(delivery.updated_at).toLocaleString()}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {actionButtons && actionButtons.length > 0 && (
        <View style={styles.actionContainer}>
          {actionButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={button.style}
              onPress={button.onPress}
            >
              <Text style={button.textStyle}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#2563EB',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  address: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  packageDescription: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  packageValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  timeInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deliveredButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveredButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});