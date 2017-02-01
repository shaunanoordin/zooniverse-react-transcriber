import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class SVGViewer extends Component {
  constructor(props) {
    super(props);
    this.svg = null;
    
    this.offsetX = this.props.width / 2;
    this.offsetY = this.props.height / 2;
    
    this.getPointerXY = this.getPointerXY.bind(this);
    
    this.state = {
      circles: [],
      rotate: this.props.rotate,
      scale: this.props.scale,
      translateX: this.props.translateX,
      translateY: this.props.translateY,
    };
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({
      rotate: nextProps.rotate,
      scale: nextProps.scale,
      translateX: nextProps.translateX,
      translateY: nextProps.translateY,
    });
  }

  render() {
    const transform = `scale(${this.state.scale}) translate(${this.state.translateX}, ${this.state.translateY}) rotate(${this.state.rotate}) `;
    
    return (
      <svg ref={(r)=>this.svg=r} className="svgViewer"
        viewBox={-this.props.width/2 + ' ' + -this.props.height/2 + ' ' + this.props.width + ' ' + this.props.height}
        width={this.props.width} height={this.props.height}
        onClick={this.click.bind(this)}>
        <g transform={transform}>
          <g>
            {this.props.children}
          </g>
          <g>
            {this.state.circles}
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
  
  componentDidMount() {
    
  }
  
  click(e) {
    //DEBUG
    return;
    
    const pointerXY = this.getPointerXY(e);
    
    const arr = this.state.circles;
    arr.push(<circle key={'circle-'+Math.floor(Math.random() * 1000000)} cx={pointerXY.x} cy={pointerXY.y} r="20" stroke="#c9c" strokeWidth="4" fill="#c9c" />);
    
    this.setState({
      circles: arr
    });
    
    stopEvent(e);
  }
  
  getPointerXY(e) {
    //Compensate for HTML elements
    //----------------
    const boundingBox = (this.svg && this.svg.getBoundingClientRect)
      ? this.svg.getBoundingClientRect()
      : { left: 0, top: 0, width: 1, height: 1 };    
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
    let elementWidth = this.props.width;
    let elementHeight = this.props.height;
    const sizeRatioX = elementWidth / boundingBox.width;
    const sizeRatioY = elementHeight / boundingBox.height;

    var inputX = (clientX - boundingBox.left) * sizeRatioX;
    var inputY = (clientY - boundingBox.top) * sizeRatioY;
    //----------------
    
    //Compensate for SVG transformations
    //----------------
    const offsetX = -this.props.width / 2;
    const offsetY = -this.props.height / 2;
    
    const rotation = -this.state.rotate / 180 * Math.PI;
    
    inputX = ((inputX + offsetX) / this.state.scale - this.state.translateX);
    inputY = ((inputY + offsetY) / this.state.scale - this.state.translateY);
    
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
  width: PropTypes.number,
  height: PropTypes.number,
};
SVGViewer.defaultProps = {
  width: 400,
  height: 400,
};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {};
}
export default connect(mapStateToProps)(SVGViewer);  //Connects the Component to the Redux Store
