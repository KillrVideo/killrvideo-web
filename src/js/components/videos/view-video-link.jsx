import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// Component that ouputs a link to view a video
class ViewVideoLink extends Component {
  render() {
    const { children, to, ...others } = this.props;
    const videoUrl = `/view/${this.props.videoId}`;
    return <Link to={videoUrl} {...others}>{children}</Link>;
  }
}

// Prop validation
ViewVideoLink.propTypes = {
  videoId: PropTypes.string.isRequired
};

export default ViewVideoLink;