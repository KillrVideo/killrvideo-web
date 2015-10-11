const _ = require('lodash');
const Dispatcher = require('lib/dispatcher');
const ActionTypes = require('./validation-constants').ActionTypes;

const ValidationActions = {
  addInput(id, fieldName, constraints, initialValue) {
    Dispatcher.dispatch({
      type: ActionTypes.ADD_INPUT,
      id: id,
      fieldName: fieldName,
      constraints: constraints,
      initialValue: initialValue
    });
  },
  
  removeInput(id) {
    Dispatcher.dispatch({
      type: ActionTypes.REMOVE_INPUT,
      id: id
    });
  },
  
  trackInputValue(id, newValue) {
    Dispatcher.dispatch({
      type: ActionTypes.TRACK_INPUT_VALUE,
      id: id,
      newValue: newValue
    });
  },
  
  validateInputs(ids) {
    ids = _.isArray(ids) ? ids : [ ids ];
    Dispatcher.dispatch({
      type: ActionTypes.VALIDATE_INPUTS,
      ids: ids
    });
  },
  
  showMessages(ids) {
    ids = _.isArray(ids) ? ids : [ ids ];
    Dispatcher.dispatch({
      type: ActionTypes.SHOW_MESSAGES,
      ids: ids
    });
  },
  
  hideMessages(ids) {
    ids = _.isArray(ids) ? ids : [ ids ];
    Dispatcher.dispatch({
      type: ActionTypes.HIDE_MESSAGES,
      ids: ids
    });
  }
}

export default ValidationActions;