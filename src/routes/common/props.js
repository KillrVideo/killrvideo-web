import R from 'ramda';
import { isError, isAtom } from './sentinels';

/**
 * Creates a pick function that will pick a specified prop from an object using the supplied
 * key map to look up values in the object and the specified values map to convert the values
 * found at the key.
 */
export function createPropPicker(theMap) {
  // If the map has the key passed in, use the function from the map to get the value from the object, otherwise 
  // just use R.prop to pull the value
  return R.ifElse(
    R.has(R.__, theMap),
    R.converge(R.call, [ R.prop(R.__, theMap), R.nthArg(1) ]),
    R.prop
  );
};
// map -> ((Str prop, a) -> b)

/**
 * A default prop picker instance that just picks properties without mapping them at all.
 */
export const defaultPropPicker = createPropPicker({});

/**
 * Get an array of prop values from an object with a prop picker.
 */
export const getPropsWithPropPicker = R.curry(function getPropsWithPropPicker(propPicker, props, obj) {
  let mapperFn = propPicker(R.__, obj);
  return R.map(mapperFn, props);
});

/**
 * Returns the value of the first property found on the given object that is an array. Will throw if an
 * array property is not found on the object.
 */
export function getFirstArrayProp(obj) {
  let propName = R.find(R.propSatisfies(Array.isArray, R.__, obj), R.keys(obj));
  if (!propName) {
    throw new Error('Could not find an array property on the given object');
  }
  return R.prop(propName, obj);
};

/**
 * Picks the specified props using the propPicker from the response object and creates an array of path
 * and value objects.
 */
export function pickPropsFromResponse(propPicker, props, path, response) {
  return props.map(prop => {
    const propPath = R.append(prop, path);
    let value = response;
    if (isError(value) === false && isAtom(value) === false) {
      value = propPicker(prop, value);
    }
    return { path: propPath, value };
  });
};