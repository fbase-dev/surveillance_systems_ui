import { useEffect, useRef, useState } from "react";
import { Config } from "@/types/Config";

type StreamUrls = {
  stream_1?: string;
  stream_2?: string;
  stream_3?: string;
};

export const useVideoFeed = () => {
  const videoRef = useRef<HTMLImageElement>(null);
  const [config, setConfig] = useState<Config>();

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data));
  }, []);

  const streamURLs: StreamUrls = {
    stream_1: config?.videoFeed1||undefined,
    stream_2: config?.videoFeed2||undefined,
    stream_3: config?.videoFeed3||undefined,
  };

  return { videoRef, streamURLs };
};
