import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import VideoPreviewList from 'components/videos/video-preview-list';

class Home extends Component {
  render() {
    let recommendedVideos, userVideos;
    if (this.props.currentUser.isLoggedIn) {
      recommendedVideos = <VideoPreviewList title="Recommended for You" list={VideoPreviewList.lists.suggestedVideos} />;
      userVideos = <VideoPreviewList title="My Videos" list={VideoPreviewList.lists.myVideos} />;
    }
    
    return (
      <div>
        <VideoPreviewList title="Recent Videos" list={VideoPreviewList.lists.recentVideos} />
        {recommendedVideos}
        {userVideos}
      </div>
    );
  }
}

// Prop validation
Home.propTypes = {
  currentUser: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  const { authentication: { currentUser } } = state;
  return {
    currentUser
  };
}

export default connect(mapStateToProps)(Home);