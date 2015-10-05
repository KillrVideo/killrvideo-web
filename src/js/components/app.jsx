const React = require('react');

const Header = require('./layout/header');
const Footer = require('./layout/footer');

class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <div id="body-wrapper">
          <div id="body-content" className="container">
          </div>
          <div id="push-footer"></div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;