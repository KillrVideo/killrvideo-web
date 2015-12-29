import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { validate } from 'validate.js';
import { isUndefined } from 'lodash';

import parseYouTubeVideoId from 'lib/parse-youtube-video-id';
import Input from 'components/shared/input';
import Icon from 'components/shared/icon';
import { setYouTubeVideoSelection, clearYouTubeVideoSelection } from 'actions/add-youtube-video';

// Inputs needed for adding a YouTube video
class AddYouTubeVideo extends Component {
  doReset() {
    this.props.resetForm();
    this.props.clearYouTubeVideoSelection();
  }
  
  render() {
    const { fields: { youTubeUrl }, handleSubmit, submitting, videoId } = this.props;
    
    let buttonAfter;
    if (videoId === null) {
      buttonAfter = (
        <Button key="submit" type="submit" disabled={submitting}>
          <Icon name="cog" animate="spin" className={submitting ? undefined : 'hidden'} /> Get it
        </Button>
      );
    } else {
      buttonAfter = (
        <Button key="clear" type="reset" onClick={() => this.doReset()}>
          <Icon name="close" />
        </Button>
      );
    }
     
    
    let previewImage;
    if (videoId !== null) {
      previewImage = (
        <Input label="Preview Image">
          <img className="img-responsive" src={ videoId === null ? undefined : `//img.youtube.com/vi/${videoId}/hqdefault.jpg` } />
        </Input>
      );
    }
        
    return (
      <form onSubmit={handleSubmit(vals => this.props.setYouTubeVideoSelection(vals.youTubeUrl))}>
        <Input {...youTubeUrl} type="text" label="YouTube URL" buttonAfter={buttonAfter} disabled={videoId !== null}
               placeholder="Enter the URL for the video on YouTube (i.e. http://www.youtube.com/watch?v=XXXXXXXX)" />
        {previewImage}
      </form>
    );
  }
}

// Prop Validation
AddYouTubeVideo.propTypes = {
  videoId: PropTypes.string,
  
  // From redux form
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  
  // Actions
  setYouTubeVideoSelection: PropTypes.func.isRequired,
  clearYouTubeVideoSelection: PropTypes.func.isRequired
};

// Custom validator for checking if a value is a valid YouTube video URL
validate.validators.youTubeVideoUrl = function(value, options) {
  if (!value) return;
  
  const isValid = isUndefined(parseYouTubeVideoId(value)) === false;
  if (isValid) { 
    return;
  }
  return isUndefined(options.message) 
    ? 'is not a valid YouTube video URL' 
    : options.message;
};

// Validation constraints
const constraints = {
  youTubeUrl: {
    presence: { message: '^YouTube URL can\'t be blank' },
    youTubeVideoUrl: { message: '^YouTube URL is not a valid YouTube video URL' }
  }
};

// Map redux state to component props
function mapStateToProps(state) {
  const { addVideo: { youTube } } = state;
  return {
    ...youTube
  };
}

// Connect to redux with redux-form
export default reduxForm({
  form: 'addYouTubeVideo',
  fields: [ 'youTubeUrl' ],
  validate(vals) {
    return validate(vals, constraints) || {};
  }
}, mapStateToProps, { setYouTubeVideoSelection, clearYouTubeVideoSelection })(AddYouTubeVideo);