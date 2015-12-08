import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { load, unload, showMoreComments, addComment, addAnotherComment } from 'actions/view-video';
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
  
  componentWillUnmount() {
    this.props.unload();
  }
  
  componentDidUpdate(prevProps) {
    // If the video id changes, we need to get the video again
    if (this.props.videoId !== prevProps.videoId) {
      this.props.unload();
      this.props.load(this.props.videoId, ViewVideo.queries.video(), ViewVideo.queries.comments());
    }
  }
      
  recordPlayback() {
    // TODO: record playback stats
    console.log('Playback started!');
  }
    
  render() {
    const {
      videoId, 
      viewVideo: { details, comments, addedComments }, 
      currentUser: { isLoggedIn }, 
      showMoreComments,
      addComment,
      addAnotherComment
   } = this.props;
    
    return (
      <div>
        <Row>
          <Col md={7} xs={12} id="view-video-embed">
            <VideoPlayer videoDetails={details} onPlaybackStarted={() => this.recordPlayback()} />
          </Col>
          <Col md={5} xs={12} id="view-video-details">
            <VideoDetails details={details} comments={comments} addedComments={addedComments} isLoggedIn={isLoggedIn}
                          showMoreComments={() => showMoreComments(ViewVideo.queries.comments())} />
            <VideoAddComment addedComments={addedComments} isLoggedIn={isLoggedIn} addAnotherComment={addAnotherComment}
                             onSubmit={vals => addComment(videoId, vals.comment, ViewVideo.queries.comments())} />
          </Col>
        </Row>
        <VideoPreviewList title="More Videos Like This" list={VideoPreviewList.lists.relatedVideos(videoId)} />
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
  showMoreComments: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired,
  addAnotherComment: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    currentUser: state.authentication.currentUser,
    videoId: state.router.params.videoId,
    viewVideo: state.viewVideo
  };
}

export default connect(mapStateToProps, { load, unload, showMoreComments, addComment, addAnotherComment })(ViewVideo);