import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
//import { fetchSubject, setView, setViewOptions } from '../../actions/transcription-viewer-v3.js';
import * as status from '../../constants/status.js';

class AggregationsPanel extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div className="aggregations-panel">
        {this.render_statusMessage()}
        {this.render_aggregatedText()}
      </div>
    );
  }
  
  render_statusMessage() {
    if (this.props.aggregationsStatus === status.STATUS_READY && this.props.aggregationsData) return null;
    
    switch(this.props.aggregationsStatus) {
      case status.STATUS_IDLE:
        return <div className="message">Aggregations</div>;
      case status.STATUS_LOADING:
        return <div className="message">Loading aggregated transcription data...</div>;
      case status.STATUS_ERROR:
        return <div className="error message">ERROR: Could not load aggregated transcription data.</div>;
      default:
        return <div className="error message">ERROR: Something unexpected happened. Perhaps this Subject has no transcription data?</div>;
    }
  }
  render_aggregatedText() {
    if (!this.props.aggregationsData) return null;
    
    return this.props.aggregationsData.map ((agg, index1) => {
      return (
        <div className="data-point" key={'agg_' + index1}>
          <span className="aggregated">{agg.text}</span>
          <ul className="raw">
            {(!agg.raw) ? null :
              agg.raw.map((rawLine, index2) => {
                return <li key={'agg_' + index1 + '_' + index2}>{rawLine.text}</li>;
              })
            }
          </ul>
        </div>
      )
    });
  }
}

AggregationsPanel.propTypes = {
  subjectID: PropTypes.string,
  aggregationsData: PropTypes.array,
  aggregationsStatus: PropTypes.string,
  currentAggregation: PropTypes.number,
};

AggregationsPanel.defaultProps = {
  subjectID: null,
  aggregationsData: null,
  aggregationsStatus: null,
  currentAggregation: null,
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV3;
  return {
    subjectID: store.subjectID,
    aggregationsData: store.aggregationsData,
    aggregationsStatus: store.aggregationsStatus,
    currentAggregation: store.currentAggregation,
  };
};

export default connect(mapStateToProps)(AggregationsPanel);
