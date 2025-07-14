import { useCamera } from "@/contexts/CameraControlContext";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Button, Flex, Modal, Paper, Stack } from "@mantine/core";
import CamCard from "../CamCard";
import CameraControls from "./CameraControls";
import PositionForm from "./PositionForm";
import { IconRefresh } from "@tabler/icons-react";

export default function CameraModal() {
  const { modalOpened, modalHandler, reset } = useCamera();
  const {streamURLs} = useVideoFeed();
  return (
    <Modal
      opened={modalOpened}
      onClose={modalHandler.close}
      fullScreen
      title="Camera Control"
      styles={{
        body:{
            padding: 0
        }
      }}
    >
      <Flex justify={"space-around"} align={"center"}>
        <Stack my={"md"} gap={"md"}>
            <Button onClick={reset} leftSection={<IconRefresh />} variant="subtle">Reset Position</Button>
            <PositionForm />
            <CameraControls />
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