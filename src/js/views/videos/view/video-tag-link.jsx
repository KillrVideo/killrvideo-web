import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Label } from 'react-bootstrap';
import { stringify } from 'querystring';

class VideoTagLink extends Component {
  render() {
    const qs = stringify({ query: this.props.tag });
    const linkUrl = `/search/results?${qs}`;
    return (
      <Link to={linkUrl}>
        <Label bsStyle="default">{this.props.tag}</Label>
      </Link>
    );
  }
}

// Prop validation
VideoTagLink.propTypes = {
  tag: PropTypes.string.isRequired
};

export default VideoTagLink;