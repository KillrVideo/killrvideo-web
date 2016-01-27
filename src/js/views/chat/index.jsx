import { connect } from 'react-redux';

import React, { Component, PropTypes } from 'react';

// Main chat UI
class Chat extends Component {
  render() {
    return <div>Chat UI!</div>;
  }
}

// Prop validation
Chat.propTypes = {
  
};

// Map redux state to props
function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps, {})(Chat);