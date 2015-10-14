import React, { Component, PropTypes } from 'react';
import { resolve } from 'url';

// Create component for displaying images with correct path
class Image extends Component {
  getSrc(src) {
    return resolve('/static/images/', src);
  }
  
  render() {
    return (
      <img src={ this.getSrc(this.props.src) } alt={ this.props.alt } />
    );
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired
};

// Export image component
export default Image;