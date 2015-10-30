// Helper function for generating an int from part of a UUID
export function getIntFromPartOfUuid(uuid, startIdx, numChars, maxValue) {
  var hex = uuid.substr(startIdx, numChars);
  return parseInt('0x' + hex) % maxValue;
};