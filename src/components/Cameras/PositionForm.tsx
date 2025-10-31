import { useCamera } from "@/contexts/CameraControlContext";
import {
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

export default function PositionForm() {
  const { positionForm, submitPositionForm, loading, position, goTo } = useCamera();
  const [goToValue, setGoToValue] = useState<string>(""); 

  useEffect(() => {
    if (position) {
      positionForm.setValues({
        pan: position.pan ?? 0,
        tilt: position.tilt ?? 0,
      });
    }
  }, [position?.pan, position?.tilt]);

  // Handle Go To Position
  const handleGoTo = async () => {
    if (!goToValue.trim()) return;

    try {
      const [pan, tilt] = goToValue.split(",").map((v) => parseFloat(v.trim()));
      if (isNaN(pan) || isNaN(tilt)) {
        alert("Invalid input. Use format like 40,50");
        return;
      }
      await goTo(pan, tilt);
      setGoToValue("");
    } catch (error) {
      console.error("Failed to go to position:", error);
    }
  };

  return (
    <Card w={400}>
      <Title order={5}>Manual Control</Title>
      <Divider my="md" />

      <form onSubmit={positionForm.onSubmit(submitPositionForm)}>
        <Stack gap="md">
        
          <NumberInput
            withAsterisk
            label="Pan"
            placeholder="0.00°"
            min={0}
            max={90}
            decimalScale={2}
            step={0.1}
            value={positionForm.values.pan}
            onChange={(value) =>
              positionForm.setFieldValue("pan", typeof value === "number" ? value : 0)
            }
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
            onChange={(value) =>
              positionForm.setFieldValue("tilt", typeof value === "number" ? value : 0)
            }
          />

          <Group justify="flex-end" mt="md">
            <Button loading={loading} type="submit">
              Submit
            </Button>
          </Group>

       
          <Divider my="sm" label="Go to Position" labelPosition="center" />
          <TextInput
            label="Enter Position"
            placeholder="e.g. 40,50"
            value={goToValue}
            onChange={(e) => setGoToValue(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="xs">
            <Button onClick={handleGoTo} loading={loading}>
              Go
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
