import { useState, useEffect } from 'react';
import type { Coords } from '../types';

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
    if (!navigator.geolocation) {
      setState({ coords: null, error: 'Geolocation not supported', isLoading: false });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setState({ coords, error: null, isLoading: false });
        // Cache last known location
        localStorage.setItem('medifind_location', JSON.stringify(coords));
      },
      (err) => {
        // Fall back to cached location
        const cached = localStorage.getItem('medifind_location');
        if (cached) {
          try {
            setState({ coords: JSON.parse(cached), error: null, isLoading: false });
            return;
          } catch { /* ignore */ }
        }
        setState({ coords: null, error: err.message, isLoading: false });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return state;
}
