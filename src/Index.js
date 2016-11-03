import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router';
import { Provider } from 'react-redux';
import App from './components/App.jsx';
import Transcribe from './components/Transcribe/Index.jsx';

import oauth from 'panoptes-client/lib/oauth';
import { config } from './constants/config';

import configureStore from './store';
const store = configureStore();

// Todo: let's find a better way to include Styles,
// currently Styles looks like an unused var to eslint
import Styles from './styles/main.styl';

window.React = React;

oauth.init(config.panoptesAppId)
  .then(function () {
    ReactDOM.render(
      <Provider store={store}>
        <Router>
          <Route path="/" component={App}>
            <Route path="/transcribe" component={Transcribe}/>
          </Route>
        </Router>
      </Provider>
      , document.getElementById('root')
    );
});
