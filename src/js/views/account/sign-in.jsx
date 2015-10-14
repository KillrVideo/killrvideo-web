import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class SignIn extends Component {
  render() {
    return (
      <div>
        Sign In
      </div>
    );
  }
}

function mapStateToProps(state) {
  // TODO: Select the pieces of state we need in props
  {}
}

export default connect(mapStateToProps)(SignIn);