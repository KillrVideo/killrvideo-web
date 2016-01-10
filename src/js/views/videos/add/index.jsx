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
import Icon from 'components/shared/icon'

import { setSource, unload } from 'actions/add-video';

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
  
  componentWillUnmount() {
    this.props.unload();
  }
  
  render() {
    const {
      addedVideoId,
      showCommonDetails,
      videoLocationType,
      fields,
      resetForm,
      handleSubmit,
      submitting
    } = this.props;
    
    // Center columns until we're showing the common video details column
    const columnPush = showCommonDetails === false || addedVideoId !== null ? 3 : undefined;
    
    let successAlert;
    if (addedVideoId !== null) {
      successAlert = (
        <Alert bsStyle="success">
          Your video has successfully been added. <ViewVideoLink videoId={addedVideoId} className="alert-link">Click here</ViewVideoLink> to view it.
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
        <Row className={addedVideoId !== null ? 'hidden' : undefined}>
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
            <Button type="button" bsStyle="primary" onClick={handleSubmit} disabled={submitting}>
              <Icon name="cog" animate="spin" className={submitting ? undefined : 'hidden'} /> Add Video
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
  addedVideoId: PropTypes.string,
  showCommonDetails: PropTypes.bool.isRequired,
  videoLocationType: PropTypes.number.isRequired,
  
  // From redux form
  fields: PropTypes.object.isRequired,
  resetForm: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired
};

// Map redux store state to component props
function mapStateToProps(state) {
  // Figure out which source is currently selected
  const { addVideo: { videoLocationType } } = state;
  let sourceState;
  switch(videoLocationType) {
    case VideoLocationTypes.YOUTUBE:
      sourceState = state.addVideo.youTube;
      break;
    case VideoLocationTypes.UPLOAD:
      sourceState = state.addVideo.upload;
      break;
    default:
      throw new Error('Unknown source selected');
  }
  
  // Extract common properties that are in every source's state
  const { addedVideoId, showCommonDetails, form } = sourceState;
  
  return {
    addedVideoId,
    showCommonDetails,
    videoLocationType,
    ...form
  };
}

export default reduxForm({ 
  form: 'addVideo'
}, mapStateToProps, { setSource, unload })(AddVideo);