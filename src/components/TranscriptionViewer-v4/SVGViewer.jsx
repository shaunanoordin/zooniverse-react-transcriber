import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Utility } from '../../tools/Utility.js';
import { setView } from '../../actions/transcription-viewer-v4.js';

const INPUT_IDLE = 0;
const INPUT_ACTIVE = 1;
const MIN_SCALE = 0.1;

class SVGViewer extends Component {
  constructor(props) {
    super(props);
    this.svg = null;
    
    this.pointer = {
      start: { x: 0, y: 0 },
      now: { x: 0, y: 0 },
      state: INPUT_IDLE,
    };
    
    this.container = null;
    this.containerWidth = 0;
    this.containerHeight = 0;
    this.offsetX = 0;  //To be updated when we figure out what the bounding box for the SVG is.
    this.offsetY = 0;
    
    this.tmpTransform = null;
    
    this.getPointerXY = this.getPointerXY.bind(this);
    this.getPointerXYAdjustedForSVGTransform = this.getPointerXYAdjustedForSVGTransform.bind(this);
    this.getBoundingBox = this.getBoundingBox.bind(this);
  }
  
  render() {
    const transform = `scale(${this.props.scale}) translate(${this.props.translateX}, ${this.props.translateY}) rotate(${this.props.rotate}) `;
    const boundingBox = (this.svg && this.svg.getBoundingClientRect)
      ? this.svg.getBoundingClientRect()
      : { left: 0, top: 0, width: 10, height: 1 };
    
    return (
      <div
        className={'svg-viewer-v4 ' + ((this.props.className) ? this.props.className : '')}
        ref={(c)=>{
          if (!c) return;
          this.container = c;
          this.containerWidth = c.offsetWidth;
          this.containerHeight = c.offsetHeight;
          this.offsetX = c.offsetWidth * 0.5;
          this.offsetY = c.offsetHeight * 0.5;
        }}
      >
        <svg ref={(r)=>{this.svg=r}}
          viewBox={-this.containerWidth/2 + ' ' + -this.containerHeight/2 + ' ' + this.containerWidth + ' ' + this.containerHeight}
          onClick={this.click.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
          onMouseMove={this.onMouseMove.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
          onWheel={(e) => {
            if (e.deltaY > 0) {
              this.props.dispatch(setView(null, Math.max(this.props.scale - 0.1, MIN_SCALE), null, null ));
            } else if (e.deltaY < 0) {
              this.props.dispatch(setView(null, Math.max(this.props.scale + 0.1, MIN_SCALE), null, null ));
            }
            return Utility.stopEvent(e);
          }}
        >
          <g transform={transform}>
            <g>
              {this.props.children}
            </g>
            {/*<g>this.state.circles</g>*/}
          </g>
        </svg>
      </div>
    );
  }
  
  onMouseDown(e) {
    const pointerXY = this.getPointerXY(e);
    this.pointer.state = INPUT_ACTIVE;
    this.pointer.start = { x: pointerXY.x, y: pointerXY.y };
    this.pointer.now = { x: pointerXY.x, y: pointerXY.y };    
    this.tmpTransform = {
      scale: this.props.scale,
      translateX: this.props.translateX,
      translateY: this.props.translateY,
    };
    return Utility.stopEvent(e);
  }
  
  onMouseUp(e) {
    const pointerXY = this.getPointerXY(e);
    this.pointer.state = INPUT_IDLE;
    this.pointer.now = { x: pointerXY.x, y: pointerXY.y };
    this.tmpTransform = false;
    return Utility.stopEvent(e);
  }
  
  onMouseLeave(e) {
    this.pointer.state = INPUT_IDLE;
    return Utility.stopEvent(e);
  }
  
  onMouseMove(e) {
    const pointerXY = this.getPointerXY(e);
    this.pointer.now = { x: pointerXY.x, y: pointerXY.y };
    if (this.pointer.state === INPUT_ACTIVE && this.tmpTransform) {
      const pointerDelta = {
        x: this.pointer.now.x - this.pointer.start.x,
        y: this.pointer.now.y - this.pointer.start.y
      };
      
      //this.setState({
      //  translateX: parseFloat(this.tmpTransform.translateX + pointerDelta.x / this.tmpTransform.scale),
      //  translateY: parseFloat(this.tmpTransform.translateY + pointerDelta.y / this.tmpTransform.scale),
      //});
      
      this.props.dispatch(setView(null, null,
        this.tmpTransform.translateX + pointerDelta.x / this.tmpTransform.scale,
        this.tmpTransform.translateY + pointerDelta.y / this.tmpTransform.scale
      ));
    }
  }
  
  click(e) {
    //DEBUG
    return;
    
    //const pointerXYOriginal = this.getPointerXY(e);
    //const pointerXY = this.getPointerXYAdjustedForSVGTransform(e);
    //console.log('CLICK\n', pointerXYOriginal, pointerXY);
    
    //const arr = this.state.circles;
    //arr.push(<circle key={'circle-'+Math.floor(Math.random() * 1000000)} cx={pointerXY.x} cy={pointerXY.y} r="20" stroke="#c9c" strokeWidth="4" fill="#c9c" />);
    //this.setState({
    //  circles: arr
    //});
    //return stopEvent(e);
  }
  
  getBoundingBox() {
    const boundingBox = (this.svg && this.svg.getBoundingClientRect)
      ? this.svg.getBoundingClientRect()
      : { left: 0, top: 0, width: 1, height: 1 };
    return boundingBox;
  }
  
  getPointerXY(e) {
    //Compensate for HTML elements
    //----------------
    const boundingBox = this.getBoundingBox();
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
    
    //SVG scaling doesn't work this way; the following code is for <canvas>
    //--------
    //let elementWidth = this.props.width;
    //let elementHeight = this.props.height;
    //const sizeRatioX = elementWidth / boundingBox.width;
    //const sizeRatioY = elementHeight / boundingBox.height;
    //--------
    
    //SVG scaling
    //--------
    const sizeRatioX = 1;
    const sizeRatioY = 1;
    //--------

    var inputX = (clientX - boundingBox.left) * sizeRatioX;
    var inputY = (clientY - boundingBox.top) * sizeRatioY;
    //----------------
    
    return { x: inputX, y: inputY };
  }
  
  getPointerXYAdjustedForSVGTransform(e) {
    const pointerXY = this.getPointerXY(e);
    let inputX = pointerXY.x;
    let inputY = pointerXY.y;
    
    //Compensate for SVG transformations
    //----------------
    const rotation = -this.props.rotate / 180 * Math.PI;
    
    inputX = ((inputX - this.offsetX) / this.props.scale - this.props.translateX);
    inputY = ((inputY - this.offsetY) / this.props.scale - this.props.translateY);
    
    const calculatedInputX = inputX * Math.cos(rotation) - inputY * Math.sin(rotation);
    const calculatedInputY = inputX * Math.sin(rotation) + inputY * Math.cos(rotation);
    //----------------
    
    return { x: calculatedInputX, y: calculatedInputY };
  }
}

function stopEvent(e) {
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  e.returnValue = false;
  e.cancelBubble = true;
  return false;
}

SVGViewer.propTypes = {
  className: PropTypes.string,
  scale: PropTypes.number,
  translateX: PropTypes.number,
  translateY: PropTypes.number,
  rotate: PropTypes.number,
};
SVGViewer.defaultProps = {
  className: '',
  scale: 1,
  translateX: 0,
  translateY: 0,
  rotate: 0,
};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  const store = state.transcriptionViewerV4;
  return {
    rotate: store.viewRotate,
    scale: store.viewScale,
    translateX: store.viewTranslateX,
    translateY: store.viewTranslateY,
  };
}
export default connect(mapStateToProps)(SVGViewer);  //Connects the Component to the Redux Store
