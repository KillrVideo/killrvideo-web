import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getVideo } from 'actions/view-video';

import VideoPlayer from 'components/videos/video-player';
import VideoPreviewList from 'components/videos/video-preview-list';
import VideoRatingSharing from 'components/videos/video-rating-sharing';

class ViewVideo extends Component {
  componentDidMount() {
    // Get the video once mounted
    this.props.getVideo(ViewVideo.queries.video(this.props.videoId));
  }
  
  componentWillReceiveProps(nextProps) {
    // If the video id changes, we need to get the video again
    if (this.props.videoId !== nextProps.videoId) {
      this.props.getVideo(ViewVideo.queries.video(nextProps.videoId));
    }
  }
  
  render() {
    const video = this.props.viewVideo.video;
    const ratingEnabled = !!this.props.loggedInUser;
    
    return (
      <div>
        <Row>
          <Col md={7} xs={12} id="view-video-embed">
            <VideoPlayer video={video} />
          </Col>
          <Col md={5} xs={12} id="view-video-details">
            { /* TODO: Scrollable video details */ }
            <div>
              <Row>
                <Col xs={8}>
                  <h4 id="view-video-title">{video.name}</h4>
                </Col>
                <Col xs={4} className="text-red text-right">
                  {video.views} <span className="small text-muted">views</span>
                </Col>
              </Row>
              
              { /* Star ratings and sharing */ }
              <VideoRatingSharing video={video} ratingEnabled={ratingEnabled} />
            </div>
            
          </Col>
        </Row>
        <VideoPreviewList title="More Videos Like This" list="recentVideos" />
      </div>
    );
  }
}

ViewVideo.queries = {
  video(videoId) {
    const videoPath = ['videosById', videoId];
    const videoPlayerQueries = VideoPlayer.queries.video(videoPath);
    const videoRatingQueries = VideoRatingSharing.queries.video(videoPath);
    return [
      // The queries from other components
      ...videoPlayerQueries,
      ...videoRatingQueries,
      // The queries for the data we need in this view
      [ ...videoPath, [ 'name', 'description', 'views' ] ]
    ];
  }
};

// Prop validation
ViewVideo.propTypes = {
  // From the router parameter (based on URL)
  videoId: PropTypes.string.isRequired,
  // From redux
  video: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    loggedInUser: state.loggedInUser,
    videoId: state.router.params.videoId,
    viewVideo: state.viewVideo
  };
}

export default connect(mapStateToProps, { getVideo })(ViewVideo);