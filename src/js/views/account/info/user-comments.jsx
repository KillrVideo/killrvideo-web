import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { isUndefined } from 'lodash';
import moment from 'moment';

import LoadingSpinner from 'components/shared/loading-spinner';
import Icon from 'components/shared/icon';

class UserComments extends Component {
  render() {
    const { comments, isLoading, moreCommentsAvailable } = this.props.comments;
    
    if (isLoading) {
      return <LoadingSpinner />
    }
    
    let moreCommentsButton;
    if (moreCommentsAvailable) {
      moreCommentsButton = (
        <li className="clearfix">
          <Button bsStyle="default" block onClick={() => this.props.loadMoreComments()}>
            <Icon name="cog" animate="spin" /> Load more comments
          </Button>
        </li>
      );
    }
    
    return (
      <ul className="user-comments list-unstyled">
        {comments.map(c => {
          return (
            <li className="clearfix" key={c.commentId}>
              <div className="pull-left text-center">
                <Link to={`/view/${c.video.videoId}`}>
                  <img src={c.video.previewImageLocation} />
                </Link>
              </div>
              {c.comment}<br/>
              <small className="text-muted">
                on <Link to={`/view/${c.video.videoId}`}>{c.video.name}</Link> {moment(c.addedDate).fromNow()}
              </small>
            </li>
          );
        })}
        {moreCommentsButton}
      </ul>
    );
  }
}

// Prop validation
UserComments.propTypes = {
  comments: PropTypes.object.isRequired,
  loadMoreComments: PropTypes.func.isRequired
};

// Falcor queries
UserComments.queries = {
  comments() {
    return [
      // comments[0..4][ "commentId"...]
      [ [ 'commentId', 'comment', 'addedDate' ] ],
      // comments[0..4].video[ "videoId"...]
      [ 'video', [ 'videoId', 'name', 'previewImageLocation' ] ]
    ];
  }
};

export default UserComments;