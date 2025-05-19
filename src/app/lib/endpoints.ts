export const ais_endpoints = {
  other_vessels: "/ais_data/other",
  own_vessels: "/ais_data/own",
  target_location: "/target_location_batch",
  tracking_data: "/tracking_data",
};

export const camera_control_endpoints = {
  stream: "/video_feed",
  manual_position: "/current_position",
  live_position: "/current_positionn",
  control: "/control",
  status: "/status"
}

export const radio_endpoints = {
  radio_status: "/get_radio_power",
  turn_on: "/set_command?command=turn_on",
  turn_off: "/set_command?command=turn_off",
  trigger_frequency: "/set_command?command=get_frequency",
  get_frequency: "/get_response",
  trigger_op_mode: "/set_command?command=get_mode",
  get_op_mode: "/get_mode",
  change_mode: "/set_command?command=change_mode",
  set_volume: "/set_command?command=setSquelchLevel",
  trigger_volume: "/set_command?command=readSquelchLevel",
  get_volume: "/get_squelch_level",
  set_frequency: "/set_command?command=set_frequency"
}