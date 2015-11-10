import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Header from './header';
import Footer from './footer';

class Layout extends Component {
  render() {
    const { loggedIn, loggedInUser, showWhatIsThis, toggleWhatIsThis } = this.props; 
    return (
      <div>
        <Header />
        <div id="body-wrapper">
          <div id="body-content" className="container">
            {this.props.children}
          </div>
          <div id="push-footer"></div>
        </div>
        <Footer />
      </div>
    );
  }
}

function mapStateToProps(state) {
  // TODO: Select the pieces of state we need in props
  return {
  };
}

export default connect(mapStateToProps)(Layout);