import {ADD_COMMENT,ADD_COMMENT_RESET,ADD_ANOTHER_COMMENT,GET_VIDEO,RECORD_PLAYBACK,RESET_VIDEO,UPDATE_VIDEO_LOCATION,RATE_VIDEO,UPLOAD_VIDEO,UPLOAD_VIDEO_PROGRESS,ADD_UPLOADED_VIDEO,CLEAR_UPLOAD_VIDEO_SELECTION,SET_SOURCE,VALIDATE_YOUTUBE_URL,SET_YOUTUBE_VIDEO,ADD_YOUTUBE_VIDEO,CLEAR_YOUTUBE_VIDEO,GET_SUGGESTIONS,CLEAR_SUGGESTIONS,MONITOR,CHANGED,UNLOAD
} from "../consts"

const VideoReducer = (state = '', action) => {
    switch (action.type) {
        case ADD_COMMENT:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case ADD_COMMENT_RESET:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case ADD_ANOTHER_COMMENT:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case GET_VIDEO:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case RECORD_PLAYBACK:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case RESET_VIDEO:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case UPDATE_VIDEO_LOCATION:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case RATE_VIDEO:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case UPLOAD_VIDEO:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case UPLOAD_VIDEO_PROGRESS:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case ADD_UPLOADED_VIDEO:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case CLEAR_UPLOAD_VIDEO_SELECTION:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case SET_SOURCE:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case VALIDATE_YOUTUBE_URL:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case SET_YOUTUBE_VIDEO:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case ADD_YOUTUBE_VIDEO:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case CLEAR_YOUTUBE_VIDEO:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case GET_SUGGESTIONS:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case CLEAR_SUGGESTIONS:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case MONITOR:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case CHANGED:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        case UNLOAD:
            return {
                ...state,
                testReduce: {
                    test:true
                }
            }
        default:
            return state
    }
}

export default VideoReducer








