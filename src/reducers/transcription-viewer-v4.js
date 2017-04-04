import * as types from '../constants/actionTypes';
import * as status from '../constants/status';

const initialState = {
  subjectID: null,
  subjectData: null,
  subjectStatus: status.STATUS_IDLE,
  subjectImageSize: { width: 0, height: 0 },
  aggregationsData: null,
  aggregationsStatus: status.STATUS_IDLE,
  currentAggregation: null,
  currentRawClassification: null,
  viewRotate: 0,
  viewScale: 1,
  viewTranslateX: 0,
  viewTranslateY: 0,
  viewOptions: {
    layout: 'horizontal',
  }
};

export function transcriptionViewerV4(state = initialState, action) {
  switch (action.type) {
    case "FETCHING_SUBJECT_V4":
      return Object.assign({}, state, {
        subjectID: action.id,
        subjectData: null,
        subjectStatus: status.STATUS_LOADING,
        aggregationsStatus: status.STATUS_IDLE,
        subjectImageSize: { width: 0, height: 0 },
      });
    case "FETCHING_SUBJECT_SUCCESS_V4":
      return Object.assign({}, state, {
        subjectData: action.subject,
        subjectStatus: status.STATUS_READY,
        viewRotate: 0,
        viewScale: 1,
        viewTranslateX: 0,
        viewTranslateY: 0,
      });
    case "FETCHING_SUBJECT_ERROR_V4":
      return Object.assign({}, state, {
        subjectData: null,
        subjectStatus: status.STATUS_ERROR,
      });
    
    case "FETCHING_AGGREGATIONS_V4":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: status.STATUS_LOADING,
        currentAggregation: null,
        currentRawClassification: null,
      });
    case "FETCHING_AGGREGATIONS_SUCCESS_V4":
      return Object.assign({}, state, {
        aggregationsData: action.aggregations,
        aggregationsStatus: status.STATUS_READY,
        currentAggregation: null,
        currentRawClassification: null,
      });
    case "FETCHING_AGGREGATIONS_ERROR_V4":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: status.STATUS_ERROR,
        currentAggregation: null,
        currentRawClassification: null,
      });
    
    case "SELECT_AGGREGATION_V4":
      return Object.assign({}, state, {
        currentAggregation: action.index,
        currentRawClassification: null,
      });
    
    case "SELECT_RAW_CLASSIFICATION_V4":
      return Object.assign({}, state, {
        currentRawClassification: action.index,
      });
      
    case "SET_SUBJECT_IMAGE_SIZE_V4":
      return Object.assign({}, state, {
        subjectImageSize: action.subjectImageSize,
      });
    
    case "SET_VIEW_V4":
      return Object.assign({}, state, {
        viewRotate: (action.rotate !== null) ? Math.round(action.rotate) : state.viewRotate,
        viewScale: (action.scale !== null) ? Number(Number(action.scale).toPrecision(2)) : state.viewScale,
        viewTranslateX: (action.translateX !== null) ? Math.round(action.translateX) : state.viewTranslateX,
        viewTranslateY: (action.translateY !== null) ? Math.round(action.translateY) : state.viewTranslateY,
      });
      
    case "SET_VIEWOPTIONS_V4":
      return Object.assign({}, state, {
        viewOptions: Object.assign({}, state.viewOptions, action.options),
      });
    
    case "SHOW_AGGREGATION_V4":
      return Object.assign({}, state, {
        aggregationsData: state.aggregationsData.map((agg, index) => {
          if (action.index === index) agg.show = action.show;
          return agg;
        }),
      });
    
    case "SHOW_ALL_AGGREGATIONS_V4":
      return Object.assign({}, state, {
        aggregationsData: state.aggregationsData.map((agg) => {
          agg.show = action.show;
          return agg;
        }),
      });
    
    case "CENTRE_VIEW_ON_AGGREGATION_V4":
      if (state.aggregationsData === null || action.index === null || !state.aggregationsData[action.index]) return state;
      
      const agg = state.aggregationsData[action.index];
      const newX = state.subjectImageSize.width / 2 - (agg.startX + agg.endX) / 2;
      const newY = state.subjectImageSize.height / 2 - (agg.startY + agg.endY) / 2;
      
      return Object.assign({}, state, {
        viewTranslateX: newX,
        viewTranslateY: newY,
      });
      
    default:
      return state;
  }
}
