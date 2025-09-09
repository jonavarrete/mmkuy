import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { User, Mail, Phone, MapPin, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Settings, Star, Truck, Package } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: signOut 
        },
      ]
    );
  };

  const getRoleInfo = () => {
    switch (user?.role) {
      case 'admin':
        return {
          title: 'Administrador',
          icon: Shield,
          color: '#7C3AED',
          description: 'Acceso completo al sistema',
        };
      case 'delivery':
        return {
          title: 'Repartidor',
          icon: Truck,
          color: '#059669',
          description: 'Realizas entregas',
        };
      default:
        return {
          title: 'Usuario',
          icon: User,
          color: '#3B82F6',
          description: 'Solicitas envíos',
        };
    }
  };

  const roleInfo = getRoleInfo();

  const menuSections = [
    {
      title: 'Cuenta',
      items: [
        {
          icon: User,
          title: 'Editar Perfil',
          onPress: () => router.push('/edit-profile'),
        },
        {
          icon: Star,
          title: 'Calificaciones',
          onPress: () => router.push('/ratings'),
          showForRoles: ['delivery'],
        },
        {
          icon: Package,
          title: 'Historial de Envíos',
          onPress: () => router.push('/(tabs)/deliveries'),
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          icon: Bell,
          title: 'Notificaciones',
          hasSwitch: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: MapPin,
          title: 'Ubicación',
          hasSwitch: true,
          value: locationEnabled,
          onToggle: setLocationEnabled,
        },
        {
          icon: Shield,
          title: 'Privacidad y Seguridad',
          onPress: () => router.push('/privacy'),
        },
      ],
    },
    {
      title: 'Soporte',
      items: [
        {
          icon: HelpCircle,
          title: 'Ayuda y Soporte',
          onPress: () => router.push('/help'),
        },
        {
          icon: Settings,
          title: 'Configuración Avanzada',
          onPress: () => router.push('/settings'),
          showForRoles: ['admin'],
        },
      ],
    },
  ];

  const renderMenuItem = (item: any) => {
    if (item.showForRoles && !item.showForRoles.includes(user?.role)) {
      return null;
    }

    return (
      <TouchableOpacity
        key={item.title}
        style={styles.menuItem}
        onPress={item.onPress}
        disabled={item.hasSwitch}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.menuItemIcon}>
            <item.icon size={20} color="#6B7280" />
          </View>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {item.hasSwitch ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
              thumbColor={item.value ? '#2563EB' : '#9CA3AF'}
            />
          ) : (
            <ChevronRight size={20} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: roleInfo.color }]}>
            <User size={32} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.roleContainer}>
            <roleInfo.icon size={16} color={roleInfo.color} />
            <Text style={[styles.roleText, { color: roleInfo.color }]}>
              {roleInfo.title}
            </Text>
          </View>
          <Text style={styles.userDescription}>{roleInfo.description}</Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactCard}>
        <View style={styles.contactItem}>
          <Mail size={16} color="#6B7280" />
          <Text style={styles.contactText}>{user?.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.contactText}>{user?.phone}</Text>
        </View>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map(renderMenuItem)}
          </View>
        </View>
      ))}

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Versión 1.0.0</Text>
        <Text style={styles.footerText}>© 2024 DeliveryApp</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
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
  userCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  userDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuItemRight: {
    alignItems: 'center',
  },
  signOutContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});