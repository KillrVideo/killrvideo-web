import Promise from 'bluebird';
import { logger } from './logging';

/**
 * Creates a request pipeline function for a Falcor get request. The steps passed as arguments
 * should be functions that take a RequestContext object and return either the RequestContext or
 * a Promise of a RequestContext. Steps will be executed in order and the path values from
 * the RequestContext will be returned when finished.
 */
export function createGetPipeline(...steps) {
  return function(pathSet) {
    let requestContext = new RequestContext(pathSet, this);
    return executeSteps(steps, requestContext);
  }
};

/**
 * Execute steps for the given request context, accounting for steps that return Promises.
 */
function executeSteps(steps, requestContext) {
  let i = 0;
  let isPromise = false;
  while (i < steps.length && requestContext._isComplete() === false) {
    // Run the current step
    requestContext = steps[i](requestContext);
    
    // Go to next step
    i++;
    
    // If a Promise was returned, we need to continue once it resolves
    if (requestContext instanceof Promise) {
      isPromise = true;
      break;
    }
  }
  
  // Did we break for a Promise?
  if (isPromise) {
    // Once the promise resolves, execute any steps that are left
    let stepsLeft = i < steps.length ? steps.slice(i) : [];
    return requestContext
      .catch(err => {
        logger.log('error', 'Error executing pipeline step', err);
        throw err;
      })
      .then(reqCtx => {
        return executeSteps(stepsLeft, reqCtx);
      });
  }
  
  // Return the path values for the request
  return requestContext.getPathValues();
}

/**
 * A RequestContext with methods for manipulating the current state of the request.
 */
class RequestContext {
  constructor(pathSet, router) {
    this._pathSet = pathSet;
    this._router = router;
    
    this._pathValues = [];
    this._depth = -1;
    this._expandedDepth = -1;
    this._done = false;
  }
    
  _isComplete() {
    return this._done;
  }
  
  /**
   * Complete a pipeline early before all steps have run.
   */
  completeEarly() {
    this._done = true;
  }
  
  /**
   * Get the router instance for this request.
   */
  getRouter() {
    return this._router;
  }
  
  /**
   * Get the current depth.
   */
  getDepth() {
    return this._depth;
  }
  
  /**
   * Advance the request context to the specified depth.
   */
  advanceToDepth(depth) {
    if (depth < this._depth) {
      throw new Error(`Cannot advance to depth ${depth}. Already advanced to depth ${this._depth}.`);
    }
    if (depth >= this._pathSet.length) {
      throw new Error(`Cannot advance to depth ${depth}. Max depth is ${this._pathSet.length - 1}.`);
    }
    
    this._depth = depth;
  }
  
  /**
   * Get the path values at the current depth.
   */
  getPathValues() {
    // Expand path values if we haven't yet
    if (this._depth !== this._expandedDepth) {
      this._pathValues = expandPathValues(this._pathSet, this._depth, this._expandedDepth, this._pathValues);
      this._expandedDepth = this._depth;
    }
    return this._pathValues;
  }
}

/**
 * Utility function to expand path values from a pathSet to a given depth of the pathSet, copying any
 * values from the level below to their children.
 */
function expandPathValues(pathSet, toDepth, curDepth, curValues) {
  // Recursively expand values below this depth
  if (toDepth - curDepth !== 1) {
    curValues = expandPathValues(pathSet, toDepth - 1, curDepth, curValues);
  }
  
  // If we're at the lowest level, we don't have to worry about current values, we just need to expand paths
  // with empty values
  if (toDepth === 0) {
    let vals = [];
    for (let pathSetVal of getPathSetValues(pathSet, 0)) {
      vals.push({
        path: [ pathSetVal ]
      });
    }
    return vals;
  }
  
  // We need to be aware of current values and copy them to leaf nodes
  let vals = [];
  for (let i = 0; i < curValues.length; i++) {
    let curValue = curValues[i];
    for(let pathSetVal of getPathSetValues(pathSet, toDepth)) {
      // Concat next part of the path
      let val = {
        path: curValue.path.concat(pathSetVal)
      };
      
      // Copy value from base node
      if (curValue.value) {
        val.value = curValue.value;
      }
      
      // Add to results
      vals.push(val);
    }
  }
  return vals;
}

/**
 * Utility generator function that gets the values for a pathSet at a given depth.
 */
function* getPathSetValues(pathSet, depthIdx) {
  let pathSetVal = pathSet[depthIdx];
  if (Array.isArray(pathSetVal) === false) {
    yield pathSetVal;
    return;
  }
  
  // See what type we're dealing with in the array by peeking at the first element
  let arrayValType = typeof pathSetVal[0];
  if (arrayValType === 'object' && pathSetVal[0].hasOwnProperty('from')) {
    arrayValType = 'range';
  }
  
  for(let i = 0; i < pathSetVal.length; i++) {
    let arrayVal = pathSetVal[i];
    switch(arrayValType) {
      case 'string':
      case 'number':
        yield arrayVal;
        break;
      case 'range':
        for (let rangeIdx = arrayVal.from; rangeIdx <= arrayVal.to; rangeIdx++) {
          yield rangeIdx;
        }
        break;
      default:
        throw new Error(`Unknown pathSet value type ${arrayValType}`);
    }
  }
}