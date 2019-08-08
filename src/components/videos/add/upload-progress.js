
import React from 'react';
import { connect } from 'react-redux';

import { ProgressBar } from 'react-bootstrap';

class UploadProgress extends React.Component {
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