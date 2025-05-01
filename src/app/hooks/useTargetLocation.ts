import { useEffect, useState } from 'react';
import { getTargetLocation } from '../lib/services/aisService';

export const useTargetLocation = () => {
  const [targetLocation, setTargetLocation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTargetLocation()
      .then((res) => setTargetLocation(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { targetLocation, loading };
};
