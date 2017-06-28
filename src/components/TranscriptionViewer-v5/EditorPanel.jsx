import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as status from '../../constants/status';
import { postTranscription } from '../../actions/transcription-viewer-v5.js';
import apiClient from 'panoptes-client/lib/api-client';

const DIFFERENCE_IN_ANGLE_THRESHOLD = 15;
const DIFFERENCE_IN_DISTANCE_THRESHOLD = 100;
const ENABLE_TEXT_LINE_SPACING = true;

class EditorPanel extends React.Component {
  constructor(props) {
    super(props);
    
    this.textarea = null;
    this.onTextChange = this.onTextChange.bind(this);
    this.loadZooniverseData = this.loadZooniverseData.bind(this);
    
    this.amendTranscription = this.amendTranscription.bind(this);
    
    this.state = {
      status: '',
      text: '',
    };
  }
  
  render() {
    return (
      <div className="editor-panel">
        <div>
          {(()=>{
            switch (this.state.status) {
              case 'zooniverse': 
                return (
                  <div className="message">
                    Currently showing aggregated text data from the Zooniverse 
                  </div>
                );
              case 'edited':
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
            <button className="button disabled fa fa-cloud-download"/>
            <label>Load (Expert)</label>
          </span>
          <span className="button-container">
            <button className="button disabled fa fa-cloud-upload"/>
            <label>Save (Amend)</label>
          </span>
        </div>
        <div style={{border: '1px solid #c63', background: '#eee'}}>
          <div>Transcription Status: {this.props.transcriptionStatus}</div>
          <div>Transcription Update Status: {this.props.transcriptionUpdateStatus}</div>
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
  
  componentDidMount() {
    //When page loads, load the default data.
    this.loadZooniverseData();
  }
  
  componentWillReceiveProps(next) {
    //When page refreshes - and the user hasn't made any edits - load the default data.
    if (this.state.status === '' || this.state.status === 'zooniverse') {
      this.loadZooniverseData(next);
    }
  }
  
  onTextChange(e) {
    this.setState({
      status: 'edited',
      text: this.textarea.value,
    });
  }
  
  loadZooniverseData(props = this.props) {
    if (!props.aggregationsData) {
      this.setState({
        status: '',
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
      status: 'zooniverse',
      text: compiledText,
    });
  }
  
  amendTranscription() {
    this.props.dispatch(postTranscription(this.props.subjectId, 'amend', this.state.text));
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
  transcriptionStatus: status.STATUS_IDLE,
  transcriptionData: null,
  transcriptionUpdateStatus: status.STATUS_IDLE,
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV5;
  return {
    subjectIg: store.subjectId,
    aggregationsData: store.aggregationsData,
    viewOptions: store.viewOptions,
    transcriptionStatus: store.transcriptionStatus,
    transcriptionData: store.transcriptionData,
    transcriptionUpdateStatus: store.transcriptionUpdateStatus,
  };
};

export default connect(mapStateToProps)(EditorPanel);
