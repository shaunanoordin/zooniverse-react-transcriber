import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import apiClient from 'panoptes-client/lib/api-client.js';
import { fetchSubject } from '../../actions/subjects.js';
import { Utility, KEY_CODES } from '../../tools/Utility.js';
import * as status from '../../constants/status.js';

import SVGViewer from './SVGViewer.jsx';
import SVGImage from './SVGImage.jsx';

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
    };
  }
  
  execFetchSubject() {
    const subjectId = this.inputSubjectID.value;
    console.log(subjectId);
    this.props.dispatch(fetchSubject(subjectId));
  }
  
  imageHasLoaded(img) {
    if (!img) return;
    
    const hScale = (img.width !== 0) ? 800 / img.width : 1;
    const vScale = (img.height !== 0) ? 800 / img.height : 1;
    
    this.setState({
      scale: Number(Math.min(hScale, vScale).toPrecision(1)),
      loadedImage: { width: img.width, height: img.height },
    });
  }
  
  render() {
    return (
      <div className="transcribe">
        <h2>Subject Viewer</h2>
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
            <button onClick={this.fetchSubject}>&raquo;</button>
          </div>
          <div className="status-subpanel">
            {(this.props.subjectID)
              ? <p>Subject ID {this.props.subjectID}</p>
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
                  return <p>Aggregations ready.</p>;
                case status.STATUS_ERROR:
                  return <p>No Aggregations, sorry.</p>;
              }
              return null;
            })()}
          </div>
        </div>
        
        {(this.props.subjectData && this.props.subjectData.locations && this.props.subjectData.locations.length > 0)
          ? <div className="viewer-panel">
              <SVGViewer scale={this.state.scale} translateX={this.state.translateX} translateY={this.state.translateY} rotate={this.state.rotate} width="800" height="400">
              {this.props.subjectData.locations.map((loc, locIndex) => {
                return <SVGImage key={'image-'+locIndex} src={loc["image/jpeg"]} onLoad={this.imageHasLoaded} />;
              })}
                
              {(this.props.aggregationsData)
                ? this.props.aggregationsData.map((agg) => {
                  const textAngle = ((Math.atan2(agg.endY - agg.startY, agg.endX - agg.startX)  / Math.PI * 180) + 0) % 360;
                  
                  return (
                    <g className="aggregated-text" transform={'translate(' + (this.state.loadedImage.width * -0.5) + ',' + (this.state.loadedImage.height * -0.5) + ') '}>
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
                })
                : null
              }
                
              </SVGViewer>
              <table className="control-subpanel">
                <tbody>
                  <tr>
                    <td>Scale</td>
                    <td>
                      <input
                        value={this.state.scale}
                        ref={(itm) => { this.inputScale = itm; }}
                        onChange={this.updateTransform}
                        type="number"
                        step="0.2"
                        min="0.2" />
                    </td>
                  </tr>
                  <tr>
                    <td>Translate (x,y)</td>
                    <td>
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
                    </td>
                  </tr>
                  <tr>
                    <td>Rotate (deg)</td>
                    <td>
                      <input
                        value={this.state.rotate}
                        ref={(itm) => { this.inputRotate = itm; }}
                        onChange={this.updateTransform} 
                        type="number"
                        step="15" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          : null
        }
        
        {(this.props.subjectData && this.props.subjectData.metadata)
          ? <table className="metadata-panel">
              <tbody>
              {(() => {
                let metadata = [];
                for (let m in this.props.subjectData.metadata) {
                  metadata.push(<tr key={m}><td>{m}</td><td>{this.props.subjectData.metadata[m]}</td></tr>);
                }
                return metadata;
              })()}
              </tbody>
            </table>
          : null
        }
      </div>
    );
  }
  
  componentDidMount() {
    apiClient.type('projects').get('376')
    .then((data) => {
      console.log('Project 376\n'+'-'.repeat(80));
      console.log(data);
    });
    
    apiClient.type('set_member_subjects').get({id: '2509', page: '1'})
    .then((data) => {
      console.log('Set Member Subjects 2509\n'+'-'.repeat(80));
      console.log(data);
    });
    
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
}

Index.propTypes = {
  subjectID: PropTypes.string,
  subjectData: PropTypes.object,
  subjectStatus: PropTypes.string,
  aggregationsData: PropTypes.array,
  aggregationsStatus: PropTypes.string,
};

Index.defaultProps = {
  subjectID: null,
  subjectData: null,
  subjectStatus: null,
  aggregationsData: null,
  aggregationsStatus: null,
};

const mapStateToProps = (state) => {
  return {
    subjectID: state.subjects.subjectID,
    subjectData: state.subjects.subjectData,
    subjectStatus: state.subjects.subjectStatus,
    aggregationsData: state.subjects.aggregationsData,
    aggregationsStatus: state.subjects.aggregationsStatus,
  };
};

export default connect(mapStateToProps)(Index);
