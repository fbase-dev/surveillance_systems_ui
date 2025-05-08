"use client"
import CamCard from "@/components/Cameras/CamCard";
import CameraActionGroup from "@/components/Cameras/CameraActionGroup";
import CameraControls from "@/components/Cameras/CameraControls";
import PositionFormModal from "@/components/Cameras/PositionFormModal";
import { CameraControlProvider } from "@/contexts/CameraControlContext";
import { Stack } from "@mantine/core";

export default function Cameras(){
    return(
        <CameraControlProvider>
            <PositionFormModal />
            <CameraActionGroup />
            <Stack pos={"relative"}>
                <CamCard />
                <CameraControls />
            </Stack>
        </CameraControlProvider>
    )
}