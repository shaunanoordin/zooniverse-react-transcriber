import * as types from '../constants/actionTypes';
import apiClient from 'panoptes-client/lib/api-client.js';

export function fetchSubject(id) {
  return (dispatch) => {
    //First, inform
    dispatch({
      type: "FETCHING_SUBJECT",
      id
    });
    
    //Now attempt to fetch the subject...
    apiClient.type('subjects').get('1275918')
    
    //Handle the success...
    .then((subject) => {
      dispatch({
        type: "FETCHING_SUBJECT_SUCCESS",
        subject
      });
    })
    
    //And handle any errors.
    .catch((err) => {
      console.error("ERROR in fetchSubject(): ", err);
      dispatch({
        type: "FETCHING_SUBJECT_ERROR"
      });
    });
  };
}
