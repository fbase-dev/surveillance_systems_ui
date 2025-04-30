import { Button, Flex, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import Property from "./Property";

export default function AboutSection() {
  return (
    <Stack gap={"sm"}>
      <Flex justify={"space-between"} align={"center"}>
        <Text fz={"md"} fw={"bold"} c={"deep-blue.6"}>
          About
        </Text>
        <Button
          size="xs"
          c={"#14B8FF"}
          variant="light"
          leftSection={<IconEdit />}
        >
          Edit
        </Button>
      </Flex>
      <Property title="Call Sign" value="TDK" />
      <Property title="Port of Registry" value="100-200kg" />
      <Property title="Sea Area" value="Area 1" />
      <Property title="Weight" value="100t" />
      <Property title="Orders" value="122" />
      <Property title="IMO" value="123451" />
      <Property title="MMSI" value="123451" />
      <Property title="Year built" value="2012" />
      <Property title="Upcoming Services" value="14 services" />
      <Property title="Equipments" value="12 equipments" />
    </Stack>
  );
}
