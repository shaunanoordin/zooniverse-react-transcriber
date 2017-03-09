import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchSubject, setView, setViewOptions } from '../../actions/transcription-viewer-v3.js';
import { Utility, KEY_CODES } from '../../tools/Utility.js';
import * as status from '../../constants/status.js';

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.execFetchSubject = this.execFetchSubject.bind(this);
    
    this.inputSubjectID = null;
    this.inputScale = null;
    this.inputTranslateX = null;
    this.inputTranslateY = null;
    this.inputRotate = null;
    this.updateTransform = this.updateTransform.bind(this);
  }
  
  execFetchSubject() {
    const subjectId = this.inputSubjectID.value;
    this.props.dispatch(fetchSubject(subjectId));
  }
  
  render() {
    return (
      <div className="control-panel">
        <div className="subjectID-subpanel">
          <input type="text" ref={(ele) => { this.inputSubjectID = ele; }}
            placeholder="Panoptes Subject ID, e.g. 1274999"
            onKeyPress={(e) => {
              if (Utility.getKeyCode(e) === KEY_CODES.ENTER) {
                this.execFetchSubject();
              }
            }}
          />
          <button className="button" onClick={this.execFetchSubject}>&raquo;</button>
        </div>
        <div className="status-subpanel">
          {(this.props.subjectID)
            ? (<p>
                <button className="button" onClick={this.goToPrevPage.bind(this)}>&laquo;</button>
                <span>Subject ID {this.props.subjectID}</span>
                <button className="button" onClick={this.goToNextPage.bind(this)}>&raquo;</button>
              </p>)
            : null
          }

          {(() => {
            switch (this.props.subjectStatus) {
              case status.STATUS_IDLE:
                return <p>Type in a Panoptes Subject ID to search!</p>;
              case status.STATUS_LOADING:
                return <p>Looking for Subject...</p>;
              case status.STATUS_READY:
                return <p>Subject ready.</p>;
              case status.STATUS_ERROR:
                return <p>WHOOPS - Something went wrong!</p>;
            }
            return null;
          })()}

          {(() => {
            if (this.props.subjectStatus !== status.STATUS_READY) return null;

            switch (this.props.subjectStatus) {
              case status.STATUS_LOADING:
                return <p>Looking for Aggregations...</p>;
              case status.STATUS_READY:
                return (
                  <p>Aggregations ready.</p>
                );
              case status.STATUS_ERROR:
                return <p>No Aggregations, sorry.</p>;
            }
            return null;
          })()}
        </div>

        <div className="viewControl-subpanel">
          <div className="row">
            <label>Scale</label>
            <span className="data">
              <input
                value={this.props.scale}
                ref={(itm) => { this.inputScale = itm; }}
                onChange={this.updateTransform}
                type="number"
                step="0.1"
                min="0.1" />
            </span>
          </div>
          <div className="row">
            <label>Translate (x,y)</label>
            <span className="data">
              <input
                value={this.props.translateX}
                ref={(itm) => { this.inputTranslateX = itm; }}
                onChange={this.updateTransform}
                type="number"
                step="10" />
              <input
                value={this.props.translateY}
                ref={(itm) => { this.inputTranslateY = itm; }}
                onChange={this.updateTransform}
                type="number"
                step="10" />
            </span>
          </div>
          <div className="row">
            <label>Rotate (deg)</label>
            <span className="data">
              <input
                value={this.props.rotate}
                ref={(itm) => { this.inputRotate = itm; }}
                onChange={this.updateTransform} 
                type="number"
                step="15" />
            </span>
          </div>
          <div className="row">
            <button className="button fa fa-caret-square-o-right" onClick={()=>{this.props.dispatch(setViewOptions({layout:'horizontal'}))}} />
            <button className="button fa fa-caret-square-o-down" onClick={()=>{this.props.dispatch(setViewOptions({layout:'vertical'}))}} />
          </div>
        </div>

        {(this.props.subjectData && this.props.subjectData.metadata)
          ? (() => {
              let metadata = [];
              for (let m in this.props.subjectData.metadata) {
                metadata.push(<div className="row" key={m}><label>{m}</label><span className="data">{this.props.subjectData.metadata[m]}</span></div>);
              }
              return (
                <div className="metadata-subpanel">
                  {metadata}
                </div>
              );
            })()
          : null
        }
      </div>        
    );
  }
  
  updateTransform(e) {
    this.props.dispatch(setView(
      parseFloat(this.inputRotate.value),
      parseFloat(this.inputScale.value),
      parseFloat(this.inputTranslateX.value),
      parseFloat(this.inputTranslateY.value),
    ));
  }
  
  goToNextPage() {
    if (this.props.subjectID === null) return;  //Can't use (!this.props.subjectID) since '0' is a valid subjectID.
    try {
      const targetSubjectID = parseInt(this.props.subjectID) + 1;
      this.props.dispatch(fetchSubject(targetSubjectID.toString()));
    } catch (err) {}
  }
  
  goToPrevPage() {
    if (this.props.subjectID === null) return;  //Can't use (!this.props.subjectID) since '0' is a valid subjectID.
    try {
      const targetSubjectID = parseInt(this.props.subjectID) - 1;
      this.props.dispatch(fetchSubject(targetSubjectID.toString()));
    } catch (err) {}
  }
}

ControlPanel.propTypes = {
  subjectID: PropTypes.string,
  subjectData: PropTypes.object,
  subjectStatus: PropTypes.string,
  aggregationsData: PropTypes.array,
  aggregationsStatus: PropTypes.string,
  currentAggregation: PropTypes.number,
  rotate: PropTypes.number,
  scale: PropTypes.number,
  translateX: PropTypes.number,
  translateY: PropTypes.number,
};

ControlPanel.defaultProps = {
  subjectID: null,
  subjectData: null,
  subjectStatus: null,
  aggregationsData: null,
  aggregationsStatus: null,
  currentAggregation: null,
  rotate: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV3;
  return {
    subjectID: store.subjectID,
    subjectData: store.subjectData,
    subjectStatus: store.subjectStatus,
    aggregationsData: store.aggregationsData,
    aggregationsStatus: store.aggregationsStatus,
    currentAggregation: store.currentAggregation,
    rotate: store.viewRotate,
    scale: store.viewScale,
    translateX: store.viewTranslateX,
    translateY: store.viewTranslateY,
  };
};

export default connect(mapStateToProps)(ControlPanel);
