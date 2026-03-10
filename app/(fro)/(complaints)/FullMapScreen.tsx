// app/FullMapScreen.tsx
import BodyLayout from '@/components/layout/BodyLayout';
import { useTheme } from '@/theme/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import RemixIcon from 'react-native-remix-icon';

export default function FullMapScreen() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const latitude = parseFloat(String(params.latitude));
  const longitude = parseFloat(String(params.longitude));
  const title = params.title || t('fullMap.location') || 'Location';
  const description = params.description || '';

  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <BodyLayout type="screen" screenName={t('fullMap.screenTitle') || 'Location Map'}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          loadingEnabled={true}
          loadingIndicatorColor={theme.colors.colorPrimary600}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={String(title)}
            description={String(description)}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.markerPin, 
                { 
                  backgroundColor: theme.colors.validationErrorText,
                  borderColor: theme.colors.colorBgSurface,
                  shadowColor: theme.colors.colorShadow,
                }
              ]}>
                <RemixIcon name="map-pin-fill" size={24} color={theme.colors.colorTextInverse} />
              </View>
            </View>
          </Marker>
        </MapView>

        <TouchableOpacity
          style={[
            styles.backButton,
            { 
              backgroundColor: theme.colors.colorOverlay,
              shadowColor: theme.colors.colorShadow,
            }
          ]}
          onPress={() => router.back()}
        >
          <RemixIcon name="arrow-left-line" size={24} color={theme.colors.colorTextInverse} />
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
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});