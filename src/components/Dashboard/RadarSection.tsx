import { Stack, Flex, Text } from "@mantine/core";
import { useState, useEffect, ReactNode } from "react";
import ShipRadar from "./ShipRadar";

type MetricProps = {
  title: string;
  value: string | ReactNode;
  textAlign?: "left" | "right" | "center" | "justify";
};

export function Metric({ title, value, textAlign = "left" }: MetricProps) {
  return (
    <Stack gap="0">
      <Text c="deep-blue.6">{title}</Text>
      {typeof value === "string" ? <Text fz={"xs"} ta={textAlign}>{value}</Text> : value}
    </Stack>
  );
}

export default function () {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    // Simulate heading changes
    const interval = setInterval(() => {
      setHeading((prev) => (prev + 5) % 360);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <Flex justify={"center"} align={"center"} pos={"relative"} p={"lg"}>
      <Flex
        justify={"space-between"}
        w={"100%"}
        pos={"absolute"}
        top={0}
        left={0}
      >
        <Metric title={"Speed"} value="12.8kts" />
        <Metric title={"Orientation"} value="NE" textAlign="right" />
      </Flex>
      <ShipRadar
        heading={heading}
        speed={12.8}
        orientation="NE"
        coordinates="4.4941° N, 7.5149° E"
        markers={[
          { x: 50, y: 80, color: "limegreen" },
          { x: 150, y: 60, color: "yellow" },
        ]}
      />
      <Flex
        justify={"space-between"}
        w={"100%"}
        pos={"absolute"}
        bottom={0}
        left={0}
      >
        <Metric
          title={"Coordinates"}
          value={
            <Stack gap={0}>
              <Text fz={"xs"}>23°26'13.7'' N</Text>
              <Text fz={"xs"}>23°26'13.7'' S</Text>
            </Stack>
          }
        />
      </Flex>
    </Flex>
  );
}
