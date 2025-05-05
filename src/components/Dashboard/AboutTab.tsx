import { Stack } from "@mantine/core";
import RadarSection from "./RadarSection";
import AboutSection from "./AboutSection";
import ContactsSection from "./ContactsSection";

export default function AboutTab() {
  return (
    <Stack gap={"lg"}>
      <RadarSection />
      <AboutSection />
      <ContactsSection />
    </Stack>
  );
}
