import { useDashboard } from "@/contexts/DashboardContext";
import { BackgroundImage, Card, Container, Popover, Group, Select, Badge, Text, Alert } from "@mantine/core";
import Konva from "konva";
import dynamic from "next/dynamic";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Stage, Layer, Circle, Line, Text as KonvaText, Shape } from "react-konva";

// Types
interface TTMTarget {
  targetId?: string;
  target_number?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  course?: number;
  target_status?: string;
  source: string;
}

interface TLLTarget {
  targetId?: string;
  target_number?: string;
  latitude: number;
  longitude: number;
  target_status?: string;
  source: string;
}

interface OwnVesselData {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  course?: number;
}

interface Target extends TTMTarget, TLLTarget {
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
  TTM: 5000,
  TLL: 3000,
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
  TTM: 'https://camera-server-cloud-run-183968704272.us-central1.run.app/tracking_data',
  TLL: 'https://camera-server-cloud-run-183968704272.us-central1.run.app/target_location_batch',
  OWN: 'https://camera-server-cloud-run-183968704272.us-central1.run.app/ais_data/own'
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
  const [ttmData, setTtmData] = useState<TTMTarget[]>([]);
  const [tllData, setTllData] = useState<TLLTarget[]>([]);
  const [ownVesselData, setOwnVesselData] = useState<OwnVesselData | null>(null);
  const [radarRange, setRadarRange] = useState<number>(5);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Context
  const { selectedVessel, setSelectedVessel, targetLocations, ownAisData } = useDashboard();

  // Refs
  const intervalRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // API functions
  const fetchRadarData = useCallback(async (type: 'ttm' | 'tll' | 'own') => {
    try {
      let endpoint: string;

      switch (type) {
        case 'ttm':
          endpoint = RADAR_ENDPOINTS.TTM;
          break;
        case 'tll':
          endpoint = RADAR_ENDPOINTS.TLL;
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

      // Handle different response formats from the actual endpoints
      if (type === 'own') {
        // For AIS own vessel data, expect direct vessel data
        console.log(`Processed ${type.toUpperCase()} data:`, result);
        return result;
      } else {
        // For radar data (TTM/TLL), check if there's a success field or return data directly
        if (result.success !== undefined) {
          if (!result.success) {
            console.warn(`${type.toUpperCase()} API returned unsuccessful result:`, result.error);
            return null;
          }
          console.log(`Processed ${type.toUpperCase()} data:`, result.data);
          return result.data;
        }
        // If no success field, assume the result is the data itself
        console.log(`Processed ${type.toUpperCase()} data:`, result);
        return result;
      }
    } catch (error) {
      console.error(`Error fetching ${type.toUpperCase()} data:`, error);
      return null;
    }
  }, []);

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

  const dashboardTargets = useMemo(() => {
    if (!targetLocations) return [];

    return targetLocations
      .map((v: any) => ({
        ...v,
        source: "dashboard",
        latitude: Number(v.lat),
        longitude: Number(v.lon),
      }))
      .filter((v: any) => Number.isFinite(v.latitude) && Number.isFinite(v.longitude));
  }, [targetLocations]);

  const allTargets = useMemo(() => {
    const targets: Target[] = [];

    // Add dashboard targets
    targets.push(...dashboardTargets);

    // Add TTM targets with source
    targets.push(...ttmData.map(t => ({ ...t, source: 'ttm' })));

    // Add TLL targets with source
    targets.push(...tllData.map(t => ({ ...t, source: 'tll' })));

    console.log('All targets computed:', {
      total: targets.length,
      dashboard: dashboardTargets.length,
      ttm: ttmData.length,
      tll: tllData.length,
      targets: targets
    });

    return targets;
  }, [dashboardTargets, ttmData, tllData]);

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
      ((selectedVessel as any)?.targetId ?? (selectedVessel as any)?.target_number) ===
      (target.targetId ?? target.target_number);

    if (isSelected) return "orange";

    switch (target.source) {
      case "ttm": return "#ff6600";
      case "tll": return "#00ffff";
      default: return "yellow";
    }
  }, [selectedVessel]);

  const getTargetRadius = useCallback((target: Target) => {
    switch (target.source) {
      case "ttm": return 6;
      case "tll": return 4;
      default: return 5;
    }
  }, []);

 const handleTargetClick = useCallback((target: Target, x: number, y: number) => {
    const isSameTarget = tooltipTarget?.data?.target_number === target.target_number;
    setSelectedVessel(target);
    setTooltipTarget(isSameTarget ? null : { x, y, data: target });
}, [tooltipTarget, setSelectedVessel]);

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
        const [ttm, tll, own] = await Promise.all([
          fetchRadarData('ttm'),
          fetchRadarData('tll'),
          fetchRadarData('own')
        ]);

        if (ttm) setTtmData(Array.isArray(ttm) ? ttm : [ttm]);
        if (tll) setTllData(Array.isArray(tll) ? tll : [tll]);
        if (own) setOwnVesselData(own);

        updateConnectionStatus();
      } catch (error) {
        console.error("Error initializing radar data:", error);
        handleError();
      }
    };

    initializeData();

    // TTM data interval
    intervalRefs.current.ttm = setInterval(async () => {
      try {
        const data = await fetchRadarData('ttm');
        if (data) {
          setTtmData(Array.isArray(data) ? data : [data]);
          updateConnectionStatus();
        }
      } catch (error) {
        console.error("Error fetching TTM data:", error);
        handleError();
      }
    }, FETCH_INTERVALS.TTM);

    // TLL data interval
    intervalRefs.current.tll = setInterval(async () => {
      try {
        const data = await fetchRadarData('tll');
        if (data) {
          setTllData(Array.isArray(data) ? data : [data]);
          updateConnectionStatus();
        }
      } catch (error) {
        console.error("Error fetching TLL data:", error);
        handleError();
      }
    }, FETCH_INTERVALS.TLL);

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
            TTM: {ttmData.length} | TLL: {tllData.length} | Dashboard: {dashboardTargets.length}
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

                  const targetId = target.targetId || target.target_number || `${target.source?.toUpperCase()}-${idx}`;
                  const uniqueKey = `${target.source}-${targetId}-${idx}`;

                  // Course vector for TTM targets
                  let courseVector: { x2: number; y2: number } | null = null;
                  if (target.source === "ttm" && Number.isFinite(target.speed) && Number.isFinite(target.course)) {
                    const vectorLength = Math.min(target.speed! * 3, 30);
                    const courseRad = toRadians(target.course!);
                    courseVector = {
                      x2: x + vectorLength * Math.sin(courseRad),
                      y2: y - vectorLength * Math.cos(courseRad),
                    };
                  }

                  return (
                    <React.Fragment key={uniqueKey}>
                      {/* Target Circle */}
                      <Circle
                        x={x}
                        y={y}
                        radius={getTargetRadius(target)}
                        fill={getTargetColor(target)}
                        stroke={target.source === "ttm" ? "#ff3300" : undefined}
                        strokeWidth={target.source === "ttm" ? 1 : 0}
                        onMouseEnter={(e) => setCursor(e.target.getStage(), "pointer")}
                        onMouseLeave={(e) => setCursor(e.target.getStage(), "default")}
                        onClick={() => handleTargetClick(target, x, y)}
                      />

                      {/* Course Vector */}
                      {courseVector && (
                        <Line
                          points={[x, y, courseVector.x2, courseVector.y2]}
                          stroke="#ff6600"
                          strokeWidth={2}
                          lineCap="round"
                        />
                      )}

                      {/* Dashboard Target Direction Line */}
                      {target.source === "dashboard" && hasCenter && (
                        <Line
                          points={[
                            x,
                            y,
                            x + 10 * Math.sin(toRadians(bearing)),
                            y - 10 * Math.cos(toRadians(bearing))
                          ]}
                          stroke="red"
                          strokeWidth={1}
                        />
                      )}

                      {/* Target Label */}
                      <KonvaText
                        text={`${targetId}${target.target_status ? ` (${target.target_status})` : ""}`}
                        x={x + 8}
                        y={y - 15}
                        fontSize={9}
                        fill="white"
                        shadowColor="black"
                        shadowBlur={2}
                      />

                      {/* Distance and Bearing for TTM */}
                      {target.source === "ttm" && hasCenter && (
                        <KonvaText
                          text={`${distance.toFixed(1)}NM ${bearing.toFixed(0)}°`}
                          x={x + 8}
                          y={y - 5}
                          fontSize={8}
                          fill="#ff6600"
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
                top: tooltipTarget.y + 40,
                left: tooltipTarget.x + 40,
                zIndex: 10,
              }}
            >
              <Popover
                opened={!!tooltipTarget}
                onClose={() => setTooltipTarget(null)}
                withArrow
                shadow="md"
                position="right"
              >
                <Popover.Target>
                  <div style={{ width: 1, height: 1 }} />
                </Popover.Target>
                <Popover.Dropdown>
                  <div>
                    <strong>
                      {tooltipTarget.data.source?.toUpperCase() ?? "TARGET"}{" "}
                      {tooltipTarget.data.targetId || tooltipTarget.data.target_number}
                    </strong>
                    <br />
                    {tooltipTarget.data.target_status && (
                      <>Status: {tooltipTarget.data.target_status}<br /></>
                    )}
                    Lat: {Number(tooltipTarget.data.latitude ?? tooltipTarget.data.lat).toFixed(6)}
                    <br />
                    Lon: {Number(tooltipTarget.data.longitude ?? tooltipTarget.data.lon).toFixed(6)}
                    <br />
                    {hasCenter && (
                      <>
                        Distance:{" "}
                        {haversineDistanceNM(
                          centerLat,
                          centerLon,
                          Number(tooltipTarget.data.latitude ?? tooltipTarget.data.lat),
                          Number(tooltipTarget.data.longitude ?? tooltipTarget.data.lon)
                        ).toFixed(2)}{" "}
                        NM
                        <br />
                        Bearing:{" "}
                        {bearingFromTo(
                          centerLat,
                          centerLon,
                          Number(tooltipTarget.data.latitude ?? tooltipTarget.data.lat),
                          Number(tooltipTarget.data.longitude ?? tooltipTarget.data.lon)
                        ).toFixed(0)}
                        °
                      </>
                    )}
                    {Number.isFinite(tooltipTarget.data.speed) && (
                      <>
                        <br />
                        Speed: {Number(tooltipTarget.data.speed)} kts
                      </>
                    )}
                    {Number.isFinite(tooltipTarget.data.course) && (
                      <>
                        <br />
                        Course: {Number(tooltipTarget.data.course)}°
                      </>
                    )}
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
          No targets to display yet.{" "}
          {hasCenter ? "Try increasing the range." : "Waiting for own vessel fix or target data."}
        </Alert>
      )}
    </Card>
  );
};

export default dynamic(() => Promise.resolve(RadarDisplay), { ssr: false });