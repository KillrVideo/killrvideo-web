import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import VideoPlayer from 'components/videos/video-player';
import VideoPreviewList from 'components/videos/video-preview-list';

class ViewVideo extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col md={7} xs={12} id="view-video-embed">
            <VideoPlayer video={this.props.video} />
          </Col>
          <Col md={5} xs={12} id="view-video-details">
          </Col>
        </Row>
        <VideoPreviewList title="More Videos Like This" list="recentVideos" />
      </div>
    );
  }
}

// Prop validation
ViewVideo.propTypes = {
  videoId: PropTypes.string.isRequired,
  video: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    videoId: state.router.params.videoId,
    video: state.viewVideo.video
  };
}

export default connect(mapStateToProps)(ViewVideo);