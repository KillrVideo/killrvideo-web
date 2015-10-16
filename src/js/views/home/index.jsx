import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import VideoPreviewList from 'components/videos/video-preview-list';

class Home extends Component {
  render() {
    let recommendedVideos, userVideos;
    if (this.props.loggedInUser) {
      recommendedVideos = <VideoPreviewList title="Recommended for You" list="recommended" />;
      userVideos = <VideoPreviewList title="My Videos" list="mine" />;
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
  loggedInUser: PropTypes.object
};

function mapStateToProps(state) {
  const { loginState: { loggedInUser } } = state;
  return {
    loggedInUser
  };
}

export default connect(mapStateToProps)(Home);