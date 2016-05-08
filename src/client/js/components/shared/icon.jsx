import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

// Create component for displaying Font Awesome icons
class Icon extends Component {
  render() {
    const { className, name, size, fixedWidth, list, border, pull, animate, rotate, flip, ...otherProps } = this.props;
    
    const fontAwesomeClass = classNames({
      'fa': true,
      [ `fa-${name}` ]: !!name,
      [ `fa-${size}` ]: !!size,
      'fa-fw': fixedWidth,
      'fa-li': list,
      'fa-border': border,
      [ `fa-pull-${pull}` ]: !!pull,
      [ `fa-${animate}` ]: !!animate,
      [ `fa-rotate-${rotate}` ]: !!rotate,
      [ `fa-flip-${flip}` ]: !!flip,
      [ className ]: !!className
    });
    return (
      <i {...otherProps} className={fontAwesomeClass}></i>
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