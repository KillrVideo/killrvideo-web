/**
 * A function capable of handling Falcor get requests and returing JSON graph data.
 * @function GetRouteHandler
 * @param {object} pathSet - A falcor PathSet with the requested paths.
 * @returns {Promise<Array<object>>} A Promise that resolves to an array of paths and values that make up the JSON graph.
 */

/**
 * Creates a request object from a path in the JSON graph.
 * @function CreateRequestFunction
 * @param {Array<*>} path - A JSON Graph path that was requested.
 * @returns {object} An object that represents the request to a service.
 */

/**
 * Creates a request object from an array of paths requested in the JSON graph.
 * @function CreateBatchRequestFunction
 * @param {Array<Array<*>>} paths - An array of the JSON Graph paths requested.
 * @returns {object} An object that represents the request to a service.
 */

/**
 * Makes a request to the service using the client and returns a Promise that resolves to the response.
 * @function RequestFunction
 * @param {object} request - The request object to call the service with.
 * @param {object} client - A service client with methods for making service requests.
 * @returns {Promise<object>} A promise that resolves to the response from the service.
 */

/**
 * A function that picks a given property from a given object and possibly transforms it before
 * returing the value.
 * @function PropPicker
 * @param {string} prop - The name of the property to pick.
 * @param {object} obj - The object to pick the property value from.
 * @returns {*} The value of the property from the object, possibly transformed.
 */

/**
 * A function used to match paths requested in a batch call to a service with the objects returned in the
 * response from the service. 
 * @function BatchMatchingFunction
 * @param {Array<*>} path - One of the requested paths.
 * @param {object} responseObj - One of the objects returned in the response.
 * @returns {boolean} True if the response object is for the requested path, otherwise false.
 */