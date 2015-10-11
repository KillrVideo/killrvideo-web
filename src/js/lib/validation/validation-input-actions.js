const Dispatcher = require('lib/dispatcher');
const ActionTypes = require('./validation-input-constants').ActionTypes;

const ValidationInputActions = {
  add(id, fieldName, constraints, initialValue) {
    Dispatcher.dispatch({
      type: ActionTypes.ADD,
      id: id,
      fieldName: fieldName,
      constraints: constraints,
      initialValue: initialValue
    });
  },
  
  remove(id) {
    Dispatcher.dispatch({
      type: ActionTypes.REMOVE,
      id: id
    });
  },
  
  trackValue(id, newValue) {
    Dispatcher.dispatch({
      type: ActionTypes.TRACK_VALUE,
      id: id,
      newValue: newValue
    });
  },
  
  validate(id) {
    Dispatcher.dispatch({
      type: ActionTypes.VALIDATE,
      id: id
    });
  },
  
  show(id) {
    Dispatcher.dispatch({
      type: ActionTypes.SHOW,
      id: id
    });
  },
  
  hide(id) {
    Dispatcher.dispatch({
      type: ActionTypes.HIDE,
      id: id
    });
  }
}

export default ValidationInputActions;