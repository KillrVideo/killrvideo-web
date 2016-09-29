import path from 'path';
import { loadServiceProto } from '../utils/grpc-client';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `uploads/uploads_service.proto`;

// Load the protobuf files
const { proto, fullyQualifiedName } = loadServiceProto(PROTO_BASE_PATH, PROTO_PATH, p => p.killrvideo.uploads.UploadsService);

// Export the service name
export const UPLOADS_SERVICE = fullyQualifiedName;