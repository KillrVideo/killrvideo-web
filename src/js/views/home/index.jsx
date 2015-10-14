import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class Home extends Component {
  render() {
    return (
      <div>
        Welcome to KillrVideo!
      </div>
    );
  }
}

function mapStateToProps(state) {
  // TODO: Select the pieces of state we need in props
  return {};
}

export default connect(mapStateToProps)(Home);