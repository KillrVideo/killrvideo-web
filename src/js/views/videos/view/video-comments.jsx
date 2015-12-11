import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import { range } from 'lodash';

import Icon from 'components/shared/icon';
import UserProfileLink from 'components/users/user-profile-link';
import UserProfileImage from 'components/users/user-profile-image';

// Helper function that renders a single comment
function renderComment(c) {
  return (
    <li className="clearfix" key={c.commentId}>
      <UserProfileLink userId={c.author.userId} className="pull-left">
        <UserProfileImage email={c.author.email} className="small img-circle" />
      </UserProfileLink>
      <UserProfileLink userId={c.author.userId}>
        {c.author.firstName + ' ' + c.author.lastName}
      </UserProfileLink> <span className="text-muted">{moment(c.addedDate).fromNow()}</span><br/>
      
      {c.comment}
    </li>
  );
}

// Displays the comments on a video
class VideoComments extends Component {
  render() {
    const {
      comments: { data, isLoading, moreDataOnServer, currentPageIndex, pagingConfig, nextPageDisabled },
      addedComments: { comments: addedData },
      showMoreComments
    } = this.props;
    
    // See if we need to show the "Show more comments" button
    const commentsToShow = currentPageIndex + pagingConfig.recordsPerPage;
    
    let moreCommentsButton;
    if (nextPageDisabled === false || isLoading) {
      let loadingIcon;
      if (isLoading) {
        loadingIcon = (<Icon name="cog" animate="spin" />);
      }
      
      moreCommentsButton = (
        <li className="clearfix">
          <Button bsStyle="default" block onClick={showMoreComments} disabled={isLoading}>
             {loadingIcon} Show more comments
          </Button>
        </li>
      );
    }
    
    // Render the comments
    return (
      <div id="view-video-comments">
        <h5>Latest Comments</h5>
        <ul className="video-comments list-unstyled">
          {addedData.map(c => renderComment(c))}
          {range(0, commentsToShow).map(idx => {
            if (idx >= data.length) return;
            return renderComment(data[idx]);
          })}
          {moreCommentsButton}
        </ul>
      </div>
    );
  }
}

// Falcor queries
VideoComments.queries = {
  comments() {
    return [
      [ [ 'commentId', 'comment', 'addedDate' ] ],
      [ 'author', [ 'firstName', 'lastName', 'email', 'userId' ] ]
    ];
  }
};

// Prop validation
VideoComments.propTypes = {
  comments: PropTypes.object.isRequired,
  addedComments: PropTypes.object.isRequired,
  
  // Actions
  showMoreComments: PropTypes.func.isRequired
};

export default VideoComments;