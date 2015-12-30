import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { validateForm } from 'lib/validation';

import { Alert } from 'react-bootstrap';
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
  render() {
    const { fields: { uploadFile } } = this.props;
    
    return (
      <div>
        <Input {...uploadFile}>
          <Dropzone multiple={false} tabIndex="0" className="add-video-upload-drop" activeClassName="active"
                    onDrop={files => uploadFile.onChange(files[0])} onFocus={uploadFile.onFocus}
                    onBlur={uploadFile.onBlur}>
            <div>
              <Icon name="file-video-o" size="4x" /><br/>
              Drag and drop a file to upload<br/>
              <span className="text-muted">Or click to choose a file</span>
            </div>
          </Dropzone>
        </Input>
      </div>
    );
  }
}

// Prop validation
AddUploadedVideo.propTypes = {
  fields: PropTypes.object.isRequired
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
  return {};
}

// Wrap component with redux form
const AddUploadedVideoForm = reduxForm({
  form: 'addUploadedVideo',
  fields: [ 'uploadFile' ],
  validate(vals) {
    return validateForm(vals, constraints);
  }
}, mapStateToProps, {})(AddUploadedVideo);

// Export the appropriate component based on whether upload is supported
const uploadSupported = global.File && global.FileReader && global.FileList && global.Blob;
const exportedComponent = uploadSupported ? AddUploadedVideoForm : AddUploadedVideoNotSupported;
export default exportedComponent;