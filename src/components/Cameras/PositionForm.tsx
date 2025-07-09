import { useCamera } from "@/contexts/CameraControlContext";
import {
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Stack,
  Title,
} from "@mantine/core";

export default function PositionForm() {
  const { positionForm, submitPositionForm, loading } = useCamera();
  return (
    <Card w={400}>
      <Title order={5}>Manual Control</Title>
      <Divider my={"md"} />
      <form onSubmit={positionForm.onSubmit(submitPositionForm)}>
        <Stack gap={"md"}>
          <NumberInput
            withAsterisk
            label="Pan"
            placeholder="0.00°"
            key={positionForm.key("pan")}
            {...positionForm.getInputProps("pan")}
          />
          <NumberInput
            withAsterisk
            label="Tilt"
            placeholder="0.00°"
            key={positionForm.key("tilt")}
            {...positionForm.getInputProps("tilt")}
          />
          <NumberInput
            withAsterisk
            label="Zoom"
            placeholder="0.00"
            key={positionForm.key("zoom")}
            {...positionForm.getInputProps("zoom")}
          />
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button loading={loading} type="submit">Submit</Button>
        </Group>
      </form>
    </Card>
  );
}
