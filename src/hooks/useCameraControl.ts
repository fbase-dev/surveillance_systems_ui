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
import { isInRange, useForm } from "@mantine/form";
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
      zoom: position.zoom || 0,
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
      // ✅ Pass current position for comparison
      await setCameraPosition(values, position);
      positionForm.reset();
    } catch (error) {
      console.error("Failed to send camera position:", error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const fetchCachePosition = async () => {
    try {
      const response = await getCameraPosition();
      setPosition(response.data);
      positionForm.setValues(response.data);
    } catch (error) {
      console.error("Error fetching cache position", error);
    }
  };

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

  const move = async (fn: () => Promise<any>) => {
    setLoading(true);
    try {
      await fn();
    } catch (error) {
      console.log(error);
    } finally {
      await fetchCachePosition();
      await fetchStatus();
      setLoading(false);
    }
  };

  const up = () => move(moveUp);
  const down = () => move(moveDown);
  const left = () => move(moveLeft);
  const right = () => move(moveRight);
  const pause = () => move(pauseCamera);
  const resume = () => move(resumeCamera);
  const reset = () => move(resetCamera);
  const recalibrate = () => move(recalibrateCamera);

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
    submitPositionForm,
  };
};
