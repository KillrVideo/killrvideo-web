import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';

import { setYouTubeVideoSelection, clearYouTubeVideoSelection } from 'actions/add-youtube-video';

import { Button } from 'react-bootstrap';
import Input from 'components/shared/input';
import Icon from 'components/shared/icon';

// Inputs needed for adding a YouTube video
class AddYouTubeVideo extends Component {
  clearYouTubeVideo() {
    // Dispatch the action and clear the form
    this.props.clearYouTubeVideoSelection();
    this.props.resetForm();
  }
    
  render() {
    const {
      fields: { youTubeUrl },
      youTubeVideoId,
      setSelectionInProgress
    } = this.props;
    
    const hasYouTubeVideoId = !!youTubeVideoId;
    
    let buttonAfter, previewImage;
    if (!hasYouTubeVideoId) {
      buttonAfter = (
        <Button key="set" type="button" onClick={() => this.props.setYouTubeVideoSelection()} disabled={setSelectionInProgress || youTubeUrl.invalid}>
          <Icon name="cog" animate="spin" className={setSelectionInProgress ? undefined : 'hidden'} /> Get it
        </Button>
      );
    } else {
      buttonAfter = (
        <Button key="clear" type="button" onClick={() => this.clearYouTubeVideo()}>
          <Icon name="close" />
        </Button>
      );
      
      previewImage = (
        <Input label="Preview Image">
          <img className="img-responsive" src={`//img.youtube.com/vi/${youTubeVideoId}/hqdefault.jpg`} />
        </Input>
      );
    }
    
    return (
      <div>
        <Input {...youTubeUrl} type="text" label="YouTube URL" buttonAfter={buttonAfter} disabled={hasYouTubeVideoId}
               placeholder="Enter the URL for the video on YouTube (i.e. http://www.youtube.com/watch?v=XXXXXXXX)" />
        {previewImage}
      </div>
    );
  }
}

// Prop Validation
AddYouTubeVideo.propTypes = {
  // Redux-form values from parent
  fields: PropTypes.object.isRequired,
  resetForm: PropTypes.func.isRequired,
  
  // Source specific fields
  youTubeVideoId: PropTypes.string,
  setSelectionInProgress: PropTypes.bool.isRequired
};

// Map redux state to component props
function mapStateToProps(state) {
  const { addVideo: { sourceSpecific: {  youTubeVideoId, setSelectionInProgress } } } = state;
  return {
    youTubeVideoId,
    setSelectionInProgress
  };
}

// Export the component
export default connect(mapStateToProps, { setYouTubeVideoSelection, clearYouTubeVideoSelection })(AddYouTubeVideo);