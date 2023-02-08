// {"id":"1", "cmd":[{"addSensor":{"pin":2, "type":10}}]}
bool read_SENSOR_BUTTON( int pinNum, String &result, PinConfig &conf ) {
  unsigned int val = digitalRead( pinNum );
  result += jsonEncodeVar("val", val, false);
  return pinValueChanged( pinNum, val );
}
