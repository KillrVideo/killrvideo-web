import React, { Component, PropTypes } from 'react';
import VideoUploadStatus from './video-upload-status';

class VideoPlayerUpload extends Component {
  render() {
    /* 
      TODO: Hook up VideoJS plugin and events
      videojs: { videoSource: this.props.video.location }, videojsEvents: { play: this.props.onPlaybackStarted } 
    */
    
    // If there isn't a location yet for the uploaded video, show the status control
    let player;
    if (this.props.video.location) {
      player = (
        <video controls preload="auto" width="auto" height="auto">
          <source src={this.props.video.location} type='video/mp4' />
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a web browser 
            that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
          </p>
        </video>
      ); 
    } else {
      player = <VideoUploadStatus />
    }
    
    // Render appropriate player
    return player; 
  }
}

VideoPlayerUpload.queries = {
  video() {
    return [ 'location' ];
  }
};

// Prop validation
VideoPlayerUpload.propTypes = {
  video: PropTypes.object.isRequired,
  onPlaybackStarted: PropTypes.func.isRequired
};

export default VideoPlayerUpload;