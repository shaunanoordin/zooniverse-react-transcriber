import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { GENERAL_STATUS, MESSENGER_STATUS } from '../../constants/transcription-viewer-v5.js';
import { postTranscription, registerProjectForTranscriptions, deleteTranscription } from '../../actions/transcription-viewer-v5.js';

import apiClient from 'panoptes-client/lib/api-client';
import { env, config } from '../../constants/config.js';

const DIFFERENCE_IN_ANGLE_THRESHOLD = 15;
const DIFFERENCE_IN_DISTANCE_THRESHOLD = 100;
const ENABLE_TEXT_LINE_SPACING = true;

const EDITOR_STATUS = {
  UNINITIALISED: 'uninitialised',
  ZOONIVERSE: 'using zooniverse data',
  MESSENGER: 'using transcription database data',
  EDITING: 'manually editing',
};

class EditorPanel extends React.Component {
  constructor(props) {
    super(props);
    
    this.textarea = null;
    this.onTextChange = this.onTextChange.bind(this);
    this.loadZooniverseData = this.loadZooniverseData.bind(this);
    this.loadTranscriptionDatabaseData = this.loadTranscriptionDatabaseData.bind(this);
    
    this.postTranscriptionData = this.postTranscriptionData.bind(this);
    
    this.state = {
      status: EDITOR_STATUS.UNINITIALISED,
      text: '',
    };
  }
  
  render() {
    return (
      <div className="editor-panel">
        <div className="status-subpanel">
          
          {(() => {
            //----------------------------------------------------------------
            if (this.props.aggregationsStatus === GENERAL_STATUS.LOADING) {
              return (
                <div className="data-row loading">
                  <i className="fa fa-spin fa-spinner" />
                  Loading Zooniverse Aggregation data...
                </div>
              );
            } else if (this.props.aggregationsStatus === GENERAL_STATUS.ERROR) {
              return (
                <div className="data-row error">
                  <i className="fa fa-warning" />
                  <span>ERROR: could not load Zooniverse Aggregation data.</span>
                </div>
              );
            } else if (this.props.aggregationsStatus === GENERAL_STATUS.READY) {
              if (!this.props.aggregationsData || this.props.aggregationsData.length === 0) {
                return (
                  <div className="data-row">
                    <i className="fa fa-meh-o" />
                    <span>No Zooniverse Aggregation data found.</span>
                  </div>
                );
              } else if (this.state.status === EDITOR_STATUS.ZOONIVERSE) {
                return (
                  <div className="data-row ready">
                    <button className="selected small button fa fa-check-square-o" onClick={()=>{this.loadZooniverseData()}} />
                    <label>Zooniverse Aggregation data</label>
                  </div>
                );
              } else {
                return (
                  <div className="data-row ready">
                    <button className="small button fa fa-square-o" onClick={()=>{this.loadZooniverseData()}} />
                    <label>Zooniverse Aggregation data</label>
                  </div>
                );
              }
            }
            return null;
            //----------------------------------------------------------------
          })()}
          
          {(() => {
            //----------------------------------------------------------------
            if (this.props.transcriptionStatus === GENERAL_STATUS.LOADING) {
              return (
                <div className="data-row loading">
                  <i className="fa fa-spin fa-spinner" />
                  Loading Transcription Database (expert revisions)...
                </div>
              );
            } else if (this.props.transcriptionStatus === GENERAL_STATUS.ERROR) {
              return (
                <div className="data-row error">
                  <i className="fa fa-warning" />
                  <span>ERROR: could not load Transcription Database.</span>
                </div>
              );
            } else if (this.props.transcriptionStatus === GENERAL_STATUS.READY) {
              if (!this.props.transcriptionData || this.props.transcriptionData.length === 0) {
                return (
                  <div className="data-row">
                    <i className="fa fa-meh-o" />
                    <span>No Transcription Database data found.</span>
                  </div>
                );
              } else if (this.state.status === EDITOR_STATUS.MESSENGER) {
                const messenger_status = (this.props.transcriptionData[0].attributes && this.props.transcriptionData[0].attributes.status)
                  ? this.props.transcriptionData[0].attributes.status
                  : null;
                
                return (
                  <div className="data-row ready">
                    <button className="selected small button fa fa-check-square-o" onClick={()=>{this.loadTranscriptionDatabaseData()}} />
                    <label>Transcription Database data (expert revision)</label>
                    {(()=>{
                      switch (messenger_status) {
                        case MESSENGER_STATUS.ACCEPTED:
                          return <span className="status approved">Approved</span>;
                        case MESSENGER_STATUS.REJECTED:
                          return <span className="status rejected">Rejected</span>;
                        case MESSENGER_STATUS.AMENDED:
                          return <span className="status amended">Amended</span>;
                        default:
                          return <span className="status unreviewed">Unreviewed</span>;
                      }
                    })()}
                  </div>
                );
              } else {
                return (
                  <div className="data-row ready">
                    <button className="small button fa fa-square-o" onClick={()=>{this.loadTranscriptionDatabaseData()}} />
                    <label>Transcription Database data (expert revision)</label>
                    {(()=>{
                      if (this.state.status === EDITOR_STATUS.EDITING) {
                        return <span className="status">Editing...</span>;
                      }
                      return null;
                    })()}
                  </div>
                );
              }
            }
            return null;
            //----------------------------------------------------------------
          })()}
          
          <div className="overall-status data-row">
          {(() => {
            //----------------------------------------------------------------
            if (this.props.transcriptionUpdateStatus === GENERAL_STATUS.PROCESSING) {
              return <span><i className="fa fa-spin fa-spinner" /> Connecting to the Transcription Database...</span>;
            } else if (this.state.status === EDITOR_STATUS.MESSENGER) {
              return 'Showing expert revision';
            } else if (this.state.status === EDITOR_STATUS.ZOONIVERSE) {
              return 'Showing Zooniverse data';
            } else if (this.state.status === EDITOR_STATUS.EDITING) {
              return <span><i className="fa fa-pencil" /> Editing in progress</span>;
            }
            return '-';
            //----------------------------------------------------------------
          })()}
          </div>
          
          {(() => {
            //----------------------------------------------------------------
            const transcriptionDatabaseIsReadyForInput =
              this.props.transcriptionStatus === GENERAL_STATUS.READY &&
              this.props.transcriptionUpdateStatus !== GENERAL_STATUS.PROCESSING;
                  
            return (
              <div className="transcription-subcontrols data-row">
                {(transcriptionDatabaseIsReadyForInput)
                  ? <button className="approve button" onClick={() => { this.postTranscriptionData(MESSENGER_STATUS.ACCEPTED) }}><b className="fa fa-thumbs-up" /> Approve</button>
                  : <button className="disabled button"><b className="fa fa-thumbs-up" /> Approve</button>
                }
                {(transcriptionDatabaseIsReadyForInput)
                  ? <button className="reject button" onClick={() => { this.postTranscriptionData(MESSENGER_STATUS.REJECTED) }}><b className="fa fa-thumbs-down" /> Reject</button>
                  : <button className="disabled button"><b className="fa fa-thumbs-down" /> Reject</button>
                }
                {(transcriptionDatabaseIsReadyForInput)
                  ? <button className="amend button" onClick={() => { this.postTranscriptionData(MESSENGER_STATUS.AMENDED) }}><b className="fa fa-pencil" /> Amend</button>
                  : <button className="disabled button"><b className="fa fa-pencil-square" /> Amend</button>
                }
              </div>
            );
            //----------------------------------------------------------------
          })()}
          
          
          {(() => {
            //----------------------------------------------------------------
            if (/(\?|&)admin(=|&|$)/ig.test(window.location.search)) {
              return (
                <div className="transcription-subcontrols data-row">
                  <button className="button" onClick={this.MESSENGER_ADMIN_DELETE_TRANSCRIPTION.bind(this)}><b className="fa fa-warning" /> Delete Transcription</button>
                  <span>||||</span>
                  <input type="text" ref={(ele) => { this.MESSENGER_ADMIN_PROJECT_SLUG = ele; }}
                    placeholder="Panoptes Project slug"
                  />
                  <button className="button" onClick={this.MESSENGER_ADMIN_REGISTER_PROJECT.bind(this)}><b className="fa fa-warning" /> Register Project</button>
                </div>
              );
            }
            
            return null
            //----------------------------------------------------------------
          })()}
          
          {/*
          <div className="transcription-subcontrols data-row">
            <button className="button" onClick={this.TEST_MESSENGER.bind(this)}><b className="fa fa-warning" /> Test</button>
          </div>
          */}
        </div>
        <textarea ref={c=>{this.textarea=c}} value={this.state.text} onChange={this.onTextChange}></textarea>
      </div>
    );
  }
  
  componentWillReceiveProps(next) {
    //When page refreshes - and the user hasn't made any edits - load the default data.
    
    if (this.state.status === EDITOR_STATUS.UNINITIALISED || this.state.status === EDITOR_STATUS.ZOONIVERSE) {
      if (next.transcriptionStatus === GENERAL_STATUS.READY) {
        if (next.transcriptionData && next.transcriptionData[0] &&
            next.transcriptionData[0].attributes) {
          this.loadTranscriptionDatabaseData(next);
        } else {
          this.loadZooniverseData(next);
        }
      } else {
        this.loadZooniverseData(next);
      }
    }
  }
  
  onTextChange(e) {
    this.setState({
      status: EDITOR_STATUS.EDITING,
      text: this.textarea.value,
    });
  }
  
  loadTranscriptionDatabaseData(props = this.props) {
    const text = (props.transcriptionData && props.transcriptionData[0] && props.transcriptionData[0].attributes.text)
      ? props.transcriptionData[0].attributes.text
      : null;
    
    if (text === null) { return; }
    
    this.setState({
      status: EDITOR_STATUS.MESSENGER,  //props.transcriptionData[0].attributes.status,
      text,
    });
  }
  
  loadZooniverseData(props = this.props) {
    if (!props.aggregationsData) {
      this.setState({
        status: EDITOR_STATUS.UNINITIALISED,
        text: '',
      });
      return;
    };
    
    this.setState({
      status: EDITOR_STATUS.ZOONIVERSE,
      text: this.compileZooniverseText(props),
    });
  }
  
  compileZooniverseText(props = this.props) {
    return (props.aggregationsData)
      ? props.aggregationsData.reduce((total, cur, index, arr) => {
          //Optional: give some spacing between those lines to reflect how the text
          //layout on the physical page.
          if (ENABLE_TEXT_LINE_SPACING && index > 0) {
            const prev = arr[index-1];

            const curAngle = Math.atan2(cur.endY - cur.startY, cur.endX - cur.startX) / Math.PI * 180;
            const prevAngle = Math.atan2(prev.endY - prev.startY, prev.endX - prev.startX) / Math.PI * 180;

            const distStartX = cur.startX - prev.startX;
            const distStartY = cur.startY - prev.startY;
            const distEndX = cur.endX - prev.endX;
            const distEndY = cur.endY - prev.endY;

            const diffAngle = Math.abs(prevAngle - curAngle);
            const diffStartDistance = Math.sqrt(distStartX * distStartX + distStartY * distStartY);
            const diffEndDistance = Math.sqrt(distEndX * distEndX + distEndY * distEndY);

            //Two lines of text should be separated if the previous line is
            //significantly different (i.e. different rotation) or very far from
            //the current line.
            if (diffAngle > DIFFERENCE_IN_ANGLE_THRESHOLD || 
                diffStartDistance > DIFFERENCE_IN_DISTANCE_THRESHOLD) {
              return total + '\n' + cur.text + '\n';
            }
          }

          return total + cur.text + '\n';
        }, '')
      : null;
  }
  
  postTranscriptionData(status) {
    let text = this.state.text;
    
    this.setState({
      status: EDITOR_STATUS.MESSENGER,
    });
    
    if (this.props.transcriptionStatus === GENERAL_STATUS.READY && this.props.transcriptionData) {
      if (this.props.transcriptionData.length === 0) {
        this.props.dispatch(postTranscription(this.props.subjectId, status, text, true));
      } else {
        this.props.dispatch(postTranscription(this.props.subjectId, status, text, false));
      }
    } else {
      alert('ERROR: the Transcription Database could not be reached.');
    }
  }
  
  MESSENGER_ADMIN_REGISTER_PROJECT() {
    if (!this.MESSENGER_ADMIN_PROJECT_SLUG) return;
    
    //--------------------------------
    const project_slug = this.MESSENGER_ADMIN_PROJECT_SLUG.value;
    registerProjectForTranscriptions(project_slug);
    //--------------------------------
  }
  
  MESSENGER_ADMIN_DELETE_TRANSCRIPTION() {
    deleteTranscription(this.props.subjectId);
  }
}

EditorPanel.propTypes = {
  subjectId: PropTypes.number,
  aggregationsStatus: PropTypes.string,
  aggregationsData: PropTypes.array,
  viewOptions: PropTypes.object,
  transcriptionStatus: PropTypes.string,
  transcriptionData: PropTypes.object,
  transcriptionUpdateStatus: PropTypes.string,
};

EditorPanel.defaultProps = {
  subjectId: null,
  aggregationsStatus: null,
  aggregationsData: null,
  viewOptions: null,
  transcriptionStatus: GENERAL_STATUS.IDLE,
  transcriptionData: null,
  transcriptionUpdateStatus: GENERAL_STATUS.IDLE,
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV5;
  return {
    subjectId: store.subjectId,
    aggregationsStatus: store.aggregationsStatus,
    aggregationsData: store.aggregationsData,
    viewOptions: store.viewOptions,
    transcriptionStatus: store.transcriptionStatus,
    transcriptionData: store.transcriptionData,
    transcriptionUpdateStatus: store.transcriptionUpdateStatus,
  };
};

export default connect(mapStateToProps)(EditorPanel);
