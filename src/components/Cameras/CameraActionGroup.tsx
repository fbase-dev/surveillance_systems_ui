import { Button, ButtonGroup, Flex, Title } from "@mantine/core";
import { useState } from "react";
import { DatePickerInput, DateValue } from '@mantine/dates';
import { useCamera } from "@/contexts/CameraControlContext";

export default function CameraActionGroup() {
  const {modalHandler} = useCamera();

  return (
    <Flex justify={"space-between"} mb={"md"}>
        <Title order={3}>Camera Management</Title>
      <Button onClick={modalHandler.open}>Set Position</Button>
    </Flex>
  );
}
