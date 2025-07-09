import axios from "axios";
import { camera_control_endpoints } from "../endpoints";

const API_BASE = "/api/camera?path=";

export const getCameraPosition = () =>
  axios.get(`${API_BASE}${camera_control_endpoints.manual_position}`);

export const getLiveTrackingPosition = () =>
  axios.get(`${API_BASE}${camera_control_endpoints.live_position}`);

export const sendCameraCommand = async (
  action: string,
  params: Record<string, any> = {}
) => {
  const payload = new URLSearchParams({ action });

  Object.entries(params).forEach(([key, value]) => {
    payload.append(key, value);
  });

  await axios.post(`/api/camera?path=/control`, payload.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};