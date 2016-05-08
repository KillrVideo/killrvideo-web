import R from 'ramda';

import { toAtom, isError } from './sentinels';
import { getFirstArrayProp } from './props';

function findMatchForPath(matchFn, responses, path) {
  // Find the response in the list of responses that matches
  let responseIdx = R.findIndex(r => matchFn(path, r), responses);
  
  // No match? Just return an empty atom for the path and leave response accumulator as-is
  if (responseIdx === -1) {
    return [ responses, toAtom() ];
  }
  
  // Remove the matched response from the responses accumulator and return the response matched
  return [
    R.remove(responseIdx, 1, responses),
    R.nth(responseIdx, responses)
  ];
}

export function pickResponseValuesForBatch(matchFn, paths, response) {
  // If an error, just return the error response for all paths
  if (isError(response)) {
    return R.repeat(response, paths.length);
  }
  
  let responseValues = getFirstArrayProp(response);
  let matchForPath = R.partial(findMatchForPath, [ matchFn ]);
  let [ responsesNotMatched, responses ] = R.mapAccum(matchForPath, responseValues, paths);
  return responses;
};