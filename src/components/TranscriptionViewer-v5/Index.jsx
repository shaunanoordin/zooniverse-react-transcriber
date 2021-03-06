import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchSubject, setView, setSubjectImageSize } from '../../actions/transcription-viewer-v5.js';
import { env, config } from '../../constants/config.js';

import NotLoggedInPage from './NotLoggedInPage.jsx';
import Popup from '../Popup.jsx';
import ControlPanel from './ControlPanel.jsx';
import EditorPanel from './EditorPanel.jsx';
import AggregationsPanel from './AggregationsPanel.jsx';
import SVGViewer from './SVGViewer.jsx';
import SVGImage from './SVGImage.jsx';
import SVGAggregatedText from './SVGAggregatedText.jsx';
import { GENERAL_STATUS } from '../../constants/transcription-viewer-v5.js';

const DEFAULT_SVGVIEWER_WIDTH = 500;
const DEFAULT_SVGVIEWER_HEIGHT = 500;

const DEFAULT_SUBJECT_ID = (env === 'staging')
  ? '48407'  //Optimus Prime
  : '671189'  //Arbitrary, interesting page from AnnoTate with some... funky fresh text layout.

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.imageHasLoaded = this.imageHasLoaded.bind(this);
    this.primarySVGViewer = null;
    this.closePopup = this.closePopup.bind(this);
    
    this.state = {
      loadedImage: { width: 0, height: 0 },
      popupMessage: null,
    };
  }
  
  imageHasLoaded(img) {
    if (!img) return;
    
    const viewerWidth = (this.primarySVGViewer && this.primarySVGViewer.containerWidth > 0) ? this.primarySVGViewer.containerWidth : DEFAULT_SVGVIEWER_WIDTH;
    const viewerHeight = (this.primarySVGViewer && this.primarySVGViewer.containerHeight > 0) ? this.primarySVGViewer.containerHeight : DEFAULT_SVGVIEWER_HEIGHT;
    
    const hScale = (img.width !== 0) ? viewerWidth / img.width : 1;
    const vScale = (img.height !== 0) ? viewerHeight / img.height : 1;
    
    this.setState({
      loadedImage: { width: img.width, height: img.height },
    });
    
    this.props.dispatch(setSubjectImageSize({ width: img.width, height: img.height }));
    
    this.props.dispatch(setView(null, Math.min(hScale, vScale), null, null));
  }
  
  render() {
    //Not Logged In
    if (!this.props.loginUser) {
      return <NotLoggedInPage />
    }
    
    //Logged In
    return (
      <div className="transcription-viewer-v5">
        
        <ControlPanel />
        
        <div className={'data-panel' + ((this.props.viewOptions && this.props.viewOptions.layout === 'vertical') ? ' vertical' : '') }>
          {(!this.props.subjectData || !this.props.subjectData.locations || this.props.subjectData.locations.length === 0 ||
            this.props.viewOptions.mode === 'editor' || this.props.viewOptions.layout === 'single') ? null :
            <SVGViewer>
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
          }
          
          {(!this.props.subjectData || !this.props.subjectData.locations || this.props.subjectData.locations.length === 0 ||
            !(this.props.viewOptions.mode === 'editor')) ? null :
            <EditorPanel />
          }

          {(!this.props.subjectData || !this.props.subjectData.locations || this.props.subjectData.locations.length === 0 ||
            (this.props.viewOptions.mode === 'editor' && this.props.viewOptions.layout === 'single')) ? null :
            <SVGViewer ref={(c)=>{this.primarySVGViewer=c}}>
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
          }
        </div>
        
        <AggregationsPanel />
        
        {(!this.state.popupMessage) ? null :
          <Popup closeAction={this.closePopup}>
            {this.state.popupMessage}
          </Popup>
        }
        
      </div>
    );
  }
  
  closePopup() {
    this.setState({
      popupMessage: null,
    });
  }
  
  componentWillReceiveProps(next) {
    //Monitor transcription udpates only.
    if (next.transcriptionUpdateStatus === GENERAL_STATUS.ERROR) {
      this.setState({
        popupMessage: [
          <p>ERROR: Could not update the Transcription database.</p>,
          <p>Are you logged in to a Zooniverse account that's an owner or collaborator of the project you're working on?</p>,
        ],
      });
    }
  }
  
  componentDidMount() {
    const subjectId = (this.props.params && this.props.params.subjectId)
      ? this.props.params.subjectId
      : DEFAULT_SUBJECT_ID;
    this.props.dispatch(fetchSubject(subjectId));
  }
}

Index.propTypes = {
  loginUser: PropTypes.object,
  subjectData: PropTypes.object,
  subjectImageSize: PropTypes.object,
  aggregationsData: PropTypes.array,
  currentAggregation: PropTypes.number,
  currentRawClassification: PropTypes.number,
  viewOptions: PropTypes.object,
  transcriptionUpdateStatus: PropTypes.string,
};

Index.defaultProps = {
  loginUser: null,
  subjectData: null,
  subjectImageSize: { width: 0, height: 0 },
  aggregationsData: null,
  currentAggregation: null,
  currentRawClassification: null,
  viewOptions: {
    mode: '',
    layout: 'horizontal',
  },
  transcriptionUpdateStatus: GENERAL_STATUS.IDLE,
};

const mapStateToProps = (state) => {
  const store = state.transcriptionViewerV5;
  return {
    loginUser: state.login.user,
    subjectData: store.subjectData,
    subjectImageSize: store.subjectImageSize,
    aggregationsData: store.aggregationsData,
    currentAggregation: store.currentAggregation,
    currentRawClassification: store.currentRawClassification,
    viewOptions: store.viewOptions,
    
    //subjectStatus: store.subjectStatus,
    //aggregationsStatus: store.aggregationsStatus,
    //transcriptionStatus: store.transcriptionStatus,
    transcriptionUpdateStatus: store.transcriptionUpdateStatus,  //We are only monitoring the Transcription Update status, since EditorPanel
  };
};

export default connect(mapStateToProps)(Index);
