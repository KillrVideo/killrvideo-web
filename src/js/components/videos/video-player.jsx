import React, { Component, PropTypes } from 'react';
import { ResponsiveEmbed } from 'react-bootstrap';
import VideoPlayerYouTube from './video-player-youtube';
import VideoPlayerUpload from './video-player-upload';

const VideoLocationTypes = {
  YOUTUBE: 0,
  UPLOAD: 1
};

class VideoPlayer extends Component {
  render() {
    // Figure out which player to show
    let videoPlayer;
    switch(this.props.video.locationType) {
      case VideoLocationTypes.YOUTUBE:
        videoPlayer = <VideoPlayerYouTube video={this.props.video} />;
        break;
      case VideoLocationTypes.UPLOAD:
        videoPlayer = <VideoPlayerUpload video={this.props.video} />;
        break;
      default:
        videoPlayer = <div></div>;
        break; 
    }
    
    return (
      <ResponsiveEmbed a16by9>
        {videoPlayer}
      </ResponsiveEmbed>
    );
  }
}

// Prop types
VideoPlayer.propTypes = {
  video: PropTypes.object.isRequired
};

export default VideoPlayer;