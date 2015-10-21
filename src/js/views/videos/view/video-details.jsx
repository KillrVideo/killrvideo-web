import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';

import UserProfileImage from 'components/users/user-profile-image';
import UserProfileLink from 'components/users/user-profile-link';

import VideoRatingSharing from './video-rating-sharing';
import VideoTagLink from './video-tag-link';

class VideoDetails extends Component {
  render() {
    const ratingEnabled = !!this.props.loggedInUser;
    const video = this.props.video;
    
    // TODO: Something for initial state when no video data yet
    if (!video.author) {
      video.author = {};
      video.tags = [];
    }
    
    // TODO: make scrollable
    return (
      <div>
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
        
      </div>
    );
  }
}

// Falcor queries used by the component
VideoDetails.queries = {
  video(videoPath) {
    const ratingSharingQueries = VideoRatingSharing.queries.video(videoPath);
    return [
      ...ratingSharingQueries,
      [ ...videoPath, [ 'name', 'views', 'tags', 'description' ] ],
      [ ...videoPath, 'author', [ 'firstName', 'lastName', 'email', 'userId'] ]
    ];
  }
};

// Prop validation
VideoDetails.propTypes = {
  video: PropTypes.object.isRequired
};

export default VideoDetails;