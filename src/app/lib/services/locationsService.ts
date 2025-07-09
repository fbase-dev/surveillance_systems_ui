import axios from "axios";
import { locations_enpoints } from "../endpoints";

const API_BASE = "/api/locations?path=";

export const getLocations = () =>
  axios.get(`${API_BASE}${locations_enpoints.get_locations}`);