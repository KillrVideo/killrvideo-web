import path from 'path';
import { loadServiceProto } from 'killrvideo-nodejs-common';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `search/search_service.proto`;

// Load the protobuf files
const { proto, fullyQualifiedName } = loadServiceProto(PROTO_BASE_PATH, PROTO_PATH, p => p.killrvideo.search.SearchService);

// Export the service name
export const SEARCH_SERVICE = fullyQualifiedName;