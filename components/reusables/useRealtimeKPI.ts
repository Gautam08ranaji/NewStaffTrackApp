import { useEffect, useState } from "react";

export default function useRealtimeKPI(
  fetchFn: () => Promise<any>,
  interval = 15000,
) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const load = async () => {
      try {
        const res = await fetchFn();
        setData(res);
      } catch (e) {
        console.log("KPI fetch error", e);
      }
    };

    load(); // initial load

    timer = setInterval(load, interval);

    return () => clearInterval(timer);
  }, [fetchFn, interval]);

  return data;
}
