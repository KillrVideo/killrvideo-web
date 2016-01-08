import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { uploadVideo, clearVideoSelection } from 'actions/add-uploaded-video';

import { Alert, Row, Col, ProgressBar, Button } from 'react-bootstrap';

import Input from 'components/shared/input';
import Icon from 'components/shared/icon';
import UploadFileSelector from './upload-file-selector';

// Component for when current browser doesn't support APIs needed for uploading a video
class AddUploadedVideoNotSupported extends Component {
  render() {
    return (
      <Alert bsStyle="danger">
        Sorry, upload is not currently supported by this browser or device.
      </Alert>
    );
  }
}

// Inputs needed to add a new uploaded video
class AddUploadedVideo extends Component {
  doReset() {
    this.props.clearVideoSelection();
    this.props.resetForm();
  }
  
  doUpload() {
    this.props.uploadVideo(this.props.fields.uploadFile.value);
  }
  
  componentDidUpdate(prevProps) {
    // If we get a valid file, start the upload
    if (this.props.fields.uploadFile.valid && prevProps.fields.uploadFile.invalid) {
      this.doUpload();
    }
  }
    
  render() {
    const { fields: { uploadFile }, statusMessage, statusMessageStyle, percentComplete } = this.props;
    const fileName = uploadFile.valid ? uploadFile.value.name : '';
    
    const resetButton = (
      <Button type="reset" key="reset" title="Reset video selection" onClick={() => this.doReset()}>
        <Icon name="times" title="Reset video selection" />
      </Button>
    );
    
    const retryButton = (
      <Button type="button" key="retry" title="Retry upload" bsStyle="primary" onClick={() => this.doUpload()}>
        <Icon name="refresh" title="Retry upload" />
      </Button>
    );
    
    // If there is an error, include the retry button
    const buttonsAfter = statusMessageStyle === 'danger'
      ? [ resetButton, retryButton ]
      : [ resetButton ];
    
    return (
      <form>
        <Input {...uploadFile} wrapperClassName={uploadFile.valid ? 'hidden' : undefined}>
          <UploadFileSelector {...uploadFile} />
        </Input>
        <Row className={uploadFile.invalid ? 'hidden' : undefined}>
          <Col xs={12}>
            <Input type="text" label="Video File" value={fileName} buttonAfter={buttonsAfter} disabled />
          </Col>
        </Row>
        <Row className={uploadFile.invalid ? 'hidden' : undefined}>
          <Col xs={12}>
            <span className={`text-${statusMessageStyle} text-uppercase small`}>{statusMessage}</span><br/>
            <ProgressBar now={percentComplete} bsStyle={statusMessageStyle} />
          </Col>
        </Row>
      </form>
    );
  }
}

// Prop validation
AddUploadedVideo.propTypes = {
  // Redux state
  uploadUrl: PropTypes.string,
  statusMessage: PropTypes.string.isRequired,
  statusMessageStyle: PropTypes.string.isRequired,
  percentComplete: PropTypes.number.isRequired,
  
  // From redux-form
  fields: PropTypes.object.isRequired,
  resetForm: PropTypes.func.isRequired,
  
  // Actions
  uploadVideo: PropTypes.func.isRequired,
  clearVideoSelection: PropTypes.func.isRequired
};

// Map redux state to props
function mapStateToProps(state) {
  const { 
    addVideo: { 
      sourceSpecific: { 
        statusMessage,
        statusMessageStyle,
        percentComplete
      }
    }
  } = state;
  
  return {
    statusMessage,
    statusMessageStyle,
    percentComplete
  };
}

// Wrap component with redux form
const AddUploadedVideoForm = connect(mapStateToProps, { uploadVideo, clearVideoSelection })(AddUploadedVideo);

// Export the appropriate component based on whether upload is supported
const uploadSupported = global.File && global.FileReader && global.FileList && global.Blob;
const exportedComponent = uploadSupported ? AddUploadedVideoForm : AddUploadedVideoNotSupported;
export default exportedComponent;