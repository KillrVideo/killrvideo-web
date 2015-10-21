import React, { Component, PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

class VideoUploadStatus extends Component {
  render() {
    return (
      <Alert bsStyle="danger">
        TODO: Status on uploaded video processing.
      </Alert>
    );
  }
}

// Prop validation
VideoUploadStatus.propTypes = {
  videoId: PropTypes.string.isRequired,
  status: PropTypes.string
};

export default VideoUploadStatus;