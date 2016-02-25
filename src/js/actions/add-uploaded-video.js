import { createAction } from 'redux-actions';
import { isUndefined } from 'lodash';
import { Promise } from 'lib/promise';
import Uri from 'jsuri';
import xhr from 'xhr';
import model from 'stores/falcor-model';
import { createActionTypeConstants } from './promises';

// Promisify the put method on the xhr lib
const xhrPut = Promise.promisify(xhr.put);

// Upload in 512 KB chunks
const DEFAULT_CHUNK_SIZE = 1024 * 512;

/**
 * Action type constants
 */

const UPLOAD_VIDEO = 'addVideo/UPLOAD_VIDEO';
const ADD_UPLOADED_VIDEO = 'addVideo/ADD_UPLOADED_VIDEO';

// Public action types
export const ActionTypes = {
  UPLOAD_VIDEO: createActionTypeConstants(UPLOAD_VIDEO),
  UPLOAD_VIDEO_PROGRESS: 'addVideo/UPLOAD_VIDEO_PROGRESS',
  ADD_UPLOADED_VIDEO: createActionTypeConstants(ADD_UPLOADED_VIDEO),
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

function readCurrentChunk() {
  // Create promise that will be resolved once file chunk has been read
  return new Promise((resolve, reject) => {
    // Listen for load end event and resolve the promise appropriately
    this.fileReader.onloadend = e => {
      if (e.target.readyState === FileReader.DONE) {
        resolve(new Uint8Array(e.target.result));
      } else {
        reject(e);
      }
    };
    
    // Figure out start position in file for the chunk
    const start = this.currentChunk * DEFAULT_CHUNK_SIZE;
    
    // Figure out the end position in file for the chunk
    const end = start + DEFAULT_CHUNK_SIZE >= this.file.size
      ? this.file.size
      : start + DEFAULT_CHUNK_SIZE;
    
    // Start reading
    this.fileReader.readAsArrayBuffer(this.file.slice(start, end));
  });
}

function putCurrentChunk(chunkData) {
  // Generate a block Id for the chunk by padding zeroes before the current chunk number
  let blockId = '' + this.currentChunk;
  while (blockId.length < 10) {
    blockId = '0' + blockId;
  }
  blockId = btoa('block-' + blockId);   // Base-64 encode
  
  // Save block id in upload state so we can post the block list later
  this.blockIds.push(blockId);
  
  // Modify some query string params on the destination URL
  const putUrl = new Uri(this.destinationUrl)
    .addQueryParam('comp', 'block')
    .addQueryParam('blockid', blockId);
  
  // Do the PUT operation to upload the block to Azure Blob storage
  return xhrPut({
    url: putUrl.toString(),
    headers: { 'x-ms-blob-type': 'BlockBlob' },
    body: chunkData
  }).then(response => {
    // Check for errors
    if (response.statusCode !== 201) {
      throw new Error(`Put request failed with status code ${response.statusCode}`);
    }
  });
}

function gotoNextChunk() {
  // Report progress
  const chunkFinished = this.currentChunk + 1;
  const percentComplete = Math.floor(5 + (chunkFinished / this.totalChunks * 90));
  this.dispatch(reportProgress(`Uploading file (${chunkFinished} of ${this.totalChunks})`, percentComplete));
  
  // Increment the counter
  this.currentChunk = this.currentChunk + 1;
}

function uploadTheFile() {
  // Figure out how many chunks we're going to be uploading
  this.totalChunks = Math.ceil(this.file.size / DEFAULT_CHUNK_SIZE);
  
  this.currentChunk = 0;
  this.fileReader = new FileReader();
  
  let promise = Promise.bind(this);
  for (let i = 0; i < this.totalChunks; i++) {
    promise = promise.then(readCurrentChunk).then(putCurrentChunk).then(gotoNextChunk);
  }
  
  return promise;
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
  const putUrl = new Uri(this.destinationUrl)
    .addQueryParam('comp', 'blocklist');
  
  // Do the PUT to upload the block list to Azure Blob storage
  return xhrPut({
    url: putUrl.toString(),
    headers: { "x-ms-blob-content-type": this.file.type },
    body: blockListBody
  }).then(response => {
    // Check for errors
    if (response.statusCode !== 201) {
      throw new Error(`Put request failed with status code ${response.statusCode}`);
    }
    
    this.dispatch(reportProgress(BLOCK_LIST_PROGRESS_MESSAGE, 99));
    
    // Return the URL the file was uploaded to
    return {
      uploadUrl: this.destinationUrl
    };
  });
}


/**
 * Action creators
 */

export function uploadVideo(uploadFile) {
  return dispatch => {
    // Create a promise that we can manually trigger at the end of this method to start the upload
    // after we've dispatched the promise
    let startUpload;
    const startPromise = new Promise(resolve => { startUpload = resolve; });
    
    // Create a promise to represent the entire upload process
    const promise = Promise.bind(startPromise)
      .then(generateUploadDestination)
      .then(uploadTheFile)
      .then(putBlockList);
    
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
      file: uploadFile,
      destinationUrl: null,
      fileReader: null,
      totalChunks: null,
      currentChunk: null,
      blockIds: [],
      dispatch
    };
    
    // Start the upload process
    startUpload(uploadState);
    
    return promise;
  };
};

// Add an uploaded video
export function addUploadedVideo(vals) {
  return (dispatch, getState) => {
    const { addVideo: { upload: { _uploadPromise: uploadPromise } } } = getState();
    
    const promise = uploadPromise
      .then(result => {
        return model.call([ 'currentUser', 'videos', 'addUploaded' ], [ result.uploadUrl, vals.name, vals.description, vals.tags ], [ 'videoId' ]);
      })
      .then(response => ({ addedVideoId: response.json.currentUser.videos[0].videoId }));
      
    dispatch({
      type: ADD_UPLOADED_VIDEO,
      payload: { promise }
    });
    
    return promise;
  };
};

export const clearVideoSelection = createAction(ActionTypes.CLEAR_UPLOAD_VIDEO_SELECTION);