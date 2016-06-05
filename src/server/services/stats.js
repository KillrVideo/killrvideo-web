import path from 'path';
import { loadServiceProto } from 'killrvideo-nodejs-common';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `statistics/statistics_service.proto`;

// Load the protobuf files
const { proto, fullyQualifiedName } = loadServiceProto(PROTO_BASE_PATH, PROTO_PATH, p => p.killrvideo.statistics.StatisticsService);

// Export the service name
export const STATS_SERVICE = fullyQualifiedName;