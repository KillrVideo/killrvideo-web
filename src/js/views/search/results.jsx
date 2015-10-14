import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class SearchResults extends Component {
  render() {
    return (
      <div>
        Search Results
      </div>
    );
  }
}

function mapStateToProps(state) {
  // TODO: Select the pieces of state we need in props
  {}
}

export default connect(mapStateToProps)(SearchResults);