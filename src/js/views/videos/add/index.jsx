import React, { Component, PropTypes } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import validate from 'validate.js';

import VideoLocationTypes from 'lib/video-location-types';
import ViewVideoLink from 'components/videos/view-video-link';
import SourceSelector from './source-selector';
import Input from 'components/shared/input';
import AddYouTubeVideo from './add-youtube-video';
import AddUploadedVideo from './add-uploaded-video';

class AddVideo extends Component {
  handleLocationTypeChange(newVal) {
    // When location type changes, reset the form first
    this.props.resetForm();
    this.props.fields.locationType.onChange(newVal);
  }
  
  componentDidUpdate(prevProps) {
    // If common details go from hidden to shown, focus the Name input
    if (prevProps.showCommonDetails === false && this.props.showCommonDetails) {
      this.refs.nameInput.focus();
    }
  }
  
  render() {
    const { 
      videoId,
      showCommonDetails,
      fields,
    } = this.props;
    
    // Center columns until we're showing the common video details column
    const columnPush = showCommonDetails === false ? 3 : undefined;
    
    let successAlert;
    if (videoId !== null) {
      successAlert = (
        <Alert bsStyle="success">
          Your video has successfully been added. <ViewVideoLink videoId={videoId} className="alert-link">Click here</ViewVideoLink> to view it.
        </Alert>
      );
    }
    
    let selectedSourceInput;
    switch(fields.locationType.value) {
      case VideoLocationTypes.YOUTUBE:
        selectedSourceInput = <AddYouTubeVideo />;
        break;
      case VideoLocationTypes.UPLOAD:
        selectedSourceInput = <AddUploadedVideo />;
        break;
    }
    
    return (
      <div id="video-add">
        <Row>
          <Col sm={6} smPush={columnPush}>
            <h3><em>Add</em> Video</h3>
            
            {/*TODO: UiMessages? */}
            
            {successAlert}
          </Col>
        </Row>
        <Row>
          {/* Source selection and source-specific form */}
          <Col sm={6} smPush={columnPush}>
            <Input {...fields.locationType} label="Source">
              <SourceSelector {...fields.locationType} onChange={newVal => this.handleLocationTypeChange(newVal)} />
            </Input>
            
            {selectedSourceInput}
          </Col>
          {/* Common video details */}
          <Col sm={6} className={showCommonDetails === false ? 'hidden' : ''}>
            <Input {...fields.name} type="text" placeholder="Video name" label="Name" ref="nameInput" />
            <Input {...fields.description} type="textarea" placeholder="Video description" label="Description" />
            <Input {...fields.tags} type="text" label="Tags" />
          </Col>
        </Row>
      </div>
    );
  }
}

// Prop validation
AddVideo.propTypes = {
  // From redux state
  videoId: PropTypes.string,
  showCommonDetails: PropTypes.bool.isRequired,
  
  // From redux form
  fields: PropTypes.object.isRequired,
  resetForm: PropTypes.func.isRequired
};

// Map redux store state to component props
function mapStateToProps(state) {
  const { addVideo: { common } } = state;
  return {
    ...common
  };
}

export default reduxForm({ 
  form: 'addVideo',
  fields: [ 'locationType', 'name', 'description', 'tags', 'location' ],
  initialValues: {
    locationType: VideoLocationTypes.UPLOAD,
    name: '',
    description: '',
    tags: '',
    location: ''
  }
}, mapStateToProps)(AddVideo);