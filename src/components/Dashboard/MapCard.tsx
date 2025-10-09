import { useDashboard } from "@/contexts/DashboardContext";
import { Card, Title, Text } from "@mantine/core";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MapCard() {
  const { location } = useDashboard();
  const [mapApiKey, setMapApiKey] = useState("");
  const [mapApiId, setMapApiId] = useState("");
  const [vesselPosition, setVesselPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setMapApiKey(data.mapApiKey || ""); // Add this
        setMapApiId(data.mapApiId || "");
      });
  }, []);

  useEffect(() => {
    const fetchVesselPosition = async () => {
      try {
        const response = await fetch("/api/ais_data/own");
        const data = await response.json();

        if (data.success && data.data) {
          setVesselPosition({
            lat: data.data.latitude,
            lng: data.data.longitude,
          });
          setError("");
        } else {
          setError("No vessel position available");
        }
      } catch (err) {
        console.error("Error fetching vessel position:", err);
        setError("Failed to fetch position");
      }
    };

    fetchVesselPosition();
    
    // Update position every 5 seconds
    const interval = setInterval(fetchVesselPosition, 5000);
    return () => clearInterval(interval);
  }, []);

  // Use vessel position if available, otherwise fall back to context location
  const displayLocation = vesselPosition || {
    lat: location?.latitude,
    lng: location?.longitude,
  };

  return (
    <Card h={"40vh"} p={0} pos={"relative"} component={Link} href={"/admin/navigation"}>
      <Title order={3} pos={"absolute"} top={5} left={10} style={{ zIndex: 1 }} m={0}>
        Map
      </Title>
      {error && (
        <Text pos={"absolute"} top={35} left={10} style={{ zIndex: 1 }} size="xs" c="yellow">
          {error}
        </Text>
      )}
      {mapApiKey && mapApiId ? (
        <APIProvider apiKey={mapApiKey}>
          <Map
            defaultZoom={14}
            zoomControl={true}
            center={displayLocation}
            disableDefaultUI={true}
            fullscreenControl={true}
            mapId={mapApiId}
          >
            <AdvancedMarker position={displayLocation} />
          </Map>
        </APIProvider>
      ) : (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Loading map...
        </div>
      )}
    </Card>
  );
}