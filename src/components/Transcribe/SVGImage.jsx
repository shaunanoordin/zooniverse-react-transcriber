import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

export default class SVGImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      error: false,
    };
    
    this.image = new Image();
    this.image.onload = () => {
      this.setState({
        loaded: true,
      });
    };
    this.image.onerror = (err) => {
      this.setState({
        error: true,
      });
    };
    this.image.src = this.props.src;
  }
  
  render() {
    if (this.state.loaded) {
      return (
        <image className="svgImage"
          href={this.image.src}
          width={this.image.width}
          height={this.image.height}
          x={(this.image.width * -0.5)+'px'}
          y={(this.image.height * -0.5)+'px'} />
      );
    } else if (this.state.error) {
      return (
        <g className="svgImage-error">
          <path d="M -60 -80 L 0 -20 L 60 -80 L 80 -60 L 20 0 L 80 60 L 60 80 L 0 20 L -60 80 L -80 60 L -20 0 L -80 -60 Z" />
        </g>
      );
    } else {
      return (
        <circle className="svgImage-loading" cx={0} cy={0} r={100} />
      );
    }
  }
}

SVGImage.propTypes = {
  src: PropTypes.string.isRequired,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

SVGImage.defaultProps = {
  src: null,
  onLoad: null,
  onError: null,
};
