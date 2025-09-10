import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Users, Package, Truck, TrendingUp, DollarSign, Clock, MapPin, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, ChartBar as BarChart3, ChartPie as PieChart, Activity } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalUsers: number;
  totalDeliveries: number;
  activeDeliveries: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  responseTime: number;
  activeDrivers: number;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1234,
    totalDeliveries: 5678,
    activeDeliveries: 89,
    totalRevenue: 45678.90,
    averageRating: 4.8,
    completionRate: 96.5,
    responseTime: 12,
    activeDrivers: 45,
  });

  const [revenueData, setRevenueData] = useState<ChartData[]>([
    { label: 'Ene', value: 4500, color: '#3B82F6' },
    { label: 'Feb', value: 5200, color: '#3B82F6' },
    { label: 'Mar', value: 4800, color: '#3B82F6' },
    { label: 'Abr', value: 6100, color: '#3B82F6' },
    { label: 'May', value: 5900, color: '#3B82F6' },
    { label: 'Jun', value: 7200, color: '#3B82F6' },
  ]);

  const [deliveryStatusData, setDeliveryStatusData] = useState<ChartData[]>([
    { label: 'Completadas', value: 85, color: '#10B981' },
    { label: 'En Progreso', value: 10, color: '#F59E0B' },
    { label: 'Canceladas', value: 5, color: '#EF4444' },
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Simular carga de datos del dashboard
    // En una implementación real, esto vendría de la API
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    onPress 
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
        {trend && (
          <Text style={[styles.statTrend, { color: trend.startsWith('+') ? '#10B981' : '#EF4444' }]}>
            {trend}
          </Text>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const BarChart = ({ data, height = 150 }: { data: ChartData[]; height?: number }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.barsContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: (item.value / maxValue) * (height - 40),
                    backgroundColor: item.color 
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{item.label}</Text>
              <Text style={styles.barValue}>€{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const PieChartComponent = ({ data }: { data: ChartData[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          {/* Simplified pie chart representation */}
          <View style={styles.pieCenter}>
            <Text style={styles.pieCenterText}>{total}%</Text>
          </View>
        </View>
        <View style={styles.pieLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}: {item.value}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <AuthGuard>
        <View style={styles.unauthorizedContainer}>
          <AlertTriangle size={64} color="#EF4444" />
          <Text style={styles.unauthorizedTitle}>Acceso Denegado</Text>
          <Text style={styles.unauthorizedText}>
            Solo los administradores pueden acceder a esta sección
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
          title: 'Dashboard Administrativo',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Usuarios Totales"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              color="#3B82F6"
              trend="+12%"
              onPress={() => router.push('/admin/users')}
            />
            <StatCard
              title="Entregas Totales"
              value={stats.totalDeliveries.toLocaleString()}
              icon={Package}
              color="#10B981"
              trend="+8%"
              onPress={() => router.push('/admin/deliveries')}
            />
            <StatCard
              title="Entregas Activas"
              value={stats.activeDeliveries}
              icon={Clock}
              color="#F59E0B"
              onPress={() => router.push('/admin/active-deliveries')}
            />
            <StatCard
              title="Ingresos Totales"
              value={`€${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="#8B5CF6"
              trend="+15%"
              onPress={() => router.push('/admin/revenue')}
            />
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas de Rendimiento</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.metricTitle}>Tasa de Completación</Text>
              </View>
              <Text style={styles.metricValue}>{stats.completionRate}%</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Activity size={20} color="#F59E0B" />
                <Text style={styles.metricTitle}>Calificación Promedio</Text>
              </View>
              <Text style={styles.metricValue}>{stats.averageRating}/5</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Clock size={20} color="#3B82F6" />
                <Text style={styles.metricTitle}>Tiempo de Respuesta</Text>
              </View>
              <Text style={styles.metricValue}>{stats.responseTime} min</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Truck size={20} color="#8B5CF6" />
                <Text style={styles.metricTitle}>Repartidores Activos</Text>
              </View>
              <Text style={styles.metricValue}>{stats.activeDrivers}</Text>
            </View>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Ingresos por Mes</Text>
            <TouchableOpacity>
              <BarChart3 size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <BarChart data={revenueData} height={200} />
        </View>

        {/* Delivery Status Distribution */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Estado de Entregas</Text>
            <TouchableOpacity>
              <PieChart size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <PieChartComponent data={deliveryStatusData} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/users')}
            >
              <Users size={24} color="#3B82F6" />
              <Text style={styles.actionTitle}>Gestionar Usuarios</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/deliveries')}
            >
              <Package size={24} color="#10B981" />
              <Text style={styles.actionTitle}>Ver Entregas</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/reports')}
            >
              <BarChart3 size={24} color="#F59E0B" />
              <Text style={styles.actionTitle}>Reportes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/support')}
            >
              <AlertTriangle size={24} color="#EF4444" />
              <Text style={styles.actionTitle}>Soporte</Text>
            </TouchableOpacity>
          </View>
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
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
  },
  unauthorizedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  unauthorizedText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  pieChartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  pieCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCenterText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  pieLegend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
});