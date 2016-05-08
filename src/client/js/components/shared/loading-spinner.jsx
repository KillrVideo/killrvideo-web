import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import Icon from './icon';

class LoadingSpinner extends Component {
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

LoadingSpinner.propTypes = {
  hidden: PropTypes.bool
};

export default LoadingSpinner;