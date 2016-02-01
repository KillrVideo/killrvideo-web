import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as HomeActions from 'actions/home';

import VideoPreviewList from 'components/videos/video-preview-list';

class Home extends Component {
  render() {
    const { 
      currentUser, recentVideos, recommendedVideos, myVideos,
      recentVideosActions, recommendedVideosActions, myVideosActions 
    } = this.props;
    
    let recommendedVideosList, userVideosList;
    if (currentUser.isLoggedIn) {
      recommendedVideosList = <VideoPreviewList title="Recommended for You" {...recommendedVideos} {...recommendedVideosActions} />;
      userVideosList = <VideoPreviewList title="My Videos" {...myVideos} {...myVideosActions} />;
    }
    
    return (
      <div className="body-content container">
        <VideoPreviewList title="Recent Videos" {...recentVideos} {...recentVideosActions} />
        {recommendedVideosList}
        {userVideosList}
      </div>
    );
  }
}

// Prop validation
Home.propTypes = {
  // State from redux store
  currentUser: PropTypes.object.isRequired,
  recentVideos: PropTypes.object.isRequired,
  recommendedVideos: PropTypes.object.isRequired,
  myVideos: PropTypes.object.isRequired,
  
  // Actions
  recentVideosActions: PropTypes.object.isRequired,
  recommendedVideosActions: PropTypes.object.isRequired,
  myVideosActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  const { authentication: { currentUser }, home: { recentVideos, recommendedVideos, myVideos } } = state;
  return {
    currentUser,
    recentVideos,
    recommendedVideos,
    myVideos
  };
}

function mapDispatchToProps(dispatch) {
  return {
    recentVideosActions: bindActionCreators(HomeActions.recentVideos, dispatch),
    recommendedVideosActions: bindActionCreators(HomeActions.recommendedVideos, dispatch),
    myVideosActions: bindActionCreators(HomeActions.myVideos, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);