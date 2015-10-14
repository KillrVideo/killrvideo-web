const EventEmitter = require('eventemitter3');
const validateJs = require('validate.js');
const _ = require('lodash');
const Dispatcher = require('lib/dispatcher');
const ActionTypes = require('./validation-constants').ActionTypes;

const CHANGE_EVENT = 'change';
const VALIDATION_OPTIONS = { format: 'flat' };

class ValidationStore extends EventEmitter {
  constructor() {
    super();
    
    this._constraints = {};
    this._values = {};
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
 
  _addField(fieldName, constraints, initialValue) {
    if (this._constraints[fieldName] || this._values[fieldName]) {
      throw new Error(`Field with name ${fieldName} already exists.`);
    }
    
    this._constraints[fieldName] = constraints;
    this._values[fieldName] = initialValue;
    this._validateFields([ fieldName ]);
  }
  
  _removeField(fieldName) {
    delete this._constraints[fieldName];
    delete this._values[fieldName];
  }
  
  _updateFieldValue(fieldName, value) {
    this._values[fieldName] = value;
  }
  
  _validateFields(fieldNames) {
    let values = _.pick(this._values, fieldNames);
    let constraints = _.pick()
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
    let input = this._getInputById(id, false);
    if (!input) {
      return false;
    }
    return this._validateInput(input);
  }
  
  _show(id) {
    let input = this._getInputById(id, false);
    if (!input) return;
    input.state.validationVisible = true;
  }
  
  _hide(id) {
    let input = this._getInputById(id, false);
    if (!input) return;
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
const store = new ValidationStore();

// Register for actions from the dispatcher
store.dispatchToken = Dispatcher.register(function(action) {
  switch(action.type) {
    case ActionTypes.ADD_INPUT:
      store._addInput(action.id, action.fieldName, action.constraints, action.initialValue);
      store._emitChange();
      break;
      
    case ActionTypes.REMOVE_INPUT:
      store._removeInput(action.id);
      store._emitChange();
      break;
    
    case ActionTypes.TRACK_INPUT_VALUE:
      store._trackValue(action.id, action.newValue);
      break;
      
    case ActionTypes.VALIDATE_INPUTS:
      // Validate the list of ids passed and if validation state changed, emit the change event
      let changes = false;
      action.ids.forEach(function(id) {
        if (store._validate(id)) changes = true;
      });
      if (changes) store._emitChange();
      break;
    
    case ActionTypes.SHOW_MESSAGES:
      // Show messages for all ids supplied
      action.ids.forEach(function(id) {
        store._show(id);
      });
      store._emitChange();
      break;
      
    case ActionTypes.HIDE_MESSAGES:
      // Hide messages for all ids supplied
      action.ids.forEach(function(id) {
        store._hide(id);
      });
      store._emitChange();
      break;
      
    default:
      // No op
  }
});

// Export the singleton instance of the store
export default store;