import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class SVGTarp extends Component {
  constructor(props) {
    super(props);
    this.svg = null;
    
    this.width = 500;
    this.height = 500;
    
    this.getPointerXY = this.getPointerXY.bind(this);
    
    this.state = {
      circles: [],
      rotate: 0,
      scale: 1,
      translateX: 0,
      translateY: 0,
    };
  }

  render() {
    const transform = `scale(${this.state.scale}) translate(${this.state.translateX}, ${this.state.translateY}) rotate(${this.state.rotate}) `;
    
    return (
      <svg ref={(r)=>this.svg=r} className="svgTarp"
        viewBox={-this.width/2 + ' ' + -this.height/2 + ' ' + this.width + ' ' + this.height}
        width={this.width} height={this.height}
        onClick={this.click.bind(this)}>
        <g transform={transform}>
          <g>
            {this.state.circles}
          </g>
          <g>
            <line x1="0" y1="-250" x2="0" y2="250" stroke-width="1" stroke="#fff"/>
            <line x1="-250" y1="-250" x2="-250" y2="250" stroke-width="1" stroke="#fff"/>
            <line x1="250" y1="-250" x2="250" y2="250" stroke-width="1" stroke="#fff"/>
            <line x1="-250" y1="0" x2="250" y2="0" stroke-width="1" stroke="#fff"/>
            <line x1="-250" y1="-250" x2="250" y2="-250" stroke-width="1" stroke="#fff"/>
            <line x1="-250" y1="250" x2="250" y2="250" stroke-width="1" stroke="#fff"/>
            
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
    const pointerXY = this.getPointerXY(e);
    
    const arr = this.state.circles;
    arr.push(<circle key={Math.floor(Math.random() * 1000000)} cx={pointerXY.x} cy={pointerXY.y} r="20" stroke="#c9c" strokeWidth="4" fill="#c9c" />);
    
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
    let elementWidth = this.width;
    let elementHeight = this.height;
    const sizeRatioX = elementWidth / boundingBox.width;
    const sizeRatioY = elementHeight / boundingBox.height;

    var inputX = (clientX - boundingBox.left) * sizeRatioX;
    var inputY = (clientY - boundingBox.top) * sizeRatioY;
    //----------------
    
    //Compensate for SVG transformations
    //----------------
    const offsetX = -this.width / 2;
    const offsetY = -this.height / 2;
    
    const rotation = 0;
    
    //inputX = ((inputX + offsetX) / this.state.scale - this.state.translateX) * Math.cos(rotation);
    //inputY = ((inputY + offsetY) / this.state.scale - this.state.translateY) * Math.sin(rotation);
    
    inputX = ((inputX + offsetX) / this.state.scale - this.state.translateX);
    inputY = ((inputY + offsetY) / this.state.scale - this.state.translateY);
    //----------------
    
    return { x: inputX, y: inputY };
  }
}

function stopEvent(e) {
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  e.returnValue = false;
  e.cancelBubble = true;
  return false;
}

SVGTarp.propTypes = {};
SVGTarp.defaultProps = {};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {};
}
export default connect(mapStateToProps)(SVGTarp);  //Connects the Component to the Redux Store
