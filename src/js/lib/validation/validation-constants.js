const keymirror = require('keymirror');

const ValidationConstants = {
  ActionTypes: keymirror({
    ADD_INPUT: null,
    REMOVE_INPUT: null,
    TRACK_INPUT_VALUE: null,
    VALIDATE_INPUTS: null,
    SHOW_MESSAGES: null,
    HIDE_MESSAGES: null
  })
};

export default ValidationConstants;