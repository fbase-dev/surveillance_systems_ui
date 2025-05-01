import { useEffect, useState } from 'react';
import { getOtherAisData } from '../lib/services/aisService';

export const useOtherVesselsAis = () => {
  const [otherAisData, setAisData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOtherAisData()
      .then((res) => setAisData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { otherAisData, loading };
};
