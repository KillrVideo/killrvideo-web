import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { load, unload, loadMoreComments, addComment } from 'actions/view-video';
import { isUndefined } from 'lodash';

import VideoPlayer from './video-player';
import VideoDetails from './video-details';
import VideoAddComment from './video-add-comment';
import VideoPreviewList from 'components/videos/video-preview-list';

class ViewVideo extends Component {
  componentDidMount() {
    // Get the video once mounted
    this.props.load(this.props.videoId, ViewVideo.queries.video(), ViewVideo.queries.comments());
  }
  
  componentWillReceiveProps(nextProps) {
    // If the video id changes, we need to get the video again
    if (this.props.videoId !== nextProps.videoId) {
      this.props.load(nextProps.videoId, ViewVideo.queries.video(), ViewVideo.queries.comments());
    }
  }
  
  loadMoreComments() {
    this.props.loadMoreComments(ViewVideo.queries.comments());
  }
    
  recordPlayback() {
    // TODO: record playback stats
    console.log('Playback started!');
  }
    
  render() {
    const { viewVideo: { videoDetails, videoComments }, currentUser: { isLoggedIn } } = this.props;
    
    return (
      <div>
        <Row>
          <Col md={7} xs={12} id="view-video-embed">
            <VideoPlayer videoDetails={videoDetails} onPlaybackStarted={() => this.recordPlayback()} />
          </Col>
          <Col md={5} xs={12} id="view-video-details">
            <VideoDetails videoDetails={videoDetails} videoComments={videoComments} isLoggedIn={isLoggedIn}
                          loadMoreComments={() => this.loadMoreComments()} />
            <VideoAddComment isLoggedIn={isLoggedIn} commentAdded={videoComments.commentAdded}
                             onSubmit={vals => this.props.addComment(vals.comment) } />
          </Col>
        </Row>
        <VideoPreviewList title="More Videos Like This" list="recentVideos" />
      </div>
    );
  }
}

ViewVideo.queries = {
  video() {
    const videoPlayerQueries = VideoPlayer.queries.video();
    const videoDetailsQueries = VideoDetails.queries.video();
    return [
      // The queries from other components
      ...videoPlayerQueries,
      ...videoDetailsQueries
    ];
  },
  
  comments() {
    return VideoDetails.queries.comments();
  }
};

// Prop validation
ViewVideo.propTypes = {
  // From the router parameter (based on URL)
  videoId: PropTypes.string.isRequired,
  // From redux
  viewVideo: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  // Actions
  load: PropTypes.func.isRequired,
  unload: PropTypes.func.isRequired,
  loadMoreComments: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    currentUser: state.authentication.currentUser,
    videoId: state.router.params.videoId,
    viewVideo: state.viewVideo
  };
}

export default connect(mapStateToProps, { load, unload, loadMoreComments, addComment })(ViewVideo);