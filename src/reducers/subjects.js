import * as types from '../constants/actionTypes';
import * as status from '../constants/status';

const initialState = {
  subjectID: null,
  subjectData: null,
  subjectStatus: status.STATUS_IDLE,
  aggregationsData: null,
  aggregationsStatus: status.STATUS_IDLE,
};

export function subjects(state = initialState, action) {
  switch (action.type) {
    case "FETCHING_SUBJECT":
      return Object.assign({}, state, {
        subjectID: action.id,
        subjectData: null,
        subjectStatus: status.STATUS_LOADING,
        aggregationsStatus: status.STATUS_IDLE,
      });
    case "FETCHING_SUBJECT_SUCCESS":
      return Object.assign({}, state, {
        subjectData: action.subject,
        subjectStatus: status.STATUS_READY,
      });
    case "FETCHING_SUBJECT_ERROR":
      return Object.assign({}, state, {
        subjectData: null,
        subjectStatus: status.STATUS_ERROR,
      });
    
    case "FETCHING_AGGREGATIONS":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: status.STATUS_LOADING,
      });
    case "FETCHING_AGGREGATIONS_SUCCESS":
      return Object.assign({}, state, {
        aggregationsData: action.aggregations,
        aggregationsStatus: status.STATUS_READY,
      });
    case "FETCHING_AGGREGATIONS_ERROR":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: status.STATUS_ERROR,
      });
      
    default:
      return state;
  }
}
