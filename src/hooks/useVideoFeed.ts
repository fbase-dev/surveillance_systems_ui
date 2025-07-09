import { useRef } from "react";
import { camera_control_endpoints } from "../app/lib/endpoints";

type StreamUrls = {
  stream_1: string;
  stream_2: string;
  stream_3: string;
};
export const useVideoFeed = () => {
  const videoRef = useRef<HTMLImageElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_CAMERA_CONTROL_URL;
  const streamURLs: StreamUrls = {
    stream_1: `${baseUrl}${camera_control_endpoints.stream_1}`,
    stream_2: `${baseUrl}${camera_control_endpoints.stream_2}`,
    stream_3: `${baseUrl}${camera_control_endpoints.stream_3}`,
  };

  return { videoRef, streamURLs };
};
