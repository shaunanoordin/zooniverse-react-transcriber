import React from 'react';

class NotLoggedInPage extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div className="info-page">
        <h2>Login Required</h2>
        <p>Please ensure you login to a Zooniverse account that's the owner or a collaborator of the project you wish to Transcribe.</p>
      </div>
    );
  }
}

export default NotLoggedInPage;
