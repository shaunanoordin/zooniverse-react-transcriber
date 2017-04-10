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
            Editor Mode is currently in Test Phase
          </div>
          <span className="button-container">
            <label>Zooniverse Data</label>
            <button className="button fa fa-history" onClick={(e)=>{this.getTextFromAggregations(this.props)}} />
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
        <textarea ref={c=>{this.textarea=c}} value={this.state.text}></textarea>
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
  
  componentDidMount() {
    //this.getTextFromAggregations();
  }
  
  componentWillReceiveProps(next) {
    //console.log('RECEIVE PROPS\n', '-'.repeat(80), '\n', next);
    this.getTextFromAggregations(next);
  }
  
  getTextFromAggregations(props = this.props) {
    if (!props.aggregationsData) return;
    
    const whatYouSeeIsWhatYouText = props.aggregationsData.reduce((total, agg) => {
      if (!agg.show) return total;
      
      return total + agg.text + '\n';
    }, '');
    
    this.setState({
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
