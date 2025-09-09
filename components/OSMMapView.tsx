import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { DeliveryRequest, DeliveryPerson } from '@/types';

interface Props {
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  deliveryRequests?: (DeliveryRequest & { showPickupOnly?: boolean; showDeliveryOnly?: boolean })[];
  deliveryPersons?: DeliveryPerson[];
  onMarkerPress?: (id: string, type: 'request' | 'delivery_person') => void;
  showUserLocation?: boolean;
  currentUser?: {
    id: string;
    role: 'user' | 'delivery' | 'admin';
  };
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const { width, height } = Dimensions.get('window');

export default function OSMMapView({
  region = {
    latitude: 40.4168,
    longitude: -3.7038,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  deliveryRequests = [],
  deliveryPersons = [],
  onMarkerPress,
  showUserLocation = true,
  currentUser,
  userLocation,
}: Props) {
  const [mapLoaded, setMapLoaded] = useState(false);

  const generateMarkersJS = () => {
    const STATUS_LABELS = {
      pending: 'Pendiente',
      accepted: 'Aceptado', 
      picked_up: 'Recogido',
      in_transit: 'En tránsito',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
      
    let markersJS = '';

    // Marcadores de solicitudes de entrega
    deliveryRequests.forEach((request) => {
      // Mostrar punto de recogida si no está marcado como "solo entrega"
      if (!request.showDeliveryOnly) {
        markersJS += `
          L.marker([${request.pickup_lat}, ${request.pickup_lng}], {
            icon: L.divIcon({
              className: 'pickup-marker',
              html: '<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          })
          .addTo(map)
          .bindPopup('<b>Recogida</b><br/>${request.pickup_contact_name}<br/>${request.pickup_address}<br/><small>Estado: ${STATUS_LABELS[request.status] || request.status}</small>')
          .on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerPress',
              id: '${request.id}',
              markerType: 'request'
            }));
          });
        `;
      }

      // Mostrar punto de entrega si no está marcado como "solo recogida"
      if (!request.showPickupOnly) {
        markersJS += `
          L.marker([${request.delivery_lat}, ${request.delivery_lng}], {
            icon: L.divIcon({
              className: 'delivery-marker',
              html: '<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          })
          .addTo(map)
          .bindPopup('<b>Entrega</b><br/>${request.delivery_contact_name}<br/>${request.delivery_address}<br/><small>Estado: ${STATUS_LABELS[request.status] || request.status}</small>')
          .on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerPress',
              id: '${request.id}',
              markerType: 'request'
            }));
          });
        `;
      }
    });

    // Marcadores de repartidores (verde)
    deliveryPersons.forEach((person) => {
      if (person.current_lat && person.current_lng) {
        markersJS += `
          L.marker([${person.current_lat}, ${person.current_lng}], {
            icon: L.divIcon({
              className: 'delivery-person-marker',
              html: '<div style="background-color: #10B981; width: 28px; height: 28px; border-radius: 6px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px;">🚚</div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            })
          })
          .addTo(map)
          .bindPopup('<b>Repartidor disponible</b><br/>Rating: ${person.rating}⭐')
          .on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerPress',
              id: '${person.id}',
              markerType: 'delivery_person'
            }));
          });
        `;
      }
    });

    // Marcador del usuario actual si es repartidor y tenemos su ubicación
    if (currentUser?.role === 'delivery' && userLocation) {
      markersJS += `
        L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
          icon: L.divIcon({
            className: 'current-delivery-person-marker',
            html: '<div style="background-color: #059669; width: 32px; height: 32px; border-radius: 8px; border: 4px solid white; box-shadow: 0 3px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 16px; animation: pulse 2s infinite;">🚛</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        })
        .addTo(map)
        .bindPopup('<b>Tu ubicación</b><br/>Repartidor activo');
      `;
    }
    return markersJS;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OpenStreetMap</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .leaflet-control-attribution { display: none !important; }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Agregar marcadores
        ${generateMarkersJS()}

        // Definir etiquetas de estado para los popups
        const STATUS_LABELS = {
          pending: 'Pendiente',
          accepted: 'Aceptado',
          picked_up: 'Recogido',
          in_transit: 'En tránsito',
          delivered: 'Entregado',
          cancelled: 'Cancelado'
        };

        // Ubicación del usuario si está habilitada y NO es repartidor (para evitar duplicados)
        ${showUserLocation && currentUser?.role !== 'delivery' ? `
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var userLat = position.coords.latitude;
              var userLng = position.coords.longitude;
              
              L.marker([userLat, userLng], {
                icon: L.divIcon({
                  className: 'user-location-marker',
                  html: '<div style="background-color: #2563EB; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.6);"></div>',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })
              })
              .addTo(map)
              .bindPopup('Tu ubicación');
            });
          }
        ` : ''}

        // Notificar que el mapa está listo
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapReady'
        }));
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapReady') {
        setMapLoaded(true);
      } else if (data.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(data.id, data.markerType);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});