import { createAction } from 'redux-actions';
import { isUndefined } from 'lodash';
import { Promise } from 'lib/promise';
import { parse as parseUrl, format as formatUrl } from 'url';
import xhr from 'xhr';
import model from 'stores/falcor-model';
import { createActionTypeConstants } from './promises';

// Enable cancellation
Promise.config({ cancellation: true });

// Promisify the put method on the xhr lib
const xhrPut = Promise.promisify(xhr.put);

// Upload in 512 KB chunks
const DEFAULT_CHUNK_SIZE = 1024 * 512;

/**
 * Action type constants
 */
const UPLOAD_VIDEO = 'addVideo/UPLOAD_VIDEO';

// Public action types
export const ActionTypes = {
  UPLOAD_VIDEO: createActionTypeConstants(UPLOAD_VIDEO),
  UPLOAD_VIDEO_PROGRESS: 'addVideo/UPLOAD_VIDEO_PROGRESS',
  CLEAR_UPLOAD_VIDEO_SELECTION: 'addVideo/CLEAR_UPLOAD_VIDEO_SELECTION'
};

/**
 * Private helpers
 */

const reportProgress = createAction(ActionTypes.UPLOAD_VIDEO_PROGRESS, (statusMessage, percentComplete) => ({ statusMessage, percentComplete }));

const DESTINATION_PROGRESS_MESSAGE = 'Preparing to upload file';
function generateUploadDestination() {
  const fileName = this.file.name;
  
  this.dispatch(reportProgress(DESTINATION_PROGRESS_MESSAGE, 1));
  
  return model
    .call('uploads.generateDestination', [ fileName ], [], [ 'destinationUrl' ])
    .then(response => {
      this.destinationUrl = response.json.uploads.destinationUrl;
      this.dispatch(reportProgress(DESTINATION_PROGRESS_MESSAGE, 2));
    });
}

function uploadRemainingFileChunks() {
  // Figure out what chunk we're uploading
  this.currentChunk = this.currentChunk === null ? 0 : this.currentChunk + 1;
  
  // Figure out start position in file for that chunk
  const start = this.currentChunk * DEFAULT_CHUNK_SIZE;
  
  // See if we're reached the end of the file and if so, just return a completed promise
  if (start >= this.file.size) {
    return Promise.resolve();
  }
  
  // Figure out progress to report
  const startKb = Math.floor(start / 1024);
  const fileKb = Math.floor(this.file.size / 1024);
  const percentComplete = Math.floor(5 + (start / this.file.size * 90));
  this.dispatch(reportProgress(`Uploading file (${startKb} of ${fileKb})`, percentComplete));
  
  // Figure out the end position in file for the chunk
  const end = start + DEFAULT_CHUNK_SIZE >= this.file.size
    ? this.file.size
    : start + DEFAULT_CHUNK_SIZE;
  
  if (this.fileReader === null) {
    this.fileReader = new FileReader();
  }
  
  // Create promise that will be resolved once file chunk has been read
  const loaded = new Promise((resolve, reject) => {
    // Listen for load end event and resolve the promise appropriately
    this.fileReader.onloadend = e => {
      if (e.target.readyState === FileReader.DONE) {
        resolve(new Uint8Array(e.target.result));
      } else {
        reject(e);
      }
    };
  });
  
  // Start reading the file and return the promise
  this.fileReader.readAsArrayBuffer(this.file.slice(start, end));
  return loaded.bind(this).then(putFileChunk).then(uploadRemainingFileChunks);
}

function putFileChunk(chunkData) {
  // Generate a block Id for the chunk by padding zeroes before the current chunk number
  let blockId = '' + this.currentChunk;
  while (blockId.length < 10) {
    blockId = '0' + blockId;
  }
  blockId = btoa('block-' + blockId);   // Base-64 encode
  
  // Save block id in upload state so we can post the block list later
  this.blockIds.push(blockId);
  
  // Modify some query string params on the destination URL
  const putUrl = parseUrl(this.destinationUrl, true);
  putUrl.query.comp = 'block';
  putUrl.query.blockid = blockId;
  
  // Do the PUT operation to upload the block to Azure Blob storage
  return xhrPut({
    url: formatUrl(putUrl),
    headers: { 'x-ms-blob-type': 'BlockBlob' },
    body: chunkData
  }).then(response => {
    // Check for errors
    if (response.statusCode !== 201) {
      throw new Error(`Put request failed with status code ${response.statusCode}`);
    }
  });
}

const BLOCK_LIST_PROGRESS_MESSAGE = 'Finishing upload';
function putBlockList() {
  this.dispatch(reportProgress(BLOCK_LIST_PROGRESS_MESSAGE, 98));
  
  // Generate the XML for the block list
  let blockListBody = '';
  for(var i = 0; i < this.blockIds.length; i++) {
    let blockId = this.blockIds[i];
    blockListBody += `<Latest>${blockId}</Latest>`;
  }
  blockListBody = `<?xml version='1.0' encoding='utf-8'?><BlockList>${blockListBody}</BlockList>`;
      
  // Generate the URL for the block list
  const putUrl = parseUrl(this.destinationUrl, true);
  putUrl.query.comp = 'blocklist';
  
  // Do the PUT to upload the block list to Azure Blob storage
  return xhrPut({
    url: formatUrl(putUrl),
    headers: { "x-ms-blob-content-type": this.file.type },
    body: blockListBody
  }).then(response => {
    // Check for errors
    if (response.statusCode !== 201) {
      throw new Error(`Put request failed with status code ${response.statusCode}`);
    }
    
    this.dispatch(reportProgress(BLOCK_LIST_PROGRESS_MESSAGE, 99));
  });
}

/**
 * Public action creators
 */

export function uploadVideo(formVals) {
  return dispatch => {
    // Create a promise that we can manually trigger at the end of this method to start the upload
    let startUpload;
    const startPromise = new Promise(resolve => { startUpload = resolve; });
    
    // Create a promise to represent the entire upload process
    const promise = Promise.bind(startPromise).then(generateUploadDestination).then(uploadRemainingFileChunks).then(putBlockList);
    
    // Tell redux we're uploading a video
    dispatch({
      type: UPLOAD_VIDEO,
      payload: { 
        promise,
        data: {
          promise
        }
      }
    });
    
    // Upload state will be the 'this' context for all promises because of the Promise.bind call above
    let uploadState = {
      file: formVals.uploadFile,
      destinationUrl: null,
      fileReader: null,
      currentChunk: null,
      blockIds: [],
      dispatch
    };
    
    // Start the upload process
    startUpload(uploadState);
  };
};

export function clearVideoSelection() {
  return (dispatch, getState) => {
    const { addVideo: { upload: { _promise: p } } } = getState();
    if (p !== null) p.cancel();
    
    dispatch({
      type: ActionTypes.CLEAR_UPLOAD_VIDEO_SELECTION,
      payload: ActionTypes.CLEAR_UPLOAD_VIDEO_SELECTION
    });
  };
};