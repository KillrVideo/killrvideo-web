import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import { isUndefined, map } from 'lodash';

import Icon from 'components/shared/icon';
import UserProfileLink from 'components/users/user-profile-link';
import UserProfileImage from 'components/users/user-profile-image';

// Displays the comments on a video
class VideoComments extends Component {
  getComments() {
    const comments = this.props.comments;
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
    // See if we need to show the "Load more comments" button
    let loadMoreButton, icon;
    if (this.props.moreCommentsAvailable) {
      let icon;
      if (this.props.commentsLoading) {
        icon = <Icon name="cog" animate="spin" />
      }
      
      loadMoreButton = (
        <Button bsStyle="default" className="clearfix" block disabled={this.props.commentsLoading} 
                onClick={() => this.props.loadMoreComments()}>
          {icon} Load more comments
        </Button>
      );
    }
    
    // Render the comments
    return (
      <div id="view-video-comments">
        <h5>Latest Comments</h5>
        <ul className="video-comments list-unstyled">
          {this.getComments()}
        </ul>
        {loadMoreButton}
      </div>
    );
  }
}

// Falcor queries
VideoComments.queries = {
  comments() {
    return [
      [ [ 'comment', 'addedDate' ] ],
      [ 'author', [ 'firstName', 'lastName', 'email', 'userId' ] ]
    ];
  }
};

// Prop validation
VideoComments.propTypes = {
  comments: PropTypes.object.isRequired,
  commentsLoading: PropTypes.bool.isRequired,
  moreCommentsAvailable: PropTypes.bool.isRequired,
  
  // Actions
  loadMoreComments: PropTypes.func.isRequired
};

export default VideoComments;