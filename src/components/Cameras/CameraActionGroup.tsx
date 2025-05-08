import { Button, Flex, Title } from "@mantine/core";
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
