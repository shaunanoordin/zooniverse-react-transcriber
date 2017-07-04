import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { GENERAL_STATUS, MESSENGER_STATUS } from '../../constants/transcription-viewer-v5.js';
import { postTranscription } from '../../actions/transcription-viewer-v5.js';

import apiClient from 'panoptes-client/lib/api-client';
import { env, config } from '../../constants/config.js';

const DIFFERENCE_IN_ANGLE_THRESHOLD = 15;
const DIFFERENCE_IN_DISTANCE_THRESHOLD = 100;
const ENABLE_TEXT_LINE_SPACING = true;

const EDITOR_STATUS = {
  UNINITIALISED: 'uninitialised',
  ZOONIVERSE: 'using zooniverse data',
  MESSENGER: 'using transcription database data',
  EDITED: 'manually edited',
};

class EditorPanel extends React.Component {
  constructor(props) {
    super(props);
    
    this.textarea = null;
    this.onTextChange = this.onTextChange.bind(this);
    this.loadZooniverseData = this.loadZooniverseData.bind(this);
    this.loadTranscriptionDatabaseData = this.loadTranscriptionDatabaseData.bind(this);
    
    this.amendTranscription = this.amendTranscription.bind(this);
    
    this.state = {
      status: EDITOR_STATUS.UNINITIALISED,
      text: '',
    };
  }
  
  render() {
    return (
      <div className="editor-panel">
        <div style={{border: '1px solid #c63', background: '#eee'}}>
          <div>Transcription Status: {this.props.transcriptionStatus}</div>
          <div>Transcription Update Status: {this.props.transcriptionUpdateStatus}</div>
        </div>
        <div>
          {(()=>{
            switch (this.state.status) {
              case EDITOR_STATUS.ZOONIVERSE: 
                return (
                  <div className="message">
                    Currently showing aggregated text data from the Zooniverse 
                  </div>
                );
              case EDITOR_STATUS.MESSENGER:
                return (
                  <div className="message">
                    Data taken from the Transcription Database
                  </div>
                );
              case EDITOR_STATUS.EDITED:
                return (
                  <div className="message">
                    Text has been manually edited. Click 'Zooniverse Data' to reset.
                  </div>
                );
              default:
                return null;
            }
          })()}
          <span className="button-container">
            <button className="button fa fa-history" onClick={(e)=>{this.loadZooniverseData(this.props)}} />
            <label>Zooniverse Data</label>
          </span>
          <span className="button-container">
            <button className="button fa fa-cloud-download" onClick={(e)=>{this.loadTranscriptionDatabaseData(this.props)}} />
            <label>Load (Expert)</label>
          </span>
        </div>
        <textarea ref={c=>{this.textarea=c}} value={this.state.text} onChange={this.onTextChange}></textarea>
        <div>
          <span className="button-container">
            <button className="button disabled fa fa-check-square"/>
            <label>Accept</label>
          </span>
          <span className="button-container">
            <button className="button fa fa-cloud-upload" onClick={this.amendTranscription} />
            <label>Amend</label>
          </span>
          <span className="button-container">
            <button className="button disabled fa fa-trash"/>
            <label>Reject</label>
          </span>
        </div>
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
      status: EDITOR_STATUS.EDITED,
      text: this.textarea.value,
    });
  }
  
  loadTranscriptionDatabaseData(props = this.props) {
    this.setState({
      status: EDITOR_STATUS.MESSENGER,  //props.transcriptionData[0].attributes.status,
      text: props.transcriptionData[0].attributes.text,
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
    
    const compiledText = props.aggregationsData.reduce((total, cur, index, arr) => {
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
    }, '');
    
    this.setState({
      status: EDITOR_STATUS.ZOONIVERSE,
      text: compiledText,
    });
  }
  
  amendTranscription() {
    if (this.props.transcriptionStatus === GENERAL_STATUS.READY && this.props.transcriptionData) {
      if (this.props.transcriptionData.length === 0) {
        this.props.dispatch(postTranscription(this.props.subjectId, MESSENGER_STATUS.AMENDED, this.state.text, true));
      } else {
        this.props.dispatch(postTranscription(this.props.subjectId, MESSENGER_STATUS.AMENDED, this.state.text, false));
      }
    }
  }
  
  TEST_MESSENGER() {
    console.log('-'.repeat(100));
    
    const url = config.transcriptionsDatabaseUrl +
                'transcriptions/' + this.props.subjectId;
    
    const body = JSON.stringify({});

    const opt = {
      method: 'DELETE',
      mode: 'cors',
      headers: new Headers({
        'Authorization': apiClient.headers.Authorization,
        'Content-Type': 'application/json',
      }),
    };

    fetch(url, opt)
    .then((response) => {
      console.log('TEST_MESSENGER RESPONSE: ', response);
      if (response.status === 200 || response.status === 201 || response.status === 202) { return response.json(); }
      return null;
    })
    .then((json) => {
      if (json && json.data) {
        console.log('TEST_MESSENGER DATA: ', json.data);
      } else {
        console.log('TEST_MESSENGER DONE');
      }
    })
    .catch((err) => {
      console.error('TEST_MESSENGER ERROR: ', err);
    });
    //----------------
    
    console.log('='.repeat(100));
  }
}

EditorPanel.propTypes = {
  subjectId: PropTypes.number,
  aggregationsData: PropTypes.array,
  viewOptions: PropTypes.object,
  transcriptionStatus: PropTypes.string,
  transcriptionData: PropTypes.object,
  transcriptionUpdateStatus: PropTypes.string,
};

EditorPanel.defaultProps = {
  subjectId: null,
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
    aggregationsData: store.aggregationsData,
    viewOptions: store.viewOptions,
    transcriptionStatus: store.transcriptionStatus,
    transcriptionData: store.transcriptionData,
    transcriptionUpdateStatus: store.transcriptionUpdateStatus,
  };
};

export default connect(mapStateToProps)(EditorPanel);
