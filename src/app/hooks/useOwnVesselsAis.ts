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
      .then((res) => setAisData(JSON.parse(res.data)))
      .finally(() => setLoading(false));
  }, []);

  return { ...aisData, loading };
};
