import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchSubject, selectAggregation } from '../../actions/transcription-viewer-v5.js';

const RADIUS = 20;

class SVGAggregatedText extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  
  render() {
    const agg = this.props.aggregation;
    const index = this.props.index;
    //if (agg === null || index === null) return null;
    const textAngleRad = Math.atan2(agg.endY - agg.startY, agg.endX - agg.startX);
    const textAngleClockwiseDeg = ((Math.atan2(agg.endY - agg.startY, agg.endX - agg.startX) / Math.PI * 180) + 0) % 360;
    const pathDefinition = 'M ' +
      (agg.startX + RADIUS * Math.cos(textAngleRad - Math.PI/2)) + ' ' + (agg.startY + RADIUS * Math.sin(textAngleRad - Math.PI/2)) +
      ' L ' +
      (agg.startX + RADIUS * Math.cos(textAngleRad + Math.PI/2)) + ' ' + (agg.startY + RADIUS * Math.sin(textAngleRad + Math.PI/2)) +
      ' L ' + 
      (agg.endX + RADIUS * Math.cos(textAngleRad + Math.PI/2)) + ' ' + (agg.endY + RADIUS * Math.sin(textAngleRad + Math.PI/2)) +
      ' L ' +
      (agg.endX + RADIUS * Math.cos(textAngleRad - Math.PI/2)) + ' ' + (agg.endY + RADIUS * Math.sin(textAngleRad - Math.PI/2)) +
      ' Z';
    
    return (
      <g
        className={'aggregated-text ' + ((this.props.className) ? this.props.className : '')}
        transform={'translate(' + this.props.offsetX + ',' + this.props.offsetY + ') '}
        onClick={this.onClick}
      >
        <circle className="circle start" cx={agg.startX} cy={agg.startY} r={RADIUS} />
        <circle className="circle end" cx={agg.endX} cy={agg.endY} r={RADIUS} />
        <path className="path" d={pathDefinition} />
        <g transform={`translate(${agg.startX}, ${agg.startY}) rotate(${textAngleClockwiseDeg}) translate(${-agg.startX}, ${-agg.startY})`}>
          <text className="text" x={agg.startX + RADIUS/2} y={agg.startY + RADIUS/2} fontFamily="Verdana" fontSize={RADIUS}>
            {agg.text.replace(/&[\w\d]+;/g, ' ').replace(/<\/?[\w\d\-\_]+>/g, ' ')}
          </text>
        </g>
      </g>
    );
  }
  
  onClick(e) {
    this.props.dispatch(selectAggregation(this.props.index));
  }
}

SVGAggregatedText.propTypes = {
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
  aggregation: PropTypes.object,
  index: PropTypes.number,
};

SVGAggregatedText.defaultProps = {
  offsetX: 0,
  offsetY: 0,
  aggregation: null,
  index: null,
};

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(SVGAggregatedText);