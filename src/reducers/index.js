import { combineReducers } from 'redux';

import * as login from './login';
import * as subjects from './subjects';

const reducers = Object.assign({}, login, subjects);
export default combineReducers(reducers);
