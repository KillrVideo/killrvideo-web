import React, { Component, PropTypes } from 'react';
import Header from './header';
import Footer from './footer';

class Layout extends Component {
  render() {
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

export default Layout;