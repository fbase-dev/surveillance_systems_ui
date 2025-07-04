import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Card } from "@mantine/core";

export default function CamCard() {
  const { streamURL } = useVideoFeed();

  return (
    <Card h={"80vh"} p={0}>
      {!(streamURL === "") && (
        <img
          src={streamURL}
          alt="Live Stream"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            flex: 1,
          }}
        />
      )}
    </Card>
  );
}
