"use client"
import CamCard from "@/components/Cameras/CamCard";
import CameraControl from "@/components/Cameras/CameraControl";
import { Stack } from "@mantine/core";

export default function Cameras(){
    return(
        <Stack pos={"relative"}>
            <CamCard />
            <CameraControl />
        </Stack>
    )
}