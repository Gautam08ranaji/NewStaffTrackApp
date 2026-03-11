import { addAndUpdateFROLocation } from "@/features/fro/froLocationApi";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useRef } from "react";
import { useLocation } from "./LocationContext";

export const useFROLocationUpdater = (userId?: string | null) => {
  const { hasPermission, fetchLocation, address } = useLocation();
  const intervalRef = useRef<number | null>(null);
    const authState = useAppSelector((state) => state.auth);
    const fullName = `${authState?.firstName ?? ""} ${authState?.lastName ?? ""}`.trim();


  

  useEffect(() => {
    if (!hasPermission || !userId) return;

    const sendLocation = async () => {
  try {
    const location = await fetchLocation();
    if (!location) return;

    const { latitude, longitude } = location.coords;

const token = authState?.token
const csrfToken = authState?.antiforgeryToken

    if (!token) {
      console.log("❌ Token missing");
      return;
    }

    const payload = {
      name: fullName ?? "User",
      latitute: latitude.toString(),
      longititute: longitude.toString(),
      discriptions: address ?? "",
      // elderPinLocation: address ?? "Unknown location",
      froPinLocation: address ?? "Unknown location",
      userId,
    };

    console.log("📤 Sending payload:", payload);

    const res = await addAndUpdateFROLocation(
      payload,
      token,
      csrfToken || ""
    );

    console.log("✅ Location update success:", res);

  } catch (error) {
    console.error("❌ Location update error:", error);
  }
};

    sendLocation();
    intervalRef.current = setInterval(sendLocation, 30000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasPermission, userId, address]);
};
