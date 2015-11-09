import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import VideoPreviewList from 'components/videos/video-preview-list';

class Home extends Component {
  render() {
    let recommendedVideos, userVideos;
    if (this.props.currentUser.isLoggedIn) {
      recommendedVideos = <VideoPreviewList title="Recommended for You" list="suggestedVideos" />;
      userVideos = <VideoPreviewList title="My Videos" list="myVideos" />;
    }
    
    return (
      <div>
        <VideoPreviewList title="Recent Videos" list="recentVideos" />
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