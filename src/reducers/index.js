import { combineReducers } from 'redux'
import VideoReducer from './VideoReducer';
import UserReducer from './UserReducer';
import ChatReducer from './ChatReducer';
import MiscReducer from './MiscReducer';
import NavReducer from './NavReducer';

const killrVideo = combineReducers({
    ChatReducer,
    UserReducer,
    VideoReducer,
    MiscReducer,
    NavReducer,
});

export default killrVideo