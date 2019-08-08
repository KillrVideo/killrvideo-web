import React from 'react';
import youTubePlayerLoaded from 'lib/youtube-player-loaded';

class VideoPlayerYouTube extends React.Component {
  createYouTubePlayer() {
    youTubePlayerLoaded.then(YT => {
      // Fire the playback started handler whenever the state changes appropriately
      const youTubePlayer = new YT.Player(this.refs.youTubeIframe, {
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
  
  componentDidMount() {
    this.createYouTubePlayer();
  }
  
  componentDidUpdate(previousProps) {
    // If the video changes, create the YT player again
    if (this.props.video.location !== previousProps.video.location) {
      this.createYouTubePlayer();
    }
  }

  render() {
    const youTubeUrl = `http://www.youtube.com/embed/${this.props.video.location}?enablejsapi=1`;
    return (
      <iframe src={youTubeUrl} ref="youTubeIframe"></iframe>
    );
  }
}

VideoPlayerYouTube.queries = {
  video() {
    return [ 
      [ ['location'] ] 
    ];
  }
};

export default VideoPlayerYouTube;