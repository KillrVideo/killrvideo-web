const EventEmitter = require('eventemitter3');
const validateJs = require('validate.js');
const Dispatcher = require('lib/dispatcher');
const ActionTypes = require('./validation-input-constants').ActionTypes;

const CHANGE_EVENT = 'change';
const VALIDATION_OPTIONS = { format: 'flat' };

class ValidationInputStore extends EventEmitter {
  constructor() {
    super();
    
    this._inputs = {};
  }
  
  addChangeListener(cb, ctx) {
    this.on(CHANGE_EVENT, cb, ctx);
  }
  
  removeChangeListener(cb, ctx) {
    this.removeListener(CHANGE_EVENT, cb, ctx);
  }
  
  getValidationState(id) {
    let input = this._getInputById(id, false);
    return input ? input.state : undefined;
  }
  
  _emitChange() {
    this.emit(CHANGE_EVENT);
  }
  
  _addInput(id, fieldName, constraints, initialValue) {
    let input = this._getInputById(id, false);
    if (input) {
      throw new Error(`Input with id ${id} already exists.`);
    }
    
    let c = {};
    c[fieldName] = constraints;
    let v = {};
    v[fieldName] = initialValue;
    
    input = {
      fieldName: fieldName,
      constraints: c,
      value: v,
      dirty: true
    };
    this._validateInput(input);
    this._inputs[id] = input;
  }
  
  _removeInput(id) {
    delete this._inputs[id];
  }
  
  _trackValue(id, newValue) {
    let input = this._getInputById(id, true);
    input.value[input.fieldName] = newValue;
    input.dirty = true;
  }
  
  _validate(id) {
    let input = this._getInputById(id, true);
    return this._validateInput(input);
  }
  
  _show(id) {
    let input = this._getInputById(id, true);
    input.state.validationVisible = true;
  }
  
  _hide(id) {
    let input = this._getInputById(id, true);
    input.state.validationVisible = false;
  }
  
  _validateInput(input) {
    // See if we need to do validation
    if (input.dirty === false) return false;
    
    let results = validateJs(input.value, input.constraints, VALIDATION_OPTIONS);
    let newState = input.state || { validationVisible: false };
    if (results && results.length > 0) {
      newState.isValid = false;
      newState.validationMessages = results;
    } else {
      newState.isValid = true;
      newState.validationMessages = [];
    }
    
    input.state = newState;
    input.dirty = false;
    return true;
  }
  
  _getInputById(id, throwIfNotExists) {
    let input = this._inputs[id];
    if (input === undefined && throwIfNotExists) {
      throw new Error(`No input with id ${id} found.`);
    }
    return input;
  }
}

// Singleton instance of the store
const store = new ValidationInputStore();

// Register for actions from the dispatcher
store.dispatchToken = Dispatcher.register(function(action) {
  switch(action.type) {
    case ActionTypes.ADD:
      store._addInput(action.id, action.fieldName, action.constraints, action.initialValue);
      store._emitChange();
      break;
      
    case ActionTypes.REMOVE:
      store._removeInput(action.id);
      store._emitChange();
      break;
    
    case ActionTypes.TRACK_VALUE:
      store._trackValue(action.id, action.newValue);
      break;
      
    case ActionTypes.VALIDATE:
      if (store._validate(action.id)) {
        store._emitChange();
      }
      break;
    
    case ActionTypes.SHOW:
      store._show(action.id);
      store._emitChange();
      break;
      
    case ActionTypes.HIDE:
      store._hide(action.id);
      store._emitChange();
      
    default:
      // No op
  }
});

// Export the singleton instance of the store
export default store;