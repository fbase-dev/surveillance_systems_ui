import { useCamera } from "@/contexts/CameraControlContext";
import { Stack, ActionIcon } from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";

export default function PanControl() {
  const { control } = useCamera();

  return (
    <Stack gap={"xs"}>
      <ActionIcon
        size={"lg"}
        color="#030E1BE5"
        onClick={() => control("zoom_in")}
      >
        <IconPlus size={24} />
      </ActionIcon>
      <ActionIcon
        size={"lg"}
        color="#030E1BE5"
        onClick={() => control("zoom_out")}
      >
        <IconMinus size={24} />
      </ActionIcon>
    </Stack>
  );
}
