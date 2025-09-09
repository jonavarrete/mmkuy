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
  onAcceptDelivery?: (deliveryId: string) => void;
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
    latitude: 23.1319,
    longitude: -82.3841,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  deliveryRequests = [],
  deliveryPersons = [],
  onMarkerPress,
  onAcceptDelivery,
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
        // Determinar el color del marcador según el estado y si está asignado al usuario actual
        const isAssignedToCurrentUser = request.delivery_person_id === currentUser?.id;
        let pickupColor = '#3B82F6'; // Azul por defecto (pendiente)
        
        if (isAssignedToCurrentUser) {
          // Verde para entregas asignadas al usuario actual
          pickupColor = '#059669';
        } else if (request.delivery_person_id && request.delivery_person_id !== currentUser?.id) {
          // Gris para entregas asignadas a otros repartidores
          pickupColor = '#6B7280';
        }
        
        markersJS += `
          L.marker([${request.pickup_lat}, ${request.pickup_lng}], {
            icon: L.divIcon({
              className: 'pickup-marker',
              html: '<div style="background-color: ${pickupColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); position: relative;"><div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: ${isAssignedToCurrentUser ? '#10B981' : 'transparent'}; border-radius: 50%; border: 1px solid white;"></div></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          })
          .addTo(map)
          .bindPopup(\`
            <div>
              <b>Recogida</b><br/>
              ${request.pickup_contact_name}<br/>
              ${request.pickup_address}<br/>
              <small>Estado: ${STATUS_LABELS[request.status] || request.status}</small><br/>
             <div style="margin-top: 8px;">
               <button onclick="viewDetails('${request.id}')" style="background: #2563EB; color: white; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px; cursor: pointer; font-size: 12px;">Ver Detalles</button>
              ${request.status === 'pending' && currentUser?.role === 'delivery' && !request.delivery_person_id ? 
                '<button onclick="acceptDelivery(\'' + request.id + '\')" style="background: #10B981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Aceptar</button>' : 
                ''}
             </div>
              ${isAssignedToCurrentUser ? '<br/><small style="color: #059669; font-weight: bold;">Asignado a ti</small>' : ''}
            </div>
          \`)
        `;
      }

      // Mostrar punto de entrega solo si está asignado al usuario actual o si es admin
      if (!request.showPickupOnly && (request.delivery_person_id === currentUser?.id || currentUser?.role === 'admin')) {
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
          .bindPopup(\`
            <div>
              <b>Entrega</b><br/>
              ${request.delivery_contact_name}<br/>
              ${request.delivery_address}<br/>
              <small>Estado: ${STATUS_LABELS[request.status] || request.status}</small>
              <div style="margin-top: 8px;">
                <button onclick="viewDetails('${request.id}')" style="background: #2563EB; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Ver Detalles</button>
              </div>
            </div>
          \`)
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
              html: '<div style="background-color: #10B981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px;">🚚</div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            })
          })
          .addTo(map)
          .bindPopup('<b>Repartidor disponible</b><br/>Rating: ${person.rating}⭐<br/>Entregas completadas: ${person.completed_deliveries}');
        `;
      }
    });

    // Marcador del usuario actual si es repartidor y tenemos su ubicación
    if (currentUser?.role === 'delivery' && userLocation) {
      markersJS += `
        L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
          icon: L.divIcon({
            className: 'current-delivery-person-marker',
            html: '<div style="background-color: #059669; width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 3px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 16px; animation: pulse 2s infinite;">🚛</div>',
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
        var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Agregar marcadores
        ${generateMarkersJS()}

        // Función para aceptar entrega desde el popup
        function acceptDelivery(deliveryId) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'acceptDelivery',
            deliveryId: deliveryId
          }));
        }

        // Función para ver detalles desde el popup
        function viewDetails(deliveryId) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'viewDetails',
            deliveryId: deliveryId
          }));
        }
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
      } else if (data.type === 'viewDetails' && onMarkerPress) {
        onMarkerPress(data.deliveryId, 'request');
      } else if (data.type === 'acceptDelivery' && onAcceptDelivery) {
        onAcceptDelivery(data.deliveryId);
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