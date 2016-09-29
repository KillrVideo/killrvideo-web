import path from 'path';
import { loadServiceProto } from '../utils/grpc-client';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `video-catalog/video_catalog_service.proto`;

// Load the protobuf files
const { proto, fullyQualifiedName } = loadServiceProto(PROTO_BASE_PATH, PROTO_PATH, p => p.killrvideo.video_catalog.VideoCatalogService);

// Export the service name
export const VIDEO_CATALOG_SERVICE = fullyQualifiedName;

// Export the VideoLocationType enum for lookups/conversion to int
const VideoLocationType = proto.killrvideo.video_catalog.VideoLocationType;
export { VideoLocationType };