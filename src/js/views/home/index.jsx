import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import VideoPreviewList from 'components/videos/video-preview-list';
import { getVideos, nextPage, previousPage } from 'actions/video-preview-list';

class Home extends Component {
  render() {
    let recommendedVideos, userVideos;
    if (this.props.loggedInUser) {
      recommendedVideos = <VideoPreviewList title="Recommended for You" videos={[]} />;
      userVideos = <VideoPreviewList title="My Videos" videos={[]} />;
    }
    
    return (
      <div>
        <VideoPreviewList title="Recent Videos" list="recentVideos" getVideos={this.props.getVideos} 
                          nextPage={this.props.nextPage} previousPage={this.props.previousPage} 
                          {...this.props.recentVideos} />
        {recommendedVideos}
        {userVideos}
      </div>
    );
  }
}

// Prop validation
Home.propTypes = {
  loggedInUser: PropTypes.object,
  recentVideos: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  const { loginState: { loggedInUser }, videoPreviewLists: { recentVideos } } = state;
  return {
    loggedInUser,
    recentVideos
  };
}

export default connect(mapStateToProps, { getVideos, nextPage, previousPage })(Home);