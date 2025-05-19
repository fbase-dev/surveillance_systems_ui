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
  return axios.get(`${API_BASE}${radio_endpoints.get_frequency}`);
};

export const getRadioOpMode = async () =>{
    axios.get(`${API_BASE}${radio_endpoints.trigger_frequency}`);
    return axios.get(`${API_BASE}${radio_endpoints.get_op_mode}`);
};

export const getRadioVolume = async() =>{
    axios.get(`${API_BASE}${radio_endpoints.trigger_volume}`)
    return axios.get(`${API_BASE}${radio_endpoints.get_volume}`);
};

export const setRadioVolume = (value:number) =>
  axios.get(`${API_BASE}${radio_endpoints.set_volume} ${value}`);

export const setRadioOpMode = (value:string) =>
  axios.get(`${API_BASE}${radio_endpoints.change_mode} ${value}`);

export const setRadioFrequency = (value:string) =>
  axios.get(`${API_BASE}${radio_endpoints.set_frequency} ${value}`);