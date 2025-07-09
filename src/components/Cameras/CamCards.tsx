import { useEffect, useState } from "react";
import { useCamera } from "@/contexts/CameraControlContext";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { SimpleGrid } from "@mantine/core";
import CamCard from "../CamCard";

export default function CamCards() {
  const { streamURLs } = useVideoFeed();
  const { modalHandler } = useCamera();

  // State to manage reloadKeys for each camera stream
  const [reloadKeys, setReloadKeys] = useState({
    stream_1: Date.now(),
    stream_2: Date.now(),
    stream_3: Date.now(),
  });

  // When modal closes, regenerate reload keys for all grid streams
  useEffect(() => {
      setReloadKeys({
        stream_1: Date.now(),
        stream_2: Date.now(),
        stream_3: Date.now(),
      });
  }, [streamURLs]);

  if (!streamURLs) {
    return <></>;
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 3 }}>
      <CamCard
        title="Cam 1"
        streamUrl={streamURLs.stream_1}
        onClick={modalHandler.open}
        externalReloadKey={reloadKeys.stream_1}
      />
      <CamCard
        title="Cam 2"
        streamUrl={streamURLs.stream_2}
        externalReloadKey={reloadKeys.stream_2}
      />
      <CamCard
        title="Cam 3"
        streamUrl={streamURLs.stream_3}
        externalReloadKey={reloadKeys.stream_3}
      />
    </SimpleGrid>
  );
}
