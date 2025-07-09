import { useEffect, useState } from "react";
import { useCamera } from "@/contexts/CameraControlContext";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { SimpleGrid } from "@mantine/core";
import CamCard from "../CamCard";

export default function CamCards() {
  const { streamURLs } = useVideoFeed();
  const { modalHandler } = useCamera();

  if (!streamURLs) {
    return <></>;
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 3 }}>
      <CamCard
        title="Cam 1"
        streamUrl={streamURLs.stream_1}
        onClick={modalHandler.open}
      />
      <CamCard
        title="Cam 2"
        streamUrl={streamURLs.stream_2}

      />
      <CamCard
        title="Cam 3"
        streamUrl={streamURLs.stream_2}
      />
    </SimpleGrid>
  );
}
