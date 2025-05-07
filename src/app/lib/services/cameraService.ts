import axios from "axios";
import { camera_control_endpoints } from "../endpoints";

const API_BASE = "/api/camera?path=";

export const getCameraPosition = () =>
  axios.get(`${API_BASE}${camera_control_endpoints.manual_position}`);

export const getLiveTrackingPosition = () =>
  axios.get(`${API_BASE}${camera_control_endpoints.live_position}`);

export const sendCameraCommand = async(
  action: string,
  params: Record<string, any> = {}
) =>{
  const body = new URLSearchParams({ action });
  await axios.post(`/api/camera?path=/control`, body.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
