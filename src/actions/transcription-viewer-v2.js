import * as types from '../constants/actionTypes';
import apiClient from 'panoptes-client/lib/api-client.js';

export function fetchSubject(id) {
  return (dispatch) => {
    //Promise: fetch Subject.
    //----------------------------------------------------------------
    //First, inform
    dispatch({
      type: "FETCHING_SUBJECT_V2",
      id,
    });
    
    //Now attempt to fetch the subject...
    apiClient.type('subjects').get(id)  //Con't...
    
    //Handle the success...
    .then((subject) => {
      dispatch({
        type: "FETCHING_SUBJECT_SUCCESS_V2",
        subject,
      });
      
      //Follow-up Promise: fetch Aggregations
      //--------------------------------
      //Inform
      dispatch({
        type: "FETCHING_AGGREGATIONS_V2",
      });
      
      //Fetch
      apiClient.type('aggregations').get({subject_id: id})  //Con't...
      
      //Success
      .then((agg) => {
        console.log("FETCHING_AGGREGATION_SUCCESS_V2");
        console.log(agg);
        const textClusters = (agg && agg[0] && agg[0].aggregation && agg[0].aggregation.T2 && agg[0].aggregation.T2['text clusters'])
          ? agg[0].aggregation.T2['text clusters']
          : null;
        
        const aggregations = [];
        for (let tc in textClusters) {  //Strangely, with Shakespeare's World at least, the aggregated Text Clusters are stored in an OBJECT with keys "0", "1", "2", etc and "all_users". Hence, we can't use Array .map().
          if (!tc.match(/^\d+$/)) continue;  //This makes sure we ignore the Text Cluster called "all_users" which... doesn't make sense.
          
          //The .center attribute contains the final Aggregated text.
          let startX = textClusters[tc].center[0];
          let endX = textClusters[tc].center[1];
          let startY = textClusters[tc].center[2];
          let endY = textClusters[tc].center[3];
          
          let raw = [];
          
          //Get raw text for Shakespeare's World
          //Raw text is stored in an array called "aligned_text". Raw coordinates are stored in an array called "individual points".
          //Why does one attribute have a name that utilises underscores and the other has a space? Who knows! Making sense is for blueberry polka dot ham sandwich.
          if (textClusters[tc]["aligned_text"]) {
            const rawText = textClusters[tc]["aligned_text"];
            const rawCoords = textClusters[tc]["individual points"];
            for (let i = 0; i < rawText.length && i < rawCoords.length; i++) {
              raw.push({
                text: rawText[i],
                startX: rawCoords[i][0],
                endX: rawCoords[i][1],
                startY: rawCoords[i][2],
                endY: rawCoords[i][3],
              });
            }
          }
          
          //Get raw text for AnnoTate
          //Raw text is stored as the fifth member of an array, which itself is stored in an array called "cluster members".
          else if (textClusters[tc]["cluster members"]) {
            raw = textClusters[tc]["cluster members"].map((data) => {
              return {
                text: data[4],
                startX: data[0],
                endX: data[1],
                startY: data[2],
                endY: data[3],
              };
            });
          }
          
          //Space reserved for future standardised transcription aggregations
          else if (false) {}
          
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
            raw,
          });
        }
        dispatch({
          type: "FETCHING_AGGREGATIONS_SUCCESS_V2",
          aggregations,
        });
      })  //Con't ...
      
      //Error
      .catch((err) => {
        console.error("ERROR in fetchSubject()/aggregations: ", err);
        dispatch({
          type: "FETCHING_AGGREGATIONS_ERROR_V2",
        });
      });
      //--------------------------------
      
    })  //Con't...
    
    //And handle any errors.
    .catch((err) => {
      console.error("ERROR in fetchSubject(): ", err);
      dispatch({
        type: "FETCHING_SUBJECT_ERROR_V2",
      });
    });
    //----------------------------------------------------------------
  };
}

export function selectAggregation(index) {
  return (dispatch) => {
    dispatch({
      type: "SELECT_AGGREGATION_V2",
      index: index,
    });
  };
}

export function setView(rotate, scale, translateX, translateY) {
  return (dispatch) => {
    dispatch({
      type: "SET_VIEW_V2",
      rotate: rotate,
      scale: scale,
      translateX: translateX,
      translateY: translateY,
    });
  };
}
