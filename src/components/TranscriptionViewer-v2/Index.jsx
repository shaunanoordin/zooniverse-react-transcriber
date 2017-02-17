import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import apiClient from 'panoptes-client/lib/api-client.js';
import { fetchSubject } from '../../actions/transcription-viewer-v2.js';
import { Utility, KEY_CODES } from '../../tools/Utility.js';
import * as status from '../../constants/status.js';

import SVGViewer from './SVGViewer.jsx';
import SVGImage from './SVGImage.jsx';
import SVGAggregatedText from './SVGAggregatedText.jsx';

const DEFAULT_SVGVIEWER_WIDTH = 1024;
const DEFAULT_SVGVIEWER_HEIGHT = 640;

const SHOWAGGREGATIONS_NONE = 'show-aggregations-none';
const SHOWAGGREGATIONS_OVERLAY = 'show-aggregations-overlay';
const SHOWAGGREGATIONS_FULL = 'show-aggregations-full';
const SHOWAGGREGATIONS_CENSORED = 'show-aggregations-censored';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.inputSubjectID = null;
    this.execFetchSubject = this.execFetchSubject.bind(this);
    
    this.inputScale = null;
    this.inputTranslateX = null;
    this.inputTranslateY = null;
    this.inputRotate = null;
    this.updateTransform = this.updateTransform.bind(this);
    this.imageHasLoaded = this.imageHasLoaded.bind(this);
    
    this.state = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotate: 0,
      loadedImage: { width: 0, height: 0 },
      showAggregations: SHOWAGGREGATIONS_OVERLAY,
    };
  }
  
  execFetchSubject() {
    const subjectId = this.inputSubjectID.value;
    this.props.dispatch(fetchSubject(subjectId));
  }
  
  imageHasLoaded(img) {
    if (!img) return;
    
    const hScale = (img.width !== 0) ? DEFAULT_SVGVIEWER_WIDTH / img.width : 1;
    const vScale = (img.height !== 0) ? DEFAULT_SVGVIEWER_HEIGHT / img.height : 1;
    
    this.setState({
      scale: Number(Math.min(hScale, vScale).toPrecision(1)),
      loadedImage: { width: img.width, height: img.height },
    });
  }
  
  render() {
    return (
      <div className="transcription-viewer-v2">
        
        {(this.props.subjectData && this.props.subjectData.locations && this.props.subjectData.locations.length > 0)
          ?
            <SVGViewer
              scale={this.state.scale}
              translateX={this.state.translateX}
              translateY={this.state.translateY}
              rotate={this.state.rotate}
              className={this.state.showAggregations}
              width={DEFAULT_SVGVIEWER_WIDTH}
              height={DEFAULT_SVGVIEWER_HEIGHT}
            >
            {this.props.subjectData.locations.map((loc, locIndex) => {
              return <SVGImage key={'image-'+locIndex} src={loc["image/jpeg"]} onLoad={this.imageHasLoaded} />;
            })}

            {(this.props.aggregationsData)
              ? this.props.aggregationsData.map((agg, index) => {
                return (
                  <SVGAggregatedText
                    key={'aggtext_' + agg.startX + '_' + agg.startY}
                    offsetX={this.state.loadedImage.width * -0.5}
                    offsetY={this.state.loadedImage.height * -0.5}
                    aggregation={agg}
                    index={index}
                  />
                );
              })
              : null
            }

            </SVGViewer>
          : null
        }
        
        <div className="control-panel">
          <div className="row">
            <label>Scale</label>
            <span className="data">
              <input
                value={this.state.scale}
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
                value={this.state.translateX}
                ref={(itm) => { this.inputTranslateX = itm; }}
                onChange={this.updateTransform}
                type="number"
                step="10" />
              <input
                value={this.state.translateY}
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
                value={this.state.rotate}
                ref={(itm) => { this.inputRotate = itm; }}
                onChange={this.updateTransform} 
                type="number"
                step="15" />
            </span>
          </div>
        </div>
        
        {(this.props.subjectData && this.props.subjectData.metadata)
          ? <div className="metadata-panel">
              {(() => {
                let metadata = [];
                for (let m in this.props.subjectData.metadata) {
                  metadata.push(<div className="row" key={m}><label>{m}</label><span className="data">{this.props.subjectData.metadata[m]}</span></div>);
                }
                return metadata;
              })()}
            </div>
          : null
        }
        
        <div className="input-panel">
          <div>
            <input type="text" ref={(ele) => { this.inputSubjectID = ele; }}
              placeholder="Panoptes Subject ID, e.g. 1274999"
              onKeyPress={(e) => {
                if (Utility.getKeyCode(e) === KEY_CODES.ENTER) {
                  this.execFetchSubject();
                }
              }}
            />
            <button onClick={this.execFetchSubject}>&raquo;</button>
          </div>
          <div className="status-subpanel">
            {(this.props.subjectID)
              ? (<p>
                  <button onClick={this.goToPrevPage.bind(this)}>&laquo;</button>
                  <span>Subject ID {this.props.subjectID}</span>
                  <button onClick={this.goToNextPage.bind(this)}>&raquo;</button>
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
                    <p>
                      Aggregations ready.
                      <select onChange={this.setShowAggregations.bind(this)} value={this.state.showAggregations}>
                        <option value={SHOWAGGREGATIONS_NONE}>None</option>
                        <option value={SHOWAGGREGATIONS_OVERLAY}>Overlay</option>
                        <option value={SHOWAGGREGATIONS_FULL}>Full</option>
                        <option value={SHOWAGGREGATIONS_CENSORED}>Censored by the FBI</option>
                      </select>
                    </p>
                  );
                case status.STATUS_ERROR:
                  return <p>No Aggregations, sorry.</p>;
              }
              return null;
            })()}
          </div>
        </div>
        
        {(this.props.currentAggregation !== null && this.props.aggregationsData && this.props.aggregationsData[this.props.currentAggregation])
          ? <div className="aggregation-panel">
              <div className="aggregated">{this.props.aggregationsData[this.props.currentAggregation].text}</div>
              {(() => {
                const agg = this.props.aggregationsData[this.props.currentAggregation];
                if (!agg.raw) return null;
                
                return agg.raw.map((raw) => {
                  return <div className="raw">{raw.text}</div>;
                });
              })()}
            </div>
          : null
        }
        
      </div>
    );
  }
  
  componentDidMount() {
    //DEFAULT image
    this.props.dispatch(fetchSubject('1274999'));    
  }
  
  updateTransform(e) {
    this.setState({
      scale: this.inputScale.value,
      translateX: this.inputTranslateX.value,
      translateY: this.inputTranslateY.value,
      rotate: this.inputRotate.value,
    });
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
  
  setShowAggregations(e) {
    const val = e.target.options[e.target.selectedIndex].value;

    this.setState({
      showAggregations: val
    });
  }
}

Index.propTypes = {
  subjectID: PropTypes.string,
  subjectData: PropTypes.object,
  subjectStatus: PropTypes.string,
  aggregationsData: PropTypes.array,
  aggregationsStatus: PropTypes.string,
  currentAggregation: PropTypes.number,
};

Index.defaultProps = {
  subjectID: null,
  subjectData: null,
  subjectStatus: null,
  aggregationsData: null,
  aggregationsStatus: null,
  currentAggregation: null,
};

const mapStateToProps = (state) => {
  return {
    subjectID: state.transcriptionViewerV2.subjectID,
    subjectData: state.transcriptionViewerV2.subjectData,
    subjectStatus: state.transcriptionViewerV2.subjectStatus,
    aggregationsData: state.transcriptionViewerV2.aggregationsData,
    aggregationsStatus: state.transcriptionViewerV2.aggregationsStatus,
    currentAggregation: state.transcriptionViewerV2.currentAggregation,
  };
};

export default connect(mapStateToProps)(Index);
