import Promise from 'bluebird';
import R from 'ramda';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { logger } from './logging';
import { isError, isAtom } from './falcor-conversions';

// Helper function for tapping debug logging into a pipeline
const debugLog = R.tap(x => console.log(x));

/**
 * Advance the request context to the specified depth.
 */
export const advanceToDepth = R.set(R.lensProp('depth'));
// (depthVal, reqCtx) => reqCtx

const isArrayOfStringsOrNumbers = R.pipe(R.head, R.either(R.is(String), R.is(Number)));
// ([ obj ]) => bool

const getIndexesFromRanges = R.chain(R.converge(R.range, [ R.prop('from'), R.compose(R.inc, R.prop('to')) ]));
// ([ { from, to } ]) => [ number ]

const getPathSetValuesAtDepth = R.pipe(R.nth, R.cond([
  // If a single value, just wrap in an array
  [R.complement(Array.isArray),   R.of],
  // If is an array of strings or numbers, just returns array vals as-is
  [isArrayOfStringsOrNumbers,     R.identity],
  // Otherwise we have an array of ranges so transform them to indexes
  [R.T,                           getIndexesFromRanges]
]));
// (depth, pathSet) => pathSet[depth] => [ pathSetVals ]

const getPathSetValuesAtCurrentDepth = R.converge(
  getPathSetValuesAtDepth, [ R.prop('depth'), R.prop('pathSet') ]
);
// (reqCtx) => [ pathSetVals ]

// const getNonErrorOrAtomVals = R.filter(R.complement(R.either(isError, isAtom)));
// ([ vals ]) => [ vals ]

const mapLeaves = R.curryN(2, R.converge(mapPathSetVals, [
  R.nthArg(0),
  R.pipe(R.nthArg(1), R.prop('depth')),
  R.nthArg(1)
]));
// (mapperFn, reqCtx) => reqCtx

const valOrProp = R.ifElse(
  R.pipe(R.nthArg(1), R.is(Object)),
  R.prop,
  R.nthArg(1)
);
// (prop, objOrVal) => obj[prop] || val 

const convertPathSetVal = R.curryN(3, R.converge(R.call, [
  R.nthArg(0),
  R.converge(valOrProp, [ R.nthArg(2), R.nthArg(1) ]),
  R.nthArg(2)
]));
// (mapperFn, parentVal, pathSetVal) => mapperFn(parentValOrProp, psVal) => newVal

const reduceToObjectProps = R.useWith(R.reduce, [
  (fn) => {
    return (acc, val) => {
      acc[val] = fn(val);
      return acc;
    };
  },
  R.identity,
  R.identity
]);
// (converterFn, obj, pathSetVals) => obj

const mapParentVal = R.ifElse(
  // If parent val is an error or an atom
  R.pipe(R.nthArg(2), R.either(isError, isAtom)),
  // Just return the parent val as-is
  R.nthArg(2),
  // Reduce the path set vals to a new object by using mapper funciton provided and the parent's value
  R.curryN(3, R.converge(reduceToObjectProps, [
    R.converge(convertPathSetVal, [ R.nthArg(1), R.nthArg(2) ]),
    () => ({}),
    R.nthArg(0)
  ]))
)
// (pathSetVals, mapperFn, parentVal) => newParentVal

function mapPathSetVals(mapperFn, depth, reqCtx) {
  while (depth >= 0) {
    var psVals = getPathSetValuesAtDepth(depth, reqCtx.pathSet);
    var m = mapParentVal(psVals, mapperFn);
    
    mapperFn = m;
    depth = depth - 1;
  }
  
  reqCtx.result = mapperFn(reqCtx.result);
  return reqCtx;
}

/**
 * Create requests at the leaf nodes of the current depth using the specified mapper function. The mapper function
 * will be passed the pathSet value of the leaf for each leaf and should return an object that can be used as a Grpc
 * service request.
 */
export function createRequests(mapperFn) {
  return mapLeaves((val, psVal) => {
    return mapperFn(psVal);
  });
};

/**
 * Do any requests found at the leaf nodes of the current depth using the specified service name. The requestFn provided
 * will be called with (serviceClient, req) parameters for each leaf node where a value is found and should return the
 * Promise from executing that request with the client. The leaf node values will be replaced with the response object from the
 * request when successful or falcor error values if there is a problem.
 */
export function doRequests(serviceName, requestFn) {
  return requestContext => {
    let client = requestContext.router.getServiceClient(serviceName);
    let promises = [];
    let reqCtx = mapLeaves(val => {
      if (typeof val !== 'object') return val;
      
      let promise = requestFn(client, val)
        .catch(err => {
          // Otherwise log error and replace path value with an error object
          logger('error', `Error while calling ${serviceName}`, err);
          return $error();
        });
      promises.push(promise);
      return promise;
    }, requestContext);
    
    return Promise.all(promises).then(() => {
      return mapLeaves(val => {
        return val instanceof Promise
          ? val.value()
          : val;
      }, reqCtx);
    });
  };
};

/**
 * Picks properties from response objects at the leaf nodes. The current path value of the leaf is assumed to be
 * the property name and the specified propPicker function is used to pick the property values from the objects. 
 */
export function pickPropsFromResponses(propPicker) {
  return requestContext => {
    // Assume props we want are at the next depth
    const propsToPick = getPathSetValuesAtDepth(requestContext.depth + 1, requestContext.pathSet);
    
    // Leaves should be response objects, so pick props from those and return a new object
    return mapLeaves((val, psVal) => {
      return propsToPick.reduce((acc, prop) => {
        acc[prop] = propPicker(prop, val);
        return acc;
      }, {});
    }, requestContext);
  };
};


