import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, Send } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export default function RateDeliveryScreen() {
  const { user } = useAuth();
  const { deliveryId, deliveryPersonName } = useLocalSearchParams<{
    deliveryId: string;
    deliveryPersonName?: string;
  }>();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const ratingLabels = {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente',
  };

  const quickComments = [
    'Muy puntual y profesional',
    'Entrega rápida y segura',
    'Excelente comunicación',
    'Paquete en perfectas condiciones',
    'Muy amable y cortés',
    'Siguió las instrucciones perfectamente',
  ];

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    setLoading(true);
    try {
      // Simular envío de calificación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Calificación Enviada',
        'Gracias por tu feedback. Esto nos ayuda a mejorar nuestro servicio.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la calificación');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Star
              size={40}
              color={star <= rating ? '#F59E0B' : '#E5E7EB'}
              fill={star <= rating ? '#F59E0B' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <AuthGuard>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Calificar Entrega',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>¿Cómo fue tu experiencia?</Text>
          <Text style={styles.subtitle}>
            Califica la entrega realizada por {deliveryPersonName || 'el repartidor'}
          </Text>
        </View>

        <View style={styles.ratingSection}>
          {renderStars()}
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {ratingLabels[rating as keyof typeof ratingLabels]}
            </Text>
          )}
        </View>

        {rating > 0 && (
          <>
            <View style={styles.quickCommentsSection}>
              <Text style={styles.sectionTitle}>Comentarios rápidos</Text>
              <View style={styles.quickCommentsGrid}>
                {quickComments.map((quickComment, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickCommentButton,
                      comment === quickComment && styles.quickCommentButtonSelected
                    ]}
                    onPress={() => setComment(comment === quickComment ? '' : quickComment)}
                  >
                    <Text style={[
                      styles.quickCommentText,
                      comment === quickComment && styles.quickCommentTextSelected
                    ]}>
                      {quickComment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>Comentario adicional (opcional)</Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Comparte más detalles sobre tu experiencia..."
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {comment.length}/500 caracteres
              </Text>
            </View>

            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryInfoTitle}>Detalles de la entrega</Text>
              <Text style={styles.deliveryInfoText}>
                Entrega #{deliveryId?.slice(-6)}
              </Text>
              <Text style={styles.deliveryInfoText}>
                Repartidor: {deliveryPersonName || 'No especificado'}
              </Text>
              <Text style={styles.deliveryInfoText}>
                Fecha: {new Date().toLocaleDateString()}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {rating > 0 && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmitRating}
            disabled={loading}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
  },
  quickCommentsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  quickCommentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickCommentButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickCommentButtonSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  quickCommentText: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickCommentTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  commentSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  deliveryInfo: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
    marginBottom: 100,
  },
  deliveryInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  deliveryInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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