import { useState } from 'react';
import { getCameraPosition, sendCameraCommand } from '../lib/services/cameraService';

export const useCameraControl = () => {
  const [position, setPosition] = useState({ pan: 0, tilt: 0, zoom: 0 });

  const fetchPosition = async () => {
    const res = await getCameraPosition();
    setPosition(res.data);
  };

  const control = async (action: string, extra?: Record<string, any>) => {
    await sendCameraCommand(action, extra);
    fetchPosition();
  };

  return {
    position,
    control,
    fetchPosition,
  };
};
