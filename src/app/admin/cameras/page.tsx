"use client"
import CamCards from "@/components/Cameras/CamCards";
import CameraActionGroup from "@/components/Cameras/CameraActionGroup";
import CameraModal from "@/components/Cameras/CameraModal";
import { CameraControlProvider } from "@/contexts/CameraControlContext";

export default function Cameras(){
    return(
        <CameraControlProvider>
            <CameraModal />
            <CameraActionGroup />
            <CamCards />
        </CameraControlProvider>
    )
}