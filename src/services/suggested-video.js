import path from 'path';
import { load } from 'grpc';
import { registerService } from './';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `suggested-videos/suggested_videos_service.proto`;

// Load the protobuf files
const proto = load({ file: PROTO_PATH, root: PROTO_BASE_PATH }, 'proto', { convertFieldsToCamelCase: true });

// Export the service name
const SUGGESTED_VIDEO_SERVICE = registerService(proto.killrvideo.suggested_videos.SuggestedVideoService);
export default SUGGESTED_VIDEO_SERVICE;
export { SUGGESTED_VIDEO_SERVICE };