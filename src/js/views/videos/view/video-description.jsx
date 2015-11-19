import React, { Component, PropTypes } from 'react';
import getSize from 'get-size';

const AnimationStates = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETE: 'COMPLETE'
};

// Component for displaying the video description that makes it possible to expand/collapse the description text
class VideoDescription extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      expanded: false,
      animation: AnimationStates.COMPLETE
    };
    
    // Store outside state because we don't want changes to affect rendering
    this._descriptionSize = 0;
  }
  
  componentWillReceiveProps(nextProps) {
    // If the video description changes, go back to collapsed state
    if (this.props.video.description !== nextProps.video.description) {
      this.setState({ expanded: false, animation: AnimationStates.COMPLETE });
    }
  }
  
  componentDidMount() {
    // Listen for animation transition ending and update state
    this._transitionEnd = e => {
      this.setState({ animation: AnimationStates.COMPLETE });
      this.refs.wrapper.removeEventListener('transitionend', this._transitionEnd);
    };
  }
    
  componentDidUpdate() {
    if (this.state.animation === AnimationStates.QUEUED) {
      this.refs.wrapper.addEventListener('transitionend', this._transitionEnd);
      setTimeout(() => this.setState({ animation: AnimationStates.RUNNING }), 0);
    }
  }
      
  toggleExpanded() {
    // Recalculate description size if we're about to animate
    this._descriptionSize = getSize(this.refs.description).outerHeight;
    this.setState({ expanded: !this.state.expanded, animation: AnimationStates.QUEUED });
  }
  
  render() {
    let wrapperStyle, wrapperClass;
    switch(this.state.animation) {
      case AnimationStates.QUEUED:
        // Add the starting size for the wrapper if an animation is about to run
        wrapperStyle = { height: this.state.expanded ? '2.5em' : `${this._descriptionSize}px` };
        wrapperClass = 'animate';
        break;
      case AnimationStates.RUNNING:
        // Add the target size for the wrapper if an animation is running
        wrapperStyle = { height: this.state.expanded ? `${this._descriptionSize}px` : '2.5em' };
        wrapperClass = 'animate';
        break;
      case AnimationStates.COMPLETE:
        // Leave the target size in place if not expanded, otherwise just let it be auto height
        if (this.state.expanded === false) {
          wrapperStyle = { height: '2.5em' };
        }
        break;
    }
    
    return (
      <div id="view-video-description">
        <div id="view-video-description-wrapper" ref="wrapper" style={wrapperStyle} className={wrapperClass}>
          <p ref="description">{this.props.video.description}</p>
        </div>
        <div id="view-video-description-button">
          <a onClick={e => this.toggleExpanded()}>Show {this.state.expanded ? 'Less' : 'More'}</a>
        </div>
      </div>
    );
  }
}

// Falcor queries
VideoDescription.queries = {
  video() {
    return [
      [ ['description'] ]
    ];
  }
};

// Prop validation
VideoDescription.propTypes = {
  video: PropTypes.object.isRequired
};

export default VideoDescription;