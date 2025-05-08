import axios from 'axios';
import { ais_endpoints, camera_control_endpoints } from '../endpoints';

export const getOwnAisData = () => axios.get(`/api/ais?path=${ais_endpoints.own_vessels}`);

export const getOtherAisData = () => axios.get(`/api/ais?path=${ais_endpoints.other_vessels}`);

export const getTargetLocation = () => axios.get(`/api/ais?path=${ais_endpoints.target_location}`);

export const getTrackingData = () => axios.get(`/api/ais?path=${ais_endpoints.tracking_data}`);

export const getCameraStatus = () => axios.get(`/api/ais?path=${camera_control_endpoints.status}`);
  