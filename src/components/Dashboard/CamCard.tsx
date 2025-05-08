import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Card, Image, Title } from "@mantine/core";
import Link from "next/link";

export default function CamCard() {
  const { streamURL, videoRef } = useVideoFeed();
  return (
    <Card h={"40vh"} p={0} pos={"relative"} component={Link} href={"/admin/cameras"} >
        <Title order={3} pos={"absolute"} top={5} left={10} style={{zIndex: 1}} m={0}>
            Cam 1
        </Title>
        {!(streamURL === "") && (
            <Image
            ref={videoRef}
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
