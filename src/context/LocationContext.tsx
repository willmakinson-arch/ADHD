import React, { createContext, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Coords } from '../utils/location';

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
type LocationContextValue = {
  coords: Coords | null;
  status: LocationStatus;
  requestLocation: () => void;
  setSearchCoords: (coords: Coords) => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');

  const requestLocation = () => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus('granted');
      },
      error => setStatus(error.code === 1 ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
    );
  };

  const value = useMemo(() => ({
    coords,
    status,
    requestLocation,
    setSearchCoords: (next: Coords) => { setCoords(next); setStatus('granted'); },
  }), [coords, status]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used inside LocationProvider');
  return context;
}
