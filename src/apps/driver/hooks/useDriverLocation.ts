/**
 * ─── useDriverLocation ────────────────────────────────────────────────────────
 * Custom hook for real-time driver GPS tracking.
 *
 * Uses expo-location's watchPositionAsync for continuous updates.
 * Updates the driver's location in useDriverStore every 3 seconds or 10 meters.
 *
 * @example
 * const { coords, cityName, permissionGranted } = useDriverLocation();
 */

import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useDriverStore } from '../../store/useDriverStore';

interface DriverLocationState {
  coords: { latitude: number; longitude: number } | null;
  cityName: string;
  permissionGranted: boolean;
  isLoading: boolean;
}

const DEFAULT_CITY = 'Batna';

export function useDriverLocation(): DriverLocationState {
  const updateDriverLocation = useDriverStore((s) => s.updateDriverLocation);

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [cityName, setCityName] = useState(DEFAULT_CITY);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setIsLoading(false);
          return;
        }

        setPermissionGranted(true);

        // Get initial position
        const initialLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = initialLoc.coords;
        setCoords({ latitude, longitude });
        updateDriverLocation(latitude, longitude);

        // Reverse geocode for city name
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo.length > 0) {
          setCityName(
            geo[0].city || geo[0].district || geo[0].region || DEFAULT_CITY,
          );
        }

        // Start continuous tracking
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,   // every 3 seconds
            distanceInterval: 10, // or every 10 meters
          },
          (location) => {
            const { latitude: lat, longitude: lng } = location.coords;
            setCoords({ latitude: lat, longitude: lng });
            updateDriverLocation(lat, lng);
          },
        );
      } catch (error) {
        console.warn('[useDriverLocation] error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    startTracking();

    return () => {
      subscription?.remove();
    };
  }, []);

  return { coords, cityName, permissionGranted, isLoading };
}
