import { useCamera } from "@/contexts/CameraControlContext";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Button, Flex, Modal, Paper, Stack } from "@mantine/core";
import CamCard from "../CamCard";
import CameraControls from "./CameraControls";
import PositionForm from "./PositionForm";
import { IconRefresh, IconSettings } from "@tabler/icons-react";


export default function CameraModal() {
  const { modalOpened, modalHandler, reset, recalibrate, loading } = useCamera();
  const { streamURLs } = useVideoFeed();

  return (
    <Modal
      opened={modalOpened}
      onClose={modalHandler.close}
      fullScreen
      title="Camera Control"
      styles={{
        body: {
          padding: 0
        }
      }}
    >
      <Flex justify={"space-around"} align={"center"}>
        <Stack my={"md"} gap={"md"}>
          <Button
            onClick={reset}
            leftSection={<IconRefresh />}
            variant="subtle"
            loading={loading}
            disabled={loading}
          >
            Reset Position
          </Button>

          <PositionForm />
          <CameraControls />
         

          <Button
            onClick={recalibrate}
            leftSection={<IconSettings />}
            variant="light"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Recalibrating..." : "Recalibrate Camera"}
          </Button>
        </Stack>
        <Paper miw={"70%"}>
          <CamCard
            height={"83vh"}
            streamUrl={streamURLs.stream_1}
            title=""
          />
        </Paper>
      </Flex>
    </Modal>
  );
}