import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getVideo } from 'actions/view-video';

import VideoPlayer from './video-player';
import VideoDetails from './video-details';
import VideoPreviewList from 'components/videos/video-preview-list';

class ViewVideo extends Component {
  componentDidMount() {
    // Get the video once mounted
    this.props.getVideo(ViewVideo.queries.video(this.props.videoId));
  }
  
  componentWillReceiveProps(nextProps) {
    // If the video id changes, we need to get the video again
    if (this.props.videoId !== nextProps.videoId) {
      this.props.getVideo(ViewVideo.queries.video(nextProps.videoId));
    }
  }
  
  recordPlayback() {
    // TODO: record playback stats
    console.log('Playback started!');
  }
    
  render() {
    const video = this.props.viewVideo.video;   
    return (
      <div>
        <Row>
          <Col md={7} xs={12} id="view-video-embed">
            <VideoPlayer video={video} onPlaybackStarted={() => this.recordPlayback()} />
          </Col>
          <Col md={5} xs={12} id="view-video-details">
            <VideoDetails video={video} />
          </Col>
        </Row>
        <VideoPreviewList title="More Videos Like This" list="recentVideos" />
      </div>
    );
  }
}

ViewVideo.queries = {
  video(videoId) {
    const videoPath = ['videosById', videoId];
    const videoPlayerQueries = VideoPlayer.queries.video(videoPath);
    const videoDetailsQueries = VideoDetails.queries.video(videoPath);
    return [
      // The queries from other components
      ...videoPlayerQueries,
      ...videoDetailsQueries
    ];
  }
};

// Prop validation
ViewVideo.propTypes = {
  // From the router parameter (based on URL)
  videoId: PropTypes.string.isRequired,
  // From redux
  viewVideo: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    loggedInUser: state.loggedInUser,
    videoId: state.router.params.videoId,
    viewVideo: state.viewVideo
  };
}

export default connect(mapStateToProps, { getVideo })(ViewVideo);