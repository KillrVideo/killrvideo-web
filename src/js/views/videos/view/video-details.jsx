import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import GeminiScrollbar from 'react-gemini-scrollbar';
import moment from 'moment';

import UserProfileImage from 'components/users/user-profile-image';
import UserProfileLink from 'components/users/user-profile-link';

import VideoRatingSharing from './video-rating-sharing';
import VideoTagLink from './video-tag-link';
import VideoDescription from './video-description';
import VideoComments from './video-comments';

class VideoDetails extends Component {
  render() {
    const ratingEnabled = !!this.props.loggedInUser;
    
    let { video, comments, commentsLoading, moreCommentsAvailable, loadMoreComments } = this.props;
    
    // If we're doing an initial load and the video data isn't available yet, just output a placeholder
    if (!video.author) {
      return <div></div>;
    }
    
    // TODO: make scrollable
    return (
      <GeminiScrollbar>
        <Row>
          <Col xs={8}>
            <h4 id="view-video-title">{video.name}</h4>
          </Col>
          <Col xs={4} className="text-red text-right">
            {video.views} <span className="small text-muted">views</span>
          </Col>
        </Row>
        
        { /* Star ratings and sharing */ }
        <VideoRatingSharing video={video} ratingEnabled={ratingEnabled} />
        
        { /* Author and Tags */ }
        <Row>
          <Col xs={5} id="view-video-author">
            <UserProfileLink userId={video.author.userId}>
              <UserProfileImage email={video.author.email} />
            </UserProfileLink>
            by:<br />
            <UserProfileLink userId={video.author.userId}>
              {video.author.firstName + ' ' + video.author.lastName}
            </UserProfileLink>
          </Col>
          <Col xs={7} id="view-video-tags" className="text-right">
            {video.tags.map(tag => <VideoTagLink tag={tag} key={tag} /> )}
          </Col>
        </Row>
        
        { /* Date and Description */ }
        <p id="view-video-date">
          <em>Added on {moment(video.addedDate).format('l')}</em>
        </p>
        
        <VideoDescription video={video} />        
        
        <VideoComments comments={comments} commentsLoading={commentsLoading} moreCommentsAvailable={moreCommentsAvailable} 
                       loadMoreComments={loadMoreComments} />
      </GeminiScrollbar>
    );
  }
}

// Falcor queries used by the component
VideoDetails.queries = {
  video() {
    return [
      ...VideoRatingSharing.queries.video(),
      ...VideoDescription.queries.video(),
      [ [ 'name', 'tags', 'addedDate' ] ],
      [ 'views', null ],  // Null is needed to force falcor to follow the reference that views returns (see https://github.com/Netflix/falcor-router/issues/132)
      [ 'author', [ 'firstName', 'lastName', 'email', 'userId'] ]
    ];
  },
  
  comments() {
    return VideoComments.queries.comments();
  }
};

// Prop validation
VideoDetails.propTypes = {
  video: PropTypes.object.isRequired,
  comments: PropTypes.object.isRequired,
  commentsLoading: PropTypes.bool.isRequired,
  moreCommentsAvailable: PropTypes.bool.isRequired,
  
  // Actions
  loadMoreComments: PropTypes.func.isRequired
};

export default VideoDetails;