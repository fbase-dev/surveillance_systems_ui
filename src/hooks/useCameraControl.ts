import { useEffect, useState } from "react";
import {
  getCameraPosition,
  getLiveTrackingPosition,
  sendCameraCommand,
} from "../app/lib/services/cameraService";

export const useCameraControl = () => {
  const [position, setPosition] = useState({ pan: 0, tilt: 0, zoom: 0 });

  // Fetch the cache position of the camera
  const fetchCachePosition = async () => {
    try {
      const response = await getCameraPosition();
      setPosition(response.data);
    } catch (error) {
      console.error("Error fetching cache position", error);
    }
  };

   // Fetch the live position of the camera
   const fetchLivePosition = async () => {
    try {
      const response = await getLiveTrackingPosition(); 
      setPosition(response.data);
    } catch (error) {
      console.error("Error fetching live position", error);
    }
  };

  // Control the camera (send commands like pan, tilt, zoom)
  const control = async (action: string, extra?: Record<string, any>) => {
    try {
      await sendCameraCommand(action, extra);
      await fetchCachePosition(); 
    } catch (error) {
      console.error("Error controlling camera", error);
    }
  };

  // Fetch position on component mount
  useEffect(() => {
    fetchCachePosition();
  }, []);

  return {
    position,
    control,
    fetchCachePosition,
    fetchLivePosition
  };
};
