import { useEffect, useState } from "react";
import {
  getCameraPosition,
  getLiveTrackingPosition,
  sendCameraCommand,
} from "../app/lib/services/cameraService";
import { getCameraStatus } from "@/app/lib/services/aisService";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from '@mantine/form';
import { CameraPosition } from "@/types/CameraPosition";

export const useCameraControl = () => {
  const [position, setPosition] = useState<CameraPosition>({ pan: 0, tilt: 0, zoom: 0 }); // store camera position
  const [status, setStatus] = useState<string>(""); //store camera status
  const [modalOpened, modalHandler] = useDisclosure(false); // manage position form modal
  const [loading, setLoading] = useState<boolean>(false);
  
  const positionForm = useForm<Partial<CameraPosition>>({
    mode: "uncontrolled",
    initialValues:{
      pan: position.pan,
      tilt: position.tilt,
      zoom: position.zoom
    }
  })

  const submitPositionForm = async(values: typeof positionForm.values)=>{
    setLoading(true);
    try{
      await sendCameraCommand("set_position", values);
      positionForm.reset();
      await fetchCachePosition();  //update position
      await fetchStatus(); // update status
      modalHandler.close(); //close modal
    } catch (error){
      console.error("Failed to send camera position:", error)
    }
    setLoading(false);
  }

  // Fetch the cache position of the camera
  const fetchCachePosition = async () => {
    try {
      const response = await getCameraPosition();
      setPosition(response.data);
      positionForm.setValues(response.data);
    } catch (error) {
      console.error("Error fetching cache position", error);
    }
  };

   // Fetch the live position of the camera
   const fetchLivePosition = async () => {
    try {
      const response = await getLiveTrackingPosition(); 
      setPosition(response.data);
    } catch (error) {
      console.error("Error fetching live position", error);
    }
  };

  // Control the camera (send commands like pan, tilt, zoom)
  const control = async (action: string, extra?: Record<string, any>) => {
    setLoading(true);
    try {
      await sendCameraCommand(action, extra);
      await fetchCachePosition(); 
      await fetchStatus();
    } catch (error) {
      console.error("Error controlling camera", error);
    }
    setLoading(false);
  };

  // Fetch the stastus of the camera
  const fetchStatus = async () => {
    try {
      const response = await getCameraStatus(); 
      setStatus(response.data.status);
    } catch (error) {
      console.error("Error retrieving camera status", error);
    }
  };

  // Fetch camera position and status on component mount
  useEffect(() => {
    fetchCachePosition();
    fetchStatus();
  }, []);

  return {
    position,
    status,
    modalOpened,
    modalHandler,
    positionForm,
    loading,
    control,
    fetchCachePosition,
    fetchLivePosition,
    submitPositionForm
  };
};
