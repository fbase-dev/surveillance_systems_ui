import { useEffect, useRef, useState } from "react";
import { Card } from "@mantine/core";
import { useTargetLocation } from "@/hooks/useTargetLocation";
import { useJsApiLoader } from "@react-google-maps/api";
import { useDashboard } from "@/contexts/DashboardContext";

export default function VesselsMap() {
  const { targetLocations } = useTargetLocation();
  const { ownAisData } = useDashboard();
  const { lat, lon, heading } = ownAisData;

  type Poi = {
    key: string;
    location: google.maps.LatLngLiteral;
    target_number: number;
    direction: string;
  };

  const locations: Poi[] = targetLocations.map((target, index) => ({
    key: `${index}`,
    location: {
      lat: Number(target.lat),
      lng: Number(target.lon),
    },
    direction: `${target.lat_dir} ${target.lon_dir}`,
    target_number: target.target_number,
  }));

  const otherVesselSvgString = `<svg  xmlns="http://www.w3.org/2000/svg"  width="40"  height="40"  viewBox="0 0 40 40"  fill="none"  stroke="#14B8FF"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-ship"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1" /><path d="M4 18l-1 -5h18l-2 4" /><path d="M5 13v-6h8l4 6" /><path d="M7 7v-4h-1" /></svg>`

  const ownVesselSvgString = `<svg  xmlns="http://www.w3.org/2000/svg"  width="40"  height="40"  viewBox="0 0 40 40"  fill="none"  stroke="#4ECB71"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-ship"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1" /><path d="M4 18l-1 -5h18l-2 4" /><path d="M5 13v-6h8l4 6" /><path d="M7 7v-4h-1" /></svg>`


  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const [selectedMarker, setSelectedMarker] = useState<null | Poi>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );
  console.log(selectedMarker, infoWindow);
  

  const { isLoaded } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY as string,
  });

  useEffect(() => {
    if (!isLoaded || !window.google) return;

    const parser = new DOMParser();
    const ownVesselSvg = parser.parseFromString(
        ownVesselSvgString,
        "image/svg+xml"
    ).documentElement;
    const otherVesselSvg = parser.parseFromString(
      otherVesselSvgString,
      "image/svg+xml"
    ).documentElement;

    async function initializeMap() {
      try {
        const { Map, InfoWindow } = (await google.maps.importLibrary(
          "maps"
        )) as google.maps.MapsLibrary;
        const { AdvancedMarkerElement } = (await google.maps.importLibrary(
          "marker"
        )) as google.maps.MarkerLibrary;

        const mapElement = document.getElementById("map") as HTMLElement;
        if (!mapElement) return;

        // Center map on own vessel position
        const map = new Map(mapElement, {
          zoom: 16,
          center: { lat: lat || 0, lng: lon || 0 },
          mapId: process.env.NEXT_PUBLIC_MAP_ID,
          disableDefaultUI: true,
          clickableIcons: false,
          fullscreenControl: true,
        });

        mapRef.current = map;

        const infoWin = new InfoWindow({ content: "", disableAutoPan: true });
        setInfoWindow(infoWin);

        // Other vessel markers
        const markers = locations.map((poi) => {
          const marker = new AdvancedMarkerElement({
            position: poi.location,
            map, 
            content: otherVesselSvg.cloneNode(true),
          });

          marker.addListener("click", () => {
            setSelectedMarker(poi);
            infoWin.setHeaderContent(``);
            infoWin.setContent(`
                <div style="color: #030E1B;">
                    <p> <span style="font-weight: bold;">Target:</span> # ${poi.target_number.toString()} </p>
                    <p> <span style="font-weight: bold;">Latitude:</span> ${poi.location.lat} </p>
                    <p> <span style="font-weight: bold;">Longitude:</span> ${poi.location.lng} </p>
                    <p> <span style="font-weight: bold;">Direction:</span> ${poi.direction} </p>
                </div>
                `);
            infoWin.open(map, marker);
          });

          return marker;
        });

        // Add own vessel marker (if lat/lon exist)
        if (lat && lon) {
          const ownVesselMarker = new AdvancedMarkerElement({
            position: { lat, lng: lon },
            map,
            content: ownVesselSvg.cloneNode(true),
          });
          ownVesselMarker.addListener("click", () => {
            infoWin.setHeaderContent(``);
            infoWin.setContent(`
                <h4 style="color: #030E1B;">Own Vessel</h4>
                <div style="color: #030E1B;">
                    <p> <span style="font-weight: bold;">Latitude:</span> ${lat} </p>
                    <p> <span style="font-weight: bold;">Longitude:</span> ${lon} </p>
                    <p> <span style="font-weight: bold;">Heading:</span> ${heading} </p>
                </div>
                `);
            infoWin.open(map, ownVesselMarker);
          });
          markers.push(ownVesselMarker);
        }

        markersRef.current = markers;
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
      }
    }

    initializeMap();
  }, [isLoaded, targetLocations, lon, lat]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Card
      bd={"1px solid var(--app-shell-border-color)"}
      bg={"rgba(3, 14, 27, 0.898)"}
      p={0}
      h={"87vh"}
      pos={"relative"}
    >
      <div id="map" style={{ width: "100%", height: "100%" }}></div>
    </Card>
  );
}
