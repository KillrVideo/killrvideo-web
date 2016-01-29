import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isUndefined } from 'lodash';
import { routeActions } from 'react-router-redux';

import * as Actions from 'actions/view-video';
import VideoPlayer from './video-player';
import VideoDetails from './video-details';
import VideoAddComment from './video-add-comment';
import VideoPreviewList from 'components/videos/video-preview-list';

class ViewVideo extends Component {
  componentDidMount() {
    // Get the video once mounted
    this.props.load(ViewVideo.queries.video(), ViewVideo.queries.comments());
  }
  
  componentWillUnmount() {
    this.props.unload();
  }
  
  componentDidUpdate(prevProps) {
    // If the video id changes, we need to get the video again
    if (this.props.videoId !== prevProps.videoId) {
      this.props.unload();
      this.props.moreLikeThisActions.unload();
      this.props.load(ViewVideo.queries.video(), ViewVideo.queries.comments());
      this.props.moreLikeThisActions.load(VideoPreviewList.queries.preview());
    }
  }
    
  render() {
    const {
      videoId, 
      viewVideo: { details, comments, addedComments, moreLikeThis, rating }, 
      currentUser: { isLoggedIn },
      recordPlayback,
      showMoreComments,
      rateVideo,
      addComment,
      addAnotherComment,
      moreLikeThisActions,
      push
   } = this.props;
    
    return (
      <div className="body-content container">
        <Row>
          <Col md={7} xs={12} id="view-video-embed">
            <VideoPlayer videoDetails={details} onPlaybackStarted={() => recordPlayback([ [ 'stats', 'views' ] ])} />
          </Col>
          <Col md={5} xs={12} id="view-video-details">
            <VideoDetails details={details} comments={comments} addedComments={addedComments} isLoggedIn={isLoggedIn}
                          ratingEnabled={rating.ratingEnabled} currentUserRating={rating.currentUserRating} rateVideo={rateVideo}
                          showMoreComments={() => showMoreComments(ViewVideo.queries.comments())} push={push} />
                          
            <VideoAddComment addedComments={addedComments} isLoggedIn={isLoggedIn} addAnotherComment={addAnotherComment}
                             onSubmit={vals => addComment(vals.comment, ViewVideo.queries.comments())} />
          </Col>
        </Row>
        <VideoPreviewList title="More Videos Like This" {...moreLikeThis} {...moreLikeThisActions}  />
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
  recordPlayback: PropTypes.func.isRequired,
  showMoreComments: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired,
  addAnotherComment: PropTypes.func.isRequired,
  moreLikeThisActions: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    currentUser: state.authentication.currentUser,
    videoId: ownProps.params.videoId,
    viewVideo: state.viewVideo
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load: bindActionCreators(Actions.load, dispatch),
    unload: bindActionCreators(Actions.unload, dispatch),
    recordPlayback: bindActionCreators(Actions.recordPlayback, dispatch),
    showMoreComments: bindActionCreators(Actions.showMoreComments, dispatch),
    rateVideo: bindActionCreators(Actions.rateVideo, dispatch),
    addComment: bindActionCreators(Actions.addComment, dispatch),
    addAnotherComment: bindActionCreators(Actions.addAnotherComment, dispatch),
    moreLikeThisActions: bindActionCreators(Actions.moreLikeThis, dispatch),
    push: bindActionCreators(routeActions.push, dispatch)
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { 
    load,
    addComment,
    recordPlayback,
    rateVideo,
    moreLikeThisActions: { 
      load: loadMoreLikeThis, 
      ...otherMoreLikeThis 
    }, 
    ...otherDispatch 
  } = dispatchProps;
  
  // Add the current video Id from stateProps as an argument to the functions that need it
  return {
    ...ownProps,
    ...stateProps,
    ...otherDispatch,
    load(...args) {
      return load(stateProps.videoId, ...args);
    },
    addComment(...args) {
      return addComment(stateProps.videoId, ...args);
    },
    recordPlayback(...args) {
      return recordPlayback(stateProps.videoId, ...args);
    },
    rateVideo(...args) {
      return rateVideo(stateProps.videoId, ...args);
    },
    moreLikeThisActions: {
      ...otherMoreLikeThis,
      load(...args) {
        return loadMoreLikeThis(stateProps.videoId, ...args);
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ViewVideo);