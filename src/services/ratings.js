import path from 'path';
import { load } from 'grpc';
import { registerService } from './';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `ratings/ratings_service.proto`;

// Load the protobuf files
const proto = load({ file: PROTO_PATH, root: PROTO_BASE_PATH }, 'proto', { convertFieldsToCamelCase: true });

// Export the service name
const RATINGS_SERVICE = registerService(proto.killrvideo.ratings.RatingsService);
export default RATINGS_SERVICE;
export { RATINGS_SERVICE };