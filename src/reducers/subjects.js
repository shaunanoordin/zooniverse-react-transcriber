import * as types from '../constants/actionTypes';
import * as status from '../constants/status';

const initialState = { subject: null, subjectStatus: status.STATUS_IDLE };

export function subjects(state = initialState, action) {
  switch (action.type) {
    case "FETCHING_SUBJECT":
      return {
        subject: null,
        subjectStatus: status.STATUS_LOADING,
      };
    case "FETCHING_SUBJECT_SUCCESS":
      return {
        subject: action.subject,
        subjectStatus: status.STATUS_READY,
      };
    case "FETCHING_SUBJECT_ERROR":
      return {
        subject: null,
        subjectStatus: status.STATUS_ERROR,
      };
    default:
      return state;
  }
}
