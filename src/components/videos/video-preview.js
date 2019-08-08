import React from 'react';
import moment from 'moment';

import ViewVideoLink from './view-video-link';

// Component for rendering a video preview
class VideoPreview extends React.Component {
  render() {
    const v = this.props.preview;
    const previewImageLocation = v.previewImageLocation
      ? v.previewImageLocation
      : '/src/public/images/upload-preview.png';
      
    const imageStyle = { backgroundImage: `url("${previewImageLocation}")` };
    return (
      <ViewVideoLink videoId={v.videoId} className="video-preview">
        <div className="video-preview-image" style={imageStyle}></div>

        <div className="video-preview-info">
          <h6>{v.name}</h6>
    
          <div>
            by {v.author.firstName} {v.author.lastName}
          </div>
          <div>
            { v.stats.views } views <strong>&#8226;</strong> {moment(v.addedDate).fromNow()}
          </div>
        </div>

        <div className="clearfix visible-xs-block"></div>
      </ViewVideoLink>
    );
  }
}

// Static query definitions
VideoPreview.queries = {
  preview() {
    // recentVideos[0..4]['name', 'addedDate', ...]
    let details = [ [ 'videoId', 'name', 'previewImageLocation', 'addedDate' ] ];
    // recentVideos[0..4].stats.views
    let views = [ 'stats', 'views' ];
    // recentVideos[0..4].author['firstName', 'lastName']
    let author = [ 'author', [ 'firstName', 'lastName' ] ];
    return [
      details,
      views,
      author
    ];
  }
};

export default VideoPreview;