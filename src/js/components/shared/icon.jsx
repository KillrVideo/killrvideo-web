import React, { Component, PropTypes } from 'react';

// Create component for displaying Font Awesome icons
class Icon extends Component {
  render() {
    let fontAwesomeClass = 'fa fa-' + this.props.icon; 
    return (
      <i className={fontAwesomeClass}></i>
    );
  }
}

Icon.propTypes = {
  icon: PropTypes.string.isRequired
};

export default Icon;