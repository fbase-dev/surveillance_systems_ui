"use client"
import CamCard from "@/components/Dashboard/CamCard";
import DetailsCard from "@/components/Dashboard/DetailsCard";
import RadioCard from "@/components/Dashboard/RadioCard";
import MapCard from "@/components/Dashboard/MapCard";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { RadioProvider } from "@/contexts/RadioContext";
import { Grid, GridCol, SimpleGrid, Stack } from "@mantine/core";
import dynamic from 'next/dynamic';

const RadarDisplay = dynamic(() => import("@/components/Dashboard/RadarDisplay"), { ssr: false });

export default function Dashboard(){
    
    return(
        <DashboardProvider>
            <RadioProvider>
                <Grid>
                    <GridCol span={8}>
                        <Stack gap={"md"}>
                            <RadarDisplay />
                            {/* <HeroSection /> */}
                            <SimpleGrid cols={2} spacing={"md"}>
                                <CamCard />
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