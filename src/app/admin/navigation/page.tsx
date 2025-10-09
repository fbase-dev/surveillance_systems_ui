"use client";
import DetailsCard from "@/components/Navigation/DetailsCard";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Grid, GridCol, Tabs, Card, Center, Loader, Text } from "@mantine/core";
import { RadioProvider } from "@/contexts/RadioContext";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import RaderDetailsCard from "@/components/Dashboard/DetailsCard";

const RadarDisplay = dynamic(() => import("@/components/Dashboard/RadarDisplay"), {
  ssr: false,
  loading: () => (
    <Card shadow="sm" p="xl" radius="md" withBorder>
      <Center h={400}>
        <Loader size="lg" />
      </Center>
      <Text ta="center" mt="md" c="dimmed">
        Loading radar display...
      </Text>
    </Card>
  ),
});

const RadarDisplayTab = dynamic(() => import("@/components/RaderTab"), {
  ssr: false,
  loading: () => (
    <Card shadow="sm" p="xl" radius="md" withBorder>
      <Center h={400}>
        <Loader size="lg" />
      </Center>
      <Text ta="center" mt="md" c="dimmed">
        Loading radar display...
      </Text>
    </Card>
  ),
});

export default function Navigation() {
  // Separate state for AIS
  const [aisSelectedTarget, setAisSelectedTarget] = useState<any>(null);
  const [aisOwnVesselData, setAisOwnVesselData] = useState<any>(null);
  
  // Separate state for Radar
  const [radarSelectedTarget, setRadarSelectedTarget] = useState<any>(null);
  const [radarOwnVesselData, setRadarOwnVesselData] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState("ais");

  // Clear selection when switching tabs (optional but recommended)
  useEffect(() => {
    // Optionally clear selections when switching tabs
    // Uncomment if you want to reset selection on tab change
    /*
    if (activeTab === "ais") {
      setRadarSelectedTarget(null);
    } else {
      setAisSelectedTarget(null);
    }
    */
  }, [activeTab]);

  return (
    <DashboardProvider>
      <RadioProvider>
        <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
          <Tabs.List>
            <Tabs.Tab value="ais">AIS</Tabs.Tab>
            <Tabs.Tab value="radar">Radar</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ais">
            <Grid>
              <GridCol span={8} pos="relative">
                <RadarDisplay 
                  onTargetSelect={setAisSelectedTarget}
                  onOwnVesselUpdate={setAisOwnVesselData} 
                />
              </GridCol>
              <GridCol span={4}>
                <DetailsCard 
                  selectedTarget={aisSelectedTarget}
                  ownVesselData={aisOwnVesselData} 
                />
              </GridCol>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="radar">
            <Grid>
              <GridCol span={8} pos="relative">
                <RadarDisplayTab 
                  onTargetSelect={setRadarSelectedTarget}
                  onOwnVesselUpdate={setRadarOwnVesselData} 
                />
              </GridCol>
              <GridCol span={4}>
                <RaderDetailsCard 
                  selectedTarget={radarSelectedTarget}
                  ownVesselData={radarOwnVesselData} 
                />
              </GridCol>
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </RadioProvider>
    </DashboardProvider>
  );
}