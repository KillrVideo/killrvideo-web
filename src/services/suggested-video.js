import path from 'path';
import { load } from 'grpc';
import { getClientAsync } from './discovery';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `suggested-videos/suggested_videos_service.proto`;

// Load the protobuf files
const proto = load({ file: PROTO_PATH, root: PROTO_BASE_PATH }, 'proto', { convertFieldsToCamelCase: true });

// Export a function that will get a client asyncronously
const getSuggestedVideosAsync = () => getClientAsync(proto.killrvideo.suggested_videos.SuggestedVideoService); 
export { getSuggestedVideosAsync as getClientAsync };