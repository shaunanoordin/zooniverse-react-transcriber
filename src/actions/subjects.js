import * as types from '../constants/actionTypes';
import apiClient from 'panoptes-client/lib/api-client.js';

export function fetchSubject(id) {
  return (dispatch) => {
    //Promise: fetch Subject.
    //----------------------------------------------------------------
    //First, inform
    dispatch({
      type: "FETCHING_SUBJECT",
      id,
    });
    
    //Now attempt to fetch the subject...
    apiClient.type('subjects').get(id)  //Con't...
    
    //Handle the success...
    .then((subject) => {
      dispatch({
        type: "FETCHING_SUBJECT_SUCCESS",
        subject,
      });
      
      //Follow-up Promise: fetch Aggregations
      //--------------------------------
      //Inform
      dispatch({
        type: "FETCHING_AGGREGATIONS",
      });
      
      //Fetch
      apiClient.type('aggregations').get({subject_id: id})  //Con't...
      
      //Success
      .then((agg) => {
        console.log("FETCHING_AGGREGATION_SUCCESS");
        const textClusters = (agg && agg[0] && agg[0].aggregation && agg[0].aggregation.T2 && agg[0].aggregation.T2['text clusters'])
          ? agg[0].aggregation.T2['text clusters']
          : null;
        
        const aggregations = [];
        for (let tc in textClusters) {
          if (!tc.match(/^\d+$/)) continue;
          //textClusters[tc].center;
          
          let startX = textClusters[tc].center[0];
          let endX = textClusters[tc].center[1];
          let startY = textClusters[tc].center[2];
          let endY = textClusters[tc].center[3];
          
          if (startX > endX) {
            let tmp;
            tmp = startX; startX = endX; endX = tmp;
            tmp = startY; startY = endY; endY = tmp;
          }
          
          aggregations.push({
            startX,
            endX,
            startY,
            endY,
            text: textClusters[tc].center[4],
          });
        }
        dispatch({
          type: "FETCHING_AGGREGATIONS_SUCCESS",
          aggregations,
        });
      })  //Con't ...
      
      //Error
      .catch((err) => {
        console.error("ERROR in fetchSubject()/aggregations: ", err);
        dispatch({
          type: "FETCHING_AGGREGATIONS_ERROR",
        });
      });
      //--------------------------------
      
    })  //Con't...
    
    //And handle any errors.
    .catch((err) => {
      console.error("ERROR in fetchSubject(): ", err);
      dispatch({
        type: "FETCHING_SUBJECT_ERROR",
      });
    });
    //----------------------------------------------------------------
  };
}
