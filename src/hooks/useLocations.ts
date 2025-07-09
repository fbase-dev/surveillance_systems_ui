import { getLocations } from "@/app/lib/services/locationsService";
import { Location } from "@/types/Location";
import { useEffect, useState } from "react";

export const useLocations = () => {
  const [location, setLocation] = useState<Location|undefined>(undefined);

  const fetchLocations = () => {
    getLocations().then((res) => {
      setLocation(res.data?.[0]);
    });
  };

  useEffect(()=>{
    fetchLocations()
  }, []);

  return {
    location
  }
};
