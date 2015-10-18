import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class ViewVideo extends Component {
  render() {
    return (
      <div>
        A video!
      </div>
    );
  }
}

function mapStateToProps(state) {
  // TODO: Select the pieces of state we need in props
  return {};
}

export default connect(mapStateToProps)(ViewVideo);