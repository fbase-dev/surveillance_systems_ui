'use client'
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Group, Select, Badge, Alert, BackgroundImage } from "@mantine/core";
import { Stage, Layer, Circle, Line, Text as KonvaText, Shape } from "react-konva";

// Types
interface AISTarget {
  target_number: number;
  mmsi: string;
  name?: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  course?: number;
  ship_type?: number;
  nav_status?: number;
  timestamp?: string;
  source: 'ais';
}

interface OwnVesselData {
  mmsi?: string;
  name?: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  course?: number;
}

interface RadarDisplayProps {
  onTargetSelect?: (target: AISTarget | null) => void;
  onOwnVesselUpdate?: (data: OwnVesselData | null) => void;
}

// Constants
const CANVAS_SIZE = 650;
const SWEEP_SPEED = 60;
const API_POLL_INTERVAL = 3000;

const RADAR_RANGES = [
  { value: "1", label: "1 NM" },
  { value: "2", label: "2 NM" },
  { value: "5", label: "5 NM" },
  { value: "10", label: "10 NM" },
  { value: "20", label: "20 NM" },
];

// Utility functions
const toRadians = (deg: number): number => deg * (Math.PI / 180);

const haversineDistanceNM = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c) / 1852;
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
  const adjustedBearing = bearingDeg - 90;
  const angleRad = toRadians(adjustedBearing);
  const x = canvasSize / 2 + radius * Math.sin(angleRad);
  const y = canvasSize / 2 - radius * Math.cos(angleRad);
  return { x, y };
};

const setCursor = (stage: any, cursor: string) => {
  if (stage?.container()) {
    stage.container().style.cursor = cursor;
  }
};

const RadarDisplay: React.FC<RadarDisplayProps> = ({ onTargetSelect, onOwnVesselUpdate }) => {
  // State
  const [sweepAngle, setSweepAngle] = useState(0);
  const [aisTargets, setAisTargets] = useState<AISTarget[]>([]);
  const [ownVesselData, setOwnVesselData] = useState<OwnVesselData | null>(null);
  const [radarRange, setRadarRange] = useState<number>(5);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<AISTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch AIS data from endpoints
  const fetchAISData = useCallback(async () => {
    const endpoints: Record<string, string> = {
      ais: "/api/ais/other",
      own: "/api/ais_data/own",
    };

    try {
      const entries = Object.entries(endpoints);

      const promises = entries.map(([key, url]) =>
        fetch(url, { cache: "no-cache" })
          .then(async (res) => {
            if (!res.ok) {
              throw new Error(`${key} fetch failed: ${res.status} ${res.statusText}`);
            }
            const json = await res.json();
            const payload = json && typeof json === "object" && "success" in json ? json.data : json;
            return [key, payload] as const;
          })
          .catch((err) => {
            console.warn(`Error fetching ${key}:`, err);
            return [key, null] as const;
          })
      );

      const results = await Promise.all(promises);
      const aisData = Object.fromEntries(results) as {
        ais?: any;
        own?: any;
      };

      // Process AIS targets - handle batch format with deduplication
      if (aisData.ais) {
        // Check if data has a 'batch' array (decoded AIS format)
        let aisArray: any[] = [];
        if (aisData.ais.batch && Array.isArray(aisData.ais.batch)) {
          // Extract only items with valid decoded data
          aisArray = aisData.ais.batch
            .filter((item: any) => item.decoded && !item.decode_error)
            .map((item: any) => item.decoded);
        } else if (Array.isArray(aisData.ais)) {
          aisArray = aisData.ais;
        } else {
          aisArray = [aisData.ais].filter(Boolean);
        }
        
        console.log("AIS Array:", aisArray);
        
        // Process and deduplicate AIS targets (keep most recent per MMSI)
        const targetMap = new Map<string, AISTarget>();
        
        aisArray.forEach((t: any, idx: number) => {
          const processed: AISTarget = {
            target_number: typeof t.target_number === "number" ? t.target_number : idx,
            mmsi: String(t.mmsi || t.MMSI || ''),
            name: t.name || t.vessel_name || t.shipname,
            latitude: Number(t.latitude || t.lat || t.Latitude),
            longitude: Number(t.longitude || t.lon || t.Longitude),
            heading: t.heading !== undefined ? Number(t.heading) : undefined,
            speed: t.speed !== undefined ? Number(t.speed) : (t.sog !== undefined ? Number(t.sog) : undefined),
            course: t.course !== undefined ? Number(t.course) : (t.cog !== undefined ? Number(t.cog) : undefined),
            ship_type: t.ship_type || t.shiptype,
            nav_status: t.nav_status || t.navstat || t.status,
            timestamp: t.timestamp,
            source: "ais",
          };
          
          // Validate target
          const valid = processed.mmsi && 
            Number.isFinite(processed.latitude) && 
            Number.isFinite(processed.longitude) &&
            Math.abs(processed.latitude) > 0.001 && 
            Math.abs(processed.longitude) > 0.001;
          
          if (valid) {
            // Keep the most recent message per MMSI (last one in array wins)
            targetMap.set(processed.mmsi, processed);
          } else {
            console.log("Filtered out invalid target:", processed);
          }
        });
        
        const processedAIS = Array.from(targetMap.values());
        
        console.log("Final unique AIS targets:", processedAIS);
        console.log("Number of unique vessels:", processedAIS.length);
       
        setAisTargets(processedAIS);
      } else {
        setAisTargets([]);
      }

      // Process own vessel data
      if (aisData.own) {
        const own = aisData.own;
        const lat = Number(own.latitude || own.lat || own.Latitude || NaN);
        const lon = Number(own.longitude || own.lon || own.Longitude || NaN);
        
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          const vesselData = {
            mmsi: String(own.mmsi || own.MMSI || ''),
            name: own.name || own.vessel_name || own.shipname,
            latitude: lat,
            longitude: lon,
            heading: Number.isFinite(Number(own.heading || own.true_heading || NaN)) 
              ? Number(own.heading || own.true_heading) 
              : undefined,
            speed: Number.isFinite(Number(own.speed || own.sog || NaN)) 
              ? Number(own.speed || own.sog) 
              : undefined,
            course: Number.isFinite(Number(own.course || own.cog || NaN)) 
              ? Number(own.course || own.cog) 
              : undefined,
          };
          setOwnVesselData(vesselData);
          onOwnVesselUpdate?.(vesselData);
        } else {
          setOwnVesselData(null);
          onOwnVesselUpdate?.(null);
        }
      } else {
        setOwnVesselData(null);
        onOwnVesselUpdate?.(null);
      }

      const anyData = Boolean(aisData.ais || aisData.own);
      setIsConnected(anyData);
      setError(null);
    } catch (err) {
      console.error("AIS API Error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setIsConnected(false);
    }
  }, [onOwnVesselUpdate]);

  // Initial fetch and polling
  useEffect(() => {
    fetchAISData();
    const interval = setInterval(fetchAISData, API_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAISData]);

  // Own vessel position
  const currentOwnVessel: OwnVesselData = useMemo(() => {
    return ownVesselData ?? {
      latitude: NaN,
      longitude: NaN,
      heading: undefined,
    };
  }, [ownVesselData]);

  const hasOwnFix = useMemo(() => {
    return (
      Number.isFinite(currentOwnVessel.latitude) &&
      Number.isFinite(currentOwnVessel.longitude) &&
      !(Math.abs(currentOwnVessel.latitude) < 1e-9 && Math.abs(currentOwnVessel.longitude) < 1e-9)
    );
  }, [currentOwnVessel]);

  // Center position for radar
  const { centerLat, centerLon, hasCenter } = useMemo(() => {
    const lat = hasOwnFix ? currentOwnVessel.latitude : NaN;
    const lon = hasOwnFix ? currentOwnVessel.longitude : NaN;
    const hasValidCenter = Number.isFinite(lat) && Number.isFinite(lon);

    return {
      centerLat: lat,
      centerLon: lon,
      hasCenter: hasValidCenter,
    };
  }, [hasOwnFix, currentOwnVessel]);

  // Visible targets within range
  const visibleTargets = useMemo(() => {
    if (!aisTargets.length || !hasCenter) return [];

    const filtered = aisTargets.filter((target) => {
      const distance = haversineDistanceNM(centerLat, centerLon, target.latitude, target.longitude);
      return distance <= radarRange;
    });

    console.log(`Visible targets: ${filtered.length} of ${aisTargets.length} within ${radarRange} NM`);
    return filtered;
  }, [aisTargets, hasCenter, centerLat, centerLon, radarRange]);

  // Get target color
  const getTargetColor = useCallback((target: AISTarget) => {
    const isSelected = selectedTarget && selectedTarget.mmsi === target.mmsi;
    if (isSelected) return "orange";
    return "#00ffff"; // Cyan for AIS targets
  }, [selectedTarget]);

  // Handle target click
  const handleTargetClick = useCallback((target: AISTarget) => {
    const isSameTarget = selectedTarget?.mmsi === target.mmsi;
    const newSelection = isSameTarget ? null : target;
    setSelectedTarget(newSelection);
    onTargetSelect?.(newSelection);
  }, [selectedTarget, onTargetSelect]);

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 1) % 360);
    }, SWEEP_SPEED);

    return () => clearInterval(interval);
  }, []);

  const handleRangeChange = useCallback((value: string | null) => {
    if (!value) return;
    const nm = Number(value);
    if (Number.isFinite(nm)) {
      setRadarRange(nm);
    }
  }, []);

  // Calculate zoom level based on radar range
  const calculateMapZoom = useCallback((rangeNM: number) => {
    if (rangeNM <= 1) return 15;
    if (rangeNM <= 2) return 14;
    if (rangeNM <= 5) return 13;
    if (rangeNM <= 10) return 12;
    if (rangeNM <= 20) return 11;
    return 10;
  }, []);

  // Map URL generation
  const mapUrl = useMemo(() => {
    const mapKey = process.env.NEXT_PUBLIC_MAP_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_MAP_ID;

    if (!mapKey || !hasCenter) return "";

    const zoom = calculateMapZoom(radarRange);
    return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLon}&zoom=${zoom}&size=${CANVAS_SIZE}x${CANVAS_SIZE}&maptype=satellite&key=${mapKey}${mapId ? `&map_id=${mapId}` : ""}`;
  }, [hasCenter, centerLat, centerLon, radarRange, calculateMapZoom]);

  return (
    <Card p={0} h={CANVAS_SIZE + 100} style={{ backgroundColor: '#030E1B80' }}>
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
            {isConnected ? "AIS Live" : "Disconnected"}
          </Badge>
          <Badge
            color="blue"
            variant="light"
            size="sm"
          >
            {aisTargets.length} Vessels
          </Badge>
        </Group>
      </Group>

      {/* Error Alert */}
      {error && (
        <Alert variant="light" color="red" mx="sm" mb="sm">
          Error: {error}
        </Alert>
      )}

      {/* Radar Display with Map Background */}
      <BackgroundImage
        src={mapUrl || ""}
        style={{
          backgroundColor: "#030E1B80",
          backgroundBlendMode: "overlay"
        }}
      >
        <div style={{ position: "relative", width: CANVAS_SIZE, margin: "auto" }}>
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
                    toRadians(sweepAngle - 30 - 90),
                    toRadians(sweepAngle + 30 - 90)
                  );
                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                fillLinearGradientStartPoint={{ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 }}
                fillLinearGradientEndPoint={{
                  x: CANVAS_SIZE / 25 + (CANVAS_SIZE / 2) * Math.sin(toRadians(sweepAngle - 90)),
                  y: CANVAS_SIZE / 25 - (CANVAS_SIZE / 2) * Math.cos(toRadians(sweepAngle - 90)),
                }}
                fillLinearGradientColorStops={[0, "rgba(0,255,255,0.3)", 1, "rgba(0,255,255,0)"]}
              />

              {/* Center Point (Own Vessel) */}
              <Circle
                x={CANVAS_SIZE / 2}
                y={CANVAS_SIZE / 2}
                radius={6}
                fill="#00ff00"
                stroke="white"
                strokeWidth={2}
                onMouseEnter={(e) => setCursor(e.target.getStage(), "pointer")}
                onMouseLeave={(e) => setCursor(e.target.getStage(), "default")}
                onClick={() => {
                  if (hasOwnFix && ownVesselData) {
                    const ownAsTarget: AISTarget = {
                      target_number: -1,
                      mmsi: ownVesselData.mmsi || 'OWN',
                      name: ownVesselData.name || 'Own Vessel',
                      latitude: ownVesselData.latitude,
                      longitude: ownVesselData.longitude,
                      heading: ownVesselData.heading,
                      speed: ownVesselData.speed,
                      course: ownVesselData.course,
                      source: 'ais',
                    };
                    const isSameTarget = selectedTarget?.mmsi === ownAsTarget.mmsi;
                    const newSelection = isSameTarget ? null : ownAsTarget;
                    setSelectedTarget(newSelection);
                    onTargetSelect?.(newSelection);
                  }
                }}
              />

              {/* Heading Line */}
              {hasOwnFix && Number.isFinite(currentOwnVessel.heading) && (
                <>
                  <Line
                    points={[
                      CANVAS_SIZE / 2,
                      CANVAS_SIZE / 2,
                      CANVAS_SIZE / 2 + 40 * Math.sin(toRadians(currentOwnVessel.heading! - 90)),
                      CANVAS_SIZE / 2 - 40 * Math.cos(toRadians(currentOwnVessel.heading! - 90)),
                    ]}
                    stroke="#00ff00"
                    strokeWidth={3}
                    lineCap="round"
                  />
                  <Circle
                    x={CANVAS_SIZE / 2 + 40 * Math.sin(toRadians(currentOwnVessel.heading! - 90))}
                    y={CANVAS_SIZE / 2 - 40 * Math.cos(toRadians(currentOwnVessel.heading! - 90))}
                    radius={3}
                    fill="#00ff00"
                  />
                </>
              )}

              {/* Own Vessel Label */}
              {hasOwnFix && (
                <KonvaText
                  text={currentOwnVessel.name || "OWN"}
                  x={CANVAS_SIZE / 2 - 15}
                  y={CANVAS_SIZE / 2 + 12}
                  fontSize={10}
                  fill="#00ff00"
                  fontStyle="bold"
                  shadowColor="black"
                  shadowBlur={3}
                />
              )}

              {/* Compass Labels */}
              <KonvaText text="N" x={5} y={CANVAS_SIZE / 2 - 6} fontSize={12} fill="white" fontStyle="bold" />
              <KonvaText text="S" x={CANVAS_SIZE - 15} y={CANVAS_SIZE / 2 - 6} fontSize={12} fill="white" fontStyle="bold" />
              <KonvaText text="W" x={CANVAS_SIZE / 2 - 5} y={CANVAS_SIZE - 18} fontSize={12} fill="white" fontStyle="bold" />
              <KonvaText text="E" x={CANVAS_SIZE / 2 - 5} y={5} fontSize={12} fill="white" fontStyle="bold" />

              {/* AIS Targets */}
              {visibleTargets.map((target, idx) => {
                const distance = haversineDistanceNM(centerLat, centerLon, target.latitude, target.longitude);
                const bearing = bearingFromTo(centerLat, centerLon, target.latitude, target.longitude);
                const coords = polarToCartesian(distance, bearing, radarRange, CANVAS_SIZE);
                const x = coords.x;
                const y = coords.y;

                const uniqueKey = `ais-${target.mmsi}-${idx}`;

                // Course/Speed vector
                let courseVector: { x2: number; y2: number } | null = null;
                if (Number.isFinite(target.speed) && Number.isFinite(target.course) && target.speed! > 0.1) {
                  const vectorLength = Math.min(target.speed! * 3, 30);
                  const courseRad = toRadians(target.course!);
                  courseVector = {
                    x2: x + vectorLength * Math.sin(courseRad),
                    y2: y - vectorLength * Math.cos(courseRad),
                  };
                }

                return (
                  <React.Fragment key={uniqueKey}>
                    {/* Distance line */}
                    <Line
                      points={[CANVAS_SIZE / 2, CANVAS_SIZE / 2, x, y]}
                      stroke={getTargetColor(target)}
                      strokeWidth={0.5}
                      dash={[5, 5]}
                      opacity={0.4}
                    />

                    {/* Target Dot */}
                    <Circle
                      x={x}
                      y={y}
                      radius={6}
                      fill={getTargetColor(target)}
                      stroke="white"
                      strokeWidth={2}
                      onMouseEnter={(e) => setCursor(e.target.getStage(), "pointer")}
                      onMouseLeave={(e) => setCursor(e.target.getStage(), "default")}
                      onClick={() => handleTargetClick(target)}
                    />

                    {/* Course Vector */}
                    {courseVector && (
                      <Line
                        points={[x, y, courseVector.x2, courseVector.y2]}
                        stroke="#00ffff"
                        strokeWidth={2}
                        lineCap="round"
                      />
                    )}

                    {/* Target Label */}
                    <KonvaText
                      text={target.name || `MMSI ${target.mmsi.slice(-4)}`}
                      x={x + 10}
                      y={y - 20}
                      fontSize={9}
                      fill="white"
                      fontStyle="bold"
                      shadowColor="black"
                      shadowBlur={3}
                    />

                    {/* Distance and Bearing */}
                    <KonvaText
                      text={`${distance.toFixed(2)} NM`}
                      x={x + 10}
                      y={y - 8}
                      fontSize={8}
                      fill="#00ffff"
                      shadowColor="black"
                      shadowBlur={2}
                    />
                    
                    <KonvaText
                      text={`${bearing.toFixed(1)}°`}
                      x={x + 10}
                      y={y + 2}
                      fontSize={8}
                      fill="#00ffff"
                      shadowColor="black"
                      shadowBlur={2}
                    />
                  </React.Fragment>
                );
              })}
            </Layer>
          </Stage>
        </div>
      </BackgroundImage>
    </Card>
  );
};

export default RadarDisplay;