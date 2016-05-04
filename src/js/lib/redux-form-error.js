import { ExtendableError } from './extendable-error';
import { map } from 'lodash';

/**
 * An error class for ReduxForm submissions. Will take the object from the constructor and try to get an
 * appropriate error message. That message is stored on the _error property so redux-form can pick it up.
 */
export class ReduxFormError extends ExtendableError {
  constructor(error) {
    // Did we get an array of falcor paths and values from the server or something else?
    let errorMessage = Array.isArray(error)
      ? map(error, 'value').join(' ') // Get the values from the array of paths and values and join into a string
      : 'An unexpected error has occurred. Please try again later.'; // Probably got an actual Error object, so just use generic error message
    
    super(errorMessage);
    
    // Store on the _error property so that redux-form can pick it up
    this._error = errorMessage;
  }
};

/**
 * Takes an object that represents an error of some kind and throws it as a ReduxFormError. Useful as
 * a catch handler on Promises.
 */
export function throwAsReduxFormError(err) {
  throw new ReduxFormError(err);
};