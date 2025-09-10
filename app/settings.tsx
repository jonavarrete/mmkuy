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
import { ArrowLeft, Settings as SettingsIcon, Database, Users, ChartBar as BarChart3, Shield, Bell, Globe, Smartphone, RefreshCw, Download, Upload, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newUserRegistration: true,
    pushNotifications: true,
    emailNotifications: true,
    dataBackup: true,
    analyticsTracking: true,
    debugMode: false,
    autoUpdates: true,
  });

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Datos',
      'Se generará un archivo con todos los datos del sistema. Este proceso puede tardar varios minutos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Exportar', onPress: () => Alert.alert('Éxito', 'Los datos se están exportando') }
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Importar Datos',
      '⚠️ Esta acción sobrescribirá los datos existentes. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Importar', style: 'destructive', onPress: () => Alert.alert('Éxito', 'Datos importados') }
      ]
    );
  };

  const handleSystemReset = () => {
    Alert.alert(
      'Reiniciar Sistema',
      '⚠️ Esta acción reiniciará todos los servicios del sistema. Los usuarios pueden experimentar interrupciones temporales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: () => Alert.alert('Sistema reiniciado') }
      ]
    );
  };

  if (user?.role !== 'admin') {
    return (
      <AuthGuard>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Configuración',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="#374151" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.notAvailableContainer}>
          <Shield size={64} color="#9CA3AF" />
          <Text style={styles.notAvailableTitle}>Acceso Restringido</Text>
          <Text style={styles.notAvailableText}>
            Esta configuración solo está disponible para administradores
          </Text>
        </View>
      </AuthGuard>
    );
  }

  const systemSettings = [
    {
      title: 'Modo Mantenimiento',
      description: 'Desactiva temporalmente la aplicación para mantenimiento',
      key: 'maintenanceMode',
      icon: SettingsIcon,
      hasSwitch: true,
      critical: true,
    },
    {
      title: 'Registro de Nuevos Usuarios',
      description: 'Permite que nuevos usuarios se registren en la plataforma',
      key: 'newUserRegistration',
      icon: Users,
      hasSwitch: true,
    },
    {
      title: 'Notificaciones Push',
      description: 'Envío de notificaciones push a todos los usuarios',
      key: 'pushNotifications',
      icon: Bell,
      hasSwitch: true,
    },
    {
      title: 'Notificaciones por Email',
      description: 'Envío de emails automáticos del sistema',
      key: 'emailNotifications',
      icon: Bell,
      hasSwitch: true,
    },
    {
      title: 'Respaldo Automático',
      description: 'Respaldo automático diario de la base de datos',
      key: 'dataBackup',
      icon: Database,
      hasSwitch: true,
    },
    {
      title: 'Seguimiento de Analytics',
      description: 'Recopilación de datos de uso y rendimiento',
      key: 'analyticsTracking',
      icon: BarChart3,
      hasSwitch: true,
    },
    {
      title: 'Modo Debug',
      description: 'Activa logs detallados para desarrollo',
      key: 'debugMode',
      icon: Smartphone,
      hasSwitch: true,
    },
    {
      title: 'Actualizaciones Automáticas',
      description: 'Instala automáticamente actualizaciones del sistema',
      key: 'autoUpdates',
      icon: RefreshCw,
      hasSwitch: true,
    },
  ];

  const systemActions = [
    {
      title: 'Exportar Datos del Sistema',
      description: 'Generar backup completo de todos los datos',
      icon: Download,
      onPress: handleExportData,
    },
    {
      title: 'Importar Datos',
      description: 'Restaurar datos desde un archivo de backup',
      icon: Upload,
      onPress: handleImportData,
      dangerous: true,
    },
    {
      title: 'Reiniciar Sistema',
      description: 'Reiniciar todos los servicios del sistema',
      icon: RefreshCw,
      onPress: handleSystemReset,
      dangerous: true,
    },
  ];

  const systemStats = [
    { label: 'Usuarios Activos', value: '1,234' },
    { label: 'Repartidores', value: '89' },
    { label: 'Entregas Hoy', value: '456' },
    { label: 'Uptime', value: '99.9%' },
  ];

  return (
    <AuthGuard>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Configuración Avanzada',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* System Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del Sistema</Text>
          <View style={styles.statsGrid}>
            {systemStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* System Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración del Sistema</Text>
          <View style={styles.settingsCard}>
            {systemSettings.map((setting, index) => (
              <View key={setting.key}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={[
                      styles.settingIcon,
                      setting.critical && styles.criticalIcon
                    ]}>
                      <setting.icon 
                        size={20} 
                        color={setting.critical ? '#EF4444' : '#6B7280'} 
                      />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[
                        styles.settingTitle,
                        setting.critical && styles.criticalText
                      ]}>
                        {setting.title}
                      </Text>
                      <Text style={styles.settingDescription}>{setting.description}</Text>
                    </View>
                  </View>
                  {setting.hasSwitch && (
                    <Switch
                      value={settings[setting.key as keyof typeof settings]}
                      onValueChange={() => handleToggle(setting.key)}
                      trackColor={{ 
                        false: '#E5E7EB', 
                        true: setting.critical ? '#FEE2E2' : '#BFDBFE' 
                      }}
                      thumbColor={
                        settings[setting.key as keyof typeof settings] 
                          ? (setting.critical ? '#EF4444' : '#2563EB')
                          : '#9CA3AF'
                      }
                    />
                  )}
                </View>
                {index < systemSettings.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>

        {/* System Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones del Sistema</Text>
          <View style={styles.settingsCard}>
            {systemActions.map((action, index) => (
              <View key={action.title}>
                <TouchableOpacity style={styles.settingItem} onPress={action.onPress}>
                  <View style={styles.settingLeft}>
                    <View style={[
                      styles.settingIcon,
                      action.dangerous && styles.dangerousIcon
                    ]}>
                      <action.icon 
                        size={20} 
                        color={action.dangerous ? '#EF4444' : '#6B7280'} 
                      />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[
                        styles.settingTitle,
                        action.dangerous && styles.dangerousText
                      ]}>
                        {action.title}
                      </Text>
                      <Text style={styles.settingDescription}>{action.description}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {index < systemActions.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Shield size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            Los cambios en esta configuración pueden afectar el funcionamiento de toda la plataforma. 
            Úsala con precaución.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Versión del Sistema: 1.0.0 | Última actualización: {new Date().toLocaleDateString()}
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
    minWidth: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  settingsCard: {
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
  criticalIcon: {
    backgroundColor: '#FEE2E2',
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
  criticalText: {
    color: '#EF4444',
  },
  dangerousText: {
    color: '#EF4444',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});