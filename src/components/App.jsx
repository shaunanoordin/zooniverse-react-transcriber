import React from 'react';
import { Link } from 'react-router';

import HeaderAuth from './HeaderAuth';

export default class App extends React.Component {
  returnSomething(something) {
    // this is only for testing purposes. Check /test/components/App-test.js
    return something;
  }
  render() {
    return (
      <div>
        <header className="site-header">
          <Link to="/" className="link"><h1 className="title">Zooniverse React Transcribe</h1></Link>
          <Link to="/transcribe" className="link">Transcribe</Link>
          <Link to="/paint" className="link">Paint</Link>
          <HeaderAuth />
        </header>
        <section className="content-section">
          {this.props.children || 'Welcome to React Starterify'}
        </section>
      </div>
    );
  }
}
App.propTypes = {
  children: React.PropTypes.object,
};
