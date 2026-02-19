// CameraPermissionProvider.tsx
import { PermissionStatus, useCameraPermissions } from "expo-camera";
import React, { createContext, useContext, useEffect, useState } from "react";

type CameraPermissionContextType = {
  permissionGranted: boolean;
  requestPermission: () => void;
};

const CameraPermissionContext = createContext<CameraPermissionContextType>({
  permissionGranted: false,
  requestPermission: () => {},
});

export const CameraPermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (permission?.status === PermissionStatus.GRANTED) {
      setPermissionGranted(true);
    } else {
      requestPermission();
    }
  }, [permission]);

  return (
    <CameraPermissionContext.Provider
      value={{
        permissionGranted,
        requestPermission,
      }}
    >
      {children}
    </CameraPermissionContext.Provider>
  );
};

export const useCameraPermission = () => useContext(CameraPermissionContext);
