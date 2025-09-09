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
  deliveryRequests?: DeliveryRequest[];
  deliveryPersons?: DeliveryPerson[];
  onMarkerPress?: (id: string, type: 'request' | 'delivery_person') => void;
  showUserLocation?: boolean;
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
}: Props) {
  const [mapLoaded, setMapLoaded] = useState(false);

  const generateMarkersJS = () => {
    let markersJS = '';

    // Marcadores de solicitudes de entrega
    deliveryRequests.forEach((request) => {
      // Punto de recogida (azul)
      markersJS += `
        L.marker([${request.pickup_lat}, ${request.pickup_lng}], {
          icon: L.divIcon({
            className: 'pickup-marker',
            html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        })
        .addTo(map)
        .bindPopup('<b>Recogida</b><br/>${request.pickup_contact_name}<br/>${request.pickup_address}')
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerPress',
            id: '${request.id}',
            markerType: 'request'
          }));
        });
      `;

      // Punto de entrega (rojo)
      markersJS += `
        L.marker([${request.delivery_lat}, ${request.delivery_lng}], {
          icon: L.divIcon({
            className: 'delivery-marker',
            html: '<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        })
        .addTo(map)
        .bindPopup('<b>Entrega</b><br/>${request.delivery_contact_name}<br/>${request.delivery_address}')
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerPress',
            id: '${request.id}',
            markerType: 'request'
          }));
        });
      `;
    });

    // Marcadores de repartidores (verde)
    deliveryPersons.forEach((person) => {
      if (person.current_lat && person.current_lng) {
        markersJS += `
          L.marker([${person.current_lat}, ${person.current_lng}], {
            icon: L.divIcon({
              className: 'delivery-person-marker',
              html: '<div style="background-color: #10B981; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
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

        // Ubicación del usuario si está habilitada
        ${showUserLocation ? `
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var userLat = position.coords.latitude;
              var userLng = position.coords.longitude;
              
              L.marker([userLat, userLng], {
                icon: L.divIcon({
                  className: 'user-location-marker',
                  html: '<div style="background-color: #2563EB; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);"></div>',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
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