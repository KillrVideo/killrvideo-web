import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { validateForm } from 'lib/validation';
import { uploadVideo, cancelUpload } from 'actions/add-uploaded-video';

import { Alert, Row, Col, ProgressBar, Button } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import Input from 'components/shared/input';
import Icon from 'components/shared/icon';

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
  handleDropzoneKeys(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.refs.dropzone.open();
      e.preventDefault();
    }
  }
  
  handleDropzoneDrop(files) {
    this.props.fields.uploadFile.onChange(files[0]);
  }
  
  componentDidUpdate(prevProps) {
    // Once we have a valid file, start the upload
    if (prevProps.fields.uploadFile.invalid && this.props.fields.uploadFile.valid) {
      this.props.handleSubmit();
    }
  }
  
  render() {
    const { fields: { uploadFile }, statusMessage, statusMessageStyle, percentComplete } = this.props;
    const fileName = uploadFile.valid ? uploadFile.value.name : '';
    
    const resetButton = (
      <Button type="reset" title="Reset video selection">
        <Icon name="times" title="Reset video selection" />
      </Button>
    );
    
    return (
      <form>
        <Input {...uploadFile} wrapperClassName={uploadFile.valid ? 'hidden' : undefined}>
          <Dropzone multiple={false} tabIndex="0" className="add-video-upload-drop" activeClassName="active" ref="dropzone"
                    onDrop={files => this.handleDropzoneDrop(files)} onFocus={uploadFile.onFocus}
                    onBlur={uploadFile.onBlur} onKeyPress={e => this.handleDropzoneKeys(e)}>
            <div>
              <Icon name="file-video-o" size="4x" /><br/>
              Drag and drop a file to upload<br/>
              <span className="text-muted">Or click to choose a file</span>
            </div>
          </Dropzone>
        </Input>
        <Row className={uploadFile.invalid ? 'hidden' : undefined}>
          <Col xs={12}>
            <Input type="text" label="Video File" value={fileName} buttonAfter={resetButton} disabled />
          </Col>
        </Row>
        <Row className={uploadFile.invalid ? 'hidden' : undefined}>
          <Col xs={8}>
            <span className={`text-${statusMessageStyle} text-uppercase small`}>{statusMessage}</span><br/>
            <ProgressBar now={percentComplete} bsStyle={statusMessageStyle} />
          </Col>
          <Col xs={2} className="add-video-upload-progress">
            {percentComplete}%
          </Col>
          <Col xs={2} className="text-right add-video-upload-buttons">
            <Icon name="refresh" title="Retry upload" />
            <Icon name="stop" title="Cancel upload" />
            
          </Col>
        </Row>
      </form>
    );
  }
}

// Prop validation
AddUploadedVideo.propTypes = {
  // Redux state
  statusMessage: PropTypes.string.isRequired,
  statusMessageStyle: PropTypes.string.isRequired,
  percentComplete: PropTypes.number.isRequired,
  
  // From redux-form
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  
  // Actions
  cancelUpload: PropTypes.func.isRequired
};

// Validation constraints
const constraints = {
  uploadFile: {
    presence: { message: '^Please select a video to upload' },
    fileMaxSize: { message: '^Video is too large, please select a smaller video', size: 1073741824 }  // Support uploads of up to 1 GB
  }
};

// Map redux state to props
function mapStateToProps(state) {
  const { addVideo: { upload } } = state;
  return {
    ...upload
  };
}

// Wrap component with redux form
const AddUploadedVideoForm = reduxForm({
  form: 'addUploadedVideo',
  fields: [ 'uploadFile' ],
  validate(vals) {
    return validateForm(vals, constraints);
  }
}, mapStateToProps, { onSubmit: uploadVideo, cancelUpload })(AddUploadedVideo);

// Export the appropriate component based on whether upload is supported
const uploadSupported = global.File && global.FileReader && global.FileList && global.Blob;
const exportedComponent = uploadSupported ? AddUploadedVideoForm : AddUploadedVideoNotSupported;
export default exportedComponent;