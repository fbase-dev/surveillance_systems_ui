import { useEffect, useState } from 'react';
import { getOwnAisData } from '../lib/services/aisService';

export const useOwnVesselsAis = () => {
  const [aisData, setAisData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnAisData()
      .then((res) => setAisData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { aisData, loading };
};
