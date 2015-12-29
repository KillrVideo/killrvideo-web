import React, { Component, PropTypes } from 'react';

import Input from 'components/shared/input';

// Inputs needed to add a new uploaded video
class AddUploadedVideo extends Component {
  render() {
    return <div></div>;
  }
}

// Prop validation
AddUploadedVideo.propTypes = {
  fields: PropTypes.object.isRequired
};

// Export component
export default AddUploadedVideo;