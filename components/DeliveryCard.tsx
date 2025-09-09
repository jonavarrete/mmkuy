import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Package, User } from 'lucide-react-native';
import { DeliveryRequest } from '@/types';

interface Props {
  delivery: DeliveryRequest;
  onPress?: () => void;
  onAccept?: () => void;
  showActions?: boolean;
  userRole?: 'user' | 'delivery' | 'admin';
}

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

export default function DeliveryCard({ delivery, onPress, onAccept, showActions = false, userRole }: Props) {
  const statusColor = STATUS_COLORS[delivery.status];
  const statusLabel = STATUS_LABELS[delivery.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
        <Text style={styles.price}>€{delivery.price.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.locationRow}>
          <MapPin size={16} color="#3B82F6" />
          <Text style={styles.locationText} numberOfLines={1}>
            Desde: {delivery.pickup_address}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <MapPin size={16} color="#EF4444" />
          <Text style={styles.locationText} numberOfLines={1}>
            Hacia: {delivery.delivery_address}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Package size={14} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={1}>
            {delivery.package_description}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <User size={14} color="#6B7280" />
          <Text style={styles.infoText}>
            Para: {delivery.delivery_contact_name}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Clock size={12} color="#6B7280" />
          <Text style={styles.timeText}>
            {new Date(delivery.created_at).toLocaleDateString()}
          </Text>
        </View>

        {showActions && userRole === 'delivery' && delivery.status === 'pending' && onAccept && (
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Aceptar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  section: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});