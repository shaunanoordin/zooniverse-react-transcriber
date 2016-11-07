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
    Jimp.read(inputPaths[i], function (err, data) {
      if (err) throw err;
      inputImages.push(data);  //Order doesn't matter
      process();
    });
  }
};

function process() {
  //Sanity check
  //--------------------------------
  console.log("input loaded: " + inputImages.length + " / " + inputPaths.length);
  if (inputImages.length < inputPaths.length) return;
  if (inputImages.length === 0) return;
  //--------------------------------
  
  //Prepare the Output file (aggregate image)
  //--------------------------------
  var width = (inputImages[0].bitmap.width) ? inputImages[0].bitmap.width : 0;
  var height = (inputImages[0].bitmap.height) ? inputImages[0].bitmap.height : 0;
  var outputImage = new Jimp(width, height, function (err, image) {});
  //--------------------------------
  
  //For every pixel, get the aggregate of the pixels of each Input image (Classification)
  //--------------------------------
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var inputPixel = inputImages.reduce(function(prev, cur) {
        var pixel = Jimp.intToRGBA(cur.getPixelColor(x, y));
        prev.r += pixel.r / inputImages.length;
        prev.g += pixel.g / inputImages.length;
        prev.b += pixel.b / inputImages.length;
        prev.a += pixel.a / inputImages.length;
        return prev;
      }, {r: 0, g: 0, b: 0, a: 0});
      
      //Fudge fudge fudge
      inputPixel.r = 0;
      inputPixel.g = 0;
      inputPixel.b = 0;
      inputPixel.a = 255 - inputPixel.a;
      
      outputImage.setPixelColor(Jimp.rgbaToInt(inputPixel.r, inputPixel.g, inputPixel.b, inputPixel.a), x, y);
      
      /*outputImage.setPixelColor(
        Jimp.rgbaToInt(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), 255),
        x, y);*/
      
      /*var r, g, b, a = 0;
      for (var i = 0; i < inputImages.length; i++) {
        var pixel = Jimp.intToRGBA(inputImages[i].getPixelColor(x, y));
        
        if (x === 178 && y === 242)
          console.log(pixel.r, pixel.g, pixel.b, pixel.a);
        
        r += pixel.r / inputImages.length;
        g += pixel.g / inputImages.length;
        b += pixel.b / inputImages.length;
        a += pixel.a / inputImages.length;
      }*/
    } 
  }
  //--------------------------------
  
  //Write the output file
  //--------------------------------
  var OUTPUT_PATH = './aggregation/output.png';
  outputImage.write(OUTPUT_PATH);
  //--------------------------------
};

init();
