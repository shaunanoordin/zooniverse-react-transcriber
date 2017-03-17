import React from 'react';
import { Link } from 'react-router';

import HeaderAuth from './HeaderAuth';
import HomePage from './HomePage';

export default class App extends React.Component {
  returnSomething(something) {
    // this is only for testing purposes. Check /test/components/App-test.js
    return something;
  }
  render() {
    return (
      <div>
        <header className="site-header">
          <Link to="/" className="link"><h1 className="title">Zooniverse React Transcriber</h1></Link>
          <Link to="/transcription-viewer" className="link">Viewer (Latest)</Link>
          <Link to="/transcription-viewer-v2" className="link">(ver.2)</Link>
          <Link to="/transcription-viewer-v1" className="link">(ver.1)</Link>
          <HeaderAuth />
        </header>
        <section className="content-section">
          {this.props.children || <HomePage />}
        </section>
      </div>
    );
  }
}
App.propTypes = {
  children: React.PropTypes.object,
};
