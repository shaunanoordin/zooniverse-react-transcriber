import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class SVGTarp extends Component {
  constructor(props) {
    super(props);
    this.svg = null;
    
    this.state = {
      circles: []
    };
  }

  render() {
    return (
      <svg ref={(r)=>this.svg=r} className="svgTarp"
        width="500" height="500"
        onClick={this.click.bind(this)}>
        {this.state.circles}
      </svg>
    );
  }
  
  componentDidMount() {
    
  }
  
  click(e) {
    const pointerXY = getPointerXY(e, this.svg);
    
    const arr = this.state.circles;
    arr.push(<circle cx={pointerXY.x} cy={pointerXY.y} r="40" stroke="#c9c" strokeWidth="4" fill="#c9c" />);
    
    this.setState({
      circles: arr
    });
  }
}

/*  Gets the
 */
function getPointerXY(e, element) {
  const boundingBox = (element && element.getBoundingClientRect)
    ? element.getBoundingClientRect()
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
  let elementWidth = (element && element.width) ? element.width : 1;
  let elementHeight = (element && element.height) ? element.height : 1;
  if (elementWidth.baseVal && elementWidth.baseVal.value) { elementWidth = elementWidth.baseVal.value; }  //SVG compensators
  if (elementHeight.baseVal && elementHeight.baseVal.value) { elementHeight = elementHeight.baseVal.value; }  //SVG compensators
  const sizeRatioX = elementWidth / boundingBox.width;
  const sizeRatioY = elementHeight / boundingBox.height;
  const inputX = (clientX - boundingBox.left) * sizeRatioX;
  const inputY = (clientY - boundingBox.top) * sizeRatioY;
  return { x: inputX, y: inputY };
}

SVGTarp.propTypes = {};
SVGTarp.defaultProps = {};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {};
}
export default connect(mapStateToProps)(SVGTarp);  //Connects the Component to the Redux Store
