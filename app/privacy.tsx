import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Shield, Eye, Lock, MapPin, Bell, Trash2, Download, ChevronRight, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export default function PrivacyScreen() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    shareLocation: true,
    profileVisibility: true,
    dataCollection: false,
    marketingEmails: false,
    pushNotifications: true,
    locationHistory: true,
  });

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada exitosamente');
          }
        }
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Descargar Datos',
      'Se enviará un archivo con todos tus datos a tu correo electrónico en las próximas 24 horas.',
      [{ text: 'OK' }]
    );
  };

  const privacySettings = [
    {
      title: 'Compartir Ubicación',
      description: 'Permite que otros usuarios vean tu ubicación durante las entregas',
      key: 'shareLocation',
      icon: MapPin,
      hasSwitch: true,
    },
    {
      title: 'Visibilidad del Perfil',
      description: 'Tu perfil será visible para otros usuarios de la plataforma',
      key: 'profileVisibility',
      icon: Eye,
      hasSwitch: true,
    },
    {
      title: 'Recopilación de Datos',
      description: 'Permitir recopilación de datos para mejorar el servicio',
      key: 'dataCollection',
      icon: Shield,
      hasSwitch: true,
    },
    {
      title: 'Emails de Marketing',
      description: 'Recibir ofertas y promociones por correo electrónico',
      key: 'marketingEmails',
      icon: Bell,
      hasSwitch: true,
    },
    {
      title: 'Notificaciones Push',
      description: 'Recibir notificaciones en tiempo real',
      key: 'pushNotifications',
      icon: Bell,
      hasSwitch: true,
    },
    {
      title: 'Historial de Ubicación',
      description: 'Guardar historial de ubicaciones para mejorar las rutas',
      key: 'locationHistory',
      icon: MapPin,
      hasSwitch: true,
    },
  ];

  const dataManagementOptions = [
    {
      title: 'Descargar Mis Datos',
      description: 'Obtén una copia de todos tus datos',
      icon: Download,
      onPress: handleDownloadData,
    },
    {
      title: 'Eliminar Cuenta',
      description: 'Eliminar permanentemente tu cuenta y todos los datos',
      icon: Trash2,
      onPress: handleDeleteAccount,
      dangerous: true,
    },
  ];

  return (
    <AuthGuard>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Privacidad y Seguridad',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Privacidad</Text>
          <View style={styles.settingsCard}>
            {privacySettings.map((setting, index) => (
              <View key={setting.key}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <setting.icon size={20} color="#6B7280" />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>{setting.title}</Text>
                      <Text style={styles.settingDescription}>{setting.description}</Text>
                    </View>
                  </View>
                  {setting.hasSwitch && (
                    <Switch
                      value={settings[setting.key as keyof typeof settings]}
                      onValueChange={() => handleToggle(setting.key)}
                      trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                      thumbColor={settings[setting.key as keyof typeof settings] ? '#2563EB' : '#9CA3AF'}
                    />
                  )}
                </View>
                {index < privacySettings.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>

        {/* Security Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Seguridad</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Lock size={20} color="#10B981" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Datos Encriptados</Text>
                <Text style={styles.infoDescription}>
                  Toda tu información personal está protegida con encriptación de extremo a extremo
                </Text>
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoItem}>
              <Shield size={20} color="#3B82F6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Verificación de Identidad</Text>
                <Text style={styles.infoDescription}>
                  Todos los repartidores pasan por un proceso de verificación riguroso
                </Text>
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoItem}>
              <AlertTriangle size={20} color="#F59E0B" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Reportar Problemas</Text>
                <Text style={styles.infoDescription}>
                  Puedes reportar cualquier problema de seguridad desde la sección de ayuda
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de Datos</Text>
          <View style={styles.settingsCard}>
            {dataManagementOptions.map((option, index) => (
              <View key={option.title}>
                <TouchableOpacity style={styles.settingItem} onPress={option.onPress}>
                  <View style={styles.settingLeft}>
                    <View style={[
                      styles.settingIcon,
                      option.dangerous && styles.dangerousIcon
                    ]}>
                      <option.icon 
                        size={20} 
                        color={option.dangerous ? '#EF4444' : '#6B7280'} 
                      />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[
                        styles.settingTitle,
                        option.dangerous && styles.dangerousText
                      ]}>
                        {option.title}
                      </Text>
                      <Text style={styles.settingDescription}>{option.description}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {index < dataManagementOptions.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.linkText}>Política de Privacidad</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.linkText}>Términos de Servicio</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.linkText}>Política de Cookies</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última actualización: {new Date().toLocaleDateString()}
          </Text>
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerousIcon: {
    backgroundColor: '#FEE2E2',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  dangerousText: {
    color: '#EF4444',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});