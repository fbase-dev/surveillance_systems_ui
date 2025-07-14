import axios from "axios";
import { camera_control_endpoints } from "../endpoints";
import { CameraPosition } from "@/types/CameraPosition";

const API_BASE = "/api/camera?path=";

export const getCameraPosition = () =>
  axios.get(`${API_BASE}${camera_control_endpoints.manual_position}`);

// export const getLiveTrackingPosition = () =>
//   axios.get(`${API_BASE}${camera_control_endpoints.live_position}`);


export const sendCameraMovement = async(direction: string) => {
  await axios.get(`${API_BASE}${camera_control_endpoints.move}${direction}`)
}

export const pauseCamera = () => 
  axios.get(`${API_BASE}${camera_control_endpoints.control}pause`);

export const resumeCamera = () => 
  axios.get(`${API_BASE}${camera_control_endpoints.control}resume`);


export const setCameraPosition = async (params: CameraPosition) => {
  const payload = new URLSearchParams({
    pan: params.pan.toString(),
    tilt: params.tilt.toString(),
  });

  await axios.post(
    `${API_BASE}${camera_control_endpoints.set_position}?${encodeURIComponent(payload.toString())}`,
    payload.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
};
