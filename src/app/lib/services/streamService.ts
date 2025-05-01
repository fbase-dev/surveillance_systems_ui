import { stream_api } from '../api';
import { stream_endpoints } from '../endpoints';

export const getStream = () => stream_api.get(stream_endpoints.stream);