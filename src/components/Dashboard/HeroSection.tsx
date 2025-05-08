import { Paper } from "@mantine/core";

export default function HeroSection() {
  return (
    <Paper
      h={"90vh"}
      w={"100vw"}
      p={0}
      pe={"lg"}
      mt={"-md"}
      ms={"-md"}
      me={"lg"}
      style={{
        backgroundImage:
          "linear-gradient( to bottom,rgba(14, 52, 101, 0.66),  #0C1F36 )",
      }}
      radius={0}
    >
      <Paper
        w={"66.67%"}
        h={"100%"}
        radius={0}
        style={{
          backgroundImage:
            "linear-gradient( to bottom,  #0E346500,rgba(12, 31, 54, 0.3) ), url(/images/hero_section.webp)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPositionY: "25%"
        }}
      />
    </Paper>
  );
}
