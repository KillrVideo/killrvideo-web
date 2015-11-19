import { _, range } from 'lodash';

/*
 * Helper function for generating an int from part of a UUID.
 */
export function getIntFromPartOfUuid(uuid, startIdx, numChars, maxValue) {
  var hex = uuid.substr(startIdx, numChars);
  return parseInt('0x' + hex) % maxValue;
};

/**
 * Gets an array of indexes from an array of Falcor ranges
 */
export function getIndexesFromRanges(ranges) {
  return _(ranges).map(r => range(r.from, r.to + 1)).flatten().value();
};