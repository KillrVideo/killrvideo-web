import React, { Component, PropTypes } from 'react';
import moment from 'moment';

// Component for rendering a video preview
class VideoPreview extends Component {
  render() {
    const v = this.props.video;
    const imageStyle = { backgroundImage: `url(${v.previewImageLocation})` };
    return (
      <div className="video-preview" onClick={e => this.props.onClick()}>
        <div className="video-preview-image" style={imageStyle}>
        </div>

        <div className="video-preview-info">
          <h6>{v.name}</h6>
    
          <div>
            by {v.author.firstName} {v.author.lastName}
          </div>
          <div>
            { 100 /* TODO: views*/ } views <strong>&#8226;</strong> {moment(v.addedDate).fromNow()}
          </div>
        </div>

        <div className="clearfix visible-xs-block"></div>
      </div>
    );
  }
}

// Static query definitions
VideoPreview.queries = {
  video(prefixPaths) {
    // recentVideos[0..4]['name', 'addedDate', ...]
    let details = [ ...prefixPaths, [ 'name', 'previewImageLocation', 'addedDate' ] ];
    // recentVideos[0..4]['author']['firstName', 'lastName']
    let author = [ ...prefixPaths, 'author', [ 'firstName', 'lastName' ] ];
    return [
      details,
      author
    ];
  }
};

// Prop validation
VideoPreview.propTypes = {
  video: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
};

export default VideoPreview;