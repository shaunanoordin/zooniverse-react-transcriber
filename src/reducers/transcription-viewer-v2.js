import * as types from '../constants/actionTypes';
import * as status from '../constants/status';

const initialState = {
  subjectID: null,
  subjectData: null,
  subjectStatus: status.STATUS_IDLE,
  aggregationsData: null,
  aggregationsStatus: status.STATUS_IDLE,
  currentAggregation: null,
  viewRotate: 0,
  viewScale: 1,
  viewTranslateX: 0,
  viewTranslateY: 0,
};

export function transcriptionViewerV2(state = initialState, action) {
  switch (action.type) {
    case "FETCHING_SUBJECT_V2":
      return Object.assign({}, state, {
        subjectID: action.id,
        subjectData: null,
        subjectStatus: status.STATUS_LOADING,
        aggregationsStatus: status.STATUS_IDLE,
      });
    case "FETCHING_SUBJECT_SUCCESS_V2":
      return Object.assign({}, state, {
        subjectData: action.subject,
        subjectStatus: status.STATUS_READY,
        viewRotate: 0,
        viewScale: 1,
        viewTranslateX: 0,
        viewTranslateY: 0,
      });
    case "FETCHING_SUBJECT_ERROR_V2":
      return Object.assign({}, state, {
        subjectData: null,
        subjectStatus: status.STATUS_ERROR,
      });
    
    case "FETCHING_AGGREGATIONS_V2":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: status.STATUS_LOADING,
        currentAggregation: null,
      });
    case "FETCHING_AGGREGATIONS_SUCCESS_V2":
      return Object.assign({}, state, {
        aggregationsData: action.aggregations,
        aggregationsStatus: status.STATUS_READY,
        currentAggregation: null,
      });
    case "FETCHING_AGGREGATIONS_ERROR_V2":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: status.STATUS_ERROR,
        currentAggregation: null,
      });
    
    case "SELECT_AGGREGATION_V2":
      return Object.assign({}, state, {
        currentAggregation: action.index,
      });
    
    case "SET_VIEW_V2":
      return Object.assign({}, state, {
        viewRotate: (action.rotate !== null) ? Math.round(action.rotate) : state.viewRotate,
        viewScale: (action.scale !== null) ? Number(Number(action.scale).toPrecision(2)) : state.viewScale,
        viewTranslateX: (action.translateX !== null) ? Math.round(action.translateX) : state.viewTranslateX,
        viewTranslateY: (action.translateY !== null) ? Math.round(action.translateY) : state.viewTranslateY,
      });
      
    default:
      return state;
  }
}
