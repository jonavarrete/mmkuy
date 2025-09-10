import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, MessageCircle, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Search, Filter, Plus, User, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'delivery' | 'payment' | 'account' | 'technical' | 'other';
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  lastResponse?: string;
}

export default function AdminSupportScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const filters = [
    { key: 'all', label: 'Todos', count: 0 },
    { key: 'open', label: 'Abiertos', count: 0 },
    { key: 'in_progress', label: 'En Progreso', count: 0 },
    { key: 'urgent', label: 'Urgentes', count: 0 },
  ];

  useEffect(() => {
    loadSupportTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, searchQuery, selectedFilter]);

  const loadSupportTickets = async () => {
    try {
      // Simular carga de tickets de soporte
      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          userId: 'user-123',
          userName: 'Juan Pérez',
          userEmail: 'juan@email.com',
          subject: 'Problema con entrega',
          message: 'Mi paquete no llegó en el tiempo estimado y el repartidor no responde.',
          status: 'open',
          priority: 'high',
          category: 'delivery',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          userId: 'user-456',
          userName: 'María García',
          userEmail: 'maria@email.com',
          subject: 'Error en el pago',
          message: 'Se me cobró dos veces por la misma entrega.',
          status: 'in_progress',
          priority: 'medium',
          category: 'payment',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          assignedAgent: 'Agente María',
          lastResponse: 'Estamos revisando tu caso con el equipo de pagos.',
        },
        {
          id: '3',
          userId: 'delivery-789',
          userName: 'Carlos López',
          userEmail: 'carlos@email.com',
          subject: 'No puedo actualizar mi ubicación',
          message: 'La app no me permite actualizar mi ubicación y no recibo entregas.',
          status: 'urgent',
          priority: 'urgent',
          category: 'technical',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '4',
          userId: 'user-101',
          userName: 'Ana Martín',
          userEmail: 'ana@email.com',
          subject: 'Consulta sobre calificaciones',
          message: '¿Cómo puedo cambiar una calificación que di por error?',
          status: 'resolved',
          priority: 'low',
          category: 'account',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          assignedAgent: 'Agente Pedro',
          lastResponse: 'Las calificaciones se pueden modificar dentro de las primeras 24 horas.',
        },
      ];

      setTickets(mockTickets);
      
      // Actualizar contadores de filtros
      filters[0].count = mockTickets.length;
      filters[1].count = mockTickets.filter(t => t.status === 'open').length;
      filters[2].count = mockTickets.filter(t => t.status === 'in_progress').length;
      filters[3].count = mockTickets.filter(t => t.priority === 'urgent').length;
      
    } catch (error) {
      console.error('Error loading support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Aplicar filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Aplicar filtro de estado
    switch (selectedFilter) {
      case 'open':
        filtered = filtered.filter(t => t.status === 'open');
        break;
      case 'in_progress':
        filtered = filtered.filter(t => t.status === 'in_progress');
        break;
      case 'urgent':
        filtered = filtered.filter(t => t.priority === 'urgent');
        break;
    }

    // Ordenar por prioridad y fecha
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredTickets(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'resolved': return '#10B981';
      case 'closed': return '#6B7280';
      default: return '#9CA3AF';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#65A30D';
      default: return '#9CA3AF';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto';
      case 'in_progress': return 'En Progreso';
      case 'resolved': return 'Resuelto';
      case 'closed': return 'Cerrado';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const handleTicketPress = (ticket: SupportTicket) => {
    router.push(`/chat?supportTicket=${ticket.id}`);
  };

  const handleAssignTicket = (ticketId: string) => {
    Alert.alert(
      'Asignar Ticket',
      '¿Quieres asignarte este ticket?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Asignar',
          onPress: () => {
            setTickets(prev => prev.map(ticket =>
              ticket.id === ticketId
                ? { ...ticket, status: 'in_progress' as const, assignedAgent: user?.name }
                : ticket
            ));
          }
        }
      ]
    );
  };

  const renderTicket = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => handleTicketPress(item)}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketSubject} numberOfLines={1}>
            {item.subject}
          </Text>
          <View style={styles.ticketMeta}>
            <User size={12} color="#6B7280" />
            <Text style={styles.ticketMetaText}>{item.userName}</Text>
            <Calendar size={12} color="#6B7280" />
            <Text style={styles.ticketMetaText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.ticketBadges}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.badgeText}>{getPriorityLabel(item.priority)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.ticketMessage} numberOfLines={2}>
        {item.message}
      </Text>

      <View style={styles.ticketFooter}>
        <View style={styles.ticketActions}>
          {item.status === 'open' && (
            <TouchableOpacity 
              style={styles.assignButton}
              onPress={() => handleAssignTicket(item.id)}
            >
              <Text style={styles.assignButtonText}>Asignar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.chatButton}>
            <MessageCircle size={16} color="#2563EB" />
            <Text style={styles.chatButtonText}>Responder</Text>
          </TouchableOpacity>
        </View>
        {item.assignedAgent && (
          <Text style={styles.assignedAgent}>
            Asignado a: {item.assignedAgent}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (user?.role !== 'admin') {
    return (
      <AuthGuard>
        <View style={styles.unauthorizedContainer}>
          <AlertTriangle size={64} color="#EF4444" />
          <Text style={styles.unauthorizedTitle}>Acceso Denegado</Text>
          <Text style={styles.unauthorizedText}>
            Solo los administradores pueden acceder al soporte
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
          title: 'Soporte Técnico',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

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
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tickets List */}
        <FlatList
          data={filteredTickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MessageCircle size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No hay tickets</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedFilter !== 'all' 
                  ? 'No se encontraron tickets con los filtros aplicados'
                  : 'No hay tickets de soporte en este momento'
                }
              </Text>
            </View>
          )}
        />
      </View>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketMetaText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  ticketBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ticketMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  assignButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  assignedAgent: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
});