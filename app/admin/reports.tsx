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
import { ArrowLeft, Download, Calendar, TrendingUp, Users, Package, DollarSign, Clock, Star, MapPin, ChartBar as BarChart3, ChartPie as PieChart, FileText } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

const { width } = Dimensions.get('window');

interface ReportData {
  period: string;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  averageRating: number;
  newUsers: number;
  activeDrivers: number;
  topRoutes: Array<{
    from: string;
    to: string;
    count: number;
  }>;
}

export default function AdminReportsScreen() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportData, setReportData] = useState<ReportData>({
    period: 'Este mes',
    totalDeliveries: 1234,
    completedDeliveries: 1189,
    cancelledDeliveries: 45,
    totalRevenue: 15678.90,
    averageDeliveryTime: 28,
    averageRating: 4.7,
    newUsers: 89,
    activeDrivers: 45,
    topRoutes: [
      { from: 'Centro', to: 'Vedado', count: 156 },
      { from: 'Vedado', to: 'Miramar', count: 134 },
      { from: 'Centro', to: 'Plaza', count: 98 },
    ],
  });

  const periods = [
    { key: 'week', label: 'Esta semana' },
    { key: 'month', label: 'Este mes' },
    { key: 'quarter', label: 'Este trimestre' },
    { key: 'year', label: 'Este año' },
  ];

  const reportTypes = [
    {
      title: 'Reporte de Entregas',
      description: 'Estadísticas detalladas de todas las entregas',
      icon: Package,
      color: '#3B82F6',
      onPress: () => generateReport('deliveries'),
    },
    {
      title: 'Reporte Financiero',
      description: 'Ingresos, gastos y análisis financiero',
      icon: DollarSign,
      color: '#10B981',
      onPress: () => generateReport('financial'),
    },
    {
      title: 'Reporte de Usuarios',
      description: 'Análisis de usuarios y repartidores',
      icon: Users,
      color: '#8B5CF6',
      onPress: () => generateReport('users'),
    },
    {
      title: 'Reporte de Rendimiento',
      description: 'Métricas de tiempo y calidad de servicio',
      icon: TrendingUp,
      color: '#F59E0B',
      onPress: () => generateReport('performance'),
    },
  ];

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    // Simular carga de datos según el período seleccionado
    // En una implementación real, esto vendría de la API
  };

  const generateReport = (type: string) => {
    // Simular generación de reporte
    console.log(`Generando reporte de ${type} para ${selectedPeriod}`);
    // Aquí se implementaría la lógica para generar y descargar el reporte
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    change,
    format = 'number'
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    change?: number;
    format?: 'number' | 'currency' | 'percentage' | 'time';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return `€${val.toLocaleString()}`;
        case 'percentage':
          return `${val}%`;
        case 'time':
          return `${val} min`;
        default:
          return val.toLocaleString();
      }
    };

    return (
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
            <Icon size={20} color={color} />
          </View>
          {change !== undefined && (
            <Text style={[
              styles.metricChange,
              { color: change >= 0 ? '#10B981' : '#EF4444' }
            ]}>
              {change >= 0 ? '+' : ''}{change}%
            </Text>
          )}
        </View>
        <Text style={styles.metricValue}>{formatValue(value)}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <AuthGuard>
        <View style={styles.unauthorizedContainer}>
          <FileText size={64} color="#EF4444" />
          <Text style={styles.unauthorizedTitle}>Acceso Denegado</Text>
          <Text style={styles.unauthorizedText}>
            Solo los administradores pueden acceder a los reportes
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
          title: 'Reportes y Analytics',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} color="#2563EB" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <Text style={styles.sectionTitle}>Período de análisis</Text>
          <View style={styles.periodButtons}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas Clave - {reportData.period}</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Total Entregas"
              value={reportData.totalDeliveries}
              icon={Package}
              color="#3B82F6"
              change={12}
            />
            <MetricCard
              title="Entregas Completadas"
              value={reportData.completedDeliveries}
              icon={Package}
              color="#10B981"
              change={8}
            />
            <MetricCard
              title="Ingresos Totales"
              value={reportData.totalRevenue}
              icon={DollarSign}
              color="#8B5CF6"
              change={15}
              format="currency"
            />
            <MetricCard
              title="Tiempo Promedio"
              value={reportData.averageDeliveryTime}
              icon={Clock}
              color="#F59E0B"
              change={-5}
              format="time"
            />
            <MetricCard
              title="Calificación Promedio"
              value={reportData.averageRating}
              icon={Star}
              color="#EC4899"
              change={2}
            />
            <MetricCard
              title="Nuevos Usuarios"
              value={reportData.newUsers}
              icon={Users}
              color="#06B6D4"
              change={25}
            />
          </View>
        </View>

        {/* Top Routes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rutas Más Populares</Text>
          <View style={styles.routesContainer}>
            {reportData.topRoutes.map((route, index) => (
              <View key={index} style={styles.routeItem}>
                <View style={styles.routeInfo}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.routeText}>
                    {route.from} → {route.to}
                  </Text>
                </View>
                <View style={styles.routeStats}>
                  <Text style={styles.routeCount}>{route.count}</Text>
                  <Text style={styles.routeLabel}>entregas</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Report Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generar Reportes Detallados</Text>
          <View style={styles.reportTypesGrid}>
            {reportTypes.map((report, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reportTypeCard}
                onPress={report.onPress}
              >
                <View style={[styles.reportTypeIcon, { backgroundColor: report.color + '20' }]}>
                  <report.icon size={24} color={report.color} />
                </View>
                <Text style={styles.reportTypeTitle}>{report.title}</Text>
                <Text style={styles.reportTypeDescription}>{report.description}</Text>
                <View style={styles.reportTypeAction}>
                  <Download size={16} color="#2563EB" />
                  <Text style={styles.reportTypeActionText}>Generar</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Performance Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores de Rendimiento</Text>
          <View style={styles.performanceContainer}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Tasa de Completación</Text>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceProgress, { width: '96%' }]} />
              </View>
              <Text style={styles.performanceValue}>96.3%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Satisfacción del Cliente</Text>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceProgress, { width: '94%' }]} />
              </View>
              <Text style={styles.performanceValue}>4.7/5</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Tiempo de Respuesta</Text>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceProgress, { width: '88%' }]} />
              </View>
              <Text style={styles.performanceValue}>12 min</Text>
            </View>
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
  downloadButton: {
    padding: 8,
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
  periodSelector: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  routesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  routeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  routeStats: {
    alignItems: 'flex-end',
  },
  routeCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  routeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  reportTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportTypeCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  reportTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  reportTypeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  reportTypeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportTypeActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  performanceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  performanceItem: {
    marginBottom: 16,
  },
  performanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  performanceBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 4,
  },
  performanceProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  performanceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'right',
  },
});