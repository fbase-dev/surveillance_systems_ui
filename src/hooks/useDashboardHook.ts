import {
  getOwnAisData,
  getTargetLocation,
} from "@/app/lib/services/aisService";
import { AisData } from "@/types/AisData";
import { Target } from "@/types/Target";
import { useEffect, useState } from "react";

export const useDashboardHook = () => {
  const [selectedVessel, setSelectedVessel] = useState<AisData | Target>({lat: 4.792575, lon: 7.021782, heading: 360.0, speed: "0.1"});
  const [ownAisData, setOwnAisData] = useState<AisData>({lat: 4.792575, lon: 7.021782, heading: 360.0, speed: "0.1"});
  const [targetLocations, setTargetLocations] = useState<Target[] | []>([]);
  const [loading, setLoading] = useState(true); //todo loading overlay

  // get own ais data
  useEffect(() => {
    getOwnAisData()
      .then((res) => {
        const data =
          typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setOwnAisData(data);
        setSelectedVessel(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchLocations = () => {
      getTargetLocation()
        .then((res) => setTargetLocations(res.data.batch))
        .finally(() => setLoading(false));
    };
  
    // fetch immediately on mount
    fetchLocations();
  
    // set up polling every 15s
    const interval = setInterval(fetchLocations, 15000);
  
    // cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    ownAisData,
    selectedVessel,
    targetLocations,
    setSelectedVessel,
  };
};
