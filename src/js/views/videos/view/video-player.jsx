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
    if (this.props.videoDetails.isLoading || this.props.videoDetails.video === null) {
      videoPlayer = <div></div>;
    } else {
      const video = this.props.videoDetails.video;
      switch (video.locationType) {
        case VideoLocationTypes.YOUTUBE:
          videoPlayer = <VideoPlayerYouTube video={video} onPlaybackStarted={this.props.onPlaybackStarted} />;
          break;
        case VideoLocationTypes.UPLOAD:
          videoPlayer = <VideoPlayerUpload video={video} onPlaybackStarted={this.props.onPlaybackStarted} />;
          break;
        default:
          throw new Error(`Unknown or unsupported location type [${video.locationType}]`);
      }
    }
    
    return (
      <ResponsiveEmbed a16by9>
        {videoPlayer}
      </ResponsiveEmbed>
    );
  }
}

VideoPlayer.queries = {
  video() {
    // We don't know which information we'll need yet since we don't know the location type so just get what both would need
    return [
      [ [ 'locationType' ] ],
      ...VideoPlayerYouTube.queries.video(),
      ...VideoPlayerUpload.queries.video()
    ];
  }
};

// Prop types
VideoPlayer.propTypes = {
  videoDetails: PropTypes.object.isRequired,
  onPlaybackStarted: PropTypes.func.isRequired
};

export default VideoPlayer;