import { Component, PropTypes } from 'react';


export default class LoginButton extends Component {

  render() {
    const login = this.props.login;
    return (
      <div className="login-button">
        <button type="submit" onClick={login}>Login</button>
      </div>
    );
  }

}

LoginButton.propTypes = {
  login: PropTypes.func.isRequired
};
