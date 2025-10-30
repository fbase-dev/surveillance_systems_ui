import { useEffect, useState } from "react";
import {
  getCameraPosition,
  pauseCamera,
  resetCamera,
  resumeCamera,
  sendCameraControl,
  setCameraPosition,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
   goToPosition,
  recalibrateCamera,
} from "../app/lib/services/cameraService";
import { getCameraStatus } from "@/app/lib/services/aisService";
import { useDisclosure } from "@mantine/hooks";
import { isInRange, useForm } from '@mantine/form';
import { CameraPosition } from "@/types/CameraPosition";

export const useCameraControl = () => {
  const [position, setPosition] = useState<CameraPosition>({ pan: 0, tilt: 0, zoom: 0 });
  const [status, setStatus] = useState<string>("");
  const [modalOpened, modalHandler] = useDisclosure(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const positionForm = useForm<CameraPosition>({
    mode: "uncontrolled",
    validateInputOnChange: true,
    validateInputOnBlur: true,
    initialValues: {
      pan: position.pan,
      tilt: position.tilt,
      zoom: position.zoom || 0
    },
    validate: {
      pan: isInRange({ min: 0, max: 90 }, "Pan must be between 0 and 90"),
      tilt: isInRange({ min: 0, max: 90 }, "Tilt must be between 0 and 90"),
      zoom: isInRange({ min: 0, max: 90 }, "Zoom must be between 0 and 90"),
    },
  });

  const submitPositionForm = async (values: typeof positionForm.values) => {
    setLoading(true);
    try {
      await setCameraPosition(values);
      positionForm.reset();
    } catch (error) {
      console.error("Failed to send camera position:", error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

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

  // Control the camera (send commands like pan, tilt, zoom)
  const control = async (command: string) => {
    setLoading(true);
    try {
      await sendCameraControl(command);
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  // Movement controls
  const up = async () => {
    setLoading(true);
    try {
      await moveUp();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const down = async () => {
    setLoading(true);
    try {
      await moveDown();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const left = async () => {
    setLoading(true);
    try {
      await moveLeft();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const right = async () => {
    setLoading(true);
    try {
      await moveRight();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const pause = async () => {
    setLoading(true);
    try {
      await pauseCamera();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const resume = async () => {
    setLoading(true);
    try {
      await resumeCamera();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const reset = async () => {
    setLoading(true);
    try {
      await resetCamera();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const recalibrate = async () => {
    setLoading(true);
    try {
      await recalibrateCamera();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  // Fetch the status of the camera
  const fetchStatus = async () => {
    try {
      const response = await getCameraStatus();
      setStatus(response.data.status);
    } catch (error) {
      console.error("Error retrieving camera status", error);
    }
  };
  const goTo = async (pan: number, tilt: number) => {
  setLoading(true);
  try {
    await goToPosition(pan, tilt);
  } catch (error) {
    console.error("Failed to go to position:", error);
  } finally {
    await fetchCachePosition();
    await fetchStatus();
    setLoading(false);
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
    control,
    reset,
    recalibrate,
    up,
    down,
    left,
    right,
    goTo,
    fetchCachePosition,
    submitPositionForm
  };
};