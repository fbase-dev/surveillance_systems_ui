import axios from "axios";

export const ais_api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AIS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const stream_api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_STREAM_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
