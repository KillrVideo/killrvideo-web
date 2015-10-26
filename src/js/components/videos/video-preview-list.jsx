import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import Icon from 'components/shared/icon';
import { range } from 'lodash';
import classNames from 'classnames';
import VideoPreview from './video-preview';
import { load, unload, nextPageClick, previousPageClick, previewClick } from 'actions/video-preview-list';
import { pushState } from 'redux-router';

class VideoPreviewList extends Component {
  componentDidMount() {
    this.props.load(this.props.list, VideoPreviewList.queries.video());
  }
  
  componentWillUnmount() {
    this.props.unload(this.props.list);
  }
  
  goToVideo(videoId) {
    this.props.pushState(null, `/view/${videoId}`);
  }
    
  getTitle() {
    if (!this.props.title) {
      return;
    }
    
    // Highlight the first word in the title by wrapping with an em
    const idx = this.props.title.indexOf(' ');
    if (idx > 0) {
      return (
        <h3 className="section-divider">
          <span><em>{this.props.title.substring(0, idx)}</em>{this.props.title.substring(idx)}</span>
        </h3>
      );
    }
    
    return (<h3 className="section-divider"><span>{this.props.title}</span></h3>);
  }
  
  getLoading() {
    if (this.props.isLoading === false) return;
    
    const classes = classNames({
      'video-preview-list-loading': true,
      'overlay': this.props.videos.length > 0
    });
    
    return (
      <div className={classes}>
        <h4>
          <Icon name="spinner" animate="spin" /> Loading...
        </h4>
      </div>
    );
  }
  
  getVideoPreview(idx) {
    const video = this.props.videos[idx];
    if (!video) {
      return (<li key={idx}></li>);
    }
        
    return (
      <li className="popout-on-hover" key={video.videoId}>
        <VideoPreview video={video} onClick={e => this.goToVideo(video.videoId)} />
        {/* Shim for holding the width of the li when the video preview is "popped out" on hover in larger viewports */ }
        <div className="hidden-xs video-preview-shim"></div>
      </li>
    );
  }
  
  getFirstVideoOfNextPage() {
    if (this.props.videos.length < 5) return;
    
    const video = this.props.videos[4];
    return (
      <li className="hidden-xs" key={video.videoId}>
        <VideoPreview video={video} onClick={() => {}} />
        {/* Overlay for hover that allows navigation to next page */}
        <div className="video-preview-list-nextpageoverlay" onClick={() => this.props.nextPageClick(this.props.list)}>
          <Icon name="chevron-circle-right" size="4x" />
        </div>
      </li>
    );
  }
  
  render() {
    return (
      <div>
        {this.getTitle()}
        <div className="video-preview-list">
          {this.getLoading()}
          <ul className="list-unstyled">
            {range(0, 4).map(idx => this.getVideoPreview(idx))}
            {this.getFirstVideoOfNextPage()}
          </ul>
          <div className="video-preview-list-nav">
            <Button bsStyle="primary" title="Next Page" disabled={this.props.nextPageDisabled} onClick={() => this.props.nextPageClick(this.props.list)}>
              <Icon name="caret-down" size="lg" className="visible-xs-inline" />
              <Icon name="caret-right" size="lg" className="hidden-xs" />
            </Button>
            <Button bsStyle="default" title="Previous Page" disabled={this.props.previousPageDisabled} onClick={() => this.props.previousPageClick(this.props.list)}>
              <Icon name="caret-up" size="lg" className="visible-xs-inline" />
              <Icon name="caret-left" size="lg" className="hidden-xs" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// Static query definitions
VideoPreviewList.queries = {
  video() {
    return [
      [ [ 'videoId' ] ],
      ...VideoPreview.queries.video()
    ]
  }
};

// Prop validation
VideoPreviewList.propTypes = {
  // Properties passed in
  title: PropTypes.string,
  list: PropTypes.string.isRequired,
  
  // Properties from redux store
  isLoading: PropTypes.bool.isRequired,
  videos: PropTypes.arrayOf(PropTypes.object).isRequired,
  nextPageDisabled: PropTypes.bool.isRequired,
  previousPageDisabled: PropTypes.bool.isRequired,
  
  // Actions
  load: PropTypes.func.isRequired,
  unload: PropTypes.func.isRequired,
  nextPageClick: PropTypes.func.isRequired,
  previousPageClick: PropTypes.func.isRequired,
  pushState: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  // Grab the public state for the specified list and pass as props
  const { videoPreviewLists: { [ownProps.list]: listState } } = state;
  return {
    ...listState
  };
}

export default connect(mapStateToProps, { load, unload, nextPageClick, previousPageClick, pushState })(VideoPreviewList);