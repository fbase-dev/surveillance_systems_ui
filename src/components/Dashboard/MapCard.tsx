import { useDashboard } from "@/contexts/DashboardContext";
import { useLocations } from "@/hooks/useLocations";
import { Card, Title } from "@mantine/core";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import Link from "next/link";

export default function MapCard() {
  const { location } = useDashboard();
  
  return (
    <Card h={"40vh"} p={0} pos={"relative"}  component={Link} href={"/admin/navigation"}>
      <Title order={3} pos={"absolute"} top={5} left={10} style={{zIndex: 1}} m={0}>
        Map
      </Title>
      <Map
        defaultZoom={14}
        zoomControl={true}
        defaultCenter={{ lat: location?.latitude || 4.792575, lng: location?.longitude || 7.021782 }}
        disableDefaultUI={true}
        fullscreenControl={true}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
      >
        <AdvancedMarker position={{ lat: location?.latitude || 0, lng: location?.longitude || 0 }} />
      </Map>
    </Card>
  );
}
