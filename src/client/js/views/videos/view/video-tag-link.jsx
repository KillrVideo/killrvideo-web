import React, { Component, PropTypes } from 'react';
import { Label, OverlayTrigger, Popover, Button } from 'react-bootstrap';
import Icon from 'components/shared/icon';

class VideoTagLink extends Component {
  gotoSearch() {
    this.props.push({
      pathname: '/search/results',
      query: { q: this.props.tag }
    });
  }
  
  gotoChat() {
    this.props.push({
      pathname: '/chat', 
      query: { room: this.props.tag }
    });
  }
  
  render() {
    const { tag, chatEnabled } = this.props;
    
    return (
      <Button onClick={() => this.gotoSearch()} bsSize="small" title={`Search for '${tag}' videos`}>
        {tag}
      </Button>
    );
  }
}

// Prop validation
VideoTagLink.propTypes = {
  tag: PropTypes.string.isRequired,
  push: PropTypes.func.isRequired,
  chatEnabled: PropTypes.bool.isRequired
};

export default VideoTagLink;