import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

const DIFFERENCE_IN_ANGLE_THRESHOLD = 15;
const DIFFERENCE_IN_DISTANCE_THRESHOLD = 100;
const ENABLE_TEXT_LINE_SPACING = true;

class EditorPanel extends React.Component {
  constructor(props) {
    super(props);
    
    this.textarea = null;
    this.onTextChange = this.onTextChange.bind(this);
    this.loadZooniverseData = this.loadZooniverseData.bind(this);
    
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
          <span className="button-container">
            <button className="button fa fa-question" onClick={this.TEST_MESSENGER.bind(this)}/>
            <label>TEST MESSENGER</label>
          </span>
        </div>
        <textarea ref={c=>{this.textarea=c}} value={this.state.text} onChange={this.onTextChange}></textarea>
        <div>
          <span className="button-container">
            <button className="button disabled fa fa-check-square"/>
            <label>Accept</label>
          </span>
          <span className="button-container">
            <button className="button disabled fa fa-cloud-upload"/>
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
    if (this.state.status === '') {
      this.loadZooniverseData(this.props);
    }
  }
  
  componentWillReceiveProps(next) {
    if (this.state.status === '') {
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
    if (!props.aggregationsData) return;
    
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

  TEST_MESSENGER() {
    const MESSENGER_URL = 'https://messenger-staging.zooniverse.org/';
    const url = MESSENGER_URL + '/transcriptions';
    
    console.log('TEST_MESSENGER\n', '-'.repeat(40));
    
    fetch(url)
    .then((response) => {
      console.log('TEST_MESSENGER...');
      if (response.status < 200 || response.status > 202) { return null; }
      console.log('TEST_MESSENGER: OK');
      return response.json();
    })
    .then((json) => {
      if (json && json.data) {
        console.log('TEST_MESSENGER: DATA');
        console.log(json.data);
      } else {
        console.error('TEST_MESSENGER: ERROR');
      }
    })
    .catch((err) => {
      console.error('TEST_MESSENGER: ERROR', err);
    });
  }
}

EditorPanel.propTypes = {
  aggregationsData: PropTypes.array,
  viewOptions: PropTypes.object,
};

EditorPanel.defaultProps = {
  aggregationsData: null,
  viewOptions: null,
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV5;
  return {
    aggregationsData: store.aggregationsData,
    viewOptions: store.viewOptions,
  };
};

export default connect(mapStateToProps)(EditorPanel);
