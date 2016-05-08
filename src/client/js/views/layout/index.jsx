import React, { Component, PropTypes } from 'react';
import Header from './header';
import Footer from './footer';
import classNames from 'classnames';

class Layout extends Component {
  render() {
    // Add a class to the body wrapper is specified on any of the matched routes
    const wrapperClass = classNames(...this.props.routes.map(r => r.wrapperClassName));
    
    return (
      <div>
        <Header />
        <div id="body-wrapper" className={wrapperClass}>
          {this.props.children}
          <div id="push-footer" className="hidden-xs"></div>
        </div>
        <Footer className="hidden-xs" />
      </div>
    );
  }
}

// Prop validation
Layout.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Layout;