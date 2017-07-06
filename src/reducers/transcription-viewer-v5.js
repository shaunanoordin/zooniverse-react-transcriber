import { GENERAL_STATUS } from '../constants/transcription-viewer-v5.js';
import { DataOrganiser } from '../tools/DataOrganiser-v5.js';

const initialState = {
  subjectId: null,
  subjectData: null,
  subjectStatus: GENERAL_STATUS.IDLE,
  subjectImageSize: { width: 0, height: 0 },
  aggregationsData: null,
  aggregationsStatus: GENERAL_STATUS.IDLE,
  currentAggregation: null,
  currentRawClassification: null,
  viewRotate: 0,
  viewScale: 1,
  viewTranslateX: 0,
  viewTranslateY: 0,
  viewOptions: {
    mode: 'editor',
    layout: 'horizontal',
  },
  transcriptionStatus: GENERAL_STATUS.IDLE,
  transcriptionData: null,
  transcriptionUpdateStatus: GENERAL_STATUS.IDLE,
};

export function transcriptionViewerV5(state = initialState, action) {
  switch (action.type) {
    case "FETCHING_SUBJECT_V5":
      return Object.assign({}, state, {
        subjectId: action.id,
        subjectData: null,
        subjectStatus: GENERAL_STATUS.LOADING,
        aggregationsStatus: GENERAL_STATUS.IDLE,  //Reset aggregations data
        aggregationsData: null,
        subjectImageSize: { width: 0, height: 0 },
        transcriptionStatus: GENERAL_STATUS.IDLE,  //Reset external transcriptions data
        transcriptionData: null,
        transcriptionUpdateStatus: GENERAL_STATUS.IDLE,
      });
    case "FETCHING_SUBJECT_SUCCESS_V5":
      return Object.assign({}, state, {
        subjectData: action.subject,
        subjectStatus: GENERAL_STATUS.READY,
        viewRotate: 0,
        viewScale: 1,
        viewTranslateX: 0,
        viewTranslateY: 0,
      });
    case "FETCHING_SUBJECT_ERROR_V5":
      return Object.assign({}, state, {
        subjectData: null,
        subjectStatus: GENERAL_STATUS.ERROR,
      });
    
    case "FETCHING_AGGREGATIONS_V5":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: GENERAL_STATUS.LOADING,
        currentAggregation: null,
        currentRawClassification: null,
      });
    case "FETCHING_AGGREGATIONS_SUCCESS_V5":
      return Object.assign({}, state, {
        aggregationsData: DataOrganiser.sortAggregations(action.aggregations),
        aggregationsStatus: GENERAL_STATUS.READY,
        currentAggregation: null,
        currentRawClassification: null,
      });
    case "FETCHING_AGGREGATIONS_ERROR_V5":
      return Object.assign({}, state, {
        aggregationsData: null,
        aggregationsStatus: GENERAL_STATUS.ERROR,
        currentAggregation: null,
        currentRawClassification: null,
      });
    
    case "SELECT_AGGREGATION_V5":
      return Object.assign({}, state, {
        currentAggregation: action.index,
        currentRawClassification: null,
      });
    
    case "SELECT_RAW_CLASSIFICATION_V5":
      return Object.assign({}, state, {
        currentRawClassification: action.index,
      });
      
    case "SET_SUBJECT_IMAGE_SIZE_V5":
      return Object.assign({}, state, {
        subjectImageSize: action.subjectImageSize,
      });
    
    case "SET_VIEW_V5":
      return Object.assign({}, state, {
        viewRotate: (action.rotate !== null) ? Math.round(action.rotate) : state.viewRotate,
        viewScale: (action.scale !== null) ? Number(Number(action.scale).toPrecision(2)) : state.viewScale,
        viewTranslateX: (action.translateX !== null) ? Math.round(action.translateX) : state.viewTranslateX,
        viewTranslateY: (action.translateY !== null) ? Math.round(action.translateY) : state.viewTranslateY,
      });
      
    case "SET_VIEWOPTIONS_V5":
      return Object.assign({}, state, {
        viewOptions: Object.assign({}, state.viewOptions, action.options),
      });
    
    case "SHOW_AGGREGATION_V5":
      return Object.assign({}, state, {
        aggregationsData: state.aggregationsData.map((agg, index) => {
          if (action.index === index) agg.show = action.show;
          return agg;
        }),
      });
    
    case "SHOW_ALL_AGGREGATIONS_V5":
      return Object.assign({}, state, {
        aggregationsData: state.aggregationsData.map((agg) => {
          agg.show = action.show;
          return agg;
        }),
      });
    
    case "CENTRE_VIEW_ON_AGGREGATION_V5":
      if (state.aggregationsData === null || action.index === null || !state.aggregationsData[action.index]) return state;
      
      const agg = state.aggregationsData[action.index];
      const newX = state.subjectImageSize.width / 2 - (agg.startX + agg.endX) / 2;
      const newY = state.subjectImageSize.height / 2 - (agg.startY + agg.endY) / 2;
      
      return Object.assign({}, state, {
        viewTranslateX: newX,
        viewTranslateY: newY,
      });
      
    case "FETCHING_TRANSCRIPTION_V5":
      return Object.assign({}, state, {
        transcriptionStatus: GENERAL_STATUS.LOADING,
        transcriptionData: null,
        transcriptionUpdateStatus: GENERAL_STATUS.IDLE,
      });
    case "FETCHING_TRANSCRIPTION_SUCCESS_V5":
      return Object.assign({}, state, {
        transcriptionStatus: GENERAL_STATUS.READY,
        transcriptionData: action.transcription,
        transcriptionUpdateStatus: GENERAL_STATUS.IDLE,
      });
    case "FETCHING_TRANSCRIPTION_ERROR_V5":
      return Object.assign({}, state, {
        transcriptionStatus: GENERAL_STATUS.ERROR,
        transcriptionData: null,
        transcriptionUpdateStatus: GENERAL_STATUS.IDLE,
      });
    
    case "POSTING_TRANSCRIPTION_V5":
      return Object.assign({}, state, {
        transcriptionUpdateStatus: GENERAL_STATUS.PROCESSING,
      });
      
    case "POSTING_TRANSCRIPTION_SUCCESS_V5":
      return Object.assign({}, state, {
        transcriptionUpdateStatus: GENERAL_STATUS.READY,
      });
    
    case "POSTING_TRANSCRIPTION_ERROR_V5":
      return Object.assign({}, state, {
        transcriptionUpdateStatus: GENERAL_STATUS.ERROR,
      });
      
    default:
      return state;
  }
}
