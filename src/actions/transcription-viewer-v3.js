import * as types from '../constants/actionTypes';
import apiClient from 'panoptes-client/lib/api-client.js';

export function fetchSubject(id) {
  return (dispatch) => {
    //Promise: fetch Subject.
    //----------------------------------------------------------------
    //First, inform
    dispatch({
      type: "FETCHING_SUBJECT_V3",
      id,
    });
    
    //Now attempt to fetch the subject...
    apiClient.type('subjects').get(id)  //Con't...
    
    //Handle the success...
    .then((subject) => {
      dispatch({
        type: "FETCHING_SUBJECT_SUCCESS_V3",
        subject,
      });
      
      //Follow-up Promise: fetch Aggregations
      //--------------------------------
      //Inform
      dispatch({
        type: "FETCHING_AGGREGATIONS_V3",
      });
      
      //Fetch
      apiClient.type('aggregations').get({subject_id: id})  //Con't...
      
      //Success
      .then((agg) => {
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
          
          aggregations.push({
            text: textClusters[tc].center[4],
            startX,
            endX,
            startY,
            endY,
            raw,
            show: true,
          });
        }
        dispatch({
          type: "FETCHING_AGGREGATIONS_SUCCESS_V3",
          aggregations,
        });
      })  //Con't ...
      
      //Error
      .catch((err) => {
        console.error("ERROR in fetchSubject()/aggregations: ", err);
        dispatch({
          type: "FETCHING_AGGREGATIONS_ERROR_V3",
        });
      });
      //--------------------------------
      
    })  //Con't...
    
    //And handle any errors.
    .catch((err) => {
      console.error("ERROR in fetchSubject(): ", err);
      dispatch({
        type: "FETCHING_SUBJECT_ERROR_V3",
      });
    });
    //----------------------------------------------------------------
  };
}

export function setSubjectImageSize(imgSize) {
  return (dispatch) => {
    dispatch({
      type: "SET_SUBJECT_IMAGE_SIZE_V3",
      subjectImageSize: imgSize,
    });
  };
}

export function selectAggregation(index) {
  return (dispatch) => {
    dispatch({
      type: "SELECT_AGGREGATION_V3",
      index: index,
    });
  };
}

export function selectRawClassification(index) {
  return (dispatch) => {
    dispatch({
      type: "SELECT_RAW_CLASSIFICATION_V3",
      index: index,
    });
  };
}

export function setView(rotate, scale, translateX, translateY) {
  return (dispatch) => {
    dispatch({
      type: "SET_VIEW_V3",
      rotate: rotate,
      scale: scale,
      translateX: translateX,
      translateY: translateY,
    });
  };
}

export function setViewOptions(options) {
  return (dispatch) => {
    dispatch({
      type: "SET_VIEWOPTIONS_V3",
      options: options,
    });
  };
}

export function showAggregation(index, show) {
  return (dispatch) => {
    dispatch({
      type: "SHOW_AGGREGATION_V3",
      index, show,
    });
  };
}

export function centreViewOnAggregation(index) {
  return (dispatch) => {
    dispatch({
      type: "CENTRE_VIEW_ON_AGGREGATION_V3",
      index,
    });
  };
}
