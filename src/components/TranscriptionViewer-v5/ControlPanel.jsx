import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchSubject, setView, setViewOptions } from '../../actions/transcription-viewer-v5.js';
import { Utility, KEY_CODES } from '../../tools/Utility.js';
import * as status from '../../constants/status.js';

const ROTATE_STEP_VALUE = 15;
const DEGREES_360 = 360

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
    this.rotateLeft = this.rotateLeft.bind(this);
    this.rotateRight = this.rotateRight.bind(this);
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
          <button className="button fa fa-search" onClick={this.execFetchSubject} />
        </div>
        <div className="status-subpanel">
          {(!this.props.subjectID) ? null :
            <p>
              <button className="button fa fa-backward" style={{fontSize: '0.5em'}} onClick={this.goToPrevPage.bind(this)} />
              <span>Subject ID {this.props.subjectID}</span>
              <button className="button fa fa-forward" style={{fontSize: '0.5em'}} onClick={this.goToNextPage.bind(this)} />
            </p>
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
                return <p className="error message">WHOOPS - Something went wrong!</p>;
            }
            return null;
          })()}

          {(() => {
            if (this.props.aggregationsStatus !== status.STATUS_READY) return null;

            switch (this.props.aggregationsStatus) {
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
              <div>
                <input
                  value={this.props.translateX}
                  ref={(itm) => { this.inputTranslateX = itm; }}
                  onChange={this.updateTransform}
                  type="number"
                  step="10" />
                <b>,</b>
                <input
                  value={this.props.translateY}
                  ref={(itm) => { this.inputTranslateY = itm; }}
                  onChange={this.updateTransform}
                  type="number"
                  step="10" />
              </div>
            </span>
          </div>
          <div className="row">
            <label>Rotate (deg)</label>
            <span className="data">
              <div>
                <input
                  value={this.props.rotate}
                  ref={(itm) => { this.inputRotate = itm; }}
                  onChange={this.updateTransform} 
                  type="number"
                  step={ROTATE_STEP_VALUE} />
                <button className="button fa fa-rotate-left" onClick={this.rotateLeft} />
                <button className="button fa fa-rotate-right" onClick={this.rotateRight} />
              </div>
            </span>
          </div>
          <div className="row">
            <label>Layout</label>
            <span className="data">
              {/*<button className={'button fa fa-square' + ((this.props.viewOptions.layout === 'single') ? ' selected' : '')} onClick={()=>{this.props.dispatch(setViewOptions({layout:'single'}))}} />*/}
              <div>
                <button className={'button fa fa-arrow-right' + ((this.props.viewOptions.layout === 'horizontal') ? ' selected' : '')} onClick={()=>{this.props.dispatch(setViewOptions({layout:'horizontal'}))}} />
                <label>Horizontal</label>
              </div>
              <div>
                <button className={'button fa fa-arrow-down' + ((this.props.viewOptions.layout === 'vertical') ? ' selected' : '')} onClick={()=>{this.props.dispatch(setViewOptions({layout:'vertical'}))}} />
                <label>Vertical</label>
              </div>
            </span>
          </div>
          {/*
          <div className="row">
            <label>Edit Mode</label>
            <span className="data">
              {(this.props.viewOptions.mode === 'editor')
                ? <button className="button fa fa-file-text selected" onClick={()=>{this.props.dispatch(setViewOptions({mode:''}))}} />
                : <button className="button fa fa-file-text" onClick={()=>{this.props.dispatch(setViewOptions({mode:'editor'}))}} />
              }
            </span>
          </div>
          */}
        </div>

        {(!this.props.subjectData || !this.props.subjectData.metadata) ? null :
          (() => {
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
                        
  rotateLeft() {
    this.inputRotate.value = (parseInt(this.inputRotate.value) - ROTATE_STEP_VALUE + DEGREES_360) % DEGREES_360;
    this.updateTransform();
  }

  rotateRight() {
    this.inputRotate.value = (parseInt(this.inputRotate.value) + ROTATE_STEP_VALUE) % DEGREES_360;
    this.updateTransform();
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
  rotate: PropTypes.number,
  scale: PropTypes.number,
  translateX: PropTypes.number,
  translateY: PropTypes.number,
  viewOptions: PropTypes.object,
};

ControlPanel.defaultProps = {
  subjectID: null,
  subjectData: null,
  subjectStatus: null,
  aggregationsData: null,
  aggregationsStatus: null,
  rotate: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
  viewOptions: {
    layout: 'horizontal'
  },
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV5;
  return {
    subjectID: store.subjectID,
    subjectData: store.subjectData,
    subjectStatus: store.subjectStatus,
    aggregationsData: store.aggregationsData,
    aggregationsStatus: store.aggregationsStatus,
    rotate: store.viewRotate,
    scale: store.viewScale,
    translateX: store.viewTranslateX,
    translateY: store.viewTranslateY,
    viewOptions: store.viewOptions,
  };
};

export default connect(mapStateToProps)(ControlPanel);
