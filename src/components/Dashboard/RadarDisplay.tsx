import { useDashboard } from "@/contexts/DashboardContext";
import { BackgroundImage, Card, Container, Group, Select, Badge, Alert } from "@mantine/core";
import Konva from "konva";
import dynamic from "next/dynamic";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Stage, Layer, Circle, Line, Text as KonvaText, Shape } from "react-konva";

// Types
interface AISVessel {
  mmsi: number;
  latitude: number;
  longitude: number;
  speed?: number;
  course?: number;
  heading?: number;
  status?: number;
  turn?: number;
  accuracy?: boolean;
  source: string;
}

interface OwnVesselData {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  course?: number;
}

interface Target extends AISVessel {
  lat?: number;
  lon?: number;
}

// Constants
const CANVAS_SIZE = 650;
const SWEEP_SPEED = 60; // milliseconds
const FETCH_INTERVALS = {
  AIS: 3000,
  OWN: 2000,
} as const;

const RADAR_RANGES = [
  { value: "1", label: "1 NM" },
  { value: "2", label: "2 NM" },
  { value: "5", label: "5 NM" },
  { value: "10", label: "10 NM" },
  { value: "20", label: "20 NM" },
];

// Updated API Endpoints - Using Next.js API routes
const RADAR_ENDPOINTS = {
  AIS: '/api/ais/other',
  OWN: '/api/ais_data/own',
};

// Utility functions
const toRadians = (deg: number): number => deg * (Math.PI / 180);

const haversineDistanceNM = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c) / 1852; // Convert meters to nautical miles
};

const bearingFromTo = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x);
  θ = (θ * 180) / Math.PI;
  return (θ + 360) % 360;
};

const polarToCartesian = (
  distanceNM: number,
  bearingDeg: number,
  maxRangeNM: number,
  canvasSize = CANVAS_SIZE
) => {
  const radius = (distanceNM / maxRangeNM) * (canvasSize / 2);
  const angleRad = toRadians(bearingDeg);
  const x = canvasSize / 2 + radius * Math.sin(angleRad);
  const y = canvasSize / 2 - radius * Math.cos(angleRad);
  return { x, y };
};

const setCursor = (stage: Konva.Stage | null, cursor: string) => {
  if (stage?.container()) {
    stage.container().style.cursor = cursor;
  }
};

const RadarDisplay: React.FC = () => {
  // State
  const [sweepAngle, setSweepAngle] = useState(0);
  const [aisVessels, setAisVessels] = useState<AISVessel[]>([]);
  const [ownVesselData, setOwnVesselData] = useState<OwnVesselData | null>(null);
  const [radarRange, setRadarRange] = useState<number>(5);
  const [isConnected, setIsConnected] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Context
  const { selectedVessel, setSelectedVessel, ownAisData } = useDashboard();

  // Refs
  const intervalRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Process AIS batch data - UPDATED to handle multiple formats
  const processAISBatch = useCallback((data: any) => {
    console.log('Processing AIS data, type:', typeof data, 'isArray:', Array.isArray(data));
    
    let items: any[] = [];
    
    // Format 1: { batch: [...] } - original format
    if (data?.batch && Array.isArray(data.batch)) {
      console.log('Format: batch array with', data.batch.length, 'items');
      items = data.batch
        .filter((item: any) => item.decoded && !item.decode_error)
        .map((item: any) => item.decoded);
    }
    // Format 2: Direct array of vessels
    else if (Array.isArray(data)) {
      console.log('Format: direct array with', data.length, 'items');
      items = data;
    }
    // Format 3: Single vessel object
    else if (data && typeof data === 'object') {
      console.log('Format: single object');
      items = [data];
    }
    else {
      console.warn('Invalid AIS data structure:', data);
      return [];
    }

    // Map to standard format
    const vessels = items.map((item: any) => {
      // Handle both nested and flat structures
      const vessel = item.decoded || item;
      
      return {
        mmsi: vessel.mmsi,
        latitude: vessel.lat || vessel.latitude,
        longitude: vessel.lon || vessel.longitude,
        speed: vessel.speed,
        course: vessel.course,
        heading: vessel.heading !== 511 ? vessel.heading : undefined,
        status: vessel.status,
        turn: vessel.turn !== -128 ? vessel.turn : undefined,
        accuracy: vessel.accuracy,
        source: 'ais'
      };
    });

    // Filter valid vessels (RELAXED validation)
    const validVessels = vessels.filter((vessel: AISVessel) => {
      const hasMMSI = vessel.mmsi && vessel.mmsi > 0;
      const hasValidLat = Number.isFinite(vessel.latitude) && Math.abs(vessel.latitude) <= 90;
      const hasValidLon = Number.isFinite(vessel.longitude) && Math.abs(vessel.longitude) <= 180;
      
      return hasMMSI && hasValidLat && hasValidLon;
    });

    console.log('Processed', validVessels.length, 'valid vessels from', vessels.length, 'total');
    if (validVessels.length > 0) {
      console.log('Sample vessel:', validVessels[0]);
    }
    
    return validVessels;
  }, []);

  // API functions - Updated to use Next.js API routes
  const fetchRadarData = useCallback(async (type: 'ais' | 'own') => {
    try {
      let endpoint: string;

      switch (type) {
        case 'ais':
          endpoint = RADAR_ENDPOINTS.AIS;
          break;
        case 'own':
          endpoint = RADAR_ENDPOINTS.OWN;
          break;
        default:
          throw new Error(`Unknown radar data type: ${type}`);
      }

      console.log(`Fetching ${type.toUpperCase()} data from:`, endpoint);
      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Failed to fetch ${type.toUpperCase()} data:`, errorData);
        setApiError(`${type.toUpperCase()} API Error: ${response.status}`);
        return null;
      }

      const result = await response.json();
      console.log(`${type.toUpperCase()} response:`, result);

      // Clear any previous errors on success
      setApiError(null);

      if (type === 'ais') {
        return processAISBatch(result);
      } else {
        // For own vessel data
        return result;
      }
    } catch (error) {
      console.error(`Error fetching ${type.toUpperCase()} data:`, error);
      setApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown'}`);
      return null;
    }
  }, [processAISBatch]);

  // Computed values
  const contextOwn = useMemo(() => {
    const lat = Number(ownAisData?.lat);
    const lon = Number(ownAisData?.lon);
    const heading = Number(ownAisData?.heading);

    return {
      latitude: Number.isFinite(lat) ? lat : undefined,
      longitude: Number.isFinite(lon) ? lon : undefined,
      heading: Number.isFinite(heading) ? heading : undefined,
    };
  }, [ownAisData]);

  const currentOwnVessel: OwnVesselData = useMemo(() => {
    return ownVesselData ?? {
      latitude: contextOwn.latitude ?? NaN,
      longitude: contextOwn.longitude ?? NaN,
      heading: contextOwn.heading,
    };
  }, [ownVesselData, contextOwn]);

  const allTargets = useMemo(() => {
    const targets: Target[] = [...aisVessels];
    console.log('All targets:', targets.length);
    return targets;
  }, [aisVessels]);

  const hasOwnFix = useMemo(() => {
    return (
      Number.isFinite(currentOwnVessel.latitude) &&
      Number.isFinite(currentOwnVessel.longitude) &&
      !(Math.abs(currentOwnVessel.latitude) < 1e-9 && Math.abs(currentOwnVessel.longitude) < 1e-9)
    );
  }, [currentOwnVessel]);

  const { centerLat, centerLon, hasCenter } = useMemo(() => {
    const lat = hasOwnFix ? currentOwnVessel.latitude : allTargets[0]?.latitude ?? NaN;
    const lon = hasOwnFix ? currentOwnVessel.longitude : allTargets[0]?.longitude ?? NaN;
    const hasValidCenter = Number.isFinite(lat) && Number.isFinite(lon);

    console.log('Center Position:', {
      hasOwnFix,
      lat,
      lon,
      hasValidCenter,
      totalTargets: allTargets.length
    });

    return {
      centerLat: lat,
      centerLon: lon,
      hasCenter: hasValidCenter,
    };
  }, [hasOwnFix, currentOwnVessel, allTargets]);

  const visibleTargets = useMemo(() => {
    if (!allTargets.length) {
      console.log('No targets available');
      return [];
    }
    
    if (!hasCenter) {
      console.log('No center position, showing all targets');
      return allTargets;
    }

    const filtered = allTargets.filter((target) => {
      const distance = haversineDistanceNM(centerLat, centerLon, target.latitude, target.longitude);
      return distance <= radarRange;
    });

    console.log(`Visible targets: ${filtered.length}/${allTargets.length} (Range: ${radarRange} NM)`);
    return filtered;
  }, [allTargets, hasCenter, centerLat, centerLon, radarRange]);

  // Helper functions
  const getTargetColor = useCallback((target: Target) => {
    const isSelected = selectedVessel &&
      ((selectedVessel as any)?.mmsi) === target.mmsi;

    if (isSelected) return "orange";
    return "#00ff00";
  }, [selectedVessel]);

  const getTargetRadius = useCallback(() => {
    return 5;
  }, []);

  const handleTargetClick = useCallback((target: Target) => {
    if (setSelectedVessel) {
      setSelectedVessel(target as any);
    }
  }, [setSelectedVessel]);

  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 1) % 360);
    }, SWEEP_SPEED);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(true);
    
    };

    const handleError = () => {
      setIsConnected(false);
    };

    // Initial data fetch
    const initializeData = async () => {
      try {
        const [ais, own] = await Promise.all([
          fetchRadarData('ais'),
          fetchRadarData('own')
        ]);

        if (ais) setAisVessels(Array.isArray(ais) ? ais : [ais]);
        if (own) setOwnVesselData(own);

        updateConnectionStatus();
      } catch (error) {
        console.error("Error initializing radar data:", error);
        handleError();
      }
    };

    initializeData();

    // AIS data interval
    intervalRefs.current.ais = setInterval(async () => {
      try {
        const data = await fetchRadarData('ais');
        if (data) {
          setAisVessels(Array.isArray(data) ? data : [data]);
          updateConnectionStatus();
        }
      } catch (error) {
        console.error("Error fetching AIS data:", error);
        handleError();
      }
    }, FETCH_INTERVALS.AIS);

    // Own vessel data interval
    intervalRefs.current.own = setInterval(async () => {
      try {
        const data = await fetchRadarData('own');
        if (data) {
          setOwnVesselData(data);
          updateConnectionStatus();
        }
      } catch (error) {
        console.error("Error fetching own vessel data:", error);
        handleError();
      }
    }, FETCH_INTERVALS.OWN);

    // Cleanup
    return () => {
      Object.values(intervalRefs.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
      intervalRefs.current = {};
    };
  }, [fetchRadarData]);

  // Map URL generation
  const mapUrl = useMemo(() => {
    const mapKey = process.env.NEXT_PUBLIC_MAP_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_MAP_ID;

    if (!mapKey || !hasCenter) return "";

    return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLon}&zoom=13&size=${CANVAS_SIZE}x${CANVAS_SIZE}&maptype=roadmap&key=${mapKey}${mapId ? `&map_id=${mapId}` : ""}`;
  }, [hasCenter, centerLat, centerLon]);

  const handleRangeChange = useCallback((value: string | null) => {
    if (!value) return;
    const nm = Number(value);
    if (Number.isFinite(nm)) {
      setRadarRange(nm);
    }
  }, []);

  return (
    <Card p={0} h={CANVAS_SIZE + 60} bg="#030E1B80">
      {/* Control Panel */}
      <Group justify="space-between" align="center" p="sm">
        <Group gap="md">
          <Select
            value={String(radarRange)}
            onChange={handleRangeChange}
            data={RADAR_RANGES}
            size="xs"
            w={110}
          />
          <Badge
            color={isConnected ? "green" : "red"}
            variant="filled"
            size="sm"
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </Group>

        
      </Group>

      {/* API Error Alert */}
      {apiError && (
        <Alert variant="light" color="red" mx="sm" mb="sm">
          {apiError}
        </Alert>
      )}

      {/* Radar Display */}
      <BackgroundImage
        src={mapUrl || ""}
        style={{
          backgroundColor: "#030E1B80",
          backgroundBlendMode: "overlay"
        }}
        my="auto"
      >
        <div style={{ position: "relative", width: CANVAS_SIZE, margin: "auto" }}>
          <Container p={0}>
            <Stage width={CANVAS_SIZE} height={CANVAS_SIZE}>
              <Layer>
                {/* Range Rings */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <Circle
                    key={`ring-${i}`}
                    x={CANVAS_SIZE / 2}
                    y={CANVAS_SIZE / 2}
                    radius={(i * CANVAS_SIZE) / 10}
                    stroke="#EDF4FD"
                    strokeWidth={0.5}
                  />
                ))}

                {/* Cross Lines */}
                <Line
                  points={[CANVAS_SIZE / 2, 0, CANVAS_SIZE / 2, CANVAS_SIZE]}
                  stroke="white"
                  strokeWidth={1}
                />
                <Line
                  points={[0, CANVAS_SIZE / 2, CANVAS_SIZE, CANVAS_SIZE / 2]}
                  stroke="white"
                  strokeWidth={1}
                />

                {/* Range Labels */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <KonvaText
                    key={`label-${i}`}
                    text={`${(radarRange * i) / 5} NM`}
                    x={CANVAS_SIZE / 2 + 5}
                    y={CANVAS_SIZE / 2 - (i * CANVAS_SIZE) / 10 - 5}
                    fontSize={8}
                    fill="white"
                  />
                ))}

                {/* Radar Sweep */}
                <Shape
                  sceneFunc={(context, shape) => {
                    context.beginPath();
                    context.moveTo(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
                    context.arc(
                      CANVAS_SIZE / 2,
                      CANVAS_SIZE / 2,
                      CANVAS_SIZE / 2,
                      toRadians(sweepAngle - 30),
                      toRadians(sweepAngle + 30)
                    );
                    context.closePath();
                    context.fillStrokeShape(shape);
                  }}
                  fillLinearGradientStartPoint={{ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 }}
                  fillLinearGradientEndPoint={{
                    x: CANVAS_SIZE / 25 + (CANVAS_SIZE / 2) * Math.sin(toRadians(sweepAngle)),
                    y: CANVAS_SIZE / 25 - (CANVAS_SIZE / 2) * Math.cos(toRadians(sweepAngle)),
                  }}
                  fillLinearGradientColorStops={[0, "rgba(0,255,0,0.4)", 1, "rgba(0,255,0,0)"]}
                />

                {/* Center Point (Own Vessel) */}
                <Circle
                  x={CANVAS_SIZE / 2}
                  y={CANVAS_SIZE / 2}
                  radius={4}
                  fill="white"
                />

                {/* Heading Line */}
                {hasOwnFix && Number.isFinite(currentOwnVessel.heading) && (
                  <Line
                    points={[
                      CANVAS_SIZE / 2,
                      CANVAS_SIZE / 2,
                      CANVAS_SIZE / 2 + 30 * Math.sin(toRadians(currentOwnVessel.heading!)),
                      CANVAS_SIZE / 2 - 30 * Math.cos(toRadians(currentOwnVessel.heading!)),
                    ]}
                    stroke="white"
                    strokeWidth={2}
                  />
                )}

                {/* Compass Labels */}
                <KonvaText text="N" x={CANVAS_SIZE / 2 - 5} y={0} fontSize={10} fill="white" />
                <KonvaText text="S" x={CANVAS_SIZE / 2 - 5} y={CANVAS_SIZE - 12} fontSize={10} fill="white" />
                <KonvaText text="W" x={0} y={CANVAS_SIZE / 2 - 5} fontSize={10} fill="white" />
                <KonvaText text="E" x={CANVAS_SIZE - 10} y={CANVAS_SIZE / 2 - 5} fontSize={10} fill="white" />

                {/* Targets */}
                {visibleTargets.map((target, idx) => {
                  const lat = Number(target.latitude);
                  const lon = Number(target.longitude);

                  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

                  const distance = hasCenter ? haversineDistanceNM(centerLat, centerLon, lat, lon) : 0;
                  const bearing = hasCenter ? bearingFromTo(centerLat, centerLon, lat, lon) : 0;

                  const { x, y } = hasCenter
                    ? polarToCartesian(distance, bearing, radarRange, CANVAS_SIZE)
                    : { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

                  const targetId = target.mmsi || `${target.source?.toUpperCase()}-${idx}`;
                  const uniqueKey = `${target.source}-${targetId}-${idx}`;

                  let courseVector: { x2: number; y2: number } | null = null;
                  if (Number.isFinite(target.speed) && Number.isFinite(target.course) && target.speed! > 0.1) {
                    const vectorLength = Math.min(target.speed! * 3, 30);
                    const courseRad = toRadians(target.course!);
                    courseVector = {
                      x2: x + vectorLength * Math.sin(courseRad),
                      y2: y - vectorLength * Math.cos(courseRad),
                    };
                  }

                  let headingVector: { x2: number; y2: number } | null = null;
                  if (Number.isFinite(target.heading)) {
                    const headingLength = 15;
                    const headingRad = toRadians(target.heading!);
                    headingVector = {
                      x2: x + headingLength * Math.sin(headingRad),
                      y2: y - headingLength * Math.cos(headingRad),
                    };
                  }

                  return (
                    <React.Fragment key={uniqueKey}>
                      <Circle
                        x={x}
                        y={y}
                        radius={getTargetRadius()}
                        fill={getTargetColor(target)}
                        stroke="#00cc00"
                        strokeWidth={1}
                        onMouseEnter={(e) => setCursor(e.target.getStage(), "pointer")}
                        onMouseLeave={(e) => setCursor(e.target.getStage(), "default")}
                        onClick={() => handleTargetClick(target)}
                      />

                      {courseVector && (
                        <Line
                          points={[x, y, courseVector.x2, courseVector.y2]}
                          stroke="#00ff00"
                          strokeWidth={2}
                          lineCap="round"
                        />
                      )}

                      {headingVector && (
                        <Line
                          points={[x, y, headingVector.x2, headingVector.y2]}
                          stroke="#0088ff"
                          strokeWidth={1}
                          lineCap="round"
                        />
                      )}

                      <KonvaText
                        text={String(targetId)}
                        x={x + 8}
                        y={y - 15}
                        fontSize={9}
                        fill="white"
                        shadowColor="black"
                        shadowBlur={2}
                      />

                      {hasCenter && (
                        <KonvaText
                          text={`${distance.toFixed(1)}NM ${bearing.toFixed(0)}°`}
                          x={x + 8}
                          y={y - 5}
                          fontSize={8}
                          fill="#00ff00"
                          shadowColor="black"
                          shadowBlur={2}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </Container>
        </div>
      </BackgroundImage>

      {/* No Targets Alert */}
      {!visibleTargets.length && (
        <Alert variant="light" color="gray" mt="sm" mx="sm">
          No vessels to display yet.{" "}
          {hasCenter ? "Try increasing the range or wait for AIS data." : "Waiting for own vessel position fix or AIS data."}
        </Alert>
      )}
    </Card>
  );
};

export default dynamic(() => Promise.resolve(RadarDisplay), { ssr: false });