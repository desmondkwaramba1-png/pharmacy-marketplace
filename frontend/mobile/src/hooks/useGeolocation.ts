import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coords } from '../types';

interface GeolocationState {
  coords: Coords | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const cached = await AsyncStorage.getItem('medifind_location');
        if (cached) {
          try {
            setState({ coords: JSON.parse(cached), error: null, isLoading: false });
          } catch {
            setState({ coords: null, error: 'Permission to access location was denied', isLoading: false });
          }
        } else {
          setState({ coords: null, error: 'Permission to access location was denied', isLoading: false });
        }
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 20, // Only update if moved more than 20 meters
        },
        (location) => {
          const coords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          AsyncStorage.setItem('medifind_location', JSON.stringify(coords));
          setState({ coords, error: null, isLoading: false });
        }
      );
    };

    startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return state;
}
