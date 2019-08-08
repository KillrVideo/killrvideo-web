
import React from 'react';
import { connect } from 'react-redux';
import { clearVideoSelection } from 'actions/add-uploaded-video';

import Dropzone from 'react-dropzone';
import { Alert, Row, Col, Button } from 'react-bootstrap';

import Input from 'components/shared/input';
import Icon from 'components/shared/icon';
import UploadProgress from './upload-progress';

// Component for when current browser doesn't support APIs needed for uploading a video
class AddUploadedVideoNotSupported extends React.Component {
  render() {
    return (
      <Alert bsStyle="danger">
        Sorry, uploading videos is not currently supported on this browser or device.
      </Alert>
    );
  }
}

// Inputs needed to add a new uploaded video
class AddUploadedVideo extends React.Component {
  doReset() {
    this.props.clearVideoSelection();
    this.props.fields.uploadFile.onChange(null);
    this.props.untouchAll();
  }
  
  doUpload() {
    this.props.asyncValidate();
  }
  
  handleDropzoneKeys(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.refs.dropzone.open();
      e.preventDefault();
    }
  }
  
  handleDropzoneDrop(files) {
    // Fire all input events on drop
    const file = files[0];
    this.props.fields.uploadFile.onFocus();
    this.props.fields.uploadFile.onChange(file);
    this.props.fields.uploadFile.onBlur(file);
  }
    
  render() {
    const { fields: { uploadFile }, statusMessageStyle } = this.props;
    const hasSelection = !!uploadFile.value;
    const fileName = hasSelection ? uploadFile.value.name : '';
    
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
    const buttonsAfter = uploadFile.invalid
      ? [ resetButton, retryButton ]
      : [ resetButton ];
      
    return (
      <form>
        <Row>
          <Col xs={12}>
            <Input {...uploadFile} groupClassName={hasSelection ? 'hidden' : undefined}>
              <Dropzone multiple={false} tabIndex="0" className="add-video-upload-drop" activeClassName="active" ref="dropzone"
                    onDrop={files => this.handleDropzoneDrop(files)} previewDisabled={true} 
                    onKeyPress={e => this.handleDropzoneKeys(e)}>
                <div>
                  <Icon name="file-video-o" size="4x" /><br/>
                  Drag and drop a file to upload<br/>
                  <span className="text-muted">Or click to choose a file</span>
                </div>
              </Dropzone>
            </Input>
            <Input type="text" label="Video File" value={fileName} buttonAfter={buttonsAfter} disabled 
                   groupClassName={hasSelection ? undefined : 'hidden'} error={uploadFile.error} 
                   touched={uploadFile.touched} />
          </Col>
        </Row>
        <Row className={hasSelection ? undefined : 'hidden'}>
          <Col xs={12}>
            <UploadProgress />
          </Col>
        </Row>
      </form>
    );
  }
}

function mapStateToProps(state) {
  const { addVideo: { upload: { statusMessageStyle } } } = state;
  return { statusMessageStyle };
}

// Wrap component with redux form
const AddUploadedVideoForm = connect(mapStateToProps, { clearVideoSelection })(AddUploadedVideo);

// Export the appropriate component based on whether upload is supported
const uploadSupported = global.File && global.FileReader && global.FileList && global.Blob;
const exportedComponent = uploadSupported ? AddUploadedVideoForm : AddUploadedVideoNotSupported;
export default exportedComponent;