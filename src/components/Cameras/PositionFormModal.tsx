import { useCamera } from "@/contexts/CameraControlContext";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
} from "@mantine/core";

export default function PositionFormModal() {
  const { modalHandler, modalOpened, positionForm, submitPositionForm, loading } = useCamera();
  return (
    <Modal
      opened={modalOpened}
      onClose={modalHandler.close}
      title="Set Camera Custom Position"
      closeOnEscape={false}
      withCloseButton={false}
    >
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
          <Button disabled={loading} color={"red"}>Close</Button>
          <Button loading={loading} type="submit">Submit</Button>
        </Group>
      </form>
    </Modal>
  );
}
