import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

export default class SVGImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
    
    this.image = new Image();
    this.image.onload = () => {
      this.setState({
        loaded: true,
      });
    };
    this.image.src = this.props.src;
  }
  
  render() {
    if (this.state.loaded) {
      return (
        <image href={this.image.src}
          width={this.image.width}
          height={this.image.height}
          x={(this.image.width * -0.5)+'px'}
          y={(this.image.height * -0.5)+'px'} />
      );
    } else {
      return (
        <circle cx={0} cy={0} r={100} />
      );
    }
  }
}
