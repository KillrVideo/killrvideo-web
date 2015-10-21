import React, { Component, PropTypes } from 'react';
import youTubeApiLoaded from 'lib/youtube-api-loaded';

class VideoPlayerYouTube extends Component {
  gotIframe(iframe) {
    if (iframe === null) return;
    
    // We've got the iframe reference, so create a YT player once the API is loaded
    youTubeApiLoaded.then(YT => {
      // Fire the playback started handler whenever the state changes appropriately
      const youTubePlayer = new YT.Player(iframe.getDOMNode(), {
        events: {
          'onStateChange': e => {
            if (e.data === YT.PlayerState.PLAYING) {
              this.props.onPlaybackStarted();
            }
          }
        }
      });
    });
  }

  render() {
    const youTubeUrl = `http://www.youtube.com/embed/${this.props.video.location}?enablejsapi=1`;
    return (
      <iframe src={youTubeUrl} ref={c => this.gotIframe(c)}></iframe>
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