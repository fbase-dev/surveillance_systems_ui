import { Stack, Card, Group, Text, Badge, CopyButton, ActionIcon } from "@mantine/core";
import { IconCopy, IconMapPin, IconCompass, IconSend, IconRadar, IconShip } from '@tabler/icons-react';

// AIS Target interface
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

interface AboutTabProps {
  selectedTarget?: AISTarget | null;
  ownVesselData?: OwnVesselData | null;
}

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

// Ship type decoder
const getShipType = (typeCode?: number): string => {
  if (!typeCode) return "Unknown";
  if (typeCode >= 20 && typeCode <= 29) return "Wing in Ground";
  if (typeCode >= 30 && typeCode <= 39) return "Fishing";
  if (typeCode >= 40 && typeCode <= 49) return "Towing";
  if (typeCode >= 50 && typeCode <= 59) return "Pilot / Medical";
  if (typeCode >= 60 && typeCode <= 69) return "Passenger";
  if (typeCode >= 70 && typeCode <= 79) return "Cargo";
  if (typeCode >= 80 && typeCode <= 89) return "Tanker";
  if (typeCode >= 90 && typeCode <= 99) return "Other";
  return `Type ${typeCode}`;
};

// Navigation status decoder
const getNavStatus = (status?: number): string => {
  const statuses: Record<number, string> = {
    0: "Under way using engine",
    1: "At anchor",
    2: "Not under command",
    3: "Restricted manoeuvrability",
    4: "Constrained by draught",
    5: "Moored",
    6: "Aground",
    7: "Engaged in fishing",
    8: "Under way sailing",
    9: "HSC",
    10: "WIG",
    11: "Power-driven towing astern",
    12: "Power-driven pushing ahead",
    13: "Reserved",
    14: "AIS-SART",
    15: "Undefined"
  };
  return status !== undefined ? statuses[status] || `Status ${status}` : "Unknown";
};

// Ship Radar Component
function ShipRadar({ bearing, distance }: { bearing: number, distance?: number }) {
  const size = 280;
  const center = size / 2;
  const radarRadius = (size / 2) - 40;
  
  const adjustedBearing = bearing - 90;
  
  return (
    <svg width={size} height={size} style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="shipGradient" x1="68.0865" y1="-5.26206" x2="68.0865" y2="286" gradientUnits="userSpaceOnUse">
          <stop stopColor="#669BC0" />
          <stop offset="1" stopColor="#27577F" />
        </linearGradient>
      </defs>

      <circle cx={center} cy={center} r={radarRadius} fill="#0E2135" stroke="#164E6F" strokeWidth="20" />
      <circle cx={center} cy={center} r={radarRadius * 0.33} fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      <circle cx={center} cy={center} r={radarRadius * 0.66} fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      
      <line x1={center} y1={center - radarRadius} x2={center} y2={center + radarRadius} stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      <line x1={center - radarRadius} y1={center} x2={center + radarRadius} y2={center} stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      
      <text x={20} y={center + 5} textAnchor="middle" fill="#669BC0" fontSize="12" fontWeight="bold">N</text>
      <text x={size - 20} y={center + 5} textAnchor="middle" fill="#669BC0" fontSize="12" fontWeight="bold">S</text>
      <text x={center} y={size - 25} textAnchor="middle" fill="#669BC0" fontSize="12" fontWeight="bold">W</text>
      <text x={center} y={30} textAnchor="middle" fill="#669BC0" fontSize="12" fontWeight="bold">E</text>
      
      <circle cx={center} cy={center} r="3" fill="#669BC0" opacity="0.6" />
      
      <g transform={`translate(${center}, ${center}) rotate(${adjustedBearing}) scale(0.18)`}>
        <g transform="translate(-48.5, -143)">
          <path
            d="M57.9087 4.59661C52.9358 -1.5322 44.0642 -1.5322 39.0913 4.59661C22.2742 25.3227 0 68.8418 0 134.215V253.638C0 271.511 14.4761 286 32.3333 286H64.6667C82.5239 286 97 271.511 97 253.638V134.215C97 68.8418 74.7258 25.3227 57.9087 4.59661Z"
            fill="url(#shipGradient)"
          />
          <path
            d="M39.4795 4.91211C44.1778 -0.878247 52.483 -0.968926 57.2939 4.64062L57.5205 4.91211C74.2653 25.5492 96.5 68.9571 96.5 134.216V253.638C96.4999 271.235 82.2474 285.5 64.667 285.5H32.333C14.7526 285.5 0.500099 271.235 0.5 253.638V134.216L0.503906 132.689C0.841624 69.2937 22.1772 26.7434 38.6904 5.89551L39.4795 4.91211Z"
            stroke="white" 
            fill="url(#shipGradient)"
            strokeOpacity="0.25"
          />
        </g>
      </g>
      
      <text 
        x={center} 
        y={size - 10} 
        textAnchor="middle" 
        fill="#669BC0" 
        fontSize="16" 
        fontWeight="bold"
      >
        {bearing.toFixed(0)}°
      </text>
      
      {distance && (
        <text 
          x={center} 
          y={25} 
          textAnchor="middle" 
          fill="#669BC0" 
          fontSize="14" 
          fontWeight="bold"
        >
          {distance.toFixed(2)} NM
        </text>
      )}
    </svg>
  );
}

// Target Details Component
function TargetDetailsSection({ target, ownVesselData }: { target: AISTarget, ownVesselData?: OwnVesselData | null }) {
  let distance = null;
  let bearing = null;

  if (ownVesselData && Number.isFinite(ownVesselData.latitude) && Number.isFinite(ownVesselData.longitude)) {
    distance = haversineDistanceNM(ownVesselData.latitude, ownVesselData.longitude, target.latitude, target.longitude);
    bearing = bearingFromTo(ownVesselData.latitude, ownVesselData.longitude, target.latitude, target.longitude);
  }

  return (
    <Stack gap="lg">
      {/* Radar Visualization */}
      {bearing !== null && (
        <Card shadow="sm" radius="md" p="lg" withBorder>
          <Stack align="center" gap="md">
            <Text fw={700} size="lg" c="cyan" mb="sm">Target Position</Text>
            <ShipRadar 
              bearing={bearing} 
              distance={distance || undefined}
            />
          </Stack>
        </Card>
      )}

      {/* Target Details Card */}
      <Card shadow="sm" radius="md" p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={700} size="lg" c="cyan">AIS Target Details</Text>
          <Badge color="cyan" variant="filled" size="lg">
            T{target.target_number}
          </Badge>
        </Group>

        {/* Vessel Identification */}
        <Group gap="xs" mb="md">
          <IconShip size={18} color="var(--mantine-color-cyan-6)" />
          <Text fw={600} size="md">Vessel Identification</Text>
        </Group>

        <Stack gap="xs" mb="md" pl="md" style={{ padding: '12px', borderRadius: '8px' }}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">MMSI:</Text>
            <Group gap="xs">
              <Text size="sm" fw={500}>{target.mmsi}</Text>
              <CopyButton value={target.mmsi}>
                {({ copied, copy }) => (
                  <ActionIcon size="xs" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    <IconCopy size={10} />
                  </ActionIcon>
                )}
              </CopyButton>
            </Group>
          </Group>

          {target.name && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Vessel Name:</Text>
              <Text size="sm" fw={500} c="cyan">
                {target.name}
              </Text>
            </Group>
          )}

          {target.ship_type !== undefined && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Ship Type:</Text>
              <Badge size="sm" color="blue" variant="light">
                {getShipType(target.ship_type)}
              </Badge>
            </Group>
          )}

          {target.nav_status !== undefined && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Status:</Text>
              <Badge size="sm" color="green" variant="light">
                {getNavStatus(target.nav_status)}
              </Badge>
            </Group>
          )}
        </Stack>

        {/* Position Information */}
        <Group gap="xs" mb="md">
          <IconMapPin size={18} color="var(--mantine-color-blue-6)" />
          <Text fw={600} size="md">Position</Text>
        </Group>

        <Stack gap="xs" mb="md" pl="md" style={{ padding: '12px', borderRadius: '8px' }}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Latitude:</Text>
            <Group gap="xs">
              <Text size="sm" fw={500}>{target.latitude.toFixed(6)}°</Text>
              <CopyButton value={target.latitude.toFixed(6)}>
                {({ copied, copy }) => (
                  <ActionIcon size="xs" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    <IconCopy size={10} />
                  </ActionIcon>
                )}
              </CopyButton>
            </Group>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">Longitude:</Text>
            <Group gap="xs">
              <Text size="sm" fw={500}>{target.longitude.toFixed(6)}°</Text>
              <CopyButton value={target.longitude.toFixed(6)}>
                {({ copied, copy }) => (
                  <ActionIcon size="xs" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    <IconCopy size={10} />
                  </ActionIcon>
                )}
              </CopyButton>
            </Group>
          </Group>

          {target.timestamp && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Last Update:</Text>
              <Text size="xs" fw={500} c="dimmed">
                {new Date(target.timestamp).toLocaleString()}
              </Text>
            </Group>
          )}
        </Stack>

        {/* Navigation Data */}
        {(Number.isFinite(target.speed) || Number.isFinite(target.course) || Number.isFinite(target.heading)) && (
          <>
            <Group gap="xs" mb="md">
              <IconSend size={18} color="var(--mantine-color-orange-6)" />
              <Text fw={600} size="md">Navigation</Text>
            </Group>

            <Stack gap="xs" mb="md" pl="md" style={{  padding: '12px', borderRadius: '8px' }}>
              {Number.isFinite(target.speed) && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Speed (SOG):</Text>
                  <Text size="sm" fw={500} c="orange">
                    {target.speed?.toFixed(1)} kts
                  </Text>
                </Group>
              )}

              {Number.isFinite(target.course) && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Course (COG):</Text>
                  <Text size="sm" fw={500} c="orange">
                    {target.course?.toFixed(0)}°
                  </Text>
                </Group>
              )}

              {Number.isFinite(target.heading) && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Heading (HDG):</Text>
                  <Text size="sm" fw={500} c="orange">
                    {target.heading?.toFixed(0)}°
                  </Text>
                </Group>
              )}
            </Stack>
          </>
        )}

        {/* Relative Position */}
        {distance !== null && bearing !== null && (
          <>
            <Group gap="xs" mb="md">
              <IconCompass size={18} color="var(--mantine-color-green-6)" />
              <Text fw={600} size="md">Relative Position</Text>
            </Group>

            <Stack gap="xs" pl="md" style={{ padding: '12px', borderRadius: '8px' }}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Distance from Own Vessel:</Text>
                <Text size="sm" fw={500} c="green">
                  {distance.toFixed(2)} NM
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">Bearing from Own Vessel:</Text>
                <Text size="sm" fw={500} c="green">
                  {bearing.toFixed(0)}°
                </Text>
              </Group>
            </Stack>
          </>
        )}
      </Card>
    </Stack>
  );
}

export default function AboutTab({ selectedTarget, ownVesselData }: AboutTabProps) {
  return (
    <Stack gap="lg">
      {selectedTarget ? (
        <TargetDetailsSection target={selectedTarget} ownVesselData={ownVesselData} />
      ) : (
        <Card shadow="sm" radius="md" p="xl" withBorder>
          <Stack align="center" gap="md">
            <IconRadar size={48} color="var(--mantine-color-gray-5)" />
            <Text size="lg" fw={500} c="dimmed">No Target Selected</Text>
            <Text size="sm" c="dimmed" ta="center">
              Click on an AIS target in the radar display to view detailed information here.
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}