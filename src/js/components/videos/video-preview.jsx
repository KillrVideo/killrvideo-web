import React, { Component, PropTypes } from 'react';

// Component for rendering a video preview
class VideoPreview extends Component {
  render() {
    return (
      <div>Video Here</div>
    );
  }
}

// Prop validation
VideoPreview.propTypes = {
  video: PropTypes.object.isRequired,
  onClick: PropTypes.func
};

export default VideoPreview;