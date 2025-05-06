import { useEffect, useState } from 'react';
import { getTargetLocation } from '../lib/services/aisService';

type Target = {
  lat: number,
  lon: number,
  target_name: string,
  target_status: string,
  lat_dir: string,
  lon_dir: string,
  target_number: number
}

export const useTargetLocation = () => {
  const [targetLocations, setTargetLocations] = useState<Target[]|[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTargetLocation()
      .then((res) => setTargetLocations(res.data.batch))
      .finally(() => setLoading(false));
  }, []);

  return { targetLocations, loading };
};
