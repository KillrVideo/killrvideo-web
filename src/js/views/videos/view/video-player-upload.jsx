import React, { Component, PropTypes } from 'react';
import VideoUploadStatus from './video-upload-status';

class VideoPlayerUpload extends Component {
  constructor(props) {
    super(props);
    
    // Kept out of state since it has no bearing on rendering
    this._paused = false;
  }
  
  handlePlaying() {
    // Only count playback when it's not after being paused (i.e. first time started or when restarted after finishing)
    if (!this._paused) {
      this.props.onPlaybackStarted();
    }
    
    this._paused = false;
  }
  
  handlePause() {
    this._paused = true;
  }
  
  handleEnded() {
    this._paused = false;
  }
  
  render() {
    const { video: { videoId, location, previewImageLocation } } = this.props;
    
    // If there isn't a location yet for the uploaded video, show the status control
    if (!location) {
      return <VideoUploadStatus videoId={videoId} />;
    }
    
    return (
      <video controls poster={previewImageLocation} onPlaying={() => this.handlePlaying()} onPause={() => this.handlePause()}
             onEnded={() => this.handleEnded()}>
        <source src={location} type="video/mp4" />
        Sorry, your device does not support HTML5 video playback.
      </video>
    );
  }
}

VideoPlayerUpload.queries = {
  video() {
    return [
      [ [ 'videoId', 'location', 'previewImageLocation' ] ]
    ];
  }
};

// Prop validation
VideoPlayerUpload.propTypes = {
  video: PropTypes.object.isRequired,
  onPlaybackStarted: PropTypes.func.isRequired
};

export default VideoPlayerUpload;