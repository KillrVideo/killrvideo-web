import React from 'react';
import classNames from 'classnames';

import Icon from './icon';

class LoadingSpinner extends React.Component {
  render() {
    const classes = classNames({
      'hidden': !!this.props.hidden
    }, this.props.className);
    
    return (
      <div className={classes}>
        <h4><Icon name="spinner" animate="spin" /> Loading...</h4>
      </div>
    );
  }
}

export default LoadingSpinner;