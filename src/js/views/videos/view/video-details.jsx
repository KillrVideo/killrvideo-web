import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';

import UserProfileImage from 'components/users/user-profile-image';
import UserProfileLink from 'components/users/user-profile-link';

import VideoRatingSharing from './video-rating-sharing';
import VideoTagLink from './video-tag-link';
import VideoDescription from './video-description';

class VideoDetails extends Component {
  render() {
    const ratingEnabled = !!this.props.loggedInUser;
    const video = this.props.video;
    
    // If we're doing an initial load and the video data isn't available yet, just output a placeholder
    if (!video.author) {
      return <div></div>;
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
        
        { /* Date and Description */ }
        <p id="view-video-date">
          <em>Added on {moment(video.addedDate).format('l')}</em>
        </p>
        
        <VideoDescription video={video} />        
        
      </div>
    );
  }
}

// Falcor queries used by the component
VideoDetails.queries = {
  video() {
    return [
      ...VideoRatingSharing.queries.video(),
      ...VideoDescription.queries.video(),
      [ [ 'name', 'views', 'tags', 'addedDate' ] ],
      [ 'author', [ 'firstName', 'lastName', 'email', 'userId'] ]
    ];
  }
};

// Prop validation
VideoDetails.propTypes = {
  video: PropTypes.object.isRequired
};

export default VideoDetails;