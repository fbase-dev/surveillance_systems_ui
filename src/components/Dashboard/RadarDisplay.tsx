import { useDashboard } from "@/contexts/DashboardContext";
import { BackgroundImage, Card, Container, Popover, Group, Select, Badge, Text, Alert, Button } from "@mantine/core";
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

interface TooltipTarget {
  x: number;
  y: number;
  data: Target;
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

// API Endpoints
const RADAR_ENDPOINTS = {
  AIS: 'https://camera-server-cloud-run-183968704272.us-central1.run.app/ais_data/other',
  OWN: 'https://camera-server-cloud-run-183968704272.us-central1.run.app/ais_data/own',
};

const DUMMY_AIS_DATA = {
  "batch": [
    { "raw": "!AIVDM,1,1,,B,19kP2<?P00PP?OD2f93>4?vp2D1q,018", "decoded": { "msg_type": 1, "repeat": 0, "mmsi": 657982000, "status": 15, "turn": -128.0, "speed": 0.0, "accuracy": true, "lon": 7.043377, "lat": 4.75522, "course": 360.0, "heading": 511, "second": 28, "maneuver": 0, "spare_1": "\x00", "raim": true, "radio": 82041 }, "decode_error": null },
    { "raw": "!AIVDM,1,1,,B,19jmJn8P00PPAcj2fTbqR?w02@BT,073", "decoded": { "msg_type": 1, "repeat": 0, "mmsi": 657283800, "status": 8, "turn": -128.0, "speed": 0.0, "accuracy": true, "lon": 7.050868, "lat": 4.767005, "course": 244.0, "heading": 511, "second": 32, "maneuver": 0, "spare_1": "\x00", "raim": true, "radio": 66724 }, "decode_error": null },
    { "raw": "!AIVDM,1,1,,A,19jbPJ?0000PAi02fUTf436v06:p,073", "decoded": { "msg_type": 1, "repeat": 0, "mmsi": 657105000, "status": 15, "turn": 0.0, "speed": 0.0, "accuracy": false, "lon": 7.051147, "lat": 4.76739, "course": 360.0, "heading": 99, "second": 31, "maneuver": 0, "spare_1": "\x00", "raim": false, "radio": 25272 }, "decode_error": null },
    { "raw": "!AIVDM,1,1,,A,19jjso0P000PD:62h7KHcww62D1S,055", "decoded": { "msg_type": 1, "repeat": 0, "mmsi": 657243100, "status": 0, "turn": -128.0, "speed": 0.0, "accuracy": false, "lon": 7.059312, "lat": 4.809142, "course": 222.3, "heading": 511, "second": 35, "maneuver": 0, "spare_1": "\x00", "raim": true, "radio": 82019 }, "decode_error": null },
    { "raw": "!AIVDM,1,1,,B,19jhnb8000PPEmN2fj:t;FqB08H;,008", "decoded": { "msg_type": 1, "repeat": 0, "mmsi": 657209000, "status": 8, "turn": 0.0, "speed": 0.0, "accuracy": true, "lon": 7.065038, "lat": 4.772765, "course": 311.7, "heading": 220, "second": 41, "maneuver": 0, "spare_1": "\x00", "raim": false, "radio": 34315 }, "decode_error": null },
    { "raw": "!AIVDM,1,1,,B,19je9t00000PEaF2h2moVF3T0D1L,079", "decoded": { "msg_type": 1, "repeat": 0, "mmsi": 657148400, "status": 0, "turn": 0.0, "speed": 0.0, "accuracy": false, "lon": 7.064392, "lat": 4.807185, "course": 194.5, "heading": 193, "second": 50, "maneuver": 0, "spare_1": "\x00", "raim": false, "radio": 82012 }, "decode_error": null },
    { "raw": "!AIVDM,1,1,,B,19jeMo0P000PBMn2fVD>4?wJ2d1n,026", "decoded": { "msg_type": 1, "repeat": 0, "mmsi": 657153500, "status": 0, "turn": -128.0, "speed": 0.0, "accuracy": false, "lon": 7.053538, "lat": 4.767707, "course": 360.0, "heading": 511, "second": 45, "maneuver": 0, "spare_1": "\x00", "raim": true, "radio": 180342 }, "decode_error": null }
  ],
  "timestamp": "2025-09-22T17:47:12Z"
};

const USE_DUMMY_DATA = true;

// AIS Status Codes
const AIS_STATUS = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted maneuverability",
  4: "Constrained by her draught",
  5: "Moored",
  6: "Aground",
  7: "Engaged in fishing",
  8: "Under way sailing",
  9: "Reserved",
  10: "Reserved",
  11: "Power-driven vessel towing astern",
  12: "Power-driven vessel pushing ahead",
  13: "Reserved",
  14: "AIS-SART",
  15: "Undefined"
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
  const [tooltipTarget, setTooltipTarget] = useState<TooltipTarget | null>(null);
  const [aisVessels, setAisVessels] = useState<AISVessel[]>([]);
  const [ownVesselData, setOwnVesselData] = useState<OwnVesselData | null>(null);
  const [radarRange, setRadarRange] = useState<number>(5);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Context
  const { selectedVessel, setSelectedVessel, ownAisData } = useDashboard();

  // Refs
  const intervalRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Process AIS batch data
  const processAISBatch = useCallback((data: any) => {
    if (!data || !data.batch || !Array.isArray(data.batch)) {
      console.warn('Invalid AIS data structure:', data);
      return [];
    }

    return data.batch
      .filter((item: any) => item.decoded && !item.decode_error)
      .map((item: any) => {
        const decoded = item.decoded;
        return {
          mmsi: decoded.mmsi,
          latitude: decoded.lat,
          longitude: decoded.lon,
          speed: decoded.speed,
          course: decoded.course,
          heading: decoded.heading !== 511 ? decoded.heading : undefined, // 511 means heading not available
          status: decoded.status,
          turn: decoded.turn !== -128 ? decoded.turn : undefined, // -128 means turn not available
          accuracy: decoded.accuracy,
          source: 'ais'
        };
      })
      .filter((vessel: AISVessel) =>
        Number.isFinite(vessel.latitude) &&
        Number.isFinite(vessel.longitude) &&
        Math.abs(vessel.latitude) > 0.001 &&
        Math.abs(vessel.longitude) > 0.001
      );
  }, []);

  // API functions
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
        console.warn(`Failed to fetch ${type.toUpperCase()} data: ${response.status} ${response.statusText}`);
        return null;
      }

      const result = await response.json();
      console.log(`${type.toUpperCase()} response:`, result);

      if (type === 'ais') {
        return processAISBatch(result);
      } else {
        // For own vessel data
        return result;
      }
    } catch (error) {
      console.error(`Error fetching ${type.toUpperCase()} data:`, error);
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
    // Only include AIS vessels
    const targets: Target[] = [...aisVessels];

    console.log('All targets computed:', {
      total: targets.length,
      ais: aisVessels.length,
      targets: targets
    });

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

    return {
      centerLat: lat,
      centerLon: lon,
      hasCenter: hasValidCenter,
    };
  }, [hasOwnFix, currentOwnVessel, allTargets]);

  const visibleTargets = useMemo(() => {
    if (!allTargets.length) return [];
    if (!hasCenter) return allTargets;

    const filtered = allTargets.filter((target) => {
      const distance = haversineDistanceNM(centerLat, centerLon, target.latitude, target.longitude);
      return distance <= radarRange;
    });

    console.log('Visible targets computed:', {
      total: allTargets.length,
      visible: filtered.length,
      hasCenter,
      centerLat,
      centerLon,
      radarRange
    });

    return filtered;
  }, [allTargets, hasCenter, centerLat, centerLon, radarRange]);

  // Helper functions
  const getTargetColor = useCallback((target: Target) => {
    const isSelected = selectedVessel &&
      ((selectedVessel as any)?.mmsi) === target.mmsi;

    if (isSelected) return "orange";
    return "#00ff00"; // Green for AIS vessels
  }, [selectedVessel]);

  const getTargetRadius = useCallback(() => {
    return 5; // Standard radius for AIS vessels
  }, []);

  const getStatusDescription = useCallback((status?: number) => {
    if (status === undefined || status === null) return "Unknown";
    return AIS_STATUS[status as keyof typeof AIS_STATUS] || `Status ${status}`;
  }, []);

  const handleTargetClick = useCallback((target: Target, x: number, y: number) => {
    const isSameTarget = tooltipTarget?.data?.mmsi === target.mmsi;

    if (setSelectedVessel) {
      setSelectedVessel(target as any);
    }

    setTooltipTarget(isSameTarget ? null : { x, y, data: target });
  }, [tooltipTarget, setSelectedVessel]);

  useEffect(() => {
    const data = processAISBatch(DUMMY_AIS_DATA);
    setAisVessels(data);
  }, [processAISBatch]);

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
      setLastUpdate(new Date());
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
            label="Range"
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

        <Group gap="md">
          <Text size="xs" c="white">
            AIS: {aisVessels.length}
          </Text>
          {lastUpdate && (
            <Text size="xs" c="white">
              {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </Group>
      </Group>

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

                  // Course vector for AIS targets with valid course and speed
                  let courseVector: { x2: number; y2: number } | null = null;
                  if (Number.isFinite(target.speed) && Number.isFinite(target.course) && target.speed! > 0.1) {
                    const vectorLength = Math.min(target.speed! * 3, 30);
                    const courseRad = toRadians(target.course!);
                    courseVector = {
                      x2: x + vectorLength * Math.sin(courseRad),
                      y2: y - vectorLength * Math.cos(courseRad),
                    };
                  }

                  // Heading vector for AIS targets with valid heading
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
                      {/* Target Circle */}
                      <Circle
                        x={x}
                        y={y}
                        radius={getTargetRadius()}
                        fill={getTargetColor(target)}
                        stroke="#00cc00"
                        strokeWidth={1}
                        onMouseEnter={(e) => setCursor(e.target.getStage(), "pointer")}
                        onMouseLeave={(e) => setCursor(e.target.getStage(), "default")}
                        onClick={() => handleTargetClick(target, x, y)}
                      />

                      {/* Course Vector (green) */}
                      {courseVector && (
                        <Line
                          points={[x, y, courseVector.x2, courseVector.y2]}
                          stroke="#00ff00"
                          strokeWidth={2}
                          lineCap="round"
                        />
                      )}

                      {/* Heading Vector (blue, shorter) */}
                      {headingVector && (
                        <Line
                          points={[x, y, headingVector.x2, headingVector.y2]}
                          stroke="#0088ff"
                          strokeWidth={1}
                          lineCap="round"
                        />
                      )}

                      {/* Target Label */}
                      <KonvaText
                        text={String(targetId)}
                        x={x + 8}
                        y={y - 15}
                        fontSize={9}
                        fill="white"
                        shadowColor="black"
                        shadowBlur={2}
                      />

                      {/* Distance and Bearing */}
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

          {/* Tooltip */}
          {tooltipTarget && (
            <div
              style={{
                position: "absolute",
                top: Math.min(tooltipTarget.y + 40, CANVAS_SIZE - 250), // Prevent overflow
                left: Math.min(tooltipTarget.x + 40, CANVAS_SIZE - 350), // Prevent overflow
                zIndex: 10,
              }}
            >
              <Popover
                opened={!!tooltipTarget}
                onClose={() => setTooltipTarget(null)}
                withArrow
                shadow="lg"
                position="right"
                radius="md"
              >
                <Popover.Target>
                  <div style={{ width: 1, height: 1 }} />
                </Popover.Target>
                <Popover.Dropdown p="md" maw={380}>
                  <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    {/* Header with MMSI and Source */}
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} size="sm" c="blue">
                        {tooltipTarget.data.source?.toUpperCase() ?? "VESSEL"} {tooltipTarget.data.mmsi}
                      </Text>
                      <Badge
                        size="xs"
                        color={tooltipTarget.data.source === 'ais' ? 'green' : 'yellow'}
                        variant="filled"
                      >
                        {tooltipTarget.data.source?.toUpperCase()}
                      </Badge>
                    </Group>

                    {/* AIS Status */}
                    <Group mb="xs">
                      <Text fw={600} size="xs">Status:</Text>
                      <Badge size="xs" variant="light" color="green">
                        {getStatusDescription(tooltipTarget.data.status)}
                      </Badge>
                    </Group>

                    {/* Position Information */}
                    <div style={{ backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                      <Text fw={600} size="xs" mb={4} c="dark">📍 Position</Text>
                      <Group gap="xs" mb={2}>
                        <Text size="xs" w={35} c="dimmed">Lat:</Text>
                        <Text size="xs" fw={500} c="dark">
                          {Number(tooltipTarget.data.latitude ?? tooltipTarget.data.lat).toFixed(6)}°
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="xs" w={35} c="dimmed">Lon:</Text>
                        <Text size="xs" fw={500} c="dark">
                          {Number(tooltipTarget.data.longitude ?? tooltipTarget.data.lon).toFixed(6)}°
                        </Text>
                      </Group>
                      {tooltipTarget.data.accuracy !== undefined && (
                        <Group gap="xs" mt={4}>
                          <Text size="xs" c="dimmed">GPS Accuracy:</Text>
                          <Badge size="xs" color={tooltipTarget.data.accuracy ? "green" : "orange"}>
                            {tooltipTarget.data.accuracy ? "High" : "Low"}
                          </Badge>
                        </Group>
                      )}
                    </div>

                    {/* Distance and Bearing from Own Vessel */}
                    {hasCenter && (
                      <div style={{ backgroundColor: '#e7f5ff', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                        <Text fw={600} size="xs" mb={4} c="blue">🧭 Relative Position</Text>
                        <Group gap="md">
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">Distance:</Text>
                            <Text size="xs" fw={500} c="blue">
                              {haversineDistanceNM(
                                centerLat,
                                centerLon,
                                Number(tooltipTarget.data.latitude ?? tooltipTarget.data.lat),
                                Number(tooltipTarget.data.longitude ?? tooltipTarget.data.lon)
                              ).toFixed(2)} NM
                            </Text>
                          </Group>
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">Bearing:</Text>
                            <Text size="xs" fw={500} c="blue">
                              {bearingFromTo(
                                centerLat,
                                centerLon,
                                Number(tooltipTarget.data.latitude ?? tooltipTarget.data.lat),
                                Number(tooltipTarget.data.longitude ?? tooltipTarget.data.lon)
                              ).toFixed(0)}°
                            </Text>
                          </Group>
                        </Group>
                      </div>
                    )}

                    {/* Navigation Data */}
                    {(Number.isFinite(tooltipTarget.data.speed) || Number.isFinite(tooltipTarget.data.course) || Number.isFinite(tooltipTarget.data.heading)) && (
                      <div style={{ backgroundColor: '#e8f5e8', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                        <Text fw={600} size="xs" mb={4} c="green">Navigation Data</Text>
                        <Group gap="md" mb={4}>
                          {Number.isFinite(tooltipTarget.data.speed) && (
                            <Group gap="xs">
                              <Text size="xs" c="dimmed">Speed:</Text>
                              <Text size="xs" fw={500} c="green">
                                {Number(tooltipTarget.data.speed).toFixed(1)} kts
                              </Text>
                            </Group>
                          )}
                          {Number.isFinite(tooltipTarget.data.course) && (
                            <Group gap="xs">
                              <Text size="xs" c="dimmed">COG:</Text>
                              <Text size="xs" fw={500} c="green">
                                {Number(tooltipTarget.data.course).toFixed(0)}°
                              </Text>
                            </Group>
                          )}
                        </Group>
                        {Number.isFinite(tooltipTarget.data.heading) && (
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">Heading:</Text>
                            <Text size="xs" fw={500} c="green">
                              {Number(tooltipTarget.data.heading).toFixed(0)}°
                            </Text>
                          </Group>
                        )}
                        {Number.isFinite(tooltipTarget.data.turn) && (
                          <Group gap="xs" mt={2}>
                            <Text size="xs" c="dimmed">Turn Rate:</Text>
                            <Text size="xs" fw={500} c="green">
                              {Number(tooltipTarget.data.turn).toFixed(1)}°/min
                            </Text>
                          </Group>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <Group justify="center" mt="sm">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => {
                          if (setSelectedVessel) {
                            setSelectedVessel(tooltipTarget.data as any);
                          }
                          setTooltipTarget(null);
                        }}
                      >
                        Select Vessel
                      </Button>
                    </Group>
                  </div>
                </Popover.Dropdown>
              </Popover>
            </div>
          )}
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