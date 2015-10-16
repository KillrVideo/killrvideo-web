import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import Icon from 'components/shared/icon';
import { range } from 'lodash';
import VideoPreview from './video-preview';
import { getVideos, nextPage, previousPage } from 'actions/video-preview-list';

class VideoPreviewList extends Component {
  componentDidMount() {
    this.props.getVideos(this.props.list, VideoPreviewList.queries.videos);
  }
  
  nextPage() {
    this.props.nextPage(this.props.list);
  }
  
  previousPage() {
    this.props.previousPage(this.props.list);
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
    
    return <h3 className="section-divider"><span>{this.props.title}</span></h3>
  }
  
  getVideoPreview(idx) {
    const video = this.props.videos[idx];
    if (!video) {
      return (<li key={idx}></li>);
    }
        
    return (
      <li className="popout-on-hover" key={video.videoId}>
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
      <li className="hidden-xs" key={video.videoId}>
        <VideoPreview video={video} />
        {/* Overlay for hover that allows navigation to next page */}
        <div className="video-preview-list-nextpageoverlay" onClick={e => this.nextPage()}>
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
          <ul className="list-unstyled">
            {range(0, 4).map(idx => this.getVideoPreview(idx))}
            {this.getFirstVideoOfNextPage()}
          </ul>
          <div className="video-preview-list-nav">
            <Button bsStyle="primary" title="Next Page" disabled={this.props.nextPageDisabled} onClick={() => this.nextPage()}>
              <Icon name="caret-down" size="lg" className="visible-xs-inline" />
              <Icon name="caret-right" size="lg" className="hidden-xs" />
            </Button>
            <Button bsStyle="default" title="Previous Page" disabled={this.props.previousPageDisabled} onClick={() => this.previousPage()}>
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
  // Queries for getting page of videos
  videos(videosRoot, startIndex) {
    let prefixPaths = [ videosRoot, { from: startIndex, length: 5 } ];
    return [
      [ ...prefixPaths, [ 'videoId' ] ],
      ...VideoPreview.queries.video(prefixPaths)
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
  getVideos: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  previousPage: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  // Grab the public state for the specified list and pass as props
  const { videoPreviewLists: { [ownProps.list]: listState } } = state;
  return {
    ...listState
  };
}

export default connect(mapStateToProps, { getVideos, nextPage, previousPage })(VideoPreviewList);