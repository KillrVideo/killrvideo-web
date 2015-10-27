import React, { Component, PropTypes } from 'react';
import { isUndefined, map } from 'lodash';
import moment from 'moment';

import UserProfileLink from 'components/users/user-profile-link';
import UserProfileImage from 'components/users/user-profile-image';

// Displays the comments on a video
class VideoComments extends Component {
  getComments() {
    const comments = this.props.video.comments;
    if (isUndefined(comments)) return;
    
    return map(comments, (c, key) => {
      return (
        <li className="clearfix" key={key}>
          <UserProfileLink userId={c.author.userId} className="pull-left">
            <UserProfileImage email={c.author.email} className="img-circle" />
          </UserProfileLink>
          <UserProfileLink userId={c.author.userId}>
            {c.author.firstName + ' ' + c.author.lastName}
          </UserProfileLink> <span className="text-muted">{moment(c.addedDate).fromNow()}</span><br/>
          
          {c.comment}
        </li>
      );
    }); 
  }

  render() {
    return (
      <div id="view-video-comments">
        <h5>Latest Comments</h5>
        <ul className="video-comments list-unstyled">
          {this.getComments()}
        </ul>
      </div>
    );
  }
}

// Falcor queries
VideoComments.queries = {
  video() {
    return [
      [ 'comments', { from: 0, length: 5 }, [ 'comment', 'addedDate' ] ],
      [ 'comments', { from: 0, length: 5 }, 'author', [ 'firstName', 'lastName', 'email', 'userId' ] ]
    ];
  }
};

// Prop validation
VideoComments.propTypes = {
  video: PropTypes.object.isRequired
};

export default VideoComments;