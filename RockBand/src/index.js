
import {sketch, p5} from 'nnarduino/lib/adapter/p5.adapter'
import 'p5/lib/addons/p5.sound'

window.addEventListener('error', (event) => {
    Arduino.openDevTools()
})

console._log = console.log
console.log = function () {
    console._log( ...arguments )
    Arduino.openDevTools()
}
window.debug = console.log

p5.prototype._createCanvas = p5.prototype.createCanvas

p5.prototype.createCanvas = function ( w, h, renderer ) {
    Arduino.resizeWindow( w, h )
    return this._createCanvas( w, h, renderer )
}

Arduino.injectSketchJs()