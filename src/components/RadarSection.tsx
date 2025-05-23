import { Stack, Flex, Text } from "@mantine/core";
import { ReactNode } from "react";
import ShipRadar from "./ShipRadar";
import DmsCoordinates from "dms-conversion";
import { useDashboard } from "@/contexts/DashboardContext";

type MetricProps = {
  title: string;
  value: string | ReactNode;
  textAlign?: "left" | "right" | "center" | "justify";
};

export function Metric({ title, value, textAlign = "left" }: MetricProps) {
  return (
    <Stack gap="0">
      <Text c="deep-blue.6">{title}</Text>
      {typeof value === "string" ? (
        <Text fz={"xs"} ta={textAlign}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Stack>
  );
}

export default function RadarSection() {
  const { ownAisData } = useDashboard();
  
  const { heading, lat, lon, speed } = ownAisData || {};
  const aisDms = new DmsCoordinates(
    Number(lat || 0),
    Number(lon || 0)
  );
  const longDms = aisDms.longitude.toString(0);
  const latDms = aisDms.latitude.toString(0);

  return (
    <Flex justify={"center"} align={"center"} pos={"relative"} p={"lg"}>
      <Flex
        justify={"space-between"}
        w={"100%"}
        pos={"absolute"}
        top={0}
        left={0}
      >
        <Metric title={"Speed"} value={`${speed||"10"} kn`} />
        <Metric title={"Orientation"} value="NE" textAlign="right" />
      </Flex>
      <ShipRadar heading={heading} />
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
              <Text fz={"xs"}>{latDms}</Text>
              <Text fz={"xs"}>{longDms}</Text>
            </Stack>
          }
        />
      </Flex>
    </Flex>
  );
}
