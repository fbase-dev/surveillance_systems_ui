import axios from 'axios';
import { camera_control_endpoints } from '../endpoints';

// This returns a blob
export const getStream = () =>
  axios.get(`/api/camera?path=${camera_control_endpoints.stream}`, {
    responseType: 'blob', // Important!
  });
