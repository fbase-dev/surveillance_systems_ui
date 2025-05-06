import { BackgroundImage, Card, Image, Paper, Stack } from "@mantine/core";
import RadarSection from "../RadarSection";

export default function AboutTab() {
  return (
    <Stack gap={"md"} p={0}>
    <Paper h={"35vh"}>
        <BackgroundImage src="/images/ship.png" h={"100%"}  />
    </Paper>
      <Paper p={"md"}>
        <RadarSection />
      </Paper>
    </Stack>
  );
}
