import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// Component for the site's footer
class Footer extends Component {
  render() {
    let sampleData;
    if (this.props.dev) {
      sampleData = <li><Link to="/sampledata">Add Sample Data</Link></li>
    }
    
    return (
      <footer className="small">
        <div className="container">
          <ul className="list-inline pull-left">
            {sampleData}
          </ul>
          <div className="pull-right">
            &copy; {new Date().getFullYear()} - KillrVideo
          </div>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  dev: PropTypes.bool
};

export default Footer;