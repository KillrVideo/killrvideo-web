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
    
    const popover = (
      <Popover id="view-video-tags-popover">
        <Button onClick={() => this.gotoSearch()} title={`Search for '${tag}' videos`}>
          <Icon name="search" fixedWidth />
        </Button>
        <Button onClick={() => this.gotoChat()} title={`Chat about '${tag}' videos`} className={chatEnabled ? undefined : 'hidden'}>
          <Icon name="comment" fixedWidth />
        </Button>
      </Popover>
    );
    
    return (
      <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={popover}>
        <Label bsStyle="default">{tag}</Label>
      </OverlayTrigger>
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