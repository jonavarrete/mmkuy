import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { NotificationService } from './notificationService';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export class LocationService {
  private static watchId: Location.LocationSubscription | null = null;
  private static lastKnownLocation: LocationData | null = null;

  static async requestPermissions(): Promise<boolean> {
    try {
      // Solicitar permisos de ubicación en primer plano
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permisos de Ubicación',
          'La aplicación necesita acceso a tu ubicación para funcionar correctamente.',
          [{ text: 'Entendido' }]
        );
        return false;
      }

      // Para repartidores, también solicitar permisos de ubicación en segundo plano
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Ubicación en Segundo Plano',
          'Para un mejor servicio, permite el acceso a la ubicación en segundo plano.',
          [{ text: 'Entendido' }]
        );
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 segundos
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      this.lastKnownLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Si hay una ubicación conocida reciente, devolverla
      if (this.lastKnownLocation && 
          Date.now() - this.lastKnownLocation.timestamp < 300000) { // 5 minutos
        return this.lastKnownLocation;
      }
      
      return null;
    }
  }

  static async startLocationTracking(
    onLocationUpdate: (location: LocationData) => void,
    options?: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    }
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      // Detener tracking anterior si existe
      await this.stopLocationTracking();

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: options?.accuracy || Location.Accuracy.High,
          timeInterval: options?.timeInterval || 10000, // 10 segundos
          distanceInterval: options?.distanceInterval || 10, // 10 metros
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          };

          this.lastKnownLocation = locationData;
          onLocationUpdate(locationData);
        }
      );

      await NotificationService.sendLocationNotification(
        'Seguimiento de ubicación activado'
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  static async stopLocationTracking(): Promise<void> {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
        
        await NotificationService.sendLocationNotification(
          'Seguimiento de ubicación desactivado'
        );
      }
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  static getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  static async calculateDistance(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): Promise<number> {
    try {
      // Usar la función de Expo Location para calcular distancia
      const distance = await Location.getDistanceAsync(from, to);
      return distance; // en metros
    } catch (error) {
      console.error('Error calculating distance:', error);
      
      // Fallback: cálculo manual usando fórmula de Haversine
      const R = 6371e3; // Radio de la Tierra en metros
      const φ1 = (from.latitude * Math.PI) / 180;
      const φ2 = (to.latitude * Math.PI) / 180;
      const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
      const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }
  }

  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const parts = [
          address.street,
          address.streetNumber,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);
        
        return parts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  static async geocode(address: string): Promise<LocationData | null> {
    try {
      const locations = await Location.geocodeAsync(address);
      
      if (locations.length > 0) {
        const location = locations[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  static formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
  }

  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  static async getLocationAccuracy(): Promise<Location.Accuracy> {
    try {
      // Verificar la configuración actual de precisión
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest,
      });
      
      const accuracy = location.coords.accuracy;
      
      if (!accuracy) return Location.Accuracy.Low;
      if (accuracy <= 5) return Location.Accuracy.Highest;
      if (accuracy <= 20) return Location.Accuracy.High;
      if (accuracy <= 100) return Location.Accuracy.Balanced;
      if (accuracy <= 1000) return Location.Accuracy.Low;
      
      return Location.Accuracy.Lowest;
    } catch (error) {
      console.error('Error getting location accuracy:', error);
      return Location.Accuracy.Low;
    }
  }
}