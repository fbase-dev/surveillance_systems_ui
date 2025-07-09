import { useCamera } from "@/contexts/CameraControlContext";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { Flex, Modal, Paper, Stack } from "@mantine/core";
import CamCard from "../CamCard";
import CameraControls from "./CameraControls";
import PositionForm from "./PositionForm";

export default function CameraModal() {
  const { modalOpened, modalHandler } = useCamera();
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
        <Stack my={"md"}>
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