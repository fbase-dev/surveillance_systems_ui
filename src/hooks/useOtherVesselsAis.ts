import { useEffect, useState } from 'react';
import { getOtherAisData } from '../app/lib/services/aisService';

export const useOtherVesselsAis = () => {
  const [otherAisData, setAisData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOtherAisData()
      .then((res) => {
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setAisData(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { otherAisData, loading };
};
