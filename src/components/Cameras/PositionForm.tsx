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
import { useEffect } from "react";

export default function PositionForm() {
  const { positionForm, submitPositionForm, loading, position } = useCamera();


  useEffect(() => {
    if (position) {
      positionForm.setValues({
        pan: position.pan ?? 0,
        tilt: position.tilt ?? 0,
      });
    }
  }, [position?.pan, position?.tilt]);

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
            min={0}
            max={90}
            decimalScale={2}
            step={0.1}
            value={positionForm.values.pan}
            onChange={(value) => positionForm.setFieldValue('pan', typeof value === 'number' ? value : 0)}
          />
          <NumberInput
            withAsterisk
            label="Tilt"
            placeholder="0.00°"
            min={0}
            max={50}
            decimalScale={2}
            step={0.1}
            value={positionForm.values.tilt}
            onChange={(value) => positionForm.setFieldValue('tilt', typeof value === 'number' ? value : 0)}
          />
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button loading={loading} type="submit">Submit</Button>
        </Group>
      </form>
    </Card>
  );
}