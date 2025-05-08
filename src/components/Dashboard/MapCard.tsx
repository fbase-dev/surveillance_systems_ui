import { useOwnVesselsAis } from "@/hooks/useOwnVesselsAis";
import { Card, Title } from "@mantine/core";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import Link from "next/link";

export default function MapCard() {
  const { lat, lon } = useOwnVesselsAis();
  return (
    <Card h={"40vh"} p={0} pos={"relative"}  component={Link} href={"/admin/navigation"}>
      <Title order={3} pos={"absolute"} top={5} left={10} style={{zIndex: 1}} m={0}>
        Map
      </Title>
      <Map
        defaultZoom={14}
        zoomControl={true}
        defaultCenter={{ lat: lat || 4.792575, lng: lon || 7.021782 }}
        disableDefaultUI={true}
        fullscreenControl={true}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
      >
        <AdvancedMarker position={{ lat: lat || 0, lng: lon || 0 }} />
      </Map>
    </Card>
  );
}
