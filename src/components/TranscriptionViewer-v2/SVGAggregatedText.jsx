import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchSubject, selectAggregation } from '../../actions/transcription-viewer-v2.js';

class SVGAggregatedText extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  
  render() {
    const agg = this.props.aggregation;
    const index = this.props.index;
    //if (agg === null || index === null) return null;
    const textAngle = ((Math.atan2(agg.endY - agg.startY, agg.endX - agg.startX)  / Math.PI * 180) + 0) % 360;
    
    return (
      <g
        className="aggregated-text"
        transform={'translate(' + this.props.offsetX + ',' + this.props.offsetY + ') '}
        onClick={this.onClick}
      >
        <circle className="circle" cx={agg.startX} cy={agg.startY} r={20} />
        <circle className="circle" cx={agg.endX} cy={agg.endY} r={20} />
        <path className="path" d={"M "+(agg.startX)+" "+(agg.startY-20)+" L "+(agg.startX)+" "+(agg.startY+20)+" L "+(agg.endX)+" "+(agg.endY+20)+" L "+(agg.endX)+" "+(agg.endY-20)+" Z"} />
        <g transform={`translate(${agg.startX}, ${agg.startY}) rotate(${textAngle}) translate(${-agg.startX}, ${-agg.startY})`}>
          <text className="text" x={agg.startX} y={agg.startY + 20/2} fontFamily="Verdana" fontSize="20">
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