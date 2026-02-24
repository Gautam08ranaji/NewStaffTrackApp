import { addAndUpdateFROLocation } from "@/features/fro/froLocationApi";
import { useEffect, useRef } from "react";
import { useLocation } from "./LocationContext";

export const useFROLocationUpdater = (userId?: string | null) => {
  const { hasPermission, fetchLocation, address } = useLocation();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasPermission || !userId) return;

    const sendLocation = async () => {
      try {
        const location = await fetchLocation();
        if (!location) return;

        const { latitude, longitude } = location.coords;
        const payload = {
          name: address ?? "Unknown location", // ✅ READABLE ADDRESS
          latitute: latitude.toString(), // ✅ real latitude
          longititute: longitude.toString(), // ✅ real longitude
          discriptions: address ?? "",
          elderPinLocation: "string",
          froPinLocation: "string",
          userId, // ✅ use passed userId
        };

        // console.log("📤 Sending payload:", payload);

        const res = await addAndUpdateFROLocation(payload);
        // console.log("✅ Location update success:", res);
      } catch (error) {
        // console.error("❌ Location update error:", error);
      }
    };

    // sendLocation();
    intervalRef.current = setInterval(sendLocation, 30000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasPermission, userId, address]);
};
