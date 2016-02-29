import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { extname } from 'path';
import { format } from 'url';
import { random } from 'lodash';
import Promise from 'bluebird';
import moment from 'moment';

import config from '../config';

const jobsByVideoId = {};

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
        hostname: config.uploadEndpointHost,
        port: req.app.locals.port,  // Local is added before server is started in server.js
        pathname: `/dummyUploadEndpoint/${fileName}`
      });
      
      return [
        { path: [ 'uploads', 'destinationUrl' ], value: destination }
      ];
    }
  },
  // Get an uploaded video's status
  {
    route: 'videosById[{keys:videoIds}]["status", "statusDate"]',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.videoIds.forEach(videoId => {
        let job = jobsByVideoId[videoId];
        if (!job) {
          job = { status: null, statusDate: null };
          jobsByVideoId[videoId] = job;
          
          // Create a fake processing job
          Promise.delay(random(1, 10) * 1000)
            .then(() => {
              job.status = 'Processing';
              job.statusDate = moment().toISOString()
            })
            .delay(random(1, 10) * 1000)
            .then(() => {
              // Have some jobs randomly fail
              const outcome = random(1, 8);
              switch (outcome) {
                case 1:
                  job.status = 'Error';
                  break;
                case 2:
                  job.status = 'Canceled';
                  break;
                default:
                  job.status = 'Finished';
                  break;
              }
              
              job.statusDate = moment().toISOString();
            });
        }
        
        // If job isn't finished yet, allow values to expire 3 seconds after being added to the cache
        const metadata = {};
        if (job.status !== 'Error' && job.status !== 'Canceled' || job.status !== 'Finished') {
          metadata.$expires = -3000;
        }
                
        // Return values
        pathValues.push({
          path: [ 'videosById', videoId, 'status' ],
          value: $atom(job.status, metadata)
        });
        pathValues.push({
          path: [ 'videosById', videoId, 'statusDate' ],
          value: $atom(job.statusDate, metadata)
        });
      });
      
      return pathValues;
    }
  }
];

// Export upload routes
export default routes;