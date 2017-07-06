import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchSubject, setView, setViewOptions } from '../../actions/transcription-viewer-v5.js';
import { Utility, KEY_CODES } from '../../tools/Utility.js';
import { GENERAL_STATUS } from '../../constants/transcription-viewer-v5.js';

const MOVE_STEP_VALUE = 10;
const ZOOM_STEP_VALUE = 0.1;
const ZOOM_MINIMUM = 0.1;
const ROTATE_STEP_VALUE = 15;
const DEGREES_360 = 360

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.execFetchSubject = this.execFetchSubject.bind(this);
    
    this.inputSubjectId = null;
    this.inputScale = null;
    this.inputTranslateX = null;
    this.inputTranslateY = null;
    this.inputRotate = null;
    
    this.goToPrevPage = this.goToPrevPage.bind(this);
    this.goToNextPage = this.goToNextPage.bind(this);
    this.updateTransform = this.updateTransform.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.rotateLeft = this.rotateLeft.bind(this);
    this.rotateRight = this.rotateRight.bind(this);
    this.moveLeft = this.moveLeft.bind(this);
    this.moveRight = this.moveRight.bind(this);
    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
  }
  
  execFetchSubject() {
    const subjectId = this.inputSubjectId.value;
    this.props.dispatch(fetchSubject(subjectId));
  }
  
  render() {
    return (
      <div className="control-panel">
        <div className="subjectID-subpanel">
          <input type="text" ref={(ele) => { this.inputSubjectId = ele; }}
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
          {(!this.props.subjectId) ? null :
            <p>
              <button className="button fa fa-backward" style={{fontSize: '0.6em'}} onClick={this.goToPrevPage} />
              {' '}
              <span>Subject ID {this.props.subjectId}</span>
              {' '}
              <button className="button fa fa-forward" style={{fontSize: '0.6em'}} onClick={this.goToNextPage} />
            </p>
          }

          {(() => {
            switch (this.props.subjectStatus) {
              case GENERAL_STATUS.IDLE:
                return <p>Type in a Panoptes Subject ID to search!</p>;
              case GENERAL_STATUS.LOADING:
                return <p>Looking for Subject...</p>;
              case GENERAL_STATUS.READY:
                return <p>Subject ready.</p>;
              case GENERAL_STATUS.ERROR:
                return <p className="error message">WHOOPS - Something went wrong!</p>;
            }
            return null;
          })()}
        </div>

        <div className="viewControl-subpanel">
          <div className="row">
            <label>Scale</label>
            <span className="data">
              <div>
                <input
                  value={this.props.scale}
                  ref={(itm) => { this.inputScale = itm; }}
                  onChange={this.updateTransform}
                  type="number"
                  step={ZOOM_STEP_VALUE}
                  min={ZOOM_MINIMUM} />
                <button className="button fa fa-search-plus" onClick={this.zoomIn} />
                <button className="button fa fa-search-minus" onClick={this.zoomOut} />
              </div>
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
                  step={MOVE_STEP_VALUE} />
                <button className="button fa fa-arrow-left" onClick={this.moveLeft} />
                <button className="button fa fa-arrow-right" onClick={this.moveRight} />
              </div>
              <div>
                <input
                  value={this.props.translateY}
                  ref={(itm) => { this.inputTranslateY = itm; }}
                  onChange={this.updateTransform}
                  type="number"
                  step={MOVE_STEP_VALUE} />
                <button className="button fa fa-arrow-up" onClick={this.moveUp} />
                <button className="button fa fa-arrow-down" onClick={this.moveDown} />
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
                <button className={'button fa fa-chevron-right' + ((this.props.viewOptions.layout === 'horizontal') ? ' selected' : '')} onClick={()=>{this.props.dispatch(setViewOptions({layout:'horizontal'}))}} />
                <label>Horizontal</label>
              </div>
              <div>
                <button className={'button fa fa-chevron-down' + ((this.props.viewOptions.layout === 'vertical') ? ' selected' : '')} onClick={()=>{this.props.dispatch(setViewOptions({layout:'vertical'}))}} />
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
                        
  componentWillReceiveProps(props) {
    this.inputSubjectId.value = '';
  }
                        
  rotateLeft() {
    this.inputRotate.value = (parseInt(this.inputRotate.value) - ROTATE_STEP_VALUE + DEGREES_360) % DEGREES_360;
    this.updateTransform();
  }

  rotateRight() {
    this.inputRotate.value = (parseInt(this.inputRotate.value) + ROTATE_STEP_VALUE) % DEGREES_360;
    this.updateTransform();
  }
    
  zoomIn() {
    this.inputScale.value =parseFloat(this.inputScale.value) + ZOOM_STEP_VALUE;
    this.updateTransform();
  }
    
  zoomOut() {
    this.inputScale.value = Math.max(parseFloat(this.inputScale.value) - ZOOM_STEP_VALUE, ZOOM_MINIMUM);
    this.updateTransform();
  }
  
  moveLeft() {
    this.inputTranslateX.value = parseInt(this.inputTranslateX.value) - 10;
    this.updateTransform();
  }
    
  moveRight() {
    this.inputTranslateX.value = parseInt(this.inputTranslateX.value) + 10;
    this.updateTransform();
  }
    
  moveUp() {
    this.inputTranslateY.value = parseInt(this.inputTranslateY.value) - 10;
    this.updateTransform();
  }
    
  moveDown() {
    this.inputTranslateY.value = parseInt(this.inputTranslateY.value) + 10;
    this.updateTransform();
  }
  
  goToNextPage() {
    if (this.props.subjectId === null) return;  //Can't use (!this.props.subjectId) since '0' is a valid subjectId.
    try {
      const targetSubjectId = parseInt(this.props.subjectId) + 1;
      this.props.dispatch(fetchSubject(targetSubjectId.toString()));
    } catch (err) {}
  }
  
  goToPrevPage() {
    if (this.props.subjectId === null) return;  //Can't use (!this.props.subjectId) since '0' is a valid subjectId.
    try {
      const targetSubjectId = parseInt(this.props.subjectId) - 1;
      this.props.dispatch(fetchSubject(targetSubjectId.toString()));
    } catch (err) {}
  }
}

ControlPanel.propTypes = {
  subjectId: PropTypes.string,
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
  subjectId: null,
  subjectData: null,
  subjectStatus: null,
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
    subjectId: store.subjectId,
    subjectData: store.subjectData,
    subjectStatus: store.subjectStatus,
    rotate: store.viewRotate,
    scale: store.viewScale,
    translateX: store.viewTranslateX,
    translateY: store.viewTranslateY,
    viewOptions: store.viewOptions,
  };
};

export default connect(mapStateToProps)(ControlPanel);
