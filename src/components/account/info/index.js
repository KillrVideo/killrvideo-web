
import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'react-bootstrap';
import { isUndefined } from 'lodash';
import { routeActions } from 'react-router-redux';

import { load, unload, showMoreComments, videosNextPage, videosPreviousPage } from 'actions/account-info';
import Icon from 'components/shared/icon';
import UserProfile from './user-profile';
import UserComments from './user-comments';
import UserVideos from './user-videos';

// Styles needed by the view
require('account-info.css');

class AccountInfo extends React.Component {
  componentDidMount() {
    this.props.load(this.props.userId, AccountInfo.queries.user(), AccountInfo.queries.comments(), AccountInfo.queries.videos());
  }
  
  componentDidUpdate(prevProps) {
    // If the user id changes, we need to reload
    if (prevProps.userId !== this.props.userId) {
      this.props.load(this.props.userId, AccountInfo.queries.user(), AccountInfo.queries.comments(), AccountInfo.queries.videos());
    }
  }
  
  componentWillUnmount() {
    this.props.unload();
  }
  
  render() {
    const { userId, accountInfo: { user, comments, videos }, showMoreComments, videosNextPage, videosPreviousPage } = this.props;
    
    return (
      <div id="user-profile" className="body-content container">
        <Row>
          <Col id="user-profile-col" md={5}>
            <h3>
              <Icon name="info-circle" /> Profile
            </h3>
            
            <UserProfile user={user} />
            
            <h3>
              <Icon name="comments" /> Latest Comments
            </h3>
            
            <UserComments comments={comments} showMoreComments={showMoreComments} />
          </Col>
          <Col md={7}>
            <h3>
              <Icon name="video-camera" /> {isUndefined(userId) ? 'My' : undefined} Videos
            </h3>
            
            <p className={isUndefined(userId) ? undefined : 'hidden'}>
              <Button bsStyle="success" onClick={() => this.gotoAddVideo()}>
                <Icon name="plus-circle" /> Add a Video
              </Button>
            </p>
            
            <UserVideos videos={videos} nextPage={videosNextPage} previousPage={videosPreviousPage} />
          </Col>
        </Row>
      </div>
    );
  }
}


// Falcor queries
AccountInfo.queries = {
  user: UserProfile.queries.user,
  comments: UserComments.queries.comments,
  videos: UserVideos.queries.videos
};

// Map redux state to component props
function mapStateToProps(state, ownProps) {
  return {
    userId: ownProps.params.userId,
    accountInfo: state.accountInfo
  };
}

// Connect to redux and export
export default connect(mapStateToProps, {
  load, 
  unload, 
  showMoreComments, 
  videosNextPage, 
  videosPreviousPage,
})(AccountInfo);