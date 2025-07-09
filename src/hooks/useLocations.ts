import { getLocations } from "@/app/lib/services/locationsService";
import { Location } from "@/types/Location";
import { useEffect, useState } from "react";

export const useLocations = () => {
  const [location, setLocation] = useState<Location>({
    latitude: 4.792575,
    longitude: 7.021782,
  });

  const fetchLocations = () => {
    getLocations().then((res) => {
      setLocation({
        latitude: res.data?.[0].latitude,
        longitude: res.data?.[0].longitude
      });
    });
  };

  useEffect(()=>{
    fetchLocations();
  }, []);

  return {
    location
  }
};
