export const ais_endpoints = {
  other_vessels: "/ais_data/other",
  own_vessels: "/ais_data/own",
  target_location: "/target_location_batch",
  tracking_data: "/tracking_data",
};

export const camera_control_endpoints = {
  manual_position: "/status",
  // live_position: "/current_positionn",
  move: "/move?direction=",
  control: "/control?command=",
  status: "/status",
  reset: "/startup",
  set_position: "/goto"
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

export const locations_enpoints = {
  get_locations: "/api/locations",
}