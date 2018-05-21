import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { range, isUndefined } from 'lodash';
import classNames from 'classnames';

import Icon from 'components/shared/icon';
import VideoPreview from './video-preview';

// Styles needed by the component
require('video-preview-list.css');

class VideoPreviewList extends Component {
  componentDidMount() {
    // Get the initial previews once mounted
    this.props.load(VideoPreviewList.queries.preview());
  }
  
  componentWillUnmount() {
    // Tell the app we're going to unload
    this.props.unload();
  }
  
  render() {
    const { 
      title, isLoading, data, currentPageIndex, moreDataOnServer, pagingConfig, nextPageDisabled, previousPageDisabled,
      nextPageClick, previousPageClick
    } = this.props;

    if (0 >= data.length) {
      console.log("empty")
      console.log(data)
    }
    const [ titleFirstWord, ...restOfTitle ] = title.split(' ');
    
    const loadingClasses = classNames({
      'video-preview-list-loading': true,
      'overlay': data.length > 0,
      'hidden': !isLoading
    });
    
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
            {0 >= data.length ?
              <li><h4><span class="label label-default">No Videos Here Yet. </span></h4></li>
            :
              range(0, pagingConfig.recordsPerPage).map(idx => {
                // Get the index in the preview collection adjusting for the current page start index
                const previewIdx = currentPageIndex + idx;
                if (previewIdx >= data.length) {
                  if (idx < pagingConfig.incrementIndexPerPage) {
                    return <li key={idx}></li>;
                  } else {
                    return;   // Don't output anything for first video of next page if not available
                  }
                }
                
                const preview = data[previewIdx];
                if (idx < pagingConfig.incrementIndexPerPage) {
                  // Regular video previews
                  return (
                    <li className="popout-on-hover" key={preview.videoId}>
                      <VideoPreview preview={preview} />
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
                      <div className="video-preview-list-nextpageoverlay" onClick={() => nextPageClick(VideoPreviewList.queries.preview())}>
                        <Icon name="chevron-circle-right" size="4x" />
                      </div>
                    </li>
                  );
                }
                
              })
            }
            </ul>



          <div className="video-preview-list-nav">
            <Button bsStyle="primary" title="Next Page" disabled={nextPageDisabled} onClick={() => nextPageClick(VideoPreviewList.queries.preview())}>
              <Icon name="caret-down" size="lg" className="visible-xs-inline" />
              <Icon name="caret-right" size="lg" className="hidden-xs" />
            </Button>
            <Button bsStyle="default" title="Previous Page" disabled={previousPageDisabled} onClick={previousPageClick}>
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
  title: PropTypes.string.isRequired,
  
  isLoading: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentPageIndex: PropTypes.number.isRequired,
  moreDataOnServer: PropTypes.bool.isRequired,
  pagingConfig: PropTypes.object.isRequired,
  nextPageDisabled: PropTypes.bool.isRequired,
  previousPageDisabled: PropTypes.bool.isRequired,
  
  // Actions
  load: PropTypes.func.isRequired,
  unload: PropTypes.func.isRequired,
  nextPageClick: PropTypes.func.isRequired,
  previousPageClick: PropTypes.func.isRequired
};

export default VideoPreviewList;