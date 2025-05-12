"use client";
import FrequencyControl from "@/components/FrequencyControl";
import DetailsCard from "@/components/Navigation/DetailsCard";
import VesselsMap from "@/components/Navigation/VesselsMap";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Grid, GridCol, Paper } from "@mantine/core";

export default function Navigation() {
  return (
    <DashboardProvider>
      <Grid>
        <GridCol span={8} pos={"relative"}>
          <VesselsMap />
          <Paper p={"md"} pos={"absolute"} bottom={25} left={25} w={"95%"}>
            <FrequencyControl />
          </Paper>
        </GridCol>
        <GridCol span={4}>
          <DetailsCard />
        </GridCol>
      </Grid>
    </DashboardProvider>
  );
}
