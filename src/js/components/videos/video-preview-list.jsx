import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { range, isUndefined } from 'lodash';
import classNames from 'classnames';

import Icon from 'components/shared/icon';
import VideoPreview from './video-preview';
import { load, unload, getPreviews, nextPageClick, previousPageClick } from 'actions/video-previews';
import { pushState } from 'redux-router';

class VideoPreviewList extends Component {
  componentWillMount() {
    // Tell the app we're going to load
    this.props.load(this.props.list.id, this.props.list.previewsQueryRoot);
  }
  
  componentDidMount() {
    // Get the initial previews once mounted
    this.props.getPreviews(this.props.list.id, VideoPreviewList.queries.preview());
  }
  
  componentWillUnmount() {
    // Tell the app we're going to unload
    this.props.unload(this.props.list.id);
  }
    
  componentDidUpdate(prevProps) {
    // If the list changed, we need to get the initial previews again
    if (this.props.list.id !== prevProps.list.id) {
      this.props.unload(prevProps.list.id);
      this.props.load(this.props.list.id, this.props.list.previewsQueryRoot);
      this.props.getPreviews(this.props.list.id, VideoPreviewList.queries.preview());
    }
  }
  
  goToVideo(videoId) {
    this.props.pushState(null, `/view/${videoId}`);
  }
  
  nextPage() {
    this.props.nextPageClick(this.props.list.id, VideoPreviewList.queries.preview());
  }
  
  previousPage() {
    this.props.previousPageClick(this.props.list.id);
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
  
  render() {
    const { title, isLoading, previews, currentPageIndex } = this.props;
    
    // On initial render, state from redux will be undefined so just wait to render
    if (isUndefined(previews)) return null;

    const [ titleFirstWord, ...restOfTitle ] = title.split(' ');
    
    const loadingClasses = classNames({
      'video-preview-list-loading': true,
      'overlay': previews.length > 0,
      'hidden': !isLoading
    });
    
    const previousPageDisabled = currentPageIndex === 0;
    let nextPageDisabled = false;
    
    return (
      <div>
        <h3 className="section-divider">
          <span><em>{titleFirstWord}</em> {restOfTitle ? restOfTitle.join(' ') : undefined}</span>
        </h3>
        <div className="video-preview-list">
          <div className={loadingClasses}>
            <h4>
              <Icon name="spinner" animate="spin" /> Loading...
            </h4>
          </div>
          <ul className="list-unstyled">
            {range(0, 5).map(idx => {
              // Get the index in the preview collection adjusting for the current page start index
              const previewIdx = currentPageIndex + idx;
              if (previewIdx >= previews.length) {
                if (idx < 4) {
                  return <li key={idx}></li>;
                } else {
                  nextPageDisabled = true;
                  return;   // Don't output anything for first video of next page if not available
                }  
              }
              
              const preview = previews[previewIdx];
              if (idx < 4) {
                // Regular video previews
                return (
                  <li className="popout-on-hover" key={preview.videoId}>
                    <VideoPreview preview={preview} onClick={e => this.goToVideo(preview.videoId)} />
                    {/* Shim for holding the width of the li when the video preview is "popped out" on hover in larger viewports */ }
                    <div className="hidden-xs video-preview-shim"></div>
                  </li>
                );
              } else {
                // First video preview of the next page
                return (
                  <li className="hidden-xs" key={preview.videoId}>
                    <VideoPreview preview={preview} onClick={() => {}} />
                    {/* Overlay for hover that allows navigation to next page */}
                    <div className="video-preview-list-nextpageoverlay" onClick={() => this.nextPage()}>
                      <Icon name="chevron-circle-right" size="4x" />
                    </div>
                  </li>
                );
              }
              
            })}
          </ul>
          <div className="video-preview-list-nav">
            <Button bsStyle="primary" title="Next Page" disabled={nextPageDisabled} onClick={() => this.nextPage()}>
              <Icon name="caret-down" size="lg" className="visible-xs-inline" />
              <Icon name="caret-right" size="lg" className="hidden-xs" />
            </Button>
            <Button bsStyle="default" title="Previous Page" disabled={previousPageDisabled} onClick={() => this.previousPage()}>
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
  preview() {
    return [
      [ [ 'videoId' ] ],
      ...VideoPreview.queries.preview()
    ]
  }
};

// Prop validation
VideoPreviewList.propTypes = {
  // Properties passed in
  title: PropTypes.string.isRequired,
  list: PropTypes.object.isRequired,
  
  // Properties from redux store
  isLoading: PropTypes.bool,
  previews: PropTypes.arrayOf(PropTypes.object),
  currentPageIndex: PropTypes.number,
  
  // Actions
  load: PropTypes.func.isRequired,
  unload: PropTypes.func.isRequired,
  getPreviews: PropTypes.func.isRequired,
  nextPageClick: PropTypes.func.isRequired,
  previousPageClick: PropTypes.func.isRequired,
  pushState: PropTypes.func.isRequired
};

/**
 * The available preview lists
 */
VideoPreviewList.lists = {
  /**
   * Videos recently added to the site.
   */
  recentVideos: { id: 'recentVideos', previewsQueryRoot: [ 'recentVideos' ] },
  
  /**
   * Videos added to the site by the currently logged in user.
   */
  myVideos: { id: 'myVideos', previewsQueryRoot: [ 'currentUser', 'myVideos' ] },
  
  /**
   * Personalized suggestions for the currently logged in user.
   */
  suggestedVideos: { id: 'suggestedVideos', previewsQueryRoot: [ 'currentUser', 'suggestedVideos' ] },
  
  /**
   * Videos related/similar to the video Id specified.
   */
  relatedVideos(videoId) {
    return { id: `relatedTo_${videoId}`, previewsQueryRoot: [ 'videosById', videoId, 'relatedVideos' ] };
  }
};

function mapStateToProps(state, ownProps) {
  // Grab the public state for the specified list and pass as props
  const { videoPreviews: { lists: { [ ownProps.list.id ]: listState } } } = state;
  return {
    ...listState
  };
}

export default connect(mapStateToProps, { load, unload, getPreviews, nextPageClick, previousPageClick, pushState })(VideoPreviewList);