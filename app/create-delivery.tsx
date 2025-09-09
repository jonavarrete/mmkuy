import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { MapPin, Package, User, Phone, ArrowLeft, Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import AuthGuard from '@/components/AuthGuard';

export default function CreateDeliveryScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Recogida
    pickup_address: '',
    pickup_contact_name: user?.name || '',
    pickup_contact_phone: user?.phone || '',
    
    // Entrega
    delivery_address: '',
    delivery_contact_name: '',
    delivery_contact_phone: '',
    
    // Paquete
    package_description: '',
    package_value: '',
    special_instructions: '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = [
      'pickup_address',
      'pickup_contact_name',
      'pickup_contact_phone',
      'delivery_address',
      'delivery_contact_name',
      'delivery_contact_phone',
      'package_description'
    ];

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
        return false;
      }
    }

    return true;
  };

  const calculateEstimatedPrice = () => {
    // Precio base + cálculo simple basado en distancia estimada
    return Math.random() * 10 + 5; // Entre €5 y €15 para demo
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simular geocodificación de direcciones
      const pickup_lat = 40.4168 + (Math.random() - 0.5) * 0.02;
      const pickup_lng = -3.7038 + (Math.random() - 0.5) * 0.02;
      const delivery_lat = 40.4168 + (Math.random() - 0.5) * 0.02;
      const delivery_lng = -3.7038 + (Math.random() - 0.5) * 0.02;

      const deliveryRequest = {
        user_id: user!.id,
        pickup_address: formData.pickup_address,
        pickup_lat,
        pickup_lng,
        pickup_contact_name: formData.pickup_contact_name,
        pickup_contact_phone: formData.pickup_contact_phone,
        delivery_address: formData.delivery_address,
        delivery_lat,
        delivery_lng,
        delivery_contact_name: formData.delivery_contact_name,
        delivery_contact_phone: formData.delivery_contact_phone,
        package_description: formData.package_description,
        package_value: formData.package_value ? parseFloat(formData.package_value) : undefined,
        special_instructions: formData.special_instructions || undefined,
        price: calculateEstimatedPrice(),
      };

      const newDelivery = await apiService.createDeliveryRequest(deliveryRequest);
      
      Alert.alert(
        'Envío Creado',
        'Tu solicitud de envío ha sido creada exitosamente. Los repartidores podrán verla en el mapa.',
        [
          {
            text: 'Ver Envío',
            onPress: () => router.replace(`/delivery/${newDelivery.id}`)
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear el envío');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Nuevo Envío',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Información de Recogida */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Punto de Recogida</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dirección de recogida *</Text>
              <TextInput
                style={styles.input}
                value={formData.pickup_address}
                onChangeText={(value) => handleInputChange('pickup_address', value)}
                placeholder="Ej: Calle Mayor 123, Madrid"
                multiline
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Nombre de contacto *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pickup_contact_name}
                  onChangeText={(value) => handleInputChange('pickup_contact_name', value)}
                  placeholder="Juan Pérez"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pickup_contact_phone}
                  onChangeText={(value) => handleInputChange('pickup_contact_phone', value)}
                  placeholder="+34 600 123 456"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Información de Entrega */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Punto de Entrega</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dirección de entrega *</Text>
              <TextInput
                style={styles.input}
                value={formData.delivery_address}
                onChangeText={(value) => handleInputChange('delivery_address', value)}
                placeholder="Ej: Gran Vía 45, Madrid"
                multiline
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Nombre destinatario *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.delivery_contact_name}
                  onChangeText={(value) => handleInputChange('delivery_contact_name', value)}
                  placeholder="Ana López"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.delivery_contact_phone}
                  onChangeText={(value) => handleInputChange('delivery_contact_phone', value)}
                  placeholder="+34 600 987 654"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Información del Paquete */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Detalles del Paquete</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción del paquete *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.package_description}
                onChangeText={(value) => handleInputChange('package_description', value)}
                placeholder="Ej: Documentos importantes, sobre pequeño"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Valor del paquete (€)</Text>
              <TextInput
                style={styles.input}
                value={formData.package_value}
                onChangeText={(value) => handleInputChange('package_value', value)}
                placeholder="0.00"
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>Opcional: Para seguro y responsabilidad</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Instrucciones especiales</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.special_instructions}
                onChangeText={(value) => handleInputChange('special_instructions', value)}
                placeholder="Ej: Tocar timbre del portero, entregar en recepción..."
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Resumen de Precio */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Precio estimado</Text>
            <Text style={styles.priceValue}>€{calculateEstimatedPrice().toFixed(2)}</Text>
            <Text style={styles.priceNote}>
              El precio final puede variar según la distancia real
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Creando Envío...' : 'Crear Envío'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
    </AuthGuard>
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
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  submitContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});