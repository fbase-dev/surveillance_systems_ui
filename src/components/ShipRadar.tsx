"use client";

import { Paper } from "@mantine/core";
import { useEffect, useState } from "react";

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeSector(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

type Marker = { x: number; y: number; color: string };

type Cardinal = "N" | "S" | "E" | "W";
type ShipRadarProps = {
  heading?: number;
  lat_dir?: Cardinal;
  lon_dir?: Cardinal;
};
const directionToDegrees: Record<string, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
};

function getDirectionFromLatLon(lat_dir?: Cardinal, lon_dir?: Cardinal): number {
  const dir = (lat_dir ?? "") + (lon_dir ?? "");
  return directionToDegrees[dir] ?? 0;
}

export default function ShipRadar({
  heading, lat_dir, lon_dir
}: ShipRadarProps) {
  const angle =
  heading !== undefined
    ? heading
    : getDirectionFromLatLon(lat_dir, lon_dir);

  const [pathD, setPathD] = useState('');

  useEffect(() => {
    const calculatedD = describeSector(100, 100, 100, angle - 30, angle + 30);
    setPathD(calculatedD);
  }, []);

  return (
    <Paper p="md" radius="md" bg={"transparent"}>
      <svg viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <radialGradient id="sectorRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14B8FFAF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0057ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0057ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Radar circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="#0E2135"
          stroke="#164E6F"
          strokeWidth="20"
        />

        {/* Inner concentric circles */}
        <circle cx="100" cy="100" r="60" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="#1e293b" strokeWidth="1" />

        {/* Ship indicator */}
        <path d={pathD} fill="url(#gradient)" />

        {/* Dynamic markers */}
        {/* {markers.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r="6" fill={m.color} />
        ))} */}
      </svg>
    </Paper>
  );
}
