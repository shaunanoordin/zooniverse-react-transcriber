import { Component, PropTypes } from 'react';

export default class ZooniverseLogo extends Component {
  render() {
    return (
      <svg role="img" className="zooniverse-logo" viewBox="0 0 100 100" width={this.props.width} height={this.props.height} style={this.props.style}>
        <title>{this.props.title}</title>
        <g stroke="none" transform="translate(50, 50)">
          <path d="M 0 -45 A 45 45 0 0 1 0 45 A 45 45 0 0 1 0 -45 Z M 0 -30 A 30 30 0 0 0 0 30 A 30 30 0 0 0 0 -30 Z"></path>
          <path d="M 0 -14 A 14 14 0 0 1 0 14 A 14 14 0 0 1 0 -14 Z"></path>
          <ellipse cx="0" cy="0" rx="6" ry="65" transform="rotate(50)"></ellipse>
        </g>
      </svg>
    );
  }
}
ZooniverseLogo.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object,
  title: PropTypes.string,
};
ZooniverseLogo.defaultProps = {
  width: 100,
  height: 100,
  style: {},
  title: 'Zooniverse',
};
