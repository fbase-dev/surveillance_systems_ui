import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Card, Title } from "@mantine/core";
import Link from "next/link";

export default function CamCard() {
  const { streamURL, videoRef } = useVideoFeed();
  return (
    <Card h={"40vh"} p={0} pos={"relative"} component={Link} href={"/admin/cameras"} >
        <Title order={3} pos={"absolute"} top={5} left={10} style={{zIndex: 1}} m={0}>
            Cam 1
        </Title>
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
