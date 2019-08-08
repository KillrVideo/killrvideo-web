import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { range, isUndefined } from 'lodash';
import classNames from 'classnames';

import Icon from '../shared/icon';
import VideoPreview from './video-preview';

// Styles needed by the component
import '../../css/video-preview-list.css';

class VideoPreviewList extends React.Component {
  componentDidMount() {
    // Get the initial previews once mounted
    // this.props.load(VideoPreviewList.queries.preview());
  }
  
  componentWillUnmount() {
      // Tell the app we're going to unload
      // this.props.unload();
    }
  
  render() {
      var data = this.props.data === undefined ? {} : this.props.data;
      var pagingConfig = this.props.pagingConfig === undefined ? {recordsPerPage:0} : this.props.pagingConfig;
;
    if (0 >= data.length) {
      console.log("empty")
      console.log(data)
    }
    const [ titleFirstWord, ...restOfTitle ] = this.props.title.split(' ');

    const loadingClasses = classNames({
      'video-preview-list-loading': true,
      // 'overlay': this.props.data.length > 0,
      'hidden': !this.props.isLoading
    });

    return (
      <div>
        <h3 className="section-divider">
          <span>
            <em>
                {titleFirstWord}
            </em>
              {restOfTitle ? restOfTitle.join(' ') : undefined}
          </span>
        </h3>
        <div className={0 >= data.length && !this.props.isLoading ? "blink" : ""}>
          <div className="video-preview-list">
              {0 >= data.length && !this.props.isLoading ?
                  //If there are no videos then display msg
                <div className="fade-in">
                  <h4>
                    <span >
                      These aren't the videos you are looking for
                    </span>
                  </h4>
                </div>
              :
                <div className={loadingClasses}>
                  <h4>
                    <Icon name="spinner" animate="spin" />
                    Loading...
                  </h4>
                </div>
              }

            <ul className="list-unstyled">
                {range(0, pagingConfig.recordsPerPage).map(idx => {
                    // Get the index in the preview collection adjusting for the current page start index


                    const previewIdx = this.props.currentPageIndex + idx;
                    if (previewIdx >= this.props.data.length) {
                        if (idx < pagingConfig.incrementIndexPerPage) {
                            return <li key={idx}></li>;
                        } else {
                            return;   // Don't output anything for first video of next page if not available
                        }
                    }


                    const preview = this.props.data[previewIdx];
                    if (idx < pagingConfig.incrementIndexPerPage) {
                        // Regular video previews
                        return (
                            <li className="popout-on-hover" key={preview.videoId}>
                              <VideoPreview preview={preview}/>
                                {/* Shim for holding the width of the li when the video preview is "popped out" on hover in larger viewports */ }
                              <div className="hidden-xs video-preview-shim"></div>
                            </li>
                        );
                    } else {
                        // First video preview of the next page
                        return (
                            <li className="hidden-xs" key={preview.videoId}>
                              <VideoPreview preview={preview} onClick={() => {
                              }}/>
                                 Overlay for hover that allows navigation to next page
                              <div className="video-preview-list-nextpageoverlay"
                                   onClick={() => this.props.nextPageClick(VideoPreviewList.queries.preview())}>
                                <Icon name="chevron-circle-right" size="4x"/>
                              </div>
                            </li>
                        );
                    }

                })}
              </ul>
            <div className="video-preview-list-nav">
              <Button bsStyle="primary" title="Next Page" disabled={this.props.nextPageDisabled} onClick={() => this.propsnextPageClick(VideoPreviewList.queries.preview())}>
                <Icon name="caret-down" size="lg" className="visible-xs-inline" />
                <Icon name="caret-right" size="lg" className="hidden-xs" />
              </Button>
              <Button bsStyle="default" title="Previous Page" disabled={this.props.previousPageDisabled} onClick={this.props.previousPageClick}>
                <Icon name="caret-up" size="lg" className="visible-xs-inline" />
                <Icon name="caret-left" size="lg" className="hidden-xs" />
              </Button>
            </div>
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

export default VideoPreviewList;