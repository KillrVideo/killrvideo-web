import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getStatusUpdates, unload } from 'actions/upload-status';

import { Alert } from 'react-bootstrap';

class VideoUploadStatus extends Component {
  componentDidMount() {
    // Start receiving status updates
    this.props.getStatusUpdates(this.props.videoId);
  }
  
  componentDidUpdate(prevProps) {
    // If the video Id changes, start over with new video Id
    if (this.props.videoId !== prevProps.videoId) {
      this.props.getStatusUpdates(this.props.videoId);
    }
  }
  
  componentWillUnmount() {
    this.props.unload();
  }
  
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
  
  // Actions
  getStatusUpdates: PropTypes.func.isRequired,
  unload: PropTypes.func.isRequired
};

// Map redux state to component props
function mapStateToProps(state) {
  return state.uploadStatus;
}

// Export connected component
export default connect(mapStateToProps, { getStatusUpdates, unload })(VideoUploadStatus);