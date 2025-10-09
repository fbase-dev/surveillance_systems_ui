
"use client";

import { Paper } from "@mantine/core";
import { useEffect, useState } from "react";

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeSector(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
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

export default function ShipRadar({ heading, lat_dir, lon_dir }: ShipRadarProps) {
  const angle = heading !== undefined ? heading : getDirectionFromLatLon(lat_dir, lon_dir);

  const [pathD, setPathD] = useState("");

  useEffect(() => {
    const calculatedD = describeSector(100, 100, 100, angle - 30, angle + 30);
    setPathD(calculatedD);
  }, [angle]);

  return (
    <Paper p="md" radius="md" bg={"transparent"}>
      <svg viewBox="0 0 200 200" width="200" height="200">
        {/* Radar Gradients */}
        <defs>
          {/* sector gradient */}
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0057ff" stopOpacity="0" />
          </linearGradient>
          {/* Ship icon gradient */}
          <linearGradient id="paint0_linear" x1="68.0865" y1="-5.26206" x2="68.0865" y2="286" gradientUnits="userSpaceOnUse">
            <stop stopColor="#669BC0" />
            <stop offset="1" stopColor="#27577F" />
          </linearGradient>
        </defs>

        {/* Radar circle */}
        <circle cx="100" cy="100" r="90" fill="#0E2135" stroke="#164E6F" strokeWidth="20" />
        {/* Inner concentric circles */}
        <circle cx="100" cy="100" r="60" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="#1e293b" strokeWidth="1" />

        {/* Ship direction sector */}
        <path d={pathD} fill="url(#gradient)" />

        {/* Ship Icon */}
        <g transform={`translate(100, 100) rotate(${angle}) scale(0.4) `}>
          <g transform="translate(-48.5, -143)">
            <path
              d="M57.9087 4.59661C52.9358 -1.5322 44.0642 -1.5322 39.0913 4.59661C22.2742 25.3227 0 68.8418 0 134.215V253.638C0 271.511 14.4761 286 32.3333 286H64.6667C82.5239 286 97 271.511 97 253.638V134.215C97 68.8418 74.7258 25.3227 57.9087 4.59661Z"
              fill="url(#gradient)"
            />
            <path
              d="M39.4795 4.91211C44.1778 -0.878247 52.483 -0.968926 57.2939 4.64062L57.5205 4.91211C74.2653 25.5492 96.5 68.9571 96.5 134.216V253.638C96.4999 271.235 82.2474 285.5 64.667 285.5H32.333C14.7526 285.5 0.500099 271.235 0.5 253.638V134.216L0.503906 132.689C0.841624 69.2937 22.1772 26.7434 38.6904 5.89551L39.4795 4.91211Z"
              stroke="white" fill="url(#paint0_linear)"
              strokeOpacity="0.25"
            />
          </g>
        </g>
      </svg>
    </Paper>
  );
}
