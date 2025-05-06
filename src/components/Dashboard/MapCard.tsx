import { useOwnVesselsAis } from "@/app/hooks/useOwnVesselsAis";
import { Card, Title } from "@mantine/core";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";

export default function MapCard() {
  const { lat, lon } = useOwnVesselsAis();

  return (
    <Card h={"40vh"} p={0} pos={"relative"}>
      <Title order={3} pos={"absolute"} top={5} left={10} style={{zIndex: 1}} m={0}>
        Map
      </Title>
      <Map
        defaultZoom={14}
        zoomControl={true}
        defaultCenter={{ lat: lat || 22.54992, lng: lon || 0 }}
        disableDefaultUI={true}
        fullscreenControl={true}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
      >
        <AdvancedMarker position={{ lat: lat || 0, lng: lon || 0 }} />
      </Map>
    </Card>
  );
}
