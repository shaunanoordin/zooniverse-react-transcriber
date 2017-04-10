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
            <label>Zooniverse Data</label>
            <button className="button fa fa-history" onClick={(e)=>{this.loadZooniverseData(this.props)}} />
          </span>
          <span className="button-container">
            <label>Load (Expert)</label>
            <button className="button disabled fa fa-cloud-download"/>
          </span>
          <span className="button-container">
            <label>Save (Amend)</label>
            <button className="button disabled fa fa-cloud-upload"/>
          </span>
        </div>
        <textarea ref={c=>{this.textarea=c}} value={this.state.text} onChange={this.onTextChange}></textarea>
        <div>
          <span className="button-container">
            <label>Accept</label>
            <button className="button disabled fa fa-check-square"/>
          </span>
          <span className="button-container">
            <label>Amend</label>
            <button className="button disabled fa fa-cloud-upload"/>
          </span>
          <span className="button-container">
            <label>Reject</label>
            <button className="button disabled fa fa-trash"/>
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
    
    const whatYouSeeIsWhatYouText = props.aggregationsData.reduce((total, agg) => {
      //if (!agg.show) return total;
      return total + agg.text + '\n';
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
  const store = state.transcriptionViewerV4;
  return {
    aggregationsData: store.aggregationsData,
  };
};

export default connect(mapStateToProps)(EditorPanel);
