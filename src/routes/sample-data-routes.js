import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { getClientAsync } from '../services/sample-data';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { flattenPathValues } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

const routes = [
  // TODO: Not implemented in the client yet
];

export default routes;