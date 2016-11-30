import React from 'react';
import SVGTarp from 'SVGTarp';

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    
    this.inputScale = null;
    this.inputTranslateX = null;
    this.inputTranslateY = null;
    this.inputRotate = null;
    this.updateTransform = this.updateTransform.bind(this);
    
    this.state = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotate: 0,
    };
  }
  
  updateTransform(e) {
    console.log(e.target);
    
    this.setState({
      scale: this.inputScale.value,
      translateX: this.inputTranslateX.value,
      translateY: this.inputTranslateY.value,
      rotate: this.inputRotate.value,
    });
  }
  
  render() {
    return (
      <div>
        <h2>Transcribe...</h2>
        <SVGTarp scale={this.state.scale} translateX={this.state.translateX} translateY={this.state.translateY} rotate={this.state.rotate} />
        <div>
          <div>
            <label>Scale</label>
            <input
              value={this.state.scale}
              ref={(itm) => { this.inputScale = itm; }}
              onChange={this.updateTransform}
              type="number"
              step="0.5"
              min="0.5" />
          </div>
          <div>
            <label>Translate X/Y</label>
            <input
              value={this.state.translateX}
              ref={(itm) => { this.inputTranslateX = itm; }}
              onChange={this.updateTransform}
              type="number"
              step="10" />
            <input
              value={this.state.translateY}
              ref={(itm) => { this.inputTranslateY = itm; }}
              onChange={this.updateTransform}
              type="number"
              step="10" />
          </div>
          <div>
            <label>Rotate</label>
            <input
              value={this.state.rotate}
              ref={(itm) => { this.inputRotate = itm; }}
              onChange={this.updateTransform} 
              type="number"
              step="15" />
          </div>
          
        </div>
      </div>
    );
  }
}
