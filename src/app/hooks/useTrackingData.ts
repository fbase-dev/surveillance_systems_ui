import { useEffect, useState } from 'react';
import { getTrackingData } from '../lib/services/aisService';

export const useTrackingData = () => {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrackingData()
      .then((res) => setTrackingData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { trackingData, loading };
};
