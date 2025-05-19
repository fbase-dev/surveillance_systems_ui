import axios from "axios";
import { radio_endpoints } from "../endpoints";

const API_BASE = "/api/radio?path=";

export const getRadioStatus = () =>
  axios.get(`${API_BASE}${radio_endpoints.radio_status}`);

export const turnRadioOn = () =>
  axios.get(`${API_BASE}${radio_endpoints.turn_on}`);

export const turnRadioOff = () =>
  axios.get(`${API_BASE}${radio_endpoints.turn_off}`);

export const getRadioFrequency = async () => {
  await axios.get(`${API_BASE}${radio_endpoints.trigger_frequency}`);
  await new Promise(resolve => setTimeout(resolve, 8000));
  const response = axios.get(`${API_BASE}${radio_endpoints.get_frequency}`);
  return response;
};

export const getRadioOpMode = async () =>{
  await axios.get(`${API_BASE}${radio_endpoints.trigger_op_mode}`);
  await new Promise(resolve => setTimeout(resolve, 15000));
  const response = axios.get(`${API_BASE}${radio_endpoints.get_op_mode}`);
  return response;
};

export const getRadioVolume = async () => {
  await axios.get(`${API_BASE}${radio_endpoints.trigger_volume}`);
  await new Promise(resolve => setTimeout(resolve, 8000));
  const response = await axios.get(`${API_BASE}${radio_endpoints.get_volume}`);
  return response;
};

export const setRadioVolume = (value:number) =>
  axios.get(`${API_BASE}${radio_endpoints.set_volume} ${value}`);

export const setRadioOpMode = (value:string) =>
  axios.get(`${API_BASE}${radio_endpoints.change_mode} ${value}`);

export const setRadioFrequency = (value:string) =>
  axios.get(`${API_BASE}${radio_endpoints.set_frequency} ${value}`);