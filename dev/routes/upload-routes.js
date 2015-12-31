import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { extname } from 'path';
import { format } from 'url';

const routes = [
  {
    // Generate a destination for an uploaded video file
    route: 'uploads.generateDestination',
    call(callPath, args) {
      const [ fileName ] = args;
      
      const fileExt = extname(fileName);
      
      // Quick way to simulate an error response for any JPG files selected
      if (fileExt === '.jpg') {
        return [
          { path: [ 'uploads', 'generateDestinationErrors' ], value: $error(`Files of type ${fileExt} are not allowed`) }
        ];
      }
      
      const req = this.requestContext.request;
      const destination = format({
        protocol: req.protocol,
        host: req.get('host'),  // Should include port
        pathname: `/dummyUploadEndpoint/${fileName}`
      });
      
      return [
        { path: [ 'uploads', 'destinationUrl' ], value: destination }
      ];
    }
  }
];

// Export upload routes
export default routes;