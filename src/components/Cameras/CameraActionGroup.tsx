import { ButtonGroup, Flex, Title } from "@mantine/core";
import { useState } from "react";
import { DatePickerInput, DateValue } from '@mantine/dates';

export default function CameraActionGroup() {
  const [value, setValue] = useState<DateValue | undefined>(undefined);
  return (
    <Flex justify={"space-between"}>
        <Title order={3}>Camera Management</Title>
      <ButtonGroup>
        <DatePickerInput
          placeholder="Pick date"
          value={value}
          onChange={setValue}
        />
      </ButtonGroup>
    </Flex>
  );
}
