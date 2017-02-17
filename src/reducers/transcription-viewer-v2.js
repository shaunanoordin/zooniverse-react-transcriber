import * as types from '../constants/actionTypes';
import * as status from '../constants/status';

const initialState = {
  subjectID: null,
  subjectData: null,
  subjectStatus: status.STATUS_IDLE,
  aggregationsData: null,
  aggregationsStatus: status.STATUS_IDLE,
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
      });
    case "FETCHING_AGGREGATIONS_SUCCESS_V2":
      return Object.assign({}, state, {
        aggregationsData: action.aggregations,
        aggregationsStatus: status.STATUS_READY,
      });
    case "FETCHING_AGGREGATIONS_ERROR_V2":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: status.STATUS_ERROR,
      });
      
    default:
      return state;
  }
}
