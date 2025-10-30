import axios from "axios";
import { CameraPosition } from "@/types/CameraPosition";

const API_BASE = "/api/camera";

// Generic helper for commands
const sendCommand = async (cmd: string) => {
  return axios.post(`${API_BASE}?path=/camera`, { cmd }, {
    headers: { "Content-Type": "application/json" },
  });
};

// Get cached camera position
export const getCameraPosition = () => axios.get(`${API_BASE}?path=/manual_position`);

// Send generic control
export const sendCameraControl = async (command: string) => await sendCommand(command);

// Movement commands
export const moveUp = () => sendCommand("up");
export const moveDown = () => sendCommand("down");
export const moveLeft = () => sendCommand("left");
export const moveRight = () => sendCommand("right");

// Pan/Tilt/Zoom
export const panCamera = (angle: number) => sendCommand(`pan:${angle}`);
export const tiltCamera = (angle: number) => sendCommand(`tilt:${angle}`);
export const zoomCamera = (level: number) => sendCommand(`zoom:${level}`);

// State controls
export const pauseCamera = () => sendCommand("pause");
export const resumeCamera = () => sendCommand("resume");
export const resetCamera = () => sendCommand("reset");
export const recalibrateCamera = () => sendCommand("recalibrate");

// Combined positioning
export const setCameraPosition = async (params: CameraPosition) => {
  await sendCommand(`pan:${params.pan}`);
  await sendCommand(`tilt:${params.tilt}`);
  if (params.zoom !== undefined) await sendCommand(`zoom:${params.zoom}`);
};


export const goToPosition = async (pan: number, tilt: number) => {
  const cmd = `${pan},${tilt}`; 
  return sendCommand(cmd);      
};