import { useEffect, useState } from "react";
import {
  getCameraPosition,
  sendCameraCommand,
} from "../lib/services/cameraService";

export const useCameraControl = () => {
  const [position, setPosition] = useState({ pan: 0, tilt: 0, zoom: 0 });

  // Fetch the current position of the camera
  const fetchPosition = async () => {
    try {
      const response = await getCameraPosition(); // Assuming this fetches the current position
      setPosition(response.data); // Assuming the response contains { pan, tilt, zoom }
    } catch (error) {
      console.error("Error fetching position", error);
    }
  };

  // Control the camera (send commands like pan, tilt, zoom)
  const control = async (action: string, extra?: Record<string, any>) => {
    try {
      await sendCameraCommand(action, extra); // Send the command to the backend
      fetchPosition(); // Fetch the position after command
    } catch (error) {
      console.error("Error controlling camera", error);
    }
  };

  // Fetch position on component mount
  useEffect(() => {
    fetchPosition();
  }, []);

  return {
    position,
    control,
    fetchPosition,
  };
};
