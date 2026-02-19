// app/FullMapScreen.js
import BodyLayout from '@/components/layout/BodyLayout';
import { useTheme } from '@/theme/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import RemixIcon from 'react-native-remix-icon';

export default function FullMapScreen() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  
  const latitude = parseFloat(String(params.latitude));
  const longitude = parseFloat(String(params.longitude));
  const title = params.title || 'Location';
  const description = params.description || '';

  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <BodyLayout type="screen" screenName="Location Map">
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={String(title)}
            description={String(description)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerPin, { backgroundColor: theme.colors.validationErrorText }]}>
                <RemixIcon name="map-pin-fill" size={24} color="#FFF" />
              </View>
            </View>
          </Marker>
        </MapView>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <RemixIcon name="arrow-left-line" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </BodyLayout>
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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});