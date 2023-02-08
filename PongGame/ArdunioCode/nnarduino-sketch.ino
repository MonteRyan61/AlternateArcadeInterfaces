#include "src/ArduinoJson/ArduinoJson.h"
#include "src/MemoryFree/MemoryFree.h"

/**
 * nnarduino 
 * 
 * Sketch to communicate between JavaScript / NodeJS and Arduino.
 * (c) 99°, David Bascom
 * 
 * You must include the ArduinoJson-library to make this sketch work.
 * Go to "Sketch --> Add Library" and search for the "ArduinoJson" library.
 * See: https://arduinojson.org/v6/doc/installation/ 
 * 
 * -----------------------------------------------------------------------
 * Example JSON-requests:
 * 
 * ------------------------------------
 * DEMO SENSORS
 * 
 * // button
 * {"id":"1", "cmd":[{"addSensor":{"pin":2, "type":10}}]}
 * // potentiometer
 * {"id":"1","cmd":[{"addSensor":{"pin":14, "type":20}}]}
 * // rotary encoder
 * {"id":"1","cmd":[{"addSensor":{"pin":5, "dt":4, "sw":3, "type":30}}]}
 *
 * -------------------------------------
 * OTHER CMDs
 * 
 * Handshake
 * {"id":"123", "cmd":[{"handshake":true}]}
 * 
 * // set interval for reading and sending pin values to 100ms
 * {"id":"123", "cmd":[{"setIV":100}]}
 * 
 * // blink pin 13
 * {"id":"123", "cmd":[{"blink":{"pin":13}}]}
 * 
 * // blink LED_BUILTIN 3x
 * {"id":"123", "cmd":[{"blink":true},{"blink":true},{"blink":true},{"blink":true}]}
 *
 * // pinMode(13, INPUT);
 * {"id":"123", "cmd":[{"pinMode":{"pin":13, "mode":0}}]}
 * 
 * // pinMode(13, OUTPUT);
 * {"id":"123", "cmd":[{"pinMode":{"pin":13, "mode":1}}]}
 * 
 * // digitalWrite(13, HIGH);
 * {"id":"123", "cmd":[{"digitalWrite":{"pin":13, "val":1}}]}
 * 
 * // digitalWrite(13, LOW);
 * {"id":"123", "cmd":[{"digitalWrite":{"pin":13, "val":0}}]}
 *
 * // Turn on PIN 13
 * {"id":"123", "cmd":[{"pinMode":{"pin":13, "mode":1}}, {"digitalWrite":{"pin":13, "val":1}}]}
 *
 * // Turn off PIN 13
 * {"id":"123", "cmd":[{"pinMode":{"pin":13, "mode":1}}, {"digitalWrite":{"pin":13, "val":0}}]}
 *
 * // digitalWrite(13, HIGH);
 * {"id":"123", "cmd":[{"digitalWrite":{"pin":13, "val":1}}]}
 * 
 * // digitalWrite(13, LOW);
 * {"id":"123", "cmd":[{"digitalWrite":{"pin":13, "val":0}}]}
 *
 * // Register a SENSOR_BUTTON sensor (= 10) on pin 5
 * {"id":"123", "cmd":[{"addSensor":{"pin":5, "type":10}}]}
 * 
 * // UN-register a sensor on pin 5 (stop watching)
 * {"id":"123", "cmd":[{"addSensor":{"pin":5, "type":0}}]}
 *
 * -----------------------------------------------------------------------
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * 
 */

// Baud rate to use
#define BAUD_RATE 9600
#define NNARDUINO_VERSION 0.1

// Uncomment all sensors you are using
#define NO_SENSOR 0
#define SENSOR_BUTTON 10
#define SENSOR_POTENTIOMETER 20
#define SENSOR_ROTARY_ENCODER 30
#define SENSOR_ULTRASONIC 80
#define SENSOR_JOYSTICK 90

// Number of pins to check
const unsigned int NUM_TOTAL_PINS = NUM_DIGITAL_PINS + NUM_ANALOG_INPUTS;

// The max size of the JSON to be read from the serialport
const unsigned int MAX_JSON_REQUEST_SIZE = 128;

// marks the end of the JSON-string in the request. (!) use single quotes to define a single character!
const unsigned int END_TOKEN = '\n';

// create a char-array with a size of MAX_JSON_REQUEST_SIZE chars
char jsonBuffer[MAX_JSON_REQUEST_SIZE];

// current char-position in jsonBuffer char-array
unsigned int jsonBufferPos = 0;

// flag to ignore all input till the next END_TOKEN-token
bool ignoreJsonBuffer = false;

// last tstamp when pins were read.
unsigned long lastRun = 0;

// Interval to read pins and send the values to JS
unsigned int runInterval = 30;


// --------------------------------------------------------------------
// Storage of the pin configurations

typedef struct {
   unsigned int type;       // stores the type of sensor, i.e. `10` for a SENSOR_BUTTON 
   bool callUpdate;         // `true` if the `update_SENSOR_NAME()` function needs to be calles on every `loop()`
   int lastVal;             // stores the last value of the pin after runInterval 
   int curVal;              // stores the current value, i.e. if the value was updated during `update_SENSOR_NAME()`
   int v1;                  // variable that can be used to store flags and values
   int v2;                  // variable that can be used to store flags and values
   char pin2;               // can store additional pin number, i.e. for the SENSOR_ROTARY_ENCODER 
   char pin3;               // can store additional pin number
   unsigned long lastRun;   // last time `update_SENSOR_NAME()` was called
} PinConfig;

// array storing configuration for every pin. Key is the pinNumber
PinConfig registeredPins[NUM_TOTAL_PINS];

// --------------------------------------------------------------------
// Main

void setup() {
  Serial.begin( BAUD_RATE );

  for (int i = 0; i < NUM_TOTAL_PINS; i++) {
    registeredPins[i].lastVal = 9999;
  }  
}

void loop() {

  callPinUpdate();
  
  if (millis() - lastRun > runInterval) {
    readPins();
    lastRun = millis();
  }
    
  readSerialCommands();
}

// --------------------------------------------------------------------
// JSON helpers

String jsonEncodeVar( String key, String val, bool commaBefore = true ) {
  String str = "";
  if (commaBefore) str = str + ",";
  str = str + "\"" + String(key) + "\":\"" + String(val) + "\"";
  return str;
}

String jsonEncodeVar( String key, float val, bool commaBefore = true ) {
  String str = "";
  if (commaBefore) str = str + ",";
  str = str + "\"" + String(key) + "\":";
  if ((int) val*1 == val*1) {
    str = str + (int) val;
  } else {
    str = str + val;
  }
  return str;
}

void sendJsonVar( String key, char* val, bool commaBefore = true) {
  String str = jsonEncodeVar(key, val, commaBefore );
  Serial.print( str );
}

void sendJsonVar( String key, float val, bool commaBefore = true ) {
  String str = jsonEncodeVar(key, val, commaBefore );
  Serial.print( str );
}

void sendResponse( StaticJsonDocument<256> obj ) {
   serializeJson(obj, Serial);
   Serial.println();
}

void sendError( int code, String message ) {
   Serial.println("{\"error\":1, \"status\":" + String(code) + ", \"message\":\"" + String(message) + "\"}");
}

// --------------------------------------------------------------------
// PIN helpers

unsigned int getPinUpdateInterval( JsonObject &conf, unsigned int defaultValue = 1000 ) {
  if (conf["iv"]) {
    return conf["iv"].as<unsigned int>();
  }
  return defaultValue;
}

void registerPin( int pinNum, JsonObject conf ) {
  
  int type = conf["type"];
  
  PinConfig &pinConf = registeredPins[pinNum];
  pinConf.type = type;

  pinMode(pinNum, INPUT);
  
  #ifdef SENSOR_ROTARY_ENCODER
    if (type == SENSOR_ROTARY_ENCODER) {
      pinConf.callUpdate = true;
      pinConf.curVal = 1;
      pinConf.pin2 = conf["dt"].as<unsigned int>();
      pinConf.pin3 = conf["sw"].as<unsigned int>();
      pinMode(pinConf.pin2, INPUT);
      pinMode(pinConf.pin3, INPUT);
    }
  #endif

  #ifdef SENSOR_ULTRASONIC
    if (type == SENSOR_ULTRASONIC) {
      pinConf.callUpdate = true;
      pinConf.pin2 = conf["trig"].as<unsigned int>();
      pinConf.v1 = getPinUpdateInterval( conf, 200 );
      pinMode(pinConf.pin2, OUTPUT);
    }
  #endif

  #ifdef SENSOR_JOYSTICK
    if (type == SENSOR_JOYSTICK) {
      pinConf.pin2 = conf["vry"].as<unsigned int>();
      pinConf.pin3 = conf["sw"].as<unsigned int>();
      pinMode(pinConf.pin2, INPUT);
      if (pinConf.pin3 >= 2) {
        pinMode(pinConf.pin3, INPUT_PULLUP);
      }
    }
  #endif
  
}

bool pinValueChanged( int pinNum, int newValue, int tolerance = 0 ) {
  int oldValue = registeredPins[pinNum].lastVal;
  registeredPins[pinNum].lastVal = newValue;
  return abs(oldValue - newValue) > tolerance;
}
