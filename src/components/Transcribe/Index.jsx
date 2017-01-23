import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import apiClient from 'panoptes-client/lib/api-client.js';
import { fetchSubject } from '../../actions/subjects.js';

class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const test = apiClient.type('subjects').get('1275918')
    .then((subject) => {
      console.log('-'.repeat(80));
      console.log(subject);
    });
    
    return (
      <div>
        <h2>Transcribe...</h2>
        <p>--{this.props.subjectStatus}--</p>
      </div>
    );
  }
  
  componentDidMount() {
    this.props.dispatch(fetchSubject('1275918'));
  }
}

Index.propTypes = {
  subject: PropTypes.object.isRequired,
  subjectStatus: PropTypes.string.isRequired,
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
