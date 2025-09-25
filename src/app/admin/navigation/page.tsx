"use client";
import DetailsCard from "@/components/Navigation/DetailsCard";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Grid, GridCol, Tabs, Card, Center, Loader, Text,  } from "@mantine/core";
import { RadioProvider } from "@/contexts/RadioContext";
import { useState } from "react";
import dynamic from 'next/dynamic';

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

export default function Navigation() {
  const [activeTab, setActiveTab] = useState("ais");

  return (
    <DashboardProvider>
      <RadioProvider>
        <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>

          <Tabs.List >
            <Tabs.Tab value="ais">AIS</Tabs.Tab>
            <Tabs.Tab value="radar">Radar</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ais">
           
            <Grid>
              <GridCol span={8} pos={"relative"}>
                <RadarDisplay />
                {/* <Paper p={"md"} pos={"absolute"} bottom={25} left={25} w={"95%"}>
                  <RadioControl />
                </Paper> */}
              </GridCol>
              <GridCol span={4}>
                <DetailsCard />
              </GridCol>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="radar">
            <Grid>
              <GridCol span={8} pos={"relative"}>
                <RadarDisplay />
                {/* <Paper p={"md"} pos={"absolute"} bottom={10} left={25} w={"95%"}>
                  <RadioControl />
                </Paper> */}
              </GridCol>
              <GridCol span={4}>
                <DetailsCard />
              </GridCol>
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </RadioProvider>
    </DashboardProvider>
  );
}
