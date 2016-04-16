import path from 'path';
import { load } from 'grpc';
import { registerService } from './factory';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `statistics/statistics_service.proto`;

// Load the protobuf files
const proto = load({ file: PROTO_PATH, root: PROTO_BASE_PATH }, 'proto', { convertFieldsToCamelCase: true });

// Export the service name
const STATS_SERVICE = registerService(proto.killrvideo.statistics.StatisticsService);
export default STATS_SERVICE;
export { STATS_SERVICE };