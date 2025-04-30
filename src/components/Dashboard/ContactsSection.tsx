import { Stack, Flex, Button, Text } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import Property from "./Property";

export default function ContactsSection() {
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
      <Property title="Captain" value="John Doe" />
      <Property title="Role" value="Lead Sailor" />
    </Stack>
  );
}
