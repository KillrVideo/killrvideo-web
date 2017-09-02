/**
 * Converts a JavaScript object representing a google.protobuf.Timestamp into a JavaScript ISO Date string. 
 */
export function timestampToDateString(timestamp) {
  if (!typeof(timestamp) === undefined) {
  // if (!timestamp.seconds || !timestamp.nanos) {
    throw new Error('Object is not a google.protobuf.Timestamp');
  }
  const millis = (timestamp.seconds * 1000) + Math.trunc(timestamp.nanos / 1000000);
  return new Date(millis).toISOString();
};

/**
 * Converts a JavaScript Date object into a plain JS object representation that's compatible with
 * google.protobuf.Timestamp.
 */
export function dateStringToTimestamp(dateString) {
  const millis = Date.parse(dateString);
  const seconds = Math.trunc(millis / 1000);
  const nanos = (millis % 1000) * 1000000;
  return { seconds, nanos };
};

/**
 * Converts killrvideo.common.Uuid and killrvideo.common.TimeUuid to a string value.
 */
export function uuidToString(uuid) {
  if (!uuid.value) {
    throw new Error('Object is not a Uuid or TimeUuid');
  }
  return uuid.value;
}

/**
 * Converts a string Uuid or TimeUuid value into a plain JS object representation that's compatible
 * with killrvideo.common.Uuid and killrvideo.common.TimeUuid.
 */
export function stringToUuid(stringVal) {
  return { value: stringVal };
};

/**
 * Returns a function that takes a value and converts it to the integer value for the given enum type.
 */
export function enumToInteger(EnumType) {
  return value => {
    return EnumType[value];
  };
};