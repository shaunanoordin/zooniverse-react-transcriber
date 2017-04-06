import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

class EditorPanel extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div className="editor-panel">
        <textarea />
      </div>        
    );
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
