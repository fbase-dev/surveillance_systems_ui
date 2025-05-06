import { useVideoFeed } from "@/app/hooks/useVideoFeed";
import { Card, Image, Title } from "@mantine/core";

export default function CamCard() {
  const { streamURL } = useVideoFeed();
  return (
    <Card h={"40vh"} p={0} pos={"relative"}>
        <Title order={3} pos={"absolute"} top={5} left={10} style={{zIndex: 1}} m={0}>
            Cam 1
        </Title>
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
