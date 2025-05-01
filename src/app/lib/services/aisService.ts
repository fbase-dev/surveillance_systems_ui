import { ais_api } from '../api';
import { ais_endpoints } from '../endpoints';

export const getOwnAisData = () => ais_api.get(ais_endpoints.own_vessels);

export const getOtherAisData = () => ais_api.get(ais_endpoints.other_vessels);

export const getTargetLocation = () => ais_api.get(ais_endpoints.target_location);

export const getTrackingData = () => ais_api.get(ais_endpoints.tracking_data);