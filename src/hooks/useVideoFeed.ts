import { useEffect, useRef, useState } from 'react';
import { camera_control_endpoints } from '../app/lib/endpoints';

type StreamUrls = {
  stream_1: string;
  stream_2: string,
  stream_3: string
}
export const useVideoFeed = () => {
  const videoRef = useRef<HTMLImageElement>(null);
  const [streamURLs, setStreamURL] = useState<StreamUrls|undefined>(undefined);

  useEffect(() => {
    const urls: StreamUrls = {
      stream_1: `/api/camera?path=${camera_control_endpoints.stream_1}`,
      stream_2: `/api/camera?path=${camera_control_endpoints.stream_2}`,
      stream_3: `/api/camera?path=${camera_control_endpoints.stream_3}`
    }; 
    setStreamURL(urls);
  }, []);

  return { videoRef, streamURLs };
};
