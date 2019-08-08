import React from 'react';
import { connect } from 'react-redux';

import { getStatusUpdates, unload } from 'actions/upload-status';
import { updateVideoLocation } from 'actions/view-video';

import { Alert } from 'react-bootstrap';

// Component for showing the current status of an uploaded video
class VideoUploadStatus extends React.Component {
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
  
  setLocation() {
    this.props.updateVideoLocation(this.props.location);
  }
  
  render() {
    const { status, statusStyle, statusDate } = this.props;
    
    return (
      <div>
        <Alert bsStyle="info" className={statusStyle === 'info' ? undefined : 'hidden'}>
          Your video upload is currently <strong>{status}</strong> as of <strong>{statusDate}</strong>. This status will
          refresh automatically when there are any changes.
        </Alert>
        <Alert bsStyle="success" className={statusStyle === 'success' ? undefined : 'hidden'}>
          Your video upload has successfully processed. <a href="#" className="alert-link" onClick={() => this.setLocation()}>Click here</a> to
          view your video.
        </Alert>
        <Alert bsStyle="danger" className={statusStyle === 'danger' ? undefined : 'hidden'}>
          There was a problem processing your uploaded video. Please try uploading the video again.
        </Alert>
      </div>
    );
  }
}

// Map redux state to component props
function mapStateToProps(state) {
  return state.uploadStatus;
}

// Export connected component
export default connect(mapStateToProps, { getStatusUpdates, unload, updateVideoLocation })(VideoUploadStatus);