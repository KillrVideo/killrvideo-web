import React, { Component, PropTypes } from 'react';

class VideoPlayerYouTube extends Component {
  render() {
    const youTubeUrl = `http://www.youtube.com/embed/${this.props.video.location}?enablejsapi=1`;
    return (
      <iframe src={youTubeUrl}></iframe>
    );
  }
}

VideoPlayerYouTube.queries = {
  video(videoPath) {
    return [ ...videoPath, 'location' ];
  }
};

// Prop validation
VideoPlayerYouTube.propTypes = {
  video: PropTypes.object.isRequired,
  onPlaybackStarted: PropTypes.func.isRequired
};

export default VideoPlayerYouTube;