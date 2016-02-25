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
    const { tag } = this.props;
    
    const popover = (
      <Popover>
        <Button onClick={() => this.gotoSearch()} title={`Search for '${tag}' videos`}>
          <Icon name="search" fixedWidth />
        </Button>&nbsp;
        <Button onClick={() => this.gotoChat()} title={`Chat about '${tag}' videos`}>
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
  push: PropTypes.func.isRequired
};

export default VideoTagLink;