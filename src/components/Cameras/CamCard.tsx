import { useVideoFeed } from "@/app/hooks/useVideoFeed";
import { Card, Image } from "@mantine/core";

export default function CamCard() {
  const { streamURL } = useVideoFeed();

  return (
    <Card h={"91vh"} p={0} m={"-md"}>
      {!(streamURL === "") && (
        <Image
          src={streamURL}
          alt="Live Stream"
          w={"100%"}
          h={"100%"}
          fit="cover"
          display={"block"}
          flex={1}
        />
      )}
    </Card>
  );
}
