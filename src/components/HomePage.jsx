import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ZooniverseLogo from './ZooniverseLogo';

class HomePage extends React.Component {
  render() {
    return (
      <div className="info-page">
        <h1>Welcome to the Zooniverse Transcription Viewer</h1>
        <h2>A tool for reviewing data from Zooniverse transcription projects.</h2>
        {(this.props.loginUser !== null)
          ? <div className="message-panel">
              <p>You're now logged in.</p>
              <p>
                <Link className="button" to="/transcription-viewer">Proceed to the Transcription Viewer</Link>
              </p>
            </div>
          : <div className="message-panel warning">
              <p>You need to log in to proceed.</p>
            </div>
        }
        <p>
          Developer settings:
          <a className="button" href="?env=production"><i className="fa fa-cogs" /> production</a>
          <a className="button" href="?env=staging"><i className="fa fa-bug" /> staging</a>
        </p>
        <div className="zooniverse">
          <a href="https://www.zooniverse.org/"><ZooniverseLogo width={20} height={20} /></a> Powered by the Zooniverse!
        </div>
      </div>
    );
  }
}

HomePage.propTypes = {
  loginUser: PropTypes.object,
};

HomePage.defaultProps = {
  loginUser: null,
};

function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {
    loginUser: state.login.user,
  };
}

export default connect(mapStateToProps)(HomePage);  //Connects the Component to the Redux Store
