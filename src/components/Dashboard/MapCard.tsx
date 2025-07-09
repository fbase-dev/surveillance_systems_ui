import { useDashboard } from "@/contexts/DashboardContext";
import { Card, Title } from "@mantine/core";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MapCard() {
  const { location } = useDashboard();
  const [mapApiId, setMapApiId] = useState("");
  
    useEffect(() => {
      fetch("/api/config")
        .then((res) => res.json())
        .then((data) => {
          setMapApiId(data.mapApiId);
        });
    }, []);
  return (
    <Card h={"40vh"} p={0} pos={"relative"}  component={Link} href={"/admin/navigation"}>
      <Title order={3} pos={"absolute"} top={5} left={10} style={{zIndex: 1}} m={0}>
        Map
      </Title>
      <Map
        defaultZoom={14}
        zoomControl={true}
        defaultCenter={{ lat: location?.latitude, lng: location?.longitude }}
        disableDefaultUI={true}
        fullscreenControl={true}
        mapId={mapApiId}
      >
        <AdvancedMarker position={{ lat: location?.latitude, lng: location?.longitude }} />
      </Map>
    </Card>
  );
}
