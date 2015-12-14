import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

// Create component for displaying Font Awesome icons
class Icon extends Component {
    
  render() {
    let fontAwesomeClass = classNames({
      'fa': true,
      [ `fa-${this.props.name}` ]: !!this.props.name,
      [ `fa-${this.props.size}` ]: !!this.props.size,
      'fa-fw': this.props.fixedWidth,
      'fa-li': this.props.list,
      'fa-border': this.props.border,
      [ `fa-pull-${this.props.pull}` ]: !!this.props.pull,
      [ `fa-${this.props.animate}` ]: !!this.props.animate,
      [ `fa-rotate-${this.props.rotate}` ]: !!this.props.rotate,
      [ `fa-flip-${this.props.flip}` ]: !!this.props.flip,
      [ this.props.className ]: !!this.props.className
    }); 
    return (
      <i className={fontAwesomeClass}></i>
    );
  }
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['lg', '2x', '3x', '4x', '5x' ]),
  fixedWidth: PropTypes.bool,
  list: PropTypes.bool,
  border: PropTypes.bool,
  pull: PropTypes.oneOf(['left', 'right']),
  animate: PropTypes.oneOf(['spin', 'pulse']),
  rotate: PropTypes.oneOf([ 90, 180, 270 ]),
  flip: PropTypes.oneOf([ 'horizontal', 'vertical' ])
};

export default Icon;