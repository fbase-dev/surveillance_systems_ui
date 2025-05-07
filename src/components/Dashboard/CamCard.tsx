import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Card, Image, Title } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function CamCard() {
  const { streamURL, videoRef } = useVideoFeed();
  const router = useRouter();
  return (
    <Card h={"40vh"} p={0} pos={"relative"} onClick={()=>router.push("/admin/cameras")} style={{cursor:"pointer"}}>
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
