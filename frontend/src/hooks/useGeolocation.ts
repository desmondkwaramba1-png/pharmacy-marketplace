import { useState, useEffect } from 'react';
import type { Coords } from '../types';

interface GeolocationState {
  coords: Coords | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => {
    const cached = localStorage.getItem('medifind_location');
    if (cached) {
      try {
        return { coords: JSON.parse(cached), error: null, isLoading: false };
      } catch { /* ignore */ }
    }
    return {
      coords: null,
      error: null,
      isLoading: true,
    };
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: 'Geolocation not supported', isLoading: false });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        
        setState((prev) => {
          // If we have previous coords, calculate distance to avoid "jitter" refreshes
          if (prev.coords) {
            const dy = (lat - prev.coords.lat) * 111320; // lat degrees to meters
            const dx = (lng - prev.coords.lng) * 40075000 * Math.cos(lat * Math.PI / 180) / 360;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only update state if moved more than 20 meters
            if (distance < 20) return prev;
          }
          
          const coords = { lat, lng };
          // Cache last known location
          localStorage.setItem('medifind_location', JSON.stringify(coords));
          return { coords, error: null, isLoading: false };
        });
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
