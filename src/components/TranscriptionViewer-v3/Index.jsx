import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchSubject, setView } from '../../actions/transcription-viewer-v3.js';
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
      //scale: Number(Math.min(hScale, vScale).toPrecision(1)),
      loadedImage: { width: img.width, height: img.height },
    });
    
    this.props.dispatch(setView(null, Math.min(hScale, vScale), null, null));
  }
  
  render() {
    return (
      <div className="transcription-viewer-v3">
        
        <ControlPanel />
        
        <div className={'data-panel' + ((this.props.viewOptions && this.props.viewOptions.layout === 'vertical') ? ' vertical' : '') }>
          {(this.props.subjectData && this.props.subjectData.locations && this.props.subjectData.locations.length > 0)
            ? <div className="data-subpanel">
                <SVGViewer
                  className="show-aggregations-none"
                  width={DEFAULT_SVGVIEWER_WIDTH}
                  height={DEFAULT_SVGVIEWER_HEIGHT}
                >
                {this.props.subjectData.locations.map((loc, locIndex) => {
                  return <SVGImage key={'image-'+locIndex} src={loc["image/jpeg"]} onLoad={this.imageHasLoaded} />;
                })}

                {(this.props.aggregationsData)
                  ? this.props.aggregationsData.map((agg, index) => {
                    return (
                      <SVGAggregatedText
                        key={'aggtext_' + agg.startX + '_' + agg.startY}
                        offsetX={this.state.loadedImage.width * -0.5}
                        offsetY={this.state.loadedImage.height * -0.5}
                        aggregation={agg}
                        index={index}
                      />
                    );
                  })
                  : null
                }
                </SVGViewer>
              </div>
            : null
          }

          {(this.props.subjectData && this.props.subjectData.locations && this.props.subjectData.locations.length > 0)
            ? <div className="data-subpanel">
                <SVGViewer
                  className="show-aggregations-full"
                  width={DEFAULT_SVGVIEWER_WIDTH}
                  height={DEFAULT_SVGVIEWER_HEIGHT}
                >
                {this.props.subjectData.locations.map((loc, locIndex) => {
                  return <SVGImage key={'image-'+locIndex} src={loc["image/jpeg"]} />;
                })}

                {(this.props.aggregationsData)
                  ? this.props.aggregationsData.map((agg, index) => {
                    return (
                      <SVGAggregatedText
                        key={'aggtext_' + agg.startX + '_' + agg.startY}
                        offsetX={this.state.loadedImage.width * -0.5}
                        offsetY={this.state.loadedImage.height * -0.5}
                        aggregation={agg}
                        index={index}
                      />
                    );
                  })
                  : null
                }
                </SVGViewer>
              </div>
            : null
          }
        </div>
        
        <AggregationsPanel />
        
        {/*(this.props.currentAggregation !== null && this.props.aggregationsData && this.props.aggregationsData[this.props.currentAggregation])
          ? <div className="aggregation-panel">
              <div className="aggregated">{this.props.aggregationsData[this.props.currentAggregation].text}</div>
              {(() => {
                const agg = this.props.aggregationsData[this.props.currentAggregation];
                if (!agg.raw) return null;
                
                return agg.raw.map((raw) => {
                  return <div className="raw">{raw.text}</div>;
                });
              })()}
            </div>
          : null
        */}
        
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
  aggregationsData: PropTypes.array,
  viewOptions: PropTypes.object,
};

Index.defaultProps = {
  subjectData: null,
  aggregationsData: null,
  viewOptions: {
    layout: 'horizontal'
  },
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV3;
  return {
    subjectData: store.subjectData,
    aggregationsData: store.aggregationsData,
    viewOptions: store.viewOptions,
  };
};

export default connect(mapStateToProps)(Index);
