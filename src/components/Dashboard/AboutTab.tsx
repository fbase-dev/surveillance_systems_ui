import { Stack, Card, Group, Text, Badge, CopyButton, ActionIcon } from "@mantine/core";
import { IconCopy, IconMapPin, IconCompass, IconSend, IconRadar } from '@tabler/icons-react';

// Target interface matching radar data
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

interface AboutTabProps {
  selectedTarget?: TTMTarget | TLLTarget | null;
  ownVesselData?: {
    latitude: number;
    longitude: number;
    heading?: number;
  };
}

// Utility functions for calculations
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

// Ship Radar Component
function ShipRadar({ bearing, distance, }: { bearing: number, distance?: number, maxRange?: number }) {
  const size = 280;
  const center = size / 2;
  const radarRadius = (size / 2) - 40;
  
  return (
    <svg width={size} height={size} style={{ maxWidth: '100%', height: 'auto' }}>
      {/* Gradients */}
      <defs>
        <linearGradient id="shipGradient" x1="68.0865" y1="-5.26206" x2="68.0865" y2="286" gradientUnits="userSpaceOnUse">
          <stop stopColor="#669BC0" />
          <stop offset="1" stopColor="#27577F" />
        </linearGradient>
      </defs>

      {/* Background */}
      <circle cx={center} cy={center} r={radarRadius} fill="#0E2135" stroke="#164E6F" strokeWidth="20" />
      
      {/* Range rings */}
      <circle cx={center} cy={center} r={radarRadius * 0.33} fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      <circle cx={center} cy={center} r={radarRadius * 0.66} fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      
      {/* Cardinal direction lines */}
      <line x1={center} y1={center - radarRadius} x2={center} y2={center + radarRadius} stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      <line x1={center - radarRadius} y1={center} x2={center + radarRadius} y2={center} stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      
      {/* Center dot */}
      <circle cx={center} cy={center} r="3" fill="#669BC0" opacity="0.6" />
      
      
      {/* Ship icon in center pointing at bearing */}
      <g transform={`translate(${center}, ${center}) rotate(${bearing}) scale(0.18)`}>
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
      
      {/* Bearing text */}
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
      
      {/* Distance text if available */}
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
function TargetDetailsSection({ target, ownVesselData }: { target: TTMTarget | TLLTarget, ownVesselData?: any }) {
  const isTTM = target.source === 'ttm';
  const isTLL = target.source === 'tll';

  // For TTM targets, we already have distance and bearing
  const ttmDistance = isTTM ? (target as TTMTarget).distance : null;
  const ttmBearing = isTTM ? (target as TTMTarget).bearing : null;

  // For TLL targets, calculate distance and bearing if we have own vessel position
  let tllDistance = null;
  let tllBearing = null;
  let tllLat = null;
  let tllLon = null;

  if (isTLL) {
    const tllTarget = target as TLLTarget;
    tllLat = tllTarget.latitude;
    tllLon = tllTarget.longitude;

    if (ownVesselData && Number.isFinite(ownVesselData.latitude) && Number.isFinite(ownVesselData.longitude)) {
      tllDistance = haversineDistanceNM(ownVesselData.latitude, ownVesselData.longitude, tllLat, tllLon);
      tllBearing = bearingFromTo(ownVesselData.latitude, ownVesselData.longitude, tllLat, tllLon);
    }
  }

  const displayDistance = isTTM ? ttmDistance : tllDistance;
  const displayBearing = isTTM ? ttmBearing : tllBearing;

  return (
    <Stack gap="lg">
      {/* Radar Visualization */}
      {displayBearing !== null && (
        <Card shadow="sm" radius="md" p="lg" withBorder>
          <Stack align="center" gap="md">
            <Text fw={700} size="lg" c="blue" mb="sm">Target Position</Text>
            <ShipRadar 
              bearing={displayBearing} 
              distance={displayDistance || undefined}
              maxRange={20}
            />
          </Stack>
        </Card>
      )}

      {/* Target Details Card */}
      <Card shadow="sm" radius="md" p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={700} size="lg" c="blue">Target Details</Text>
          <Badge
            color={target.source === 'ttm' ? 'grape' : 'cyan'}
            variant="filled"
            size="lg"
          >
            {target.source.toUpperCase()} - T{target.target_number}
          </Badge>
        </Group>

        {/* TTM Specific Data */}
        {isTTM && (
          <>
            {(target as TTMTarget).status && (
              <Group gap="xs" mb="sm">
                <Text size="sm" c="dimmed">Status:</Text>
                <Badge size="sm" color="green" variant="light">
                  {(target as TTMTarget).status}
                </Badge>
              </Group>
            )}

            {(target as TTMTarget).reference && (
              <Group gap="xs" mb="md">
                <Text size="sm" c="dimmed">Reference:</Text>
                <Badge size="sm" color="blue" variant="light">
                  {(target as TTMTarget).reference}
                </Badge>
              </Group>
            )}

            {/* Radar Data Section */}
            <Group gap="xs" mb="md">
              <IconRadar size={18} color="var(--mantine-color-grape-6)" />
              <Text fw={600} size="md">Radar Data</Text>
            </Group>

            <Stack gap="xs" mb="md" pl="md" style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Distance:</Text>
                <Text size="sm" fw={500} c="grape">
                  {(target as TTMTarget).distance.toFixed(2)} NM
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">Bearing:</Text>
                <Text size="sm" fw={500} c="grape">
                  {(target as TTMTarget).bearing.toFixed(0)}°
                </Text>
              </Group>
            </Stack>

            {/* Navigation Data */}
            <Group gap="xs" mb="md">
              <IconSend size={18} color="var(--mantine-color-orange-6)" />
              <Text fw={600} size="md">Navigation</Text>
            </Group>

            <Stack gap="xs" mb="md" pl="md" style={{ backgroundColor: '#fff3e0', padding: '12px', borderRadius: '8px' }}>
              {Number.isFinite((target as TTMTarget).speed) && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Speed:</Text>
                  <Text size="sm" fw={500} c="orange">
                    {(target as TTMTarget).speed.toFixed(1)} kts
                  </Text>
                </Group>
              )}

              {Number.isFinite((target as TTMTarget).course) && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Course:</Text>
                  <Text size="sm" fw={500} c="orange">
                    {(target as TTMTarget).course.toFixed(0)}°
                  </Text>
                </Group>
              )}
            </Stack>

            {/* CPA Data */}
            {((target as TTMTarget).cpa !== undefined || (target as TTMTarget).tcpa !== undefined) && (
              <>
                <Group gap="xs" mb="md">
                  <IconCompass size={18} color="var(--mantine-color-red-6)" />
                  <Text fw={600} size="md">Collision Avoidance</Text>
                </Group>

                <Stack gap="xs" mb="md" pl="md" style={{ backgroundColor: '#ffebee', padding: '12px', borderRadius: '8px' }}>
                  {(target as TTMTarget).cpa !== undefined && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">CPA (Closest Point):</Text>
                      <Text size="sm" fw={500} c="red">
                        {(target as TTMTarget).cpa?.toFixed(2)} NM
                      </Text>
                    </Group>
                  )}

                  {(target as TTMTarget).tcpa !== undefined && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">TCPA (Time to CPA):</Text>
                      <Text size="sm" fw={500} c="red">
                        {(target as TTMTarget).tcpa?.toFixed(1)} min
                      </Text>
                    </Group>
                  )}
                </Stack>
              </>
            )}
          </>
        )}

        {/* TLL Specific Data */}
        {isTLL && (
          <>
            {/* Position Information */}
            <Group gap="xs" mb="md">
              <IconMapPin size={18} color="var(--mantine-color-blue-6)" />
              <Text fw={600} size="md">Position</Text>
            </Group>

            <Stack gap="xs" mb="md" pl="md" style={{ backgroundColor: '#e7f5ff', padding: '12px', borderRadius: '8px' }}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Latitude:</Text>
                <Group gap="xs">
                  <Text size="sm" fw={500}>{tllLat?.toFixed(6)}°</Text>
                  <CopyButton value={tllLat?.toFixed(6) || ''}>
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
                  <Text size="sm" fw={500}>{tllLon?.toFixed(6)}°</Text>
                  <CopyButton value={tllLon?.toFixed(6) || ''}>
                    {({ copied, copy }) => (
                      <ActionIcon size="xs" color={copied ? 'teal' : 'gray'} onClick={copy}>
                        <IconCopy size={10} />
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
              </Group>

              {(target as TLLTarget).label && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Label:</Text>
                  <Text size="sm" fw={500} c="blue">
                    {(target as TLLTarget).label}
                  </Text>
                </Group>
              )}

              {(target as TLLTarget).timestamp && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Timestamp:</Text>
                  <Text size="xs" fw={500} c="dimmed">
                    {new Date((target as TLLTarget).timestamp!).toLocaleString()}
                  </Text>
                </Group>
              )}
            </Stack>
          </>
        )}

        {/* Relative Position (for both TTM and TLL) */}
        {displayDistance !== null && displayBearing !== null && (
          <>
            <Group gap="xs" mb="md">
              <IconCompass size={18} color="var(--mantine-color-blue-6)" />
              <Text fw={600} size="md">Relative Position</Text>
            </Group>

            <Stack gap="xs" pl="md" style={{ backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '8px' }}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Distance from Own Vessel:</Text>
                <Text size="sm" fw={500} c="green">
                  {displayDistance.toFixed(2)} NM
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">Bearing from Own Vessel:</Text>
                <Text size="sm" fw={500} c="green">
                  {displayBearing.toFixed(0)}°
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
      {/* Show target details if a target is selected */}
      {selectedTarget ? (
        <TargetDetailsSection target={selectedTarget} ownVesselData={ownVesselData} />
      ) : (
        <Card shadow="sm" radius="md" p="xl" withBorder>
          <Stack align="center" gap="md">
            <IconRadar size={48} color="var(--mantine-color-gray-5)" />
            <Text size="lg" fw={500} c="dimmed">No Target Selected</Text>
            <Text size="sm" c="dimmed" ta="center">
              Click on a target in the radar display to view detailed information here.
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}