import { useCamera } from "@/contexts/CameraControlContext";
import { Stack, ActionIcon } from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import styles from "@/styles/camera.module.css";

export default function PanControl() {
  const { control, status } = useCamera();

  return (
    <Stack gap={"xs"}>
      <ActionIcon
        size={"lg"}
        color="#030E1BE5"
        onClick={() => control("zoom_in")}
        disabled={status === "active"}
        className={styles.button}
      >
        <IconPlus size={24} />
      </ActionIcon>
      <ActionIcon
        size={"lg"}
        color="#030E1BE5"
        onClick={() => control("zoom_out")}
        disabled={status === "active"}
        className={styles.button}
      >
        <IconMinus size={24} />
      </ActionIcon>
    </Stack>
  );
}
