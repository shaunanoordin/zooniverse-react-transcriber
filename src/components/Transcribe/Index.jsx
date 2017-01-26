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
    
    this.state = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotate: 0,
    };
  }
  
  execFetchSubject() {
    const subjectId = this.inputSubjectID.value;
    console.log(subjectId);
    this.props.dispatch(fetchSubject(subjectId));
  }
  
  render() {
    //const test = apiClient.type('subjects').get('1275918')
    //.then((subject) => {
    //  console.log('-'.repeat(80));
    //  console.log(subject);
    //});
    
    return (
      <div className="transcribe">
        <h2>Transcribe...</h2>
        <div className="input-panel">
          <div>
            <input type="text" ref={(ele) => { this.inputSubjectID = ele; }}
              placeholder="Panoptes Subject ID, e.g. 1275918"
              onKeyPress={(e) => {
                if (Utility.getKeyCode(e) === KEY_CODES.ENTER) {
                  this.execFetchSubject();
                }
              }}
            />
            <button onClick={this.fetchSubject}>&raquo;</button>
          </div>
          <div className="status-subpanel">
            {(() => {
              switch (this.props.subjectStatus) {
                case status.STATUS_IDLE:
                  return "Type in a Panoptes Subject ID to search!";
                case status.STATUS_LOADING:
                  return "Looking for Subject...";
                case status.STATUS_READY:
                  return "Subject ready.";
                case status.STATUS_ERROR:
                  return "WHOOPS - Something went wrong!";
              }
              return "???";
            })()}
          </div>
        </div>
        
        {(this.props.subject && this.props.subject.locations && this.props.subject.locations.length > 0)
          ? <div className="viewer-panel">
              <SVGViewer scale={this.state.scale} translateX={this.state.translateX} translateY={this.state.translateY} rotate={this.state.rotate}>
              {this.props.subject.locations.map((loc, locIndex) => {
                return <SVGImage key={'image-'+locIndex} src={loc["image/jpeg"]} />;
              })}
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
        
        {(this.props.subject && this.props.subject.metadata)
          ? <table className="metadata-panel">
              <tbody>
              {(() => {
                let metadata = [];
                for (let m in this.props.subject.metadata) {
                  metadata.push(<tr key={m}><td>{m}</td><td>{this.props.subject.metadata[m]}</td></tr>);
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
    
    this.props.dispatch(fetchSubject('1275918'));
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
  subject: PropTypes.object,
  subjectStatus: PropTypes.string,
};

Index.defaultProps = {
  subject: null,
  subjectStatus: null,
};

const mapStateToProps = (state) => {
  return {
    subject: state.subjects.subject,
    subjectStatus: state.subjects.subjectStatus,
  };
};

export default connect(mapStateToProps)(Index);
