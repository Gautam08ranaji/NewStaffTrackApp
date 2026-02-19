import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useState } from "react";

/* ================= TYPES ================= */

type LocationContextType = {
  location: Location.LocationObject | null;
  address: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  revokePermission: () => void;
  fetchLocation: () => Promise<Location.LocationObject | null>;
};

/* ================= CONTEXT ================= */

const LocationContext = createContext<LocationContextType>({
  location: null,
  address: null,
  hasPermission: false,
  requestPermission: async () => false,
  revokePermission: () => {},
  fetchLocation: async () => null,
});

/* ================= PROVIDER ================= */

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  /* ---------- REQUEST PERMISSION ---------- */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setHasPermission(false);
        return false;
      }

      setHasPermission(true);
      await fetchLocation();
      return true;
    } catch (error) {
      console.error("Location permission error:", error);
      return false;
    }
  };

  /* ---------- FETCH LOCATION ---------- */
  const fetchLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      // console.log("currentLocation", currentLocation);

      setLocation(currentLocation);

      const { latitude, longitude } = currentLocation.coords;
      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (places.length > 0) {
        const p = places[0];
        const readableAddress = [
          p.name,
          p.street,
          p.city,
          p.region,
          p.postalCode,
          p.country,
        ]
          .filter(Boolean)
          .join(", ");

          // console.log("currentLocation",places[0]?.formattedAddress);
          

        setAddress(places[0]?.formattedAddress);
      }

      return currentLocation;
    } catch (error) {
      console.error("Fetch location error:", error);
      return null;
    }
  };

  /* ---------- REVOKE (APP LEVEL) ---------- */
  const revokePermission = () => {
    setHasPermission(false);
    setLocation(null);
    setAddress(null);
  };

  /* ---------- AUTO REQUEST ON APP START ---------- */
  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        hasPermission,
        requestPermission,
        revokePermission,
        fetchLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useLocation = () => useContext(LocationContext);
