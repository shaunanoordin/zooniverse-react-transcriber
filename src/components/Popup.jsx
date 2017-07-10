import React, { PropTypes } from 'react';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.popupBody = null;
    this.close = this.close.bind(this);
  }
  
  render() {
    return (
      <div className="popup" ref={(c)=>{this.popupBody=c}} onClick={(e) => { return e.target === this.popupBody && this.close(e); }}>
        <div className="popup-title">
          <button className="button fa fa-close" onClick={this.close}></button>
        </div>
        <div className="popup-content">
          {this.props.children}
        </div>
      </div>
    );
  }
  
  close(e) {
    this.props.closeAction && this.props.closeAction();
    return this.stopEvent(e);
  }
  
  stopEvent(e) {
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.returnValue = false;
    e.cancelBubble = true;
    return false;
  }
}

Popup.propTypes = {
  closeAction: PropTypes.func,
};

Popup.defaultProps = {
  closeAction: null,
};

export default Popup;