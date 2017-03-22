import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchSubject, setView, setSubjectImageSize } from '../../actions/transcription-viewer-v3.js';
import * as status from '../../constants/status.js';

import ControlPanel from './ControlPanel.jsx';
import AggregationsPanel from './AggregationsPanel.jsx';
import SVGViewer from './SVGViewer.jsx';
import SVGImage from './SVGImage.jsx';
import SVGAggregatedText from './SVGAggregatedText.jsx';

const DEFAULT_SVGVIEWER_WIDTH = 480;
const DEFAULT_SVGVIEWER_HEIGHT = 640;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.imageHasLoaded = this.imageHasLoaded.bind(this);
    
    this.state = {
      loadedImage: { width: 0, height: 0 },
    };
  }
  
  imageHasLoaded(img) {
    if (!img) return;
    
    const hScale = (img.width !== 0) ? DEFAULT_SVGVIEWER_WIDTH / img.width : 1;
    const vScale = (img.height !== 0) ? DEFAULT_SVGVIEWER_HEIGHT / img.height : 1;
    
    this.setState({
      loadedImage: { width: img.width, height: img.height },
    });
    
    this.props.dispatch(setSubjectImageSize({ width: img.width, height: img.height }));
    
    this.props.dispatch(setView(null, Math.min(hScale, vScale), null, null));
  }
  
  render() {
    return (
      <div className="transcription-viewer-v3">
        
        <ControlPanel />
        
        <div className={'data-panel' + ((this.props.viewOptions && this.props.viewOptions.layout === 'vertical') ? ' vertical' : '') }>
          {(this.props.subjectData && this.props.subjectData.locations && this.props.subjectData.locations.length > 0
            && this.props.viewOptions.layout !== 'single')
            ? <div className="data-subpanel">
                <SVGViewer
                  width={DEFAULT_SVGVIEWER_WIDTH}
                  height={DEFAULT_SVGVIEWER_HEIGHT}
                >
                  {this.props.subjectData.locations.map((loc, locIndex) => {
                    return <SVGImage key={'image-'+locIndex} src={loc["image/jpeg"]} />;
                  })}
                  {(!this.props.aggregationsData || this.props.currentAggregation === null) ? null : (()=>{
                    const agg = this.props.aggregationsData[this.props.currentAggregation];
                    const textAngleRad = Math.atan2(agg.endY - agg.startY, agg.endX - agg.startX);
                    const RADIUS = 30;
                    const pathDefinition = 'M ' +
                      (agg.startX + RADIUS * Math.cos(textAngleRad - Math.PI/2)) + ' ' + (agg.startY + RADIUS * Math.sin(textAngleRad - Math.PI/2)) +
                      ' L ' +
                      (agg.startX + RADIUS * Math.cos(textAngleRad + Math.PI/2)) + ' ' + (agg.startY + RADIUS * Math.sin(textAngleRad + Math.PI/2)) +
                      ' L ' + 
                      (agg.endX + RADIUS * Math.cos(textAngleRad + Math.PI/2)) + ' ' + (agg.endY + RADIUS * Math.sin(textAngleRad + Math.PI/2)) +
                      ' L ' +
                      (agg.endX + RADIUS * Math.cos(textAngleRad - Math.PI/2)) + ' ' + (agg.endY + RADIUS * Math.sin(textAngleRad - Math.PI/2)) +
                      ' Z';
                    
                    return (
                      <g transform={'translate(' + (this.props.subjectImageSize.width * -0.5) + ',' + (this.props.subjectImageSize.height * -0.5) + ') '}>
                        <path className="highlight-path" d={pathDefinition} />
                      </g>
                    );
                  })()}
                </SVGViewer>
              </div>
            : null
          }

          {(this.props.subjectData && this.props.subjectData.locations && this.props.subjectData.locations.length > 0)
            ? <div className="data-subpanel">
                <SVGViewer
                  width={DEFAULT_SVGVIEWER_WIDTH}
                  height={DEFAULT_SVGVIEWER_HEIGHT}
                >
                  {this.props.subjectData.locations.map((loc, locIndex) => {
                    return <SVGImage key={'image-'+locIndex} src={loc["image/jpeg"]} onLoad={this.imageHasLoaded} />;
                  })}
                  
                  {(!this.props.aggregationsData || this.props.currentRawClassification !== null) ? null :  //Show all aggregations, except for the selected one, because...
                    this.props.aggregationsData.map((agg, index) => { return (!agg.show || (index === this.props.currentAggregation)) ? null : (
                      <SVGAggregatedText
                        key={'aggtext_' + agg.startX + '_' + agg.startY}
                        offsetX={this.props.subjectImageSize.width * -0.5}
                        offsetY={this.props.subjectImageSize.height * -0.5}
                        aggregation={agg}
                        index={index}
                      />
                    )})
                  }
                  
                  {(!this.props.aggregationsData || this.props.currentAggregation === null || !this.props.aggregationsData[this.props.currentAggregation].show  || this.props.currentRawClassification !== null)
                    ? null :  //...we want to show the selected aggregation ABOVE the others.
                    <SVGAggregatedText
                      key={'aggtext_' + this.props.aggregationsData[this.props.currentAggregation].startX + '_' + this.props.aggregationsData[this.props.currentAggregation].startY}
                      className="selected"
                      offsetX={this.props.subjectImageSize.width * -0.5}
                      offsetY={this.props.subjectImageSize.height * -0.5}
                      aggregation={this.props.aggregationsData[this.props.currentAggregation]}
                      index={this.props.currentAggregation}
                    />
                  }
                  
                  {(!this.props.aggregationsData || this.props.currentAggregation === null || this.props.currentRawClassification === null) ? null :
                    <SVGAggregatedText
                      key={'aggtext_' + this.props.aggregationsData[this.props.currentAggregation].raw[this.props.currentRawClassification].startX + '_' + this.props.aggregationsData[this.props.currentAggregation].raw[this.props.currentRawClassification].startY}
                      className="selected-raw"
                      offsetX={this.props.subjectImageSize.width * -0.5}
                      offsetY={this.props.subjectImageSize.height * -0.5}
                      aggregation={this.props.aggregationsData[this.props.currentAggregation].raw[this.props.currentRawClassification]}
                      index={this.props.currentAggregation}
                    />
                  }
                </SVGViewer>
              </div>
            : null
          }
        </div>
        
        <AggregationsPanel />
        
      </div>
    );
  }
  
  componentDidMount() {
    //DEFAULT image
    //this.props.dispatch(fetchSubject('1274999'));  //Shakespeare's World
    //this.props.dispatch(fetchSubject('671183'));  //AnnoTate
    this.props.dispatch(fetchSubject('671189'));  //AnnoTate with some... funky fresh text directions
  }
}

Index.propTypes = {
  subjectData: PropTypes.object,
  subjectImageSize: PropTypes.object,
  aggregationsData: PropTypes.array,
  currentAggregation: PropTypes.number,
  currentRawClassification: PropTypes.number,
  viewOptions: PropTypes.object,
};

Index.defaultProps = {
  subjectData: null,
  subjectImageSize: { width: 0, height: 0 },
  aggregationsData: null,
  currentAggregation: null,
  currentRawClassification: null,
  viewOptions: {
    layout: 'horizontal'
  },
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV3;
  return {
    subjectData: store.subjectData,
    subjectImageSize: store.subjectImageSize,
    aggregationsData: store.aggregationsData,
    currentAggregation: store.currentAggregation,
    currentRawClassification: store.currentRawClassification,
    viewOptions: store.viewOptions,
  };
};

export default connect(mapStateToProps)(Index);
