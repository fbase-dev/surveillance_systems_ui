import { Stack } from "@mantine/core";
import AboutSection from "./AboutSection";
import ContactsSection from "./ContactsSection";
import RadarSection from "../RadarSection";

export default function AboutTab() {
  return (
    <Stack gap={"lg"}>
      <RadarSection />
      <AboutSection />
      <ContactsSection />
    </Stack>
  );
}
