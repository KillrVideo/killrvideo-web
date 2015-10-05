const React = require('react');
const url = require('url');

// Create component for displaying images with correct path
class Image extends React.Component {
  getSrc(src) {
    return url.resolve('/static/images/', src);
  }
  
  render() {
    return (
      <img src={ this.getSrc(this.props.src) } alt={ this.props.alt } />
    );
  }
}

// Export image component
export default Image;