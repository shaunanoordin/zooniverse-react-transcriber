import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import apiClient from 'panoptes-client/lib/api-client.js';
import { fetchSubject } from '../../actions/subjects.js';
import { Utility, KEY_CODES } from '../../tools/Utility.js';
import * as status from '../../constants/status.js';

import SVGViewer from './SVGViewer.jsx';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.htmlInputSubjectID = null;
    this.execFetchSubject = this.execFetchSubject.bind(this);
  }
  
  execFetchSubject() {
    const subjectId = this.htmlInputSubjectID.value;
    console.log(subjectId);
    this.props.dispatch(fetchSubject(subjectId));
  }
  
  render() {
    //const test = apiClient.type('subjects').get('1275918')
    //.then((subject) => {
    //  console.log('-'.repeat(80));
    //  console.log(subject);
    //});
    
    return (
      <div>
        <h2>Transcribe...</h2>
        <div>
          <input type="text" ref={(ele) => { this.htmlInputSubjectID = ele; }}
            placeholder="Panoptes Subject ID, e.g. 1275918"
            onKeyPress={(e) => {
              if (Utility.getKeyCode(e) === KEY_CODES.ENTER) {
                this.execFetchSubject();
              }
            }}
          />
          <button onClick={this.fetchSubject}>&raquo;</button>
        </div>
        
        <div>
          {(() => {
            switch (this.props.subjectStatus) {
              case status.STATUS_IDLE:
                return "Type in a Panoptes Subject ID to search!";
              case status.STATUS_LOADING:
                return "Looking for Subject...";
              case status.STATUS_READY:
                return "Subject ready.";
              case status.STATUS_ERROR:
                return "WHOOPS - Something went wrong!";
            }
            return "???";
          })()}
        </div>
        
        {(this.props.subject && this.props.subject.locations && this.props.subject.locations.length > 0)
          ? <SVGViewer scale={1} translateX={0} translateY={0} rotate={0}>
            {this.props.subject.locations.map((loc, locIndex) => {
              return <image key={'image-'+locIndex} href={loc["image/jpeg"]} x="0" y="0" height="100px" width="100px" />;
            })}
            </SVGViewer>
          : null
        }
        
        {(this.props.subject && this.props.subject.metadata)
          ? <table>
              <tbody>
              {(() => {
                let metadata = [];
                for (let m in this.props.subject.metadata) {
                  metadata.push(<tr key={m}><td>{m}</td><td>{this.props.subject.metadata[m]}</td></tr>);
                }
                return metadata;
              })()}
              </tbody>
            </table>
          : null
        }
      </div>
    );
  }
  
  componentDidMount() {
    apiClient.type('projects').get('376')
    .then((data) => {
      console.log('Project 376\n'+'-'.repeat(80));
      console.log(data);
    });
    
    apiClient.type('set_member_subjects').get({id: '2509', page: '1'})
    .then((data) => {
      console.log('Set Member Subjects 2509\n'+'-'.repeat(80));
      console.log(data);
    });
    
    this.props.dispatch(fetchSubject('1275918'));
  }
}

Index.propTypes = {
  subject: PropTypes.object,
  subjectStatus: PropTypes.string,
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
