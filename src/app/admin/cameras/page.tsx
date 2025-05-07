"use client"
import CamCard from "@/components/Cameras/CamCard";
import CameraControls from "@/components/Cameras/CameraControls";
import { CameraControlProvider } from "@/contexts/CameraControlContext";
import { Stack } from "@mantine/core";

export default function Cameras(){
    return(
        <CameraControlProvider>
            <Stack pos={"relative"}>
                <CamCard />
                <CameraControls />
            </Stack>
        </CameraControlProvider>
    )
}