nnarduino
==============
#### Build a bridge between an Arduino Microcontroller and p5js to create Computer Generated Art. 
This will let the visitors of your digital exhibition or installation generate graphics and patterns using buttons, sensors, switches, potentiometers, gyroscopes etc.

Please refer to the [documentation](https://labor.99grad.de/typo3-docs/nnarduino/) for more infos.

#### The main concept is:
- Use **JSON** to communicate between NodeJS or JavaScript and the Arduino Board
- Get the Board connected as **fast and smart** as possible
- Have **autodetect features** for the hardware, reducing the need to write long configurations
- Keep the methods to wire a physical sensor to p5js as **simple and intuitive** as `createButton()`
- Make it easy to deploy the project as a **standalone application**, i.e. for exhibits or art installations

#### Example: Simple Push-Button
To demonstrate how easy it is, to connect a sensor with p5.js, have a look at the following sketch. Note that this is **not** an Arduino Sketch in C++ - it is written in JavaScript with p5js.

The physical button is connected to PIN 2 of the Arduino. To make p5js “watch” the button, all we need to do is write `button = connectSensor( SENSOR_BUTTON, 2 );` The library will automatically search for the right port, connect with the Microcontroller, configure the pin and add an EventListener.

In the sketch, pressing the button will reduce the size of the circle on the canvas. Nothing really creative… but it saved you the headache that makes you uncreative!
```
import {sketch} from 'nnarduino/lib/adapter/p5.adapter';
import 'p5/lib/addons/p5.sound';

let button;

function setup () {
   createCanvas(400, 400);
   button = connectSensor( SENSOR_BUTTON, 2 );
}

function draw () {
   background( 255 );
   if (button.value() == 1) {
      circle( 200, 200, 50 );
   } else {
      circle( 200, 200, 100 );
   }
}
```

#### What you'll need to get started:

| Download                                                                     | Needed for...                                       |
|------------------------------------------------------------------------------|-----------------------------------------------------|
| [NodeJS](https://nodejs.org/en/)                                             | npm for installing packages from the command line   |
| [Arduino IDE](https://www.arduino.cc/en/software)                            | software for uploading scripts to the Arduino board |
| [arduino-p5js](https://bitbucket.org/99grad/arduino-p5js/downloads/)         | the quick-start-template / boilerplate              |
| [nnarduino-sketch](https://bitbucket.org/99grad/nnarduino-sketch/downloads/) | the sketch that is uploaded on the Arduino          |

Please refer to the [documentation](https://labor.99grad.de/typo3-docs/nnarduino/) for more infos.

#### License

(The MIT License)
Copyright (c) 2022 www.99grad.de, David Bascom <david@99grad.de>
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
