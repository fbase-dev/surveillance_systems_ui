import { useEffect, useState } from "react";
import {
  getCameraPosition,
  pauseCamera,
  resetCamera,
  resumeCamera,
  sendCameraMovement,
  setCameraPosition,
} from "../app/lib/services/cameraService";
import { getCameraStatus } from "@/app/lib/services/aisService";
import { useDisclosure } from "@mantine/hooks";
import { isInRange, useForm } from '@mantine/form';
import { CameraPosition } from "@/types/CameraPosition";

export const useCameraControl = () => {
  const [position, setPosition] = useState<CameraPosition>({ pan: 0, tilt: 0}); // store camera position
  const [status, setStatus] = useState<string>(""); //store camera status
  const [modalOpened, modalHandler] = useDisclosure(false); // manage position form modal
  const [loading, setLoading] = useState<boolean>(false);
  
  const positionForm = useForm<CameraPosition>({
    mode: "uncontrolled",
    validateInputOnChange: true,
    validateInputOnBlur: true,
    initialValues:{
      pan: position.pan,
      tilt: position.tilt,
      // zoom: position.zoom
    },
    validate: {
        pan: isInRange({min:0, max:90}, "Pan must be between 0 and 90"),
        tilt: isInRange({min:0, max:90}, "Tilt must be between 0 and 90"),
    },
  })

  const submitPositionForm = async(values: typeof positionForm.values)=>{
    setLoading(true);
    try{
      await setCameraPosition(values);
      positionForm.reset();
      
    } catch (error){
      console.error("Failed to send camera position:", error)
    }finally{
      await fetchCachePosition();  //update position
      await fetchStatus(); // update status
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
  //  const fetchLivePosition = async () => {
  //   try {
  //     const response = await getLiveTrackingPosition(); 
  //     setPosition(response.data);
  //   } catch (error) {
  //     console.error("Error fetching live position", error);
  //   }
  // };

  // Control the camera (send commands like pan, tilt, zoom)
  const move = async (direction:string)=>{
    setLoading(true);
    try{
      await(sendCameraMovement(direction));
    }catch (error) {
      console.log(error)
    }finally{
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const pause = async () => {
    setLoading(true);
    try{
      await pauseCamera();
    }catch (error) {
      console.log (error)
    }finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(true);
    }
  };

  const resume = async () => {
    setLoading(true);
    try{
      await resumeCamera();
    }catch (error) {
      console.log (error)
    }finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(true);
    }
  };

  const reset = async () => {
    setLoading(true);
    try{
      await resetCamera();
    }catch (error) {
      console.log (error)
    }finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  }


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
    pause,
    resume,
    move,
    reset,
    fetchCachePosition,
    // fetchLivePosition,
    submitPositionForm
  };
};
