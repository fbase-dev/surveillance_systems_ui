import { useEffect, useRef, useState } from 'react';
import { camera_control_endpoints } from '../lib/endpoints';

export const useVideoFeed = () => {
  const videoRef = useRef<HTMLImageElement>(null);
  const [streamURL, setStreamURL] = useState("");

  useEffect(() => {
    const url = `/api/camera?path=${camera_control_endpoints.stream}`; 
    setStreamURL(url);
  }, []);

  return { videoRef, streamURL };
};
