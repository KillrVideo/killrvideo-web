import React, { Component, PropTypes } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import VideoLocationTypes from 'lib/video-location-types';
import ViewVideoLink from 'components/videos/view-video-link';
import SourceSelector from './source-selector';
import Input from 'components/shared/input';
import TagsInput from './tags-input';
import AddYouTubeVideo from './add-youtube-video';
import AddUploadedVideo from './add-uploaded-video';

import { setSource } from 'actions/add-video';

class AddVideo extends Component {
  componentDidUpdate(prevProps) {
    // If location type changes, reset the form
    if (prevProps.videoLocationType !== this.props.videoLocationType) {
      this.props.resetForm();
    }
    
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
      resetForm,
      handleSubmit,
      videoLocationType
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
    
    let SourceSpecificComponent;
    switch(videoLocationType) {
      case VideoLocationTypes.YOUTUBE:
        SourceSpecificComponent = AddYouTubeVideo;
        break;
      case VideoLocationTypes.UPLOAD:
        SourceSpecificComponent = AddUploadedVideo;
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
            <Input label="Source">
              <SourceSelector value={videoLocationType} onChange={newVal => this.props.setSource(newVal)} />
            </Input>
            
            <SourceSpecificComponent fields={fields} resetForm={resetForm} />
          </Col>
          {/* Common video details */}
          <Col sm={6} className={showCommonDetails === false ? 'hidden' : ''}>
            <Input {...fields.name} type="text" placeholder="Video name" label="Name" ref="nameInput" />
            <Input {...fields.description} type="textarea" placeholder="Video description" label="Description" />
            <Input {...fields.tags} label="Tags" help="Press enter after each tag to add it to the list">
              <TagsInput {...fields.tags} placeholder="Video tags (keywords)" />
            </Input>
            <Button type="button" bsStyle="primary" onClick={handleSubmit}>
              Add Video
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

// Prop validation
AddVideo.propTypes = {
  // Common state from redux
  videoId: PropTypes.string,
  showCommonDetails: PropTypes.bool.isRequired,
  
  // Source-specific state from redux
  videoLocationType: PropTypes.number.isRequired,
  sourceSpecific: PropTypes.object.isRequired,
  
  // From redux form
  fields: PropTypes.object.isRequired,
  resetForm: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

// Map redux store state to component props
function mapStateToProps(state) {
  const { 
    addVideo: { 
      common, 
      sourceSpecific: {
        form,
        videoLocationType,
        ...sourceSpecific
      } 
    } 
  } = state;
  return {
    ...common,
    ...form,
    videoLocationType,
    sourceSpecific
  };
}

export default reduxForm({ 
  form: 'addVideo'
}, mapStateToProps, { setSource })(AddVideo);