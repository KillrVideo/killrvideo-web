const keymirror = require('keymirror');

const ValidationInputConstants = {
  ActionTypes: keymirror({
    ADD: null,
    REMOVE: null,
    TRACK_VALUE: null,
    VALIDATE: null,
    SHOW: null,
    HIDE: null
  })
};

export default ValidationInputConstants;