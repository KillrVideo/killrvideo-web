
import React from 'react';
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

import { unload } from 'actions/add-video';

// Styles needed by the view
require('add-video.css');

class AddVideo extends React.Component {
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
      asyncValidate,
      untouchAll,
      handleSubmit,
      submitting,
      error
    } = this.props;
    
    // Center columns until we're showing the common video details column
    const columnPush = showCommonDetails === false || addedVideoId !== null ? 3 : undefined;
    const headerCols = showCommonDetails === false || addedVideoId !== null ? 6 : 12;
    
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
      <div id="video-add" className="body-content container">
        <Row>
          <Col sm={headerCols} smPush={columnPush}>
            <h3><em>Add</em> Video</h3>
            
            <Alert bsStyle="danger" className={error ? undefined : 'hidden'}>{error}</Alert>
            
            {successAlert}
          </Col>
        </Row>
        <Row className={addedVideoId !== null ? 'hidden' : undefined}>
          {/* Source selection and source-specific form */}
          <Col sm={6} smPush={columnPush}>
            <Input label="Source">
              <SourceSelector />
            </Input>
            
            <SourceSpecificComponent fields={fields} resetForm={resetForm} asyncValidate={asyncValidate}
                                     untouchAll={untouchAll} />
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
}, mapStateToProps, { unload })(AddVideo);