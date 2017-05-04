import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

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
    
    const whatYouSeeIsWhatYouText = props.aggregationsData.reduce((total, cur, index, arr) => {
      if (index > 0) {
        const prev = arr[index-1];
        const curAngle = Math.atan2(cur.startY - cur.endY, cur.startX - cur.endX) * Math.PI * 2;
        const prevAngle = Math.atan2(prev.startY - prev.endY, prev.startX - prev.endX) * Math.PI * 2;
        //TODO: 2017.04.12 - Group lines together based on their proximity.
      }
      
      return total + cur.text + '\n';
    }, '');
    
    this.setState({
      status: 'zooniverse',
      text: whatYouSeeIsWhatYouText,
    });
  }
}

EditorPanel.propTypes = {
  aggregationsData: PropTypes.array,
};

EditorPanel.defaultProps = {
  aggregationsData: null,
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV5;
  return {
    aggregationsData: store.aggregationsData,
  };
};

export default connect(mapStateToProps)(EditorPanel);
