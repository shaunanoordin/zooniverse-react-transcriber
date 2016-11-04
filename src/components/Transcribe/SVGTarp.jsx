import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class SVGTarp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <svg className="svgTarp" width="1000" height="1000" onClick={this.click}>
        <circle cx="50" cy="50" r="40" stroke="#c9c" strokeWidth="4" fill="#c9c" />
      </svg>
    );
  }
  
  click(e) {
    console.log(e);
  }
}

SVGTarp.propTypes = {};
SVGTarp.defaultProps = {};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {};
}
export default connect(mapStateToProps)(SVGTarp);  //Connects the Component to the Redux Store
