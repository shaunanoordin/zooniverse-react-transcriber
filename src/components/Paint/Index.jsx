import React from 'react';

const INPUT_IDLE = 0;
const INPUT_ACTIVE = 1;
const INPUT_ENDED = 2;

const DEFAULT_IMAGE_SRC = require('./sample.jpg');

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    
    this.classifierContext = null;
    this.sizeRatioX = 1;
    this.sizeRatioY = 1;
    
    this.pointerState = INPUT_IDLE;
  }
  
  render() {
    return (
      <div>
        <h2>Paint!</h2>
        <div className="painter" ref="painter">
          <canvas className="subject" ref="subject" width="10" height="10"></canvas>
          <canvas className="classifier" ref="classifier" width="10" height="10"></canvas>
        </div>
        <div className="painter-output">
          <h3>Painted Classification Data as Text</h3>
          <input type="text" ref="output" />
          <a ref="download" download="classification.png" onClick={this.download.bind(this)} href="">Download as PNG</a>
          </div>
      </div>
    );
  }
  
  componentDidMount() {
    this.classifierContext = this.refs.classifier.getContext('2d');
    this.loadSubject();
  }
  
  loadSubject(src = null) {
    let imgSrc = (src) ? src : DEFAULT_IMAGE_SRC;
    let imgData = new Image();
    imgData.onload = this.initClassifier.bind(this, imgData);
    imgData.src = imgSrc;
  }
  
  initClassifier(imgData) {
    const imgWidth = imgData.naturalWidth;
    const imgHeight = imgData.naturalHeight;

    this.refs.subject.width = imgWidth;
    this.refs.subject.height = imgHeight;
    this.refs.classifier.width = imgWidth;
    this.refs.classifier.height = imgHeight;

    this.refs.subject.getContext('2d').drawImage(imgData, 0, 0);

    //Bind Events
    //--------------------------------
    if ("onmousedown" in this.refs.classifier && "onmousemove" in this.refs.classifier &&
        "onmouseup" in this.refs.classifier) {
      this.refs.classifier.onmousedown = this.onPointerStart.bind(this);
      this.refs.classifier.onmousemove = this.onPointerMove.bind(this);
      this.refs.classifier.onmouseup = this.onPointerEnd.bind(this);
    }    
    if ("ontouchstart" in this.refs.classifier && "ontouchmove" in this.refs.classifier &&
        "ontouchend" in this.refs.classifier && "ontouchcancel" in this.refs.classifier) {
      this.refs.classifier.ontouchstart = this.onPointerStart.bind(this);
      this.refs.classifier.ontouchmove = this.onPointerMove.bind(this);
      this.refs.classifier.ontouchend = this.onPointerEnd.bind(this);
      this.refs.classifier.ontouchcancel = this.onPointerEnd.bind(this);
    }
    if ("onresize" in window) {
      window.onresize = this.updateSize.bind(this);
    }
    this.updateSize();
    //--------------------------------
  }
  
  paint(pointer) {
    const RADIUS = 10;
    this.classifierContext.fillStyle = '#939';
    this.classifierContext.beginPath();
    this.classifierContext.arc(pointer.x, pointer.y, RADIUS, 0, 2*Math.PI);
    this.classifierContext.fill();
    this.classifierContext.closePath();
  }
  
  download() {
    const dataPng = this.refs.classifier.toDataURL("image/png");
    this.refs.output.value = dataPng;
    this.refs.download.href = dataPng;
    return true;
  }
  
  updateSize() {
    const boundingBox = (this.refs.classifier.getBoundingClientRect)
      ? this.refs.classifier.getBoundingClientRect()
      : { left: 0, top: 0 };
    this.sizeRatioX = this.refs.classifier.width / boundingBox.width;
    this.sizeRatioY = this.refs.classifier.height /boundingBox.height;
  }
  
  stopEvent(e) {
    //var eve = e || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.returnValue = false;
    e.cancelBubble = true;
    return false;
  }
  
  //----------------------------------------------------------------
  
  onPointerStart(e) {
    this.pointerState = INPUT_ACTIVE;
    this.paint(this.getPointerXY(e));
    return this.stopEvent(e);
  }
  
  onPointerMove(e) {
    if (this.pointerState === INPUT_ACTIVE) {
      this.paint(this.getPointerXY(e));
    }
    return this.stopEvent(e);
  }
  
  onPointerEnd(e) {
    this.pointerState = INPUT_ENDED;
    return this.stopEvent(e);
  }
  
  getPointerXY(e) {
    const boundingBox = (this.refs.classifier.getBoundingClientRect)
      ? this.refs.classifier.getBoundingClientRect()
      : { left: 0, top: 0 };    
    let clientX = 0;
    let clientY = 0;
    if (e.clientX && e.clientY) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches.length > 0 && e.touches[0].clientX &&
        e.touches[0].clientY) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    let inputX = (clientX - boundingBox.left) * this.sizeRatioX;
    let inputY = (clientY - boundingBox.top) * this.sizeRatioY;
    return { x: inputX, y: inputY };
  }
}
