import * as types from '../constants/actionTypes';

export function fetchSubject(id) {
  return (dispatch) => {
    dispatch({
      type: "FETCHING_SUBJECT",
      id
    });
  };
}
