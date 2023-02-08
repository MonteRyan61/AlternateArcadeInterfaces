// {"id":"1", "cmd":[{"addSensor":{"pin":14, "type":20}}]}
bool read_SENSOR_POTENTIOMETER( int pinNum, String &result, PinConfig &conf ) {
  unsigned int val = analogRead( pinNum );
  result += jsonEncodeVar("val", val, false);
  return pinValueChanged( pinNum, val, 3 );
}
