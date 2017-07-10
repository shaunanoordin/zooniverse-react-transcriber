import * as types from '../constants/actionTypes';
import apiClient from 'panoptes-client/lib/api-client.js';
import { env, config } from '../constants/config.js';

export function fetchSubject(id) {
  return (dispatch) => {
    //Promise: fetch Subject.
    //----------------------------------------------------------------
    //First, inform
    dispatch({
      type: "FETCHING_SUBJECT_V5",
      id,
    });
    
    //Now attempt to fetch the subject...
    apiClient.type('subjects').get(id)  //Con't...
    
    //Handle the success...
    .then((subject) => {
      dispatch({
        type: "FETCHING_SUBJECT_SUCCESS_V5",
        subject,
      });
      
      //Follow-up Promise: fetch Aggregations
      //--------------------------------
      //Inform
      dispatch({
        type: "FETCHING_AGGREGATIONS_V5",
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
            show: false,
          });
        }
        dispatch({
          type: "FETCHING_AGGREGATIONS_SUCCESS_V5",
          aggregations,
        });
        
        fetchTranscription__(id, dispatch);
      })  //Con't ...
      
      //Error
      .catch((err) => {
        console.error("ERROR in fetchSubject()/aggregations: ", err);
        dispatch({
          type: "FETCHING_AGGREGATIONS_ERROR_V5",
        });
      });
      //--------------------------------
      
    })  //Con't...
    
    //And handle any errors.
    .catch((err) => {
      console.error("ERROR in fetchSubject(): ", err);
      dispatch({
        type: "FETCHING_SUBJECT_ERROR_V5",
      });
    });
    //----------------------------------------------------------------
  };
}

export function setSubjectImageSize(imgSize) {
  return (dispatch) => {
    dispatch({
      type: "SET_SUBJECT_IMAGE_SIZE_V5",
      subjectImageSize: imgSize,
    });
  };
}

export function selectAggregation(index) {
  return (dispatch) => {
    dispatch({
      type: "SELECT_AGGREGATION_V5",
      index: index,
    });
  };
}

export function selectRawClassification(index) {
  return (dispatch) => {
    dispatch({
      type: "SELECT_RAW_CLASSIFICATION_V5",
      index: index,
    });
  };
}

export function setView(rotate, scale, translateX, translateY) {
  return (dispatch) => {
    dispatch({
      type: "SET_VIEW_V5",
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
      type: "SET_VIEWOPTIONS_V5",
      options: options,
    });
  };
}

export function showAggregation(index, show) {
  return (dispatch) => {
    dispatch({
      type: "SHOW_AGGREGATION_V5",
      index, show,
    });
  };
}

export function showAllAggregations(show) {
  return (dispatch) => {
    dispatch({
      type: "SHOW_ALL_AGGREGATIONS_V5",
      show,
    });
  };
}

export function centreViewOnAggregation(index) {
  return (dispatch) => {
    dispatch({
      type: "CENTRE_VIEW_ON_AGGREGATION_V5",
      index,
    });
  };
}

/*  ADMIN-ONLY: Register a Zooniverse Project on the Transcriptions DB.
    A Project must be registered before we can begin transcribing its Subjects.
 */
export function registerProjectForTranscriptions(projectSlug = 'example_user/example_project') {
  //----------------------------------------------------------------
  const url = config.transcriptionsDatabaseUrl +
              'projects/?slug=' +
              encodeURIComponent(projectSlug);
  const body = JSON.stringify({
    'data': {
      'attributes': {
        'slug': projectSlug
      }
    }
  });
  const opt = {
    method: 'POST',
    mode: 'cors',
    headers: new Headers({
      'Authorization': apiClient.headers.Authorization,
      'Content-Type': 'application/json',
    }),
    body: body,
  };
  console.log('REGISTER PROJECT: START', projectSlug);
  fetch(url, opt)
  .then((response) => {
    if (response.status === 200 || response.status === 201 ||
        response.status === 202 || response.status === 204) {
      console.log('REGISTER PROJECT: DONE');
    }
  })
  .catch((err) => {
    console.error('REGISTER PROJECT: ERROR', err);
  });
  //----------------------------------------------------------------
}

export function fetchTranscription(id) {
  return (dispatch) => {
    fetchTranscription__(id, dispatch);
  }
}

function fetchTranscription__(id, dispatch) {
  const url = config.transcriptionsDatabaseUrl +
              'transcriptions/' + id;
  
  const opt = {
    method: 'GET',
    mode: 'cors',
    headers: new Headers({
      'Authorization': apiClient.headers.Authorization,
      'Content-Type': 'application/json',
    }),
  };
  
  dispatch({ type: "FETCHING_TRANSCRIPTION_V5" });
  
  fetch(url, opt)
  .then((response) => {
    if (response.status < 200 || response.status > 202) { return null; }
    return response.json();
  })
  .then((json) => {
    if (json && json.data) {
      dispatch({
        type: "FETCHING_TRANSCRIPTION_SUCCESS_V5",
        transcription: json.data,
      });
    } else {
      console.error("ERROR in fetchTranscription()");
      dispatch({ type: "FETCHING_TRANSCRIPTION_ERROR_V5" });
    }
  })
  .catch((err) => {
    console.error("ERROR in fetchTranscription(): ", err);
    dispatch({ type: "FETCHING_TRANSCRIPTION_ERROR_V5" });
  });
}

/*  ADMIN-ONLY: Deletes a single Transcription based on the Subject ID
 */
export function deleteTranscription(subjectId) {
  //----------------------------------------------------------------
  const url = config.transcriptionsDatabaseUrl +
              'transcriptions/' + subjectId;
  const opt = {
    method: 'DELETE',
    mode: 'cors',
    headers: new Headers({
      'Authorization': apiClient.headers.Authorization,
      'Content-Type': 'application/json',
    }),
  };
  console.log('DELETE TRANSCRIPTION: START', subjectId);
  fetch(url, opt)
  .then((response) => {
    if (response.status === 200 || response.status === 201 ||
        response.status === 202 || response.status === 204) {
      console.log('DELETE TRANSCRIPTION: DONE');
    }
  })
  .catch((err) => {
    console.error('DELETE TRANSCRIPTION: ERROR ', err);
  });
  //----------------------------------------------------------------
}

export function postTranscription(id, status, text = '', usePost = true) {
  return (dispatch) => {
    postTranscription__(id, status, text, usePost, dispatch);
  }
}

function postTranscription__(id, status, text = '', usePost = true, dispatch) {
  const url = (usePost)
    ? config.transcriptionsDatabaseUrl + 'transcriptions/'
    : config.transcriptionsDatabaseUrl + 'transcriptions/' + id;

  const body = (usePost)
    ? JSON.stringify({
        'data': {
          'attributes': {
            'id': '' + id,
            //'project_id': '' + config.projectId,
            'text': text,
            'status': status,
          },
          'relationships': {
            'project': {
              'data': {
                'type': 'projects',
                'id': '' + config.projectId,
              }
            }
          },
        }
      })
    : JSON.stringify({
        'data': {
          'attributes': {
            //'id': '' + id,
            'text': text,
            'status': status,
          }
        }
      });

  const opt = {
    method: (usePost) ? 'POST' : 'PUT',
    mode: 'cors',
    headers: new Headers({
      'Authorization': apiClient.headers.Authorization,
      'Content-Type': 'application/json',
    }),
    body: body,
  };

  dispatch({ type: "POSTING_TRANSCRIPTION_V5" });

  fetch(url, opt)
  .then((response) => {
    if (response.status === 409 && usePost) {  //POST failed because the item already exists.
      return { notes: 'already_exists' };
    } else if (response.status === 200 || response.status === 201 || response.status === 202) {  //POST/PUT successful.
      return response.json();
    }
    return null;    
  })
  .then((json) => {
    if (json && json.notes === 'already_exists') {
      console.log("WARNING in postTranscription(): POST action failed as item already exists; attempting PUT action to update instead.");
      postTranscription__(id, status, text, false, dispatch);
    }
    else if (json && json.data) {
      dispatch({ type: "POSTING_TRANSCRIPTION_SUCCESS_V5" });
    } else {
      console.error("ERROR in postTranscription()");
      dispatch({ type: "POSTING_TRANSCRIPTION_ERROR_V5" });
    }
    
    //Sync with the database
    fetchTranscription__(id, dispatch);
  })
  .catch((err) => {
    console.error("ERROR in postTranscription(): ", err);
    dispatch({ type: "POSTING_TRANSCRIPTION_ERROR_V5" });
  });
}
