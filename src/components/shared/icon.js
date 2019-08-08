import React from 'react';
import classNames from 'classnames';

// Create component for displaying Font Awesome icons
class Icon extends React.Component {
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

export default Icon;