import { Tabs, TabsList, TabsPanel, TabsTab } from "@mantine/core";
import { useState } from "react";
import AboutTab from "./AboutTab";
import { useDashboard } from "@/contexts/DashboardContext";


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

export default function DetailsCardTab() {
  const [activeTab, setActiveTab] = useState<string | null>("about");
  const { selectedVessel, ownAisData } = useDashboard();


  const selectedTarget: Target | undefined = selectedVessel ? {
    targetId: selectedVessel.targetId,
    target_number: selectedVessel.target_number,
    latitude: selectedVessel.lat || selectedVessel.lat,
    longitude: selectedVessel.lon || selectedVessel.lon,
    speed: selectedVessel.speed,
    course: selectedVessel.course,
    target_status: selectedVessel.target_status,
    source: selectedVessel.source || 'unknown'
  } : undefined;

  // Convert ownAisData to proper format
  const ownVesselData = ownAisData ? {
    latitude: Number(ownAisData.lat),
    longitude: Number(ownAisData.lon),
    heading: Number(ownAisData.heading)
  } : undefined;

  return (
    <Tabs value={activeTab} onChange={setActiveTab} p={"md"}>
      <TabsList mx={"-md"} mb={"md"} justify="center">
        <TabsTab value="about" w={"45%"} py={"md"} fw={600}>About</TabsTab>
        <TabsTab value="activity" w={"45%"} py={"md"} fw={600}>Activity</TabsTab>
      </TabsList>

      <TabsPanel value="about" px={"md"}>
        <AboutTab selectedTarget={selectedTarget} ownVesselData={ownVesselData} />
      </TabsPanel>
      <TabsPanel value="activity">
        <ActivityPanel selectedTarget={selectedTarget} />
      </TabsPanel>
    </Tabs>
  );
}

// Activity Panel Component
function ActivityPanel({ selectedTarget }: { selectedTarget?: Target }) {
  if (!selectedTarget) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--mantine-color-dimmed)' }}>
        Select a target on the radar to view activity details
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      <h4>Target Activity</h4>
      <p style={{ color: 'var(--mantine-color-dimmed)', fontSize: '14px' }}>
        Activity tracking for {selectedTarget.source?.toUpperCase()} target{' '}
        {selectedTarget.targetId || selectedTarget.target_number}
      </p>
      
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
        <p style={{ fontSize: '13px', margin: '0 0 8px 0', fontWeight: 600 }}>Available Data:</p>
        <ul style={{ fontSize: '12px', color: 'var(--mantine-color-dimmed)', margin: 0, paddingLeft: '1.2rem' }}>
          <li>Source: {selectedTarget.source}</li>
          <li>Last Position: {selectedTarget.lat}, {selectedTarget.lon}</li>
          {selectedTarget.speed && <li>Current Speed: {selectedTarget.speed} kts</li>}
          {selectedTarget.course && <li>Current Course: {selectedTarget.course}°</li>}
          {selectedTarget.target_status && <li>Status: {selectedTarget.target_status}</li>}
        </ul>
      </div>
    </div>
  );
}