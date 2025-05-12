import { useDashboard } from "@/contexts/DashboardContext";
import { AspectRatio, BackgroundImage, Card, Container, Image, Overlay, Popover } from "@mantine/core";
import Konva from "konva";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { Stage, Layer, Circle, Line, Text, Image as KonvaImage, Shape } from "react-konva";
import useImage from "use-image";

const toRadians = (deg: number): number => deg * (Math.PI / 180);

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function bearingFromTo(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let θ = Math.atan2(y, x);
  θ = (θ * 180) / Math.PI;
  return (θ + 360) % 360;
}

function polarToCartesian(distance: number, bearingDeg: number, maxRange: number, canvasSize = 300): { x: number; y: number } {
  const radius = (distance / maxRange) * (canvasSize / 2);
  const angleRad = toRadians(bearingDeg);

  const x = canvasSize / 2 + radius * Math.sin(angleRad);
  const y = canvasSize / 2 - radius * Math.cos(angleRad);
  return { x, y };
}

function setCursor(stage: Konva.Stage | null, cursor: string) {
  if (stage) {
    stage.container().style.cursor = cursor;
  }
}

const RadarDisplay: React.FC = () => {
  const canvasSize = 650;
  const [sweepAngle, setSweepAngle] = useState(0);
  const [tooltipTarget, setTooltipTarget] = useState<{ x: number; y: number; data: any } | null>(null);
  const { selectedVessel, setSelectedVessel, targetLocations, ownAisData } = useDashboard();

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${ownAisData.lat},${ownAisData.lon}&zoom=13&size=${canvasSize}x${canvasSize}&maptype=roadmap&key=${process.env.NEXT_PUBLIC_MAP_API_KEY}&map_id=${process.env.NEXT_PUBLIC_MAP_ID}`;
  const [mapImage] = useImage(mapUrl);
  const [shipIcon] = useImage("/images/ship.svg"); 

  const distances = targetLocations.map((v) =>
    haversineDistance(ownAisData.lat, ownAisData.lon, parseFloat(v.lat.toString()), parseFloat(v.lon.toString()))
  );

  const maxRange = Math.max(...distances, 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const sweepX = canvasSize / 2 + (canvasSize / 2) * Math.sin(toRadians(sweepAngle));
  const sweepY = canvasSize / 2 - (canvasSize / 2) * Math.cos(toRadians(sweepAngle));

  return (
    <Card p={0}>
      <BackgroundImage src={mapUrl} style={{backgroundColor: "#030E1B80", backgroundBlendMode: "overlay"}} >
        <div style={{ position: "relative", width: canvasSize, margin: "auto" }}>
          <Container>
            <Stage width={canvasSize} height={canvasSize}>
              <Layer>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Circle
                    key={i}
                    x={canvasSize / 2}
                    y={canvasSize / 2}
                    radius={(i * canvasSize) / 10}
                    stroke={"#EDF4FD"}
                    strokeWidth={0.5}
                  />
                ))}

                {/* cross lines */}
                <Line points={[canvasSize / 2, 0, canvasSize / 2, canvasSize]} stroke="white" strokeWidth={1} />
                <Line points={[0, canvasSize / 2, canvasSize, canvasSize / 2]} stroke="white" strokeWidth={1} />
                
                {/* Moving radar sector with gradient background */}
                <Shape
                  sceneFunc={(context, shape) => {
                    context.beginPath();
                    context.moveTo(canvasSize / 2, canvasSize / 2);
                    context.arc(
                      canvasSize / 2, // x
                      canvasSize / 2, // y
                      canvasSize / 2, // radius
                      toRadians(sweepAngle - 30), // start angle
                      toRadians(sweepAngle + 30)  // end angle
                    );
                    context.closePath();
                    context.fillStrokeShape(shape);
                  }}
                  fillLinearGradientStartPoint={{ x: canvasSize / 2, y: canvasSize / 2 }}
                  fillLinearGradientEndPoint={{
                    x: canvasSize / 25 + (canvasSize / 2) * Math.sin(toRadians(sweepAngle)),
                    y: canvasSize / 25 - (canvasSize / 2) * Math.cos(toRadians(sweepAngle))
                  }}
                  fillLinearGradientColorStops={[0, 'rgba(0,255,0,0.4)', 1, 'rgba(0,255,0,0)']}
                />


                <Circle x={canvasSize / 2} y={canvasSize / 2} radius={4} fill="white" />

                <Text text="N" x={canvasSize / 2 - 5} y={0} fontSize={10} fill="white" />
                <Text text="S" x={canvasSize / 2 - 5} y={canvasSize - 12} fontSize={10} fill="white" />
                <Text text="W" x={0} y={canvasSize / 2 - 5} fontSize={10} fill="white" />
                <Text text="E" x={canvasSize - 10} y={canvasSize / 2 - 5} fontSize={10} fill="white" />

                {/* Ship icon at center with heading */}
                {/* {shipIcon && (
                  <KonvaImage
                    image={shipIcon}
                    x={canvasSize / 2 }
                    y={canvasSize / 2 }
                    width={30}
                    height={100}
                    offset={{ x: 20, y: 20 }}
                    rotation={ownAisData.heading || 0}
                  />
                )} */}

                {targetLocations.map((v, idx) => {
                  const lat = parseFloat(v.lat.toString());
                  const lon = parseFloat(v.lon.toString());

                  const dist = haversineDistance(ownAisData.lat, ownAisData.lon, lat, lon);
                  const brg = bearingFromTo(ownAisData.lat, ownAisData.lon, lat, lon);

                  if (dist > maxRange) return null;

                  const { x, y } = polarToCartesian(dist, brg, maxRange, canvasSize);

                  const arrowLength = 10;
                  const angleRad = toRadians(brg);
                  const x2 = x + arrowLength * Math.sin(angleRad);
                  const y2 = y - arrowLength * Math.cos(angleRad);

                  return (
                    <React.Fragment key={idx}>
                      <Circle
                        x={x}
                        y={y}
                        radius={5}
                        fill={selectedVessel === v ? "orange" : "yellow"}
                        onMouseEnter={(e) => setCursor(e.target.getStage(), "pointer")}
                        onMouseLeave={(e) => setCursor(e.target.getStage(), "default")}
                        onClick={() => {
                          const isSameTarget = tooltipTarget?.data?.target_number === v.target_number;
                          setSelectedVessel(v);
                          setTooltipTarget(isSameTarget ? null : { x, y, data: v });
                        }}
                      />
                      <Line points={[x, y, x2, y2]} stroke="red" strokeWidth={1} />
                      <Text text={`#${v.target_number} (${v.target_status})`} x={x + 5} y={y - 10} fontSize={10} fill="white" />
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </Container>

          {tooltipTarget && (
            <div style={{ position: "absolute", top: tooltipTarget.y + 40, left: tooltipTarget.x + 40, zIndex: 10 }}>
              <Popover opened={!!tooltipTarget} onClose={() => setTooltipTarget(null)} withArrow shadow="md" position="right">
                <Popover.Target>
                  <div style={{ width: 1, height: 1 }} />
                </Popover.Target>
                <Popover.Dropdown>
                  <div>
                    <strong>Target #{tooltipTarget.data.target_number}</strong>
                    <br />
                    Status: {tooltipTarget.data.target_status}
                    <br />
                    Lat: {tooltipTarget.data.lat}
                    <br />
                    Lon: {tooltipTarget.data.lon}
                  </div>
                </Popover.Dropdown>
              </Popover>
            </div>
          )}
        </div>
      </BackgroundImage>
    </Card>
  );
};

export default dynamic(() => Promise.resolve(RadarDisplay), { ssr: false });
