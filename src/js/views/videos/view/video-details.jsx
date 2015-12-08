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
    const {
      details: { isLoading, video },
      isLoggedIn,
      comments,
      addedComments,
      showMoreComments
    } = this.props;
    
    // If we're doing an initial load and the video data isn't available yet, just output a placeholder
    if (isLoading || video === null) {
      return <div></div>;
    }
    
    return (
      <GeminiScrollbar>
        <Row>
          <Col xs={8}>
            <h4 id="view-video-title">{video.name}</h4>
          </Col>
          <Col xs={4} className="text-red text-right">
            {video.stats.views} <span className="small text-muted">views</span>
          </Col>
        </Row>
        
        { /* Star ratings and sharing */ }
        <VideoRatingSharing video={video} ratingEnabled={isLoggedIn} />
        
        { /* Author and Tags */ }
        <Row>
          <Col xs={5} id="view-video-author">
            <UserProfileLink userId={video.author.userId}>
              <UserProfileImage email={video.author.email} className="small" />
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
        
        <VideoComments comments={comments} addedComments={addedComments} showMoreComments={showMoreComments} />
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
      [ 'stats', 'views' ],
      [ 'author', [ 'firstName', 'lastName', 'email', 'userId'] ]
    ];
  },
  
  comments() {
    return VideoComments.queries.comments();
  }
};

// Prop validation
VideoDetails.propTypes = {
  details: PropTypes.object.isRequired,
  comments: PropTypes.object.isRequired,
  addedComments: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  
  // Actions
  showMoreComments: PropTypes.func.isRequired
};

export default VideoDetails;