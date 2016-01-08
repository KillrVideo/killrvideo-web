import { commonFields, commonInitialValues, commonConstraints } from './add-video-form-common';
import { validateForm } from 'lib/validation';
import VideoLocationTypes from 'lib/video-location-types';

import { ActionTypes as CommonActions } from 'actions/add-video';
import { ActionTypes as YouTubeActions, validateYouTubeUrl, addYouTubeVideo } from 'actions/add-youtube-video';

// Validation constraints
const constraints = {
  youTubeUrl: {
    presence: { message: '^YouTube URL can\'t be blank' },
    youTubeVideoUrl: { message: '^YouTube URL is not a valid YouTube video URL' },
  },
  ...commonConstraints
};

const youTubeDefaultState = {
  _youTubeUrl: null,
  _validationPromise: null,
  _allowValidationToComplete: null,
  
  youTubeVideoId: null,
  setSelectionInProgress: false,
    
  // Common state returned by all video sources
  videoLocationType: VideoLocationTypes.YOUTUBE,
  form: {
    fields: [ 'youTubeUrl', ...commonFields  ],
    asyncBlurFields: [ 'youTubeUrl' ],
    initialValues: {
      youTubeUrl: '',
      ...commonInitialValues
    },
    validate(vals) {
      return validateForm(vals, constraints);
    },
    asyncValidate(vals, dispatch) {
      return dispatch(validateYouTubeUrl(vals.youTubeUrl));
    },
    onSubmit(vals, dispatch) {
      return dispatch(addYouTubeVideo(vals));
    }
  }
};

// Reducer for youtube-specific state
function youTube(state = youTubeDefaultState, action) {
  switch (action.type) {
    // Changing source, so return defaults
    case CommonActions.SET_SOURCE:
      if (action.payload.videoLocationType === VideoLocationTypes.YOUTUBE) {
        // Switching TO YouTube
        return youTubeDefaultState;
      } else {
        // Switching FROM YouTube
        const p = state._validationPromise;
        if (p !== null) p.cancel();
        return {
          _validationPromise: null,
          ...state
        };
      }
    
    case YouTubeActions.CLEAR_YOUTUBE_VIDEO:
      return youTubeDefaultState;
    
    case YouTubeActions.VALIDATE_YOUTUBE_URL.LOADING:
      return {
        ...state,
        _youTubeUrl: action.payload.youTubeUrl,
        _validationPromise: action.payload.promise,
        _allowValidationToComplete: action.payload.allowValidationToComplete
      };
      
    case YouTubeActions.SET_YOUTUBE_VIDEO.LOADING:
      return {
        ...state,
        setSelectionInProgress: true
      };
      
    case YouTubeActions.SET_YOUTUBE_VIDEO.FAILURE:
      return {
        ...state,
        setSelectionInProgress: false
      };
      
    case YouTubeActions.SET_YOUTUBE_VIDEO.SUCCESS:
      return {
        ...state,
        setSelectionInProgress: false,
        youTubeVideoId: action.payload.videoId
      };
  }
  
  return state;
};

// Export the reducer
export default youTube;