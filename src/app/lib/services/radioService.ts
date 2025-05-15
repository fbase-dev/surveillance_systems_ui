import axios from "axios";
import { radio_endpoints } from "../endpoints";

const API_BASE = "/api/camera?path=";

export const getRadioStatus = () =>
  axios.get(`${API_BASE}${radio_endpoints.radio_status}`);

export const turnRadioOn = () =>
  axios.get(`${API_BASE}${radio_endpoints.turn_on}`);

export const turnRadioOff = () =>
  axios.get(`${API_BASE}${radio_endpoints.turn_off}`);

export const getRadioFrequency = () =>{
    axios.get(`${API_BASE}${radio_endpoints.trigger_frequency}`)
        .then (()=>
            axios.get(`${API_BASE}${radio_endpoints.get_frequency}`)
        )
};

export const getRadioOpMode = () =>{
    axios.get(`${API_BASE}${radio_endpoints.trigger_frequency}`)
        .then (()=>
            axios.get(`${API_BASE}${radio_endpoints.get_op_mode}`)
        )
};

export const getRadioVolume = () =>{
    axios.get(`${API_BASE}${radio_endpoints.trigger_volume}`)
        .then (()=>
            axios.get(`${API_BASE}${radio_endpoints.trigger_volume}`)
        )
};

export const setRadioVolume = (value:string) =>
  axios.get(`${API_BASE}${radio_endpoints.set_volume} ${value}`);

export const setRadioMode = (value:string) =>
  axios.get(`${API_BASE}${radio_endpoints.change_mode} ${value}`);

export const setRadioFrequency = (value:string) =>
  axios.get(`${API_BASE}${radio_endpoints.set_frequency} ${value}`);