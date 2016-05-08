import path from 'path';
import { load } from 'grpc';
import { registerService } from './factory';

// Path to .proto definitions (copied to output as part of the build)
const PROTO_BASE_PATH = path.resolve(__dirname, '..', 'resources/protos');
const PROTO_PATH = `sample-data/sample_data_service.proto`;

// Load the protobuf files
const proto = load({ file: PROTO_PATH, root: PROTO_BASE_PATH }, 'proto', { convertFieldsToCamelCase: true });

// Export the service name
const SAMPLE_DATA_SERVICE = registerService(proto.killrvideo.sample_data.SampleDataService);
export default SAMPLE_DATA_SERVICE;
export { SAMPLE_DATA_SERVICE };