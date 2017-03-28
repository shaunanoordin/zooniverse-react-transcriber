import React from 'react';
import { Link } from 'react-router';
import ZooniverseLogo from './ZooniverseLogo';

export default class HomePage extends React.Component {
  render() {
    return (
      <div className="home-page">
        <h1>Welcome to the Zooniverse Transcription Viewer</h1>
        <h2>A tool for reviewing data from Zooniverse transcription projects.</h2>
        <p>If you're having any trouble viewing any data whatsoever, try adding <a href="?env=production">?env=production</a> to the URL.</p>
        <p>For example: <a href="https://shaunanoordin.github.io/zooniverse-react-transcriber/app/?env=production">https://shaunanoordin.github.io/zooniverse-react-transcriber/app/?env=production</a></p>
        <div className="zooniverse">
          <a href="https://www.zooniverse.org/"><ZooniverseLogo width={20} height={20} /></a> Powered by the Zooniverse!
        </div>
      </div>
    );
  }
}
