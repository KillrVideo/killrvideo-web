import path from 'path';
import { load } from 'grpc';
import { registerService } from './factory';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `video-catalog/video_catalog_service.proto`;

// Load the protobuf files
const proto = load({ file: PROTO_PATH, root: PROTO_BASE_PATH }, 'proto', { convertFieldsToCamelCase: true });

// Export the service name
const VIDEO_CATALOG_SERVICE = registerService(proto.killrvideo.video_catalog.VideoCatalogService);
export default VIDEO_CATALOG_SERVICE;
export { VIDEO_CATALOG_SERVICE };

// Export the VideoLocationType enum for lookups/conversion to int
const VideoLocationType = proto.killrvideo.video_catalog.VideoLocationType;
export { VideoLocationType };