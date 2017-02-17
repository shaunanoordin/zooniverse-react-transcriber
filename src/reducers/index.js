import { combineReducers } from 'redux';

import * as login from './login';
//import * as subjects from './subjects';
import * as transcriptionViewerV1 from './transcription-viewer-v1';
import * as transcriptionViewerV2 from './transcription-viewer-v2';

const reducers = Object.assign({}, login, transcriptionViewerV1, transcriptionViewerV2);
export default combineReducers(reducers);
