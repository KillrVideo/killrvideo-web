import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { ProgressBar } from 'react-bootstrap';

class UploadProgress extends Component {
  render() {
    const { statusMessage, statusMessageStyle, percentComplete } = this.props;
    
    return (
      <div>
        <span className={`text-${statusMessageStyle} text-uppercase small`}>{statusMessage}</span><br/>
        <ProgressBar now={percentComplete} bsStyle={statusMessageStyle} />
      </div>
    );
  }
}

// Prop validation
UploadProgress.propTypes = {
  // Redux state
  statusMessage: PropTypes.string.isRequired,
  statusMessageStyle: PropTypes.string.isRequired,
  percentComplete: PropTypes.number.isRequired
};

// Map redux state to component props
function mapStateToProps(state) {
  const { addVideo: { upload: { statusMessage, statusMessageStyle, percentComplete } } } = state;
  return {
    statusMessage,
    statusMessageStyle,
    percentComplete
  };
};

export default connect(mapStateToProps)(UploadProgress);