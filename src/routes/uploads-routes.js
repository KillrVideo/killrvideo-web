import { toError } from './common/sentinels';

// Routes served by the uploads service
const routes = [
  {
    // Generate a URL where a video file can be uploaded to
    route: 'uploads.generateDestination',
    call(callPath, args) {
      // TODO: What about marking uploads complete?
      return [
        { path: [ 'uploads', 'generateDestinationErrors' ], value: toError('Uploads are not currently supported') }
      ];
    }
  }
];

export default routes;