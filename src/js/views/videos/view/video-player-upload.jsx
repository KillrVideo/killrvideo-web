import React, { Component, PropTypes } from 'react';
import VideoUploadStatus from './video-upload-status';
import videojs from 'video.js';

class VideoPlayerUpload extends Component {
  loadVideoJsPlayer(placeholder) {
    if (placeholder === null) return;
    
    // Since videoJS modifies the DOM in a destructive way, we have to manually do this so it will play nicely with React
    const div = placeholder.getDOMNode();
    div.innerHTML = `<video controls class="video-js vjs-default-skin">
      <source src="${this.props.video.location}" type="video/mp4" />
      <p className="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a web browser 
        that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
      </p>
    </video>`;
    const video = div.firstChild;
    videojs(video, { videoSource: this.props.video.location }).on('play', e => this.props.onPlaybackStarted());
    // TODO: Fix styling issues with responsive (i.e. player controls not showing, etc)
    // Maybe use media queries to manually set video width/height if necessary?
  }
  
  render() {
    /* 
      TODO: Hook up VideoJS plugin and events
      videojs: { videoSource: this.props.video.location }, videojsEvents: { play: this.props.onPlaybackStarted } 
    */
    
    // If there isn't a location yet for the uploaded video, show the status control
    let player;
    if (this.props.video.location) {
      player = <div ref={c => this.loadVideoJsPlayer(c)} className="embed-responsive-item"></div>; 
    } else {
      player = <VideoUploadStatus />;
    }
    
    // Render appropriate player
    return player; 
  }
}

VideoPlayerUpload.queries = {
  video(videoPath) {
    return [ ...videoPath, 'location' ];
  }
};

// Prop validation
VideoPlayerUpload.propTypes = {
  video: PropTypes.object.isRequired,
  onPlaybackStarted: PropTypes.func.isRequired
};

export default VideoPlayerUpload;