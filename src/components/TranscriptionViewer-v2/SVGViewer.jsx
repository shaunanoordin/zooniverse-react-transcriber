import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Utility } from '../../tools/Utility.js';
import { setView } from '../../actions/transcription-viewer-v2.js';

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
    
    this.tmpTransform = null;
    
    this.offsetX = 0;  //To be updated when we figure out what the bounding box for the SVG is.
    this.offsetY = 0;
    
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
      <svg ref={(r)=>{this.svg=r}}
        className={
          'svg-viewer-v2 ' +
          ((this.props.className) ? this.props.className : '')
        }
        //viewBox={-boundingBox.width/2 + ' ' + -boundingBox.height/2 + ' ' + boundingBox.width + ' ' + boundingBox.height}
        viewBox={-this.props.width/2 + ' ' + -this.props.height/2 + ' ' + this.props.width + ' ' + this.props.height}        
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
          <g>
            {/*this.state.circles*/}
          </g>
          <g>
            <line x1="0" y1="-250" x2="0" y2="250" strokeWidth="1" stroke="#fff"/>
            <line x1="-250" y1="-250" x2="-250" y2="250" strokeWidth="1" stroke="#fff"/>
            <line x1="250" y1="-250" x2="250" y2="250" strokeWidth="1" stroke="#fff"/>
            <line x1="-250" y1="0" x2="250" y2="0" strokeWidth="1" stroke="#fff"/>
            <line x1="-250" y1="-250" x2="250" y2="-250" strokeWidth="1" stroke="#fff"/>
            <line x1="-250" y1="250" x2="250" y2="250" strokeWidth="1" stroke="#fff"/>
            
            <circle cx={0+Math.cos(Math.PI*-1/2)*20} cy={0+Math.sin(Math.PI*-1/2)*20} r="10" fill="none" stroke="#fc3" strokeWidth="1" />
            <circle cx={0+Math.cos(Math.PI*5/6)*20} cy={0+Math.sin(Math.PI*5/6)*20} r="10" fill="none" stroke="#c33" strokeWidth="1" />
            <circle cx={0+Math.cos(Math.PI*1/6)*20} cy={0+Math.sin(Math.PI*1/6)*20} r="10" fill="none" stroke="#39c" strokeWidth="1" />
            <circle cx={0} cy={0} r="10" fill="none" stroke="#fff" strokeWidth="1" />
          </g>
        </g>
      </svg>
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
    const pointerXYOriginal = this.getPointerXY(e);
    const pointerXY = this.getPointerXYAdjustedForSVGTransform(e);
    
    console.log('CLICK\n', pointerXYOriginal, pointerXY);
    
    //DEBUG
    return;
    
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
    return null;  //TODO: Fix this. Need to compensate for bounding box of new stretched SVG
    
    /*const pointerXY = this.getPointerXY(e);
    let inputX = pointerXY.x;
    let inputY = pointerXY.y;
    
    //Compensate for SVG transformations
    //----------------
    const rotation = -this.state.rotate / 180 * Math.PI;
    
    inputX = ((inputX - this.offsetX) / this.state.scale - this.state.translateX);
    inputY = ((inputY - this.offsetY) / this.state.scale - this.state.translateY);
    
    const calculatedInputX = inputX * Math.cos(rotation) - inputY * Math.sin(rotation);
    const calculatedInputY = inputX * Math.sin(rotation) + inputY * Math.cos(rotation);
    //----------------
    
    return { x: calculatedInputX, y: calculatedInputY };*/
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
  width: PropTypes.number,
  height: PropTypes.number,
  scale: PropTypes.number,
  translateX: PropTypes.number,
  translateY: PropTypes.number,
  rotate: PropTypes.number,
  onViewUpdated: PropTypes.func,
};
SVGViewer.defaultProps = {
  className: '',
  width: 400,
  height: 400,
  scale: 1,
  translateX: 0,
  translateY: 0,
  rotate: 0,
  onViewUpdated: null,
};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {
    rotate: state.transcriptionViewerV2.viewRotate,
    scale: state.transcriptionViewerV2.viewScale,
    translateX: state.transcriptionViewerV2.viewTranslateX,
    translateY: state.transcriptionViewerV2.viewTranslateY,
  };
}
export default connect(mapStateToProps)(SVGViewer);  //Connects the Component to the Redux Store
