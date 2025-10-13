import { useCamera } from "@/contexts/CameraControlContext";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Button, Flex, Modal, Paper, Stack } from "@mantine/core";
import CamCard from "../CamCard";
import CameraControls from "./CameraControls";
import PositionForm from "./PositionForm";
import { IconRefresh, IconSettings } from "@tabler/icons-react";
import { useState } from "react";

export default function CameraModal() {
  const { modalOpened, modalHandler, reset } = useCamera();
  const { streamURLs } = useVideoFeed();
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const handleRecalibrate = async () => {
    setIsRecalibrating(true);
    try {
      const formData = new FormData();


      const response = await fetch(`/api/camera?path=/recalibrate`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Recalibration failed: ${response.status}`);
      }

      console.log("Camera recalibration completed successfully");

    } catch (error) {
      console.error("Recalibration error:", error);
    } finally {
      setIsRecalibrating(false);
    }
  };

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
          <Button onClick={reset} leftSection={<IconRefresh />} variant="subtle">
            Reset Position
          </Button>

          <PositionForm />
          <CameraControls />
          <Button
            onClick={handleRecalibrate}
            leftSection={<IconSettings />}
            variant="light"
            loading={isRecalibrating}
            disabled={isRecalibrating}
          >
            {isRecalibrating ? "Recalibrating..." : "Recalibrate Camera"}
          </Button>
        </Stack>
        <Paper miw={"70%"}>
          <CamCard
            height={"83vh"}
            streamUrl={streamURLs.stream_1}
            // objectFit="contain"
            // withBorder={false}
            title=""
          />
        </Paper>
      </Flex>
    </Modal>
  );
};
