import { Stack, Card, Group, Text, Badge, Divider, CopyButton, ActionIcon } from "@mantine/core";
import { IconCopy, IconMapPin, IconCompass, IconSend } from '@tabler/icons-react';
import AboutSection from "./AboutSection";
import ContactsSection from "./ContactsSection";
import RadarSection from "../RadarSection";

// Target interface
interface Target {
  targetId?: string;
  target_number?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  course?: number;
  target_status?: string;
  source: string;
  lat?: number;
  lon?: number;
}

interface AboutTabProps {
  selectedTarget?: Target;
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

// Target Details Component
function TargetDetailsSection({ target, ownVesselData }: { target: Target, ownVesselData?: any }) {
  const targetLat = Number(target.latitude ?? target.lat);
  const targetLon = Number(target.longitude ?? target.lon);

  const distance = ownVesselData && Number.isFinite(ownVesselData.latitude) && Number.isFinite(ownVesselData.longitude) ?
    haversineDistanceNM(ownVesselData.latitude, ownVesselData.longitude, targetLat, targetLon) : null;
  const bearing = ownVesselData && Number.isFinite(ownVesselData.latitude) && Number.isFinite(ownVesselData.longitude) ?
    bearingFromTo(ownVesselData.latitude, ownVesselData.longitude, targetLat, targetLon) : null;

  return (
    <Card  radius="md" p="md" mb="lg">
      <Group justify="space-between" mb="md">
        <Text fw={700} size="lg" c="blue">Selected Target</Text>
        <Badge
          color={target.source === 'ttm' ? 'orange' : target.source === 'tll' ? 'cyan' : 'yellow'}
          variant="filled"
        >
          {target.targetId || target.target_number || 'Unknown'}
        </Badge>
      </Group>

      {target.target_status && (
        <Group gap="xs" mb="sm">
          <Text size="sm" c="dimmed">Status:</Text>
          <Badge size="sm" color="green" variant="light">
            {target.target_status}
          </Badge>
        </Group>
      )}



      {/* Position Information */}
      <Group gap="xs" mb="md">
        <IconMapPin size={18} color="var(--mantine-color-blue-6)" />
        <Text fw={600} size="md">Position</Text>
      </Group>

      <Stack gap="xs" mb="md" pl="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Latitude:</Text>
          <Group gap="xs">
            <Text size="sm" fw={500}>{targetLat.toFixed(6)}°</Text>
            <CopyButton value={targetLat.toFixed(6)}>
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
            <Text size="sm" fw={500}>{targetLon.toFixed(6)}°</Text>
            <CopyButton value={targetLon.toFixed(6)}>
              {({ copied, copy }) => (
                <ActionIcon size="xs" color={copied ? 'teal' : 'gray'} onClick={copy}>
                  <IconCopy size={10} />
                </ActionIcon>
              )}
            </CopyButton>
          </Group>
        </Group>
      </Stack>

      {/* Relative Position */}
      {distance !== null && bearing !== null && (
        <>
          <Group gap="xs" mb="md">
            <IconCompass size={18} color="var(--mantine-color-blue-6)" />
            <Text fw={600} size="md">Relative Position</Text>
          </Group>

          <Stack gap="xs" mb="md" pl="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Distance:</Text>
              <Text size="sm" fw={500} c="blue">
                {distance.toFixed(2)} NM
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">Bearing:</Text>
              <Text size="sm" fw={500} c="blue">
                {bearing.toFixed(0)}°
              </Text>
            </Group>
          </Stack>
        </>
      )}

      {/* Navigation Data */}
      {(Number.isFinite(target.speed) || Number.isFinite(target.course)) && (
        <>
          <Group gap="xs" mb="md">
            <IconSend size={18} color="var(--mantine-color-orange-6)" />
            <Text fw={600} size="md">Navigation</Text>
          </Group>

          <Stack gap="xs" pl="md">
            {Number.isFinite(target.speed) && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Speed:</Text>
                <Text size="sm" fw={500} c="orange">
                  {Number(target.speed).toFixed(1)} kts
                </Text>
              </Group>
            )}

            {Number.isFinite(target.course) && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Course:</Text>
                <Text size="sm" fw={500} c="orange">
                  {Number(target.course).toFixed(0)}°
                </Text>
              </Group>
            )}
          </Stack>
        </>
      )}
    </Card>
  );
}

export default function AboutTab({ selectedTarget, ownVesselData }: AboutTabProps) {
  return (
    <Stack gap={"lg"}>
      <RadarSection />
      {/* Show target details if a target is selected */}
      {selectedTarget && (
        <TargetDetailsSection target={selectedTarget} ownVesselData={ownVesselData} />
      )}

      {/* Existing sections */}

      {/* <RadarSection />
      <AboutSection />
      <ContactsSection /> */}
    </Stack>
  );
}