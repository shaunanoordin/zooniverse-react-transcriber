/*
Usage:
> node aggregation/painter.js
 */

console.log('PAINTER AGGREGATOR');

var Jimp = require("jimp");

var inputPaths = [
  "./aggregation/sample-classification-1.png",
  "./aggregation/sample-classification-2.png",
  "./aggregation/sample-classification-3.png",
  "./aggregation/sample-classification-4.png",
  "./aggregation/sample-classification-5.png",
];
var inputImages = [];

function init() {
  if (inputPaths.length === 0) {
    console.log("ERROR: nothing to process.");
    return;
  }
  
  for (var i = 0; i < inputPaths.length; i++) {
    Jimp.read(inputPaths[0], function (err, data) {
      if (err) throw err;
      inputImages.push(data);  //Order doesn't matter
      process();
    });
  }
};

function process() {
  console.log("input loaded: " + inputImages.length + " / " + inputPaths.length);
  if (inputImages.length < inputPaths.length) return;
  
  var width = (inputImages[0].bitmap.width) ? inputImages[0].bitmap.width : 0;
  var height = (inputImages[0].bitmap.height) ? inputImages[0].bitmap.height : 0;
  var outputImage = new Jimp(width, height, function (err, image) {});
  
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      //Jimp.rgbaToInt(r, g, b, a);
      outputImage.setPixelColor(Jimp.rgbaToInt(random255(), random255(), random255(), 255), x, y);
    } 
  }
  
  var OUTPUT_PATH = './aggregation/output.png';
  outputImage.write(OUTPUT_PATH);
};

function random255() {
  return Math.floor(Math.random() * 256);
}

init();
