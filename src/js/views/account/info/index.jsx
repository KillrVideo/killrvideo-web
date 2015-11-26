import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'react-bootstrap';
import { isUndefined } from 'lodash';
import { pushState } from 'react-router';

import { load, unload, loadMoreComments, videosNextPageClick, videosPreviousPageClick } from 'actions/account-info';
import Icon from 'components/shared/icon';
import UserProfile from './user-profile';
import UserComments from './user-comments';
import UserVideos from './user-videos';

class AccountInfo extends Component {
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
  
  gotoAddVideo() {
    this.props.pushState(null, '/videos/add');
  }
  
  render() {
    const { userId, accountInfo: { user, comments, videos }, loadMoreComments, videosNextPageClick, videosPreviousPageClick } = this.props;
    
    return (
      <Row>
        <Col md={5}>
          <h3>
            <Icon name="info-circle" /> Profile
          </h3>
          
          <UserProfile user={user} />
          
          <h3>
            <Icon name="comments" /> Latest Comments
          </h3>
          
          <UserComments comments={comments} loadMoreComments={this.props.loadMoreComments} />
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
          
          <UserVideos videos={videos} nextPageClick={videosNextPageClick} previousPageClick={videosPreviousPageClick} />
        </Col>
      </Row>
    );
  }
}

// Prop validation
AccountInfo.propTypes = {
  // From router
  userId: PropTypes.string,
  // From state
  accountInfo: PropTypes.object.isRequired,
  // Actions
  load: PropTypes.func.isRequired, 
  unload: PropTypes.func.isRequired, 
  loadMoreComments: PropTypes.func.isRequired, 
  videosNextPageClick: PropTypes.func.isRequired, 
  videosPreviousPageClick: PropTypes.func.isRequired,
  pushState: PropTypes.func.isRequired
};

// Falcor queries
AccountInfo.queries = {
  user: UserProfile.queries.user,
  comments: UserComments.queries.comments,
  videos: UserVideos.queries.videos
};

// Map redux state to component props
function mapStateToProps(state) {
  return {
    userId: state.router.params.userId,
    accountInfo: state.accountInfo
  };
}

// Connect to redux and export
export default connect(mapStateToProps, {
  load, 
  unload, 
  loadMoreComments, 
  videosNextPageClick, 
  videosPreviousPageClick, 
  pushState 
})(AccountInfo);