import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Card, Container, Popover, Group, Select, Badge, Text, Alert, Button } from "@mantine/core";
import { Stage, Layer, Circle, Line, Text as KonvaText, Shape } from "react-konva";

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

interface TooltipTarget {
  x: number;
  y: number;
  data: TTMTarget | TLLTarget;
}

interface OwnVesselData {
  latitude: number;
  longitude: number;
  heading?: number;
}

// Constants
const CANVAS_SIZE = 650;
const SWEEP_SPEED = 60;

const RADAR_RANGES = [
  { value: "1", label: "1 NM" },
  { value: "2", label: "2 NM" },
  { value: "5", label: "5 NM" },
  { value: "10", label: "10 NM" },
  { value: "20", label: "20 NM" },
];

// Dummy Data
const DUMMY_OWN_VESSEL: OwnVesselData = {
  latitude: 6.525,
  longitude: 3.375,
  heading: 217.3
};

const DUMMY_TTM_TARGETS: TTMTarget[] = [
  {
    target_number: 6,
    distance: 0.68,
    bearing: 284.0,
    speed: 34.7,
    course: 259.2,
    cpa: 0.0,
    tcpa: 0.0,
    status: 'L',
    source: 'ttm'
  },
  {
    target_number: 7,
    distance: 0.96,
    bearing: 182.0,
    speed: 62.8,
    course: 50.7,
    cpa: 0.0,
    tcpa: 0.0,
    status: 'L',
    source: 'ttm'
  }
];

const DUMMY_TLL_TARGETS: TLLTarget[] = [
  {
    target_number: 6,
    latitude: 6.53,
    longitude: 3.38,
    label: 'TGT6',
    timestamp: '072410',
    source: 'tll'
  },
  {
    target_number: 7,
    latitude: 6.535,
    longitude: 3.385,
    label: 'TGT7',
    timestamp: '072420',
    source: 'tll'
  },
  {
    target_number: 8,
    latitude: 6.54,
    longitude: 3.39,
    label: 'TGT8',
    timestamp: '072430',
    source: 'tll'
  },
  {
    target_number: 9,
    latitude: 6.545,
    longitude: 3.395,
    label: 'TGT9',
    timestamp: '072440',
    source: 'tll'
  },
  {
    target_number: 10,
    latitude: 6.55,
    longitude: 3.4,
    label: 'TGT10',
    timestamp: '072450',
    source: 'tll'
  }
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
  const angleRad = toRadians(bearingDeg);
  const x = canvasSize / 2 + radius * Math.sin(angleRad);
  const y = canvasSize / 2 - radius * Math.cos(angleRad);
  return { x, y };
};

const setCursor = (stage: any, cursor: string) => {
  if (stage?.container()) {
    stage.container().style.cursor = cursor;
  }
};

const RadarDisplay: React.FC = () => {
  // State
  const [sweepAngle, setSweepAngle] = useState(0);
  const [tooltipTarget, setTooltipTarget] = useState<TooltipTarget | null>(null);
  const [ttmTargets, setTtmTargets] = useState<TTMTarget[]>(DUMMY_TTM_TARGETS);
  const [tllTargets, setTllTargets] = useState<TLLTarget[]>(DUMMY_TLL_TARGETS);
  const [ownVesselData, setOwnVesselData] = useState<OwnVesselData | null>(DUMMY_OWN_VESSEL);
  const [radarRange, setRadarRange] = useState<number>(5);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTarget, setSelectedTarget] = useState<any>(null);

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

  // Visible targets within range
  const visibleTargets = useMemo(() => {
    if (!allTargets.length) return [];

    const filtered = allTargets.filter((target) => {
      if (target.source === 'ttm') {
        return (target as TTMTarget).distance <= radarRange;
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
      selectedTarget.target_number === target.target_number;

    if (isSelected) return "orange";
    return target.source === 'ttm' ? "#ff00ff" : "#00ffff";
  }, [selectedTarget]);

  // Handle target click
  const handleTargetClick = useCallback((target: TTMTarget | TLLTarget, x: number, y: number) => {
    const isSameTarget = tooltipTarget?.data?.target_number === target.target_number;
    setSelectedTarget(target);
    setTooltipTarget(isSameTarget ? null : { x, y, data: target });
  }, [tooltipTarget]);

  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 1) % 360);
    }, SWEEP_SPEED);

    return () => clearInterval(interval);
  }, []);

  // Simulate live updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Slightly modify target positions to simulate movement
      setTtmTargets(prev => prev.map(t => ({
        ...t,
        bearing: (t.bearing + Math.random() * 2 - 1 + 360) % 360,
        distance: Math.max(0.1, t.distance + (Math.random() * 0.1 - 0.05))
      })));
    }, 3000);

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
    <Card p={0} h={CANVAS_SIZE + 60} style={{ backgroundColor: '#030E1B80' }}>
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
            {isConnected ? "Connected (Dummy)" : "Disconnected"}
          </Badge>
        </Group>

        <Group gap="md">
          <Text size="xs" style={{ color: 'white' }}>
            TTM: {ttmTargets.length}
          </Text>
          <Text size="xs" style={{ color: 'white' }}>
            TLL: {tllTargets.length}
          </Text>
          {lastUpdate && (
            <Text size="xs" style={{ color: 'white' }}>
              {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </Group>
      </Group>

      {/* Radar Display */}
      <div style={{ 
        backgroundColor: '#030E1B80', 
        position: 'relative', 
        width: CANVAS_SIZE, 
        margin: 'auto' 
      }}>
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
                fillLinearGradientColorStops={[0, "rgba(255,0,255,0.3)", 1, "rgba(255,0,255,0)"]}
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

              {/* Radar Targets */}
              {visibleTargets.map((target, idx) => {
                let x: number, y: number;
                let distance: number, bearing: number;

                if (target.source === 'ttm') {
                  const ttmTarget = target as TTMTarget;
                  distance = ttmTarget.distance;
                  bearing = ttmTarget.bearing;
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
                    {/* Target Circle */}
                    <Circle
                      x={x}
                      y={y}
                      radius={6}
                      fill={getTargetColor(target)}
                      stroke={target.source === 'ttm' ? "#ff00ff" : "#00ffff"}
                      strokeWidth={2}
                      onMouseEnter={(e) => setCursor(e.target.getStage(), "pointer")}
                      onMouseLeave={(e) => setCursor(e.target.getStage(), "default")}
                      onClick={() => handleTargetClick(target, x, y)}
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
                      x={x + 8}
                      y={y - 15}
                      fontSize={9}
                      fill="white"
                      shadowColor="black"
                      shadowBlur={2}
                    />

                    {/* Distance and Bearing */}
                    <KonvaText
                      text={`${distance.toFixed(1)}NM ${bearing.toFixed(0)}°`}
                      x={x + 8}
                      y={y - 5}
                      fontSize={8}
                      fill={target.source === 'ttm' ? "#ff00ff" : "#00ffff"}
                      shadowColor="black"
                      shadowBlur={2}
                    />
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
              top: Math.min(tooltipTarget.y + 40, CANVAS_SIZE - 250),
              left: Math.min(tooltipTarget.x + 40, CANVAS_SIZE - 350),
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
                  <Group justify="space-between" mb="xs">
                    <Text fw={700} size="sm" c="blue">
                      Target {tooltipTarget.data.target_number}
                    </Text>
                    <Badge
                      size="xs"
                      color={tooltipTarget.data.source === 'ttm' ? 'grape' : 'cyan'}
                      variant="filled"
                    >
                      {tooltipTarget.data.source.toUpperCase()}
                    </Badge>
                  </Group>

                  {tooltipTarget.data.source === 'ttm' ? (
                    <>
                      <div style={{ backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                        <Text fw={600} size="xs" mb={4} c="dark">📡 Radar Data</Text>
                        <Group gap="xs" mb={2}>
                          <Text size="xs" w={60} c="dimmed">Distance:</Text>
                          <Text size="xs" fw={500} c="dark">
                            {(tooltipTarget.data as TTMTarget).distance.toFixed(2)} NM
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="xs" w={60} c="dimmed">Bearing:</Text>
                          <Text size="xs" fw={500} c="dark">
                            {(tooltipTarget.data as TTMTarget).bearing.toFixed(0)}°
                          </Text>
                        </Group>
                      </div>

                      <div style={{ backgroundColor: '#e8f5e8', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                        <Text fw={600} size="xs" mb={4} c="green">🎯 Motion Data</Text>
                        <Group gap="md" mb={4}>
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">Speed:</Text>
                            <Text size="xs" fw={500} c="green">
                              {(tooltipTarget.data as TTMTarget).speed.toFixed(1)} kts
                            </Text>
                          </Group>
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">Course:</Text>
                            <Text size="xs" fw={500} c="green">
                              {(tooltipTarget.data as TTMTarget).course.toFixed(0)}°
                            </Text>
                          </Group>
                        </Group>
                        {(tooltipTarget.data as TTMTarget).cpa !== undefined && (
                          <Group gap="xs" mb={2}>
                            <Text size="xs" c="dimmed">CPA:</Text>
                            <Text size="xs" fw={500} c="green">
                              {(tooltipTarget.data as TTMTarget).cpa?.toFixed(2)} NM
                            </Text>
                          </Group>
                        )}
                        {(tooltipTarget.data as TTMTarget).tcpa !== undefined && (
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">TCPA:</Text>
                            <Text size="xs" fw={500} c="green">
                              {(tooltipTarget.data as TTMTarget).tcpa?.toFixed(1)} min
                            </Text>
                          </Group>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ backgroundColor: '#e7f5ff', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                      <Text fw={600} size="xs" mb={4} c="blue">📍 Position</Text>
                      <Group gap="xs" mb={2}>
                        <Text size="xs" w={35} c="dimmed">Lat:</Text>
                        <Text size="xs" fw={500} c="dark">
                          {(tooltipTarget.data as TLLTarget).latitude.toFixed(6)}°
                        </Text>
                      </Group>
                      <Group gap="xs" mb={2}>
                        <Text size="xs" w={35} c="dimmed">Lon:</Text>
                        <Text size="xs" fw={500} c="dark">
                          {(tooltipTarget.data as TLLTarget).longitude.toFixed(6)}°
                        </Text>
                      </Group>
                      {(tooltipTarget.data as TLLTarget).label && (
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">Label:</Text>
                          <Text size="xs" fw={500} c="dark">
                            {(tooltipTarget.data as TLLTarget).label}
                          </Text>
                        </Group>
                      )}
                    </div>
                  )}

                  <Group justify="center" mt="sm">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setSelectedTarget(tooltipTarget.data);
                        setTooltipTarget(null);
                      }}
                    >
                      Select Target
                    </Button>
                  </Group>
                </div>
              </Popover.Dropdown>
            </Popover>
          </div>
        )}
      </div>

      {/* Info Alert */}
      <Alert variant="light" color="blue" mt="sm" mx="sm">
        Displaying dummy data: {visibleTargets.length} targets visible within {radarRange} NM range.
        Own vessel at {currentOwnVessel.latitude.toFixed(4)}°N, {currentOwnVessel.longitude.toFixed(4)}°E
      </Alert>
    </Card>
  );
};

export default RadarDisplay;