import { useEffect, useState } from 'react';
import { getOwnAisData } from '../lib/services/aisService';
type AisData = {
  lat: number,
  lon: number,
  speed: string,
  heading: number,
}
export const useOwnVesselsAis = () => {
  const [aisData, setAisData] = useState<AisData>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnAisData()
      .then((res) => {
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setAisData(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { ...aisData, loading };
};
