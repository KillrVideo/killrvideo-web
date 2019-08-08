import React from 'react';
import { Link } from 'react-router';

// Component that ouputs a link to view a video
class ViewVideoLink extends React.Component {
  render() {
    const { children, to, ...others } = this.props;
    const videoUrl = `/view/${this.props.videoId}`;
    return <Link to={videoUrl} {...others}>{children}</Link>;
  }
}

export default ViewVideoLink;