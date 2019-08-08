import { validate } from 'validate.js';
import { isUndefined, isArray, uniq, mapValues } from 'lodash';

import parseYouTubeVideoId from './parse-youtube-video-id';

/**
 * Custom validator for checking if a value is a valid YouTube video URL
 */
validate.validators.youTubeVideoUrl = function(value, options) {
  if (!value) return;
  
  const isValid = isUndefined(parseYouTubeVideoId(value)) === false;
  if (isValid) { 
    return;
  }
  
  return isUndefined(options.message) 
    ? 'is not a valid YouTube video URL' 
    : options.message;
};

/**
 * Custom validator for checking a file's max size.
 */
validate.validators.fileMaxSize = function(value, options) {
  // Must specify max size in bytes
  if (isUndefined(options.size)) {
    throw new Error('Must specify "size" option when using fileMaxSize validator');
  }
  
  if (!value) return;
  if (!value.size) return;
  
  const isValid = value.size <= options.size;
  if (isValid) return;
  
  return isUndefined(options.message)
    ? `cannot be larger than ${options.size} bytes`
    : options.message;
};

/**
 * Custom validator for preventing duplicates in an array.
 */
validate.validators.preventDuplicates = function (value, options) {
  if (!value || !isArray(value)) return;
  
  const isValid = uniq(value).length === value.length;
  if (isValid) return;
  
  return isUndefined(options.message)
    ? 'cannot have duplicate values'
    : options.message;
};

/**
 * Validate form values using the constraints specified.
 */
export function validateForm(vals, constraints) {
  const result = validate(vals, constraints);
  
  // Redux form expects an empty object if there are not validation errors
  if (isUndefined(result)) {
    return {};
  }
  
  // Validate.js returns an array of errors for each prop and redux-form expects just a string
  return mapValues(result, val => val.join('. '));
};