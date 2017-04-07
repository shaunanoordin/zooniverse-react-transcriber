import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

class EditorPanel extends React.Component {
  constructor(props) {
    super(props);
    
    this.textarea = null;
    this.getTextFromAggregations = this.getTextFromAggregations.bind(this);
    
    this.state = {
      text: '',
    };
  }
  
  render() {
    return (
      <div className="editor-panel">
        <div>
          <div className="message">
            Showing Zooniverse Aggregation
          </div>
          <span className="button-container">
            <label>Reset (Zooniverse)</label>
            <button className="button fa fa-history"/>
          </span>
          <span className="button-container">
            <label>Load (Expert)</label>
            <button className="button fa fa-cloud-download"/>
          </span>
          <span className="button-container">
            <label>Save (Amend)</label>
            <button className="button fa fa-cloud-upload"/>
          </span>
        </div>
        <textarea ref={c=>{this.textarea=c}} />
        <div>
          <span className="button-container">
            <label>Accept</label>
            <button className="button fa fa-check-square"/>
          </span>
          <span className="button-container">
            <label>Amend</label>
            <button className="button fa fa-cloud-upload"/>
          </span>
          <span className="button-container">
            <label>Reject</label>
            <button className="button fa fa-trash"/>
          </span>
        </div>
      </div>
    );
  }
  
  getTextFromAggregations(e) {
    if (!this.props.aggregationsData) return;
    
    //TEST EXPORT
    //----------------------------------------------------------------
    /*
    const whatYouSeeIsWhatYouText = this.props.aggregationsData.reduce((total, agg) => {
      if (!agg.show) return total;
      
      return total + agg.text + '\n';
    }, '');
    
    console.log(whatYouSeeIsWhatYouText);
    alert(whatYouSeeIsWhatYouText);
    */
    //----------------------------------------------------------------
      
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
