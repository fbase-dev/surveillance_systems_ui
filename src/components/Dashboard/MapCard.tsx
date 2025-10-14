import React, { useEffect, useState, useCallback } from "react";
import { Card, Title, Text } from "@mantine/core";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";


interface DashboardLocation {
  latitude: number;
  longitude: number;
}

interface MapCardProps {
  location?: DashboardLocation;
}

// Define a safe fallback location (e.g., San Francisco Bay - a common place with imagery)
const FALLBACK_CENTER = {
  lat: 37.8044, // San Francisco Latitude
  lng: -122.4194, // San Francisco Longitude
};

const MapCard: React.FC<MapCardProps> = ({ location }) => {
  const [vesselPosition, setVesselPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string>("");

  // Load Google Maps API
  // NOTE: Ensure NEXT_PUBLIC_MAP_API_KEY is correctly set in your .env file
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY!,
  });

  // Fetch vessel position
  const fetchVesselPosition = useCallback(async () => {
    try {
      // NOTE: This assumes you have an API route at /api/ais_data/own that returns { success: true, data: { latitude, longitude } }
      const response = await fetch("/api/ais_data/own", { cache: "no-cache" });
      const data = await response.json();

      if (data.success && data.data && typeof data.data.latitude === 'number' && typeof data.data.longitude === 'number') {
        setVesselPosition({
          lat: data.data.latitude,
          lng: data.data.longitude,
        });
        setError("");
      } else {
        // Only set this error if we fail to get position, not if the map is just centered on fallback
        setError("No live vessel position available");
      }
    } catch (err) {
      console.error("Error fetching vessel position:", err);
      setError("Failed to fetch position from API");
    }
  }, []);

  useEffect(() => {
    fetchVesselPosition();

    // Update position every 5 seconds
    const interval = setInterval(fetchVesselPosition, 5000);
    return () => clearInterval(interval);
  }, [fetchVesselPosition]);

  // Use live vessel position, otherwise fall back to context location, otherwise use a safe default
  const displayLocation = vesselPosition || {
    lat: location?.latitude || FALLBACK_CENTER.lat,
    lng: location?.longitude || FALLBACK_CENTER.lng,
  };

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    fullscreenControl: true,
    // Using 'satellite' as intended
    mapTypeId: "roadmap" as google.maps.MapTypeId, 
    tilt: 0,
  };

  return (
    <Card
      h="40vh"
      p={0}
      pos="relative"
   
      withBorder 
      style={{ cursor: "pointer", overflow: "hidden" }} 
    >
      <Title
        order={3}
        pos="absolute"
        top={5}
        left={10}
        style={{ zIndex: 1, backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px" }}
        m={0}
        c="white"
      >
        Vessel Map
      </Title>

      {error && (
        <Text
          pos="absolute"
          top={35}
          left={10}
          style={{ zIndex: 1, backgroundColor: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: "4px" }}
          size="xs"
          c="yellow"
        >
          {error}
        </Text>
      )}
      
     
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={displayLocation}
          zoom={7}
          options={mapOptions} 
        >
          {/* Vessel marker */}
          <Marker
            position={displayLocation}
          
            icon={vesselPosition ? {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#00ff00",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8,
            } : undefined} 
          />
        </GoogleMap>
      ) : (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1a1a1a",
            color: "white",
          }}
        >
          Loading map...
        </div>
      )}
    </Card>
  );
};

export default MapCard;