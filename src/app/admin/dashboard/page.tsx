"use client"
import DashboardCamCard from "@/components/Dashboard/CamCard";
import DetailsCard from "@/components/Dashboard/DetailsCard";
import RadioCard from "@/components/Dashboard/RadioCard";
import MapCard from "@/components/Dashboard/MapCard";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { RadioProvider } from "@/contexts/RadioContext";
import { Card, Center, Grid, GridCol, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import dynamic from 'next/dynamic';

const RadarDisplay = dynamic(() => import("@/components/Dashboard/RadarDisplay"),{
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

export default function Dashboard(){
    
    return(
        <DashboardProvider>
            <RadioProvider>
                <Grid>
                    <GridCol span={8}>
                        <Stack gap={"md"}>
                            <RadarDisplay />
                            <SimpleGrid cols={2} spacing={"md"}>
                                <DashboardCamCard />
                                <MapCard />
                            </SimpleGrid>
                            <RadioCard />
                        </Stack>
                    </GridCol>
                    <GridCol span={4}>
                        <DetailsCard />
                    </GridCol>
                </Grid>
            </RadioProvider>
        </DashboardProvider>
    )
}