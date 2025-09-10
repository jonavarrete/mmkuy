import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Para Android, configurar el canal de notificaciones
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null, // null = inmediata
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async sendDeliveryNotification(
    type: 'new_delivery' | 'delivery_accepted' | 'delivery_picked_up' | 'delivery_in_transit' | 'delivery_completed',
    deliveryId: string,
    userRole: 'user' | 'delivery'
  ) {
    const notifications = {
      new_delivery: {
        user: {
          title: '📦 Nueva solicitud creada',
          body: 'Tu solicitud de envío ha sido creada. Los repartidores pueden verla ahora.',
        },
        delivery: {
          title: '🚚 Nueva entrega disponible',
          body: 'Hay una nueva entrega disponible cerca de ti.',
        },
      },
      delivery_accepted: {
        user: {
          title: '✅ Entrega aceptada',
          body: 'Un repartidor ha aceptado tu solicitud. Te mantendremos informado.',
        },
        delivery: {
          title: '📋 Entrega asignada',
          body: 'Has aceptado una nueva entrega. Ve a recoger el paquete.',
        },
      },
      delivery_picked_up: {
        user: {
          title: '📦 Paquete recogido',
          body: 'Tu paquete ha sido recogido y está en camino.',
        },
        delivery: {
          title: '🎯 Dirígete al destino',
          body: 'Paquete recogido. Dirígete al punto de entrega.',
        },
      },
      delivery_in_transit: {
        user: {
          title: '🚛 Paquete en tránsito',
          body: 'Tu paquete está en camino al destino.',
        },
        delivery: {
          title: '🛣️ En tránsito',
          body: 'Entrega en progreso hacia el destino.',
        },
      },
      delivery_completed: {
        user: {
          title: '🎉 Entrega completada',
          body: 'Tu paquete ha sido entregado exitosamente.',
        },
        delivery: {
          title: '✨ Entrega completada',
          body: 'Has completado la entrega exitosamente.',
        },
      },
    };

    const notification = notifications[type][userRole];
    
    await this.scheduleNotification(
      notification.title,
      notification.body,
      {
        type: 'delivery_update',
        deliveryId,
        status: type,
      }
    );
  }

  static async sendLocationNotification(message: string) {
    await this.scheduleNotification(
      '📍 Ubicación',
      message,
      { type: 'location_update' }
    );
  }

  static async sendGeneralNotification(title: string, message: string, data?: any) {
    await this.scheduleNotification(title, message, data);
  }

  static async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  static async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  static async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Listener para notificaciones recibidas mientras la app está abierta
  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Listener para cuando el usuario toca una notificación
  static addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}