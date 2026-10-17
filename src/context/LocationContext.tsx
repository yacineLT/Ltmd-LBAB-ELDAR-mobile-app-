import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeliveryLocation } from '../types';
import { dbService } from '../services/store';
import { useAuth } from './AuthContext';

interface LocationContextType {
  location: DeliveryLocation | null;
  setLocation: (loc: DeliveryLocation) => void;
  isMapOpen: boolean;
  openMap: () => void;
  closeMap: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default fallback to central Algiers (Didouche Mourad / Grande Poste)
export const DEFAULT_ALGERIA_LOCATION: DeliveryLocation = {
  address: 'شارع ديدوش مراد، سيدي امحمد، الجزائر العاصمة',
  latitude: 36.7692,
  longitude: 3.0566,
  city: 'الجزائر العاصمة',
  district: 'سيدي امحمد',
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [location, setLocationState] = useState<DeliveryLocation | null>(() => {
    return dbService.getCustomerLocation(currentUser?.id) || DEFAULT_ALGERIA_LOCATION;
  });
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const saved = dbService.getCustomerLocation(currentUser?.id);
    if (saved) {
      setLocationState(saved);
    }
  }, [currentUser?.id]);

  const setLocation = (newLoc: DeliveryLocation) => {
    setLocationState(newLoc);
    dbService.saveCustomerLocation(newLoc, currentUser?.id);
  };

  const openMap = () => setIsMapOpen(true);
  const closeMap = () => setIsMapOpen(false);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isMapOpen,
        openMap,
        closeMap,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
