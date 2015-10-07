const React = require('react');

const Header = require('./header');
const Footer = require('./footer');

class Layout extends React.Component {
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