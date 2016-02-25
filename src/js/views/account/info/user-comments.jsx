import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { isUndefined, range } from 'lodash';
import moment from 'moment';
import GeminiScrollbar from 'react-gemini-scrollbar';

import LoadingSpinner from 'components/shared/loading-spinner';
import Icon from 'components/shared/icon';


class UserComments extends Component {
  render() {
    const { data: comments, isLoading, moreDataOnServer, currentPageIndex, pagingConfig, nextPageDisabled } = this.props.comments;
    
    const commentsToShow = currentPageIndex + pagingConfig.recordsPerPage;
    
    let moreCommentsButton;
    if (nextPageDisabled === false || isLoading) {
      let loadingIcon;
      if (isLoading) {
        loadingIcon = (<Icon name="cog" animate="spin" />);
      }
      
      moreCommentsButton = (
        <li className="clearfix">
          <Button bsStyle="default" block onClick={() => this.props.showMoreComments(UserComments.queries.comments())} disabled={isLoading}>
             {loadingIcon} Show more comments
          </Button>
        </li>
      );
    }
    
    return (
      <GeminiScrollbar id="user-comments">
        <ul className="list-unstyled">
          {range(0, commentsToShow).map(idx => {
            if (idx >= comments.length) return;
            
            const c = comments[idx];
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
      </GeminiScrollbar>
    );
  }
}

// Prop validation
UserComments.propTypes = {
  comments: PropTypes.object.isRequired,
  showMoreComments: PropTypes.func.isRequired
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