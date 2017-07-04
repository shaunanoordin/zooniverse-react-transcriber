import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { showAggregation, showAllAggregations, selectAggregation, selectRawClassification, centreViewOnAggregation } from '../../actions/transcription-viewer-v5.js';
import { GENERAL_STATUS } from '../../constants/transcription-viewer-v5.js';

const SCROLL_PADDING_TOP = 5;

class AggregationsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.list = null;
    this.aggregatedTexts = [];
    
    this.state = {
      expanded: false,
    };
  }
  
  render() {
    
    if (this.state.expanded) {
      return (
        <div className="aggregations-panel expanded">
          {this.render_statusMessage()}
          {this.render_helperControls()}
          <div className="list" ref={(r)=>{this.list=r}}>
            {this.render_aggregatedText()}
          </div>
        </div>
      );
    } else {
      return (
        <div className="aggregations-panel collapsed">
          <div className="rotate-vertical">
            <button className="vertical-tab" onClick={()=>{ this.setState({expanded: true}) }}>
              <i className="fa fa-angle-double-up" />
              <label>View raw data</label>
            </button>
            
            <button className="vertical-tab" onClick={()=>{ this.props.dispatch(showAllAggregations(true)) }}>
              <i className="fa fa-check-square-o" />
              <label>Show all text</label>
            </button>
            
            <button className="vertical-tab" onClick={()=>{ this.props.dispatch(showAllAggregations(null)) }}>
              <i className="fa fa-square-o" />
              <label>Hide all text</label>
            </button>
          </div>
        </div>
      );
    }
  }
  
  render_statusMessage() {
    if (this.props.aggregationsStatus === GENERAL_STATUS.READY && this.props.aggregationsData) return null;
    
    switch(this.props.aggregationsStatus) {
      case GENERAL_STATUS.IDLE:
        return <div className="message">Aggregations</div>;
      case GENERAL_STATUS.LOADING:
        return <div className="message">Loading aggregated transcription data...</div>;
      case GENERAL_STATUS.ERROR:
        return <div className="error message">ERROR: Could not load aggregated transcription data.</div>;
      default:
        return <div className="error message">ERROR: Something unexpected happened. Perhaps this Subject has no transcription data?</div>;
    }
  }
  
  render_helperControls() {
    if (this.props.aggregationsStatus !== GENERAL_STATUS.READY || !this.props.aggregationsData) return null;
    
    return (
      <div className="helper-controls">
        <div className="button-container">
          <button className="button fa fa-square-o" onClick={()=>{ this.props.dispatch(showAllAggregations(false)) }}></button>
          <label>Hide all text</label>
        </div>
        <div className="button-container">
          <button className="button fa fa-check-square-o" onClick={()=>{ this.props.dispatch(showAllAggregations(true)) }}></button>
          <label>Show all text</label>
        </div>
        <div className="button-container">
          <button className={(this.props.currentAggregation === null) ? 'button disabled fa fa-ban' : 'button fa fa-ban' } onClick={()=>{ this.props.dispatch(selectAggregation(null)) }}></button>
          <label>Deselect</label>
        </div>
      </div>
    );
  }
  
  render_aggregatedText() {
    if (!this.props.aggregationsData) return null;
    this.aggregatedTexts = [];
    
    return this.props.aggregationsData.map ((agg, index1) => {
      return (
        <div ref={(r)=>{this.aggregatedTexts[index1]=r}} className={'item' + ((index1 === this.props.currentAggregation) ? ' selected' : '')} key={'agg_' + index1}>
          <div className="aggregated">
            <input type="checkbox" onChange={this.toggleShowAggregation.bind(this, index1)} checked={agg.show} />
            <a onClick={() => { this.props.dispatch(selectAggregation(index1)); this.props.dispatch(centreViewOnAggregation(index1)); }}>{agg.text}</a>
          </div>
          <div className="raw">
            {(!agg.raw) ? null :
              agg.raw.map((rawLine, index2) => {
                return (
                  <a
                    className={(index2 === this.props.currentRawClassification) ? 'selected' : ''}
                    key={'agg_' + index1 + '_' + index2}
                    onClick={() => { this.props.dispatch(selectRawClassification(index2)) }}
                  >
                    {rawLine.text}
                  </a>
                );
              })
            }
          </div>
        </div>
      )
    });
  }
  
  toggleShowAggregation(index, e) {
    this.props.dispatch(showAggregation(index, !this.props.aggregationsData[index].show));
  }
  
  componentWillReceiveProps(next) {
    this.scrollToSelectedAggregation(next);
  }
  
  scrollToSelectedAggregation(next) {
    if (next.currentAggregation === null || this.aggregatedTexts[next.currentAggregation] === null) return;
    if (!this.state.expanded) return;
    const current = this.aggregatedTexts[next.currentAggregation];
    const offsetParent = current.offsetParent;
    this.list.scrollTop = -SCROLL_PADDING_TOP - this.list.offsetTop + current.offsetTop;
  }
}

AggregationsPanel.propTypes = {
  subjectId: PropTypes.string,
  aggregationsData: PropTypes.array,
  aggregationsStatus: PropTypes.string,
  currentAggregation: PropTypes.number,
  currentRawClassification: PropTypes.number,
};

AggregationsPanel.defaultProps = {
  subjectId: null,
  aggregationsData: null,
  aggregationsStatus: null,
  currentAggregation: null,
  currentRawClassification: null,
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV5;
  return {
    subjectId: store.subjectId,
    aggregationsData: store.aggregationsData,
    aggregationsStatus: store.aggregationsStatus,
    currentAggregation: store.currentAggregation,
    currentRawClassification: store.currentRawClassification,
  };
};

export default connect(mapStateToProps)(AggregationsPanel);
