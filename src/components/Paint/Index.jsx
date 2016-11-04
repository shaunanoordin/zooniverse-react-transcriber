import React from 'react';

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    this.boundingBox = null;
    this.sizeRatioX = 1;
    this.sizeRatioY = 1;
  }
  
  render() {
    return (
      <div>
        <h2>Paint!</h2>
        <div className="painter" ref="painter">
          <canvas className="subject" ref="subject" width="10" height="10"></canvas>
          <canvas className="classifier" ref="classifier" width="10" height="10"></canvas>
        </div>
      </div>
    );
  }
  
  componentDidMount() {
    this.loadSubject();
  }
  
  loadSubject(src = './sample.jpg') {
    let imgSrc = require(src);
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
    //this.refs.classifier.style.top = '-' + imgHeight + 'px';

    this.updateSize();
  }
  
  updateSize() {
    console.log('!!!!');
    console.log(this.refs);
    const boundingBox = (this.refs.classifier.getBoundingClientRect)
      ? this.refs.classifier.getBoundingClientRect()
      : { left: 0, top: 0 };
    this.boundingBox = boundingBox;
    this.sizeRatioX = this.width / this.boundingBox.width;
    this.sizeRatioY = this.height / this.boundingBox.height;
  }
  
  stopEvent(e) {
    //var eve = e || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.returnValue = false;
    e.cancelBubble = true;
    return false;
  }
}
