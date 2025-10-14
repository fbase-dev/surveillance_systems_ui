'use client'
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card,  Group, Select, Badge, Alert } from "@mantine/core";
import { Stage, Layer, Circle, Line, Text as KonvaText, Shape } from "react-konva";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

// Types
interface TTMTarget {
  target_number: number;
  distance: number;
  bearing: number;
  speed: number;
  course: number;
  cpa?: number;
  tcpa?: number;
  status?: string;
  reference?: string;
  latitude?: number;
  longitude?: number;
  source: 'ttm';
}

interface TLLTarget {
  target_number: number;
  latitude: number;
  longitude: number;
  label?: string;
  timestamp?: string;
  source: 'tll';
}

interface OwnVesselData {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  course?: number;
}

interface RadarDisplayProps {
  onTargetSelect?: (target: TTMTarget | TLLTarget | null) => void;
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
  const [ttmTargets, setTtmTargets] = useState<TTMTarget[]>([]);
  const [tllTargets, setTllTargets] = useState<TLLTarget[]>([]);
  const [ownVesselData, setOwnVesselData] = useState<OwnVesselData | null>(null);
  const [radarRange, setRadarRange] = useState<number>(5);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<TTMTarget | TLLTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Google Maps API loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY!,
  });

  // Fetch radar data from dedicated endpoints in parallel
  const fetchRadarData = useCallback(async () => {
    const endpoints: Record<string, string> = {
      ttm: "/api/tracking_data",
      tll: "/api/target_location_batch",
      own: "/api/radar/own",
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
      const radarData = Object.fromEntries(results) as {
        ttm?: any;
        tll?: any;
        own?: any;
      };

      // Process TTM
      if (radarData.ttm) {
        const ttmArray = Array.isArray(radarData.ttm) ? radarData.ttm : [radarData.ttm].filter(Boolean);
        const processedTTM: TTMTarget[] = ttmArray
          .map((t: any) => ({
            ...t,
            latitude: t.latitude !== undefined ? Number(t.latitude) : undefined,
            longitude: t.longitude !== undefined ? Number(t.longitude) : undefined,
            distance: t.distance !== undefined ? Number(t.distance) : NaN,
            bearing: t.bearing !== undefined ? Number(t.bearing) : NaN,
            speed: t.speed !== undefined ? Number(t.speed) : NaN,
            course: t.course !== undefined ? Number(t.course) : NaN,
            source: "ttm" as const,
          }))
          .filter((t: any) => {
            const hasDist = Number.isFinite(t.distance);
            const hasLatLon = Number.isFinite(t.latitude) && Number.isFinite(t.longitude);
            return hasDist || hasLatLon;
          });
        setTtmTargets(processedTTM);
      } else {
        setTtmTargets([]);
      }

      // Process TLL
      if (radarData.tll) {
        const tllArray = Array.isArray(radarData.tll) ? radarData.tll : [radarData.tll].filter(Boolean);
        const processedTLL: TLLTarget[] = tllArray
          .map((t: any) => ({
            ...t,
            latitude: Number(t.latitude),
            longitude: Number(t.longitude),
            target_number: Number(t.target_number ?? t.id ?? 0),
            label: t.label,
            timestamp: t.timestamp,
            source: "tll" as const,
          }))
          .filter((t: any) => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));
        setTllTargets(processedTLL);
      } else {
        setTllTargets([]);
      }

      // Process OWN
      if (radarData.own) {
        const own = radarData.own;
        const lat = Number(own.latitude ?? own.lat ?? NaN);
        const lon = Number(own.longitude ?? own.lon ?? NaN);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          const vesselData = {
            latitude: lat,
            longitude: lon,
            heading: Number.isFinite(Number(own.heading ?? own.course ?? own.true_course ?? NaN))
              ? Number(own.heading ?? own.course ?? own.true_course)
              : undefined,
            speed: Number.isFinite(Number(own.speed ?? own.spd_over_grnd_knots ?? NaN))
              ? Number(own.speed ?? own.spd_over_grnd_knots)
              : undefined,
            course: Number.isFinite(Number(own.course ?? own.true_course ?? NaN))
              ? Number(own.course ?? own.true_course)
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

      const anyData = Boolean(radarData.ttm || radarData.tll || radarData.own);
      setIsConnected(anyData);
      setError(null);
    } catch (err) {
      console.error("Radar API Error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setIsConnected(false);
    }
  }, [onOwnVesselUpdate]);

  // Initial fetch and polling
  useEffect(() => {
    fetchRadarData();
    const interval = setInterval(fetchRadarData, API_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRadarData]);

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

  // Combine all targets
  const allTargets = useMemo(() => {
    const targets: Array<TTMTarget | TLLTarget> = [...ttmTargets, ...tllTargets];
    return targets;
  }, [ttmTargets, tllTargets]);

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

  // Calculate map zoom based on radar range
  const calculateMapZoom = useCallback((rangeNM: number) => {
    if (rangeNM <= 1) return 9;
    if (rangeNM <= 2) return 8;
    if (rangeNM <= 5) return 7;
    if (rangeNM <= 10) return 6;
    if (rangeNM <= 20) return 5;
    return 10;
  }, []);

  const zoom = calculateMapZoom(radarRange);

  // Visible targets within range
  const visibleTargets = useMemo(() => {
    if (!allTargets.length) return [];

    const filtered = allTargets.filter((target) => {
      if (target.source === 'ttm') {
        const ttmTarget = target as TTMTarget;
        if (Number.isFinite(ttmTarget.distance)) {
          return ttmTarget.distance <= radarRange;
        }
        if (hasCenter && Number.isFinite(ttmTarget.latitude) && Number.isFinite(ttmTarget.longitude)) {
          const distance = haversineDistanceNM(centerLat, centerLon, ttmTarget.latitude!, ttmTarget.longitude!);
          return distance <= radarRange;
        }
        return false;
      } else if (target.source === 'tll' && hasCenter) {
        const tllTarget = target as TLLTarget;
        const distance = haversineDistanceNM(centerLat, centerLon, tllTarget.latitude, tllTarget.longitude);
        return distance <= radarRange;
      }
      return false;
    });

    return filtered;
  }, [allTargets, hasCenter, centerLat, centerLon, radarRange]);

  // Get target color
  const getTargetColor = useCallback((target: TTMTarget | TLLTarget) => {
    const isSelected = selectedTarget &&
      selectedTarget.target_number === target.target_number &&
      selectedTarget.source === target.source;

    if (isSelected) return "orange";
    return target.source === 'ttm' ? "#ff00ff" : "#00ffff";
  }, [selectedTarget]);

  // Handle target click
  const handleTargetClick = useCallback((target: TTMTarget | TLLTarget) => {
    const isSameTarget = selectedTarget?.target_number === target.target_number &&
      selectedTarget?.source === target.source;

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
            {isConnected ? "Live Data" : "Disconnected"}
          </Badge>
          <Badge color="blue">{allTargets.length} Targets</Badge>
        </Group>
      </Group>

      {/* Error Alert */}
      {error && (
        <Alert variant="light" color="red" mx="sm" mb="sm">
          Error: {error}
        </Alert>
      )}

      {/* Radar Display with Live Map Background */}
      <div style={{ position: "relative", width: CANVAS_SIZE, margin: "auto" }}>
        {/* Live Google Map Background */}
        {isLoaded && hasCenter && (
          <div style={{
            position: "absolute",
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
           
            borderRadius: 12,
            overflow: "hidden"
          }}>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={{ lat: centerLat, lng: centerLon }}
              zoom={zoom}
            
              options={{
                disableDefaultUI: true,
                tilt: 0,
                heading: 0,
              }}
            />
          </div>
        )}

        {/* Radar Overlay */}
        <Stage width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ position: "relative", zIndex: 100 }}>
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
                  toRadians(sweepAngle - 120),
                  toRadians(sweepAngle - 60)
                );
                context.closePath();
                context.fillStrokeShape(shape);
              }}
              fillLinearGradientStartPoint={{ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 }}
              fillLinearGradientEndPoint={{
                x: CANVAS_SIZE / 2 + (CANVAS_SIZE / 2) * Math.sin(toRadians(sweepAngle - 90)),
                y: CANVAS_SIZE / 2 - (CANVAS_SIZE / 2) * Math.cos(toRadians(sweepAngle - 90)),
              }}
              fillLinearGradientColorStops={[0, "rgba(255,0,255,0.3)", 1, "rgba(255,0,255,0)"]}
            />

            {/* Center Point (Own Vessel) - Clickable */}
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
                  const ownAsTarget: TTMTarget = {
                    target_number: -1,
                    distance: 0,
                    bearing: ownVesselData.heading || 0,
                    speed: ownVesselData.speed || 0,
                    course: ownVesselData.course || ownVesselData.heading || 0,
                    latitude: ownVesselData.latitude,
                    longitude: ownVesselData.longitude,
                    status: 'Own Vessel',
                    source: 'ttm',
                  };
                  const isSameTarget = selectedTarget?.target_number === -1;
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
                text="OWN"
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

            {/* Radar Targets */}
            {visibleTargets.map((target, idx) => {
              let x: number, y: number;
              let distance: number, bearing: number;

              if (target.source === 'ttm') {
                const ttmTarget = target as TTMTarget;

                if (Number.isFinite(ttmTarget.distance) && Number.isFinite(ttmTarget.bearing)) {
                  distance = ttmTarget.distance;
                  bearing = ttmTarget.bearing;
                }
                else if (hasCenter && Number.isFinite(ttmTarget.latitude) && Number.isFinite(ttmTarget.longitude)) {
                  distance = haversineDistanceNM(centerLat, centerLon, ttmTarget.latitude!, ttmTarget.longitude!);
                  bearing = bearingFromTo(centerLat, centerLon, ttmTarget.latitude!, ttmTarget.longitude!);
                } else {
                  return null;
                }

                const coords = polarToCartesian(distance, bearing, radarRange, CANVAS_SIZE);
                x = coords.x;
                y = coords.y;
              } else {
                const tllTarget = target as TLLTarget;
                if (!hasCenter) return null;
                distance = haversineDistanceNM(centerLat, centerLon, tllTarget.latitude, tllTarget.longitude);
                bearing = bearingFromTo(centerLat, centerLon, tllTarget.latitude, tllTarget.longitude);
                const coords = polarToCartesian(distance, bearing, radarRange, CANVAS_SIZE);
                x = coords.x;
                y = coords.y;
              }

              const uniqueKey = `${target.source}-${target.target_number}-${idx}`;

              // Course/Speed vector for TTM targets
              let courseVector: { x2: number; y2: number } | null = null;
              if (target.source === 'ttm') {
                const ttmTarget = target as TTMTarget;
                if (Number.isFinite(ttmTarget.speed) && Number.isFinite(ttmTarget.course) && ttmTarget.speed > 0.1) {
                  const vectorLength = Math.min(ttmTarget.speed * 3, 30);
                  const courseRad = toRadians(ttmTarget.course);
                  courseVector = {
                    x2: x + vectorLength * Math.sin(courseRad),
                    y2: y - vectorLength * Math.cos(courseRad),
                  };
                }
              }

              return (
                <React.Fragment key={uniqueKey}>
                  {/* Distance line from own vessel to target */}
                  <Line
                    points={[CANVAS_SIZE / 2, CANVAS_SIZE / 2, x, y]}
                    stroke={getTargetColor(target)}
                    strokeWidth={0.5}
                    dash={[5, 5]}
                    opacity={0.4}
                  />

                  {/* Target Circle */}
                  <Circle
                    x={x}
                    y={y}
                    radius={7}
                    fill={getTargetColor(target)}
                    stroke={target.source === 'ttm' ? "#ff00ff" : "#00ffff"}
                    strokeWidth={2}
                    onMouseEnter={(e) => setCursor(e.target.getStage(), "pointer")}
                    onMouseLeave={(e) => setCursor(e.target.getStage(), "default")}
                    onClick={() => handleTargetClick(target)}
                  />

                  {/* Course Vector */}
                  {courseVector && (
                    <Line
                      points={[x, y, courseVector.x2, courseVector.y2]}
                      stroke="#ff00ff"
                      strokeWidth={2}
                      lineCap="round"
                    />
                  )}

                  {/* Target Label */}
                  <KonvaText
                    text={`T${target.target_number}`}
                    x={x + 10}
                    y={y - 20}
                    fontSize={10}
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
                    fontSize={9}
                    fill={target.source === 'ttm' ? "#ff00ff" : "#00ffff"}
                    shadowColor="black"
                    shadowBlur={2}
                  />

                  <KonvaText
                    text={`${bearing.toFixed(1)}°`}
                    x={x + 10}
                    y={y + 2}
                    fontSize={9}
                    fill={target.source === 'ttm' ? "#ff00ff" : "#00ffff"}
                    shadowColor="black"
                    shadowBlur={2}
                  />
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>
      </div>
    </Card>
  );
};

export default RadarDisplay;