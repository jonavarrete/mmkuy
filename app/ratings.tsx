import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Star, TrendingUp, Award, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

interface Rating {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  delivery_id: string;
}

export default function RatingsScreen() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState({
    average: 4.8,
    total: 156,
    distribution: {
      5: 120,
      4: 25,
      3: 8,
      2: 2,
      1: 1,
    }
  });

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    // Simular carga de calificaciones
    const mockRatings: Rating[] = [
      {
        id: '1',
        user_name: 'Juan Pérez',
        rating: 5,
        comment: 'Excelente servicio, muy rápido y profesional. El paquete llegó en perfectas condiciones.',
        date: '2024-01-15',
        delivery_id: '1',
      },
      {
        id: '2',
        user_name: 'María García',
        rating: 5,
        comment: 'Muy puntual y amable. Definitivamente lo recomiendo.',
        date: '2024-01-14',
        delivery_id: '2',
      },
      {
        id: '3',
        user_name: 'Carlos López',
        rating: 4,
        comment: 'Buen servicio, aunque llegó un poco tarde por el tráfico.',
        date: '2024-01-13',
        delivery_id: '3',
      },
      {
        id: '4',
        user_name: 'Ana Martín',
        rating: 5,
        comment: 'Perfecto! Muy cuidadoso con el paquete frágil.',
        date: '2024-01-12',
        delivery_id: '4',
      },
      {
        id: '5',
        user_name: 'Pedro Ruiz',
        rating: 4,
        comment: 'Servicio correcto, sin problemas.',
        date: '2024-01-11',
        delivery_id: '5',
      },
    ];
    setRatings(mockRatings);
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            color={star <= rating ? '#F59E0B' : '#E5E7EB'}
            fill={star <= rating ? '#F59E0B' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderRatingItem = ({ item }: { item: Rating }) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>
              {item.user_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.user_name}</Text>
            <Text style={styles.ratingDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {renderStars(item.rating, 18)}
      </View>
      <Text style={styles.ratingComment}>{item.comment}</Text>
      <TouchableOpacity 
        style={styles.deliveryLink}
        onPress={() => router.push(`/delivery/${item.delivery_id}`)}
      >
        <Text style={styles.deliveryLinkText}>Ver entrega #{item.delivery_id.slice(-6)}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDistributionBar = (stars: number, count: number) => {
    const percentage = (count / stats.total) * 100;
    return (
      <View style={styles.distributionRow}>
        <Text style={styles.distributionStars}>{stars}</Text>
        <Star size={14} color="#F59E0B" fill="#F59E0B" />
        <View style={styles.distributionBarContainer}>
          <View 
            style={[
              styles.distributionBar, 
              { width: `${percentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.distributionCount}>{count}</Text>
      </View>
    );
  };

  if (user?.role !== 'delivery') {
    return (
      <AuthGuard>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Calificaciones',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="#374151" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.notAvailableContainer}>
          <Award size={64} color="#9CA3AF" />
          <Text style={styles.notAvailableTitle}>Calificaciones no disponibles</Text>
          <Text style={styles.notAvailableText}>
            Esta función solo está disponible para repartidores
          </Text>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mis Calificaciones',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.averageSection}>
            <Text style={styles.averageNumber}>{stats.average}</Text>
            {renderStars(Math.round(stats.average), 24)}
            <Text style={styles.totalRatings}>
              Basado en {stats.total} calificaciones
            </Text>
          </View>

          <View style={styles.distributionSection}>
            {[5, 4, 3, 2, 1].map((stars) => 
              renderDistributionBar(stars, stats.distribution[stars as keyof typeof stats.distribution])
            )}
          </View>
        </View>

        {/* Achievement Cards */}
        <View style={styles.achievementsContainer}>
          <View style={styles.achievementCard}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.achievementNumber}>98%</Text>
            <Text style={styles.achievementLabel}>Satisfacción</Text>
          </View>
          <View style={styles.achievementCard}>
            <Award size={24} color="#F59E0B" />
            <Text style={styles.achievementNumber}>156</Text>
            <Text style={styles.achievementLabel}>Entregas</Text>
          </View>
          <View style={styles.achievementCard}>
            <MessageCircle size={24} color="#3B82F6" />
            <Text style={styles.achievementNumber}>142</Text>
            <Text style={styles.achievementLabel}>Comentarios</Text>
          </View>
        </View>

        {/* Recent Ratings */}
        <View style={styles.ratingsSection}>
          <Text style={styles.sectionTitle}>Calificaciones Recientes</Text>
          <FlatList
            data={ratings}
            renderItem={renderRatingItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  notAvailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
  },
  notAvailableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    textAlign: 'center',
  },
  notAvailableText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
  },
  averageSection: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  averageNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalRatings: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  distributionSection: {
    flex: 1,
    paddingLeft: 24,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionStars: {
    fontSize: 14,
    color: '#374151',
    width: 12,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  distributionBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    color: '#6B7280',
    width: 24,
    textAlign: 'right',
  },
  achievementsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  achievementNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  achievementLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  ratingsSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  ratingComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  deliveryLink: {
    alignSelf: 'flex-start',
  },
  deliveryLinkText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
});