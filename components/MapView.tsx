import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { DeliveryRequest, DeliveryPerson, Location } from '@/types';

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
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function CustomMapView({
  region = {
    latitude: 23.1319,
    longitude: -82.3841,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  },
  deliveryRequests = [],
  deliveryPersons = [],
  onMarkerPress,
  showUserLocation = true,
}: Props) {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region}
        mapType="standard"
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        loadingEnabled={true}
        customMapStyle={[]}
      >
        {/* Marcadores de solicitudes de entrega */}
        {deliveryRequests.map((request) => (
          <React.Fragment key={request.id}>
            {/* Punto de recogida */}
            <Marker
              coordinate={{
                latitude: request.pickup_lat,
                longitude: request.pickup_lng,
              }}
              title={`Recogida - ${request.pickup_contact_name}`}
              description={request.pickup_address}
              pinColor="#3B82F6"
              onPress={() => onMarkerPress?.(request.id, 'request')}
            />
            {/* Punto de entrega */}
            <Marker
              coordinate={{
                latitude: request.delivery_lat,
                longitude: request.delivery_lng,
              }}
              title={`Entrega - ${request.delivery_contact_name}`}
              description={request.delivery_address}
              pinColor="#EF4444"
              onPress={() => onMarkerPress?.(request.id, 'request')}
            />
          </React.Fragment>
        ))}

        {/* Marcadores de repartidores */}
        {deliveryPersons.map((person) => (
          person.current_lat && person.current_lng && (
            <Marker
              key={person.id}
              coordinate={{
                latitude: person.current_lat,
                longitude: person.current_lng,
              }}
              title="Repartidor disponible"
              description={`Rating: ${person.rating}⭐`}
              pinColor="#10B981"
              onPress={() => onMarkerPress?.(person.id, 'delivery_person')}
            />
          )
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});