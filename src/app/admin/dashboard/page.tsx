"use client"
import CamCard from "@/components/Dashboard/CamCard";
import DetailsCard from "@/components/Dashboard/DetailsCard";
import FrequencyCard from "@/components/Dashboard/FrequencyCard";
import HeroSection from "@/components/Dashboard/HeroSection";
import MapCard from "@/components/Dashboard/MapCard";
import { Grid, GridCol, SimpleGrid, Stack } from "@mantine/core";

export default function Dashboard(){
    
    return(
        <Grid>
            <GridCol span={8}>
                <Stack gap={"md"}>
                    <HeroSection />
                    <SimpleGrid cols={2} spacing={"md"}>
                        <CamCard />
                        <MapCard />
                    </SimpleGrid>
                    <FrequencyCard />
                </Stack>
            </GridCol>
            <GridCol span={4}>
                <DetailsCard />
            </GridCol>
        </Grid>
    )
}