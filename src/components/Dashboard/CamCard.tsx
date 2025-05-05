import { getStream } from "@/app/lib/services/cameraService";
import { Card } from "@mantine/core";
import { useEffect, useRef } from "react";

export default function CamCard() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const res = await getStream();
        const blob = res.data;
        const url = URL.createObjectURL(blob);

        if (videoRef.current) {
          videoRef.current.src = url;
        }
      } catch (err) {
        console.error("Stream error", err);
      }
    };

    fetchStream();
  }, []);

  return (
    <Card h={"30vh"}>
      <video ref={videoRef} controls autoPlay />
    </Card>
  );
}
