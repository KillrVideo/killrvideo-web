import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import Icon from 'components/shared/icon';
import { range } from 'lodash';

import VideoPreview from './video-preview';

class VideoPreviewList extends Component {
  getTitle() {
    if (!this.props.title) {
      return;
    }
    
    const idx = this.props.title.indexOf(' ');
    if (idx > 0) {
      return (
        <h3 className="section-divider">
          <span><em>{this.props.title.substring(0, idx)}</em>{this.props.title.substring(idx)}</span>
        </h3>
      );
    }
    
    return <h3 className="section-divider"><span>{this.props.title}</span></h3>
  }
  
  getVideoPreview(idx) {
    if (idx >= this.props.videos.length) {
      return <li></li>;
    }
    
    const video = this.props.videos[idx];
    return (
      <li className="popout-on-hover">
        <VideoPreview video={video} />
        {/* Shim for holding the width of the li when the video preview is "popped out" on hover in larger viewports */ }
        <div className="hidden-xs video-preview-shim"></div>
      </li>
    );
  }
  
  getFirstVideoOfNextPage() {
    if (this.props.videos.length < 5) return;
    
    const video = this.props.videos[4];
    return (
      <li className="hidden-xs">
        <VideoPreview video={video} />
        {/* Overlay for hover that allows navigation to next page */}
        <div className="video-preview-list-nextpageoverlay" onClick={e => this.pageClick(e)}>
          <Icon name="chevron-cirle-right" size="4x" />
        </div>
      </li>
    );
  }
  
  pageClick(e) {
    console.log('Page click!');
  }
  
  render() {
    return (
      <div>
        {this.getTitle()}
        <div className="video-preview-list">
          <ul className="list-unstyled">
            {range(0, 4).map(idx => this.getVideoPreview(idx))}
            {this.getFirstVideoOfNextPage()}
          </ul>
          <div className="video-preview-list-nav">
            <Button bsStyle="primary" title="Next Page" onClick={e => this.pageClick(e)}>
              <Icon name="caret-down" size="lg" className="visible-xs-inline" />
              <Icon name="caret-right" size="lg" className="hidden-xs" />
            </Button>
            <Button bsStyle="default" title="Previous Page" onClick={e => this.pageClick(e)}>
              <Icon name="caret-up" size="lg" className="visible-xs-inline" />
              <Icon name="caret-left" size="lg" className="hidden-xs" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// Prop validation
VideoPreviewList.propTypes = {
  title: PropTypes.string,
  videos: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default VideoPreviewList;