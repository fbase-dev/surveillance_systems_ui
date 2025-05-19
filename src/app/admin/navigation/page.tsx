"use client";
import RadioControl from "@/components/RadioControl";
import DetailsCard from "@/components/Navigation/DetailsCard";
import VesselsMap from "@/components/Navigation/VesselsMap";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Grid, GridCol, Paper } from "@mantine/core";
import { RadioProvider } from "@/contexts/RadioContext";

export default function Navigation() {
  return (
    <DashboardProvider>
      <RadioProvider>
        <Grid>
          <GridCol span={8} pos={"relative"}>
            <VesselsMap />
            <Paper p={"md"} pos={"absolute"} bottom={25} left={25} w={"95%"}>
              <RadioControl />
            </Paper>
          </GridCol>
          <GridCol span={4}>
            <DetailsCard />
          </GridCol>
        </Grid>
      </RadioProvider>
    </DashboardProvider>
  );
}
